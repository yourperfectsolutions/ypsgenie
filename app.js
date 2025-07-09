// YPS Genie Task Management Application
class YPSGenie {
    constructor() {
        this.currentScreen = 'welcome';
        this.currentStep = 1;
        this.currentSection = 'dashboard';
        this.userData = {
            email: '',
            company: '',
            role: '',
            teamSize: '',
            industry: '',
            credits: 50
        };
        this.tasks = [];
        this.isVoiceMode = false;
        this.isVoiceRecording = false;
        this.recognition = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.setupAnimations();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.updateActiveNav(link);
            });
        });

        // Category card listeners
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.selectCategory(category);
            });
        });

        // Industry selection listeners
        document.querySelectorAll('.industry-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectIndustry(card);
            });
        });

        // Form submission listeners
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitTask();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterTasks(btn.dataset.filter);
                this.updateActiveFilter(btn);
            });
        });

        // Credit package purchases
        document.querySelectorAll('.package-card .btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.purchaseCredits(index);
            });
        });

        // Modal close listeners
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // File upload handling
        const fileInput = document.getElementById('task-files');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.processVoiceCommand(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice recognition error. Please try again.', 'error');
            };
        }
    }

    setupAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('.stat-card, .action-card, .category-card, .task-card').forEach(el => {
            observer.observe(el);
        });

        // Progress bar animations
        this.animateProgressBars();
    }

    loadInitialData() {
        // Load sample tasks
        this.tasks = [
            {
                id: 'task1',
                title: 'Blog Post: Digital Marketing Trends',
                category: 'content',
                description: 'Write a comprehensive blog post about emerging digital marketing trends',
                status: 'drafting',
                credits: 15,
                deadline: '2025-07-15',
                progress: 25
            },
            {
                id: 'task2',
                title: 'Social Media Campaign',
                category: 'marketing',
                description: 'Create a 2-week social media campaign for product launch',
                status: 'client-review',
                credits: 25,
                deadline: '2025-07-20',
                progress: 75
            },
            {
                id: 'task3',
                title: 'Logo Design',
                category: 'creative',
                description: 'Design a modern logo for tech startup',
                status: 'complete',
                credits: 30,
                deadline: '2025-07-10',
                progress: 100
            }
        ];

        this.updateTaskCounts();
    }

    // Screen and Section Management
    showScreen(screenId) {
        document.querySelectorAll('.welcome-screen, .onboarding-screen, .dashboard').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId.replace('-screen', '');
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Onboarding Flow
    startOnboarding() {
        this.showScreen('onboarding-screen');
        this.updateOnboardingProgress();
        this.animateOnboardingStep();
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateOnboardingProgress();
            this.showOnboardingStep();
            this.animateOnboardingStep();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (!input.value.trim()) {
                input.focus();
                this.showNotification('Please fill in all required fields', 'error');
                return false;
            }
        }

        // Save step data
        this.saveStepData();
        return true;
    }

    saveStepData() {
        switch (this.currentStep) {
            case 1:
                this.userData.email = document.getElementById('email').value;
                break;
            case 2:
                this.userData.company = document.getElementById('company').value;
                this.userData.role = document.getElementById('role').value;
                this.userData.teamSize = document.getElementById('team-size').value;
                break;
            case 3:
                // Industry is saved in selectIndustry method
                break;
        }
    }

    updateOnboardingProgress() {
        const progressFill = document.getElementById('onboarding-progress');
        const currentStepSpan = document.getElementById('current-step');
        const progressPercent = (this.currentStep / 4) * 100;
        
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        if (currentStepSpan) {
            currentStepSpan.textContent = this.currentStep;
        }
    }

    showOnboardingStep() {
        document.querySelectorAll('.onboarding-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const targetStep = document.getElementById(`step-${this.currentStep}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    animateOnboardingStep() {
        const activeStep = document.querySelector('.onboarding-step.active');
        if (activeStep) {
            activeStep.style.opacity = '0';
            activeStep.style.transform = 'translateX(30px)';
            setTimeout(() => {
                activeStep.style.opacity = '1';
                activeStep.style.transform = 'translateX(0)';
            }, 100);
        }
    }

    selectIndustry(card) {
        document.querySelectorAll('.industry-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
        this.userData.industry = card.dataset.industry;
        
        const continueBtn = document.getElementById('industry-continue');
        if (continueBtn) {
            continueBtn.disabled = false;
        }
    }

    completeOnboarding() {
        this.showScreen('dashboard');
        this.showNotification('Welcome to YPS Genie! You received 50 free credits.', 'success');
        this.updateCreditsDisplay();
        this.animateWelcome();
    }

    animateWelcome() {
        const elements = document.querySelectorAll('.stat-card, .action-card');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Task Management
    selectCategory(category) {
        this.showModal('task-modal');
        const categorySelect = document.getElementById('task-category');
        if (categorySelect) {
            categorySelect.value = category;
            this.animateFormField(categorySelect);
        }
    }

    submitTask() {
        const taskData = {
            title: document.getElementById('task-title').value,
            category: document.getElementById('task-category').value,
            description: document.getElementById('task-description').value,
            deadline: document.getElementById('task-deadline').value
        };

        if (!this.validateTaskForm(taskData)) {
            return;
        }

        this.closeModal();
        this.showModal('assessment-modal');
        this.startAIAssessment(taskData);
    }

    validateTaskForm(taskData) {
        const requiredFields = ['title', 'category', 'description', 'deadline'];
        for (let field of requiredFields) {
            if (!taskData[field]) {
                this.showNotification('Please fill in all required fields', 'error');
                return false;
            }
        }
        return true;
    }

    startAIAssessment(taskData) {
        const progressBar = document.getElementById('assessment-progress');
        const analyzingStage = document.getElementById('assessment-analyzing');
        const resultsStage = document.getElementById('assessment-results');
        
        // Reset states
        analyzingStage.style.display = 'block';
        resultsStage.style.display = 'none';
        progressBar.style.width = '0%';

        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.showAssessmentResults(taskData);
                }, 500);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    showAssessmentResults(taskData) {
        const analyzingStage = document.getElementById('assessment-analyzing');
        const resultsStage = document.getElementById('assessment-results');
        
        analyzingStage.style.display = 'none';
        resultsStage.style.display = 'block';
        
        // Animate results appearance
        resultsStage.style.opacity = '0';
        resultsStage.style.transform = 'translateY(20px)';
        setTimeout(() => {
            resultsStage.style.opacity = '1';
            resultsStage.style.transform = 'translateY(0)';
        }, 100);

        // Store task data for proposal
        this.currentTaskData = taskData;
    }

    showProposal() {
        this.closeModal();
        this.showModal('proposal-modal');
        this.animateProposalSteps();
    }

    animateProposalSteps() {
        const steps = document.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateX(0)';
            }, index * 150);
        });
    }

    approveProposal() {
        if (this.userData.credits < 15) {
            this.showNotification('Insufficient credits. Please purchase more credits.', 'error');
            return;
        }

        // Deduct credits
        this.userData.credits -= 15;
        this.updateCreditsDisplay();

        // Create new task
        const newTask = {
            id: 'task' + (this.tasks.length + 1),
            title: this.currentTaskData.title,
            category: this.currentTaskData.category,
            description: this.currentTaskData.description,
            status: 'drafting',
            credits: 15,
            deadline: this.currentTaskData.deadline,
            progress: 10
        };

        this.tasks.unshift(newTask);
        this.updateTaskCounts();
        this.updateTaskDisplay();

        this.closeModal();
        this.showNotification('Task approved and started! Check the Progress section for updates.', 'success');
        
        // Animate success
        this.animateTaskApproval();
    }

    animateTaskApproval() {
        const creditsDisplay = document.querySelector('.credits-display');
        if (creditsDisplay) {
            creditsDisplay.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                creditsDisplay.style.animation = '';
            }, 500);
        }
    }

    // Progress Management
    filterTasks(filter) {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            const status = card.dataset.status;
            if (filter === 'all' || status === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updateTaskCounts() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'complete').length;
        const inProgressTasks = this.tasks.filter(task => task.status !== 'complete').length;

        // Update dashboard stats
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = totalTasks;
        if (statNumbers[1]) statNumbers[1].textContent = completedTasks;
        if (statNumbers[2]) statNumbers[2].textContent = inProgressTasks;
        if (statNumbers[3]) statNumbers[3].textContent = this.userData.credits;
    }

    updateTaskDisplay() {
        // Update recent tasks in dashboard
        const taskList = document.querySelector('.task-list');
        if (taskList && this.tasks.length > 0) {
            taskList.innerHTML = this.tasks.slice(0, 2).map(task => 
                this.generateTaskHTML(task)
            ).join('');
        }
    }

    generateTaskHTML(task) {
        const statusClass = {
            'drafting': 'status-drafting',
            'qa-review': 'status-qa',
            'client-review': 'status-review',
            'complete': 'status-complete'
        };

        const statusText = {
            'drafting': 'Drafting',
            'qa-review': 'QA Review',
            'client-review': 'Client Review',
            'complete': 'Complete'
        };

        return `
            <div class="task-item">
                <div class="task-icon">${this.getCategoryIcon(task.category)}</div>
                <div class="task-content">
                    <h3>${task.title}</h3>
                    <p>${this.getCategoryName(task.category)} • ${task.credits} Credits • Due ${this.formatDate(task.deadline)}</p>
                </div>
                <div class="task-status ${statusClass[task.status]}">${statusText[task.status]}</div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'content': '📝',
            'marketing': '📈',
            'web-app': '💻',
            'creative': '🎨',
            'productivity': '⚡'
        };
        return icons[category] || '📄';
    }

    getCategoryName(category) {
        const names = {
            'content': 'Content',
            'marketing': 'Marketing',
            'web-app': 'Web/App',
            'creative': 'Creative',
            'productivity': 'Productivity'
        };
        return names[category] || 'Other';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    // Credit Management
    purchaseCredits(packageIndex) {
        const packages = [
            { credits: 50, price: 99, name: 'Starter Pack' },
            { credits: 150, price: 249, name: 'Professional Pack' },
            { credits: 500, price: 749, name: 'Enterprise Pack' }
        ];

        const selectedPackage = packages[packageIndex];
        if (selectedPackage) {
            this.userData.credits += selectedPackage.credits;
            this.updateCreditsDisplay();
            this.showNotification(
                `Successfully purchased ${selectedPackage.name}! +${selectedPackage.credits} credits added.`,
                'success'
            );
            this.animateCreditPurchase();
        }
    }

    updateCreditsDisplay() {
        const creditsElements = document.querySelectorAll('.credits-amount, .balance-amount');
        creditsElements.forEach(el => {
            if (el.classList.contains('balance-amount')) {
                el.textContent = `${this.userData.credits} Credits`;
            } else {
                el.textContent = this.userData.credits;
            }
        });
        
        // Update balance value
        const balanceValue = document.querySelector('.balance-value');
        if (balanceValue) {
            balanceValue.textContent = `≈ $${Math.round(this.userData.credits * 2.5)} value`;
        }
    }

    animateCreditPurchase() {
        const creditsDisplay = document.querySelector('.credits-display');
        if (creditsDisplay) {
            creditsDisplay.style.animation = 'bounce 0.6s ease-in-out';
            setTimeout(() => {
                creditsDisplay.style.animation = '';
            }, 600);
        }
    }

    // Voice Interface
    toggleVoiceMode() {
        this.showModal('voice-modal');
        this.updateVoiceInterface();
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            this.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        const toggleBtn = document.querySelector('.voice-toggle');
        const btnText = toggleBtn.querySelector('.voice-btn-text');
        const transcript = document.getElementById('voice-transcript');

        if (this.isVoiceRecording) {
            this.recognition.stop();
            this.isVoiceRecording = false;
            btnText.textContent = 'Start Listening';
            toggleBtn.classList.remove('recording');
            transcript.textContent = 'Click the microphone to start';
        } else {
            this.recognition.start();
            this.isVoiceRecording = true;
            btnText.textContent = 'Stop Listening';
            toggleBtn.classList.add('recording');
            transcript.textContent = 'Listening...';
        }
    }

    updateVoiceInterface() {
        const voiceWaves = document.querySelectorAll('.wave');
        voiceWaves.forEach((wave, index) => {
            wave.style.animationDelay = `${index * 0.3}s`;
        });
    }

    processVoiceCommand(command) {
        const transcript = document.getElementById('voice-transcript');
        transcript.textContent = `You said: "${command}"`;

        const lowerCommand = command.toLowerCase();

        if (lowerCommand.includes('submit') && lowerCommand.includes('task')) {
            this.closeModal();
            this.showTaskSubmission();
            this.showNotification('Opening task submission form', 'success');
        } else if (lowerCommand.includes('check') && lowerCommand.includes('progress')) {
            this.closeModal();
            this.showSection('progress');
            this.updateActiveNav(document.querySelector('[data-section="progress"]'));
            this.showNotification('Showing task progress', 'success');
        } else if (lowerCommand.includes('buy') && lowerCommand.includes('credits')) {
            this.closeModal();
            this.showSection('credits');
            this.updateActiveNav(document.querySelector('[data-section="credits"]'));
            this.showNotification('Showing credit packages', 'success');
        } else if (lowerCommand.includes('dashboard')) {
            this.closeModal();
            this.showSection('dashboard');
            this.updateActiveNav(document.querySelector('[data-section="dashboard"]'));
            this.showNotification('Showing dashboard', 'success');
        } else {
            this.showNotification('Command not recognized. Try "Submit new task" or "Check progress"', 'error');
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate modal content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'translateY(30px)';
                modalContent.style.opacity = '0';
                setTimeout(() => {
                    modalContent.style.transform = 'translateY(0)';
                    modalContent.style.opacity = '1';
                }, 100);
            }
        }
    }

    closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showTaskSubmission() {
        this.showModal('task-modal');
        this.animateFormFields();
    }

    animateFormFields() {
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateFormField(field) {
        field.style.transform = 'scale(1.05)';
        field.style.borderColor = '#9C7BB8';
        setTimeout(() => {
            field.style.transform = 'scale(1)';
        }, 200);
    }

    // File Upload
    handleFileUpload(files) {
        if (files.length > 0) {
            const uploadLabel = document.querySelector('.file-upload label span');
            if (uploadLabel) {
                uploadLabel.textContent = `${files.length} file(s) selected`;
            }
            this.showNotification(`${files.length} file(s) uploaded successfully`, 'success');
        }
    }

    // Animations
    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500);
        });
    }

    // Notification System
    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Animate notification
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
    }

    // Utility Methods
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new YPSGenie();
    
    // Make app instance globally accessible for onclick handlers
    window.app = app;
    
    // Global functions for HTML onclick handlers
    window.startOnboarding = () => app.startOnboarding();
    window.nextStep = () => app.nextStep();
    window.completeOnboarding = () => app.completeOnboarding();
    window.showSection = (section) => app.showSection(section);
    window.showTaskSubmission = () => app.showTaskSubmission();
    window.closeModal = () => app.closeModal();
    window.showProposal = () => app.showProposal();
    window.approveProposal = () => app.approveProposal();
    window.toggleVoiceMode = () => app.toggleVoiceMode();
    window.toggleVoiceRecording = () => app.toggleVoiceRecording();
    
    // Enhanced button interactions
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        btn.addEventListener('click', function() {
            this.style.transform = 'translateY(0) scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1)';
            }, 100);
        });
    });
    
    // Enhanced card interactions
    document.querySelectorAll('.category-card, .action-card, .task-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Form field focus animations
    document.querySelectorAll('.form-control').forEach(field => {
        field.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.borderColor = '#9C7BB8';
        });
        
        field.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
            this.style.borderColor = '#DEE2E6';
        });
    });
    
    // Progress bar animations on visibility
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress-fill');
                if (progressBar) {
                    const targetWidth = progressBar.style.width;
                    progressBar.style.width = '0%';
                    setTimeout(() => {
                        progressBar.style.width = targetWidth;
                    }, 300);
                }
            }
        });
    });
    
    document.querySelectorAll('.progress-bar').forEach(bar => {
        progressObserver.observe(bar);
    });
    
    // Add loading states to async actions
    document.querySelectorAll('.btn--primary').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Enhanced scroll animations
    const scrollElements = document.querySelectorAll('.stat-card, .action-card, .category-card, .task-card, .package-card');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    scrollElements.forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple effect styles
    const rippleStyles = document.createElement('style');
    rippleStyles.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out;
        }
        
        .keyboard-navigation *:focus {
            outline: 2px solid #9C7BB8;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(rippleStyles);
    
    // Initialize animations
    setTimeout(() => {
        app.animateProgressBars();
    }, 1000);
});

// Add some CSS for enhanced animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .stat-card, .action-card, .category-card, .task-card, .package-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .loading {
        position: relative;
        overflow: hidden;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 1s infinite;
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .voice-toggle.recording {
        animation: pulse 1s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(additionalStyles);