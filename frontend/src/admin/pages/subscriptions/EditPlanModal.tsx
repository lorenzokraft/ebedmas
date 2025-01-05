import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    duration_unit: 'day' | 'month' | 'year';
    features: string[];
  };
}

const EditPlanModal = ({ isOpen, onClose, onSuccess, plan }: EditPlanModalProps) => {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [price, setPrice] = useState(plan.price.toString());
  const [duration, setDuration] = useState(plan.duration.toString());
  const [durationUnit, setDurationUnit] = useState<'day' | 'month' | 'year'>(plan.duration_unit);
  const [features, setFeatures] = useState<string[]>([
    Array.isArray(plan.features) 
      ? plan.features.join('\n')
      : plan.features || ''
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price.toString());
    setDuration(plan.duration.toString());
    setDurationUnit(plan.duration_unit);
    setFeatures([
      Array.isArray(plan.features) 
        ? plan.features.join('\n')
        : plan.features || ''
    ]);
  }, [plan]);

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
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        duration_unit: durationUnit,
        features: features[0]
      };

      await api.put(`/api/subscriptions/plans/${plan.id}`, planData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Plan updated successfully',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating plan:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update plan',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Subscription Plan</h2>

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
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as 'day' | 'month' | 'year')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="day">Day(s)</option>
                <option value="month">Month(s)</option>
                <option value="year">Year(s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (one per line)
            </label>
            <textarea
              value={features[0]}
              onChange={(e) => setFeatures([e.target.value])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Access to all Nursery Quizzes&#10;Basic Progress Tracking&#10;Email Support"
              rows={5}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal; 