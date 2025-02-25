import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Edit, Trash2 } from 'lucide-react';
import { sectionsApi } from '../../services/sections';
import Swal from 'sweetalert2';

interface Section {
  id: number;
  name: string;
  topic_name: string;
  subject_name: string;
  grade_name: string;
  created_by_name: string;
  created_at: string;
}

const ManageSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const data = await sectionsApi.getAllSections();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      Swal.fire('Error', 'Failed to fetch sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await sectionsApi.deleteSection(id);
        await fetchSections();
        Swal.fire('Deleted!', 'Section has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      Swal.fire('Error', 'Failed to delete section', 'error');
    }
  };

  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.topic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.grade_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Sections</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search sections..."
                className="px-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link
                to="/admin/sections/create"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <span>+</span> Add New Section
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSections.map((section) => (
                  <tr key={section.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{section.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{section.topic_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{section.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{section.grade_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{section.created_by_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(section.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/sections/edit/${section.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
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

export default ManageSections;
