import { Request, Response } from 'express';
import pool from '../utils/db';
import { RowDataPacket } from 'mysql2';

interface Plan extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  features: string;
  is_active: boolean;
}

interface Subscriber extends RowDataPacket {
  id: number;
  user_id: number;
  username: string;
  email: string;
  plan_id: number;
  plan_name: string;
  start_date: Date;
  end_date: Date;
  status: string;
  card_last_four: string;
  card_holder_name: string;
  auto_renew: boolean;
}

// Get all subscription plans
const getPlans = async (req: Request, res: Response) => {
  try {
    const [plans] = await pool.query<Plan[]>(
      'SELECT * FROM subscription_plans ORDER BY price ASC'
    );
    
    const processedPlans = processPlansFeatures(plans);
    res.json(processedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
};

// Create new subscription plan
const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, description, price, duration, duration_unit, features } = req.body;
    
    // Log the incoming data
    console.log('Creating plan with data:', {
      name,
      description,
      price,
      duration,
      duration_unit,
      features
    });

    // Validate required fields
    if (!name || !description || !price || !duration || !duration_unit || !features) {
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { name, description, price, duration, duration_unit, features }
      });
    }

    // Process features
    const processedFeatures = Array.isArray(features) 
      ? features.join('\n')
      : typeof features === 'string'
        ? features
        : '';

    // Log processed features
    console.log('Processed features:', processedFeatures);

    const [result] = await pool.query(
      'INSERT INTO subscription_plans (name, description, price, duration, duration_unit, features, is_active) VALUES (?, ?, ?, ?, ?, ?, true)',
      [name, description, price, duration, duration_unit, processedFeatures]
    );

    res.status(201).json({ 
      message: 'Plan created successfully',
      plan: {
        name,
        description,
        price,
        duration,
        duration_unit,
        features: processedFeatures
      }
    });
  } catch (error) {
    console.error('Detailed error creating plan:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      message: 'Failed to create subscription plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update plan status
const updatePlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await pool.query(
      'UPDATE subscription_plans SET is_active = ? WHERE id = ?',
      [is_active, id]
    );

    res.json({ message: 'Plan status updated successfully' });
  } catch (error) {
    console.error('Error updating plan status:', error);
    res.status(500).json({ message: 'Failed to update plan status' });
  }
};

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

// Get public plans
const getPublicPlans = async (req: Request, res: Response) => {
  try {
    const [plans] = await pool.query<Plan[]>(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC'
    );
    
    const processedPlans = processPlansFeatures(plans);
    res.json(processedPlans);
  } catch (error) {
    console.error('Error fetching public plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
};

// Add these controller methods
const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, duration_unit, features } = req.body;

    // Store features as a newline-separated string
    const processedFeatures = Array.isArray(features) 
      ? features.join('\n')
      : features;

    await pool.query(
      'UPDATE subscription_plans SET name = ?, description = ?, price = ?, duration = ?, duration_unit = ?, features = ? WHERE id = ?',
      [name, description, price, duration, duration_unit, processedFeatures, id]
    );

    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ message: 'Failed to update plan' });
  }
};

const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ message: 'Failed to delete plan' });
  }
};

const processPlansFeatures = (plans: Plan[]) => {
  return plans.map(plan => {
    let features = plan.features;
    
    // If features is a string, split it by newlines
    if (typeof features === 'string') {
      features = features.split('\n').map(f => f.trim()).filter(Boolean);
    }
    
    return {
      ...plan,
      features
    };
  });
};

export {
  getPlans,
  createPlan,
  updatePlanStatus,
  getSubscribers,
  toggleSubscriptionFreeze,
  getPublicPlans,
  updatePlan,
  deletePlan
}; 