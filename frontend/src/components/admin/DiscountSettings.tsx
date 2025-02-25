import React, { useState } from 'react';
import api from '../../services/api';

const DiscountSettings: React.FC = () => {
  const [discountAmount, setDiscountAmount] = useState<number>(30);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert pounds to pence for the API
      const amountInPence = Math.round(discountAmount * 100);
      await api.updateAdditionalChildDiscount(amountInPence);
      setMessage('Additional child discount updated successfully!');
      setError('');
    } catch (err) {
      setError('Failed to update discount. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Additional Child Discount Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700">
            Discount Amount (£)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              name="discountAmount"
              id="discountAmount"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Discount
        </button>
      </form>
      {message && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default DiscountSettings;
