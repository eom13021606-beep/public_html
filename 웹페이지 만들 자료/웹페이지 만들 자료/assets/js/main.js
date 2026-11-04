/**
 * Main Application Logic (Home, About, Skills, Contact & Common Utilities)
 */
(function() {
  // Toast notification helper
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  window.showToast = showToast;

  // Initialize Home Page
  async function initHomePage() {
    const homeSkillsContainer = document.getElementById('home-skills-summary');
    if (!homeSkillsContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';
    const skillsData = await window.loadPortfolioData('skills', lang);
    if (!skillsData || !skillsData.categories) return;

    const summaryCards = skillsData.categories.slice(0, 6).map(cat => {
      const topItems = (cat.items || []).slice(0, 2).map(it => `
        <div style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-top: 4px;">
          • <strong>${it.name}:</strong> ${it.detail}
        </div>
      `).join('');

      return `
        <div class="card skill-card" style="padding: var(--space-5);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h4 style="font-size: var(--text-base); font-weight: 700; color: var(--color-text-primary); margin: 0;">${cat.name}</h4>
          </div>
          <p style="font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.5; margin-bottom: 0.5rem;">${cat.description}</p>
          ${topItems}
        </div>
      `;
    }).join('');

    homeSkillsContainer.innerHTML = summaryCards;
  }

  // Initialize About Page
  async function initAboutPage() {
    const aboutSectionsContainer = document.getElementById('about-sections');
    const interestsContainer = document.getElementById('about-interests');
    if (!aboutSectionsContainer && !interestsContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';
    const profile = await window.loadPortfolioData('profile', lang);
    if (!profile) return;

    if (interestsContainer && profile.interests) {
      interestsContainer.innerHTML = profile.interests.map(item => `
        <div class="card" style="padding: var(--space-6); border-top: 3px solid var(--color-accent);">
          <h4 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.5rem;">${item.title}</h4>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.6;">${item.description}</p>
        </div>
      `).join('');
    }

    if (aboutSectionsContainer && profile.aboutSections) {
      aboutSectionsContainer.innerHTML = profile.aboutSections.map(sec => `
        <div class="detail-section" style="margin-bottom: var(--space-8);">
          <h3 class="detail-section-title">${sec.title}</h3>
          <p class="detail-prose">${sec.content}</p>
        </div>
      `).join('');
    }
  }

  // Initialize Skills Page
  async function initSkillsPage() {
    const categoriesContainer = document.getElementById('skills-categories-grid');
    const certsContainer = document.getElementById('certificates-grid');
    if (!categoriesContainer && !certsContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';
    const skillsData = await window.loadPortfolioData('skills', lang);
    if (!skillsData) return;

    if (categoriesContainer && skillsData.categories) {
      categoriesContainer.innerHTML = skillsData.categories.filter(c => c.id !== 'certificates-prep').map(cat => {
        const itemsHtml = (cat.items || []).map(it => `
          <div class="skill-item-row">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span class="skill-item-name">${it.name}</span>
              ${it.level ? `<span class="badge" style="font-size: 0.65rem; padding: 1px 6px;">${it.level}</span>` : ''}
            </div>
            <p class="skill-item-detail">${it.detail}</p>
          </div>
        `).join('');

        return `
          <div class="card skill-card">
            <h3 class="skill-card-title">${cat.name}</h3>
            <p class="skill-card-desc">${cat.description}</p>
            <div class="skill-items-list">
              ${itemsHtml}
            </div>
          </div>
        `;
      }).join('');
    }

    if (certsContainer && skillsData.certificates) {
      certsContainer.innerHTML = skillsData.certificates.map(cert => {
        let badgeClass = 'badge-status-progress';
        let badgeText = cert.status;

        if (cert.statusKey === 'acquired') {
          badgeClass = 'badge-status-acquired';
        } else if (cert.statusKey === 'scheduled') {
          badgeClass = 'badge-status-scheduled';
        }

        return `
          <div class="card" style="padding: var(--space-5);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="badge ${badgeClass}">${badgeText}</span>
              <span style="font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 600;">${cert.year}</span>
            </div>
            <h4 style="font-size: var(--text-base); font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.25rem;">${cert.name}</h4>
            <p style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 600; margin-bottom: 0.5rem;">${cert.issuer} (${cert.category})</p>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.5;">${cert.description}</p>
          </div>
        `;
      }).join('');
    }
  }

  // Initialize Contact Page
  function initContactPage() {
    const contactForm = document.getElementById('portfolio-contact-form');
    const copyEmailBtn = document.getElementById('btn-copy-email');
    const targetEmail = "seohyun.eom.portfolio@gmail.com";

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(targetEmail).then(() => {
          const msg = window.PortfolioLang ? window.PortfolioLang.getString('copied_to_clipboard') : '이메일 주소가 복사되었습니다.';
          showToast(msg);
        }).catch(() => {
          showToast(targetEmail);
        });
      });
    }

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('sender-name') || {}).value || '';
        const email = (document.getElementById('sender-email') || {}).value || '';
        const subject = (document.getElementById('email-subject') || {}).value || 'Portfolio Inquiry';
        const message = (document.getElementById('email-message') || {}).value || '';

        const fullBody = `안녕하세요 엄서현 님,\n\n${message}\n\n---\n보낸 사람: ${name}\n회신 이메일: ${email}`;
        const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

        window.location.href = mailtoUrl;
      });
    }
  }

  // Global Language Change handler for all sub-views
  window.addEventListener('languageChange', () => {
    initHomePage();
    initAboutPage();
    initSkillsPage();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
    initAboutPage();
    initSkillsPage();
    initContactPage();
  });
})();

