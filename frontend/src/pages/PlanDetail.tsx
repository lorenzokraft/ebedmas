import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, BookOpen, Layers, GraduationCap, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { PaystackButton } from 'react-paystack';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast

interface PricingPlan {
  type: 'all_access' | 'combo' | 'single';
  title: string;
  subjects: string[];
  description: string;
  yearlyPrice: number;
  monthlyPrice: number;
  yearlyDiscountPercentage: number;
  yearlyAdditionalChildDiscountAmount: number;
  monthlyAdditionalChildDiscountAmount: number;
  isSelected?: boolean;
}

const PlanDetail: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [childrenCount, setChildrenCount] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [paystackConfig, setPaystackConfig] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getAdditionalChildDiscount = (plan: PricingPlan | undefined) => {
    if (!plan) return 0;
    if (billingCycle === 'yearly') {
      return plan.yearlyAdditionalChildDiscountAmount;
    }
    return plan.monthlyAdditionalChildDiscountAmount;
  };

  const calculateBasePrice = (basePrice: number, numberOfChildren: number) => {
    if (numberOfChildren <= 1) return basePrice;
    return basePrice * numberOfChildren;
  };

  const calculateDiscountedPrice = (basePrice: number, numberOfChildren: number, additionalChildDiscountAmount: number) => {
    if (numberOfChildren <= 1) return basePrice;
    let totalPrice = basePrice;
    const additionalChildren = numberOfChildren - 1;
    const discountedPrice = basePrice - additionalChildDiscountAmount;
    totalPrice += discountedPrice * additionalChildren;
    return totalPrice;
  };

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'all_access':
        return <Layers className="w-6 h-6" />;
      case 'combo':
        return <BookOpen className="w-6 h-6" />;
      case 'single':
        return <Book className="w-6 h-6" />;
      default:
        return <Book className="w-6 h-6" />;
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2; // Minimum 2 characters
  };

  const handleEmailChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setUserEmail(email);
    setPaystackConfig(null); // Immediately clear Paystack config when email changes
    
    if (!email) {
      setEmailError('');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      // Try to register with the email to check if it exists
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          username: email.split('@')[0], // Use email prefix as username
          password: 'temporary-check'
        })
      });

      const data = await response.json();
      
      if (response.status === 400 && data.message === 'Email already registered') {
        setEmailError('This email is already registered. Please use a different email or login to your existing account.');
      } else if (response.status === 201) {
        // Email is available and registration succeeded
        setEmailError('');
      } else {
        // Some other error occurred
        setEmailError('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Don't show technical errors to user
      setEmailError('');
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setUserName(name);
    if (name && !validateName(name)) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

  const getSubscriptionStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.getDefaultPricing();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (plans.length > 0 && !selectedPackage) {
      setSelectedPackage(plans[0].type);
    }
  }, [plans, selectedPackage]);

  useEffect(() => {
    const initializePaystack = async () => {
      if (!validateEmail(userEmail) || emailError || nameError || !acceptedTerms) {
        setPaystackConfig(null);
        return;
      }

      // Get the selected plan
      const selectedPlan = plans.find(p => p.type === selectedPackage);
      if (!selectedPlan) return;

      let amount = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
      const additionalChildDiscount = getAdditionalChildDiscount(selectedPlan);
      amount = calculateDiscountedPrice(amount, childrenCount, additionalChildDiscount);

      // Ensure amount is a valid number and round to 2 decimal places
      const originalAmount = Number(amount.toFixed(2));

      // Convert to kobo (multiply by 100)
      const amountInKobo = Math.round(originalAmount * 100);

      const config = {
        email: userEmail,
        amount: 5000, // Minimum amount for card authorization
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        text: "Start 7-Day Free Trial",
        className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-lg flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg",
        metadata: {
          name: userName,
          plan_type: selectedPackage,
          billing_cycle: billingCycle,
          children_count: childrenCount,
          is_trial: true,
          actual_amount: amountInKobo,
          original_amount: originalAmount
        },
        onSuccess: async (reference: any) => {
          try {
            // Create trial subscription
            const response = await fetch('http://localhost:5000/api/subscriptions/trial', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: userEmail,
                username: userName,
                plan_type: selectedPlan?.type,
                billing_cycle: billingCycle,
                children_count: childrenCount,
                selected_subject: selectedSubject,
                amount_paid: amountInKobo,
                original_amount: originalAmount,
                reference: reference.reference,
                card_last_four: reference.card?.last4 || reference.reference.slice(-4)
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || 'Failed to create trial subscription');
            }

            // Save the token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
              id: data.user_id,
              email: userEmail,
              username: userName,
              role: 'trial'
            }));

            // Navigate to trial confirmation with the amount
            navigate('/trial-confirmation', {
              state: {
                trialEndDate: data.trial_end_date,
                planName: selectedPlan?.type === 'all_access' ? 'All Access' :
                         selectedPlan?.type === 'combo' ? 'Combo Package' :
                         selectedPlan?.type === 'single' ? 'Single Subject' : selectedPlan?.title,
                amount: originalAmount,
                childrenCount: childrenCount,
                maxLearners: childrenCount,
                email: userEmail
              },
              replace: true
            });
          } catch (error) {
            console.error('Error creating trial subscription:', error);
            toast.error('Failed to create subscription. Please try again.', {
              position: "top-right",
              autoClose: 5000
            });
          }
        },
        onClose: () => {
          navigate('/plan-detail');
        }
      };
      setPaystackConfig(config);
    };
    initializePaystack();
  }, [plans, selectedPackage, userEmail, userName, billingCycle, childrenCount, selectedSubject, acceptedTerms]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Plans Available</h2>
          <p className="text-gray-600">Please check back later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customize Your Learning Journey</h1>
          <p className="text-lg text-gray-600">Choose the perfect plan for your children's education</p>
        </div>

        {/* Billing Cycle Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Your Billing Cycle</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                billingCycle === 'monthly'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
                billingCycle === 'yearly'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              Yearly
              {plans.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save {plans.find(p => p.type === selectedPackage)?.yearlyDiscountPercentage || 30}%
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Children Count Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Number of Children</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setChildrenCount(Math.max(1, childrenCount - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-semibold text-gray-900 w-12 text-center">
              {childrenCount}
            </span>
            <button
              onClick={() => setChildrenCount(childrenCount + 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              +
            </button>
            {selectedPackage && (
              <div className="text-sm text-green-600 ml-4">
                Additional child gets ₦{billingCycle === 'yearly' 
                  ? plans.find(p => p.type === selectedPackage)?.yearlyAdditionalChildDiscountAmount.toLocaleString()
                  : plans.find(p => p.type === selectedPackage)?.monthlyAdditionalChildDiscountAmount.toLocaleString()} off!
              </div>
            )}
          </div>
        </div>

        {/* Package Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const basePrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const additionalChildDiscount = getAdditionalChildDiscount(plan);
            const finalPrice = calculateDiscountedPrice(basePrice, childrenCount, additionalChildDiscount);

            return (
              <div
                key={plan.type}
                onClick={() => setSelectedPackage(plan.type)}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105 ${
                  selectedPackage === plan.type
                    ? 'ring-2 ring-blue-500 shadow-blue-100'
                    : 'hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    selectedPackage === plan.type ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getPackageIcon(plan.type)}
                  </div>
                  {plan.type === 'all_access' && (
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                      Best Value
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="space-y-2 mb-4">
                  {plan.type === 'single' ? (
                    plan.subjects.map((subject) => (
                      <div key={subject} className="flex items-center text-gray-700">
                        <input
                          type="radio"
                          id={`subject-${subject}`}
                          name="selected-subject"
                          value={subject}
                          checked={selectedSubject === subject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400"
                        />
                        <label htmlFor={`subject-${subject}`} className="flex items-center cursor-pointer">
                          <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{subject}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    plan.subjects.map((subject) => (
                      <div key={subject} className="flex items-center text-gray-700">
                        <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{subject}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex flex-col">
                    {childrenCount > 1 && (
                      <span className="text-lg text-gray-500 line-through mb-1">
                        {formatCurrency(basePrice * childrenCount)}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1.5">
                    {billingCycle === 'yearly' ? 'per year' : 'per month'}
                  </div>
                  <div className="text-sm text-green-600 mt-2">
                    Additional child gets ₦{additionalChildDiscount.toLocaleString()} off!
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={handleNameChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your full name"
              />
              {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={handleEmailChange}
                className={`block w-full px-4 py-3 rounded-lg border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your email address"
              />
              {emailError && (
                <div className="mt-1 text-sm text-red-600 flex items-start space-x-1">
                  <span>⚠️</span>
                  <p>{emailError}</p>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                  Ebedmas Terms and Conditions
                </Link>
              </label>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg text-sm">
              <p className="font-medium text-gray-900 mb-2">Important Payment Information:</p>
              <ul className="text-gray-600 text-left space-y-1">
                <li>• A one-time ₦50 card authorization fee will be charged</li>
                <li>• Your free trial starts immediately</li>
                <li>• No charges during trial period</li>
                <li>• Cancel anytime before trial ends</li>
              </ul>
            </div>

            {emailError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {emailError}
                </p>
              </div>
            ) : null}

            {paystackConfig && !emailError && !nameError && acceptedTerms ? (
              <PaystackButton {...paystackConfig} />
            ) : (
              <button
                disabled
                className="w-full py-4 px-8 rounded-lg bg-gray-400 text-white font-semibold text-lg cursor-not-allowed"
              >
                {emailError ? 'Email Not Available' : 'Complete Required Fields'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
