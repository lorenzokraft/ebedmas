import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import Swal from 'sweetalert2';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  grade_id: number;
  subject_id: number;
  topic_id: number;
  order_num: number;
  audio_url?: string;
}

const EditQuestion = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionRes, gradesRes, subjectsRes] = await Promise.all([
          api.get(`/api/admin/questions/${id}`),
          api.get('/api/admin/grades'),
          api.get('/api/admin/subjects')
        ]);

        setQuestion(questionRes.data);
        setGrades(gradesRes.data);
        setSubjects(subjectsRes.data);

        if (questionRes.data.subject_id) {
          const topicsRes = await api.get(`/api/admin/subjects/${questionRes.data.subject_id}/topics`);
          setTopics(topicsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch question data',
          icon: 'error',
          confirmButtonColor: '#EF4444',
        }).then(() => {
          navigate('/admin/questions');
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    try {
      await api.put(`/api/admin/questions/${id}`, question);

      Swal.fire({
        title: 'Success!',
        text: 'Question updated successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
      });

      navigate('/admin/questions');
    } catch (error) {
      console.error('Error updating question:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update question',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    if (!question) return;
    
    try {
      const response = await api.get(`/api/admin/subjects/${subjectId}/topics`);
      setTopics(response.data);
      setQuestion({
        ...question,
        subject_id: parseInt(subjectId),
        topic_id: 0 // Reset topic when subject changes
      });
    } catch (error) {
      console.error('Error fetching topics:', error);
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

  if (!question) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

        <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question Text */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={question.question_text}
                onChange={(e) => setQuestion({ ...question, question_text: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={4}
                required
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={question.question_type}
                onChange={(e) => setQuestion({ ...question, question_type: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Type</option>
                <option value="text">Text</option>
                <option value="draw">Draw</option>
                <option value="paint">Paint</option>
                <option value="drag">Drag</option>
                <option value="click">Click</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={question.grade_id}
                onChange={(e) => setQuestion({ ...question, grade_id: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Grade</option>
                {grades.map((grade: any) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={question.subject_id}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={question.topic_id}
                onChange={(e) => setQuestion({ ...question, topic_id: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Topic</option>
                {topics.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options (one per line)
              </label>
              <textarea
                value={question.options.join('\n')}
                onChange={(e) => setQuestion({ ...question, options: e.target.value.split('\n') })}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Correct Answer */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer
              </label>
              <input
                type="text"
                value={question.correct_answer}
                onChange={(e) => setQuestion({ ...question, correct_answer: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Explanation */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation
              </label>
              <textarea
                value={question.explanation}
                onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/questions')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Update Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion; 