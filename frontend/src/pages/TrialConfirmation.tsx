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
  const { trialEndDate, planName, amount, childrenCount = 1 } = location.state || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const { setPasswordSet } = useAuth();

  useEffect(() => {
    // If no state is available, redirect to dashboard
    if (!location.state) {
      navigate('/user/dashboard');
    }
  }, [location.state, navigate]);

  // If no state is available, don't render anything while redirecting
  if (!location.state) {
    return null;
  }

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
      const response = await fetch('http://localhost:5000/api/users/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Failed to set password');
      }

      setIsPasswordSet(true);
      setPasswordSet(true);
      toast.success('Password set successfully!');
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Failed to set password. Please try again.');
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
    <div className="min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Welcome to Ebedmas Learning Platform
          </h2>

          {!isPasswordSet ? (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set Your Password</h3>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pr-10 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 pl-3 py-2 sm:text-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pr-10 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 pl-3 py-2 sm:text-sm"
                      placeholder="Confirm your password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Set Password
                </button>
              </form>
            </div>
          ) : null}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Trial Details</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>Plan: {planName}</p>
                <p>Number of Children: {childrenCount}</p>
                <p>Trial Ends: {trialEndDate ? format(new Date(trialEndDate), 'MMMM do, yyyy') : 'Not available'}</p>
                <p>Subscription Amount: {amount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  A one-time ₦50 card authorization fee has been charged to verify your card.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You have immediate access to all features</li>
                <li>• Your free trial runs until {trialEndDate ? format(new Date(trialEndDate), 'MMMM do') : 'trial end'}</li>
                <li>• Cancel anytime before trial ends to avoid subscription charges</li>
                <li>• If you continue, {amount} will be charged on {trialEndDate ? format(new Date(trialEndDate), 'MMMM do') : 'trial end'}</li>
                <li>• The ₦50 authorization fee is separate from your subscription</li>
              </ul>
            </div>

            <div className="space-y-4">
              {isPasswordSet ? (
                <>
                  <button
                    onClick={handleAddLearners}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Learners
                  </button>
                  <Link
                    to="/user/dashboard"
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <p className="text-sm text-center text-gray-500">Please set your password before continuing</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialConfirmation;
