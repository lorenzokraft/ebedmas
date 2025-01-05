import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import { Plus, Edit, Trash2, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  grade_name: string;
  subject_name: string;
  topic_name: string;
  created_at: string;
  created_by_name: string;
  question_image?: string;
}

interface PaginatedResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const ManageQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const questionsPerPage = 10;

  const toggleRow = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const fetchQuestions = async (page: number = 1) => {
    try {
      const response = await api.get<PaginatedResponse>(`/api/admin/questions?page=${page}&limit=${questionsPerPage}`);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
      setTotalQuestions(response.data.total);
      setCurrentPage(page);
      setError('');
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.message || 'Failed to fetch questions');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch questions',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    try {
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
        await api.delete(`/api/admin/questions/${id}`);
        await fetchQuestions();
        Swal.fire('Deleted!', 'Question has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      Swal.fire('Error!', 'Failed to delete question.', 'error');
    }
  };

  const handleView = (question: Question) => {
    Swal.fire({
      title: 'Question Details',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <p class="font-bold text-lg mb-2">Question:</p>
            <p class="bg-gray-50 p-3 rounded">${question.question_text}</p>
          </div>
          
          ${question.question_image ? `
            <div class="mb-4">
              <p class="font-bold text-lg mb-2">Question Image:</p>
              <img src="${question.question_image}" alt="Question" class="max-w-full h-auto rounded-lg shadow-md" />
            </div>
          ` : ''}
          
          <div class="mb-4">
            <p class="font-bold text-lg mb-2">Options:</p>
            <ul class="list-disc pl-5 bg-gray-50 p-3 rounded">
              ${question.options.map(opt => `<li class="mb-1">${opt}</li>`).join('')}
            </ul>
          </div>
          
          <div class="mb-4">
            <p class="font-bold text-lg mb-2">Correct Answer:</p>
            <p class="bg-green-50 p-3 rounded text-green-700">${question.correct_answer}</p>
          </div>
          
          <div class="mb-4">
            <p class="font-bold text-lg mb-2">Explanation:</p>
            <p class="bg-gray-50 p-3 rounded">${question.explanation || 'No explanation provided'}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <p class="font-bold">Grade:</p>
              <p>${question.grade_name}</p>
            </div>
            <div>
              <p class="font-bold">Subject:</p>
              <p>${question.subject_name}</p>
            </div>
            <div>
              <p class="font-bold">Topic:</p>
              <p>${question.topic_name}</p>
            </div>
            <div>
              <p class="font-bold">Type:</p>
              <p class="capitalize">${question.question_type}</p>
            </div>
          </div>
        </div>
      `,
      width: '800px',
      confirmButtonColor: '#3B82F6',
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      }
    });
  };

  const Pagination = () => (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
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
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
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
            Showing <span className="font-medium">{((currentPage - 1) * questionsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * questionsPerPage, totalQuestions)}
            </span>{' '}
            of <span className="font-medium">{totalQuestions}</span> questions
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'cursor-not-allowed' : 'hover:text-gray-700'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
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
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed' : 'hover:text-gray-700'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
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
            <h1 className="text-2xl font-bold text-gray-800">Manage Questions</h1>
            <Link
              to="/admin/questions/upload"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Question
            </Link>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
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
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No questions found. Create your first question!
                      </td>
                    </tr>
                  ) : (
                    questions.map((question, index) => (
                      <React.Fragment key={question.id}>
                        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm text-gray-900 cursor-pointer" onClick={() => toggleRow(question.id)}>
                            <div className="flex items-center">
                              {expandedRows.includes(question.id) ? (
                                <ChevronUp className="w-4 h-4 mr-2" />
                              ) : (
                                <ChevronDown className="w-4 h-4 mr-2" />
                              )}
                              {expandedRows.includes(question.id) 
                                ? question.question_text
                                : question.question_text.length > 100 
                                  ? `${question.question_text.substring(0, 100)}...`
                                  : question.question_text
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {question.question_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.grade_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.subject_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.topic_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {question.created_by_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(question.created_at), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => handleView(question)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <Link
                                to={`/admin/questions/edit/${question.id}`}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(question.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows.includes(question.id) && (
                          <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td colSpan={8} className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <p className="font-semibold mb-2">Full Question:</p>
                                <p className="mb-4">{question.question_text}</p>
                                <p className="font-semibold mb-2">Options:</p>
                                <ul className="list-disc pl-5 mb-4">
                                  {question.options.map((option, idx) => (
                                    <li key={idx}>{option}</li>
                                  ))}
                                </ul>
                                <p className="font-semibold mb-2">Correct Answer:</p>
                                <p className="text-green-600 mb-4">{question.correct_answer}</p>
                                {question.explanation && (
                                  <>
                                    <p className="font-semibold mb-2">Explanation:</p>
                                    <p>{question.explanation}</p>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

export default ManageQuestions; 