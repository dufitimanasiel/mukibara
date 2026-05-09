class MukibaraApp {
    constructor() {
        this.currentUser = null;
        this.announcements = [];
        this.editingId = null;
        this.currentLoginType = 'admin';
        this.ussdCode = '';
        this.selectedPhoto = null; // Store selected photo as base64
        
        // Security Configuration
        this.security = {
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            minPasswordLength: 8,
            sessionCheckInterval: 60 * 1000, // Check every minute
            lastActivity: Date.now()
        };
        
        // Login attempt tracking
        this.loginAttempts = {};
        this.lockedAccounts = {};
        
        // Audit log
        this.auditLog = [];
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateTime();
        this.showSplashScreen();
        this.initSecurity();
        
        // Update time every minute
        setInterval(() => this.updateTime(), 60000);
    }
    
    // Security Initialization
    initSecurity() {
        // Session activity tracking
        this.trackActivity();
        
        // Session timeout check
        setInterval(() => this.checkSessionTimeout(), this.security.sessionCheckInterval);
        
        // Clear sensitive data on page unload
        window.addEventListener('beforeunload', () => {
            this.clearSensitiveData();
        });
        
        // Disable right-click context menu (optional security measure)
        document.addEventListener('contextmenu', (e) => {
            if (this.currentUser) {
                e.preventDefault();
            }
        });
        
        // Prevent keyboard shortcuts for developer tools (basic deterrent)
        document.addEventListener('keydown', (e) => {
            if (this.currentUser) {
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                }
            }
        });
    }
    
    trackActivity() {
        ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.security.lastActivity = Date.now();
                }
            }, { passive: true });
        });
    }
    
    checkSessionTimeout() {
        if (!this.currentUser) return;
        
        const inactiveTime = Date.now() - this.security.lastActivity;
        
        if (inactiveTime >= this.security.sessionTimeout) {
            this.handleSessionTimeout();
        }
    }
    
    handleSessionTimeout() {
        this.logAudit('SESSION_TIMEOUT', { user: this.currentUser.username });
        this.currentUser = null;
        this.saveToStorage();
        this.showHomeScreen();
        this.showError('Umwi wagiye! Ongera winjire.');
    }
    
    clearSensitiveData() {
        // Clear any temporary sensitive data
        this.ussdCode = '';
        if (document.getElementById('adminPassword')) {
            document.getElementById('adminPassword').value = '';
        }
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
        // Secure USSD code verification
        // Hash of '*13672#' - citizen access code
        const validCodeHash = '00000000000000000000000000000000000000000000000000000000044b3e7e';
        const codeHash = this.simpleHash(this.ussdCode);
        
        // Check rate limiting for citizen login
        const citizenKey = 'citizen_login';
        if (this.isAccountLocked(citizenKey)) {
            const remainingTime = this.getLockoutRemaining(citizenKey);
            this.showError(`Wagerageze benshi! Ongera ugerageze mu minota ${remainingTime}.`);
            this.logAudit('CITIZEN_LOGIN_BLOCKED', { reason: 'rate_limited' });
            this.clearCode();
            return;
        }
        
        // Constant-time comparison
        if (this.constantTimeCompare(codeHash, validCodeHash)) {
            // Successful citizen login
            delete this.loginAttempts[citizenKey];
            delete this.lockedAccounts[citizenKey];
            
            this.currentUser = { 
                username: 'citizen', 
                role: 'Umuntu',
                loginTime: Date.now(),
                sessionId: this.generateSessionId()
            };
            this.security.lastActivity = Date.now();
            this.saveToStorage();
            this.showMainScreen();
            this.showSuccess('Murakaza neza! Mwasanze amakuru yose.');
            this.logAudit('CITIZEN_LOGIN_SUCCESS', {});
        } else {
            // Failed attempt
            if (!this.loginAttempts[citizenKey]) {
                this.loginAttempts[citizenKey] = { count: 0, firstAttempt: Date.now() };
            }
            this.loginAttempts[citizenKey].count++;
            
            const remaining = this.security.maxLoginAttempts - this.loginAttempts[citizenKey].count;
            
            if (remaining > 0) {
                this.showError(`Code itariyo! Ufite ${remaining} igenzura.`);
            } else {
                this.lockedAccounts[citizenKey] = Date.now() + this.security.lockoutDuration;
                this.showError('Wagerageze benshi! Ongera ugerageze hanyuma.');
            }
            
            this.logAudit('CITIZEN_LOGIN_FAILED', { attempts: this.loginAttempts[citizenKey].count });
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
        const password = document.getElementById('adminPassword').value;
        
        // Input validation
        if (!username || !password) {
            this.showError('Nyamuneka wuzuye ibi byose!');
            this.logAudit('LOGIN_FAILED', { username, reason: 'empty_fields' });
            return;
        }
        
        // Input sanitization
        const sanitizedUsername = this.sanitizeInput(username);
        
        // Check if account is locked
        if (this.isAccountLocked(sanitizedUsername)) {
            const remainingTime = this.getLockoutRemaining(sanitizedUsername);
            this.showError(`Account irahagaritswe! Ongera ugerageze mu minota ${remainingTime}.`);
            this.logAudit('LOGIN_BLOCKED', { username: sanitizedUsername, reason: 'account_locked' });
            return;
        }
        
        // Rate limiting check
        if (!this.checkRateLimit(sanitizedUsername)) {
            return;
        }
        
        // Secure credential verification using hashed credentials
        const role = this.verifyCredentials(sanitizedUsername, password);
        
        if (role) {
            // Successful login
            this.handleSuccessfulLogin(sanitizedUsername, role);
        } else {
            // Failed login
            this.handleFailedLogin(sanitizedUsername);
        }
    }
    
    // Secure credential verification (hashed passwords)
    verifyCredentials(username, password) {
        // Hashed credentials
        // In production, this would be server-side
        const validCredentials = {
            'mukibara': {
                // Hash of 'ubuyobozi@123!'
                hash: '0000000000000000000000000000000000000000000000000000000011fdb2d5',
                role: 'Ubuyobozi'
            },
            'admin': {
                // Hash of 'mukibara@123!'
                hash: '000000000000000000000000000000000000000000000000000000002a21abc5',
                role: 'Admin'
            }
        };
        
        // Verify using hash comparison
        const userCreds = validCredentials[username.toLowerCase()];
        if (userCreds) {
            const passwordHash = this.simpleHash(password);
            // Use constant-time comparison to prevent timing attacks
            if (this.constantTimeCompare(passwordHash, userCreds.hash)) {
                return userCreds.role;
            }
        }
        
        return null;
    }
    
    // Simple hash function (for demo - in production use proper crypto API)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        // Convert to hex string and pad
        const hexHash = Math.abs(hash).toString(16);
        return hexHash.padStart(64, '0').substring(0, 64);
    }
    
    // Constant-time string comparison to prevent timing attacks
    constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
    
    // Rate limiting
    checkRateLimit(username) {
        const now = Date.now();
        
        if (!this.loginAttempts[username]) {
            this.loginAttempts[username] = { count: 0, firstAttempt: now };
        }
        
        const attempts = this.loginAttempts[username];
        
        // Reset counter if lockout duration has passed
        if (now - attempts.firstAttempt > this.security.lockoutDuration) {
            this.loginAttempts[username] = { count: 0, firstAttempt: now };
            return true;
        }
        
        // Check if max attempts exceeded
        if (attempts.count >= this.security.maxLoginAttempts) {
            this.lockedAccounts[username] = now + this.security.lockoutDuration;
            this.showError(`Wagerageze benshi! Account irahagaritswe mu minota 15.`);
            this.logAudit('RATE_LIMIT_EXCEEDED', { username, attempts: attempts.count });
            return false;
        }
        
        return true;
    }
    
    // Account lockout check
    isAccountLocked(username) {
        const lockoutTime = this.lockedAccounts[username];
        if (!lockoutTime) return false;
        
        if (Date.now() < lockoutTime) {
            return true;
        }
        
        // Lockout expired
        delete this.lockedAccounts[username];
        delete this.loginAttempts[username];
        return false;
    }
    
    getLockoutRemaining(username) {
        const lockoutTime = this.lockedAccounts[username];
        if (!lockoutTime) return 0;
        return Math.ceil((lockoutTime - Date.now()) / 60000);
    }
    
    handleSuccessfulLogin(username, role) {
        // Clear failed attempts
        delete this.loginAttempts[username];
        delete this.lockedAccounts[username];
        
        // Create session with timestamp
        this.currentUser = { 
            username, 
            role,
            loginTime: Date.now(),
            sessionId: this.generateSessionId()
        };
        this.security.lastActivity = Date.now();
        
        this.saveToStorage();
        this.showMainScreen();
        this.showSuccess('Murakaza neza! ' + this.getWelcomeMessage(role));
        this.logAudit('LOGIN_SUCCESS', { username, role });
    }
    
    handleFailedLogin(username) {
        // Increment attempt counter
        if (!this.loginAttempts[username]) {
            this.loginAttempts[username] = { count: 0, firstAttempt: Date.now() };
        }
        this.loginAttempts[username].count++;
        
        const remaining = this.security.maxLoginAttempts - this.loginAttempts[username].count;
        
        if (remaining > 0) {
            this.showError(`Izina cyangwa ijambo ryibanga ari ibyo! Ufite ${remaining} igenzura.`);
        } else {
            this.lockedAccounts[username] = Date.now() + this.security.lockoutDuration;
            this.showError('Wagerageze benshi! Account irahagaritswe mu minota 15.');
        }
        
        this.logAudit('LOGIN_FAILED', { username, reason: 'invalid_credentials', attempts: this.loginAttempts[username].count });
        
        // Clear password field
        document.getElementById('adminPassword').value = '';
    }
    
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }
    
    sanitizeInput(input) {
        // Remove potentially dangerous characters
        return input.replace(/[<>\"\'&]/g, '');
    }
    
    logAudit(action, details) {
        this.auditLog.push({
            timestamp: new Date().toISOString(),
            action,
            details,
            userAgent: navigator.userAgent
        });
        
        // Keep only last 100 entries
        if (this.auditLog.length > 100) {
            this.auditLog = this.auditLog.slice(-100);
        }
        
        // Save audit log
        this.saveAuditLog();
    }
    
    saveAuditLog() {
        try {
            localStorage.setItem('mukibaraAudit', JSON.stringify(this.auditLog));
        } catch (e) {
            console.error('Failed to save audit log:', e);
        }
    }
    
    loadAuditLog() {
        try {
            const stored = localStorage.getItem('mukibaraAudit');
            if (stored) {
                this.auditLog = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load audit log:', e);
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
        if (this.currentUser) {
            this.logAudit('LOGOUT', { username: this.currentUser.username });
        }
        this.currentUser = null;
        this.security.lastActivity = Date.now();
        this.clearSensitiveData();
        this.saveToStorage();
        this.showHomeScreen();
        this.showSuccess('Murakoze kuba waragiye!');
    }

    // Modal Management
    openCreateModal() {
        console.log('Opening create modal');
        this.editingId = null;
        this.selectedPhoto = null;
        document.getElementById('modalTitle').innerHTML = '<span class="modal-icon">📝</span>Tangaza amakuru';
        document.getElementById('submitBtnText').textContent = 'Tangaza';
        document.getElementById('announcementForm').reset();
        document.getElementById('charCount').textContent = '0';
        
        // Clear photo preview
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            photoPreview.classList.add('hidden');
        }
        
        // Show/hide photo upload based on role
        const photoUploadGroup = document.getElementById('photoUploadGroup');
        if (photoUploadGroup) {
            if (this.currentUser.role === 'Ubuyobozi' || this.currentUser.role === 'Admin') {
                photoUploadGroup.style.display = 'block';
            } else {
                photoUploadGroup.style.display = 'none';
            }
        }
        
        const modal = document.getElementById('announcementModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    openEditModal(id) {
        const announcement = this.announcements.find(a => a.id === id);
        if (announcement) {
            this.editingId = id;
            this.selectedPhoto = announcement.photo || null;
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
            
            // Show existing photo if present
            const photoPreview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            if (announcement.photo && photoPreview && previewImage) {
                previewImage.src = announcement.photo;
                photoPreview.classList.remove('hidden');
            } else if (photoPreview) {
                photoPreview.classList.add('hidden');
            }
            
            // Show/hide photo upload based on role
            const photoUploadGroup = document.getElementById('photoUploadGroup');
            if (photoUploadGroup) {
                if (this.currentUser.role === 'Ubuyobozi' || this.currentUser.role === 'Admin') {
                    photoUploadGroup.style.display = 'block';
                } else {
                    photoUploadGroup.style.display = 'none';
                }
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
        this.selectedPhoto = null;
        
        // Clear photo preview
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            photoPreview.classList.add('hidden');
        }
    }

    openDashboardModal() {
        document.getElementById('dashboardModal').classList.remove('hidden');
        this.loadDashboardStats();
    }

    closeDashboardModal() {
        document.getElementById('dashboardModal').classList.add('hidden');
    }

    // Photo Upload Functions
    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Nyamuneka hitamo ishusho!');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Ishusho nini cyane! (Max 5MB)');
            return;
        }
        
        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedPhoto = e.target.result;
            this.showPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    showPhotoPreview(photoData) {
        const preview = document.getElementById('photoPreview');
        const previewImage = document.getElementById('previewImage');
        
        if (preview && previewImage) {
            previewImage.src = photoData;
            preview.classList.remove('hidden');
        }
    }
    
    removePhoto() {
        this.selectedPhoto = null;
        const preview = document.getElementById('photoPreview');
        const photoInput = document.getElementById('announcementPhoto');
        
        if (preview) {
            preview.classList.add('hidden');
        }
        if (photoInput) {
            photoInput.value = '';
        }
    }

    // Announcement Management
    handleAnnouncementSubmit() {
        console.log('Handling announcement submit');
        console.log('Current user:', this.currentUser);
        
        // Check if user is still authenticated
        if (!this.currentUser) {
            this.showError('Ongera winjire!');
            this.showHomeScreen();
            return;
        }
        
        const title = document.getElementById('announcementTitle').value.trim();
        const message = document.getElementById('announcementMessage').value.trim();
        const category = document.getElementById('announcementCategory').value;
        const priority = document.getElementById('announcementPriority').value;
        
        // Input validation
        if (!title || !message || !category || !priority) {
            console.log('Validation failed - empty fields');
            this.showError('Nyamuneka wuzuye ibi byose!');
            return;
        }

        // Input length validation
        if (title.length > 100) {
            this.showError('Umutwe ugufi iyo urebye 100 inyuguti!');
            return;
        }
        
        if (message.length > 500) {
            this.showError('Ubutumwa bugufi iyo urebye 500 inyuguti!');
            return;
        }
        
        // Input sanitization
        const sanitizedTitle = this.sanitizeInput(title);
        const sanitizedMessage = this.sanitizeInput(message);
        
        // Additional XSS prevention
        if (this.containsMaliciousContent(sanitizedTitle) || this.containsMaliciousContent(sanitizedMessage)) {
            this.showError('Ibyo wanditse birimo ibintu bidakwiriye!');
            this.logAudit('ANNOUNCEMENT_BLOCKED', { user: this.currentUser.username, reason: 'malicious_content' });
            return;
        }
        
        if (this.editingId) {
            // Edit existing announcement
            const index = this.announcements.findIndex(a => a.id === this.editingId);
            if (index !== -1) {
                this.announcements[index] = {
                    ...this.announcements[index],
                    title: sanitizedTitle,
                    message: sanitizedMessage,
                    category,
                    priority,
                    photo: this.selectedPhoto || this.announcements[index].photo,
                    updatedAt: new Date().toISOString()
                };
                console.log('Announcement updated:', this.announcements[index]);
                this.logAudit('ANNOUNCEMENT_UPDATED', { id: this.editingId, title: sanitizedTitle });
                this.showSuccess('Amakuru ahinduwe neza!');
            }
        } else {
            // Create new announcement
            const newAnnouncement = {
                id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
                title: sanitizedTitle,
                message: sanitizedMessage,
                category,
                priority,
                photo: this.selectedPhoto,
                author: this.currentUser.username,
                role: this.currentUser.role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.announcements.unshift(newAnnouncement);
            console.log('New announcement created:', newAnnouncement);
            this.logAudit('ANNOUNCEMENT_CREATED', { id: newAnnouncement.id, title: sanitizedTitle });
            this.showSuccess('Amakuru yongeye gutangazwa neza!');
        }
        
        // Clear selected photo after saving
        this.selectedPhoto = null;
        
        console.log('Saving to storage...');
        this.saveToStorage();
        console.log('Closing modal...');
        this.closeModal();
        console.log('Loading announcements...');
        this.loadAnnouncements();
    }
    
    // Check for malicious content patterns
    containsMaliciousContent(input) {
        const patterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /vbscript:/gi,
            /expression\s*\(/gi
        ];
        
        return patterns.some(pattern => pattern.test(input));
    }

    deleteAnnouncement(id) {
        console.log('deleteAnnouncement called with ID:', id);
        console.log('Current user:', this.currentUser);
        console.log('app object:', window.app);
        
        if (!this.currentUser || this.currentUser.role !== 'Admin') {
            console.log('Access denied - not admin');
            this.showError('Guhisha amakuru urashobora kuyagira administrator gusa!');
            this.logAudit('DELETE_DENIED', { id, user: this.currentUser?.username, reason: 'unauthorized' });
            return;
        }
        
        if (confirm('Uzi neza ko ushaka gusiba iyi makuru?')) {
            console.log('Deleting announcement with ID:', id);
            console.log('Announcements before deletion:', this.announcements);
            
            const originalLength = this.announcements.length;
            const announcement = this.announcements.find(a => a.id === id);
            this.announcements = this.announcements.filter(a => a.id !== id);
            const newLength = this.announcements.length;
            
            console.log('Announcements after deletion:', this.announcements);
            console.log('Original length:', originalLength, 'New length:', newLength);
            
            if (originalLength === newLength) {
                console.log('No announcement was deleted - ID not found');
                this.showError('Amakuru ntishashokore gusibwa!');
                return;
            }
            
            this.logAudit('ANNOUNCEMENT_DELETED', { id, title: announcement?.title });
            this.saveToStorage();
            this.loadAnnouncements();
            this.showSuccess('Amakuru yasibwe neza!');
        }
    }

    clearAllAnnouncements() {
        if (!this.currentUser || this.currentUser.role !== 'Admin') {
            this.showError('Ibi ukora kuri administrator gusa!');
            this.logAudit('CLEAR_ALL_DENIED', { user: this.currentUser?.username });
            return;
        }
        
        if (confirm('Uzi neza ko ushaka gusiba amakuru yose? Iyi bikorwa ntibishobora kuburikwa.')) {
            console.log('Clearing all announcements');
            console.log('Announcements before clearing:', this.announcements);
            
            const count = this.announcements.length;
            this.announcements = [];
            
            console.log('Announcements after clearing:', this.announcements);
            
            this.logAudit('ANNOUNCEMENTS_CLEARED', { count, user: this.currentUser.username });
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
                    ${announcement.photo ? `<img src="${announcement.photo}" alt="Announcement photo" class="announcement-photo">` : ''}
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
                    ${announcement.photo ? `<img src="${announcement.photo}" alt="" class="activity-photo">` : ''}
                    <div class="activity-content">
                        <strong>${this.escapeHtml(announcement.title)}</strong>
                        <br>
                        <small>${announcement.author} - ${dateString}</small>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('recentActivity').innerHTML = recentActivityHtml;
    }

    // Storage
    saveToStorage() {
        try {
            const data = {
                currentUser: this.currentUser,
                announcements: this.announcements,
                timestamp: Date.now(),
                checksum: this.generateChecksum(this.announcements)
            };
            localStorage.setItem('mukibaraApp', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('mukibaraApp');
            if (stored) {
                const data = JSON.parse(stored);
                
                // Validate stored data
                if (data && data.announcements) {
                    // Verify data integrity
                    if (data.checksum && !this.verifyChecksum(data.announcements, data.checksum)) {
                        console.warn('Data integrity check failed - clearing data');
                        this.announcements = [];
                        this.currentUser = null;
                        return;
                    }
                    
                    this.announcements = data.announcements || [];
                    
                    // Validate session if user exists
                    if (data.currentUser) {
                        const sessionAge = Date.now() - (data.timestamp || 0);
                        if (sessionAge < this.security.sessionTimeout) {
                            this.currentUser = data.currentUser;
                            this.security.lastActivity = Date.now();
                        } else {
                            // Session expired
                            this.currentUser = null;
                            console.log('Session expired on load');
                        }
                    }
                }
                
                console.log('App loaded from storage');
            }
        } catch (e) {
            console.error('Error loading from storage:', e);
            this.announcements = [];
            this.currentUser = null;
        }
        
        // Load audit log
        this.loadAuditLog();
    }
    
    // Simple checksum for data integrity
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    verifyChecksum(data, checksum) {
        return this.generateChecksum(data) === checksum;
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
