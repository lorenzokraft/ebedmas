import { Request, Response } from 'express';
import { pool } from '../db/database';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

interface Subscriber extends RowDataPacket {
  id: number;
  user_id: number;
  username: string;
  email: string;
  plan_id: number;
  plan_name: string;
  start_date: Date;
  end_date: Date;
  trial_end_date: Date;
  status: string;
  card_last_four: string;
  card_holder_name: string;
  auto_renew: boolean;
}

// Get all subscribers
const getSubscribers = async (req: Request, res: Response) => {
  try {
    const [subscribers] = await pool.query<Subscriber[]>(`
      SELECT 
        s.*,
        u.username,
        u.email,
        p.name as plan_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `);

    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

// Freeze/Unfreeze subscription
const toggleSubscriptionFreeze = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [subscription] = await pool.query<Subscriber[]>(
      'SELECT status FROM subscriptions WHERE id = ?',
      [id]
    );

    if (!subscription[0]) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const newStatus = subscription[0].status === 'frozen' ? 'active' : 'frozen';

    await pool.query(
      'UPDATE subscriptions SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({ message: 'Subscription status updated successfully' });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ message: 'Failed to update subscription status' });
  }
};

// Get default pricing
const getDefaultPricing = async (req: Request, res: Response) => {
  try {
    // Use a simple SELECT that works in both MySQL 8.3 and MariaDB 10.6
    const [result] = await pool.query(
      'SELECT value FROM subscription_settings WHERE name = ?',
      ['default_pricing']
    );

    if (!result || !result[0]) {
      return res.status(404).json({ error: 'Pricing settings not found' });
    }

    let pricing;
    try {
      // Handle both string and already-parsed JSON (MariaDB might return it differently)
      pricing = typeof result[0].value === 'string' 
        ? JSON.parse(result[0].value) 
        : result[0].value;
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON in database' });
    }

    // Ensure the pricing is an array
    if (!Array.isArray(pricing)) {
      return res.status(500).json({ error: 'Invalid pricing format in database' });
    }

    const formattedPricing = pricing.map((plan: any) => {
      // Helper function to parse price strings and convert to proper Naira values
      const parseNairaAmount = (value: any): number => {
        if (!value) return 0;
        const numValue = parseFloat(value.toString());
        // If the value is less than 1, it might be in decimal format (e.g., 0.05 for ₦5)
        return numValue < 1 ? Math.round(numValue * 100) : numValue;
      };

      return {
        ...plan,
        // Ensure all numeric fields are properly parsed
        monthlyPrice: parseInt(plan.monthlyPrice?.toString() || '0'),
        yearlyPrice: parseInt(plan.yearlyPrice?.toString() || '0'),
        yearlyDiscountPercentage: parseInt(plan.yearlyDiscountPercentage?.toString() || '0'),
        // Use parseNairaAmount for discount amounts to handle decimal values
        monthlyAdditionalChildDiscountAmount: parseNairaAmount(plan.monthlyAdditionalChildDiscountAmount),
        yearlyAdditionalChildDiscountAmount: parseNairaAmount(plan.yearlyAdditionalChildDiscountAmount),
        // Ensure subjects is always an array
        subjects: Array.isArray(plan.subjects) ? plan.subjects : []
      };
    });

    res.json(formattedPricing);
  } catch (error) {
    console.error('Error fetching default pricing:', error);
    res.status(500).json({ error: 'Failed to fetch default pricing' });
  }
};

// Update default pricing
const updateDefaultPricing = async (req: Request, res: Response) => {
  try {
    const pricingData = req.body;
    console.log('Received pricing data:', pricingData);
    
    // Validate the pricing data structure
    if (!Array.isArray(pricingData)) {
      console.log('Invalid data format - not an array:', pricingData);
      return res.status(400).json({ message: 'Invalid pricing data format. Expected an array.' });
    }

    // Validate each plan in the pricing data
    for (const plan of pricingData) {
      if (!plan.type || !plan.title || !plan.monthlyPrice || !plan.yearlyPrice) {
        console.log('Invalid plan data:', plan);
        return res.status(400).json({ 
          message: 'Each plan must have type, title, monthlyPrice, and yearlyPrice',
          invalidPlan: plan
        });
      }
    }

    // Update the settings in the database
    await pool.query(
      'UPDATE subscription_settings SET value = ? WHERE name = ?',
      [JSON.stringify(pricingData), 'default_pricing']
    );

    res.json({ 
      message: 'Default pricing updated successfully',
      updatedPricing: pricingData
    });
  } catch (error) {
    console.error('Error updating default pricing:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update additional child discount
const updateAdditionalChildDiscount = async (req: Request, res: Response) => {
  try {
    const { discountAmount } = req.body;
    
    if (typeof discountAmount !== 'number' || discountAmount < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid discount amount. Must be a positive number.' 
      });
    }

    // Get current pricing
    const [result] = await pool.query(
      'SELECT value FROM subscription_settings WHERE name = ?',
      ['default_pricing']
    );

    if (!result || !result[0]) {
      return res.status(404).json({
        success: false,
        message: 'Pricing settings not found'
      });
    }

    const currentPricing = JSON.parse(result[0].value);
    
    // Update the discount amount for each plan
    const updatedPricing = currentPricing.map((plan: any) => ({
      ...plan,
      monthlyAdditionalChildDiscountAmount: discountAmount,
      yearlyAdditionalChildDiscountAmount: discountAmount
    }));

    // Update the database - Using a simple UPDATE query that works in both MySQL 8 and MariaDB
    await pool.query(
      'UPDATE subscription_settings SET value = ? WHERE name = ?',
      [JSON.stringify(updatedPricing), 'default_pricing']
    );

    res.json({
      success: true,
      message: 'Additional child discount updated successfully',
      data: { discountAmount }
    });
  } catch (error) {
    console.error('Error updating additional child discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update additional child discount'
    });
  }
};

// Update pricing structure
const updatePricingStructure = async (req: Request, res: Response) => {
  try {
    const pricingCards = req.body;
    
    // Validate input
    if (!Array.isArray(pricingCards)) {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Format the pricing cards for JSON storage
      const formattedCards = pricingCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        subjects: Array.isArray(card.subjects) ? card.subjects : [],
        monthlyPrice: parseInt(card.monthlyPrice.toString()),
        yearlyPrice: parseInt(card.yearlyPrice.toString()),
        type: card.type,
        yearlyDiscountPercentage: parseInt(card.yearlyDiscountPercentage.toString()),
        monthlyAdditionalChildDiscountAmount: parseInt(card.monthlyAdditionalChildDiscountAmount.toString()),
        yearlyAdditionalChildDiscountAmount: parseInt(card.yearlyAdditionalChildDiscountAmount.toString())
      }));

      // Validate JSON string before updating
      const jsonString = JSON.stringify(formattedCards);
      JSON.parse(jsonString); // This will throw if invalid JSON

      // Use a parameterized query that works in both MySQL 8.3 and MariaDB 10.6
      const query = `
        UPDATE subscription_settings 
        SET value = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE name = 'default_pricing'
      `;

      await connection.query(query, [jsonString]);
      await connection.commit();
      res.json({ message: 'Pricing structure updated successfully' });
    } catch (error) {
      await connection.rollback();
      if (error instanceof SyntaxError) {
        res.status(400).json({ error: 'Invalid JSON format' });
      } else {
        throw error;
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating pricing structure:', error);
    res.status(500).json({ error: 'Failed to update pricing structure' });
  }
};

