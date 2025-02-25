import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Add auth token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sectionsApi = {
  // Get all sections
  getAllSections: async () => {
    const response = await axios.get(`${API_BASE_URL}/sections`);
    return response.data;
  },

  // Create a new section
  createSection: async (sectionData: { name: string; topic_id: number }) => {
    const response = await axios.post(`${API_BASE_URL}/sections`, sectionData);
    return response.data;
  },

  // Get a section by ID
  getSectionById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/sections/${id}`);
    return response.data;
  },

  // Update a section
  updateSection: async (id: number, sectionData: { name: string; topic_id: number }) => {
    const response = await axios.put(`${API_BASE_URL}/sections/${id}`, sectionData);
    return response.data;
  },

  // Delete a section
  deleteSection: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/sections/${id}`);
    return response.data;
  },

  // Get sections by topic ID
  getSectionsByTopic: async (topicId: number) => {
    const response = await axios.get(`${API_BASE_URL}/topics/${topicId}/sections`);
    return response.data;
  },

  // Get all grades
  getGrades: async () => {
    const response = await axios.get(`${API_BASE_URL}/grades`);
    return response.data;
  },

  // Get subjects by grade
  getSubjects: async (gradeId: string) => {
    const response = await axios.get(`${API_BASE_URL}/grades/${gradeId}/subjects`);
    return response.data;
  },

  // Get topics by subject
  getTopics: async (subjectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/topics`);
    return response.data;
  }
};
