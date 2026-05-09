// App State Management
class VillageAnnouncementApp {
    constructor() {
        this.currentUser = null;
        this.announcements = [];
        this.editingId = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }
    
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('rw-RW', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    setupEventListeners() {
        // Splash screen tap
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            splashScreen.addEventListener('click', () => {
                this.showLoadingScreen();
            });
        }
        
        // Splash logo button
        const splashLogoBtn = document.getElementById('splashLogoBtn');
        if (splashLogoBtn) {
            splashLogoBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the splash screen click
                console.log('Splash logo clicked');
                this.showLoadingScreen();
            });
        }
        
        // Home login button
        const homeLoginBtn = document.getElementById('homeLoginBtn');
        if (homeLoginBtn) {
            homeLoginBtn.addEventListener('click', () => {
                this.showLoginScreen();
            });
        }
        
        // Home back button
        const homeBackBtn = document.getElementById('homeBackBtn');
        if (homeBackBtn) {
            homeBackBtn.addEventListener('click', () => {
                this.showSplashScreen();
            });
        }
        
        // Login back button
        const loginBackBtn = document.getElementById('loginBackBtn');
        if (loginBackBtn) {
            loginBackBtn.addEventListener('click', () => {
                this.showHomeScreen();
            });
        }
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
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
                console.log('Tangaza button clicked'); // Debug log
                this.openCreateModal();
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
        
        // Dashboard button
        const dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                this.openDashboardModal();
            });
        }
        
        // Announcement form
        document.getElementById('announcementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnnouncementSubmit();
        });
        
        // Modal controls
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal on background click
        document.getElementById('announcementModal').addEventListener('click', (e) => {
            if (e.target.id === 'announcementModal') {
                this.closeModal();
            }
        });
    }
    
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Authentication logic
        let role = null;
        
        if (username === 'mukibara' && password === 'ubuyobozi@123!') {
            role = 'Ubuyobozi';
        } else if (username === 'mukibara' && password === 'mukibara@123') {
            role = 'Umuntu';
        } else if (username === 'admin' && password === 'mukibara@123!') {
            role = 'Admin';
        }
        
        if (role) {
            this.currentUser = { username, role };
            this.saveToStorage();
            this.showMainScreen();
        } else {
            this.showError('Izina cyangwa ijambbo ryibanga ari ibyo!');
        }
    }
    
    showLoadingScreen() {
        document.getElementById('splashScreen').classList.remove('active');
        document.getElementById('loadingScreen').classList.add('active');
        
        // After 3 seconds, show home screen
        setTimeout(() => {
            this.showHomeScreen();
        }, 3000);
    }
    
    showHomeScreen() {
        document.getElementById('loadingScreen').classList.remove('active');
        document.getElementById('homeScreen').classList.add('active');
    }
    
    showSplashScreen() {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('splashScreen').classList.add('active');
    }
    
    showLoginScreen() {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('loginForm').reset();
    }
    
    handleLogout() {
        this.currentUser = null;
        this.saveToStorage();
        this.showHomeScreen();
    }
    
    showMainScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
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
        } else {
            dashboardBtn.classList.add('hidden');
        }
        
        this.loadAnnouncements();
    }
    
    openCreateModal() {
        console.log('openCreateModal called');
        this.editingId = null;
        document.getElementById('modalTitle').textContent = 'Tangaza amakuru';
        document.getElementById('announcementForm').reset();
        const modal = document.getElementById('announcementModal');
        console.log('Modal element:', modal);
        modal.classList.add('active');
        console.log('Modal classes after adding active:', modal.className);
    }
    
    openEditModal(id) {
        const announcement = this.announcements.find(a => a.id === id);
        if (announcement) {
            this.editingId = id;
            document.getElementById('modalTitle').textContent = 'Hindura amakuru';
            document.getElementById('announcementTitle').value = announcement.title;
            document.getElementById('announcementMessage').value = announcement.message;
            document.getElementById('announcementModal').classList.add('active');
        }
    }
    
    closeModal() {
        document.getElementById('announcementModal').classList.remove('active');
        document.getElementById('announcementForm').reset();
        this.editingId = null;
    }
    
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
        }
        
        console.log('Saving to storage...');
        this.saveToStorage();
        console.log('Closing modal...');
        this.closeModal();
        console.log('Loading announcements...');
        this.loadAnnouncements();
        console.log('Showing success message...');
        this.showSuccess('Amakuru yongeye gutangazwa neza!');
    }
    
    openDashboardModal() {
        document.getElementById('dashboardModal').classList.remove('hidden');
        this.loadDashboardStats();
    }
    
    closeDashboardModal() {
        document.getElementById('dashboardModal').classList.add('hidden');
    }
    
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
    }
    
    deleteAnnouncement(id) {
        if (confirm('Uzi neza ko ushaka gusiba iyi makuru?')) {
            this.announcements = this.announcements.filter(a => a.id !== id);
            this.saveToStorage();
            this.loadAnnouncements();
            this.showSuccess('Amakuru yasibwe neza!');
        }
    }
    
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
        
        if (filteredAnnouncements.length === 0) {
            container.innerHTML = `
                <div class="text-center mb-20">
                    <p style="color: #6c757d; font-size: 16px;">Nta makuru wabonye</p>
                </div>
            `;
            return;
        }
        
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
                'urgent': '#dc3545'
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
                                <button class="btn-delete" onclick="app.deleteAnnouncement('${announcement.id}')">
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
        this.displayFilteredAnnouncements(this.announcements);
    }
    
    saveToStorage() {
        const data = {
            currentUser: this.currentUser,
            announcements: this.announcements
        };
        localStorage.setItem('villageAnnouncements', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const stored = localStorage.getItem('villageAnnouncements');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.currentUser = data.currentUser || null;
                this.announcements = data.announcements || [];
                
                // If user is logged in, show main screen directly
                if (this.currentUser) {
                    this.showMainScreen();
                }
                // Otherwise, start with splash screen (default)
            } catch (error) {
                console.error('Error loading from storage:', error);
                this.initializeDefaultData();
            }
        } else {
            this.initializeDefaultData();
        }
    }
    
    initializeDefaultData() {
        // Add sample announcements for demonstration
        this.announcements = [
            {
                id: '1',
                title: 'Umunsi w\'imirimo imwe mu mukino w\'igihugu',
                message: 'Kuri uyu wa Gatandatu tariki 15 Gicurasi, tuzatangira imirimo y\'imihigo yo mwaka. Nibyo twifuza ko abaturage bose bagerageze kuba aho uyu munsi.',
                author: 'mukibara',
                role: 'Ubuyobozi',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '2',
                title: 'Ibiganiro by\'abaturage',
                message: 'Tuzagira ibiganiro by\'abaturage ku wa Gatanu tariki 20 Gicurasi saa sita zambere. Ibi biganiro bizaba ku ikibazo cy\'amazi ateye n\'ibindi byinshi byihariye mu mudugudu.',
                author: 'mukibara',
                role: 'Ubuyobozi',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: '3',
                title: 'Urukundo rw\'abaturage',
                message: 'Murakoze cyane ku wundi wundi mwakoranye mu gukurikirana abana n\'abazize. Turi kumwe tugamije iterambere ry\'uwo mudugudu.',
                author: 'admin',
                role: 'Admin',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                updatedAt: new Date(Date.now() - 259200000).toISOString()
            }
        ];
        this.saveToStorage();
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'error' ? 'background: #dc3545;' : 'background: #28a745;'}
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VillageAnnouncementApp();
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
