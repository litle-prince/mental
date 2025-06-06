import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Анимированный фон с частицами
const ParticleBackground = ({ theme }) => {
  return (
    <div className={`particle-background ${theme}`}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// Компонент переключения темы
const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
      title="Переключить тему"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

// Компонент стрика
const StreakCounter = ({ streak, theme }) => {
  return (
    <div className={`streak-counter ${theme}`}>
      <div className="streak-flame">🔥</div>
      <div className="streak-number">{streak}</div>
      <div className="streak-text">дней подряд</div>
    </div>
  );
};

// Улучшенный компонент словарных карточек с произношением
const VocabularyCard = ({ word, translation, example, onNext, showAnswer, onShowAnswer, theme, level }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) onShowAnswer();
  };

  return (
    <div className={`vocabulary-card-container ${theme}`}>
      <div className="level-indicator">
        Уровень: {level}
      </div>
      <div className={`vocabulary-card ${isFlipped ? 'flipped' : ''} ${theme}`} onClick={handleFlip}>
        <div className="card-front">
          <h3 className="word-text">{word}</h3>
          <button 
            onClick={(e) => { e.stopPropagation(); speakWord(); }}
            className="pronunciation-btn"
            title="Произношение"
          >
            🔊
          </button>
          <div className="card-hint">Нажмите для перевода</div>
        </div>
        <div className="card-back">
          <p className="translation-text">{translation}</p>
          <p className="example-text">"{example}"</p>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="next-btn">
            Следующее слово →
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент typing упражнений
const TypingExercise = ({ word, onComplete, theme }) => {
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef();

  useEffect(() => {
    if (typed.length === 1 && !startTime) {
      setStartTime(Date.now());
    }
    
    if (typed === word && startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // в минутах
      const wordsPerMinute = Math.round(1 / timeElapsed);
      setWpm(wordsPerMinute);
      setTimeout(() => onComplete(wordsPerMinute), 1000);
    }
  }, [typed, word, startTime, onComplete]);

  const resetExercise = () => {
    setTyped('');
    setStartTime(null);
    setWpm(0);
    inputRef.current.focus();
  };

  return (
    <div className={`typing-exercise ${theme}`}>
      <h3 className="typing-title">Упражнение на печать</h3>
      <div className="target-word">{word}</div>
      <div className="typing-area">
        {word.split('').map((char, index) => (
          <span
            key={index}
            className={`char ${
              index < typed.length
                ? typed[index] === char
                  ? 'correct'
                  : 'incorrect'
                : 'pending'
            }`}
          >
            {char}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="typing-input"
        placeholder="Начните печатать..."
        autoFocus
      />
      {typed === word && (
        <div className="typing-result">
          <div className="success-message">Отлично! 🎉</div>
          <div className="wpm-display">Скорость: {wpm} СПМ</div>
        </div>
      )}
      <button onClick={resetExercise} className="reset-btn">
        Сбросить
      </button>
    </div>
  );
};

// Drag & Drop упражнение
const DragDropExercise = ({ sentence, missingWord, options, onComplete, theme }) => {
  const [droppedWord, setDroppedWord] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, word) => {
    setDraggedItem(word);
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    setDroppedWord(word);
    
    if (word === missingWord) {
      setTimeout(() => onComplete(true), 1000);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`drag-drop-exercise ${theme}`}>
      <h3 className="exercise-title">Перетащите правильное слово</h3>
      <div className="sentence-container">
        {sentence.split('___').map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index === 0 && (
              <div
                className={`drop-zone ${droppedWord ? 'filled' : ''} ${
                  droppedWord === missingWord ? 'correct' : droppedWord ? 'incorrect' : ''
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {droppedWord || '___'}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="word-options">
        {options.map((word, index) => (
          <div
            key={index}
            className={`draggable-word ${draggedItem === word ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, word)}
          >
            {word}
          </div>
        ))}
      </div>
      {droppedWord === missingWord && (
        <div className="success-animation">
          <div className="checkmark">✓</div>
          <div>Правильно!</div>
        </div>
      )}
    </div>
  );
};

// Мини-игра "Найди пару"
const MemoryGame = ({ pairs, onComplete, theme }) => {
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const cards = [...pairs.map((pair, i) => ({ id: i * 2, content: pair.en, type: 'en' })),
                 ...pairs.map((pair, i) => ({ id: i * 2 + 1, content: pair.ru, type: 'ru' }))];
  
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

  const handleCardClick = (cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      const firstCard = shuffledCards.find(c => c.id === first);
      const secondCard = shuffledCards.find(c => c.id === second);
      
      const firstPairIndex = Math.floor(first / 2);
      const secondPairIndex = Math.floor(second / 2);
      
      if (firstPairIndex === secondPairIndex && firstCard.type !== secondCard.type) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        if (matched.length + 2 === shuffledCards.length) {
          setTimeout(() => onComplete(moves + 1), 1000);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className={`memory-game ${theme}`}>
      <h3 className="game-title">Найди пары: Ходы {moves}</h3>
      <div className="cards-grid">
        {shuffledCards.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${
              flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''
            } ${matched.includes(card.id) ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">?</div>
            <div className="card-back">{card.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент детальной статистики с графиками
const DetailedStats = ({ stats, theme }) => {
  const maxValue = Math.max(...stats.daily.map(d => d.words + d.grammar));
  
  return (
    <div className={`detailed-stats ${theme}`}>
      <h3 className="stats-title">Детальная статистика</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Общая статистика</h4>
          <div className="stat-item">
            <span>Всего слов изучено:</span>
            <span className="stat-value">{stats.totalWords}</span>
          </div>
          <div className="stat-item">
            <span>Правильных ответов:</span>
            <span className="stat-value">{stats.totalCorrect}</span>
          </div>
          <div className="stat-item">
            <span>Точность:</span>
            <span className="stat-value">{stats.accuracy}%</span>
          </div>
          <div className="stat-item">
            <span>Средняя скорость печати:</span>
            <span className="stat-value">{stats.avgWPM} СПМ</span>
          </div>
        </div>

        <div className="chart-container">
          <h4>Активность за неделю</h4>
          <div className="bar-chart">
            {stats.daily.map((day, index) => (
              <div key={index} className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${((day.words + day.grammar) / maxValue) * 100}%` }}
                >
                  <div className="bar-words" style={{ height: `${(day.words / (day.words + day.grammar)) * 100}%` }}></div>
                </div>
                <div className="bar-label">{day.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="achievements-showcase">
        <h4>Достижения</h4>
        <div className="achievement-grid">
          {stats.achievements.map((achievement, index) => (
            <div key={index} className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-text">
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-desc">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('light');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [showGrammarResult, setShowGrammarResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [streak, setStreak] = useState(5);
  const [progress, setProgress] = useState({ 
    words: 0, 
    grammar: 0, 
    typing: 0, 
    games: 0,
    totalWPM: 0,
    attempts: 0
  });

  // Расширенные словарные данные с уровнями
  const vocabularyByLevel = {
    beginner: [
      { word: "Apple", translation: "Яблоко", example: "I eat an apple every day" },
      { word: "House", translation: "Дом", example: "This is my house" },
      { word: "Water", translation: "Вода", example: "I drink water" },
      { word: "Book", translation: "Книга", example: "I'm reading a book" }
    ],
    intermediate: [
      { word: "Beautiful", translation: "Красивый", example: "The sunset is beautiful" },
      { word: "Important", translation: "Важный", example: "This is very important" },
      { word: "Comfortable", translation: "Удобный", example: "This chair is comfortable" },
      { word: "Interesting", translation: "Интересный", example: "The movie was interesting" }
    ],
    advanced: [
      { word: "Magnificent", translation: "Великолепный", example: "The view was magnificent" },
      { word: "Extraordinary", translation: "Необычайный", example: "She has extraordinary talent" },
      { word: "Sophisticated", translation: "Изощренный", example: "A sophisticated approach" },
      { word: "Tremendous", translation: "Огромный", example: "He made tremendous progress" }
    ]
  };

  const currentVocabulary = vocabularyByLevel[currentLevel];

  // Данные для игр
  const memoryPairs = [
    { en: "Cat", ru: "Кот" },
    { en: "Dog", ru: "Собака" },
    { en: "Bird", ru: "Птица" },
    { en: "Fish", ru: "Рыба" }
  ];

  const dragDropExercises = [
    {
      sentence: "I ___ to school every day",
      missingWord: "go",
      options: ["go", "goes", "going", "went"]
    },
    {
      sentence: "She ___ a book yesterday",
      missingWord: "read",
      options: ["read", "reads", "reading", "will read"]
    }
  ];

  // Детальная статистика
  const detailedStats = {
    totalWords: progress.words,
    totalCorrect: progress.grammar,
    accuracy: progress.attempts > 0 ? Math.round((progress.grammar / progress.attempts) * 100) : 0,
    avgWPM: progress.attempts > 0 ? Math.round(progress.totalWPM / progress.attempts) : 0,
    daily: [
      { day: 'Пн', words: 5, grammar: 3 },
      { day: 'Вт', words: 8, grammar: 5 },
      { day: 'Ср', words: 12, grammar: 7 },
      { day: 'Чт', words: 6, grammar: 4 },
      { day: 'Пт', words: 10, grammar: 8 },
      { day: 'Сб', words: 15, grammar: 10 },
      { day: 'Вс', words: 7, grammar: 5 }
    ],
    achievements: [
      { icon: '🎯', title: 'Первые шаги', description: 'Выучили первое слово', unlocked: progress.words > 0 },
      { icon: '📚', title: 'Книжный червь', description: 'Выучили 10 слов', unlocked: progress.words >= 10 },
      { icon: '⚡', title: 'Скоростной', description: 'Печать 30+ СПМ', unlocked: progress.totalWPM / Math.max(progress.attempts, 1) >= 30 },
      { icon: '🔥', title: 'Серия', description: '5 дней подряд', unlocked: streak >= 5 },
      { icon: '🏆', title: 'Мастер', description: 'Изучили все уровни', unlocked: currentLevel === 'advanced' && progress.words >= 30 }
    ]
  };

  // Загрузка настроек
  useEffect(() => {
    const savedTheme = localStorage.getItem('englishAppTheme');
    const savedProgress = localStorage.getItem('englishAppProgress');
    const savedStreak = localStorage.getItem('englishAppStreak');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('englishAppTheme', newTheme);
  };

  const saveProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem('englishAppProgress', JSON.stringify(newProgress));
  };

  const handleNextWord = () => {
    if (!showAnswer) return;
    
    const newProgress = { ...progress, words: progress.words + 1 };
    saveProgress(newProgress);
    
    setCurrentWordIndex((prev) => (prev + 1) % currentVocabulary.length);
    setShowAnswer(false);
  };

  const handleTypingComplete = (wpm) => {
    const newProgress = { 
      ...progress, 
      typing: progress.typing + 1,
      totalWPM: progress.totalWPM + wpm,
      attempts: progress.attempts + 1
    };
    saveProgress(newProgress);
  };

  const handleGameComplete = (moves) => {
    const newProgress = { ...progress, games: progress.games + 1 };
    saveProgress(newProgress);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'vocabulary':
        return (
          <div className={`main-content ${theme}`}>
            <div className="section-header">
              <h2 className="section-title">Изучение словаря</h2>
              <div className="level-selector">
                <select 
                  value={currentLevel} 
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className={`level-select ${theme}`}
                >
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
            </div>
            
            <VocabularyCard
              word={currentVocabulary[currentWordIndex].word}
              translation={currentVocabulary[currentWordIndex].translation}
              example={currentVocabulary[currentWordIndex].example}
              onNext={handleNextWord}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              theme={theme}
              level={currentLevel}
            />
          </div>
        );

      case 'typing':
        return (
          <div className={`main-content ${theme}`}>
            <h2 className="section-title">Упражнения на печать</h2>
            <TypingExercise
              word={currentVocabulary[currentWordIndex].word}
              onComplete={handleTypingComplete}
              theme={theme}
            />
          </div>
        );

      case 'games':
        return (
          <div className={`main-content ${theme}`}>
            <h2 className="section-title">Обучающие игры</h2>
            <div className="games-container">
              <div className="game-section">
                <h3>Найди пары</h3>
                <MemoryGame
                  pairs={memoryPairs}
                  onComplete={handleGameComplete}
                  theme={theme}
                />
              </div>
              <div className="game-section">
                <h3>Перетащи слово</h3>
                <DragDropExercise
                  sentence={dragDropExercises[0].sentence}
                  missingWord={dragDropExercises[0].missingWord}
                  options={dragDropExercises[0].options}
                  onComplete={(correct) => correct && handleGameComplete()}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className={`main-content ${theme}`}>
            <h2 className="section-title">Детальная статистика</h2>
            <DetailedStats stats={detailedStats} theme={theme} />
          </div>
        );

      default:
        return (
          <div className={`main-content ${theme}`}>
            <div className="hero-section">
              <h1 className="hero-title">Изучение английского языка</h1>
              <p className="hero-subtitle">
                Интерактивное приложение нового поколения с продвинутыми функциями обучения
              </p>
              <StreakCounter streak={streak} theme={theme} />
            </div>
            
            <div className="features-grid">
              <div className="feature-card vocabulary" onClick={() => setActiveSection('vocabulary')}>
                <div className="feature-icon">📚</div>
                <h3>Умный словарь</h3>
                <p>Изучение с произношением и адаптивными уровнями</p>
              </div>
              
              <div className="feature-card typing" onClick={() => setActiveSection('typing')}>
                <div className="feature-icon">⌨️</div>
                <h3>Скоростная печать</h3>
                <p>Развивайте навыки печати на английском языке</p>
              </div>
              
              <div className="feature-card games" onClick={() => setActiveSection('games')}>
                <div className="feature-icon">🎮</div>
                <h3>Интерактивные игры</h3>
                <p>Обучение через увлекательные мини-игры</p>
              </div>
              
              <div className="feature-card progress" onClick={() => setActiveSection('progress')}>
                <div className="feature-icon">📊</div>
                <h3>Аналитика Pro</h3>
                <p>Детальная статистика и визуализация прогресса</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <ParticleBackground theme={theme} />
      
      <nav className={`navbar ${theme}`}>
        <div className="nav-container">
          <div className="nav-brand" onClick={() => setActiveSection('home')}>
            English Learning Pro 🚀
          </div>
          <div className="nav-menu">
            <button
              onClick={() => setActiveSection('vocabulary')}
              className={`nav-item ${activeSection === 'vocabulary' ? 'active' : ''}`}
            >
              📚 Словарь
            </button>
            <button
              onClick={() => setActiveSection('typing')}
              className={`nav-item ${activeSection === 'typing' ? 'active' : ''}`}
            >
              ⌨️ Печать
            </button>
            <button
              onClick={() => setActiveSection('games')}
              className={`nav-item ${activeSection === 'games' ? 'active' : ''}`}
            >
              🎮 Игры
            </button>
            <button
              onClick={() => setActiveSection('progress')}
              className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
            >
              📊 Статистика
            </button>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </nav>

      <main className="main-container">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;