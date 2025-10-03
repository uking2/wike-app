// Wike Home Page - Interactive Features
class WikeHome {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupSearchFunctionality();
        this.setupNotificationSystem();
        this.setupProgressBars();
        this.setupTooltips();
        this.setupParallaxEffects();
        this.setupKeyboardShortcuts();
        this.setupThemeToggle();
        this.setupLoadingStates();
        this.showWelcomeMessage();
        this.loadSavedProjects();
    }

    setupEventListeners() {
        // Navigation hover effects
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('mouseenter', this.handleNavHover.bind(this));
            link.addEventListener('mouseleave', this.handleNavLeave.bind(this));
        });

        // Card interactions
        document.querySelectorAll('.card-hover-effect').forEach(card => {
            card.addEventListener('click', this.handleCardClick.bind(this));
            card.addEventListener('mouseenter', this.handleCardHover.bind(this));
            card.addEventListener('mouseleave', this.handleCardLeave.bind(this));
        });

        // Button interactions
        document.querySelectorAll('.button-hover-effect').forEach(button => {
            button.addEventListener('click', this.handleButtonClick.bind(this));
        });

        // New Design button special handling
        const newDesignBtn = document.getElementById('new-design-btn');
        if (newDesignBtn) {
            newDesignBtn.addEventListener('click', this.handleNewDesignClick.bind(this));
            newDesignBtn.addEventListener('mouseenter', this.handleNewDesignHover.bind(this));
            newDesignBtn.addEventListener('mouseleave', this.handleNewDesignLeave.bind(this));
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchInput.addEventListener('focus', this.handleSearchFocus.bind(this));
            searchInput.addEventListener('blur', this.handleSearchBlur.bind(this));
        }

        // Newsletter subscription
        const subscribeBtn = document.querySelector('.gradient-bg');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', this.handleNewsletterSubscription.bind(this));
        }

        // Notification system
        const notificationBtn = document.querySelector('.notification-badge');
        if (notificationBtn) {
            notificationBtn.parentElement.addEventListener('click', this.handleNotificationClick.bind(this));
        }

        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Tool usage tracking
        document.querySelectorAll('.icon-button-hover-effect').forEach(tool => {
            tool.addEventListener('click', (e) => {
                const toolName = tool.querySelector('span').textContent;
                this.trackToolUsage(toolName);
            });
        });
    }

    initializeAnimations() {
        // Initialize AOS with custom settings
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                delay: 0
            });
        }

        // Custom counter animations
        this.animateCounters();
        
        // Particle system
        this.createParticleSystem();
        
        // Floating elements
        this.setupFloatingElements();
        
        // Gradient animations
        this.setupGradientAnimations();
    }

    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // Search suggestions
        const suggestions = [
            'Resume templates',
            'Business cards',
            'Social media posts',
            'Infographics',
            'Posters',
            'Logos',
            'AI generated images',
            'QR codes'
        ];

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.showSearchSuggestions(query, suggestions);
        });
    }

    showSearchSuggestions(query, suggestions) {
        // Remove existing suggestions
        const existingSuggestions = document.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        if (query.length < 2) return;

        const filteredSuggestions = suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(query)
        );

        if (filteredSuggestions.length === 0) return;

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-50 max-h-60 overflow-y-auto';

        filteredSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300';
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                document.querySelector('.search-input').value = suggestion;
                suggestionsContainer.remove();
            });
            suggestionsContainer.appendChild(suggestionItem);
        });

        document.querySelector('.search-container').appendChild(suggestionsContainer);
    }

    setupNotificationSystem() {
        const notifications = [
            { id: 1, title: 'New template available', message: 'Check out our latest resume template', time: '2 min ago' },
            { id: 2, title: 'Storage update', message: 'You\'ve used 80% of your storage', time: '1 hour ago' },
            { id: 3, title: 'Team activity', message: 'Sarah shared a new design', time: '3 hours ago' }
        ];

        this.notifications = notifications;
    }

    handleNotificationClick() {
        this.showNotificationPanel();
    }

    showNotificationPanel() {
        // Remove existing panel
        const existingPanel = document.querySelector('.notification-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'notification-panel absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50';
        
        const header = document.createElement('div');
        header.className = 'px-4 py-3 border-b border-gray-600 flex justify-between items-center';
        header.innerHTML = `
            <h3 class="text-gray-200 font-semibold">Notifications</h3>
            <button class="text-gray-400 hover:text-gray-200">×</button>
        `;

        const content = document.createElement('div');
        content.className = 'max-h-96 overflow-y-auto';

        this.notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = 'px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0';
            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-gray-200 font-medium">${notification.title}</h4>
                        <p class="text-gray-400 text-sm mt-1">${notification.message}</p>
                        <span class="text-gray-500 text-xs mt-2 block">${notification.time}</span>
                    </div>
                    <button class="text-gray-400 hover:text-gray-200 ml-2">×</button>
                </div>
            `;
            content.appendChild(item);
        });

        panel.appendChild(header);
        panel.appendChild(content);
        
        document.querySelector('.notification-badge').parentElement.appendChild(panel);

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !e.target.closest('.notification-badge')) {
                panel.remove();
            }
        });
    }

    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }

    setupTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, customMessage = null) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg';
        tooltip.textContent = customMessage || element.getAttribute('data-tooltip');
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector('.search-input').focus();
            }
            
            // Escape to close modals/panels
            if (e.key === 'Escape') {
                this.closeAllPanels();
            }
            
            // Ctrl/Cmd + N for new design
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.handleNewDesignClick();
            }
        });
    }

    setupThemeToggle() {
        // Theme toggle functionality
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle text-gray-300 hover:text-blue-400 transition duration-200 ease-in-out p-2 rounded-full hover:bg-gray-700';
        themeToggle.innerHTML = '<i class="fas fa-moon text-xl"></i>';
        themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Add to header
        const header = document.querySelector('header');
        if (header) {
            const nav = header.querySelector('nav');
            if (nav) {
                nav.appendChild(themeToggle);
            }
        }
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.querySelector('.theme-toggle i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun text-xl';
        } else {
            icon.className = 'fas fa-moon text-xl';
        }
    }

    setupLoadingStates() {
        // Add loading states to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.classList.contains('loading')) return;
                
                const originalText = button.innerHTML;
                button.classList.add('loading');
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
                button.disabled = true;
                
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            });
        });
    }

    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    createParticleSystem() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            particlesContainer.appendChild(particle);
        }
    }

    setupFloatingElements() {
        const floatingElements = document.querySelectorAll('.float-animation');
        floatingElements.forEach(element => {
            element.style.animationDelay = Math.random() * 2 + 's';
        });
    }

    setupGradientAnimations() {
        const gradientElements = document.querySelectorAll('.gradient-bg');
        gradientElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.animationPlayState = 'paused';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.animationPlayState = 'running';
            });
        });
    }

    handleNavHover(e) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.color = '#3b82f6';
    }

    handleNavLeave(e) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.color = '';
    }

    handleCardClick(e) {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = (e.clientX - e.target.offsetLeft) + 'px';
        ripple.style.top = (e.clientY - e.target.offsetTop) + 'px';
        ripple.style.width = ripple.style.height = '20px';
        
        e.target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    handleCardHover(e) {
        e.target.style.transform = 'translateY(-8px) scale(1.02)';
    }

    handleCardLeave(e) {
        e.target.style.transform = 'translateY(0) scale(1)';
    }

    handleButtonClick(e) {
        // Add click feedback
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }

    handleNewDesignClick(e) {
        if (e) {
            e.preventDefault();
        }
        
        // Show loading state
        const button = document.getElementById('new-design-btn');
        if (button) {
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Opening Design Tool...';
            button.style.pointerEvents = 'none';
            
            // Add a small delay for better UX
            setTimeout(() => {
                window.location.href = '../app/index.html';
            }, 500);
        } else {
            window.location.href = '../app/index.html';
        }
    }

    handleNewDesignHover(e) {
        const button = e.target;
        button.style.transform = 'scale(1.05) translateY(-2px)';
        button.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
        
        // Show tooltip
        this.showTooltip(button, 'Open the Design Editor - Create amazing graphics, logos, and designs');
    }

    handleNewDesignLeave(e) {
        const button = e.target;
        button.style.transform = '';
        button.style.boxShadow = '';
        this.hideTooltip();
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        console.log('Searching for:', query);
        
        // Add search logic here
        if (query.length > 2) {
            this.performSearch(query);
        }
    }

    handleSearchFocus(e) {
        e.target.parentElement.style.transform = 'scale(1.02)';
        e.target.parentElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
    }

    handleSearchBlur(e) {
        e.target.parentElement.style.transform = '';
        e.target.parentElement.style.boxShadow = '';
    }

    handleNewsletterSubscription(e) {
        e.preventDefault();
        const email = document.querySelector('input[type="email"]').value;
        
        // if (!email || !this.isValidEmail(email)) {
        //     this.showNotification('Please enter a valid email address', 'error');
        //     return;
        // }
        
        this.showNotification('Thank you for using', 'success');
        document.querySelector('input[type="email"]').value = '';
    }

    // Add method to show design tool opening notification
    showDesignToolNotification() {
        this.showNotification('Opening Design Tool...', 'info');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (scrolled > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    handleResize() {
        // Handle responsive behavior
        const isMobile = window.innerWidth < 768;
        const searchContainer = document.querySelector('.search-container');
        
        if (isMobile && searchContainer) {
            searchContainer.classList.add('hidden');
        } else if (!isMobile && searchContainer) {
            searchContainer.classList.remove('hidden');
        }
    }

    closeAllPanels() {
        // Close all open panels
        document.querySelectorAll('.notification-panel, .search-suggestions').forEach(panel => {
            panel.remove();
        });
    }

    performSearch(query) {
        // Simulate search results
        const results = [
            'Resume Template',
            'Business Card Design',
            'Social Media Post',
            'Infographic Template'
        ].filter(item => item.toLowerCase().includes(query));
        
        console.log('Search results:', results);
    }

    // Track tool usage for analytics
    trackToolUsage(toolName) {
        console.log(`User clicked on: ${toolName}`);
        // Here you could send analytics data to your backend
        // For now, we'll just log it
    }

    // Show welcome message
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('Welcome to Wike! 🎨 Start creating amazing designs', 'info');
        }, 1000);
    }

    // Load and display saved projects from design tool
    loadSavedProjects() {
        const projects = JSON.parse(localStorage.getItem('wike-projects') || '[]');
        const recentCreationsSection = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-3.xl\\:grid-cols-6');
        
        if (recentCreationsSection && projects.length > 0) {
            // Clear existing placeholder cards
            recentCreationsSection.innerHTML = '';
            
            // Add real project cards (max 6)
            projects.slice(0, 6).forEach((project, index) => {
                const projectCard = this.createProjectCard(project, index);
                recentCreationsSection.appendChild(projectCard);
            });
        }
    }

    createProjectCard(project, index) {
        const card = document.createElement('a');
        card.href = '../app/index.html';
        card.className = 'glass p-4 rounded-xl shadow-lg card-hover-effect group';
        
        const categoryColors = {
            'social-media': 'from-blue-500 to-purple-600',
            'presentation': 'from-green-500 to-teal-600',
            'card': 'from-purple-500 to-indigo-600',
            'logo': 'from-orange-500 to-yellow-600',
            'poster': 'from-pink-500 to-red-600',
            'infographic': 'from-cyan-500 to-blue-600',
            'other': 'from-gray-500 to-gray-600'
        };
        
        const gradientClass = categoryColors[project.category] || categoryColors.other;
        const categoryIcons = {
            'social-media': 'fas fa-hashtag',
            'presentation': 'fas fa-desktop',
            'card': 'fas fa-id-card',
            'logo': 'fas fa-palette',
            'poster': 'fas fa-image',
            'infographic': 'fas fa-chart-bar',
            'other': 'fas fa-file-alt'
        };
        
        const iconClass = categoryIcons[project.category] || categoryIcons.other;
        
        card.innerHTML = `
            <div class="relative">
                <div class="bg-gradient-to-br ${gradientClass} h-40 rounded-lg mb-4 flex items-center justify-center text-white text-xl font-semibold group-hover:scale-105 transition-transform duration-200">
                    <i class="${iconClass} text-3xl"></i>
                </div>
                <div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Saved</div>
            </div>
            <h3 class="text-xl font-semibold text-gray-100 mb-1">${project.name}</h3>
            <p class="text-sm text-gray-400 mb-2">Last edited: ${new Date(project.lastModified).toLocaleDateString()}</p>
            <div class="flex items-center justify-between">
                <span class="text-xs text-blue-400">${project.category.replace('-', ' ')}</span>
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            // Store the project to load in the design tool
            localStorage.setItem('wike-load-project', JSON.stringify(project));
        });
        
        return card;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WikeHome();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .scrolled {
        background: rgba(15, 23, 42, 0.95) !important;
        backdrop-filter: blur(10px);
    }
    
    .light-theme {
        --primary-bg: #ffffff;
        --secondary-bg: #f8fafc;
        --text-color: #1e293b;
        --border-color: #e2e8f0;
    }
    
    .loading {
        pointer-events: none;
        opacity: 0.7;
    }
    
    .custom-tooltip {
        pointer-events: none;
    }
    
    .notification-panel {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

const el = document.getElementById('some-id');
console.log('Element:', el); // Should not be null



module.exports = {
  content: ["./home/**/*.{html,js}"], 
  theme: {
    extend: {},
  },
  plugins: [],
}




