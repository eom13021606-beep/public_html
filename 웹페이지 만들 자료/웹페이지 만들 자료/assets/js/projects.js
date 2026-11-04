/**
 * Projects Manager (Listing, Search, Filter & Detail View)
 */
(function() {
  let allProjects = [];
  let currentCategory = 'all';
  let searchQuery = '';

  const CATEGORY_NAMES = {
    ko: {
      'all': '전체',
      'food-nutrition': '식품·영양',
      'planning-research': '기획·연구',
      'data-analysis': '데이터·분석',
      'design-content': '디자인·콘텐츠'
    },
    en: {
      'all': 'All',
      'food-nutrition': 'Food & Nutrition',
      'planning-research': 'Planning & Research',
      'data-analysis': 'Data & Analysis',
      'design-content': 'Design & Content'
    }
  };

  async function initProjectsList() {
    const listContainer = document.getElementById('projects-grid');
    if (!listContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';
    allProjects = await window.loadPortfolioData('projects', lang) || [];
    renderProjects();

    // Filter Buttons Listener
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderProjects();
      });
    });

    // Search Input Listener
    const searchInput = document.getElementById('project-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderProjects();
      });
    }
  }

  function renderProjects() {
    const listContainer = document.getElementById('projects-grid');
    if (!listContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';

    const filtered = allProjects.filter(p => {
      const matchCat = (currentCategory === 'all' || p.category === currentCategory);
      if (!matchCat) return false;
      if (!searchQuery) return true;

      const titleMatch = (p.title || '').toLowerCase().includes(searchQuery);
      const subMatch = (p.subtitle || '').toLowerCase().includes(searchQuery);
      const sumMatch = (p.summary || '').toLowerCase().includes(searchQuery);
      const tagMatch = (p.tags || []).some(t => t.toLowerCase().includes(searchQuery));
      return titleMatch || subMatch || sumMatch || tagMatch;
    });

    if (filtered.length === 0) {
      const emptyText = window.PortfolioLang ? window.PortfolioLang.getString('search_no_results') : '검색 결과가 없습니다.';
      listContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--color-text-muted);">
          <p style="font-size: var(--text-lg); font-weight: 600;">${emptyText}</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(p => {
      const categoryName = (CATEGORY_NAMES[lang] && CATEGORY_NAMES[lang][p.category]) || p.category;
      const featuredBadge = p.featured ? `<span class="badge badge-primary featured-project-badge">Featured</span>` : '';
      const tagsHtml = (p.tags || []).map(t => `<span class="meta-pill" style="font-size: 0.7rem; padding: 2px 8px;">${t}</span>`).join('');
      const detailBtnText = window.PortfolioLang ? window.PortfolioLang.getString('btn_view_detail') : '상세보기';

      return `
        <article class="card project-card card-interactive" onclick="location.href='project-detail.html?id=${encodeURIComponent(p.id)}'">
          ${featuredBadge}
          <div class="project-card-header">
            <span class="project-category-tag">${categoryName}</span>
            <span class="project-year">${p.year}</span>
          </div>
          <h3 class="project-card-title">${p.title}</h3>
          <p class="project-card-desc">${p.summary}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 1rem;">
            ${tagsHtml}
          </div>
          <div class="project-card-meta">
            <span class="project-team-type">${p.teamType || ''}</span>
            <span class="project-link-indicator">${detailBtnText} →</span>
          </div>
        </article>
      `;
    }).join('');
  }

  // Project Detail Page Renderer
  async function initProjectDetail() {
    const detailContainer = document.getElementById('project-detail-content');
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';

    const projects = await window.loadPortfolioData('projects', lang) || [];
    const project = projects.find(p => p.id === projectId) || projects[0];

    if (!project) {
      detailContainer.innerHTML = `<p style="padding: 4rem; text-align: center;">Project not found.</p>`;
      return;
    }

    document.title = `${project.title} | Seohyun Eom Portfolio`;

    const categoryName = (CATEGORY_NAMES[lang] && CATEGORY_NAMES[lang][project.category]) || project.category;
    const S = (key) => window.PortfolioLang ? window.PortfolioLang.getString(key) : key;

    const processHtml = (project.process || []).map(item => `
      <div class="step-card">
        <h4 class="step-card-title">${item.step}</h4>
        <p class="step-card-desc">${item.desc}</p>
      </div>
    `).join('');

    const objectivesHtml = (project.objectives || []).map(obj => `
      <li class="detail-list-item">${obj}</li>
    `).join('');

    const competenciesHtml = (project.competenciesTools || []).map(item => `
      <li class="detail-list-item">${item}</li>
    `).join('');

    const resultsHtml = (project.keyResults || []).map(res => `
      <li class="detail-list-item">${res}</li>
    `).join('');

    detailContainer.innerHTML = `
      <div class="detail-header">
        <a href="projects.html" class="detail-back-link">${S('back_to_projects')}</a>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
          <span class="badge badge-primary">${categoryName}</span>
          ${project.featured ? '<span class="badge badge-status-acquired">Featured Project</span>' : ''}
        </div>
        <h1 class="detail-title">${project.title}</h1>
        <p class="detail-subtitle">${project.subtitle || project.summary}</p>
      </div>

      <div class="detail-meta-grid">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Period</span>
          <span class="detail-meta-value">${project.period || project.year}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Type</span>
          <span class="detail-meta-value">${project.teamType || 'Project'}</span>
        </div>
        <div class="detail-meta-item" style="grid-column: 1 / -1;">
          <span class="detail-meta-label">${S('project_role')}</span>
          <span class="detail-meta-value" style="font-weight: 500; line-height: 1.6;">${project.role || '-'}</span>
        </div>
      </div>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_overview')}</h3>
        <p class="detail-prose">${project.overview || project.summary}</p>
      </section>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_objectives')}</h3>
        <ul class="detail-list">
          ${objectivesHtml}
        </ul>
      </section>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_process')}</h3>
        <div style="margin-top: 1rem;">
          ${processHtml}
        </div>
      </section>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_competencies')}</h3>
        <ul class="detail-list">
          ${competenciesHtml}
        </ul>
      </section>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_results')}</h3>
        <ul class="detail-list">
          ${resultsHtml}
        </ul>
      </section>

      <section class="detail-section">
        <h3 class="detail-section-title">${S('project_learnings')}</h3>
        <div class="card" style="background-color: var(--color-bg-secondary); border-left: 4px solid var(--color-accent);">
          <p class="detail-prose" style="font-weight: 500; margin: 0;">${project.learnings || ''}</p>
        </div>
      </section>

      <div style="margin-top: 3rem; text-align: center;">
        <a href="projects.html" class="btn btn-secondary">${S('back_to_projects')}</a>
      </div>
    `;
  }

  // React to language switch
  window.addEventListener('languageChange', async () => {
    if (document.getElementById('projects-grid')) {
      await initProjectsList();
    }
    if (document.getElementById('project-detail-content')) {
      await initProjectDetail();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initProjectsList();
    initProjectDetail();
  });
})();

