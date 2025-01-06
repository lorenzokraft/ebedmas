import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { Plus, Edit, Trash2, BookOpen, GraduationCap } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

interface Subject {
  id: number;
  name: string;
  topicCount: number;
  questionCount: number;
}

interface Grade {
  id: number;
  name: string;
  subjects: Subject[];
  total_topics: number;
  total_questions: number;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

const ManageGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/grades');
      setGrades(response.data);
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      setError(error.response?.data?.message || 'Failed to fetch grades. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this! All questions in this grade will also be deleted.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await api.delete(`/api/admin/grades/${id}`);
        await fetchGrades();
        Swal.fire('Deleted!', 'Grade has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      Swal.fire('Error!', 'Failed to delete grade.', 'error');
    }
  };

  const handleEdit = async (grade: Grade) => {
    try {
      const { value: newName } = await Swal.fire({
        title: 'Edit Grade',
        input: 'text',
        inputLabel: 'Grade Name',
        inputValue: grade.name,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Grade name cannot be empty!';
          }
          return null;
        }
      });

      if (newName) {
        await api.put(`/api/admin/grades/${grade.id}`, { name: newName });
        await fetchGrades();
        Swal.fire('Updated!', 'Grade has been updated.', 'success');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      Swal.fire('Error!', 'Failed to update grade.', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Manage Grades</h1>
          </div>
          <Link
            to="/admin/grades/create"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Grade
          </Link>
        </div>

        <div className="grid gap-6">
          {grades.map((grade) => (
            <div key={grade.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-semibold">Year {grade.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(grade)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(grade.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grade.subjects?.map((subject) => (
                  <div key={subject.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">{subject.name}</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>Topics:</span>
                        <span className="font-medium">{subject.topicCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span className="font-medium">{subject.questionCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500 flex gap-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {grade.total_topics || 0} Total Topics
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {grade.total_questions || 0} Total Questions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageGrades;