import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Lock, Users, Receipt, CreditCard, Download, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Learner {
  id: number;
  name: string;
  age: number;
  grade: string;
  subjects: string[];
}

interface Receipt {
  id: number;
  date: string;
  amount: number;
  status: 'Success' | 'Trial' | 'Upcoming';
  cardLastFour?: string;
  cardType?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  planType?: string;
  subjects?: string;
  userName?: string;
  userEmail?: string;
}

const API_BASE_URL = 'http://localhost:5000';

const Settings: React.FC = () => {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showAllReceipts, setShowAllReceipts] = useState(false);

  useEffect(() => {
    fetchLearners();
    fetchReceipts();
  }, []);

  const fetchLearners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/learners`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      setLearners(response.data);
    } catch (error: any) {
      console.error('Error fetching learners:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch learners');
    }
  };

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        toast.error('Please log in to view receipts');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/subscriptions/receipts`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        console.log('Receipt data:', response.data);
        setReceipts(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch receipts');
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      console.error('Password change error:', error.response?.data);
    }
  };

  const handleDeleteLearner = async (learnerId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/learners/${learnerId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Learner deleted successfully');
      fetchLearners(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting learner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete learner');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    try {
      // Ensure we have a valid number
      const numericAmount = Number(amount);
      if (isNaN(numericAmount)) {
        console.error('Invalid amount:', amount);
        return '₦0.00';
      }

      // Convert kobo to Naira (divide by 100)
      const amountInNaira = numericAmount / 100;
      
      // Format with Nigerian Naira
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInNaira);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₦0.00';
    }
  };

  const generateReceiptHtml = (receipt: Receipt) => {
    const formattedAmount = formatCurrency(receipt.amount);
    const invoiceNumber = `EBD-${new Date(receipt.date).getFullYear()}-${receipt.id}`;
    const dueDate = new Date(receipt.date);
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Ebedmas Education</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { margin-bottom: 40px; }
          .company-info { text-align: right; margin-bottom: 20px; }
          .invoice-title { font-size: 32px; margin-bottom: 30px; }
          .bill-to { margin-bottom: 30px; }
          .invoice-details { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 30px; }
          .invoice-details div { margin-bottom: 10px; }
          .invoice-details .label { color: #666; font-size: 0.9em; }
          .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .table th { background: #f8f9fa; text-align: left; }
          .table th, .table td { padding: 12px; border-bottom: 1px solid #ddd; }
          .total-section { text-align: right; margin-top: 30px; }
          .total-row { font-size: 1.2em; font-weight: bold; }
          .support-info { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <h1>Ebedmas Education</h1>
              <p>Lagos, Nigeria</p>
              <p>support@ebedmas.com</p>
            </div>
          </div>

          <h1 class="invoice-title">Invoice</h1>

          <div class="bill-to">
            <h3>Bill to:</h3>
            <p>${receipt.userName || 'Valued Customer'}</p>
            <p>${receipt.userEmail || ''}</p>
          </div>

          <div class="invoice-details">
            <div>
              <div class="label">Invoice No.</div>
              <div>${invoiceNumber}</div>
            </div>
            <div>
              <div class="label">Date of issue</div>
              <div>${new Date(receipt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div>
              <div class="label">Date due</div>
              <div>${dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${receipt.planType || 'Monthly Plan'} - ${receipt.subjects || 'All Subjects'}</td>
                <td>${formattedAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <div>Total due</div>
              <div>${formattedAmount}</div>
            </div>
          </div>

          <div class="support-info">
            <p>For any questions about this invoice, please contact support@ebedmas.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const openReceipt = (receipt: Receipt) => {
    const html = generateReceiptHtml(receipt);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* Password Change Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="mt-4 max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Learners Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Manage Learners
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {learners.map((learner) => (
                    <tr key={learner.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {learner.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {learner.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {learner.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {learner.subjects?.join(', ') || 'No subjects'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this learner?')) {
                              handleDeleteLearner(learner.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Center Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <Receipt className="w-5 h-5 mr-2" />
              Receipt Center
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Show upcoming payments first */}
                  {receipts
                    .filter(receipt => receipt.status === 'Upcoming')
                    .map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-amber-600">
                              <Clock className="h-5 w-5 inline mr-1" />
                              Upcoming
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(receipt.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(receipt.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          No charge yet
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => openReceipt(receipt)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  {/* Then show trial and other receipts */}
                  {receipts
                    .filter(receipt => receipt.status !== 'Upcoming')
                    .map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {receipt.status === 'Trial' ? (
                              <span className="text-purple-600">
                                <CreditCard className="w-4 h-4 mr-1" />
                                Trial
                              </span>
                            ) : (
                              <span className="text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Success
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(receipt.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(receipt.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.status === 'Trial' ? (
                            'Trial Period'
                          ) : receipt.status === 'Upcoming' ? (
                            'Scheduled'
                          ) : (
                            <div className="flex items-center">
                              <span className="w-8 h-5 bg-black rounded mr-2"></span>
                              {receipt.cardLastFour && receipt.cardLastFour !== 'N/A' ? 
                                `****${receipt.cardLastFour}` : 'N/A'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => openReceipt(receipt)}
                            className="text-blue-600 hover:text-blue-900 mx-2"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {receipts.length > 5 && (
              <button
                onClick={() => setShowAllReceipts(!showAllReceipts)}
                className="mt-4 text-blue-600 hover:text-blue-900"
              >
                {showAllReceipts ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
