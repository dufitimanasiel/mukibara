class MukibaraApp {
    constructor() {
        this.currentUser = null;
        this.announcements = [];
        this.editingId = null;
        this.currentLoginType = 'admin';
        this.ussdCode = '';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateTime();
        this.showSplashScreen();
        
        // Update time every minute
        setInterval(() => this.updateTime(), 60000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    setupEventListeners() {
        // Welcome screen button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showLoadingScreen();
            });
        }

        // Home screen buttons
        const homeBackBtn = document.getElementById('homeBackBtn');
        if (homeBackBtn) {
            homeBackBtn.addEventListener('click', () => {
                this.showSplashScreen();
            });
        }

        const homeLoginBtn = document.getElementById('homeLoginBtn');
        if (homeLoginBtn) {
            homeLoginBtn.addEventListener('click', () => {
                this.showLoginScreen();
            });
        }

        // Login screen buttons
        const loginBackBtn = document.getElementById('loginBackBtn');
        if (loginBackBtn) {
            loginBackBtn.addEventListener('click', () => {
                this.showHomeScreen();
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Create announcement button
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Create button clicked');
                this.openCreateModal();
            });
        }

        // Dashboard button
        const dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                this.openDashboardModal();
            });
        }

        // Clear all button
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllAnnouncements();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.handleSearch(document.getElementById('searchInput').value);
            });
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => {
                this.handleSearch(document.getElementById('searchInput').value);
            });
        }

        // Announcement form
        const announcementForm = document.getElementById('announcementForm');
        if (announcementForm) {
            announcementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAnnouncementSubmit();
            });
        }

        // Character counter
        const messageTextarea = document.getElementById('announcementMessage');
        const charCount = document.getElementById('charCount');
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', () => {
                const length = messageTextarea.value.length;
                charCount.textContent = length;
                if (length > 500) {
                    charCount.style.color = '#ff6b35';
                } else if (length > 400) {
                    charCount.style.color = '#ffc107';
                } else {
                    charCount.style.color = '#6c757d';
                }
            });
        }

        // Event delegation for delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const id = e.target.getAttribute('data-id');
                if (id) {
                    this.deleteAnnouncement(id);
                }
            }
        });
    }

    // USSD Functions
    switchLoginType(type) {
        this.currentLoginType = type;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (type === 'admin') {
            document.getElementById('adminTab').classList.add('active');
            document.getElementById('adminLogin').classList.add('active');
            document.getElementById('citizenLogin').classList.remove('active');
        } else {
            document.getElementById('citizenTab').classList.add('active');
            document.getElementById('citizenLogin').classList.add('active');
            document.getElementById('adminLogin').classList.remove('active');
        }
    }

    appendDigit(digit) {
        this.ussdCode += digit;
        this.updateUssdDisplay();
    }

    deleteDigit() {
        if (this.ussdCode.length > 0) {
            this.ussdCode = this.ussdCode.slice(0, -1);
            this.updateUssdDisplay();
        }
    }

    clearCode() {
        this.ussdCode = '';
        this.updateUssdDisplay();
    }

    updateUssdDisplay() {
        const ussdCodeElement = document.getElementById('ussdCode');
        if (ussdCodeElement) {
            if (this.ussdCode.length > 0) {
                // Show asterisks for entered digits
                ussdCodeElement.textContent = '*'.repeat(this.ussdCode.length);
            } else {
                ussdCodeElement.textContent = 'Enter PIN';
            }
        }
    }

    submitCitizenCode() {
        // Check if the entered code matches the expected code
        if (this.ussdCode === '*13672#') {
            this.currentUser = { username: 'citizen', role: 'Umuntu' };
            this.saveToStorage();
            this.showMainScreen();
            this.showSuccess('Murakaza neza! Mwasanze amakuru yose.');
        } else {
            this.showError('Code itariyo! Wakoreshe *13672#');
            this.clearCode();
        }
    }

    // Screen Management
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showSplashScreen() {
        this.showScreen('splashScreen');
    }

    showLoadingScreen() {
        this.showScreen('loadingScreen');
        
        // Simulate loading and then show home screen
        setTimeout(() => {
            this.showHomeScreen();
        }, 3000);
    }

    showHomeScreen() {
        this.showScreen('homeScreen');
    }

    showLoginScreen() {
        this.showScreen('loginScreen');
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
    }

    showMainScreen() {
        this.showScreen('mainScreen');
        
        // Update user info
        document.getElementById('userRole').textContent = `${this.currentUser.role}: ${this.currentUser.username}`;
        
        // Show/hide create button based on role
        const createBtn = document.getElementById('createBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        
        if (this.currentUser.role === 'Ubuyobozi' || this.currentUser.role === 'Admin') {
            createBtn.classList.remove('hidden');
        } else {
            createBtn.classList.add('hidden');
        }
        
        // Show dashboard button only for admin
        if (this.currentUser.role === 'Admin') {
            dashboardBtn.classList.remove('hidden');
            const clearAllBtn = document.getElementById('clearAllBtn');
            if (clearAllBtn) {
                clearAllBtn.classList.remove('hidden');
            }
        } else {
            dashboardBtn.classList.add('hidden');
            const clearAllBtn = document.getElementById('clearAllBtn');
            if (clearAllBtn) {
                clearAllBtn.classList.add('hidden');
            }
        }
        
        this.loadAnnouncements();
    }

    // Authentication
    handleAdminLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        // Admin authentication logic
        let role = null;
        
        if (username === 'mukibara' && password === 'ubuyobozi@123!') {
            role = 'Ubuyobozi';
        } else if (username === 'admin' && password === 'mukibara@123!') {
            role = 'Admin';
        }
        
        if (role) {
            this.currentUser = { username, role };
            this.saveToStorage();
            this.showMainScreen();
            this.showSuccess('Murakaza neza! ' + this.getWelcomeMessage(role));
        } else {
            this.showError('Izina cyangwa ijambbo ryibanga ari ibyo!');
        }
    }

    handleLogin() {
        // Legacy method - redirect to admin login
        this.handleAdminLogin();
    }

    getWelcomeMessage(role) {
        const messages = {
            'Admin': 'Welcome Administrator',
            'Ubuyobozi': 'Murakaza neza Muyobozi',
            'Umuntu': 'Murakaza neza'
        };
        return messages[role] || 'Murakaza neza';
    }

    handleLogout() {
        this.currentUser = null;
        this.saveToStorage();
        this.showHomeScreen();
        this.showSuccess('Murakoze kuba waragiye!');
    }

    // Modal Management
    openCreateModal() {
        console.log('Opening create modal');
        this.editingId = null;
        document.getElementById('modalTitle').innerHTML = '<span class="modal-icon">📝</span>Tangaza amakuru';
        document.getElementById('submitBtnText').textContent = 'Tangaza';
        document.getElementById('announcementForm').reset();
        document.getElementById('charCount').textContent = '0';
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    openEditModal(id) {
        const announcement = this.announcements.find(a => a.id === id);
        if (announcement) {
            this.editingId = id;
            document.getElementById('modalTitle').innerHTML = '<span class="modal-icon">✏️</span>Hindura amakuru';
            document.getElementById('submitBtnText').textContent = 'Hindura';
            document.getElementById('announcementTitle').value = announcement.title;
            document.getElementById('announcementMessage').value = announcement.message;
            document.getElementById('announcementCategory').value = announcement.category;
            document.getElementById('announcementPriority').value = announcement.priority;
            
            // Update character count
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = announcement.message.length;
            }
            
            const modal = document.getElementById('announcementModal');
            if (modal) {
                modal.classList.remove('hidden');
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        document.getElementById('announcementForm').reset();
        document.getElementById('charCount').textContent = '0';
        this.editingId = null;
    }

    openDashboardModal() {
        document.getElementById('dashboardModal').classList.remove('hidden');
        this.loadDashboardStats();
    }

    closeDashboardModal() {
        document.getElementById('dashboardModal').classList.add('hidden');
    }

    // Announcement Management
    handleAnnouncementSubmit() {
        console.log('Handling announcement submit');
        console.log('Current user:', this.currentUser);
        
        const title = document.getElementById('announcementTitle').value.trim();
        const message = document.getElementById('announcementMessage').value.trim();
        const category = document.getElementById('announcementCategory').value;
        const priority = document.getElementById('announcementPriority').value;
        
        console.log('Title:', title);
        console.log('Message:', message);
        console.log('Category:', category);
        console.log('Priority:', priority);
        
        if (!title || !message || !category || !priority) {
            console.log('Validation failed - empty fields');
            this.showError('Nyamuneka wuzuye ibi byose!');
            return;
        }

        if (message.length > 500) {
            this.showError('Ubutumwa bugufi iyo urebye 500 inyuguti!');
            return;
        }
        
        if (this.editingId) {
            // Edit existing announcement
            const index = this.announcements.findIndex(a => a.id === this.editingId);
            if (index !== -1) {
                this.announcements[index] = {
                    ...this.announcements[index],
                    title,
                    message,
                    category,
                    priority,
                    updatedAt: new Date().toISOString()
                };
                console.log('Announcement updated:', this.announcements[index]);
                this.showSuccess('Amakuru ahinduwe neza!');
            }
        } else {
            // Create new announcement
            const newAnnouncement = {
                id: Date.now().toString(),
                title,
                message,
                category,
                priority,
                author: this.currentUser.username,
                role: this.currentUser.role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.announcements.unshift(newAnnouncement);
            console.log('New announcement created:', newAnnouncement);
            this.showSuccess('Amakuru yongeye gutangazwa neza!');
        }
        
        console.log('Saving to storage...');
        this.saveToStorage();
        console.log('Closing modal...');
        this.closeModal();
        console.log('Loading announcements...');
        this.loadAnnouncements();
    }

    deleteAnnouncement(id) {
        console.log('deleteAnnouncement called with ID:', id);
        console.log('Current user:', this.currentUser);
        console.log('app object:', window.app);
        
        if (!this.currentUser || this.currentUser.role !== 'Admin') {
            console.log('Access denied - not admin');
            this.showError('Guhisha amakuru urashobora kuyagira administrator gusa!');
            return;
        }
        
        if (confirm('Uzi neza ko ushaka gusiba iyi makuru?')) {
            console.log('Deleting announcement with ID:', id);
            console.log('Announcements before deletion:', this.announcements);
            
            const originalLength = this.announcements.length;
            this.announcements = this.announcements.filter(a => a.id !== id);
            const newLength = this.announcements.length;
            
            console.log('Announcements after deletion:', this.announcements);
            console.log('Original length:', originalLength, 'New length:', newLength);
            
            if (originalLength === newLength) {
                console.log('No announcement was deleted - ID not found');
                this.showError('Amakuru ntishashokore gusibwa!');
                return;
            }
            
            this.saveToStorage();
            this.loadAnnouncements();
            this.showSuccess('Amakuru yasibwe neza!');
        }
    }

    clearAllAnnouncements() {
        if (confirm('Uzi neza ko ushaka gusiba amakuru yose? Iyi bikorwa ntibishobora kuburikwa.')) {
            console.log('Clearing all announcements');
            console.log('Announcements before clearing:', this.announcements);
            
            this.announcements = [];
            
            console.log('Announcements after clearing:', this.announcements);
            
            this.saveToStorage();
            this.loadAnnouncements();
            this.showSuccess('Amakuru yose yasibwe neza!');
        }
    }

    // Search and Filter
    handleSearch(searchTerm) {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        
        let filteredAnnouncements = this.announcements.filter(announcement => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = announcement.title.toLowerCase().includes(searchLower) ||
                                 announcement.message.toLowerCase().includes(searchLower) ||
                                 announcement.author.toLowerCase().includes(searchLower);
            
            const matchesCategory = !categoryFilter || announcement.category === categoryFilter;
            const matchesPriority = !priorityFilter || announcement.priority === priorityFilter;
            
            return matchesSearch && matchesCategory && matchesPriority;
        });
        
        this.displayFilteredAnnouncements(filteredAnnouncements);
    }

    displayFilteredAnnouncements(filteredAnnouncements) {
        const container = document.getElementById('announcementsList');
        const noAnnouncements = document.getElementById('noAnnouncements');
        
        if (filteredAnnouncements.length === 0) {
            container.innerHTML = '';
            noAnnouncements.classList.remove('hidden');
            return;
        }
        
        noAnnouncements.classList.add('hidden');
        container.innerHTML = filteredAnnouncements.map(announcement => {
            const date = new Date(announcement.createdAt);
            const dateString = date.toLocaleDateString('rw-RW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const canEdit = this.currentUser.role === 'Ubuyobozi' || 
                           this.currentUser.role === 'Admin';
            
            const priorityColors = {
                'normal': '#28a745',
                'important': '#ffc107',
                'urgent': '#ff6b35'
            };
            
            const priorityLabels = {
                'normal': 'Bisanzwe',
                'important': 'By\'ingenzi',
                'urgent': 'Byihutirwa'
            };
            
            const categoryLabels = {
                'ibikorwa': 'Ibikorwa',
                'amakuru': 'Amakuru y\'umudugudu',
                'ubuzima': 'Ubuzima',
                'amashuri': 'Amashuri',
                'ubukungu': 'Ubukungu',
                'indi': 'Indi'
            };
            
            return `
                <div class="announcement-card fade-in ${announcement.priority}">
                    <div class="announcement-header">
                        <div>
                            <div class="announcement-title">
                                ${this.escapeHtml(announcement.title)}
                                <span class="priority-badge" style="background-color: ${priorityColors[announcement.priority]}">
                                    ${priorityLabels[announcement.priority]}
                                </span>
                            </div>
                            <div class="announcement-meta">
                                Na ${this.escapeHtml(announcement.author)} - ${announcement.role} • ${dateString}
                            </div>
                            <div class="announcement-category">
                                📁 ${categoryLabels[announcement.category] || announcement.category}
                            </div>
                        </div>
                    </div>
                    <div class="announcement-message">
                        ${this.escapeHtml(announcement.message)}
                    </div>
                    ${canEdit ? `
                        <div class="announcement-actions">
                            <button class="btn-edit" onclick="app.openEditModal('${announcement.id}')">
                                Hindura
                            </button>
                            ${this.currentUser.role === 'Admin' ? `
                                <button class="btn-delete" data-id="${announcement.id}">
                                    Siba
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    loadAnnouncements() {
        // Load announcements from storage - no sample data
        this.displayFilteredAnnouncements(this.announcements);
    }

    // Dashboard
    loadDashboardStats() {
        // Calculate statistics
        const totalAnnouncements = this.announcements.length;
        const urgentAnnouncements = this.announcements.filter(a => a.priority === 'urgent').length;
        
        // Update stats
        document.getElementById('totalAnnouncements').textContent = totalAnnouncements;
        document.getElementById('urgentAnnouncements').textContent = urgentAnnouncements;
        document.getElementById('totalUsers').textContent = '3'; // Fixed number of users
        
        // Calculate category statistics
        const categoryStats = {};
        this.announcements.forEach(announcement => {
            categoryStats[announcement.category] = (categoryStats[announcement.category] || 0) + 1;
        });
        
        // Display category statistics
        const categoryStatsHtml = Object.entries(categoryStats).map(([category, count]) => {
            const categoryNames = {
                'ibikorwa': 'Ibikorwa',
                'amakuru': 'Amakuru y\'umudugudu',
                'ubuzima': 'Ubuzima',
                'amashuri': 'Amashuri',
                'ubukungu': 'Ubukungu',
                'indi': 'Indi'
            };
            return `
                <div class="category-stat">
                    <span class="category-name">${categoryNames[category] || category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('');
        
        document.getElementById('categoryStats').innerHTML = categoryStatsHtml;
        
        // Load recent activity
        const recentActivityHtml = this.announcements.slice(0, 5).map(announcement => {
            const date = new Date(announcement.createdAt);
            const dateString = date.toLocaleDateString('rw-RW', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="activity-item">
                    <strong>${this.escapeHtml(announcement.title)}</strong>
                    <br>
                    <small>${announcement.author} - ${dateString}</small>
                </div>
            `;
        }).join('');
        
        document.getElementById('recentActivity').innerHTML = recentActivityHtml;
    }

    // Storage
    saveToStorage() {
        const data = {
            currentUser: this.currentUser,
            announcements: this.announcements
        };
        localStorage.setItem('mukibaraApp', JSON.stringify(data));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('mukibaraApp');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.currentUser = data.currentUser || null;
                // Clear any existing announcements to start fresh
                this.announcements = [];
                console.log('App loaded with clean slate - no sample announcements');
            } catch (e) {
                console.error('Error loading from storage:', e);
                this.announcements = [];
            }
        } else {
            this.announcements = [];
        }
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toastId = type === 'success' ? 'successMessage' : 'errorMessage';
        const toast = document.getElementById(toastId);
        const messageElement = toast.querySelector('.toast-message');
        
        if (toast && messageElement) {
            messageElement.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MukibaraApp();
});
