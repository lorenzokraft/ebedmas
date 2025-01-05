import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import swal from 'sweetalert';

interface Question {
  id: number;
  type: 'text' | 'draw' | 'paint' | 'drag' | 'click';
  question: string;
  options?: string[];
  correctAnswer: string;
  audioUrl?: string;
}

const QuizPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [segment, setSegment] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [sortedOptions, setSortedOptions] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const GUEST_QUESTION_LIMIT = 10;

  const successMessages = [
    "Fantastic!",
    "Great Job!",
    "You've got this!",
    "Awesome!",
    "Nice Job!"
  ];

  const getRandomSuccessMessage = () => {
    const randomIndex = Math.floor(Math.random() * successMessages.length);
    return successMessages[randomIndex];
  };

  const sampleQuestions: Question[] = [
    {
      id: 1,
      type: 'text',
      question: 'What books did you read this summer?',
      options: ['many', 'read'],
      correctAnswer: 'read'
    },
    {
      id: 2,
      type: 'drag',
      question: 'Put these numbers in ascending order',
      options: ['5', '2', '8', '1'],
      correctAnswer: '1,2,5,8'
    },
    {
      id: 3,
      type: 'drag',
      question: 'Put 1 bat in the picture',
      options: ['🦇', '🦇', '🦇', '🦇', '🦇'],
      correctAnswer: '🦇'
    },
    {
      id: 4,
      type: 'paint',
      question: 'Color the circle using primary colors',
      correctAnswer: 'red, blue, or yellow'
    },
    {
      id: 5,
      type: 'click',
      question: 'Click on all the even numbers:',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      correctAnswer: '2,4,6'
    },
    {
      id: 6,
      type: 'drag',
      question: 'Put these numbers in ascending order',
      options: ['5', '2', '8', '1'],
      correctAnswer: '1,2,5,8'
    },
    {
      id: 7,
      type: 'draw',
      question: 'Draw a triangle with three equal sides',
      correctAnswer: 'equilateral triangle'
    },
    {
      id: 8,
      type: 'text',
      question: 'What is 2 + 2?',
      correctAnswer: '4'
    },
    {
      id: 9,
      type: 'paint',
      question: 'Paint the sky blue and grass green',
      correctAnswer: 'blue sky, green grass'
    },
    {
      id: 10,
      type: 'click',
      question: 'Select all the vowels:',
      options: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
      correctAnswer: 'a,e,i,o,u'
    },
    {
      id: 11,
      type: 'drag',
      question: 'Match the animal to its habitat',
      options: ['fish-ocean', 'bird-sky', 'rabbit-burrow'],
      correctAnswer: 'correct matches'
    },
    {
      id: 12,
      type: 'draw',
      question: 'Draw a square with a circle inside',
      correctAnswer: 'square containing circle'
    },
    {
      id: 13,
      type: 'text',
      question: 'Spell the word "cat"',
      correctAnswer: 'cat'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    setSortedOptions([]);
    setOptions(sampleQuestions[currentQuestion]?.options || []);
  }, [currentQuestion]);

  useEffect(() => {
    if (sampleQuestions[currentQuestion]?.id === 4) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, 300, 300);

      // Draw circle
      ctx.beginPath();
      ctx.arc(150, 150, 80, 0, Math.PI * 2);
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleAnswer = (userAnswer: string) => {
    const currentQ = sampleQuestions[currentQuestion];
    
    if (currentQuestion >= GUEST_QUESTION_LIMIT - 1) {
      setShowLimitModal(true);
      return;
    }
    
    if (userAnswer === currentQ.correctAnswer) {
      swal({
        title: getRandomSuccessMessage(),
        text: "Well done!",
        icon: "success",
        buttons: {
          confirm: {
            text: "OK",
            value: true,
            visible: true,
            className: "w-full",
          }
        }
      }).then(() => {
        setScore(prevScore => prevScore + 1);
        setCurrentQuestion(prev => prev + 1);
        setAnswer('');
        setSortedOptions([]);
      });
    } else {
      swal({
        title: "Incorrect",
        text: `The correct answer is: ${currentQ.correctAnswer}`,
        content: {
          element: "div",
          attributes: {
            innerHTML: getExplanation(currentQ.id)
          }
        },
        icon: "error",
        buttons: {
          confirm: {
            text: "OK",
            value: true,
            visible: true,
            className: "w-full",
          }
        }
      }).then(() => {
        setCurrentQuestion(prev => prev + 1);
        setAnswer('');
        setSortedOptions([]);
      });
    }
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(sampleQuestions[currentQuestion].question);
    window.speechSynthesis.speak(utterance);
  };

  const getExplanation = (questionId: number) => {
    switch (questionId) {
      case 1:
        return `
          <h2 style='font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333;'>Explanation:</h2>
          <p style='margin-top: 10px'>The word "read" is both present and past tense. Understanding context helps determine which tense is being used.</p>
        `;
      // ... other cases ...
      case 5:
        return `
          <h2 style='font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333;'>Explanation:</h2>
          <p style='margin-top: 10px'>Even numbers are numbers that can be divided by 2 with no remainder. In this set, those numbers are 2, 4, and 6.</p>
        `;
      case 10:
        return `
          <h2 style='font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333;'>Explanation:</h2>
          <p style='margin-top: 10px'>Vowels in English are a, e, i, o, and u. These letters make distinct sounds and are essential to word formation.</p>
        `;
      default:
        return `
          <h2 style='font-size: 1.2em; font-weight: bold; margin-bottom: 10px; color: #333;'>Explanation:</h2>
          <p style='margin-top: 10px'>Please review your answer and try again.</p>
        `;
    }
  };

  const renderQuestion = (question: Question) => {
    const [answer, setAnswer] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
      setDraggedIndex(index);
    };

    const handleDrop = () => {
      if (draggedIndex === null) return;

      const newSortedOptions = [...sortedOptions, options[draggedIndex]];
      setSortedOptions(newSortedOptions);

      const newOptions = options.filter((_, i) => i !== draggedIndex);
      setOptions(newOptions);

      setDraggedIndex(null);
    };

    switch (question.type) {
      case 'drag':
        return (
          <div>
            <p>{question.question}</p>
            <div className="flex flex-wrap gap-4 mb-4">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="px-6 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 
                             cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all
                             select-none text-center min-w-[80px]"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                >
                  {option}
                </div>
              ))}
            </div>
            <div
              className="border-2 border-dashed border-indigo-300 rounded-lg min-h-[120px] bg-indigo-50 
                         p-4 flex flex-wrap gap-2 transition-colors"
              style={{ borderWidth: '2px' }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '#e8eaf6';
                e.currentTarget.style.borderColor = '#3f51b5';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.borderColor = '#818cf8';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.borderColor = '#818cf8';
                if (draggedIndex !== null) {
                  const draggedOption = options[draggedIndex];
                  if (draggedOption) {
                    const newSortedOptions = [...sortedOptions, draggedOption];
                    setSortedOptions(newSortedOptions);
                    
                    const newOptions = options.filter((_, i) => i !== draggedIndex);
                    setOptions(newOptions);
                    setDraggedIndex(null);
                  }
                }
              }}
            >
              {sortedOptions.map((option, index) => (
                <div
                  key={index}
                  className="px-6 py-3 border-2 border-green-300 rounded-lg bg-green-50 
                             shadow-sm text-center min-w-[80px]"
                >
                  {option}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (question.id === 2) {
                  if (sortedOptions.length === 4) {
                    handleAnswer(sortedOptions.join(','));
                  } else {
                    swal({
                      title: "Oops!",
                      text: "Please drag all numbers to the box in ascending order.",
                      icon: "error",
                      buttons: {
                        confirm: {
                          text: "OK",
                          value: true,
                          visible: true,
                          className: "w-full",
                        }
                      }
                    }).then(() => {
                      handleAnswer(sortedOptions.join(','));
                    });
                  }
                } else if (question.id === 3) {
                  if (sortedOptions.length === 1) {
                    handleAnswer('🦇');
                  } else {
                    swal({
                      title: "Oops!",
                      text: "The question asks for 1 bat. You placed " + sortedOptions.length + " bats.",
                      icon: "error",
                      buttons: {
                        confirm: {
                          text: "OK",
                          value: true,
                          visible: true,
                          className: "w-full",
                        }
                      }
                    }).then(() => {
                      handleAnswer('wrong');
                    });
                  }
                } else if (question.id === 6) {
                  if (sortedOptions.length === 4) {
                    handleAnswer(sortedOptions.join(','));
                  } else {
                    swal("Oops!", "Please drag all numbers to the box in ascending order.", "error");
                  }
                } else if (question.id === 11) {
                  if (sortedOptions.length === 3) {
                    handleAnswer('correct matches');
                  } else {
                    swal("Oops!", "Please match all animals to their habitats.", "error");
                  }
                }
              }}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <p>{question.question}</p>
            {question.options && (
              <div className="flex gap-2">
                {(question.options || []).map((option, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              placeholder="Type your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
            <button
              onClick={() => handleAnswer(answer)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      case 'draw':
        return (
          <div>
            <p>{question.question}</p>
            <div className="mb-4 flex gap-4 items-center">
              <div className="flex gap-2">
                {['#000000', '#ff0000', '#0000ff', '#00ff00', '#ffff00'].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <select 
                className="border rounded p-1"
                onChange={(e) => setBrushSize(Number(e.target.value))}
                value={brushSize}
              >
                <option value="2">Thin</option>
                <option value="5">Medium</option>
                <option value="8">Thick</option>
              </select>
            </div>

            <canvas
              ref={canvasRef}
              className="border rounded-lg bg-white cursor-crosshair"
              width={400}
              height={400}
              onMouseDown={(e) => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas) return;

                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                setIsDrawing(true);
              }}
              onMouseMove={(e) => {
                if (!isDrawing) return;
                
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas) return;

                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.lineTo(x, y);
                ctx.strokeStyle = selectedColor;
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                ctx.stroke();
              }}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
            />

            <button
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mr-2"
            >
              Clear Canvas
            </button>

            <button
              onClick={() => {
                if (question.id === 7) {
                  handleAnswer('equilateral triangle');
                } else if (question.id === 12) {
                  handleAnswer('square containing circle');
                }
              }}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      case 'paint':
        return (
          <div>
            <p>{question.question}</p>
            <div className="mb-2 flex gap-2">
              {['#ff0000', '#0000ff', '#ffff00'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <canvas
              ref={canvasRef}
              className="border rounded-lg bg-white"
              width={300}
              height={300}
              onMouseDown={(e) => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas) return;

                // Draw circle if it doesn't exist
                if (question.id === 4 && !ctx.getImageData(0, 0, 300, 300).data.some(pixel => pixel !== 0)) {
                  ctx.beginPath();
                  ctx.arc(150, 150, 80, 0, Math.PI * 2);
                  ctx.strokeStyle = 'black';
                  ctx.stroke();
                }

                // Enable painting
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.fillStyle = selectedColor;
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
              }}
              onMouseMove={(e) => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (!ctx || !canvas || !e.buttons) return;

                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.fillStyle = selectedColor;
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
              }}
            />
            <button
              onClick={() => {
                if (question.id === 4) {
                  if (['#ff0000', '#0000ff', '#ffff00'].includes(selectedColor)) {
                    handleAnswer('red, blue, or yellow');
                  } else {
                    swal("Oops!", "Please use a primary color (red, blue, or yellow).", "error");
                  }
                } else if (question.id === 9) {
                  handleAnswer('blue sky, green grass');
                }
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      case 'click':
        return (
          <div>
            <p>{question.question}</p>
            <div className="flex gap-2">
              {(question.options || []).map((option, index) => {
                const isSelected = answer.split(',').includes(option);
                return (
                  <button
                    key={index}
                    className={`w-12 h-12 rounded-full ${
                      isSelected ? 'bg-red-500 text-white' : 'bg-blue-200 hover:bg-blue-300'
                    }`}
                    onClick={() => {
                      const currentAnswers = answer ? answer.split(',') : [];
                      if (isSelected) {
                        setAnswer(currentAnswers.filter(a => a !== option).join(','));
                      } else {
                        setAnswer(currentAnswers.length ? `${answer},${option}` : option);
                      }
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const normalizedAnswer = answer
                  .split(',')
                  .filter(Boolean)
                  .map(item => item.trim())
                  .sort()
                  .join(',');

                if (normalizedAnswer === question.correctAnswer) {
                  setScore(prevScore => prevScore + 1);
                  setCurrentQuestion(prev => prev + 1);
                  setAnswer('');
                } else {
                  swal({
                    title: "Incorrect",
                    text: `The correct answer is: ${question.correctAnswer}`,
                    content: {
                      element: "div",
                      attributes: {
                        innerHTML: getExplanation(question.id)
                      }
                    },
                    icon: "error",
                    buttons: {
                      confirm: {
                        text: "OK",
                        value: true,
                        visible: true,
                        className: "w-full",
                      }
                    }
                  }).then(() => {
                    setCurrentQuestion(prev => prev + 1);
                    setAnswer('');
                  });
                }
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      // ... implement other question types
    }
  };

  useEffect(() => {
    // Add custom styles for swal button
    const style = document.createElement('style');
    style.innerHTML = `
      .swal-button--confirm {
        width: 100% !important;
        margin-top: 10px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const LimitModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold text-gray-800">Daily practice limit reached</h2>
          <button 
            onClick={() => setShowLimitModal(false)}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="text-xl text-gray-700">The fun doesn't have to stop!</h3>
          
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-cyan-500">✓</span>
              Learn and master 7000+ skills
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyan-500">✓</span>
              Receive personalised learning plans
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cyan-500">✓</span>
              Win awards and earn certificates
            </li>
          </ul>

          <div className="space-y-3">
            <a 
              href="/subscription"
              className="block w-full py-2 px-4 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors text-center"
            >
              Become a member today!
            </a>
            <center><p>OR</p></center>
            <a 
              href="/login"
              className="block w-full py-2 px-4 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors text-center"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-[55px]">
      {showLimitModal && <LimitModal />}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">
            Question {currentQuestion + 1}/{sampleQuestions.length}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <div className="text-lg font-mono">{formatTime(timer)}</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">
              {sampleQuestions[currentQuestion].question}
            </h2>
            <button 
              onClick={playAudio} 
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Listen to question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {renderQuestion(sampleQuestions[currentQuestion])}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg">
            Segment {segment}/5 • Question {currentQuestion + 1}/20
          </div>
          <div className="text-lg">
            Score: {score}/{questionsAnswered} ({Math.round((score / Math.max(questionsAnswered, 1)) * 100)}/100)
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;