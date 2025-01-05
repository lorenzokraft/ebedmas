import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import api from '../services/api';

const CreateGrade = () => {
  const [gradeName, setGradeName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/admin/grades', { name: gradeName });
      
      if (response.status === 201) {
        await Swal.fire({
          title: 'Success!',
          text: 'Grade created successfully',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        navigate('/admin/grades');
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create grade. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
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
                  <input
                    type="text"
                    value={gradeName}
                    onChange={(e) => setGradeName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                    placeholder="Enter grade name"
                    required
                  />
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create Grade
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