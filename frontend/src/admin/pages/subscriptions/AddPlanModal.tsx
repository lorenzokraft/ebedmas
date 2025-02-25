import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPlanModal = ({ isOpen, onClose, onSuccess }: AddPlanModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'day' | 'month' | 'year'>('month');
  const [packageType, setPackageType] = useState<'all_access' | 'combo' | 'single'>('all_access');
  const [subjects, setSubjects] = useState<string[]>(['Maths', 'English', 'Science']);
  const [yearlyDiscountPercentage, setYearlyDiscountPercentage] = useState('30');
  const [additionalChildDiscountPercentage, setAdditionalChildDiscountPercentage] = useState('50');
  const [features, setFeatures] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  // Update price when package type changes
  useEffect(() => {
    switch (packageType) {
      case 'all_access':
        setPrice('22.00');
        setSubjects(['Maths', 'English', 'Science']);
        break;
      case 'combo':
        setPrice('16.50');
        setSubjects(['Maths', 'English']);
        break;
      case 'single':
        setPrice('11.00');
        setSubjects(['Maths']);
        break;
    }
  }, [packageType]);

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
      // Process and validate features
      const processedFeatures = features[0]
        .split('\n')
        .map(feature => feature.trim())
        .filter(Boolean); // Remove empty lines

      if (processedFeatures.length === 0) {
        throw new Error('At least one feature is required');
      }

      // Validate other required fields
      if (!name.trim()) throw new Error('Plan name is required');
      if (!description.trim()) throw new Error('Description is required');
      if (!price || parseFloat(price) <= 0) throw new Error('Valid price is required');
      if (!duration || parseInt(duration) <= 0) throw new Error('Valid duration is required');

      const planData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        duration: parseInt(duration),
        duration_unit: durationUnit,
        package_type: packageType,
        subjects,
        yearly_discount_percentage: parseInt(yearlyDiscountPercentage),
        additional_child_discount_percentage: parseInt(additionalChildDiscountPercentage),
        features: processedFeatures,
        is_subscription_plan: false
      };

      // Log the data being sent
      console.log('Sending plan data:', planData);

      const response = await api.post('/api/subscriptions/plans', planData);
      console.log('Server response:', response.data);

      Swal.fire({
        title: 'Success!',
        text: 'Plan created successfully',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });

      onSuccess();
      // Navigate to plan detail page with the new plan
      navigate('/plan-detail', { 
        state: { 
          selectedPlan: response.data
        } 
      });
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Detailed error:', error);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to create plan';
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDuration('');
    setDurationUnit('month');
    setPackageType('all_access');
    setSubjects(['Maths', 'English', 'Science']);
    setYearlyDiscountPercentage('30');
    setAdditionalChildDiscountPercentage('50');
    setFeatures(['']);
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

        <h2 className="text-2xl font-bold mb-6">Add New Subscription Plan</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Basic Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Plan description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Type
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value as 'all_access' | 'combo' | 'single')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all_access">All Access</option>
                <option value="combo">Combo</option>
                <option value="single">Single Subject</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects
              </label>
              <select
                multiple
                value={subjects}
                onChange={(e) => setSubjects(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Maths">Maths</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="29.99"
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
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value as 'day' | 'month' | 'year')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="day">Day(s)</option>
                <option value="month">Month(s)</option>
                <option value="year">Year(s)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Discount (%)
              </label>
              <input
                type="number"
                value={yearlyDiscountPercentage}
                onChange={(e) => setYearlyDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Discount applied for yearly subscriptions</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Child Discount (%)
              </label>
              <input
                type="number"
                value={additionalChildDiscountPercentage}
                onChange={(e) => setAdditionalChildDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Discount for each additional child</p>
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
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanModal;