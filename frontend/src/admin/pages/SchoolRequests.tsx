import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

// Create a dedicated admin API instance
const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface SchoolRequest {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  position: string;
  school_name: string;
  address: string;
  town_city: string;
  lga: string;
  country: string;
  school_type: string;
  subjects: string;
  student_year_levels: string;
  number_of_students: number;
  number_of_teachers: number;
  implementation_plan: string;
  marketing_consent: number;
  created_at: string;
  status: string;
  notes: string;
}

const SchoolRequests: React.FC = () => {
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests...');
      console.log('Admin token:', localStorage.getItem('adminToken'));
      const response = await adminApi.get('/quote-requests');
      console.log('Response:', response.data);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Swal.fire('Error', 'Failed to fetch school requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    const { value: formValues } = await Swal.fire({
      title: 'Update Request Status',
      html: `
        <div class="space-y-4">
          <div class="relative">
            <select id="status" class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>
                🕒 Pending Review
              </option>
              <option value="contacted" ${currentStatus === 'contacted' ? 'selected' : ''}>
                📞 Contacted
              </option>
              <option value="approved" ${currentStatus === 'approved' ? 'selected' : ''}>
                ✅ Approved
              </option>
              <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>
                ❌ Rejected
              </option>
            </select>
          </div>
          
          <div class="relative">
            <textarea 
              id="notes" 
              placeholder="Add notes about this request..." 
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
            ></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#6B7280',
      customClass: {
        confirmButton: 'px-6 py-3 rounded-lg text-sm font-medium',
        cancelButton: 'px-6 py-3 rounded-lg text-sm font-medium'
      },
      focusConfirm: false,
      preConfirm: () => {
        const status = (document.getElementById('status') as HTMLSelectElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
        
        if (!status) {
          Swal.showValidationMessage('Please select a status');
          return false;
        }
        
        return { status, notes };
      }
    });

    if (formValues) {
      try {
        await adminApi.put(`/quote-requests/${id}/status`, formValues);
        Swal.fire({
          title: 'Status Updated!',
          text: 'The request status has been successfully updated.',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          confirmButtonText: 'OK'
        });
        fetchRequests();
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire({
          title: 'Update Failed',
          text: 'There was an error updating the request status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const viewDetails = (request: SchoolRequest) => {
    const subjects = JSON.parse(request.subjects);
    const subjectsList = Object.entries(subjects)
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');

    Swal.fire({
      title: `${request.school_name}`,
      html: `
        <div class="text-left space-y-6 px-4">
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Name</p>
                <p class="text-sm text-gray-900">${request.name}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Email</p>
                <p class="text-sm text-gray-900">${request.email}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Phone</p>
                <p class="text-sm text-gray-900">${request.phone_number}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Position</p>
                <p class="text-sm text-gray-900">${request.position}</p>
              </div>
            </div>
          </div>
          
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">School Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Type</p>
                <p class="text-sm text-gray-900">${request.school_type}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Location</p>
                <p class="text-sm text-gray-900">${request.town_city}, ${request.country}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm font-medium text-gray-500">Address</p>
                <p class="text-sm text-gray-900">${request.address}</p>
              </div>
            </div>
          </div>
          
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Implementation Details</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm font-medium text-gray-500">Subjects Interested In</p>
                <p class="text-sm text-gray-900">${subjectsList}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Year Levels</p>
                <p class="text-sm text-gray-900">${request.student_year_levels}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Number of Students</p>
                  <p class="text-sm text-gray-900">${request.number_of_students}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Number of Teachers</p>
                  <p class="text-sm text-gray-900">${request.number_of_teachers}</p>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Implementation Plan</p>
                <p class="text-sm text-gray-900">${request.implementation_plan || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm font-medium text-gray-500">Marketing Consent</p>
                <p class="text-sm text-gray-900">${request.marketing_consent ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Notes</p>
                <p class="text-sm text-gray-900">${request.notes || 'No notes added'}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Current Status</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }">
                  ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        container: 'font-sans',
        popup: 'rounded-xl'
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">School Quote Requests</h1>
          
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.school_name}</div>
                      <div className="text-sm text-gray-500">{request.town_city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {request.school_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDetails(request)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, request.status)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolRequests;
