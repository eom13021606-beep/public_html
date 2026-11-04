/**
 * Theme Manager (Light & Dark Mode)
 */
(function() {
  const THEME_KEY = 'seohyun-portfolio-theme';
  
  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to light mode as specified in the portfolio design plan
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeButtons(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function updateThemeButtons(theme) {
    const buttons = document.querySelectorAll('.btn-theme-toggle');
    buttons.forEach(btn => {
      if (theme === 'dark') {
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.title = 'Switch to light mode';
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
      } else {
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.title = 'Switch to dark mode';
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    });
  }

  // Initial execution before DOM load to avoid flash of wrong theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Setup click listeners when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    updateThemeButtons(document.documentElement.getAttribute('data-theme') || 'light');
    document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  window.PortfolioTheme = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
    setTheme: applyTheme,
    toggleTheme: toggleTheme
  };
})();

