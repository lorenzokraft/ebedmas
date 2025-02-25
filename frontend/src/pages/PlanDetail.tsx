import React, { useState, useEffect } from 'react';
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setUserEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

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
    const selectedPlan = plans.find(p => p.type === selectedPackage);
    if (!selectedPlan || !validateEmail(userEmail) || !validateName(userName) || !acceptedTerms) {
      setPaystackConfig(null);
      return;
    }

    const amount = Math.round(
      calculateDiscountedPrice(
        billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice,
        childrenCount,
        getAdditionalChildDiscount(selectedPlan)
      ) * 100
    );

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
        actual_amount: amount
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
              amount_paid: amount,
              reference: reference.reference,
              card_last_four: reference.card?.last4 || reference.reference.slice(-4)
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('Server error:', data);
            throw new Error(data.message || 'Failed to create trial subscription');
          }

          // Store user ID and token in localStorage
          if (data.user_id && data.token) {
            localStorage.setItem('userId', data.user_id.toString());
            localStorage.setItem('token', data.token);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Force a page reload to update authentication state
            window.dispatchEvent(new Event('storage'));
          }

          // Show success message
          toast.success('Trial subscription created successfully!', {
            position: "top-right",
            autoClose: 5000
          });

          // Redirect to trial confirmation page with required state
          navigate('/trial-confirmation', {
            state: {
              trialEndDate: data.trial_end_date,
              planName: selectedPlan?.title,
              amount: `₦${amount.toLocaleString()}`
            },
            replace: true // This prevents going back to the payment page
          });
          
        } catch (error) {
          console.error('Error creating trial:', error);
          toast.error('Failed to create subscription. Please try again.', {
            position: "top-right",
            autoClose: 5000
          });
        }
      },
      onClose: () => {
        // Redirect back to plan detail page when payment modal is closed
        navigate('/plan-detail');
      }
    };

    setPaystackConfig(config);
  }, [selectedPackage, billingCycle, childrenCount, plans, userEmail, userName, acceptedTerms]);

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
            {plans.length > 0 && (
              <span className="text-sm text-gray-500 ml-4">
                Each additional child gets {formatCurrency(
                  billingCycle === 'yearly' 
                    ? plans.find(p => p.type === selectedPackage)?.yearlyAdditionalChildDiscountAmount || 0
                    : plans.find(p => p.type === selectedPackage)?.monthlyAdditionalChildDiscountAmount || 0
                )} off!
              </span>
            )}
          </div>
        </div>

        {/* Package Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const basePrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const additionalChildDiscount = billingCycle === 'yearly' 
              ? plan.yearlyAdditionalChildDiscountAmount 
              : plan.monthlyAdditionalChildDiscountAmount;
            
            const totalBasePrice = calculateBasePrice(basePrice, childrenCount);
            const finalPrice = calculateDiscountedPrice(basePrice, childrenCount, additionalChildDiscount);
            const hasDiscount = totalBasePrice !== finalPrice;

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
                    <div className="space-y-3">
                      {plan.subjects.map((subject) => (
                        <label 
                          key={subject}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPackage === 'single' && selectedSubject === subject
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="radio"
                            name="subject"
                            value={subject}
                            checked={selectedPackage === 'single' && selectedSubject === subject}
                            onChange={() => setSelectedSubject(subject)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                            {subject}
                          </span>
                        </label>
                      ))}
                    </div>
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
                  {hasDiscount && (
                    <div className="text-base text-gray-400 line-through">
                      {formatCurrency(totalBasePrice)}
                    </div>
                  )}
                  <div className="text-4xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(finalPrice)}
                  </div>
                  {hasDiscount && (
                    <div className="text-sm text-green-600 font-semibold mt-2">
                      {billingCycle === 'yearly' 
                        ? `Save ${plan.yearlyDiscountPercentage}% with yearly billing`
                        : childrenCount > 1 
                          ? `Save ${formatCurrency(totalBasePrice - finalPrice)} with family discount`
                          : ''}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1.5">
                    {billingCycle === 'yearly' ? 'per year' : 'per month'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trial Info */}
        <div className="mt-4 max-w-md mx-auto text-center space-y-3">
          <p className="text-sm text-gray-600">
            Start your 7-day free trial today. You'll have full access to all features and can cancel anytime during the trial period. 
            {selectedPackage && (
              <>
                After your trial ends, you will be charged {formatCurrency(Math.round(
                  calculateDiscountedPrice(
                    billingCycle === 'yearly' 
                      ? plans.find(p => p.type === selectedPackage)?.yearlyPrice || 0 
                      : plans.find(p => p.type === selectedPackage)?.monthlyPrice || 0,
                    childrenCount,
                    getAdditionalChildDiscount(plans.find(p => p.type === selectedPackage))
                  ) * 100
                ) / 100)} starting {getSubscriptionStartDate()}.
              </>
            )}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p className="font-medium text-gray-900 mb-2">Important Payment Information:</p>
            <ul className="text-gray-600 text-left space-y-1">
              <li>• A one-time ₦50 card authorization fee will be charged</li>
              <li>• This small fee helps us verify your card and prevent fraud</li>
              <li>• Your subscription amount will only be charged after 7 days if you don't cancel</li>
              <li>• The authorization fee is non-refundable, as per standard banking practices</li>
            </ul>
          </div>
        </div>

        {/* User Information Section */}
        <div className="mt-8 max-w-md mx-auto space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={userName}
              onChange={handleNameChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                nameError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="mt-6 max-w-md mx-auto">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">
              I accept the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                Ebedmas Terms and Conditions
              </Link>
            </span>
          </label>
        </div>

        {/* Continue Button */}
        <div className="text-center mt-8">
          {paystackConfig && !emailError && !nameError && acceptedTerms && (
            <div className="flex items-center justify-center">
              <PaystackButton {...paystackConfig}>
                <span className="flex items-center">
                  Start 7-Day Free Trial
                  <ChevronRight className="w-6 h-6 ml-2" />
                </span>
              </PaystackButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
