// This is our new component for topic-specific quizzes
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import publicApi from '../../admin/services/publicApi';
import swal from 'sweetalert';
import { Volume2 } from 'lucide-react';
import { getImageUrl, getImageUrls } from '../../utils/imageUtils';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(300);
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
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  const lastPos = React.useRef({ x: 0, y: 0 });

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
    if (!isPaused) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

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

  const handleSubmit = async () => {
    if (!selectedAnswer && droppedItems.length === 0) return;

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
        // Handle next question
        handleNextQuestion();
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setDroppedItems([]);
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
      
      // Reset drag items for next question if it's a drag type
      if (questions[currentQuestionIndex + 1]?.type === 'drag' && questions[currentQuestionIndex + 1].options) {
        setDragItems(questions[currentQuestionIndex + 1].options.map(opt => opt.text));
      }
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

  return (
    <div className="min-h-screen bg-gray-100">
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
            <div className="bg-white p-8 rounded-xl shadow-lg w-[80%] relative mx-auto">
              {/* Header Section */}
              <div className="flex flex-col space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-800">Question {currentQuestionIndex + 1}/{questions.length}</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Score: {score}/100
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 ${isDrawingMode ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
                      <button
                        onClick={() => setIsDrawingMode(!isDrawingMode)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isDrawingMode 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                        </svg>
                      </button>
                      <div className={`transition-all duration-200 ${
                        isDrawingMode 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 -translate-x-4 pointer-events-none'
                      }`}>
                        <div className="flex items-center space-x-3 bg-white p-2 rounded-lg shadow-sm">
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
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          isPaused
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <div className="text-lg font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                        {formatTime(timer)}
                      </div>
                    </div>
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
                  style={{ zIndex: 10 }}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicQuizPage;