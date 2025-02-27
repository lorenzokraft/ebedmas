import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

interface LearnerInfo {
  name: string;
  grade: string;
}

const TrialConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trialEndDate, planName, amount, childrenCount = 1, maxLearners = childrenCount } = location.state || {};
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const { setPasswordSet } = useAuth();

  useEffect(() => {
    if (!location.state) {
      navigate('/user/dashboard');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

  const getFormattedAmount = (amount: number | string) => {
    // Remove currency symbol and commas if it's a string
    let cleanAmount = typeof amount === 'string' 
      ? amount.replace(/[₦,]/g, '') 
      : amount;
    
    // Convert to number
    const validAmount = Number(cleanAmount);
    
    if (isNaN(validAmount)) {
      return '₦0.00';
    }
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount).replace('NGN', '₦');
  };

  const formattedAmount = getFormattedAmount(amount);
  const trialEndDateFormatted = format(new Date(trialEndDate), 'MMMM do, yyyy');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please try starting your trial again.');
        navigate('/plan-detail');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to set password');
      }

      const data = await response.json();
      
      // Update local storage with the new token
      localStorage.setItem('token', data.token);

      setIsPasswordSet(true);
      setPasswordSet(true);
      toast.success('Password set successfully! Redirecting to dashboard...');
      
      // Wait a bit before redirecting to ensure the success message is seen
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast.error(error.message || 'Failed to set password. Please try again.');
    }
  };

  const handleAddLearners = async () => {
    const learners: LearnerInfo[] = [];
    
    for (let i = 0; i < childrenCount; i++) {
      const result = await Swal.fire({
        title: `Add Learner ${i + 1}`,
        html: `
          <input id="learnerName" class="swal2-input" placeholder="Learner's Name">
          <select id="learnerGrade" class="swal2-input">
            <option value="">Select Grade</option>
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>
          <p class="text-sm text-gray-500 mt-3">
            Note: Your child will use your email and password to log in.
          </p>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Add',
        confirmButtonColor: '#6366f1',
        preConfirm: () => {
          const name = (document.getElementById('learnerName') as HTMLInputElement).value;
          const grade = (document.getElementById('learnerGrade') as HTMLSelectElement).value;
          
          if (!name || !grade) {
            Swal.showValidationMessage('Please fill in all fields');
            return false;
          }
          
          return { name, grade };
        }
      });

      if (result.isConfirmed && result.value) {
        learners.push(result.value as LearnerInfo);
      } else {
        // If user cancels, stop the process
        break;
      }
    }

    if (learners.length > 0) {
      try {
        const response = await fetch('http://localhost:5000/api/learners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ learners })
        });

        if (!response.ok) {
          throw new Error('Failed to add learners');
        }

        toast.success('Learners added successfully!');
        navigate('/user/dashboard');
      } catch (error) {
        console.error('Error adding learners:', error);
        toast.error('Failed to add learners. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Ebedmas!</h1>
          
          <div className="bg-green-50 rounded-lg p-4 mb-8 text-center">
            <p className="text-green-700">Your 7-day free trial has started</p>
          </div>

          {!isPasswordSet && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-6">Set Your Password</h2>
              <form onSubmit={handleSetPassword} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Set Password
                </button>
              </form>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Trial Details</h2>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{planName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Number of Children:</span>
                  <span className="font-medium">{childrenCount}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Trial Ends:</span>
                  <span className="font-medium">{trialEndDateFormatted}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Subscription Amount:</span>
                  <span className="font-medium">{formattedAmount}</span>
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                A one-time ₦50 card authorization fee has been charged to verify your card.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  You have immediate access to all features
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Your free trial runs until {trialEndDateFormatted}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Cancel anytime before trial ends to avoid subscription charges
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  If you continue, {formattedAmount} will be charged on {trialEndDateFormatted}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  The ₦50 authorization fee is separate from your subscription
                </li>
              </ul>
            </div>
          </div>

          {isPasswordSet && (
            <div className="space-y-4 mt-8">
              <button
                onClick={handleAddLearners}
                className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Add Learners
              </button>
              <Link
                to="/user/dashboard"
                className="block w-full py-3 px-4 text-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialConfirmation;
