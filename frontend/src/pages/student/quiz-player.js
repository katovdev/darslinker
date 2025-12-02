// Quiz player with 3 states: start, active, results
let quizState = {
  state: 'start', // start, active, results
  currentAttempt: 1,
  maxAttempts: 3,
  score: 0,
  answers: {},
  timerInterval: null,
  timeElapsed: 0,
  timeLimit: 0, // in seconds
  timeRemaining: 0, // in seconds
  currentQuestionIndex: 0 // current question being displayed
};

export function loadQuizPlayer(course, lesson, sidebarHtml) {
  const mainContent = document.querySelector('.course-learning-page');
  if (!mainContent) return;
  
  // Get time limit from lesson (in minutes, convert to seconds)
  const timeLimitMinutes = parseInt(lesson.timeLimit) || 30;
  const timeLimitSeconds = timeLimitMinutes * 60;
  
  // Reset quiz state
  quizState = {
    state: 'start',
    currentAttempt: 1,
    maxAttempts: 3,
    score: 0,
    answers: {},
    timerInterval: null,
    timeElapsed: 0,
    timeLimit: timeLimitSeconds,
    timeRemaining: timeLimitSeconds,
    currentQuestionIndex: 0
  };
  
  renderQuizPage(course, lesson, sidebarHtml);
}

function renderQuizPage(course, lesson, sidebarHtml) {
  const mainContent = document.querySelector('.course-learning-page');
  if (!mainContent) return;
  
  const questions = lesson.questions || [];
  
  if (quizState.state === 'start') {
    renderQuizStart(mainContent, course, lesson, sidebarHtml);
  } else if (quizState.state === 'active') {
    renderQuizActive(mainContent, course, lesson, sidebarHtml, questions);
  } else if (quizState.state === 'results') {
    renderQuizResults(mainContent, course, lesson, sidebarHtml, questions);
  }
}

// Render quiz start page
function renderQuizStart(mainContent, course, lesson, sidebarHtml) {
  mainContent.innerHTML = `
    <style>
      ${getSharedStyles()}
      
      .quiz-start-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        padding: 40px;
      }
      
      .quiz-start-card {
        max-width: 600px;
        width: 100%;
        background: rgba(58, 56, 56, 0.3);
        border: 1px solid rgba(126, 162, 212, 0.2);
        border-radius: 20px;
        padding: 48px;
        text-align: center;
      }
      
      .quiz-start-title {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 16px;
      }
      
      .quiz-start-info {
        font-size: 16px;
        color: #9CA3AF;
        margin-bottom: 32px;
      }
      
      .quiz-start-meta {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin-bottom: 40px;
      }
      
      .quiz-meta-item {
        text-align: center;
      }
      
      .quiz-meta-label {
        font-size: 13px;
        color: #9CA3AF;
        margin-bottom: 8px;
      }
      
      .quiz-meta-value {
        font-size: 24px;
        font-weight: 700;
        color: #7ea2d4;
      }
      
      .quiz-start-btn {
        padding: 16px 48px;
        background: #7ea2d4;
        color: #ffffff;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .quiz-start-btn:hover {
        background: #6b8fc4;
        transform: translateY(-2px);
      }
    </style>
    
    ${getHeaderHtml()}
    
    <div class="quiz-container">
      ${sidebarHtml}
      
      <div class="quiz-start-container">
        <div class="quiz-start-card">
          <h1 class="quiz-start-title">${lesson.title}</h1>
          
          <div class="quiz-start-meta">
            <div class="quiz-meta-item">
              <div class="quiz-meta-label">Savollar soni</div>
              <div class="quiz-meta-value">${(lesson.questions || []).length}</div>
            </div>
            <div class="quiz-meta-item">
              <div class="quiz-meta-label">Urinishlar</div>
              <div class="quiz-meta-value">${quizState.currentAttempt}/${quizState.maxAttempts}</div>
            </div>
            <div class="quiz-meta-item">
              <div class="quiz-meta-label">Timer</div>
              <div class="quiz-meta-value">${lesson.timeLimit || 30} min</div>
            </div>
          </div>
          
          <button class="quiz-start-btn" onclick="startQuiz()">Boshlash</button>
        </div>
      </div>
    </div>
  `;
  
  attachQuizEventListeners(course, lesson, sidebarHtml);
}

