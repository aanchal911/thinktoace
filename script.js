// ThinkToAce - Modern JavaScript with StudyMate AI Integration

class StudyMate {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api';
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendMessage');
    this.modal = new bootstrap.Modal(document.getElementById('studyMateModal'));
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Send message on button click
    this.sendButton?.addEventListener('click', () => this.sendMessage());
    
    // Send message on Enter key
    this.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    this.chatInput.value = '';

    // Show typing indicator
    this.showTyping();

    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      // Remove typing indicator
      this.hideTyping();
      
      // Add bot response
      this.addMessage(data.response, 'bot');
      
      // Add links if provided
      if (data.links && data.links.length > 0) {
        this.addLinks(data.links);
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
      console.error('Chat error:', error);
    }
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = this.formatMessage(content);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addLinks(links) {
    const linksDiv = document.createElement('div');
    linksDiv.className = 'message bot-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    let linksHtml = '<p><strong>Here are some helpful resources:</strong></p><ul>';
    links.forEach(link => {
      linksHtml += `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
    });
    linksHtml += '</ul>';
    
    messageContent.innerHTML = linksHtml;
    linksDiv.appendChild(avatar);
    linksDiv.appendChild(messageContent);
    
    this.chatMessages.appendChild(linksDiv);
    this.scrollToBottom();
  }

  formatMessage(content) {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
  }

  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="loading"></div> StudyMate is thinking...
      </div>
    `;
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTyping() {
    const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  open() {
    this.modal.show();
  }
}

// Initialize StudyMate
let studyMate;

// Global function to open StudyMate
function openStudyMate() {
  if (!studyMate) {
    studyMate = new StudyMate();
  }
  studyMate.open();
}

// Quiz System
class QuizSystem {
  constructor() {
    this.currentQuiz = null;
    this.timer = null;
    this.timeLeft = 0;
    this.modal = new bootstrap.Modal(document.getElementById('quizModal'));
  }

  async generateQuiz(subject, marks, duration) {
    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, marks, duration })
      });
      
      const data = await response.json();
      this.currentQuiz = data.quiz;
      this.displayQuiz(subject, marks, duration);
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz. Please try again.');
    }
  }

  displayQuiz(subject, marks, duration) {
    document.getElementById('quizTitle').textContent = `${subject} Quiz`;
    document.getElementById('quizInfo').textContent = `${subject} • ${duration} min • ${marks} marks`;
    
    const questionsContainer = document.getElementById('quizQuestions');
    questionsContainer.innerHTML = '';
    
    this.currentQuiz.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'quiz-question';
      questionDiv.innerHTML = `
        <h5>Q${index + 1}. ${question.question}</h5>
        <div class="quiz-options">
          ${question.options.map((option, optIndex) => `
            <div class="quiz-option" onclick="selectOption(${index}, ${optIndex})" data-question="${index}" data-option="${optIndex}">
              ${String.fromCharCode(65 + optIndex)}. ${option}
            </div>
          `).join('')}
        </div>
      `;
      questionsContainer.appendChild(questionDiv);
    });
    
    this.startTimer(duration);
    this.modal.show();
  }

  startTimer(duration) {
    this.timeLeft = duration * 60;
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.timeLeft <= 0) {
        this.submitQuiz();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    document.getElementById('timer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  submitQuiz() {
    clearInterval(this.timer);
    
    const answers = [];
    this.currentQuiz.forEach((_, index) => {
      const selected = document.querySelector(`[data-question="${index}"].selected`);
      answers.push(selected ? parseInt(selected.dataset.option) : -1);
    });
    
    const score = this.calculateScore(answers);
    this.showResults(score);
  }

  calculateScore(answers) {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === this.currentQuiz[index].correct) {
        correct++;
      }
    });
    
    const percentage = (correct / this.currentQuiz.length) * 100;
    return { correct, total: this.currentQuiz.length, percentage };
  }

  showResults(score) {
    const questionsContainer = document.getElementById('quizQuestions');
    questionsContainer.innerHTML = `
      <div class="text-center">
        <div class="quiz-result">
          <h2 class="mb-4">Quiz Completed!</h2>
          <div class="score-display">
            <div class="score-circle">
              <span class="score-percentage">${Math.round(score.percentage)}%</span>
            </div>
            <p class="mt-3">You scored ${score.correct} out of ${score.total} questions correctly</p>
            <div class="result-grade">
              <span class="badge ${this.getGradeBadge(score.percentage)}">${this.getGrade(score.percentage)}</span>
            </div>
          </div>
          <button class="btn btn-primary mt-4" onclick="closeQuiz()">Close Quiz</button>
        </div>
      </div>
    `;
    
    document.querySelector('.quiz-footer').style.display = 'none';
  }

  getGrade(percentage) {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  }

  getGradeBadge(percentage) {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 80) return 'bg-info';
    if (percentage >= 70) return 'bg-primary';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-danger';
  }
}

// Initialize Quiz System
let quizSystem;

// Global functions
function generateQuiz() {
  const subject = document.getElementById('quizSubject').value;
  const marks = document.getElementById('quizMarks').value;
  const duration = document.getElementById('quizDuration').value;
  
  if (!subject || !marks || !duration) {
    alert('Please fill all fields to generate quiz');
    return;
  }
  
  if (!quizSystem) {
    quizSystem = new QuizSystem();
  }
  
  quizSystem.generateQuiz(subject, marks, duration);
}

function selectOption(questionIndex, optionIndex) {
  // Remove previous selection
  document.querySelectorAll(`[data-question="${questionIndex}"]`).forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Add selection to clicked option
  document.querySelector(`[data-question="${questionIndex}"][data-option="${optionIndex}"]`)
    .classList.add('selected');
}

function submitQuiz() {
  if (quizSystem) {
    quizSystem.submitQuiz();
  }
}

function closeQuiz() {
  if (quizSystem) {
    quizSystem.modal.hide();
    document.querySelector('.quiz-footer').style.display = 'block';
  }
}

// Dark Mode Toggle
class ThemeManager {
  constructor() {
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.body = document.body;
    this.isDark = localStorage.getItem('darkMode') === 'true';
    
    this.init();
  }

  init() {
    // Set initial theme
    if (this.isDark) {
      this.enableDarkMode();
    }

    // Toggle event listener
    this.darkModeToggle?.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem('darkMode', this.isDark);
    
    if (this.isDark) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  enableDarkMode() {
    this.body.classList.add('dark-mode');
    this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    console.log('Dark mode enabled');
  }

  disableDarkMode() {
    this.body.classList.remove('dark-mode');
    this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    console.log('Dark mode disabled');
  }
}

// Smooth Scrolling for Navigation Links
class SmoothScroll {
  constructor() {
    this.navLinks = document.querySelectorAll('a[href^="#"]');
    this.init();
  }

  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// Navbar Scroll Effect
class NavbarEffect {
  constructor() {
    this.navbar = document.querySelector('.glass-nav');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        this.navbar.style.backdropFilter = 'blur(20px)';
      } else {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        this.navbar.style.backdropFilter = 'blur(10px)';
      }
    });
  }
}

// Intersection Observer for Animations
class AnimationObserver {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, this.observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.feature-card, .hero-content').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s ease';
      observer.observe(el);
    });
  }
}

// Particle System for Background
class ParticleSystem {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;
    
    this.init();
  }

  init() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';
    
    document.body.appendChild(this.canvas);
    
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }

  // Initialize all components
  new ThemeManager();
  new SmoothScroll();
  new NavbarEffect();
  new AnimationObserver();
  new ParticleSystem();

  // Simple button hover effects only
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  });
}