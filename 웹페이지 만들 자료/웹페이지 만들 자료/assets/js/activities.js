/**
 * Activities Manager (Timeline & Activity Detail)
 */
(function() {
  async function initActivities() {
    const timelineContainer = document.getElementById('activities-timeline');
    if (!timelineContainer) return;

    const lang = window.PortfolioLang ? window.PortfolioLang.getLang() : 'ko';
    const activities = await window.loadPortfolioData('activities', lang) || [];

    // Group activities by year in descending order
    const yearGroups = {};
    activities.forEach(act => {
      const year = act.year || '2026';
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(act);
    });

    const sortedYears = Object.keys(yearGroups).sort((a, b) => b - a);
    const S = (key) => window.PortfolioLang ? window.PortfolioLang.getString(key) : key;

    timelineContainer.innerHTML = sortedYears.map(year => {
      const items = yearGroups[year];
      const itemsHtml = items.map(act => {
        const tasksHtml = (act.tasks || []).map(t => `<li class="detail-list-item" style="font-size: var(--text-sm);">${t}</li>`).join('');
        const outcomesHtml = (act.outcomes || []).map(o => `<li class="detail-list-item" style="font-size: var(--text-sm);">${o}</li>`).join('');

        return `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <article class="card" style="margin-left: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
                <span class="badge badge-primary">${act.category || 'Activity'}</span>
                <span style="font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 600;">${act.period}</span>
              </div>
              <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.25rem;">${act.title}</h3>
              <p style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 600; margin-bottom: 0.75rem;">${act.organization} | ${act.role}</p>
              <p style="font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1rem;">${act.summary}</p>

              <div style="background-color: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: 0.75rem;">
                <h4 style="font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--color-text-primary); margin-bottom: 0.5rem;">${S('activity_tasks')}</h4>
                <ul class="detail-list" style="margin: 0; gap: 4px;">
                  ${tasksHtml}
                </ul>
              </div>

              ${outcomesHtml ? `
              <div style="background-color: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: 0.75rem;">
                <h4 style="font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--color-text-primary); margin-bottom: 0.5rem;">${S('activity_outcomes')}</h4>
                <ul class="detail-list" style="margin: 0; gap: 4px;">
                  ${outcomesHtml}
                </ul>
              </div>` : ''}

              <div style="padding-top: 0.5rem; border-top: 1px dashed var(--color-border); font-size: var(--text-xs); color: var(--color-text-secondary); line-height: 1.6;">
                <strong>${S('activity_learnings')}:</strong> ${act.learnings}
              </div>
            </article>
          </div>
        `;
      }).join('');

      return `
        <div class="timeline-year-group">
          <div class="timeline-year-label">${year}</div>
          ${itemsHtml}
        </div>
      `;
    }).join('');
  }

  // React to language switch
  window.addEventListener('languageChange', () => {
    initActivities();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initActivities();
  });
})();

