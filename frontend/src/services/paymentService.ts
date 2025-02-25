import { usePaystackPayment } from 'react-paystack';
import api from './api';

// Replace with your actual public key from Paystack dashboard
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export interface PaymentConfig {
  email: string;
  amount: number; 
  billingCycle: 'monthly' | 'yearly';
  childrenCount: number;
  selectedPackage: string;
  selectedSubject?: string | null;
}

export const initializePayment = (config: PaymentConfig) => {
  const paystackConfig = {
    reference: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: config.email,
    amount: config.amount * 100, // convert to kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      billingCycle: config.billingCycle,
      childrenCount: config.childrenCount,
      selectedPackage: config.selectedPackage,
      selectedSubject: config.selectedSubject,
      custom_fields: [
        {
          display_name: "Package Type",
          variable_name: "package_type",
          value: config.selectedPackage
        },
        {
          display_name: "Number of Children",
          variable_name: "children_count",
          value: config.childrenCount.toString()
        },
        {
          display_name: "Billing Cycle",
          variable_name: "billing_cycle",
          value: config.billingCycle
        }
      ]
    }
  };

  return usePaystackPayment(paystackConfig);
};

export const onSuccess = async (reference: any) => {
  try {
    // Verify payment with backend
    const response = await api.post('/payments/verify', { reference });
    
    if (response.data.success) {
      // Payment verified successfully
      // You can redirect to a success page or update the UI
      window.location.href = '/dashboard';
    } else {
      // Handle verification failure
      console.error('Payment verification failed');
      alert('Payment verification failed. Please contact support.');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('Error verifying payment. Please contact support.');
  }
};

export const onClose = () => {
  // Handle payment modal close
  console.log('Payment modal closed');
};