// Render active quiz
function renderQuizActive(mainContent, course, lesson, sidebarHtml, questions) {
  mainContent.innerHTML = `
    <style>
      ${getSharedStyles()}
      ${getQuizActiveStyles()}
    </style>
    
    ${getHeaderHtml()}
    
    <div class="quiz-container">
      ${sidebarHtml}
      
      <div class="quiz-content">
        <div class="quiz-header-sticky">
          <div class="quiz-header">
            <div class="quiz-header-left">
              <div class="quiz-breadcrumb">
                <span>${course.title}</span>
                <span>›</span>
                <span>${lesson.title}</span>
              </div>
              <h1 class="quiz-title">${lesson.title}</h1>
            </div>
            <div class="quiz-timer-display">
              <svg class="timer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span class="timer-value" id="quizTimer">${formatTime(quizState.timeRemaining)}</span>
            </div>
          </div>
        </div>
        
        <div class="quiz-questions" id="quizQuestions">
          ${renderQuizQuestions(questions)}
        </div>
      </div>
    </div>
  `;
  
  attachQuizEventListeners(course, lesson, sidebarHtml);
  startQuizTimer();
}

// Render quiz results
function renderQuizResults(mainContent, course, lesson, sidebarHtml, questions) {
  const totalQuestions = questions.length;
  const correctAnswers = Object.values(quizState.answers).filter(a => a.isCorrect).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  mainContent.innerHTML = `
    <style>
      ${getSharedStyles()}
      ${getQuizActiveStyles()}
    </style>
    
    ${getHeaderHtml()}
    
    <div class="quiz-container">
      ${sidebarHtml}
      
      <div class="quiz-content">
        <div class="quiz-results-container">
          <h1 class="results-title">Test natijalari</h1>
          
          <div class="results-stats">
            <div class="result-stat-card">
              <div class="result-stat-label">Natijangiz</div>
              <div class="result-stat-value" style="color: ${percentage >= 75 ? '#10B981' : '#EF4444'}">${percentage}%</div>
            </div>
            <div class="result-stat-card">
              <div class="result-stat-label">To'g'ri javoblar</div>
              <div class="result-stat-value">${correctAnswers}/${totalQuestions}</div>
            </div>
          </div>
          
          <div class="results-actions">
            <button 
              class="quiz-btn quiz-btn-primary" 
              onclick="retryQuiz()" 
              ${quizState.currentAttempt >= quizState.maxAttempts ? 'disabled' : ''}>
              Qayta urinish (${quizState.currentAttempt}/${quizState.maxAttempts})
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  attachQuizEventListeners(course, lesson, sidebarHtml);
}

// Get shared styles
function getSharedStyles() {
  return `
    .lesson-sidebar {
      width: 280px;
      background: #2a2a2a;
      border-right: 1px solid rgba(126, 162, 212, 0.15);
      overflow-y: auto;
      overflow-x: hidden;
      flex-shrink: 0;
    }
    
    .lesson-sidebar::-webkit-scrollbar {
      width: 6px;
    }
    
    .lesson-sidebar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .lesson-sidebar::-webkit-scrollbar-thumb {
      background: rgba(126, 162, 212, 0.3);
      border-radius: 3px;
    }
    
    .sidebar-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    
    .sidebar-course-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      flex: 1;
    }
    
    .sidebar-close {
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border-radius: 4px;
    }
    
    .sidebar-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #7ea2d4;
    }
    
    .sidebar-modules {
      padding: 12px 0;
    }
    
    .sidebar-module {
      border-bottom: 1px solid rgba(126, 162, 212, 0.1);
    }
    
    .sidebar-module-header {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .sidebar-module-header:hover {
      background: rgba(126, 162, 212, 0.05);
    }
    
    .sidebar-module-title {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .sidebar-module-count {
      font-size: 12px;
      color: #9CA3AF;
    }
    
    .sidebar-module-arrow {
      color: #7ea2d4;
      font-size: 12px;
      transition: transform 0.3s;
    }
    
    .sidebar-module-arrow.rotated {
      transform: rotate(-180deg);
    }
    
    .sidebar-module-lessons {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .sidebar-module-lessons.expanded {
      max-height: 2000px;
    }
    
    .sidebar-lesson {
      padding: 14px 24px 14px 44px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 4px solid transparent;
      position: relative;
    }
    
    .sidebar-lesson:hover {
      background: rgba(126, 162, 212, 0.1);
    }
    
    .sidebar-lesson.active {
      background: rgba(126, 162, 212, 0.2);
      border-left-color: #7ea2d4;
    }
    
    .sidebar-lesson-icon {
      color: #7ea2d4;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    
    .sidebar-lesson-icon svg {
      display: block;
    }
    
    .sidebar-lesson-info {
      flex: 1;
    }
    
    .sidebar-lesson-title {
      font-size: 14px;
      color: #ffffff;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .sidebar-lesson-duration {
      font-size: 12px;
      color: #9CA3AF;
    }
    
    .quiz-container {
      display: flex;
      height: calc(100vh - 81px);
      background: #232323;
    }
  `;
}

// Get quiz active styles
function getQuizActiveStyles() {
  return `
    .quiz-content {
      flex: 1;
      padding: 0;
      overflow-y: auto;
      background: #1a1a1a;
    }
    
    .quiz-header-sticky {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(10px);
      padding: 20px 60px;
      border-bottom: 1px solid rgba(126, 162, 212, 0.2);
      margin-bottom: 32px;
    }
    
    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }
    
    .quiz-header-left {
      flex: 1;
    }
    
    .quiz-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #9CA3AF;
      margin-bottom: 12px;
    }
    
    .quiz-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .quiz-timer-display {
      background: rgba(126, 162, 212, 0.15);
      border: 1.5px solid #7ea2d4;
      border-radius: 8px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }
    
    .timer-icon {
      color: #7ea2d4;
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
    
    .timer-value {
      font-size: 20px;
      font-weight: 700;
      color: #7ea2d4;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
    
    .timer-value.warning {
      color: #FBBF24;
    }
    
    .timer-value.danger {
      color: #EF4444;
      animation: blink 1s ease-in-out infinite;
    }
    
    @keyframes blink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
    }
    
    .quiz-warning {
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    
    .quiz-warning-icon {
      color: #FBBF24;
      flex-shrink: 0;
    }
    
    .quiz-warning-text {
      font-size: 14px;
      color: #FBBF24;
    }
    
    .quiz-questions {
      padding: 0 60px 40px 60px;
    }
    
    .quiz-question-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .question-progress {
      margin-bottom: 24px;
    }
    
    .progress-text {
      font-size: 14px;
      color: #9CA3AF;
      margin-bottom: 8px;
      display: block;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(58, 56, 56, 0.5);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #7ea2d4, #6b8fc4);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .quiz-question {
      background: rgba(58, 56, 56, 0.3);
      border: 1px solid rgba(126, 162, 212, 0.2);
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
    }
    
    .question-header {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .question-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .question-option {
      background: rgba(40, 40, 40, 0.5);
      border: 2px solid rgba(126, 162, 212, 0.2);
      border-radius: 8px;
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 15px;
      color: #e0e0e0;
    }
    
    .question-option:hover {
      background: rgba(126, 162, 212, 0.1);
      border-color: #7ea2d4;
    }
    
    .question-option.selected {
      background: rgba(126, 162, 212, 0.2);
      border-color: #7ea2d4;
      color: #ffffff;
    }
    
    .question-navigation {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 24px;
    }
    
    .nav-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .nav-btn-prev {
      background: rgba(58, 56, 56, 0.5);
      border: 1px solid rgba(126, 162, 212, 0.3);
      color: #9CA3AF;
    }
    
    .nav-btn-prev:hover:not(:disabled) {
      background: rgba(126, 162, 212, 0.1);
      color: #ffffff;
    }
    
    .nav-btn-prev:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .nav-btn-next,
    .nav-btn-finish {
      background: #7ea2d4;
      color: #ffffff;
      margin-left: auto;
    }
    
    .nav-btn-next:hover,
    .nav-btn-finish:hover {
      background: #6b8fc4;
    }
    
    .quiz-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    
    .quiz-btn {
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    
    .quiz-btn-secondary {
      background: rgba(58, 56, 56, 0.5);
      border: 1px solid rgba(126, 162, 212, 0.3);
      color: #9CA3AF;
    }
    
    .quiz-btn-secondary:hover {
      background: rgba(126, 162, 212, 0.1);
      color: #ffffff;
    }
    
    .quiz-btn-primary {
      background: #7ea2d4;
      color: #ffffff;
    }
    
    .quiz-btn-primary:hover {
      background: #6b8fc4;
    }
    
    .quiz-btn-primary:disabled {
      background: #4B5563;
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    /* Results Page Styles */
    .quiz-results-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 200px);
    }
    
    .results-title {
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 48px;
      text-align: center;
    }
    
    .results-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 600px;
      width: 100%;
      margin-bottom: 48px;
    }
    
    .result-stat-card {
      background: rgba(58, 56, 56, 0.3);
      border: 1px solid rgba(126, 162, 212, 0.2);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    
    .result-stat-label {
      font-size: 14px;
      color: #9CA3AF;
      margin-bottom: 12px;
    }
    
    .result-stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
    }
    
    .result-stat-value.timer {
      font-family: 'Courier New', monospace;
    }
    
    .results-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  `;
}

// Get header HTML
function getHeaderHtml() {
  return `
    <header class="course-learning-header">
      <div class="header-logo">
        <span class="logo-text">dars<span class="logo-highlight">linker</span></span>
      </div>
      <div class="header-actions">
        <button class="icon-btn meeting-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button class="icon-btn notification-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
        <button class="icon-btn" style="margin-right: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </button>
        <button class="icon-btn logout-btn" title="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="logout-text">Log out</span>
        </button>
      </div>
    </header>
  `;
}

// Render quiz questions
function renderQuizQuestions(questions) {
  const currentIndex = quizState.currentQuestionIndex;
  const q = questions[currentIndex];
  const totalQuestions = questions.length;
  
  if (!q) return '<p style="color: #9CA3AF;">No questions available</p>';
  
  // Check if this question was already answered
  const selectedAnswer = quizState.answers[currentIndex];
  
  return `
    <div class="quiz-question-container">
      <div class="question-progress">
        <span class="progress-text">Savol ${currentIndex + 1} / ${totalQuestions}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((currentIndex + 1) / totalQuestions) * 100}%"></div>
        </div>
      </div>
      
      <div class="quiz-question">
        <div class="question-header">${q.question}</div>
        <div class="question-options">
          ${(q.answers || q.options || []).map((answer, aIndex) => {
            const answerText = typeof answer === 'string' ? answer : answer.text;
            const isSelected = selectedAnswer?.answerIndex === aIndex;
            return `
              <div class="question-option ${isSelected ? 'selected' : ''}" 
                   data-question="${currentIndex}" 
                   data-answer="${aIndex}" 
                   onclick="selectAnswer(${currentIndex}, ${aIndex})">
                ${answerText}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="question-navigation">
        <button class="nav-btn nav-btn-prev" 
                onclick="previousQuestion()" 
                ${currentIndex === 0 ? 'disabled' : ''}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Oldingi
        </button>
        
        ${currentIndex < totalQuestions - 1 
          ? `<button class="nav-btn nav-btn-next" onclick="nextQuestion()">
               Keyingi
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M9 18l6-6-6-6"/>
               </svg>
             </button>`
          : `<button class="nav-btn nav-btn-finish" onclick="finishQuiz()">
               Tugatish
             </button>`
        }
      </div>
    </div>
  `;
}

// Start quiz
window.startQuiz = function() {
  quizState.state = 'active';
  quizState.timeElapsed = 0;
  quizState.timeRemaining = quizState.timeLimit; // Reset timer
  const course = window.currentCourse;
  const lesson = window.currentLesson;
  const sidebarHtml = window.currentSidebarHtml;
  renderQuizPage(course, lesson, sidebarHtml);
};

// Select answer
window.selectAnswer = function(questionIndex, answerIndex) {
  const lesson = window.currentLesson;
  const question = lesson.questions[questionIndex];
  
  // Check if answer is correct
  let isCorrect = false;
  if (question) {
    // Check if correctAnswer is index or the answer object has isCorrect property
    if (typeof question.correctAnswer === 'number') {
      isCorrect = answerIndex === question.correctAnswer;
    } else if (question.answers && question.answers[answerIndex]) {
      const answer = question.answers[answerIndex];
      isCorrect = answer.isCorrect === true || answer.correct === true;
    } else if (question.options && question.options[answerIndex]) {
      const option = question.options[answerIndex];
      isCorrect = option.isCorrect === true || option.correct === true;
    }
  }
  
  // Save answer
  quizState.answers[questionIndex] = {
    answerIndex: answerIndex,
    isCorrect: isCorrect
  };
  
  // Update UI
  const options = document.querySelectorAll('.question-option');
  options.forEach(opt => opt.classList.remove('selected'));
  options[answerIndex].classList.add('selected');
};

// Next question
window.nextQuestion = function() {
  const course = window.currentCourse;
  const lesson = window.currentLesson;
  const totalQuestions = (lesson.questions || []).length;
  
  if (quizState.currentQuestionIndex < totalQuestions - 1) {
    quizState.currentQuestionIndex++;
    renderQuizPage(course, lesson, window.currentSidebarHtml);
  }
};

// Previous question
window.previousQuestion = function() {
  const course = window.currentCourse;
  const lesson = window.currentLesson;
  
  if (quizState.currentQuestionIndex > 0) {
    quizState.currentQuestionIndex--;
    renderQuizPage(course, lesson, window.currentSidebarHtml);
  }
};

// Start timer
function startQuizTimer() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
  }
  
  quizState.timerInterval = setInterval(() => {
    quizState.timeRemaining--;
    quizState.timeElapsed++;
    
    const timerElement = document.getElementById('quizTimer');
    if (timerElement) {
      timerElement.textContent = formatTime(quizState.timeRemaining);
      
      // Change color based on remaining time
      const percentRemaining = (quizState.timeRemaining / quizState.timeLimit) * 100;
      if (percentRemaining <= 10) {
        timerElement.classList.add('danger');
        timerElement.classList.remove('warning');
      } else if (percentRemaining <= 25) {
        timerElement.classList.add('warning');
        timerElement.classList.remove('danger');
      } else {
        timerElement.classList.remove('warning', 'danger');
      }
    }
    
    // Auto-finish when time runs out
    if (quizState.timeRemaining <= 0) {
      clearInterval(quizState.timerInterval);
      showToast('Vaqt tugadi! Quiz avtomatik tugatildi.');
      setTimeout(() => {
        window.finishQuiz();
      }, 1000);
    }
  }, 1000);
}

// Format time
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Finish quiz
window.finishQuiz = function() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
  }
  
  quizState.state = 'results';
  const course = window.currentCourse;
  const lesson = window.currentLesson;
  const sidebarHtml = window.currentSidebarHtml;
  renderQuizPage(course, lesson, sidebarHtml);
};

// Retry quiz
window.retryQuiz = function() {
  quizState.currentAttempt++;
  quizState.state = 'start';
  quizState.answers = {};
  quizState.timeRemaining = quizState.timeLimit; // Reset timer
  quizState.currentQuestionIndex = 0; // Reset to first question
  const course = window.currentCourse;
  const lesson = window.currentLesson;
  const sidebarHtml = window.currentSidebarHtml;
  renderQuizPage(course, lesson, sidebarHtml);
};

// Attach event listeners
function attachQuizEventListeners(course, lesson, sidebarHtml) {
  // Store for later use
  window.currentCourse = course;
  window.currentLesson = lesson;
  window.currentSidebarHtml = sidebarHtml;
  
  // Header buttons
  const meetingBtn = document.querySelector('.meeting-btn');
  if (meetingBtn) {
    meetingBtn.addEventListener('click', () => showToast('Coming soon'));
  }
  
  const notificationBtn = document.querySelector('.notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => showToast('Coming soon'));
  }
  
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Auto-expand the module containing current lesson
  setTimeout(() => {
    if (course.modules) {
      course.modules.forEach((module, index) => {
        if (module.lessons && module.lessons.some(l => l._id === lesson._id)) {
          const lessonsDiv = document.getElementById(`player-lessons-${index}`);
          const arrow = document.getElementById(`player-arrow-${index}`);
          if (lessonsDiv && arrow) {
            lessonsDiv.classList.add('expanded');
            arrow.classList.add('rotated');
          }
        }
      });
    }
  }, 100);
}

// Show toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #7ea2d4;
    color: #ffffff;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Handle logout
function handleLogout() {
  sessionStorage.clear();
  showToast('Logging out...');
  setTimeout(() => window.location.href = '/', 1000);
}
