import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { sectionsApi } from '../../services/sections';
import Swal from 'sweetalert2';
import { Loader2, ChevronLeft } from 'lucide-react';

interface Grade {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
}

const CreateSection = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade_id: '',
    subject_id: '',
    topic_id: ''
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (formData.grade_id) {
      fetchSubjects(formData.grade_id);
      setFormData(prev => ({ ...prev, subject_id: '', topic_id: '' }));
      setSubjects([]);
      setTopics([]);
    }
  }, [formData.grade_id]);

  useEffect(() => {
    if (formData.subject_id) {
      fetchTopics(formData.subject_id);
      setFormData(prev => ({ ...prev, topic_id: '' }));
      setTopics([]);
    }
  }, [formData.subject_id]);

  const fetchGrades = async () => {
    setLoadingGrades(true);
    try {
      const data = await sectionsApi.getGrades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
      Swal.fire('Error', 'Failed to fetch grades', 'error');
    } finally {
      setLoadingGrades(false);
    }
  };

  const fetchSubjects = async (gradeId: string) => {
    setLoadingSubjects(true);
    try {
      const data = await sectionsApi.getSubjects(gradeId);
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      Swal.fire('Error', 'Failed to fetch subjects', 'error');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    setLoadingTopics(true);
    try {
      const data = await sectionsApi.getTopics(subjectId);
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
      Swal.fire('Error', 'Failed to fetch topics', 'error');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      Swal.fire('Error', 'Please enter a section name', 'error');
      return;
    }

    setLoading(true);
    try {
      await sectionsApi.createSection({
        name: formData.name.trim(),
        topic_id: parseInt(formData.topic_id)
      });
      Swal.fire({
        title: 'Success!',
        text: 'Section created successfully',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Create Another',
        cancelButtonText: 'Go to Sections List'
      }).then((result) => {
        if (result.isConfirmed) {
          setFormData({
            name: '',
            grade_id: '',
            subject_id: '',
            topic_id: ''
          });
        } else {
          navigate('/admin/sections');
        }
      });
    } catch (error) {
      console.error('Error creating section:', error);
      Swal.fire('Error', 'Failed to create section', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6 flex items-center">
              <button
                onClick={() => navigate('/admin/sections')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to Sections"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Section</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter section name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <div className="relative">
                      <select
                        name="grade_id"
                        value={formData.grade_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        required
                        disabled={loadingGrades}
                      >
                        <option value="">Select Grade</option>
                        {grades && grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </select>
                      {loadingGrades && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <div className="relative">
                      <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        required
                        disabled={!formData.grade_id || loadingSubjects}
                      >
                        <option value="">Select Subject</option>
                        {subjects && subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                      {loadingSubjects && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                    {!formData.grade_id && (
                      <p className="mt-1 text-sm text-gray-500">Please select a grade first</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                    <div className="relative">
                      <select
                        name="topic_id"
                        value={formData.topic_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        required
                        disabled={!formData.subject_id || loadingTopics}
                      >
                        <option value="">Select Topic</option>
                        {topics && topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>{topic.name}</option>
                        ))}
                      </select>
                      {loadingTopics && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                    {!formData.subject_id && (
                      <p className="mt-1 text-sm text-gray-500">Please select a subject first</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/sections')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || loadingGrades || loadingSubjects || loadingTopics}
                  className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Section'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSection;
