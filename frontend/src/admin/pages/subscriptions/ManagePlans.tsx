import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../../services/api';
import { Plan } from '../../../types/subscription';
import AddPlanModal from './AddPlanModal';
import EditPlanModal from './EditPlanModal';
import AddSubscriptionPlanModal from './AddSubscriptionPlanModal';
import DefaultPricing from './DefaultPricing';

interface PlanMetadata {
  plan_type?: string;
  subject_count?: number;
}

const parsePlanMetadata = (metadataStr: string | null): PlanMetadata => {
  if (metadataStr) {
    try {
      return JSON.parse(metadataStr);
    } catch (e) {
      console.error('Error parsing plan metadata:', e);
    }
  }
  return {};
};

const ManagePlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      // If we're already loading or have plans, don't fetch again
      if (loading || plans.length > 0) {
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        Swal.fire({
          title: 'Authentication Required',
          text: 'Please log in to access this page',
          icon: 'warning',
          confirmButtonColor: '#3B82F6'
        }).then(() => {
          window.location.href = '/admin/login';
        });
        return;
      }

      const data = await api.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      if (error instanceof Error && error.message === 'No authentication token found') {
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          icon: 'warning',
          confirmButtonColor: '#3B82F6'
        }).then(() => {
          window.location.href = '/admin/login';
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to fetch plans',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to access this page',
        icon: 'warning',
        confirmButtonColor: '#3B82F6'
      }).then(() => {
        window.location.href = '/admin/login';
      });
      return;
    }

    fetchPlans();
  }, []); // Empty dependency array since we only want this to run once on mount

  const handleDeletePlan = async (planId: number) => {
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
        await api.deletePlan(planId);
        await fetchPlans();
        Swal.fire({
          title: 'Success!',
          text: 'Plan deleted successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      } catch (error) {
        console.error('Error deleting plan:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete plan',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  const handleToggleStatus = async (planId: number, currentStatus: boolean) => {
    try {
      await api.updatePlanStatus(planId, !currentStatus);
      await fetchPlans();
      Swal.fire({
        title: 'Success!',
        text: 'Plan status updated successfully',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });
    } catch (error) {
      console.error('Error updating plan status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update plan status',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleAddNewPlan = () => {
    setShowAddModal(true);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Manage Plans</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsAddSubscriptionModalOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subscription Plan
              </button>
              <button
                onClick={handleAddNewPlan}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Plan
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Status</span>
                      <button
                        onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plan.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="font-medium">${plan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {plan.duration} {plan.duration_unit}(s)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package Type</span>
                      <span className="font-medium capitalize">{plan.package_type}</span>
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Features</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-gray-600 text-sm">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <AddPlanModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPlans}
        />

        {selectedPlan && (
          <EditPlanModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            onSuccess={fetchPlans}
          />
        )}

        <AddSubscriptionPlanModal
          isOpen={isAddSubscriptionModalOpen}
          onClose={() => setIsAddSubscriptionModalOpen(false)}
          onSuccess={fetchPlans}
        />

        <DefaultPricing onUpdate={fetchPlans} />
      </div>
    </div>
  );
};

export default ManagePlans;