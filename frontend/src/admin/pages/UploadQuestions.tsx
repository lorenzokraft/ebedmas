import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import Swal from 'sweetalert2';
import { Type, Sigma } from 'lucide-react';

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
  subject_id: number;
}

interface Section {
  id: number;
  name: string;
  topic_id: number;
}

interface QuestionForm {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  grade_id: number | '';
  subject_id: number | '';
  topic_id: number | '';
  section_id: number | '';
  order_num: number;
}

const UploadQuestions = () => {
  const [formData, setFormData] = useState<QuestionForm>({
    question_text: '',
    question_type: 'text',
    options: [''],
    correct_answer: '',
    explanation: '',
    grade_id: '',
    subject_id: '',
    topic_id: '',
    section_id: '',
    order_num: 0,
  });

  const [questionImages, setQuestionImages] = useState<File[]>([]);
  const [explanationImage, setExplanationImage] = useState<File | null>(null);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showFormatOptions, setShowFormatOptions] = useState(false);

  // Mathematical symbols organized by category
  const symbolCategories = [
    {
      name: "Basic Math Operators",
      symbols: ['+', '−', '×', '÷', '=', '≠', '±', '∓', '⋅', '∗', '⨯', '∕', '⁄', '⌿', '⟌']
    },
    {
      name: "Binary Operators",
      symbols: ['∧', '∨', '⊕', '⊗', '⊙', '⊘', '⊚', '⊛', '⊝', '⊞', '⊟', '⊠', '⊡', '◯', '⦁']
    },
    {
      name: "N-ary Operators",
      symbols: ['∏', '∐', '∑', '⋀', '⋁', '⋂', '⋃', '⨀', '⨁', '⨂', '⨃', '⨄', '⨅', '⨆', '⨉']
    },
    {
      name: "Comparison",
      symbols: ['<', '>', '≤', '≥', '≦', '≧', '≨', '≩', '≪', '≫', '≲', '≳', '≶', '≷', '⋚']
    },
    {
      name: "Sets",
      symbols: ['∈', '∉', '∊', '∋', '∌', '∍', '⊂', '⊃', '⊄', '⊅', '⊆', '⊇', '⊈', '⊉', '⊊']
    },
    {
      name: "Calculus",
      symbols: ['∫', '∬', '∭', '∮', '∯', '∰', '∱', '∲', '∳', '∂', '∇', '∆', 'δ', 'Δ', '∠']
    },
    {
      name: "Greek Letters",
      symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π']
    },
    {
      name: "Arrows",
      symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '↦', '↤', '↼']
    }
  ];

  const formatOptions = [
    { label: 'Bold', wrapper: ['<strong>', '</strong>'], icon: 'bold' },
    { label: 'Italic', wrapper: ['<em>', '</em>'], icon: 'italic' },
    { label: 'Underline', wrapper: ['<u>', '</u>'], icon: 'underline' },
    { label: 'Subscript', wrapper: ['<sub>', '</sub>'], icon: 'subscript' },
    { label: 'Superscript', wrapper: ['<sup>', '</sup>'], icon: 'superscript' },
    { label: 'New Line', wrapper: ['<br>', ''], icon: 'corner-down-right' },
    { label: 'Bullet Point', wrapper: ['<br>• ', ''], icon: 'circle-dot' },
    { label: 'Numbered List', wrapper: ['<br>1. ', ''], icon: 'list-ordered' },
    { label: 'Primary Color', wrapper: ['<span style="color: #4F46E5;">', '</span>'], icon: 'palette' },
    { label: 'Secondary Color', wrapper: ['<span style="color: #1D4ED8;">', '</span>'], icon: 'palette' },
    { label: 'Success Color', wrapper: ['<span style="color: #059669;">', '</span>'], icon: 'palette' },
    { label: 'Warning Color', wrapper: ['<span style="color: #D97706;">', '</span>'], icon: 'palette' },
    { label: 'Danger Color', wrapper: ['<span style="color: #DC2626;">', '</span>'], icon: 'palette' }
  ];

  const navigate = useNavigate();

  const handleQuestionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setQuestionImages(prev => [...prev, ...filesArray]);
    }
  };

  const handleExplanationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExplanationImage(e.target.files[0]);
    }
  };

  const removeQuestionImage = (index: number) => {
    setQuestionImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExplanationImage = () => {
    setExplanationImage(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      if (!formData.question_text || !formData.correct_answer || 
          !formData.grade_id || !formData.subject_id || 
          !formData.topic_id || !formData.section_id) {
        throw new Error('Please fill in all required fields');
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'options') {
            const formattedOptions = value.filter((opt: string) => opt.trim() !== '').map((opt: string, index: number) => ({
              id: index + 1,
              text: opt.trim(),
              isCorrect: false
            }));
            formDataToSend.append(key, JSON.stringify(formattedOptions));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      questionImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      if (explanationImage) {
        formDataToSend.append('explanation_image', explanationImage);
      }

      const response = await api.post('/api/admin/questions', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({
        question_text: '',
        question_type: 'text',
        options: [''],
        correct_answer: '',
        explanation: '',
        grade_id: '',
        subject_id: '',
        topic_id: '',
        section_id: '',
        order_num: 0,
      });
      setQuestionImages([]);
      setExplanationImage(null);

      Swal.fire({
        title: 'Success!',
        text: 'Question added successfully!',
        icon: 'success',
        confirmButtonColor: '#10B981',
      });

      navigate('/admin/questions');
    } catch (error: any) {
      console.error('Error adding question:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add question';
      setError(errorMessage);
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const insertSymbol = (symbol: string) => {
    const textArea = document.getElementById('question-text') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = formData.question_text;
      const newText = text.substring(0, start) + symbol + text.substring(end);
      setFormData({ ...formData, question_text: newText });
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    }
    setShowSymbolPicker(false);
  };

  const formatText = (option: { label: string; wrapper: string[] }) => {
    const textarea = document.getElementById('question-text') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.question_text.substring(start, end);
    
    const newText = 
      formData.question_text.substring(0, start) +
      option.wrapper[0] + selectedText + option.wrapper[1] +
      formData.question_text.substring(end);
    
    setFormData({ ...formData, question_text: newText });
    
    // Keep focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + option.wrapper[0].length,
        end + option.wrapper[0].length
      );
    }, 0);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [gradesRes, subjectsRes] = await Promise.all([
          api.get('/api/admin/grades'),
          api.get('/api/admin/subjects')
        ]);

        setGrades(gradesRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load required data');
        Swal.fire('Error!', 'Failed to load required data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (formData.subject_id && typeof formData.subject_id === 'number' && formData.subject_id > 0) {
        try {
          const response = await api.get(`/api/admin/subjects/${formData.subject_id}/topics`);
          setTopics(response.data);
          setFormData(prev => ({ ...prev, topic_id: '', section_id: '' }));
        } catch (error) {
          console.error('Error fetching topics:', error);
          setError('Failed to load topics');
        }
      } else {
        setTopics([]);
      }
    };

    fetchTopics();
  }, [formData.subject_id]);

  useEffect(() => {
    const fetchSections = async () => {
      if (formData.topic_id && typeof formData.topic_id === 'number' && formData.topic_id > 0) {
        try {
          const response = await api.get(`/api/admin/topics/${formData.topic_id}/sections`);
          setSections(response.data);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setError('Failed to load sections');
        }
      } else {
        setSections([]);
      }
    };

    fetchSections();
  }, [formData.topic_id]);

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
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Upload New Question</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative mb-8">
              <textarea
                id="question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[150px] p-4"
                placeholder="Enter your question here..."
              />
              <div className="absolute bottom-4 right-4 flex space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFormatOptions(!showFormatOptions)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Format Text
                  </button>
                  {showFormatOptions && (
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {formatOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => formatText(option)}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <span className="w-6">
                              {option.icon === 'palette' ? (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ 
                                    backgroundColor: option.wrapper[0].match(/color: ([^;]+)/)?.[1] || 'currentColor'
                                  }} 
                                />
                              ) : option.icon === 'corner-down-right' ? (
                                <span className="text-gray-500">↵</span>
                              ) : option.icon === 'circle-dot' ? (
                                <span className="text-gray-500">•</span>
                              ) : option.icon === 'list-ordered' ? (
                                <span className="text-gray-500">1.</span>
                              ) : null}
                            </span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Sigma className="w-4 h-4 mr-2" />
                    Insert Symbol
                  </button>
                  {showSymbolPicker && (
                    <div className="absolute top-full right-0 mt-2 w-[480px] max-h-[400px] overflow-y-auto p-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      {symbolCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4 last:mb-0">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h3>
                          <div className="grid grid-cols-10 gap-2">
                            {category.symbols.map((symbol, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => insertSymbol(symbol)}
                                className="inline-flex items-center justify-center w-10 h-10 text-base border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors duration-150"
                                title={symbol}
                              >
                                {symbol}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById('question-image')?.click()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Upload Image
                </button>
                <input
                  type="file"
                  id="question-image"
                  multiple
                  accept="image/*"
                  onChange={handleQuestionImagesChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Question Type */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Question Type
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                >
                  <option value="text">Text</option>
                  <option value="draw">Draw</option>
                  <option value="paint">Paint</option>
                  <option value="drag">Drag</option>
                  <option value="click">Click</option>
                </select>
              </label>
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Options
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Option
                </button>
              </label>
            </div>

            {/* Correct Answer */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Correct Answer
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  required
                />
              </label>
            </div>

            {/* Explanation with Upload Button */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Explanation
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={4}
                placeholder="Explain the answer..."
              />
              <div className="absolute bottom-2 right-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleExplanationImageChange}
                  className="hidden"
                  id="explanationImage"
                />
                <label
                  htmlFor="explanationImage"
                  className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  Upload Image
                </label>
              </div>
              {explanationImage && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={URL.createObjectURL(explanationImage)}
                    alt="Explanation Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button
                    onClick={removeExplanationImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Grade Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Grade
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.grade_id}
                  onChange={(e) => setFormData({ ...formData, grade_id: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Subject Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Subject
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Topic Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Topic
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.topic_id}
                  onChange={(e) => setFormData({ ...formData, topic_id: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Section Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Section *
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
                  required
                  disabled={!formData.topic_id}
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              {!formData.topic_id && (
                <p className="mt-1 text-sm text-gray-500">Please select a topic first</p>
              )}
            </div>

            {/* Order Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Order Number
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1"
                  value={formData.order_num}
                  onChange={(e) => setFormData({ ...formData, order_num: Number(e.target.value) })}
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadQuestions;