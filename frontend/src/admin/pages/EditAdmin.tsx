import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import Swal from 'sweetalert2';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

const EditAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get(`/api/admin/admins/${id}`);
        const adminData = response.data;
        setAdmin(adminData);
        setName(adminData.name);
        setEmail(adminData.email);
        setRole(adminData.role);
      } catch (error: any) {
        console.error('Error fetching admin:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to fetch administrator data',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        }).then(() => {
          navigate('/admin/users/manage-admins');
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        name,
        email,
        role
      };

      if (password) {
        updateData.password = password;
      }

      await api.put(`/api/admin/admins/${id}`, updateData);

      Swal.fire({
        title: 'Success!',
        text: 'Administrator updated successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
      });

      navigate('/admin/users/manage-admins');
    } catch (error: any) {
      console.error('Error updating admin:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update administrator',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Edit Administrator</h1>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    minLength={6}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave blank to keep current password
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/users/manage-admins')}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdmin; 