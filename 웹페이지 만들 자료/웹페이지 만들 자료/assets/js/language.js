/**
 * Language Manager (Korean & English)
 */
(function() {
  const LANG_KEY = 'seohyun-portfolio-lang';

  // Common UI Translations dictionary
  const UI_STRINGS = {
    ko: {
      nav_home: "Home",
      nav_about: "About Me",
      nav_skills: "Skills",
      nav_projects: "Projects",
      nav_activities: "Activities",
      nav_contact: "Contact",
      lang_switch_label: "EN",
      role_student: "식품영양학도",
      affiliation_text: "한림대학교 식품영양학과 (2023년 입학)",
      hero_tag: "PORTFOLIO &amp; ARCHIVE",
      hero_quote: "배우고 탐구하며, 경험을 통해 성장하는 식품영양학도입니다.",
      hero_cta_projects: "프로젝트 살펴보기",
      hero_cta_contact: "이메일 문의하기",
      summary_core_skills: "주요 핵심 역량 요약",
      view_all_skills: "전체 역량 자세히 보기 →",
      btn_view_detail: "상세보기",
      filter_all: "전체",
      filter_food_nutrition: "식품·영양",
      filter_planning_research: "기획·연구",
      filter_data_analysis: "데이터·분석",
      filter_design_content: "디자인·콘텐츠",
      search_placeholder: "프로젝트 검색 (제목, 키워드, 기술 등)...",
      search_no_results: "검색 결과가 없습니다.",
      status_acquired: "취득 완료",
      status_in_progress: "준비 중",
      status_scheduled: "응시 예정",
      footer_tagline: "식품영양학과 데이터·경영의 융합을 지향하는 개인 포트폴리오입니다.",
      footer_copyright: "© 2026 Seohyun Eom. All rights reserved.",
      footer_quick_links: "바로가기",
      footer_contact_me: "문의하기",
      send_email: "이메일 보내기",
      copied_to_clipboard: "이메일 주소가 클립보드에 복사되었습니다.",
      contact_title: "이메일로 연락하기",
      contact_subtitle: "협업 제안, 프로젝트 문의, 진로 멘토링 등 언제든 편하게 연락해 주세요.",
      form_name: "보내시는 분 성함",
      form_email: "보내시는 분 이메일",
      form_subject: "제목",
      form_message: "문의 내용",
      form_submit: "메일 앱으로 보내기",
      form_copy_email: "이메일 주소 복사",
      project_overview: "프로젝트 개요 및 주제",
      project_objectives: "프로젝트 목적",
      project_process: "진행 과정",
      project_role: "본인 역할 및 기여도",
      project_competencies: "활용 역량 및 도구",
      project_results: "프로젝트 결과",
      project_learnings: "배운 점 및 시사점",
      back_to_projects: "← 프로젝트 목록으로 돌아가기",
      back_to_activities: "← 활동 목록으로 돌아가기",
      activity_purpose: "참여 목적",
      activity_tasks: "담당 업무 및 주요 활동",
      activity_outcomes: "주요 성과",
      activity_learnings: "배운 점"
    },
    en: {
      nav_home: "Home",
      nav_about: "About Me",
      nav_skills: "Skills",
      nav_projects: "Projects",
      nav_activities: "Activities",
      nav_contact: "Contact",
      lang_switch_label: "KR",
      role_student: "Food & Nutrition Student",
      affiliation_text: "Hallym University, Dept. of Food Science & Nutrition (Class of 2023)",
      hero_tag: "PORTFOLIO &amp; ARCHIVE",
      hero_quote: "A food and nutrition student who learns, explores, and grows through diverse experiences.",
      hero_cta_projects: "Explore Projects",
      hero_cta_contact: "Contact Me",
      summary_core_skills: "Core Competency Highlights",
      view_all_skills: "View All Skills in Detail →",
      btn_view_detail: "View Details",
      filter_all: "All",
      filter_food_nutrition: "Food & Nutrition",
      filter_planning_research: "Planning & Research",
      filter_data_analysis: "Data & Analysis",
      filter_design_content: "Design & Content",
      search_placeholder: "Search projects by title, keywords, tools...",
      search_no_results: "No matching projects found.",
      status_acquired: "Acquired",
      status_in_progress: "In Progress",
      status_scheduled: "Scheduled",
      footer_tagline: "Personal portfolio integrating nutritional science with data analytics and business strategy.",
      footer_copyright: "© 2026 Seohyun Eom. All rights reserved.",
      footer_quick_links: "Quick Links",
      footer_contact_me: "Get in Touch",
      send_email: "Send Email",
      copied_to_clipboard: "Email address copied to clipboard.",
      contact_title: "Get in Touch via Email",
      contact_subtitle: "Feel free to reach out for collaboration inquiries, project discussions, or academic mentoring.",
      form_name: "Your Name",
      form_email: "Your Email",
      form_subject: "Subject",
      form_message: "Message",
      form_submit: "Open in Mail App",
      form_copy_email: "Copy Email Address",
      project_overview: "Project Overview & Topic",
      project_objectives: "Objectives",
      project_process: "Development Process",
      project_role: "My Role & Contribution",
      project_competencies: "Competencies & Tools",
      project_results: "Key Results",
      project_learnings: "Key Learnings & Takeaways",
      back_to_projects: "← Back to Projects",
      back_to_activities: "← Back to Activities",
      activity_purpose: "Purpose",
      activity_tasks: "Key Responsibilities & Activities",
      activity_outcomes: "Key Achievements",
      activity_learnings: "Key Learnings"
    }
  };

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
    return 'ko';
  }

  function setLang(lang) {
    const validLang = (lang === 'en') ? 'en' : 'ko';
    localStorage.setItem(LANG_KEY, validLang);
    document.documentElement.setAttribute('lang', validLang);
    
    // Update all text elements with data-i18n
    updateStaticTranslations(validLang);
    updateLangButtons(validLang);

    // Dispatch global custom event for dynamic pages
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang: validLang } }));
  }

  function toggleLang() {
    const current = getLang();
    const next = current === 'ko' ? 'en' : 'ko';
    setLang(next);
  }

  function updateLangButtons(lang) {
    const buttons = document.querySelectorAll('.btn-lang-toggle');
    buttons.forEach(btn => {
      btn.textContent = (lang === 'ko') ? 'EN' : 'KR';
      btn.setAttribute('aria-label', (lang === 'ko') ? 'Switch to English' : '한국어로 전환');
      btn.title = (lang === 'ko') ? 'Switch to English' : '한국어로 전환';
    });
  }

  function updateStaticTranslations(lang) {
    const strings = UI_STRINGS[lang] || UI_STRINGS.ko;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key]) {
        el.innerHTML = strings[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (strings[key]) {
        el.setAttribute('placeholder', strings[key]);
      }
    });
  }

  // Initial execution
  document.addEventListener('DOMContentLoaded', () => {
    const currentLang = getLang();
    document.documentElement.setAttribute('lang', currentLang);
    updateStaticTranslations(currentLang);
    updateLangButtons(currentLang);

    document.querySelectorAll('.btn-lang-toggle').forEach(btn => {
      btn.addEventListener('click', toggleLang);
    });
  });

  window.PortfolioLang = {
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    getString: (key) => {
      const l = getLang();
      return (UI_STRINGS[l] && UI_STRINGS[l][key]) || (UI_STRINGS.ko && UI_STRINGS.ko[key]) || key;
    },
    UI_STRINGS: UI_STRINGS
  };
})();

