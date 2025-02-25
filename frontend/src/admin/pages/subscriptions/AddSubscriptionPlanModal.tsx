import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface AddSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSubscriptionPlanModal = ({ isOpen, onClose, onSuccess }: AddSubscriptionPlanModalProps) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [planType, setPlanType] = useState<'school' | 'family'>('family');
  const [loading, setLoading] = useState(false);

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        name,
        description: planType === 'school' ? 'School Plan' : 'Family Plan',
        price: planType === 'school' ? 75 : 50,  // Default prices
        duration: 1,
        duration_unit: planType === 'school' ? 'year' : 'month',
        features: features.filter(f => f.trim() !== ''),
        package_type: 'all_access',
        subjects: ['Maths', 'English', 'Science'],
        yearly_discount_percentage: 30,
        additional_child_discount_percentage: 50,
        is_subscription_plan: true,
        image,
        plan_type: planType,
        cta: planType === 'school' ? 'Get Quote' : 'Get Started',
        cta_link: planType === 'school' ? '/for-schools' : '/plan-detail'
      };

      await api.post('/api/subscriptions/plans', planData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Subscription plan created successfully',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create subscription plan',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Subscription Plan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Image URL
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={planType === 'family'}
                  onChange={() => setPlanType('family')}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>Family Plan</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={planType === 'school'}
                  onChange={() => setPlanType('school')}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>School Plan</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Features (one per line)
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter feature"
                  required
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionPlanModal;
