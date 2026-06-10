/* ============================================================
   PREMIUM PORTFOLIO – script.js
   Complete single-page portfolio interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ----------------------------------------------------------
     0. UTILITY HELPERS
  ---------------------------------------------------------- */

  /** Debounce – limits how often `fn` fires */
  function debounce(fn, delay = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Throttle via requestAnimationFrame */
  function rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  }

  /* ----------------------------------------------------------
     1. PRELOADER
  ---------------------------------------------------------- */

  const preloader = document.querySelector('.preloader');
  const MIN_PRELOADER_MS = 1000;
  const preloaderStart = Date.now();

  function hidePreloader() {
    const elapsed = Date.now() - preloaderStart;
    const remaining = Math.max(0, MIN_PRELOADER_MS - elapsed);

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('fade-out');
        preloader.addEventListener('transitionend', () => {
          preloader.style.display = 'none';
        }, { once: true });
        // Fallback if transitionend never fires
        setTimeout(() => {
          if (preloader) preloader.style.display = 'none';
        }, 800);
      }
      document.body.classList.remove('loading');
    }, remaining);
  }

  if (preloader) {
    document.body.classList.add('loading');
    window.addEventListener('load', hidePreloader);
    // Safety net – hide preloader after 5 s no matter what
    setTimeout(hidePreloader, 5000);
  }

  /* ----------------------------------------------------------
     2. NAVBAR ELEMENTS
  ---------------------------------------------------------- */

  const navbar = document.querySelector('nav, .navbar, header');
  const hamburger = document.querySelector('.hamburger, .menu-toggle, .mobile-toggle');
  const mobileMenu = document.querySelector('.nav-links, .mobile-menu, .nav-menu');
  const navLinks = document.querySelectorAll('.nav-links a, .nav-menu a, .mobile-menu a');
  const NAVBAR_HEIGHT = 80;

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL NAVIGATION
  ---------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Close mobile menu after click
      closeMobileMenu();
    });
  });

  /* ----------------------------------------------------------
     4. NAVBAR SCROLL EFFECT
  ---------------------------------------------------------- */

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', rafThrottle(handleNavbarScroll), { passive: true });
  handleNavbarScroll(); // run on load

  /* ----------------------------------------------------------
     5. ACTIVE NAV LINK HIGHLIGHTING
  ---------------------------------------------------------- */

  const sections = document.querySelectorAll('section[id]');

  function highlightActiveLink() {
    const scrollPos = window.scrollY + NAVBAR_HEIGHT + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Also use IntersectionObserver as a secondary approach for precision
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    {
      rootMargin: `-${NAVBAR_HEIGHT}px 0px -50% 0px`,
      threshold: 0
    }
  );

  sections.forEach(section => sectionObserver.observe(section));
  window.addEventListener('scroll', debounce(highlightActiveLink, 80), { passive: true });

  /* ----------------------------------------------------------
     6. MOBILE MENU TOGGLE
  ---------------------------------------------------------- */

  function openMobileMenu() {
    if (hamburger) hamburger.classList.add('active');
    if (mobileMenu) mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    const isOpen = hamburger && hamburger.classList.contains('active');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!mobileMenu || !hamburger) return;
    const isMenuOpen = mobileMenu.classList.contains('active');
    if (isMenuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  /* ----------------------------------------------------------
     7. DESIGNATION ROTATOR
  ---------------------------------------------------------- */

  const designationItems = document.querySelectorAll('.designation-item');

  if (designationItems.length) {
    let currentDesignation = 0;
    const rotateDesignation = () => {
      designationItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentDesignation);
      });
      currentDesignation = (currentDesignation + 1) % designationItems.length;
    };

    rotateDesignation();
    setInterval(rotateDesignation, 2800);
  }

  /* ----------------------------------------------------------
     8. SCROLL REVEAL ANIMATIONS
  ---------------------------------------------------------- */

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('active');

          // Stagger children if parent has reveal-stagger
          if (el.classList.contains('reveal-stagger')) {
            const children = el.querySelectorAll('.reveal, .reveal-left, .reveal-right');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('active');
              }, index * 150);
            });
          }

          revealObserver.unobserve(el);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // Also observe stagger parents
  document.querySelectorAll('.reveal-stagger').forEach(el => {
    if (!el.classList.contains('reveal') &&
        !el.classList.contains('reveal-left') &&
        !el.classList.contains('reveal-right')) {
      revealObserver.observe(el);
    }
  });

  /* ----------------------------------------------------------
     9. ANIMATED SKILL PROGRESS BARS
  ---------------------------------------------------------- */

  const progressBars = document.querySelectorAll('.progress-bar, [data-progress]');
  const animatedBars = new Set();

  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedBars.has(entry.target)) {
          animatedBars.add(entry.target);
          const bar = entry.target;
          const progress = bar.getAttribute('data-progress') || bar.dataset.progress || 0;

          // Ensure bar starts at 0
          bar.style.width = '0%';
          bar.style.transition = 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

          // Trigger reflow then animate
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.width = `${progress}%`;
            });
          });

          progressObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  progressBars.forEach(bar => progressObserver.observe(bar));

  /* ----------------------------------------------------------
     10. ANIMATED COUNTERS
  ---------------------------------------------------------- */

  const counters = document.querySelectorAll('.counter');
  const animatedCounters = new Set();

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animatedCounters.has(entry.target)) {
          animatedCounters.add(entry.target);
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => counterObserver.observe(counter));

  /* ----------------------------------------------------------
     11. PROJECT CARD 3D TILT EFFECT
  ---------------------------------------------------------- */

  const projectCards = document.querySelectorAll('.project-card, .card');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within card
      const y = e.clientY - rect.top;  // y position within card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt of 5 degrees
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease';
    });
  });

  /* ----------------------------------------------------------
     12. CONTACT FORM VALIDATION & SUBMISSION
  ---------------------------------------------------------- */

  const contactForm = document.querySelector('#contact-form, .contact-form, form');

  if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, textarea');

    // Floating label effect
    formInputs.forEach(input => {
      // Set initial state
      if (input.value.trim() !== '') {
        const wrapper = input.closest('.form-group, .input-wrapper, .form-field');
        if (wrapper) wrapper.classList.add('has-value');
      }

      input.addEventListener('input', () => {
        const wrapper = input.closest('.form-group, .input-wrapper, .form-field');
        if (!wrapper) return;
        if (input.value.trim() !== '') {
          wrapper.classList.add('has-value');
        } else {
          wrapper.classList.remove('has-value');
        }
      });

      input.addEventListener('focus', () => {
        const wrapper = input.closest('.form-group, .input-wrapper, .form-field');
        if (wrapper) wrapper.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        const wrapper = input.closest('.form-group, .input-wrapper, .form-field');
        if (wrapper) wrapper.classList.remove('focused');
      });
    });

    // Validation helpers
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(field, message) {
      clearError(field);
      const wrapper = field.closest('.form-group, .input-wrapper, .form-field') || field.parentElement;
      wrapper.classList.add('error');
      const errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      errorEl.style.cssText = 'color:#e74c3c;font-size:0.8rem;margin-top:4px;display:block;animation:fadeIn 0.3s ease;';
      wrapper.appendChild(errorEl);
    }

    function clearError(field) {
      const wrapper = field.closest('.form-group, .input-wrapper, .form-field') || field.parentElement;
      wrapper.classList.remove('error');
      const existing = wrapper.querySelector('.error-message');
      if (existing) existing.remove();
    }

    function clearAllErrors() {
      contactForm.querySelectorAll('.error-message').forEach(el => el.remove());
      contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors();

      const nameField = contactForm.querySelector('[name="name"], #name');
      const emailField = contactForm.querySelector('[name="email"], #email');
      const subjectField = contactForm.querySelector('[name="subject"], #subject');
      const messageField = contactForm.querySelector('[name="message"], #message');

      let isValid = true;

      // Validate name
      if (nameField && nameField.value.trim() === '') {
        showError(nameField, 'Please enter your name');
        isValid = false;
      }

      // Validate email
      if (emailField) {
        if (emailField.value.trim() === '') {
          showError(emailField, 'Please enter your email');
          isValid = false;
        } else if (!isValidEmail(emailField.value.trim())) {
          showError(emailField, 'Please enter a valid email address');
          isValid = false;
        }
      }

      // Validate subject
      if (subjectField && subjectField.value.trim() === '') {
        showError(subjectField, 'Please enter a subject');
        isValid = false;
      }

      // Validate message
      if (messageField && messageField.value.trim() === '') {
        showError(messageField, 'Please enter a message');
        isValid = false;
      }

      if (!isValid) return;

      // Build mailto
      const subject = subjectField ? encodeURIComponent(subjectField.value.trim()) : '';
      const body = encodeURIComponent(
        `Name: ${nameField ? nameField.value.trim() : 'N/A'}\n` +
        `Email: ${emailField ? emailField.value.trim() : 'N/A'}\n\n` +
        `${messageField ? messageField.value.trim() : ''}`
      );

      window.location.href = `mailto:qurrath2809@gmail.com?subject=${subject}&body=${body}`;

      // Show success message
      showFormSuccess();

      // Reset form after 3 seconds
      setTimeout(() => {
        contactForm.reset();
        clearAllErrors();
        formInputs.forEach(input => {
          const wrapper = input.closest('.form-group, .input-wrapper, .form-field');
          if (wrapper) wrapper.classList.remove('has-value');
        });
        removeFormSuccess();
      }, 3000);
    });

    function showFormSuccess() {
      removeFormSuccess();
      const successEl = document.createElement('div');
      successEl.className = 'form-success';
      successEl.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 1px solid #d4af37;
          color: #d4af37;
          padding: 16px 24px;
          border-radius: 8px;
          margin-top: 16px;
          text-align: center;
          animation: slideUp 0.5s ease;
          font-weight: 500;
        ">
          <span style="font-size:1.3rem;margin-right:8px;">✓</span>
          Message prepared! Your email client should open shortly.
        </div>
      `;
      contactForm.appendChild(successEl);
    }

    function removeFormSuccess() {
      const existing = contactForm.querySelector('.form-success');
      if (existing) existing.remove();
    }
  }

  /* ----------------------------------------------------------
     13. BACK TO TOP BUTTON
  ---------------------------------------------------------- */

  const backToTopBtn = document.querySelector('.back-to-top, #back-to-top, .scroll-top');

  // Create one if it doesn't exist
  let scrollTopBtn = backToTopBtn;
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'back-to-top';
    scrollTopBtn.setAttribute('aria-label', 'Back to top');
    scrollTopBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    scrollTopBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4af37, #b8962e);
      color: #1a1a2e;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 999;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    `;
    document.body.appendChild(scrollTopBtn);
  }

  function handleBackToTop() {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.visibility = 'visible';
      scrollTopBtn.style.transform = 'translateY(0)';
    } else {
      scrollTopBtn.classList.remove('visible');
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.visibility = 'hidden';
      scrollTopBtn.style.transform = 'translateY(20px)';
    }
  }

  window.addEventListener('scroll', rafThrottle(handleBackToTop), { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Hover effect
  scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.style.transform = 'translateY(-3px)';
    scrollTopBtn.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
  });
  scrollTopBtn.addEventListener('mouseleave', () => {
    if (scrollTopBtn.classList.contains('visible')) {
      scrollTopBtn.style.transform = 'translateY(0)';
      scrollTopBtn.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
    }
  });

  /* ----------------------------------------------------------
     14. PARALLAX EFFECTS (subtle)
  ---------------------------------------------------------- */

  const heroSection = document.querySelector('.hero, #hero, #home, .hero-section');
  const parallaxElements = document.querySelectorAll('.parallax-bg, .hero-bg, .hero-shape, .floating-shape');

  function handleParallax() {
    const scrolled = window.pageYOffset;
    const maxScroll = window.innerHeight;

    // Only apply parallax in hero region
    if (scrolled > maxScroll * 1.5) return;

    parallaxElements.forEach((el, index) => {
      const speed = 0.2 + index * 0.1;
      const yPos = -(scrolled * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });

    // Parallax for hero background
    if (heroSection) {
      const heroY = scrolled * 0.3;
      heroSection.style.backgroundPositionY = `${heroY}px`;
    }
  }

  window.addEventListener('scroll', rafThrottle(handleParallax), { passive: true });

  /* ----------------------------------------------------------
     15. PARTICLE / DOTS BACKGROUND FOR HERO
  ---------------------------------------------------------- */

  function createParticles() {
    const heroEl = document.querySelector('.hero, #hero, #home, .hero-section');
    if (!heroEl) return;

    // Ensure hero has relative positioning for absolute children
    const heroStyle = window.getComputedStyle(heroEl);
    if (heroStyle.position === 'static') {
      heroEl.style.position = 'relative';
    }
    heroEl.style.overflow = 'hidden';

    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles-container';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    // Inject keyframes
    if (!document.querySelector('#particle-keyframes')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'particle-keyframes';
      styleSheet.textContent = `
        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: var(--particle-opacity);
          }
          25% {
            transform: translate(var(--dx1), var(--dy1)) rotate(90deg);
            opacity: calc(var(--particle-opacity) * 1.3);
          }
          50% {
            transform: translate(var(--dx2), var(--dy2)) rotate(180deg);
            opacity: var(--particle-opacity);
          }
          75% {
            transform: translate(var(--dx3), var(--dy3)) rotate(270deg);
            opacity: calc(var(--particle-opacity) * 0.7);
          }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(styleSheet);
    }

    const PARTICLE_COUNT = 50;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dot = document.createElement('div');
      const size = 2 + Math.random() * 3; // 2–5px
      const opacity = 0.1 + Math.random() * 0.4; // 0.1–0.5
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 15 + Math.random() * 25; // 15–40s
      const delay = Math.random() * -30;

      // Random drift amounts
      const dx1 = (Math.random() - 0.5) * 80;
      const dy1 = (Math.random() - 0.5) * 80;
      const dx2 = (Math.random() - 0.5) * 60;
      const dy2 = (Math.random() - 0.5) * 60;
      const dx3 = (Math.random() - 0.5) * 90;
      const dy3 = (Math.random() - 0.5) * 90;

      dot.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #d4af37, rgba(212, 175, 55, 0.3));
        border-radius: 50%;
        left: ${left}%;
        top: ${top}%;
        --particle-opacity: ${opacity};
        --dx1: ${dx1}px;
        --dy1: ${dy1}px;
        --dx2: ${dx2}px;
        --dy2: ${dy2}px;
        --dx3: ${dx3}px;
        --dy3: ${dy3}px;
        opacity: ${opacity};
        animation: particleFloat ${duration}s ${delay}s ease-in-out infinite;
        will-change: transform, opacity;
      `;
      particleContainer.appendChild(dot);
    }

    // Insert particles behind hero content
    heroEl.insertBefore(particleContainer, heroEl.firstChild);
  }

  createParticles();

  /* ----------------------------------------------------------
     16. GITHUB STATS
  ---------------------------------------------------------- */

  const GITHUB_USERNAME = 'syedaqurrath';

  async function fetchGitHubStats() {
    const statsContainer = document.querySelector('#github-summary');
    if (!statsContainer) return;

    // Fallback data
    const fallbackData = {
      public_repos: 15,
      followers: 10,
      following: 5,
      public_gists: 3
    };

    try {
      // Fetch user profile
      const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      let userData;

      if (userResponse.ok) {
        userData = await userResponse.json();
      } else {
        userData = fallbackData;
      }

      // Update stat counters
      updateStatElement('gh-repos', userData.public_repos);
      updateStatElement('gh-contributions', 'Active');
      updateStatElement('gh-languages', 'Top Languages');
      updateStatElement('gh-opensource', '3+');

      // Fetch repos for language stats
      const reposResponse = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
      );

      if (reposResponse.ok) {
        const repos = await reposResponse.json();
        calculateLanguageStats(repos);
      }
    } catch (error) {
      console.warn('GitHub API fetch failed, using fallback data:', error);
      updateStatElement('gh-repos', fallbackData.public_repos);
      updateStatElement('gh-contributions', 'Active');
      updateStatElement('gh-languages', 'Top Languages');
      updateStatElement('gh-opensource', '3+');
    }
  }

  function updateStatElement(id, value) {
    const el = document.getElementById(id) || document.querySelector(`[data-stat="${id}"]`);
    if (el) {
      el.setAttribute('data-target', value);
      el.textContent = value;
    }
  }

  function calculateLanguageStats(repos) {
    const languageCounts = {};
    let totalCount = 0;

    repos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        totalCount++;
      }
    });

    // Sort by count
    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Top 6 languages

    const languageContainer = document.querySelector('.github-languages-breakdown, #gh-lang-bars');
    if (!languageContainer) return;

    // Language colors
    const langColors = {
      JavaScript: '#f7df1e',
      Python: '#3776ab',
      TypeScript: '#3178c6',
      Java: '#ed8b00',
      'C++': '#00599c',
      C: '#555555',
      HTML: '#e34f26',
      CSS: '#1572b6',
      Ruby: '#cc342d',
      Go: '#00add8',
      Rust: '#dea584',
      PHP: '#777bb4',
      Swift: '#fa7343',
      Kotlin: '#7f52ff',
      Dart: '#0175c2',
      Shell: '#89e051',
      'Jupyter Notebook': '#f37626',
      R: '#276dc3',
    };

    languageContainer.innerHTML = '';

    sortedLanguages.forEach(([language, count]) => {
      const percentage = ((count / totalCount) * 100).toFixed(1);
      const color = langColors[language] || '#d4af37';

      const langBar = document.createElement('div');
      langBar.className = 'language-bar';
      langBar.style.cssText = 'margin-bottom: 12px;';
      langBar.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.85rem;">
          <span style="color:#e0e0e0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>
            ${language}
          </span>
          <span style="color:#aaa;">${percentage}%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
          <div class="lang-progress" data-progress="${percentage}" style="height:100%;width:0%;background:${color};border-radius:3px;transition:width 1.5s ease;"></div>
        </div>
      `;
      languageContainer.appendChild(langBar);
    });

    // Animate language bars after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.lang-progress').forEach(bar => {
          const progress = bar.getAttribute('data-progress');
          bar.style.width = `${progress}%`;
        });
      }, 300);
    });
  }

  fetchGitHubStats();

  /* ----------------------------------------------------------
     17. NAVBAR PROGRESS INDICATOR
  ---------------------------------------------------------- */

  let progressBar = document.querySelector('.scroll-progress, #scroll-progress');

  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 0%;
      background: linear-gradient(90deg, #d4af37, #f5d77a, #d4af37);
      z-index: 10001;
      transition: width 0.1s linear;
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
    `;
    document.body.appendChild(progressBar);
  }

  function updateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${scrollPercent}%`;
  }

  window.addEventListener('scroll', rafThrottle(updateScrollProgress), { passive: true });
  updateScrollProgress();

  /* ----------------------------------------------------------
     18. SECTION TRANSITION EFFECTS
  ---------------------------------------------------------- */

  const allSections = document.querySelectorAll('section');

  const sectionTransitionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  allSections.forEach(section => {
    // Only set initial state if not already styled
    if (!section.classList.contains('section-visible')) {
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
    sectionTransitionObserver.observe(section);
  });

  /* ----------------------------------------------------------
     19. KEYBOARD NAVIGATION
  ---------------------------------------------------------- */

  document.addEventListener('keydown', (e) => {
    // Escape closes mobile menu
    if (e.key === 'Escape') {
      closeMobileMenu();

      // Also close any open modals
      const modals = document.querySelectorAll('.modal.active, .modal.open, .lightbox.active');
      modals.forEach(modal => modal.classList.remove('active', 'open'));
    }

    // Tab navigation – ensure focus stays within mobile menu when open
    if (e.key === 'Tab' && mobileMenu && mobileMenu.classList.contains('active')) {
      const focusableElements = mobileMenu.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab – go to last element if at first
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab – go to first element if at last
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  /* ----------------------------------------------------------
     20. LAZY LOAD IMAGES
  ---------------------------------------------------------- */

  const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01
      }
    );

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }

  /* ----------------------------------------------------------
     21. ADDITIONAL POLISH
  ---------------------------------------------------------- */

  // Inject cursor-blink animation for typing effect
  if (!document.querySelector('#typing-cursor-style')) {
    const cursorStyle = document.createElement('style');
    cursorStyle.id = 'typing-cursor-style';
    cursorStyle.textContent = `
      .typing-cursor::after {
        content: '|';
        display: inline-block;
        animation: cursorBlink 0.7s step-end infinite;
        color: #d4af37;
        font-weight: 300;
        margin-left: 2px;
      }
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .back-to-top:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5) !important;
      }
    `;
    document.head.appendChild(cursorStyle);
  }

  // Smooth-scroll polyfill detection
  if (!('scrollBehavior' in document.documentElement.style)) {
    // Basic smooth-scroll fallback for older browsers
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function (options) {
      if (typeof options === 'object' && options.behavior === 'smooth') {
        const startY = window.pageYOffset;
        const targetY = options.top || 0;
        const distance = targetY - startY;
        const duration = 600;
        let startTime = null;

        function step(currentTime) {
          if (!startTime) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
          window.scrollTo(0, startY + distance * eased);
          if (elapsed < duration) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      } else {
        originalScrollTo.apply(window, arguments);
      }
    };
  }

  /* ----------------------------------------------------------
     CONSOLE BRANDING
  ---------------------------------------------------------- */

  console.log(
    '%c✦ Portfolio loaded successfully ✦',
    'background: linear-gradient(135deg, #1a1a2e, #16213e); color: #d4af37; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px;'
  );

}); // end DOMContentLoaded
