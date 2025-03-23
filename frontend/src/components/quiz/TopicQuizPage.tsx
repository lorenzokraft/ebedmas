// This is our new component for topic-specific quizzes
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';
import swal from 'sweetalert';
import { Volume2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import axios from 'axios';

interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  content: string;
  type: 'text' | 'draw' | 'paint' | 'drag' | 'click';
  options?: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
  questionImages?: string[];
  explanationImage?: string;
  images?: string;
  audio_url?: string;
}

const TopicQuizPage = ({ logout }: { logout: () => void }) => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [isPaused, setIsPaused] = useState(false);
  const [dragItems, setDragItems] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  const lastPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  // Define handleNextQuestion early since it's used by handleTimeUp
  const handleNextQuestion = async () => {
    try {
      const timeSpentOnQuestion = 300 - timer;
      
      // Only save progress if an answer was selected
      if (selectedAnswer) {
        await saveQuizProgress(selectedAnswer, timeSpentOnQuestion);
      }

      // Move to next question regardless of answer
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setError('');
        setTimer(300); // Reset timer for next question
        setIsAnswerSubmitted(false); // Reset submission state
        setIsCorrect(null); // Reset correct/incorrect state
        setDroppedItems([]); // Reset drag items
        
        // Initialize drag items if next question is drag type
        const nextQuestion = questions[currentQuestionIndex + 1];
        if (nextQuestion?.type === 'drag' && nextQuestion.options) {
          setDragItems(nextQuestion.options.map(opt => opt.text));
        }
      } else {
        handleQuizComplete();
      }
    } catch (error) {
      console.error('Error in handleNextQuestion:', error);
      setError('Failed to proceed to next question. Please try again.');
    }
  };

  // Function to handle when time is up
  const handleTimeUp = () => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      // Show alert that time is up
      swal({
        title: "Time's Up!",
        text: "You ran out of time for this question.",
        icon: "warning",
        buttons: {
          confirm: {
            text: "Next Question",
            value: true,
            visible: true,
            className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg",
          }
        }
      }).then(() => {
        // Move to next question
        handleNextQuestion();
      });

      // Update score (subtract points for missed question)
      setScore(prevScore => Math.max(0, prevScore - 5));
      
      // Reset for next question
      setSelectedAnswer('');
      setIsAnswerSubmitted(true);
      setIsCorrect(false);
      
    } catch (error) {
      console.error('Error handling time up:', error);
    }
  };

  useEffect(() => {
    if (!isPaused && !isAnswerSubmitted) {
      const interval = setInterval(() => {
        setTimer(prev => {
          // If timer reaches 0, auto-submit as a failed attempt
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, isAnswerSubmitted, currentQuestionIndex]);

  useEffect(() => {
    if (!isPaused && !isAnswerSubmitted) {
      const interval = setInterval(() => {
        setTimer(prev => {
          // If timer reaches 0, auto-submit as a failed attempt
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, isAnswerSubmitted, currentQuestionIndex]);

  // Reset states when moving to a new question
  useEffect(() => {
    // Reset timer and states for new question
    setTimer(300);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setSelectedAnswer('');
    setDroppedItems([]);
    setError('');

    // Initialize drag items if current question is drag type
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.type === 'drag' && currentQuestion.options) {
      setDragItems(currentQuestion.options.map(opt => opt.text));
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await publicApi.get(`/questions/topic/${topicId}`);
        console.log('API Response:', {
          status: response.status,
          data: response.data
        });
        
        // Process the questions
        const fetchedQuestions = response.data.map(question => {
          // Log the raw question data
          console.log('Raw question data:', {
            id: question.id,
            content: question.content,
            type: question.type,
            options: question.options,
            correctAnswer: question.correctAnswer,
            images: question.images,
            explanation_image: question.explanation_image
          });
          
          // Process options if they exist
          let processedOptions = [];
          if (question.options) {
            try {
              if (typeof question.options === 'string') {
                processedOptions = JSON.parse(question.options).map((opt: any) => ({
                  id: opt.id || Math.random(),
                  text: typeof opt === 'object' ? opt.text : opt,
                  isCorrect: opt.isCorrect || false
                }));
              } else if (Array.isArray(question.options)) {
                processedOptions = question.options.map((opt: any) => ({
                  id: opt.id || Math.random(),
                  text: typeof opt === 'object' ? opt.text : opt,
                  isCorrect: opt.isCorrect || false
                }));
              }
              console.log('Processed options:', processedOptions);
            } catch (e) {
              console.error('Error parsing options:', e);
            }
          }

          // Process images if they exist
          let processedImages = [];
          if (question.images) {
            console.log('Raw images value:', question.images);
            console.log('Images type:', typeof question.images);
            
            try {
              // Handle both string and array formats
              if (typeof question.images === 'string') {
                processedImages = JSON.parse(question.images);
                console.log('Parsed images from string:', processedImages);
              } else if (Array.isArray(question.images)) {
                processedImages = question.images;
                console.log('Images already in array format:', processedImages);
              }
            } catch (e) {
              console.error('Error parsing images:', e);
              processedImages = question.images;
              console.log('Using raw images value:', processedImages);
            }
          }

          return {
            id: question.id,
            content: question.content,
            type: question.type,
            options: processedOptions,
            correctAnswer: question.correctAnswer,
            images: processedImages,
            explanation_image: question.explanation_image
          };
        });

        console.log('Final questions array:', fetchedQuestions);
        setQuestions(fetchedQuestions);

        // Initialize drag items if first question is drag type
        if (fetchedQuestions[0]?.type === 'drag' && fetchedQuestions[0].options) {
          setDragItems(fetchedQuestions[0].options.map(opt => opt.text));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
        setLoading(false);
      }
    };

    if (topicId) {
      fetchQuestions();
    }
  }, [topicId]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = penColor;
        context.lineWidth = penSize;
        contextRef.current = context;
      }
    }
  }, [isDrawingMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    target.style.backgroundColor = '#eef2ff';
    target.style.borderColor = '#818cf8';
    
    if (draggedIndex !== null && dragItems[draggedIndex]) {
      const item = dragItems[draggedIndex];
      setDroppedItems([...droppedItems, item]);
      setDragItems(dragItems.filter((_, i) => i !== draggedIndex));
      setDraggedIndex(null);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const submitAnswer = async (questionId: number, answer: string) => {
    try {
      console.log('Submitting answer:', { questionId, answer });
      const response = await publicApi.post('/questions/answer', {
        questionId,
        answer
      });
      console.log('Submit response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in submitAnswer:', error);
      throw error;
    }
  };

  const saveQuizProgress = async (answer: string, questionTimeSpent: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correctAnswer;
      const score = isCorrect ? 10 : 0;

      console.log('Saving quiz progress:', {
        topic_id: Number(topicId),
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        time_spent: Math.max(0, Math.min(questionTimeSpent, 300)), // Clamp between 0-300 seconds
        score: score,
        answer: answer // Save the user's answer
      });

      await axios.post('http://localhost:5000/api/quizzes/progress', {
        topic_id: Number(topicId),
        question_id: currentQuestion.id,
        is_correct: isCorrect,
        time_spent: Math.max(0, Math.min(questionTimeSpent, 300)), // Clamp between 0-300 seconds
        score: score,
        answer: answer // Save the user's answer for review
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Quiz progress saved successfully');
    } catch (error) {
      console.error('Error saving quiz progress:', error);
      // Don't throw error to prevent blocking question progression
      // Just log it and let the user continue
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer && droppedItems.length === 0) {
      setError('Please select an answer before submitting.');
      return;
    }

    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      let answerToSubmit = selectedAnswer;
      
      // For click-type questions, convert option ID to actual answer text
      if (currentQuestion.type === 'click' && currentQuestion.options) {
        const selectedOption = currentQuestion.options.find(opt => opt.id.toString() === selectedAnswer);
        if (selectedOption) {
          answerToSubmit = selectedOption.text;
        }
      } else if (currentQuestion.type === 'drag') {
        answerToSubmit = droppedItems.join(',');
      }

      console.log('Submitting answer:', {
        questionId: currentQuestion.id,
        selectedAnswer,
        answerToSubmit,
        questionType: currentQuestion.type
      });

      const response = await submitAnswer(currentQuestion.id, answerToSubmit);
      setIsAnswerSubmitted(true);
      setIsCorrect(response.isCorrect);
      
      // Update score based on answer correctness
      if (response.isCorrect) {
        setScore(prevScore => prevScore + 10);
      } else {
        setScore(prevScore => Math.max(0, prevScore - 5)); // Don't go below 0
      }

      // Save quiz progress to the database
      await saveQuizProgress(answerToSubmit, 300 - timer);

      // Prepare the explanation content with image if available
      const explanationContent = document.createElement('div');
      explanationContent.className = 'text-center';

      // Add the explanation text
      const explanationText = document.createElement('p');
      explanationText.className = 'mb-4';
      explanationText.textContent = response.explanation || (response.isCorrect ? 'Great job!' : 'Keep trying!');
      explanationContent.appendChild(explanationText);

      // Add the explanation image if available
      if (currentQuestion.explanation_image) {
        const img = document.createElement('img');
        img.src = getImageUrl(currentQuestion.explanation_image);
        img.alt = 'Explanation';
        img.className = 'mx-auto max-w-full h-auto rounded-lg shadow-md';
        explanationContent.appendChild(img);
      }

      // Show the sweet alert with the explanation
      swal({
        title: response.isCorrect ? "Correct!" : "Incorrect",
        content: {
          element: explanationContent,
        },
        icon: response.isCorrect ? "success" : "error",
        buttons: {
          confirm: {
            text: "Next",
            value: true,
            visible: true,
            className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg",
          }
        }
      }).then(() => {
        // Reset question state before moving to next question
        setSelectedAnswer('');
        setIsAnswerSubmitted(false);
        setIsCorrect(null);
        setDroppedItems([]);
        setError('');
        
        // Move to next question
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setTimer(300); // Reset timer
          
          // Initialize drag items if next question is drag type
          const nextQuestion = questions[currentQuestionIndex + 1];
          if (nextQuestion?.type === 'drag' && nextQuestion.options) {
            setDragItems(nextQuestion.options.map(opt => opt.text));
          }
        } else {
          handleQuizComplete();
        }
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
      swal({
        title: "Error",
        text: "There was an error submitting your answer. Please try again.",
        icon: "error",
      });
    }
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties for better speech
      utterance.rate = 0.9; // Slightly slower than default
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Use English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    lastPos.current = { x: offsetX, y: offsetY };
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;
    const { offsetX, offsetY } = nativeEvent;
    
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
      contextRef.current.lineWidth = penSize;
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
      lastPos.current = { x: offsetX, y: offsetY };
    }
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(
        0, 
        0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
    }
  };

  const handleQuizComplete = async () => {
    try {
      const timeSpentOnQuestion = 300 - timer;
      await saveQuizProgress(selectedAnswer, timeSpentOnQuestion);
      
      // Dispatch quiz completion event to update chart
      window.dispatchEvent(new Event('quizComplete'));
      
      // Show completion message
      swal({
        title: "Quiz Complete!",
        text: "You have completed the quiz. Your progress has been saved.",
        icon: "success",
        buttons: {
          confirm: {
            text: "View Dashboard",
            value: true,
            visible: true,
            className: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg",
          }
        }
      }).then((value) => {
        if (value) {
          navigate('/dashboard');
        }
      });
    } catch (error) {
      console.error('Error saving quiz progress:', error);
      setError('Failed to save quiz progress. Please try again.');
    }
  };

  useEffect(() => {
    if (currentQuestionIndex === questions.length - 1) {
      handleQuizComplete();
    }
  }, [currentQuestionIndex]);

  return (
    <div className="min-h-screen">
      <DashboardNav logout={logout} />
      <div className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-center text-gray-600">No questions available for this topic.</div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:space-x-4">
              <div className="bg-white p-8 rounded-xl shadow-lg w-full lg:w-3/4 relative mx-auto lg:mx-0">
                {/* Header Section */}
                <div className="flex mb-8">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      {/* Removed the Question X/Y text as requested */}
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="relative mb-8 bg-gray-50 p-8 rounded-lg">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={`absolute inset-0 w-full h-full ${isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
                    style={{ zIndex: 10, height: "100%" }}
                  />
                  <div className="relative">
                    <div className="text-lg text-gray-800 mb-6">
                      <div 
                        dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].content }} 
                        className="inline"
                      />
                      <button 
                        onClick={() => speakQuestion(questions[currentQuestionIndex].content.replace(/<[^>]*>/g, ''))}
                        className="ml-2 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        aria-label="Read question aloud"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>

                    {/* Question Images */}
                    {questions[currentQuestionIndex].images && Array.isArray(questions[currentQuestionIndex].images) && questions[currentQuestionIndex].images.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {questions[currentQuestionIndex].images.map((imagePath: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={getImageUrl(imagePath)}
                              alt={`Question image ${index + 1}`}
                              className="rounded-lg shadow-md w-full h-48 object-contain bg-white p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                              onError={(e) => {
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Type Specific Content */}
                {(() => {
                  switch (questions[currentQuestionIndex].type) {
                    case 'click':
                      return (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3 justify-start items-center">
                            {Array.isArray(questions[currentQuestionIndex].options) && questions[currentQuestionIndex].options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleAnswer(option.id.toString())}
                                className={`
                                  min-w-[45px] h-[45px] rounded-md
                                  flex items-center justify-center text-lg font-medium
                                  transition-all duration-200 px-3
                                  ${selectedAnswer === option.id.toString()
                                    ? 'bg-blue-500 text-white border-blue-400'
                                    : 'bg-white hover:bg-blue-50 text-blue-900 border-2 border-blue-100'
                                  }
                                  ${isAnswerSubmitted && selectedAnswer === option.id.toString()
                                    ? isCorrect
                                      ? 'bg-green-500 text-white border-green-400'
                                      : 'bg-red-500 text-white border-red-400'
                                    : ''
                                  }
                                  font-medium shadow-sm hover:shadow-md
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                disabled={isAnswerSubmitted}
                              >
                                {option.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    case 'text':
                      return (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={selectedAnswer || ''}
                              onChange={(e) => handleAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-200
                                ${isAnswerSubmitted 
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                  : 'border-blue-300 focus:border-blue-500 bg-white focus:bg-blue-50'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed text-lg
                              `}
                              disabled={isAnswerSubmitted}
                            />
                            {isAnswerSubmitted && (
                              <div className={`mt-2 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect 
                                  ? 'Correct answer!' 
                                  : `The correct answer was: ${questions[currentQuestionIndex].correctAnswer}`
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    case 'drag':
                      return (
                        <>
                          <div className="flex flex-wrap gap-4 mb-4">
                            {dragItems.map((item, index) => (
                              <div
                                key={index}
                                className="px-6 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 
                                         cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all
                                         select-none text-center min-w-[80px]"
                                draggable
                                onDragStart={() => handleDragStart(index)}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                          <div
                            className="border-2 border-dashed border-indigo-300 rounded-lg min-h-[120px] bg-indigo-50 
                                     p-4 flex flex-wrap gap-2 transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault();
                              const target = e.currentTarget as HTMLDivElement;
                              target.style.backgroundColor = '#e8eaf6';
                              target.style.borderColor = '#3f51b5';
                            }}
                            onDragLeave={(e) => {
                              const target = e.currentTarget as HTMLDivElement;
                              target.style.backgroundColor = '#eef2ff';
                              target.style.borderColor = '#818cf8';
                            }}
                            onDrop={handleDrop}
                          >
                            {droppedItems.map((item, index) => (
                              <div
                                key={index}
                                className="px-6 py-3 border-2 border-green-300 rounded-lg bg-green-50 
                                         shadow-sm text-center min-w-[80px]"
                              >
                                {item}
                              </div>
                            ))}
                            {droppedItems.length === 0 && (
                              <div className="text-gray-400 text-center w-full">
                                Drop items here
                              </div>
                            )}
                          </div>
                        </>
                      );
                    case 'draw':
                      return (
                        <div className="space-y-4">
                          <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className={`w-full h-64 rounded-lg ${isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
                          />
                          {isAnswerSubmitted && (
                            <div className={`mt-2 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {isCorrect 
                                ? 'Correct answer!' 
                                : `The correct answer was: ${questions[currentQuestionIndex].correctAnswer}`
                              }
                            </div>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}

                {/* Submit Button - Always visible for all question types */}
                <div className="mt-6 mb-4">
                  <button
                    onClick={handleSubmit}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-white
                      transition-all duration-200
                      ${isAnswerSubmitted
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                      }
                    `}
                    disabled={isAnswerSubmitted || (!selectedAnswer && droppedItems.length === 0)}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>

              {/* Stacked sidebar with stats */}
              <div className="w-32 flex-shrink-0 ml-4 bg-gray-50 p-3 rounded-xl">
                {/* Questions answered */}
                <div className="flex flex-col mb-3 rounded-lg overflow-hidden shadow-md">
                  <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-center text-sm">
                    Questions answered
                  </div>
                  <div className="h-12 bg-white flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-700">{currentQuestionIndex}</span>
                  </div>
                </div>
                
                {/* Time elapsed */}
                <div className="flex flex-col mb-3 rounded-lg overflow-hidden shadow-md">
                  <div className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center text-sm">
                    Time elapsed
                  </div>
                  <div className="h-12 bg-white flex items-center justify-center">
                    {isPaused ? (
                      <span className="text-xl font-bold text-gray-400">PAUSED</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-700">{formatTime(timer)}</span>
                    )}
                  </div>
                </div>
                
                {/* SmartScore */}
                <div className="flex flex-col mb-3 rounded-lg overflow-hidden shadow-md">
                  <div
                    className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center text-sm"
                    title="Ebedmas SmartScore tracks your mastery level.
Each badge represents a milestone in your learning journey:
Bronze (30%): Getting Started
Silver (50%): Making Progress
Gold (70%): Strong Understanding
Platinum (85%): Excellence
Diamond (95%): Mastery
Perfect (100%): Flawless
Speed Demon: Complete under 1 min per question"
                  >
                    <div className="flex items-center justify-center">
                      <span className="font-medium">SmartScore</span>
                      <div 
                        className="relative ml-2 flex-shrink-0" 
                        style={{ width: '20px', height: '20px' }}
                      >
                        <div
                          className="absolute inset-0 rounded-full bg-white flex items-center justify-center cursor-help shadow-md hover:shadow-lg transition-all duration-200 border-2 border-orange-400"
                          style={{ 
                            width: '20px', 
                            height: '20px',
                            lineHeight: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#f97316' // text-orange-500 equivalent
                          }}
                        >?</div>
                      </div>
                    </div>
                    <div className="text-xs mt-1">out of {questions.length * 10}</div>
                  </div>
                  <div className="h-16 bg-white flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-700">{score}</span>
                    <div className="flex mt-1">
                      {score >= 30 && <span className="text-xl">🥉</span>}
                      {score >= 50 && <span className="text-xl">🥈</span>}
                      {score >= 80 && <span className="text-xl">🥇</span>}
                      {score >= 90 && <span className="text-xl">🏅</span>}
                    </div>
                  </div>
                </div>
                
                {/* Drawing tool button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`p-3 rounded-lg transition-all duration-200 shadow-md ${
                      isDrawingMode 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' 
                        : 'bg-white text-blue-500 hover:bg-blue-50'
                    }`}
                    title={isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" fill={isDrawingMode ? "#ffffff" : "#3b82f6"}/>
                    </svg>
                  </button>
                </div>
                
                {/* Pause button - only show when needed */}
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm shadow-md ${
                      isPaused
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    }`}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              </div>

              {/* Drawing controls - only show when drawing mode is active */}
              {isDrawingMode && (
                <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={penColor}
                      onChange={(e) => setPenColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-2 border-gray-200"
                      title="Choose pen color"
                    />
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-500">Size: {penSize}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={penSize}
                        onChange={(e) => setPenSize(Number(e.target.value))}
                        className="w-24"
                        title="Adjust pen size"
                      />
                    </div>
                    <button
                      onClick={clearCanvas}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Clear drawing"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicQuizPage;