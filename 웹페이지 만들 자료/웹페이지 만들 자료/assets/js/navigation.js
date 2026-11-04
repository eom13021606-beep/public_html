/**
 * Navigation Manager
 * Handles active page states, mobile drawer toggle, and keyboard accessibility
 */
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Highlight active desktop & mobile links
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else if (currentPath.includes('project-detail') && href === 'projects.html') {
      link.classList.add('active');
    } else if (currentPath.includes('activity-detail') && href === 'activities.html') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile Menu Drawer Logic
  const mobileMenuBtn = document.querySelector('.btn-mobile-menu');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

  if (mobileMenuBtn && mobileNavOverlay) {
    function toggleMobileMenu() {
      const isOpen = mobileNavOverlay.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    function openMobileMenu() {
      mobileNavOverlay.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileNavOverlay.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close when clicking on background overlay
    mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) {
        closeMobileMenu();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavOverlay.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Close when mobile link clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }
});

