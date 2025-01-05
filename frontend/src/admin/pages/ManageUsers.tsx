import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  admins: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  isSubscribed: boolean;
  created_at: string;
  last_login: string | null;
}

interface PaginatedUserResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const ManageUsers = ({ userType = "admin" }: { userType?: "admin" | "user" }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const adminsPerPage = 10;
  const itemsPerPage = 10;
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const fetchData = async (page: number = 1) => {
    try {
      if (userType === 'admin') {
        const response = await api.get<PaginatedResponse>(
          `/api/admin/admins?page=${page}&limit=${adminsPerPage}`
        );
        setAdmins(response.data.admins);
        setTotalPages(response.data.totalPages);
        setTotalAdmins(response.data.total);
      } else {
        const response = await api.get<PaginatedUserResponse>(
          `/api/admin/users?page=${page}&limit=${itemsPerPage}`
        );
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.total);
      }
      setCurrentPage(page);
      setError('');
    } catch (error: any) {
      console.error(`Error fetching ${userType}s:`, error);
      setError(error.response?.data?.message || `Failed to fetch ${userType}s`);
      Swal.fire({
        title: 'Error!',
        text: `Failed to fetch ${userType}s`,
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, userType]);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    console.log('Admin user string from localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Parsed admin user object:', user);
        console.log('Admin user role:', user.role);
        setCurrentUserRole(user.role);
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        setCurrentUserRole('');
      }
    } else {
      console.log('No admin user data found in localStorage');
      setCurrentUserRole('');
    }
  }, []);

  const isSuperAdmin = currentUserRole === 'super_admin';
  console.log('Is Super Admin:', isSuperAdmin);

  useEffect(() => {
    console.log('Current user role:', currentUserRole);
    console.log('Is Super Admin:', isSuperAdmin);
  }, [currentUserRole]);

  const handleDelete = async (id: number) => {
    try {
      if (!isSuperAdmin) {
        Swal.fire({
          title: 'Error!',
          text: 'Only super administrators can delete admins',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

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
        await api.delete(`/api/admin/admins/${id}`);
        await fetchData(currentPage);
        Swal.fire('Deleted!', 'Administrator has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      Swal.fire('Error!', 'Failed to delete administrator.', 'error');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      if (!isSuperAdmin) {
        Swal.fire({
          title: 'Error!',
          text: 'Only super administrators can update admin status',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        });
        return;
      }

      await api.put(`/api/admin/admins/${id}/status`, { status: newStatus });
      await fetchData(currentPage);
      Swal.fire('Updated!', 'Administrator status has been updated.', 'success');
    } catch (error) {
      console.error('Error updating admin status:', error);
      Swal.fire('Error!', 'Failed to update administrator status.', 'error');
    }
  };

  const handleUserStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/api/admin/users/${id}/status`, { status: newStatus });
      await fetchData(currentPage);
      Swal.fire('Updated!', 'User status has been updated.', 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      Swal.fire('Error!', 'Failed to update user status.', 'error');
    }
  };

  const Pagination = () => (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * adminsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * adminsPerPage, totalAdmins)}
            </span>{' '}
            of <span className="font-medium">{totalAdmins}</span> administrators
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === idx + 1
                    ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {userType === 'admin' ? 'Manage Administrators' : 'Manage Users'}
            </h1>
            {userType === 'admin' && isSuperAdmin && (
              <Link
                to="/admin/users/create-admin"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Admin
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {userType === 'admin' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userType === 'admin' ? (
                    admins.map((admin, index) => (
                      <tr key={admin.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {admin.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {admin.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={admin.status}
                            onChange={(e) => handleStatusChange(admin.id, e.target.value)}
                            className={`text-sm rounded-full px-3 py-1 font-semibold ${
                              admin.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                            disabled={currentUserRole !== 'super_admin'}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(admin.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex justify-center space-x-3">
                            {currentUserRole === 'super_admin' && (
                              <>
                                <Link
                                  to={`/admin/users/edit-admin/${admin.id}`}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                  title="Edit Admin"
                                >
                                  <Edit className="w-5 h-5" />
                                </Link>
                                {admin.id !== parseInt(JSON.parse(localStorage.getItem('user') || '{}').id) && (
                                  <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    title="Delete Admin"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.isSubscribed ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Subscribed
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Free
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? format(new Date(user.last_login), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.status}
                            onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                            className={`text-sm rounded-full px-3 py-1 font-semibold ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                              className={`text-sm rounded-full px-3 py-1 font-semibold ${
                                user.status === 'active'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers; 