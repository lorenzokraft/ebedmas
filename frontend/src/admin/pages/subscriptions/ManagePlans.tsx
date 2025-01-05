import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AddPlanModal from './AddPlanModal';
import EditPlanModal from './EditPlanModal';

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

const ManagePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/subscriptions/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      Swal.fire('Error', 'Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStatusToggle = async (planId: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/subscriptions/plans/${planId}/status`, {
        is_active: !currentStatus
      });
      fetchPlans();
      Swal.fire('Success', 'Plan status updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update plan status', 'error');
    }
  };

  const handleAddNewPlan = () => {
    setIsAddModalOpen(true);
  };

  const handleDelete = async (planId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/subscriptions/plans/${planId}`);
        fetchPlans();
        Swal.fire('Deleted!', 'Plan has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting plan:', error);
        Swal.fire('Error', 'Failed to delete plan', 'error');
      }
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
          <button
            onClick={handleAddNewPlan}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-500">{plan.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${plan.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {plan.duration} {plan.duration_unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(plan.id, plan.is_active)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        plan.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEdit(plan)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AddPlanModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchPlans}
        />

        {selectedPlan && (
          <EditPlanModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPlan(null);
            }}
            onSuccess={fetchPlans}
            plan={selectedPlan}
          />
        )}
      </div>
    </div>
  );
};

export default ManagePlans; 