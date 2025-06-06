import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Flashcard Component
const Flashcard = ({ word, onKnow, onDontKnow, showAnswer, onFlip }) => {
  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div 
        className={`relative w-full h-64 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
        onClick={onFlip}
      >
        {/* Front side - English word */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-xl p-6 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl font-bold mb-2">{word.english}</h2>
          {word.phonetic && (
            <p className="text-lg opacity-80 mb-4">{word.phonetic}</p>
          )}
          <p className="text-sm opacity-70 text-center">Нажмите, чтобы увидеть перевод</p>
        </div>
        
        {/* Back side - Russian translation */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-xl p-6 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl font-bold mb-4">{word.russian}</h2>
          {word.example && (
            <p className="text-sm opacity-80 text-center mb-4 italic">"{word.example}"</p>
          )}
          <div className="flex gap-4 mt-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onKnow(); }}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              ✓ Знаю
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDontKnow(); }}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              ✗ Не знаю
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Component
const Quiz = ({ question, onAnswer, currentQuestion, totalQuestions }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (option, index) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(option.correct);
      setSelectedOption(null);
      setShowResult(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-600">
            Вопрос {currentQuestion + 1} из {totalQuestions}
          </h3>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{question.english}</h2>
        {question.phonetic && (
          <p className="text-lg text-gray-600">{question.phonetic}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option, index)}
            disabled={showResult}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
              !showResult 
                ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50' 
                : selectedOption === index
                  ? option.correct 
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-red-500 bg-red-100 text-red-800'
                  : option.correct
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-gray-300 bg-gray-50'
            }`}
          >
            <span className="text-lg font-medium">{option.text}</span>
            {showResult && option.correct && (
              <span className="ml-2 text-green-600">✓</span>
            )}
            {showResult && selectedOption === index && !option.correct && (
              <span className="ml-2 text-red-600">✗</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Progress Stats Component
const ProgressStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Ваш прогресс</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total_words_studied}</div>
          <div className="text-sm text-gray-600">Слов изучено</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.mastered_words}</div>
          <div className="text-sm text-gray-600">Освоено</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.familiar_words}</div>
          <div className="text-sm text-gray-600">Знакомо</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.accuracy}%</div>
          <div className="text-sm text-gray-600">Точность</div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс</span>
          <span>{stats.mastered_words}/{stats.total_words_studied} освоено</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: stats.total_words_studied > 0 
                ? `${(stats.mastered_words / stats.total_words_studied) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'flashcards', 'quiz'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/words/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/progress/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startFlashcards = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/words/random?category=${category || ''}&count=10`);
      setWords(response.data);
      setSelectedCategory(category);
      setCurrentWordIndex(0);
      setShowAnswer(false);
      setCurrentMode('flashcards');
    } catch (error) {
      console.error('Error loading words:', error);
    }
    setLoading(false);
  };

  const startQuiz = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/quiz/multiple-choice?category=${category || ''}&count=5`);
      setQuiz(response.data);
      setSelectedCategory(category);
      setCurrentQuestionIndex(0);
      setQuizScore({ correct: 0, total: 0 });
      setCurrentMode('quiz');
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
    setLoading(false);
  };

  const handleFlashcardAnswer = async (isCorrect) => {
    const currentWord = words[currentWordIndex];
    
    try {
      await axios.post(`${API}/progress/update?word_id=${currentWord.id}&is_correct=${isCorrect}`);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    // Move to next card
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
    } else {
      setCurrentMode('menu');
    }
  };

  const handleQuizAnswer = async (isCorrect) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    try {
      await axios.post(`${API}/progress/update?word_id=${currentQuestion.id}&is_correct=${isCorrect}`);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      setTimeout(() => setCurrentMode('menu'), 2000);
    }
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🇬🇧 Изучение английского языка
          </h1>
          <p className="text-xl text-gray-600">Изучайте английскую лексику с помощью карточек и тестов</p>
        </div>

        {/* Progress Stats */}
        <ProgressStats stats={stats} />

        {/* Study Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Flashcards */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Карточки</h2>
              <p className="text-gray-600">Изучайте новые слова с интерактивными карточками</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => startFlashcards('')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Все категории
              </button>
              {categories.map(category => {
                const categoryNames = {
                  'family': 'семья',
                  'food': 'еда', 
                  'travel': 'путешествия',
                  'work': 'работа',
                  'basic': 'базовые слова'
                };
                return (
                  <button
                    key={category}
                    onClick={() => startFlashcards(category)}
                    disabled={loading}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 capitalize"
                  >
                    {categoryNames[category] || category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiz */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Тест</h2>
              <p className="text-gray-600">Проверьте свои знания с вопросами с множественным выбором</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => startQuiz('')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Все категории
              </button>
              {categories.map(category => {
                const categoryNames = {
                  'family': 'семья',
                  'food': 'еда', 
                  'travel': 'путешествия',
                  'work': 'работа',
                  'basic': 'базовые слова'
                };
                return (
                  <button
                    key={category}
                    onClick={() => startQuiz(category)}
                    disabled={loading}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 capitalize"
                  >
                    {categoryNames[category] || category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Загрузка...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFlashcards = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setCurrentMode('menu')}
            className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            ← Назад в меню
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Карточки</h1>
          <p className="text-gray-600">
            {selectedCategory ? `Категория: ${selectedCategory}` : 'Все категории'} • 
            Карточка {currentWordIndex + 1} из {words.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        {words.length > 0 && currentWordIndex < words.length && (
          <Flashcard
            word={words[currentWordIndex]}
            onKnow={() => handleFlashcardAnswer(true)}
            onDontKnow={() => handleFlashcardAnswer(false)}
            showAnswer={showAnswer}
            onFlip={() => setShowAnswer(!showAnswer)}
          />
        )}
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setCurrentMode('menu')}
            className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            ← Назад в меню
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Тест</h1>
          <p className="text-gray-600">
            {selectedCategory ? `Категория: ${selectedCategory}` : 'Все категории'} • 
            Счёт: {quizScore.correct}/{quizScore.total}
          </p>
        </div>

        {/* Quiz */}
        {quiz && currentQuestionIndex < quiz.questions.length ? (
          <Quiz
            question={quiz.questions[currentQuestionIndex]}
            onAnswer={handleQuizAnswer}
            currentQuestion={currentQuestionIndex}
            totalQuestions={quiz.questions.length}
          />
        ) : quiz && currentQuestionIndex >= quiz.questions.length ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Тест завершён!</h2>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {quizScore.correct}/{quizScore.total}
            </div>
            <p className="text-gray-600 mb-4">
              {quizScore.correct === quizScore.total ? '🎉 Отличный результат!' : 
               quizScore.correct >= quizScore.total * 0.8 ? '👏 Отлично!' :
               '💪 Продолжайте практиковаться!'}
            </p>
            <p className="text-sm text-gray-500">Возвращение в меню...</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (currentMode === 'flashcards') return renderFlashcards();
  if (currentMode === 'quiz') return renderQuiz();
  return renderMenu();
}

export default App;
