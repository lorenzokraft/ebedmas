import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import api from '../admin/services/api'; // Update the path as needed
import Swal from 'sweetalert2';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: 'day' | 'month' | 'year';
  features: string[];
  is_active: boolean;
}

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/subscriptions/public');
      const activePlans = response.data
        .filter((plan: Plan) => plan.is_active)
        .sort((a: Plan, b: Plan) => a.price - b.price);
      setPlans(activePlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      Swal.fire('Error', 'Failed to load subscription plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId: number) => {
    // For now, just redirect to a confirmation page or handle subscription logic
    console.log(`Subscribed to plan ${planId}`);
    navigate('/confirmation'); // Redirect to a confirmation page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white p-8 rounded-lg shadow-lg ${
              plan.name.toLowerCase().includes('premium') ? 'border-2 border-blue-500' : ''
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-4xl font-bold mb-6">
              ${plan.price}
              <span className="text-lg">/{plan.duration_unit}</span>
            </p>
            <ul className="mb-6 space-y-2">
              {(typeof plan.features === 'string' 
                ? plan.features.split(',') 
                : plan.features
              ).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{typeof feature === 'string' ? feature.trim() : feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribe(plan.id)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {plan.name.toLowerCase().includes('premium') ? 'Get Premium' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
      <br />
      <br />
      <Footer />
    </div>
  );
};

export default SubscriptionPage;