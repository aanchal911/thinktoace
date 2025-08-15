// Advanced ThinkToAce JavaScript with Enhanced Features
class ThinkToAce {
    constructor() {
        this.currentTheme = 'dark';
        this.quizData = null;
        this.quizTimer = null;
        this.quizStartTime = null;
        this.userAnswers = {};
        this.init();
    }

    init() {
        this.initAOS();
        this.initEventListeners();
        this.initTheme();
        this.initAnimations();
    }

    initAOS() {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }

    initEventListeners() {
        // Chat input enter key
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.15)';
                navbar.style.backdropFilter = 'blur(25px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.1)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
    }

    initAnimations() {
        // Floating shapes animation
        this.animateFloatingShapes();
        
        // Typing animation for hero text
        this.typeWriter();
    }

    animateFloatingShapes() {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const randomDelay = Math.random() * 5;
            const randomDuration = 15 + Math.random() * 10;
            shape.style.animationDelay = `${randomDelay}s`;
            shape.style.animationDuration = `${randomDuration}s`;
        });
    }

    typeWriter() {
        const text = "Empower Your Learning with AI Technology";
        const element = document.querySelector('.hero-title');
        if (!element) return;

        element.innerHTML = `Empower Your Learning with <span class="gradient-text">AI Technology</span>`;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const chatMessages = document.getElementById('chatMessages');
        
        // Clear input immediately
        input.value = '';
        
        // Add user message
        this.addMessage(chatMessages, message, 'user');
        
        // Scroll to show user message
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator(chatMessages);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            console.log('🔄 Connecting to StudyMate AI...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch('https://your-vercel-app.vercel.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            // Remove typing indicator
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            if (data.response) {
                console.log('✅ Real AI response received');
                this.addMessage(chatMessages, data.response, 'bot');
                
                // Add resource links if available
                if (data.youtube_link || data.google_link) {
                    this.addResourceLinks(chatMessages, data.youtube_link, data.google_link);
                }
            } else {
                console.log('⚠️ No response in data:', data);
                this.addMessage(chatMessages, 'Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('❌ Connection failed:', error.name, error.message);
            
            // Remove typing indicator
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Show connection status to user
            if (error.name === 'AbortError') {
                this.addMessage(chatMessages, '⏱️ Request timed out. The server might be starting up. Please try again in a moment.', 'bot');
            } else if (error.message.includes('Failed to fetch')) {
                this.addMessage(chatMessages, '🔌 Cannot connect to StudyMate server. Make sure the server is running on localhost:5000', 'bot');
            } else {
                // Provide intelligent fallback based on message content
                const fallbackResponse = this.generateFallbackResponse(message);
                this.addMessage(chatMessages, fallbackResponse, 'bot');
                
                // Add helpful resource links
                this.addResourceLinks(chatMessages, 
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(message + ' tutorial')}`,
                    `https://www.google.com/search?q=${encodeURIComponent(message + ' study guide')}`
                );
            }
        }

        // Scroll to bottom
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    addMessage(container, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<strong>${type === 'user' ? 'You' : 'StudyMate'}:</strong> ${message}`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        container.appendChild(messageDiv);
        
        // Animate message appearance
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
        
        return messageDiv;
    }

    addTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<strong>StudyMate:</strong> <span class="loading"></span> Thinking...';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        container.appendChild(typingDiv);
        
        return typingDiv;
    }

    addResourceLinks(container, youtubeLink, googleLink) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'message bot-message';
        linksDiv.setAttribute('data-aos', 'fade-up');
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        let linksHTML = '<strong>StudyMate:</strong> Here are some helpful resources:<br><div class="mt-2">';
        
        if (youtubeLink) {
            linksHTML += `<a href="${youtubeLink}" target="_blank" class="btn btn-sm btn-outline-light me-2 mb-2">
                <i class="fab fa-youtube"></i> Watch Videos
            </a>`;
        }
        
        if (googleLink) {
            linksHTML += `<a href="${googleLink}" target="_blank" class="btn btn-sm btn-outline-light mb-2">
                <i class="fas fa-search"></i> Search More
            </a>`;
        }
        
        linksHTML += '</div>';
        content.innerHTML = linksHTML;
        
        linksDiv.appendChild(avatar);
        linksDiv.appendChild(content);
        container.appendChild(linksDiv);
        
        // Trigger AOS animation
        AOS.refresh();
    }

    async generateQuiz() {
        const subject = document.getElementById('quizSubject').value.trim();
        const marks = document.getElementById('quizMarks').value;
        const duration = document.getElementById('quizDuration').value;

        if (!subject || !marks || !duration) {
            this.showAlert('Please fill in all fields to generate a quiz.', 'warning');
            return;
        }

        // Show loading
        const generateBtn = document.querySelector('button[onclick="generateQuiz()"]');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span class="loading"></span> Generating...';
        generateBtn.disabled = true;

        try {
            const response = await fetch('https://your-vercel-app.vercel.app/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: subject,
                    marks: parseInt(marks),
                    duration: parseInt(duration)
                })
            });

            const data = await response.json();
            
            if (data.quiz) {
                this.quizData = data.quiz;
                this.displayQuiz(subject, marks, duration);
            } else {
                this.showAlert('Failed to generate quiz. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error generating quiz:', error);
            // Fallback quiz
            this.generateFallbackQuiz(subject, marks, duration);
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    generateFallbackQuiz(subject, marks, duration) {
        const fallbackQuestions = [
            {
                question: `What is a fundamental concept in ${subject}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct: 0
            },
            {
                question: `Which of the following is most important in ${subject}?`,
                options: ["Practice", "Theory", "Application", "All of the above"],
                correct: 3
            }
        ];

        this.quizData = {
            questions: fallbackQuestions,
            subject: subject,
            marks: parseInt(marks),
            duration: parseInt(duration)
        };

        this.displayQuiz(subject, marks, duration);
    }

    displayQuiz(subject, marks, duration) {
        const modal = new bootstrap.Modal(document.getElementById('quizModal'));
        
        // Set quiz info
        document.getElementById('quizTitle').textContent = `${subject} Quiz`;
        document.getElementById('quizInfo').textContent = `${subject} • ${duration} minutes • ${marks} marks`;
        
        // Generate questions HTML
        const questionsContainer = document.getElementById('quizQuestions');
        questionsContainer.innerHTML = '';
        
        this.quizData.questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.innerHTML = `
                <h6>Question ${index + 1}: ${q.question}</h6>
                <div class="quiz-options">
                    ${q.options.map((option, optIndex) => `
                        <div class="quiz-option" onclick="selectOption(${index}, ${optIndex})">
                            ${String.fromCharCode(65 + optIndex)}. ${option}
                        </div>
                    `).join('')}
                </div>
            `;
            questionsContainer.appendChild(questionDiv);
        });
        
        // Start timer
        this.startQuizTimer(duration);
        
        // Show modal
        modal.show();
    }

    startQuizTimer(duration) {
        this.quizStartTime = Date.now();
        const endTime = this.quizStartTime + (duration * 60 * 1000);
        
        this.quizTimer = setInterval(() => {
            const now = Date.now();
            const timeLeft = endTime - now;
            
            if (timeLeft <= 0) {
                this.submitQuiz();
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    selectOption(questionIndex, optionIndex) {
        // Remove previous selection
        const questionDiv = document.querySelectorAll('.quiz-question')[questionIndex];
        questionDiv.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add new selection
        const selectedOption = questionDiv.querySelectorAll('.quiz-option')[optionIndex];
        selectedOption.classList.add('selected');
        
        // Store answer
        this.userAnswers[questionIndex] = optionIndex;
    }

    submitQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }
        
        // Calculate score
        let correct = 0;
        this.quizData.questions.forEach((q, index) => {
            if (this.userAnswers[index] === q.correct) {
                correct++;
            }
        });
        
        const totalQuestions = this.quizData.questions.length;
        const percentage = Math.round((correct / totalQuestions) * 100);
        const scoreMarks = Math.round((correct / totalQuestions) * this.quizData.marks);
        
        // Show results
        this.showQuizResults(correct, totalQuestions, percentage, scoreMarks);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
        modal.hide();
        
        // Reset quiz data
        this.userAnswers = {};
    }

    showQuizResults(correct, total, percentage, marks) {
        const resultHTML = `
            <div class="quiz-results glass-card p-4 text-center">
                <h4 class="text-gradient mb-3">Quiz Results</h4>
                <div class="result-stats">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <div class="stat-item">
                                <h3 class="text-purple">${correct}</h3>
                                <p>Correct</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <h3 class="text-success">${percentage}%</h3>
                                <p>Score</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <h3 class="text-warning">${marks}</h3>
                                <p>Marks</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <h3 class="text-info">${total}</h3>
                                <p>Total</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-gradient-purple" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-check"></i> Continue Learning
                    </button>
                </div>
            </div>
        `;
        
        // Add results to page
        const container = document.querySelector('#quiz .container');
        const resultsDiv = document.createElement('div');
        resultsDiv.innerHTML = resultHTML;
        resultsDiv.setAttribute('data-aos', 'zoom-in');
        container.appendChild(resultsDiv);
        
        // Trigger AOS animation
        AOS.refresh();
    }

    generateFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Subject-specific responses
        if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
            return `Great! I'd love to help you with mathematics! Here are some proven strategies for math success:<br><br>
            📊 <strong>Practice Daily:</strong> Work through problems step-by-step and show all your work<br>
            📈 <strong>Visual Learning:</strong> Use graphs, diagrams, and charts to understand concepts<br>
            👥 <strong>Study Groups:</strong> Discuss different problem-solving approaches with peers<br>
            🔍 <strong>Master Basics:</strong> Ensure you understand fundamental concepts before advancing<br><br>
            What specific math topic can I help you with today?`;
        }
        
        if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology')) {
            return `Science is fascinating! Let me share some effective study techniques for science subjects:<br><br>
            🗺️ <strong>Concept Maps:</strong> Connect related ideas and see the big picture<br>
            🧪 <strong>Virtual Labs:</strong> Use online simulations to understand experiments<br>
            📋 <strong>Flashcards:</strong> Master terminology, formulas, and key concepts<br>
            💭 <strong>Teach Back:</strong> Explain concepts in your own words to test understanding<br><br>
            Which science topic would you like to explore together?`;
        }
        
        if (lowerMessage.includes('programming') || lowerMessage.includes('code') || lowerMessage.includes('python') || lowerMessage.includes('javascript')) {
            return `Programming is exciting! Here are some effective coding study strategies:<br><br>
            💻 <strong>Hands-on Practice:</strong> Code along with tutorials and modify examples<br>
            🚀 <strong>Build Projects:</strong> Create small applications to apply what you learn<br>
            👀 <strong>Read Code:</strong> Study other developers' code to learn new approaches<br>
            🐛 <strong>Debug Smart:</strong> Learn to read error messages and debug systematically<br><br>
            What programming concept would you like help with?`;
        }
        
        if (lowerMessage.includes('language') || lowerMessage.includes('english') || lowerMessage.includes('writing')) {
            return `Language learning is a wonderful journey! Here are some effective methods:<br><br>
            📖 <strong>Daily Reading:</strong> Explore news, books, and articles in your target language<br>
            ✍️ <strong>Regular Writing:</strong> Practice writing with feedback from others<br>
            🔄 <strong>Vocabulary Building:</strong> Use spaced repetition for new words<br>
            💬 <strong>Conversation Practice:</strong> Engage in language exchange or speaking practice<br><br>
            What aspect of language learning can I help you with?`;
        }
        
        // General study advice
        return `I'd be happy to help you with your studies! Here are some effective learning strategies I can share:<br><br>
        💡 <strong>Active Learning:</strong> Try explaining concepts out loud or teaching them to someone else<br>
        📚 <strong>Spaced Practice:</strong> Review material multiple times over several days rather than cramming<br>
        🧠 <strong>Practice Testing:</strong> Quiz yourself frequently to strengthen memory<br>
        ⏰ <strong>Focus Techniques:</strong> Use 25-minute study sessions with 5-minute breaks<br><br>
        What specific topic would you like help with? I'm here to assist with your learning journey!`;
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick events
function sendMessage() {
    app.sendMessage();
}

function generateQuiz() {
    app.generateQuiz();
}

function submitQuiz() {
    app.submitQuiz();
}

function selectOption(questionIndex, optionIndex) {
    app.selectOption(questionIndex, optionIndex);
}

function toggleTheme() {
    app.toggleTheme();
}

function scrollToSection(sectionId) {
    app.scrollToSection(sectionId);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ThinkToAce();
});

// Add some extra visual effects
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const cursorDiv = document.createElement('div');
        cursorDiv.className = 'cursor';
        cursorDiv.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursorDiv);
    }
    
    const cursorElement = document.querySelector('.cursor');
    cursorElement.style.left = e.clientX - 10 + 'px';
    cursorElement.style.top = e.clientY - 10 + 'px';
});

// Add particle effect on click
document.addEventListener('click', (e) => {
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i * 60) * Math.PI / 180;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 0, y = 0;
        const animate = () => {
            x += vx * 0.02;
            y += vy * 0.02;
            particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - Math.abs(x + y) / 200})`;
            particle.style.opacity = 1 - Math.abs(x + y) / 200;
            
            if (Math.abs(x + y) < 200) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
});