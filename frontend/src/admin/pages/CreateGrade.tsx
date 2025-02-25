import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import api from '../services/api';

const CreateGrade = () => {
  const [gradeName, setGradeName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateGradeName = (name: string) => {
    const normalizedName = name.trim().toLowerCase();
    
    // Check for Reception
    if (normalizedName === 'reception' || normalizedName === 'r') {
      return true;
    }
    
    // Remove any leading "Year" or "Grade" and trim spaces
    const cleanName = normalizedName.replace(/^(year|grade)\s*/i, '');
    
    // Check if it's a number between 1 and 13
    const number = parseInt(cleanName);
    if (isNaN(number) || number < 1 || number > 13) {
      return false;
    }
    
    return true;
  };

  const formatGradeName = (name: string) => {
    const normalizedName = name.trim().toLowerCase();
    
    // Handle Reception
    if (normalizedName === 'reception' || normalizedName === 'r') {
      return 'Reception';
    }
    
    // Extract number and format as "Year X"
    const number = normalizedName.replace(/^(year|grade)\s*/i, '');
    return `Year ${number}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateGradeName(gradeName)) {
      Swal.fire({
        title: 'Invalid Grade',
        text: 'Please enter either "Reception" or a year number between 1 and 13 (e.g., "5" or "Year 5")',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const formattedName = formatGradeName(gradeName);

    setLoading(true);
    try {
      const response = await api.post('/api/admin/grades', { name: formattedName });
      
      if (response.status === 201) {
        await Swal.fire({
          title: 'Success!',
          text: 'Grade created successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        navigate('/admin/grades');
      }
    } catch (error: any) {
      console.error('Error creating grade:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to create grade. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Create New Grade</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Grade Name
                </label>
                <input
                  type="text"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  placeholder="Enter 'Reception' or a year number (e.g., 5 or Year 5)"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  Enter either "Reception" or a year number between 1 and 13. You can optionally prefix with "Year".
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Grade'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/grades')}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateGrade;