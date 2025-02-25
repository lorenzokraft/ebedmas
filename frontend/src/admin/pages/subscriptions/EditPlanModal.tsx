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
    package_type: 'all_access' | 'combo' | 'single';
    subjects: string[];
    yearly_discount_percentage: number;
    additional_child_discount_percentage: number;
  };
}

const EditPlanModal = ({ isOpen, onClose, onSuccess, plan }: EditPlanModalProps) => {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  
  // Package type settings
  const [selectedPackages, setSelectedPackages] = useState<{
    all_access: boolean;
    combo: boolean;
    single: boolean;
  }>({ 
    all_access: plan.package_type === 'all_access',
    combo: plan.package_type === 'combo',
    single: plan.package_type === 'single'
  });

  // Price settings for each package type
  const [packagePrices, setPackagePrices] = useState<{
    all_access: string;
    combo: string;
    single: string;
  }>({ 
    all_access: plan.package_type === 'all_access' ? plan.price.toString() : '',
    combo: plan.package_type === 'combo' ? plan.price.toString() : '',
    single: plan.package_type === 'single' ? plan.price.toString() : ''
  });

  const [duration, setDuration] = useState(plan.duration.toString());
  const [durationUnit, setDurationUnit] = useState<'day' | 'month' | 'year'>(plan.duration_unit);
  const [subjects, setSubjects] = useState<string[]>(plan.subjects || []);
  const [yearlyDiscountPercentage, setYearlyDiscountPercentage] = useState(plan.yearly_discount_percentage?.toString() || '30');
  const [additionalChildDiscountPercentage, setAdditionalChildDiscountPercentage] = useState(plan.additional_child_discount_percentage?.toString() || '50');
  const [features, setFeatures] = useState<string[]>([
    Array.isArray(plan.features) 
      ? plan.features.join('\n')
      : plan.features || ''
  ]);
  const [loading, setLoading] = useState(false);

  // Calculate monthly discount based on yearly discount
  const monthlyDiscount = parseFloat(yearlyDiscountPercentage) / 12;

  useEffect(() => {
    setName(plan.name);
    setDescription(plan.description);
    setSelectedPackages({
      all_access: plan.package_type === 'all_access',
      combo: plan.package_type === 'combo',
      single: plan.package_type === 'single'
    });
    setPackagePrices({
      all_access: plan.package_type === 'all_access' ? plan.price.toString() : '',
      combo: plan.package_type === 'combo' ? plan.price.toString() : '',
      single: plan.package_type === 'single' ? plan.price.toString() : ''
    });
    setDuration(plan.duration.toString());
    setDurationUnit(plan.duration_unit);
    setSubjects(plan.subjects || []);
    setYearlyDiscountPercentage(plan.yearly_discount_percentage?.toString() || '30');
    setAdditionalChildDiscountPercentage(plan.additional_child_discount_percentage?.toString() || '50');
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
      // Get the selected package type and its price
      const selectedPackageType = Object.entries(selectedPackages).find(([_, isSelected]) => isSelected)?.[0] as 'all_access' | 'combo' | 'single';
      
      if (!selectedPackageType) {
        throw new Error('No package type selected');
      }

      const planData = {
        name,
        description,
        price: parseFloat(packagePrices[selectedPackageType]),
        duration: parseInt(duration),
        duration_unit: durationUnit,
        package_type: selectedPackageType,
        subjects,
        yearly_discount_percentage: parseInt(yearlyDiscountPercentage),
        additional_child_discount_percentage: parseInt(additionalChildDiscountPercentage),
        features: features[0]
      };

      await api.put(`/api/subscriptions/plans/${plan.id}`, planData);
      
      Swal.fire({
        title: 'Success!',
        text: 'Plans updated successfully',
        icon: 'success',
        confirmButtonColor: '#10B981'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating plans:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update plans',
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Types
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPackages.all_access}
                  onChange={(e) => setSelectedPackages(prev => ({ ...prev, all_access: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>All Access</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPackages.combo}
                  onChange={(e) => setSelectedPackages(prev => ({ ...prev, combo: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>Combo</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPackages.single}
                  onChange={(e) => setSelectedPackages(prev => ({ ...prev, single: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>Single Subject</span>
              </label>
            </div>
          </div>

          {/* Duration settings - common for all selected packages */}
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                <option value="month">Month(s)</option>
                <option value="year">Year(s)</option>
              </select>
            </div>
          </div>

          {/* Price settings for each selected package */}
          {selectedPackages.all_access && (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-3">All Access Package Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={packagePrices.all_access}
                    onChange={(e) => setPackagePrices(prev => ({ ...prev, all_access: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPackages.combo && (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-3">Combo Package Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={packagePrices.combo}
                    onChange={(e) => setPackagePrices(prev => ({ ...prev, combo: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPackages.single && (
            <div className="mb-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-3">Single Subject Package Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={packagePrices.single}
                    onChange={(e) => setPackagePrices(prev => ({ ...prev, single: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Discount settings - common for all packages */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Payment Discount (%)
              </label>
              <input
                type="number"
                value={yearlyDiscountPercentage}
                onChange={(e) => setYearlyDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={durationUnit === 'year'}
              />
              {durationUnit !== 'year' && (
                <p className="text-sm text-gray-500 mt-1">
                  Monthly equivalent: {monthlyDiscount.toFixed(1)}% per month
                </p>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Applied to all payment cycles</p>
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