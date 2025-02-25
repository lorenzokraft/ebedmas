import { Request, Response } from 'express';
import axios from 'axios';
import { pool } from '../db/database';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      // Extract metadata from the payment
      const { metadata } = data;
      const {
        billingCycle,
        childrenCount,
        selectedPackage,
        selectedSubject
      } = metadata;

      // Get user ID from the authenticated session
      const userId = req.user?.id; // Assuming you have authentication middleware

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Create subscription record
        const [result] = await connection.query(
          `INSERT INTO subscriptions (
            user_id,
            plan_type,
            billing_cycle,
            children_count,
            selected_subject,
            amount_paid,
            payment_reference,
            status,
            start_date,
            end_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY))`,
          [
            userId,
            selectedPackage,
            billingCycle,
            childrenCount,
            selectedSubject,
            data.amount / 100, // Convert from kobo to naira
            reference,
            'active',
            billingCycle === 'yearly' ? 365 : 30
          ]
        );

        await connection.commit();
        res.json({
          success: true,
          message: 'Payment verified and subscription created',
          data: {
            reference,
            amount: data.amount / 100,
            status: 'success'
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};
