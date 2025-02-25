import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Swal from 'sweetalert2';

interface DefaultPricingProps {
  onUpdate: () => void;
}

interface PricingCard {
  id?: number;
  title: string;
  description: string;
  subjects: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  type: string;
  isSelected: boolean;
  yearlyDiscountPercentage: number;
  monthlyAdditionalChildDiscountAmount: number;
  yearlyAdditionalChildDiscountAmount: number;
}

const DefaultPricing: React.FC<DefaultPricingProps> = ({ onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pricingCards, setPricingCards] = useState<PricingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }

    fetchDefaultPricing();
  }, []);

  const fetchDefaultPricing = async () => {
    try {
      setLoading(true);
      const data = await api.getDefaultPricing();
      setPricingCards(data);
    } catch (error) {
      console.error('Error fetching default pricing:', error);
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
          text: error instanceof Error ? error.message : 'Failed to fetch default pricing',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseFormattedNumber = (value: string): string => {
    // Remove commas before updating the state
    return value.replace(/,/g, '');
  };

  const handlePriceChange = (index: number, field: 'monthlyPrice' | 'yearlyPrice', value: string) => {
    const newPricingCards = [...pricingCards];
    const numericValue = parseFloat(parseFormattedNumber(value)) || 0;
    newPricingCards[index][field] = numericValue;
    setPricingCards(newPricingCards);
  };

  const handleDiscountChange = (index: number, field: string, value: string) => {
    const newCards = [...pricingCards];
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // For additional child discounts, multiply by 100 when storing
    if (field === 'monthlyAdditionalChildDiscountAmount' || field === 'yearlyAdditionalChildDiscountAmount') {
      newCards[index][field] = parseFloat(numericValue);
    } else {
      newCards[index][field] = parseFloat(numericValue);
    }
    
    setPricingCards(newCards);
  };

  const handleTitleChange = (index: number, value: string) => {
    const newPricingCards = [...pricingCards];
    newPricingCards[index].title = value;
    setPricingCards(newPricingCards);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newPricingCards = [...pricingCards];
    newPricingCards[index].description = value;
    setPricingCards(newPricingCards);
  };

  const validatePricingCards = (cards: PricingCard[]) => {
    for (const card of cards) {
      if (card.monthlyPrice < 0 || card.yearlyPrice < 0) {
        throw new Error('Prices cannot be negative');
      }
      if (card.yearlyDiscountPercentage < 0 || card.yearlyDiscountPercentage > 100) {
        throw new Error('Yearly discount percentage must be between 0 and 100');
      }
      if (card.monthlyAdditionalChildDiscountAmount < 0 || card.yearlyAdditionalChildDiscountAmount < 0) {
        throw new Error('Additional child discount amounts cannot be negative');
      }
      if (card.monthlyAdditionalChildDiscountAmount > (card.monthlyPrice * 100)) {
        throw new Error('Monthly additional child discount cannot be greater than the monthly plan price');
      }
      if (card.yearlyAdditionalChildDiscountAmount > (card.yearlyPrice * 100)) {
        throw new Error('Yearly additional child discount cannot be greater than the yearly plan price');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      // Validate pricing cards before sending
      validatePricingCards(pricingCards);

      const validatedCards = pricingCards.map(card => ({
        ...card,
        monthlyPrice: parseInt(card.monthlyPrice.toString()),
        yearlyPrice: parseInt(card.yearlyPrice.toString()),
        yearlyDiscountPercentage: parseInt(card.yearlyDiscountPercentage.toString()),
        monthlyAdditionalChildDiscountAmount: parseFloat(card.monthlyAdditionalChildDiscountAmount.toString()),
        yearlyAdditionalChildDiscountAmount: parseFloat(card.yearlyAdditionalChildDiscountAmount.toString())
      }));

      await api.updateDefaultPricing(validatedCards);
      setIsEditing(false);
      onUpdate();
      Swal.fire({
        title: 'Success!',
        text: 'Default pricing updated successfully',
        icon: 'success',
        confirmButtonColor: '#3B82F6'
      });
    } catch (error) {
      console.error('Error updating default pricing:', error);
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update default pricing',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Default Plan Pricing</h2>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchDefaultPricing();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit Pricing
              </button>
            )}
          </div>
        </div>
        {/* Billing Cycle Toggle */}
        <div className="flex space-x-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              billingCycle === 'monthly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
              billingCycle === 'yearly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 30%
            </span>
          </button>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingCards.map((card, index) => (
          <div
            key={card.type}
            className={`relative p-6 bg-white border rounded-lg ${
              card.isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'
            }`}
          >
            {card.isSelected && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Best Value
              </div>
            )}
            <div className="space-y-4">
              {/* Package Name */}
              {isEditing ? (
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  className="w-full text-lg font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
              )}

              {/* Description */}
              {isEditing ? (
                <textarea
                  value={card.description}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  className="w-full text-sm text-gray-500 border rounded p-2 focus:border-blue-500 focus:outline-none"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-500">{card.description}</p>
              )}

              {/* Subjects */}
              <div className="space-y-2">
                {card.subjects.map((subject) => (
                  <div key={subject} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {subject}
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900">₦</span>
                  {isEditing ? (
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="text"
                        value={formatNumber(billingCycle === 'monthly' ? card.monthlyPrice : card.yearlyPrice)}
                        onChange={(e) => handlePriceChange(index, billingCycle === 'monthly' ? 'monthlyPrice' : 'yearlyPrice', e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md h-12"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{billingCycle === 'monthly' ? '/month' : '/year'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="ml-1 text-2xl font-semibold text-gray-900">
                      {formatNumber(billingCycle === 'monthly' ? card.monthlyPrice : card.yearlyPrice)}
                    </span>
                  )}
                </div>

                {/* Discounts */}
                {isEditing && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    {/* Yearly Discount Percentage - Only show in yearly billing cycle */}
                    {billingCycle === 'yearly' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Yearly Discount (%)
                        </label>
                        <input
                          type="number"
                          value={card.yearlyDiscountPercentage}
                          onChange={(e) => handleDiscountChange(index, 'yearlyDiscountPercentage', e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md h-12"
                          min="0"
                          max="100"
                        />
                      </div>
                    )}

                    {/* Additional Child Discount - Show based on billing cycle */}
                    {billingCycle === 'monthly' ? (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Child Discount (₦)
                        </label>
                        <input
                          type="number"
                          value={card.monthlyAdditionalChildDiscountAmount}
                          onChange={(e) => handleDiscountChange(index, 'monthlyAdditionalChildDiscountAmount', e.target.value)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 sm:text-sm border-gray-300 rounded-md h-12"
                          placeholder="Enter amount"
                          min="0"
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Child Discount (₦)
                        </label>
                        <input
                          type="number"
                          value={card.yearlyAdditionalChildDiscountAmount}
                          onChange={(e) => handleDiscountChange(index, 'yearlyAdditionalChildDiscountAmount', e.target.value)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 sm:text-sm border-gray-300 rounded-md h-12"
                          placeholder="Enter amount"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefaultPricing;
