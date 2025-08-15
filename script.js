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
  }

  disableDarkMode() {
    this.body.classList.remove('dark-mode');
    this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
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

  // Add loading animation to buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.classList.contains('loading')) {
        this.classList.add('loading');
        setTimeout(() => this.classList.remove('loading'), 2000);
      }
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