// Create a new subscription with trial
const createTrialSubscription = async (req: Request, res: Response) => {
  const { plan_type, email, username, reference, card_last_four, billing_cycle, children_count, selected_subject, amount_paid } = req.body;
  
  try {
    // First, check if user exists or create new user
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    let userId;
    if (existingUsers && existingUsers[0]) {
      userId = existingUsers[0].id;
    } else {
      // Create new user with a temporary password (they can reset it later)
      const tempPassword = Math.random().toString(36).slice(-8);
      const [newUser] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, tempPassword]
      );
      userId = newUser.insertId;
    }

    const trialDays = 7;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const [result] = await pool.query(
      `INSERT INTO subscriptions 
       (user_id, plan_type, billing_cycle, children_count, selected_subject, 
        amount_paid, payment_reference, status, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'trial', ?, ?)`,
      [userId, plan_type, billing_cycle, children_count, selected_subject, 
       amount_paid, reference, startDate, endDate]
    );

    // Update user's subscription status
    await pool.query(
      'UPDATE users SET isSubscribed = ? WHERE id = ?',
      [true, userId]
    );

    // Schedule the trial end check
    await scheduleTrialEndCheck(result.insertId, trialEndDate);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Trial subscription created successfully',
      trial_end_date: trialEndDate,
      user_id: userId,
      token: token // Ensure token is returned in trial creation response
    });
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    res.status(500).json({ 
      message: 'Failed to create trial subscription', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req: Request, res: Response) => {
  const { subscription_id } = req.params;
  
  try {
    await pool.query(
      'UPDATE subscriptions SET status = ?, auto_renew = false WHERE id = ?',
      ['cancelled', subscription_id]
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};

// Check if trial has ended and process payment
const checkTrialEnd = async (subscription_id: number) => {
  try {
    const [subscription] = await pool.query<Subscriber[]>(
      'SELECT * FROM subscriptions WHERE id = ? AND status = ?',
      [subscription_id, 'trial']
    );

    if (!subscription[0]) return;

    const trialEndDate = new Date(subscription[0].trial_end_date);
    if (new Date() >= trialEndDate && subscription[0].auto_renew) {
      // Trial has ended and subscription wasn't cancelled
      // Initiate Paystack charge using saved card
      // Update subscription status to 'active'
      await pool.query(
        'UPDATE subscriptions SET status = ? WHERE id = ?',
        ['active', subscription_id]
      );
    }
  } catch (error) {
    console.error('Error checking trial end:', error);
  }
};

// Helper function to schedule trial end check
const scheduleTrialEndCheck = async (subscription_id: number, trial_end_date: Date) => {
  const timeUntilTrialEnd = trial_end_date.getTime() - new Date().getTime();
  setTimeout(() => checkTrialEnd(subscription_id), timeUntilTrialEnd);
};

// Get user's receipts
const getReceipts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get subscription payments including trials and upcoming payments
    const [subscriptions] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.amount_paid as amount,
        s.created_at as date,
        s.card_last_four,
        s.payment_reference,
        s.billing_cycle,
        s.status,
        s.end_date,
        s.auto_renew,
        s.plan_type,
        s.selected_subject,
        u.username as user_name,
        u.email as user_email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ? 
      ORDER BY 
        CASE 
          WHEN s.status = 'upcoming' THEN 1
          WHEN s.status = 'trial' THEN 2
          ELSE 3
        END,
        s.created_at DESC
    `, [userId]);

    const receipts = subscriptions.map(sub => ({
      id: sub.id,
      date: sub.end_date || sub.date, // Use end_date for upcoming payments
      amount: Number(sub.amount), // Convert to number explicitly
      status: sub.status === 'trial' ? 'Trial' : 
             sub.status === 'upcoming' ? 'Upcoming' : 'Success',
      cardLastFour: sub.card_last_four || 'N/A',
      cardType: sub.card_last_four ? 'Card' : '',
      invoiceUrl: '#',
      receiptUrl: '#',
      planType: sub.plan_type || 'Standard Plan',
      subjects: sub.selected_subject || 'All Subjects',
      userName: sub.user_name,
      userEmail: sub.user_email
    }));

    res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
};

export {
  getSubscribers,
  toggleSubscriptionFreeze,
  getDefaultPricing,
  updateDefaultPricing,
  updateAdditionalChildDiscount,
  updatePricingStructure,
  createTrialSubscription,
  cancelSubscription,
  getReceipts
};