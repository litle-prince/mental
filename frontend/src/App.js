import React, { useState, useEffect } from 'react';
import './App.css';

// Компонент для словарных карточек
const VocabularyCard = ({ word, translation, example, onNext, showAnswer, onShowAnswer }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 m-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-4">{word}</h3>
        {showAnswer && (
          <div className="space-y-3">
            <p className="text-lg text-gray-700">{translation}</p>
            <p className="text-sm text-gray-500 italic">"{example}"</p>
          </div>
        )}
        <div className="mt-6 space-x-4">
          {!showAnswer ? (
            <button
              onClick={onShowAnswer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Показать перевод
            </button>
          ) : (
            <button
              onClick={onNext}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Следующее слово
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент для грамматических упражнений
const GrammarExercise = ({ question, options, correctAnswer, onAnswer, showResult, userAnswer }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 m-4">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">{question}</h3>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              showResult
                ? option === correctAnswer
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : option === userAnswer && option !== correctAnswer
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-gray-100 border-gray-300'
                : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="mt-6 text-center">
          <p className={`text-lg font-semibold ${userAnswer === correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
            {userAnswer === correctAnswer ? 'Правильно! 🎉' : 'Неправильно 😞'}
          </p>
        </div>
      )}
    </div>
  );
};

// Компонент прогресса
const ProgressBar = ({ current, total, label }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
      <div 
        className="bg-blue-500 h-4 rounded-full transition-all duration-300" 
        style={{ width: `${percentage}%` }}
      ></div>
      <p className="text-sm text-gray-600 mt-1">{label}: {current}/{total}</p>
    </div>
  );
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [showGrammarResult, setShowGrammarResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [progress, setProgress] = useState({ words: 0, grammar: 0 });

  // Словарные данные
  const vocabulary = [
    {
      word: "Apple",
      translation: "Яблоко",
      example: "I eat an apple every day"
    },
    {
      word: "House",
      translation: "Дом",
      example: "This is my house"
    },
    {
      word: "Water",
      translation: "Вода",
      example: "I drink water"
    },
    {
      word: "Book",
      translation: "Книга",
      example: "I'm reading a book"
    },
    {
      word: "Friend",
      translation: "Друг",
      example: "He is my best friend"
    },
    {
      word: "School",
      translation: "Школа",
      example: "I go to school every day"
    },
    {
      word: "Food",
      translation: "Еда",
      example: "The food is delicious"
    },
    {
      word: "Music",
      translation: "Музыка",
      example: "I love listening to music"
    }
  ];

  // Грамматические упражнения
  const grammarExercises = [
    {
      question: "Выберите правильную форму глагола: 'I ___ to school every day'",
      options: ["go", "goes", "going", "went"],
      correctAnswer: "go"
    },
    {
      question: "Какой артикль нужен: '___ apple is red'",
      options: ["a", "an", "the", "нет артикля"],
      correctAnswer: "an"
    },
    {
      question: "Выберите правильное время: 'She ___ her homework yesterday'",
      options: ["does", "did", "do", "doing"],
      correctAnswer: "did"
    },
    {
      question: "Множественное число от 'child':",
      options: ["childs", "children", "childes", "child"],
      correctAnswer: "children"
    },
    {
      question: "Правильный порядок слов: 'usually / I / coffee / drink'",
      options: ["I usually drink coffee", "Usually I drink coffee", "I drink usually coffee", "Coffee I usually drink"],
      correctAnswer: "I usually drink coffee"
    }
  ];

  // Загрузка прогресса из localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('englishAppProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Сохранение прогресса
  const saveProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem('englishAppProgress', JSON.stringify(newProgress));
  };

  const handleNextWord = () => {
    if (!showAnswer) return;
    
    const newProgress = { ...progress, words: progress.words + 1 };
    saveProgress(newProgress);
    
    setCurrentWordIndex((prev) => (prev + 1) % vocabulary.length);
    setShowAnswer(false);
  };

  const handleGrammarAnswer = (answer) => {
    setUserAnswer(answer);
    setShowGrammarResult(true);
    
    if (answer === grammarExercises[currentGrammarIndex].correctAnswer) {
      const newProgress = { ...progress, grammar: progress.grammar + 1 };
      saveProgress(newProgress);
    }
    
    setTimeout(() => {
      setCurrentGrammarIndex((prev) => (prev + 1) % grammarExercises.length);
      setShowGrammarResult(false);
      setUserAnswer('');
    }, 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'vocabulary':
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Изучение словаря</h2>
            <div className="mb-8">
              <ProgressBar 
                current={progress.words} 
                total={vocabulary.length * 3} 
                label="Выученных слов" 
              />
            </div>
            <VocabularyCard
              word={vocabulary[currentWordIndex].word}
              translation={vocabulary[currentWordIndex].translation}
              example={vocabulary[currentWordIndex].example}
              onNext={handleNextWord}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
            />
          </div>
        );
      
      case 'grammar':
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Грамматика</h2>
            <div className="mb-8">
              <ProgressBar 
                current={progress.grammar} 
                total={grammarExercises.length * 2} 
                label="Правильных ответов" 
              />
            </div>
            <GrammarExercise
              question={grammarExercises[currentGrammarIndex].question}
              options={grammarExercises[currentGrammarIndex].options}
              correctAnswer={grammarExercises[currentGrammarIndex].correctAnswer}
              onAnswer={handleGrammarAnswer}
              showResult={showGrammarResult}
              userAnswer={userAnswer}
            />
          </div>
        );
      
      case 'test':
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Тестирование</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6">Смешанный тест</h3>
                <p className="text-gray-600 mb-8">
                  Этот раздел будет содержать комбинированные вопросы по словарю и грамматике
                </p>
                <button 
                  onClick={() => setActiveSection('vocabulary')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mr-4 transition-colors"
                >
                  Словарь
                </button>
                <button 
                  onClick={() => setActiveSection('grammar')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Грамматика
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'progress':
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Ваш прогресс</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Статистика обучения</h3>
                  <ProgressBar 
                    current={progress.words} 
                    total={vocabulary.length * 3} 
                    label="Словарь" 
                  />
                  <ProgressBar 
                    current={progress.grammar} 
                    total={grammarExercises.length * 2} 
                    label="Грамматика" 
                  />
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Достижения:</h4>
                  <ul className="space-y-2 text-blue-700">
                    {progress.words > 0 && <li>🎯 Начал изучение словаря</li>}
                    {progress.words >= 10 && <li>⭐ Выучил 10+ слов</li>}
                    {progress.grammar > 0 && <li>📚 Начал изучение грамматики</li>}
                    {progress.grammar >= 5 && <li>🏆 Правильно ответил на 5+ вопросов</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">Изучение английского языка</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Добро пожаловать в интерактивное приложение для изучения английского языка. 
                Выберите раздел для начала обучения.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div 
                onClick={() => setActiveSection('vocabulary')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Словарь</h3>
                <p className="text-blue-100">Изучайте новые слова с помощью интерактивных карточек</p>
              </div>
              
              <div 
                onClick={() => setActiveSection('grammar')}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">✏️</div>
                <h3 className="text-xl font-bold mb-2">Грамматика</h3>
                <p className="text-green-100">Практикуйте грамматические правила и структуры</p>
              </div>
              
              <div 
                onClick={() => setActiveSection('test')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">Тесты</h3>
                <p className="text-purple-100">Проверьте свои знания с помощью тестов</p>
              </div>
              
              <div 
                onClick={() => setActiveSection('progress')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Прогресс</h3>
                <p className="text-orange-100">Отслеживайте свои достижения и статистику</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div 
              onClick={() => setActiveSection('home')}
              className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
              English Learning 🇬🇧
            </div>
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveSection('vocabulary')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'vocabulary' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Словарь
              </button>
              <button
                onClick={() => setActiveSection('grammar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'grammar' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-600 hover:text-green-500'
                }`}
              >
                Грамматика
              </button>
              <button
                onClick={() => setActiveSection('test')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'test' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:text-purple-500'
                }`}
              >
                Тесты
              </button>
              <button
                onClick={() => setActiveSection('progress')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'progress' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                Прогресс
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;