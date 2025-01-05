import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardNav from '../DashboardNav';
import publicApi from '../../admin/services/publicApi';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  content: string;
  type: string;
  options: Option[];
  correctAnswer?: string;
  audioUrl?: string;
}

const QuizPage = ({ logout }: { logout: () => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { topicId } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await publicApi.get(`/questions/topic/${topicId}`);
        console.log('Fetched questions:', response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setQuestions(response.data);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchQuestions();
    }
  }, [topicId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;
    if (currentQuestion.type === 'multiple_choice') {
      const selectedOption = currentQuestion.options.find(opt => opt.id.toString() === userAnswer);
      correct = selectedOption?.isCorrect || false;
    } else if (currentQuestion.type === 'text_input') {
      correct = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer?.toLowerCase().trim();
    }

    if (correct) {
      setScore(score + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 2000);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Question {currentQuestionIndex + 1}/{questions.length}
        </h2>
        <div className="text-lg mb-6">{currentQuestion.content}</div>
        {currentQuestion.audioUrl && (
          <button 
            onClick={() => new Audio(currentQuestion.audioUrl).play()}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            🔊 Listen
          </button>
        )}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => setUserAnswer(option.id.toString())}
              className={`p-3 rounded-lg text-left ${
                userAnswer === option.id.toString()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div>
        <DashboardNav logout={logout} />
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No questions available</h2>
            <p className="text-gray-600">There are no questions available for this topic yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav logout={logout} />
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderQuestion()}
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-gray-600">
              Score: {score}/{questions.length}
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer}
              className={`px-6 py-2 rounded-lg ${
                userAnswer 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              Submit Answer
            </button>
          </div>

          {showFeedback && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 