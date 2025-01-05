import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

interface Subscriber {
  id: number;
  user_id: number;
  username: string;
  email: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'frozen';
  card_last_four: string;
  card_holder_name: string;
  auto_renew: boolean;
}

const ManageSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/api/subscriptions/subscribers');
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      Swal.fire('Error', 'Failed to fetch subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleFreeze = async (subscriberId: number) => {
    try {
      await api.put(`/api/subscriptions/subscribers/${subscriberId}/freeze`);
      fetchSubscribers();
      Swal.fire('Success', 'Subscription frozen successfully', 'success');
    } catch (error) {
      console.error('Error freezing subscription:', error);
      Swal.fire('Error', 'Failed to freeze subscription', 'error');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Subscribers</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscriber.username}</div>
                    <div className="text-sm text-gray-500">{subscriber.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subscriber.plan_name}</div>
                    <div className="text-sm text-gray-500">
                      Auto-renew: {subscriber.auto_renew ? 'Yes' : 'No'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subscriber.card_holder_name}</div>
                    <div className="text-sm text-gray-500">**** {subscriber.card_last_four}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      From: {format(new Date(subscriber.start_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      To: {format(new Date(subscriber.end_date), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subscriber.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscriber.status === 'frozen'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleFreeze(subscriber.id)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={subscriber.status === 'frozen'}
                    >
                      {subscriber.status === 'frozen' ? 'Frozen' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscribers; 