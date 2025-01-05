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
          if (question.type === 'click' && question.options) {
            try {
              if (typeof question.options === 'string') {
                processedOptions = JSON.parse(question.options);
              } else if (Array.isArray(question.options)) {
                processedOptions = question.options;
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
      if (questions[currentQuestionIndex + 1]?.type === 'drag') {
        const numbers = questions[currentQuestionIndex + 1].correctAnswer.split(',');
        setDragItems(numbers);
      }
    }
  };

  const renderQuestionContent = () => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}/{questions.length}</h2>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
          
          <div className="mb-6">
            <div className="text-lg font-medium mb-4">
              {currentQuestion.content}
              <button 
                onClick={() => speakQuestion(currentQuestion.content)}
                className="ml-2 p-2 text-blue-500 hover:text-blue-600 focus:outline-none"
                aria-label="Read question aloud"
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Display question images */}
            {currentQuestion.images && Array.isArray(currentQuestion.images) && currentQuestion.images.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.images.map((imagePath: string, index: number) => {
                  const fullImageUrl = getImageUrl(imagePath);
                  console.log('Rendering image:', {
                    originalPath: imagePath,
                    fullUrl: fullImageUrl
                  });
                  
                  return (
                    <div key={index} className="relative w-full h-48 md:h-64">
                      <img
                        src={fullImageUrl}
                        alt={`Question image ${index + 1}`}
                        className="rounded-lg shadow-md w-full h-full object-contain bg-gray-50"
                        onError={(e) => {
                          console.error('Image failed to load:', {
                            error: e,
                            src: fullImageUrl,
                            originalPath: imagePath
                          });
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', fullImageUrl);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Question Type Specific Content */}
        {(() => {
          switch (currentQuestion.type) {
            case 'click':
              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-start items-center">
                    {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option) => (
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
                          : `The correct answer was: ${currentQuestion.correctAnswer}`
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
    );
  };

  if (loading) {
    return (
      <div>
        <DashboardNav logout={logout} />
        <div className="flex min-h-screen bg-gray-100">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <DashboardNav logout={logout} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div>
        <DashboardNav logout={logout} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-gray-600">No questions available for this topic.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">
              Question {currentQuestionIndex + 1}/{questions.length}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <div className="text-xl font-mono">{formatTime(timer)}</div>
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-8">
            {renderQuestionContent()}
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 text-gray-600">
            <div>Segment 1/5 • Question {currentQuestionIndex + 1}/20</div>
            <div>Score: {score}/0 (100/100)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicQuizPage;