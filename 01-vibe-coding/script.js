// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize all functions
  initNavigation();
  initScrollEffects();
  initPortfolioFilter();
  initTestimonialsSlider();
  initContactForm();
  initAnimations();
  initBackToTop();
  initAuth();
});

// Navigation functionality
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Mobile menu toggle
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });

  // Navbar background on scroll
  window.addEventListener('scroll', function () {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Active navigation link on scroll
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove('active'));
        if (navLink) navLink.classList.add('active');
      }
    });
  });

  // Smooth scroll for navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
}

// Scroll effects and animations
function initScrollEffects() {
  // Parallax effect for hero section
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');

  window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    if (hero && scrolled < hero.offsetHeight) {
      heroContent.style.transform = `translateY(${rate * 0.5}px)`;
      heroVisual.style.transform = `translateY(${rate * 0.3}px)`;
    }
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');

        // Special handling for counter animation
        if (entry.target.classList.contains('stat-number')) {
          animateCounter(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    '.service-card, .portfolio-item, .testimonial-item, .stat-number, .feature-item'
  );
  animateElements.forEach((el) => observer.observe(el));
}

// Counter animation
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(function () {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// Portfolio filter functionality
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter portfolio items
      portfolioItems.forEach((item) => {
        const category = item.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.5s ease-in-out';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Testimonials slider
function initTestimonialsSlider() {
  const testimonialItems = document.querySelectorAll('.testimonial-item');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    // Hide all slides
    testimonialItems.forEach((item) => item.classList.remove('active'));
    dots.forEach((dot) => dot.classList.remove('active'));

    // Show current slide
    if (testimonialItems[index]) {
      testimonialItems[index].classList.add('active');
      dots[index].classList.add('active');
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % testimonialItems.length;
    showSlide(currentSlide);
  }

  function startSlideshow() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopSlideshow() {
    clearInterval(slideInterval);
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function () {
      currentSlide = index;
      showSlide(currentSlide);
      stopSlideshow();
      startSlideshow();
    });
  });

  // Start automatic slideshow
  startSlideshow();

  // Pause on hover
  const testimonialsSection = document.querySelector('.testimonials-slider');
  if (testimonialsSection) {
    testimonialsSection.addEventListener('mouseenter', stopSlideshow);
    testimonialsSection.addEventListener('mouseleave', startSlideshow);
  }
}

// Contact form functionality
function initContactForm() {
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      // Validate form
      if (validateForm(formObject)) {
        // Show success message
        showNotification('문의가 성공적으로 전송되었습니다!', 'success');

        // Reset form
        this.reset();
      } else {
        showNotification('모든 필수 항목을 입력해주세요.', 'error');
      }
    });
  }
}

// Form validation
function validateForm(data) {
  return data.name && data.email && data.service && data.message;
}

// Show notification
function showNotification(message, type) {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;

  // Add to body
  document.body.appendChild(notification);

  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', function () {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Initialize animations
function initAnimations() {
  // Add CSS for notification animations
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .animate {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .service-card.animate {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .portfolio-item.animate {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .feature-item.animate {
            animation: fadeInUp 0.6s ease-out;
        }
    `;
  document.head.appendChild(style);
}

// Back to top button
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }
}

// ==================== AUTH FUNCTIONALITY ====================

// Mock user data for testing
const mockUsers = [
  {
    id: 1,
    name: '김민수',
    email: 'minsu@example.com',
    password: 'password123',
    phone: '010-1234-5678',
    twoFactorEnabled: false,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: null,
  },
  {
    id: 2,
    name: '이지영',
    email: 'jiyoung@example.com',
    password: 'password456',
    phone: '010-9876-5432',
    twoFactorEnabled: true,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20'),
  },
];

// Current user state
let currentUser = null;
let isLoggedIn = false;

// Initialize authentication functionality
function initAuth() {
  // Check if user is already logged in
  checkAuthState();

  // Bind modal events
  bindModalEvents();

  // Bind form events
  bindFormEvents();

  // Bind navigation events
  bindNavEvents();

  // Bind social login events
  bindSocialLoginEvents();
}

// Check authentication state on page load
function checkAuthState() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    isLoggedIn = true;
    updateUIForLoggedInUser();
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const navAuth = document.querySelector('.nav-auth');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');

  // Hide login/signup buttons
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  if (loginBtn) loginBtn.style.display = 'none';
  if (signupBtn) signupBtn.style.display = 'none';

  // Show user menu
  if (userMenu) {
    userMenu.style.display = 'block';
    if (userName) userName.textContent = currentUser.name;
    if (userEmail) userEmail.textContent = currentUser.email;
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  const userMenu = document.getElementById('user-menu');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  // Show login/signup buttons
  if (loginBtn) loginBtn.style.display = 'inline-flex';
  if (signupBtn) signupBtn.style.display = 'inline-flex';

  // Hide user menu
  if (userMenu) userMenu.style.display = 'none';
}

// Bind modal events
function bindModalEvents() {
  // Login modal
  const loginBtn = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  const loginClose = document.getElementById('login-close');
  const loginOverlay = document.getElementById('login-overlay');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => showModal('login-modal'));
  }

  if (loginClose) {
    loginClose.addEventListener('click', () => hideModal('login-modal'));
  }

  if (loginOverlay) {
    loginOverlay.addEventListener('click', () => hideModal('login-modal'));
  }

  // Signup modal
  const signupBtn = document.getElementById('signup-btn');
  const signupModal = document.getElementById('signup-modal');
  const signupClose = document.getElementById('signup-close');
  const signupOverlay = document.getElementById('signup-overlay');

  if (signupBtn) {
    signupBtn.addEventListener('click', () => showModal('signup-modal'));
  }

  if (signupClose) {
    signupClose.addEventListener('click', () => hideModal('signup-modal'));
  }

  if (signupOverlay) {
    signupOverlay.addEventListener('click', () => hideModal('signup-modal'));
  }

  // Auth switch links
  const showSignupLink = document.getElementById('show-signup');
  const showLoginLink = document.getElementById('show-login');

  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal('login-modal');
      showModal('signup-modal');
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal('signup-modal');
      showModal('login-modal');
    });
  }

  // 2FA modal
  const twofaClose = document.getElementById('twofa-close');
  const twofaOverlay = document.getElementById('twofa-overlay');

  if (twofaClose) {
    twofaClose.addEventListener('click', () => hideModal('twofa-modal'));
  }

  if (twofaOverlay) {
    twofaOverlay.addEventListener('click', () => hideModal('twofa-modal'));
  }

  // Success modal
  const successClose = document.getElementById('success-close');
  const successOverlay = document.getElementById('success-overlay');
  const successOk = document.getElementById('success-ok');

  if (successClose) {
    successClose.addEventListener('click', () => hideModal('success-modal'));
  }

  if (successOverlay) {
    successOverlay.addEventListener('click', () => hideModal('success-modal'));
  }

  if (successOk) {
    successOk.addEventListener('click', () => hideModal('success-modal'));
  }
}

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// Hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

// Bind form events
function bindFormEvents() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Signup form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // 2FA form
  const twofaForm = document.getElementById('twofa-form');
  if (twofaForm) {
    twofaForm.addEventListener('submit', handleTwoFA);
  }

  // Password toggle buttons
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener('click', togglePasswordVisibility);
  });

  // Password strength checker
  const signupPassword = document.getElementById('signup-password');
  if (signupPassword) {
    signupPassword.addEventListener('input', checkPasswordStrength);
  }

  // Confirm password validation
  const confirmPassword = document.getElementById('signup-confirm-password');
  if (confirmPassword) {
    confirmPassword.addEventListener('input', validatePasswordMatch);
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember');

  // Clear previous errors
  clearFormErrors();

  // Validate input
  if (!validateEmail(email)) {
    showFormError('login-email-error', '올바른 이메일 주소를 입력해주세요.');
    return;
  }

  if (!password) {
    showFormError('login-password-error', '비밀번호를 입력해주세요.');
    return;
  }

  // Find user in mock data
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    showFormError(
      'login-email-error',
      '이메일 또는 비밀번호가 올바르지 않습니다.'
    );
    return;
  }

  if (!user.isActive) {
    showFormError(
      'login-email-error',
      '비활성화된 계정입니다. 관리자에게 문의하세요.'
    );
    return;
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    hideModal('login-modal');
    showModal('twofa-modal');
    // Store user temporarily for 2FA verification
    sessionStorage.setItem('tempUser', JSON.stringify(user));
    return;
  }

  // Login successful
  loginUser(user, remember);
}

// Handle signup
function handleSignup(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const phone = formData.get('phone');
  const agreeTerms = formData.get('agreeTerms');

  // Clear previous errors
  clearFormErrors();

  // Validate input
  let hasError = false;

  if (!name || name.length < 2) {
    showFormError('signup-name-error', '이름은 2자 이상 입력해주세요.');
    hasError = true;
  }

  if (!validateEmail(email)) {
    showFormError('signup-email-error', '올바른 이메일 주소를 입력해주세요.');
    hasError = true;
  }

  if (mockUsers.find((u) => u.email === email)) {
    showFormError('signup-email-error', '이미 가입된 이메일 주소입니다.');
    hasError = true;
  }

  if (!validatePassword(password)) {
    showFormError(
      'signup-password-error',
      '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.'
    );
    hasError = true;
  }

  if (password !== confirmPassword) {
    showFormError(
      'signup-confirm-password-error',
      '비밀번호가 일치하지 않습니다.'
    );
    hasError = true;
  }

  if (phone && !validatePhone(phone)) {
    showFormError('signup-phone-error', '올바른 전화번호를 입력해주세요.');
    hasError = true;
  }

  if (!agreeTerms) {
    showFormError('signup-name-error', '이용약관에 동의해주세요.');
    hasError = true;
  }

  if (hasError) return;

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    password,
    phone,
    twoFactorEnabled: false,
    isActive: true,
    createdAt: new Date(),
    lastLogin: null,
  };

  // Add to mock users
  mockUsers.push(newUser);

  // Login the new user
  loginUser(newUser, false);

  // Show success message
  showSuccessMessage('회원가입이 완료되었습니다!');
}

// Handle 2FA verification
function handleTwoFA(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const code = formData.get('code');

  // Clear previous errors
  clearFormErrors();

  if (!code || code.length !== 6) {
    showFormError('twofa-code-error', '6자리 인증 코드를 입력해주세요.');
    return;
  }

  // Mock 2FA verification (in real app, this would verify with server)
  if (code === '123456') {
    const tempUser = JSON.parse(sessionStorage.getItem('tempUser'));
    sessionStorage.removeItem('tempUser');

    hideModal('twofa-modal');
    loginUser(tempUser, false);
  } else {
    showFormError('twofa-code-error', '인증 코드가 올바르지 않습니다.');
  }
}

// Login user
function loginUser(user, remember) {
  currentUser = user;
  isLoggedIn = true;

  // Update last login
  user.lastLogin = new Date();

  // Save to localStorage if remember me is checked
  if (remember) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Update UI
  updateUIForLoggedInUser();

  // Hide modals
  hideModal('login-modal');
  hideModal('signup-modal');

  // Show success message
  showSuccessMessage(`환영합니다, ${user.name}님!`);
}

// Logout user
function logoutUser() {
  currentUser = null;
  isLoggedIn = false;

  // Clear storage
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');

  // Update UI
  updateUIForLoggedOutUser();

  // Show success message
  showSuccessMessage('로그아웃되었습니다.');
}

// Bind navigation events
function bindNavEvents() {
  // User menu toggle
  const userMenu = document.getElementById('user-menu');
  const userAvatar = document.querySelector('.user-avatar');

  if (userAvatar) {
    userAvatar.addEventListener('click', () => {
      userMenu.classList.toggle('show');
    });
  }

  // Close user menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
}

// Bind social login events
function bindSocialLoginEvents() {
  // Google login
  const googleLoginBtns = document.querySelectorAll(
    '#google-login, #google-signup'
  );
  googleLoginBtns.forEach((btn) => {
    btn.addEventListener('click', () => handleSocialLogin('google'));
  });
}

// Handle social login
function handleSocialLogin(provider) {
  // Mock social login (in real app, this would redirect to OAuth provider)
  const socialUser = {
    id: mockUsers.length + 1,
    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} 사용자`,
    email: `user@${provider}.com`,
    password: null,
    phone: null,
    twoFactorEnabled: false,
    isActive: true,
    createdAt: new Date(),
    lastLogin: null,
    socialProvider: provider,
  };

  // Add to mock users if not exists
  const existingUser = mockUsers.find((u) => u.email === socialUser.email);
  if (!existingUser) {
    mockUsers.push(socialUser);
  }

  // Login the user
  loginUser(existingUser || socialUser, false);
}

// Toggle password visibility
function togglePasswordVisibility(e) {
  const button = e.target.closest('.password-toggle');
  const input = button.parentElement.querySelector('input');
  const icon = button.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Check password strength
function checkPasswordStrength(e) {
  const password = e.target.value;
  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');

  if (!password) {
    strengthFill.className = 'strength-fill';
    strengthText.textContent = '비밀번호 강도';
    return;
  }

  let strength = 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];

  strength = checks.filter(Boolean).length;

  strengthFill.className = 'strength-fill';

  if (strength <= 2) {
    strengthFill.classList.add('weak');
    strengthText.textContent = '약함';
  } else if (strength === 3) {
    strengthFill.classList.add('fair');
    strengthText.textContent = '보통';
  } else if (strength === 4) {
    strengthFill.classList.add('good');
    strengthText.textContent = '좋음';
  } else {
    strengthFill.classList.add('strong');
    strengthText.textContent = '강함';
  }
}

// Validate password match
function validatePasswordMatch(e) {
  const confirmPassword = e.target.value;
  const password = document.getElementById('signup-password').value;
  const errorElement = document.getElementById('signup-confirm-password-error');

  if (confirmPassword && password !== confirmPassword) {
    showFormError(
      'signup-confirm-password-error',
      '비밀번호가 일치하지 않습니다.'
    );
  } else {
    hideFormError('signup-confirm-password-error');
  }
}

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  return minLength && hasLower && hasUpper && hasNumber && hasSpecial;
}

function validatePhone(phone) {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
}

// Form error handling
function showFormError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function hideFormError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.classList.remove('show');
  }
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.form-error');
  errorElements.forEach((element) => {
    element.classList.remove('show');
  });
}

// Show success message
function showSuccessMessage(message) {
  const successMessage = document.getElementById('success-message');
  if (successMessage) {
    successMessage.textContent = message;
    showModal('success-modal');
  }
}

// Utility functions
function debounce(func, wait) {
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

// Performance optimization
window.addEventListener(
  'scroll',
  debounce(function () {
    // Optimized scroll handling
  }, 10)
);

// Loading animation
window.addEventListener('load', function () {
  document.body.classList.add('loaded');

  // Trigger hero animations
  const heroTitle = document.querySelector('.hero-title');
  const heroDescription = document.querySelector('.hero-description');
  const heroButtons = document.querySelector('.hero-buttons');

  if (heroTitle) {
    setTimeout(() => (heroTitle.style.animation = 'fadeInUp 1s ease-out'), 100);
  }
  if (heroDescription) {
    setTimeout(
      () => (heroDescription.style.animation = 'fadeInUp 1s ease-out'),
      300
    );
  }
  if (heroButtons) {
    setTimeout(
      () => (heroButtons.style.animation = 'fadeInUp 1s ease-out'),
      500
    );
  }
});

// Error handling
window.addEventListener('error', function (e) {
  console.error('JavaScript error:', e.error);
});

// Touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function (e) {
  touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function (e) {
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartY - touchEndY;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe up
      console.log('Swipe up detected');
    } else {
      // Swipe down
      console.log('Swipe down detected');
    }
  }
}

// Keyboard navigation support
document.addEventListener('keydown', function (e) {
  // ESC key to close mobile menu
  if (e.key === 'Escape') {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    }
  }

  // Arrow keys for testimonial navigation
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const dots = document.querySelectorAll('.dot');
    const activeDot = document.querySelector('.dot.active');
    if (activeDot && dots.length > 0) {
      let currentIndex = Array.from(dots).indexOf(activeDot);
      if (e.key === 'ArrowLeft') {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : dots.length - 1;
      } else {
        currentIndex = currentIndex < dots.length - 1 ? currentIndex + 1 : 0;
      }
      dots[currentIndex].click();
    }
  }
});

// Resize handler
window.addEventListener(
  'resize',
  debounce(function () {
    // Handle responsive changes
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');

    if (window.innerWidth > 768) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    }
  }, 250)
);

// Preload critical resources
function preloadResources() {
  const criticalResources = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  ];

  criticalResources.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Initialize preloading
preloadResources();
