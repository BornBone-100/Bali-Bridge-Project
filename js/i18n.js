// js/i18n.js — 공통 번역 마스터
// translations.js와 전역 이름이 겹치지 않도록 IIFE 안에 두고, 외부에서는 window.bbI18n 으로 접근합니다.

(function () {
  // 1. 글로벌 번역 사전 (여기에 웹사이트의 모든 단어를 등록하세요!)
  const translations = {
    ko: {
      // --- 네비게이션 (사이드바) ---
      nav_dashboard: "대시보드 홈",
      nav_vault: "나의 투자 자산",
      nav_dd: "실사 보고서(DD)",
      nav_register: "신규 매물 등록",
      nav_explore: "신규 매물 탐색",
      nav_settings: "설정(에이전트)",

      // --- 메인 대시보드 ---
      welcome: "환영합니다, 고객님",
      subtitle: "오늘의 핵심 지표와 실사 진행 상황을 한 화면에서 확인하세요.",
      total_investment: "총 투자 금액",
      avg_roi: "평균 예상 수익률(ROI)",
      ongoing_dd: "진행 중인 실사",
      owned_props: "보유 매물 수",

      // --- 1. 나의 투자 보관함 (Vault) ---
      title_vault: "나의 투자 보관함",
      desc_vault: "발리 투자 여정을 한곳에서 확인하세요.",
      total_portfolio: "총 포트폴리오 가치",
      sim_records: "수익 시뮬레이션 기록",

      // --- 2. 투자 실사 보고서 (DD) ---
      title_dd: "투자 실사 보고서 대시보드",
      legal_dd: "법률 실사 (Legal Verification)",
      financial_dd: "재무 및 수익성 (Financial Analysis)",
      loc_intelligence: "입지 및 인프라 (Location Intelligence)",

      // --- DD 페이지 전용 ---
      dd_roi_label: "예상 ROI (연)",
      dd_period_label: "투자 기간",
      dd_rights_label: "토지 권리 형태",
      dd_period_value: "5년",

      dd_legal_title: "법률 실사 (Legal Verification)",
      dd_cert: "토지 증명서(Sertifikat):",
      dd_zoning: "용도 확인(Zoning):",
      dd_pbg: "PBG(건축 허가):",
      dd_legal_warn: "* 권리 하자 리스크의 핵심(소유권/명도) 확인을 우선 검토합니다.",

      dd_finance_title: "재무 및 수익성 (Financial Analysis)",
      dd_sim_chart: "수익률 시뮬레이션 (보수적/평균적/공격적)",
      dd_vacancy: "공실률 추이 (최근 3개년, 지역 평균)",
      dd_exit: "Exit 전략(5년)",
      dd_exit_val: "예상 매각가 1.45×",
      dd_risk: "리스크 메모",
      dd_risk_val: "PBG 승인 일정",

      dd_loc_title: "입지 및 인프라 (Location Intelligence)",
      dd_beach: "비치클럽",
      dd_school: "국제 학교",
      dd_hospital: "병원",
      dd_airport: "공항",
      dd_loc_desc1: "• 인근 개발 호재: 도로 확장 계획(예정) - 복합시설 입점 부지(확인 중)",
      dd_loc_desc2: "• 소음/환경: 주변 공사 2곳 진행 - 일조권 양호(오전 우수)",

      dd_doc_title: "증빙 문서 및 전문가 의견",
      dd_doc_desc: "실사 결과를 뒷받침하는 문서/현장 자료를 한 곳에서 확인합니다.",
      dd_photo_title: "현장 실사 사진 (드론/경계/현장)",
      btn_download: "종합 실사 보고서 다운 받기",
      btn_contact: "담당 컨설턴트 문의하기",

      // --- 3. 신규 매물 탐색 (Explore) ---
      title_explore: "신규 매물 탐색",
      desc_explore: "Bali Bridge의 엄격한 실사(DD)를 거친 프리미엄 투자 자산을 확인하세요.",
      filter_all: "모든 지역",
      filter_roi: "예상 수익률(ROI)",
      filter_price: "투자 금액대",

      // --- 공통 버튼 ---
      btn_logout: "로그아웃",
      btn_new_scenario: "새로운 시나리오 만들기",

      // --- 관리자 · 서류 인증 ---
      nav_admin: "관리자 · 서류 인증",
      admin_doc_title: "[Bali Bridge] 관리자 · 법률 서류 인증",
      admin_title: "관리자 · 법률 서류 인증",
      admin_hint:
        "등록된 매물 중 서류가 올라온 항목을 검토한 뒤 승인하기를 누르면 인증 상태가 활성화됩니다.",
      admin_section_pending: "매물 인증 대기 목록",
      admin_loading: "불러오는 중…",
      admin_load_error: "목록을 불러오지 못했습니다:",
      admin_no_properties: "등록된 매물이 없습니다.",
      admin_property: "매물",
      admin_open_doc: "서류 열기",
      admin_no_doc: "서류 없음",
      admin_verified: "인증 완료",
      admin_approve: "승인하기",
      admin_env_missing: "Supabase URL/키가 없습니다. js/supabase-browser-env.js를 확인하세요.",
      admin_conn_error: "Supabase 연결을 확인해 주세요.",
      admin_confirm_approve: "이 매물의 법률 서류를 검토하셨습니까? 인증 마크를 부여합니다.",
      admin_success_approve: "법률 인증이 완료되었습니다!",
      admin_fail_approve: "승인 처리에 실패했습니다. RLS·관리자 권한을 확인해 주세요.",
    },
    en: {
      // --- Navigation ---
      nav_dashboard: "Dashboard Home",
      nav_vault: "My Investment Vault",
      nav_dd: "DD Reports",
      nav_register: "Register Property",
      nav_explore: "Property Explorer",
      nav_settings: "Settings (Agent)",

      // --- Main dashboard ---
      welcome: "Welcome, Investor",
      subtitle: "Check today's key metrics and DD progress on one screen.",
      total_investment: "Total Investment",
      avg_roi: "Average Expected ROI",
      ongoing_dd: "Ongoing DD",
      owned_props: "Owned Properties",

      // --- 1. Investment vault ---
      title_vault: "My Investment Vault",
      desc_vault: "Track your Bali investment journey in one place.",
      total_portfolio: "Total Portfolio Value",
      sim_records: "Profit Simulation Records",

      // --- 2. DD reports ---
      title_dd: "DD Report Dashboard",
      legal_dd: "Legal Verification",
      financial_dd: "Financial Analysis",
      loc_intelligence: "Location Intelligence",

      // --- DD 페이지 전용 ---
      dd_roi_label: "Expected ROI (Annual)",
      dd_period_label: "Investment Period",
      dd_rights_label: "Land Rights Type",
      dd_period_value: "5 Years",

      dd_legal_title: "Legal Verification",
      dd_cert: "Land Certificate (Sertifikat):",
      dd_zoning: "Zoning Check:",
      dd_pbg: "PBG (Building Permit):",
      dd_legal_warn: "* Priority review of key title risks (ownership/eviction).",

      dd_finance_title: "Financial Analysis",
      dd_sim_chart: "ROI Simulation (Conservative/Base/Aggressive)",
      dd_vacancy: "Vacancy Rate Trend (3-Year Avg)",
      dd_exit: "Exit Strategy (5 Yrs)",
      dd_exit_val: "Expected Sale Price 1.45×",
      dd_risk: "Risk Memo",
      dd_risk_val: "PBG Approval Timeline",

      dd_loc_title: "Location Intelligence",
      dd_beach: "Beach Club",
      dd_school: "Int'l School",
      dd_hospital: "Hospital",
      dd_airport: "Airport",
      dd_loc_desc1: "• Dev Catalysts: Road expansion planned - Mixed-use site pending.",
      dd_loc_desc2: "• Noise/Env: 2 nearby constructions - Good sunlight (AM).",

      dd_doc_title: "Supporting Docs & Expert Opinions",
      dd_doc_desc: "Verify documents and site data supporting the DD results in one place.",
      dd_photo_title: "Site Inspection Photos (Drone/Boundaries/On-site)",
      btn_download: "Download Full DD Report",
      btn_contact: "Contact Consultant",

      // --- 3. Property explorer ---
      title_explore: "Property Explorer",
      desc_explore: "Discover premium investment assets vetted by Bali Bridge's strict DD.",
      filter_all: "All Regions",
      filter_roi: "Expected ROI",
      filter_price: "Investment Range",

      // --- Common buttons ---
      btn_logout: "Logout",
      btn_new_scenario: "Create New Scenario",

      // --- Admin · document verification ---
      nav_admin: "Admin · Document Verification",
      admin_doc_title: "[Bali Bridge] Admin · Legal Document Verification",
      admin_title: "Admin · Legal Document Verification",
      admin_hint:
        "Review properties with uploaded documents, then click Approve to activate verification status.",
      admin_section_pending: "Pending property verification",
      admin_loading: "Loading…",
      admin_load_error: "Could not load the list:",
      admin_no_properties: "No registered properties.",
      admin_property: "Property",
      admin_open_doc: "Open document",
      admin_no_doc: "No document",
      admin_verified: "Verified",
      admin_approve: "Approve",
      admin_env_missing: "Missing Supabase URL/key. Check js/supabase-browser-env.js.",
      admin_conn_error: "Please check your Supabase connection.",
      admin_confirm_approve: "Have you reviewed this property's legal documents? A verification badge will be applied.",
      admin_success_approve: "Legal verification completed!",
      admin_fail_approve: "Approval failed. Check RLS and admin permissions.",
    },
  };

  // 2. 언어 변경 및 적용 함수
  function applyLanguage(lang) {
    const normalized = lang === "en" ? "en" : "ko";
    localStorage.setItem("preferred_language", normalized);
    localStorage.setItem("bbLang", normalized);

    document.documentElement.lang = normalized;

    const titleKey = document.documentElement.getAttribute("data-i18n-title");
    if (titleKey && translations[normalized] && translations[normalized][titleKey]) {
      document.title = translations[normalized][titleKey];
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[normalized] && translations[normalized][key]) {
        if (element.tagName.toLowerCase() === "input" && element.hasAttribute("placeholder")) {
          element.placeholder = translations[normalized][key];
        } else {
          element.textContent = translations[normalized][key];
        }
      }
    });

    const koBtn = document.getElementById("btn-kor");
    const enBtn = document.getElementById("btn-eng");
    if (koBtn) {
      koBtn.style.backgroundColor = normalized === "ko" ? "#fff" : "transparent";
      koBtn.style.color = normalized === "ko" ? "#111827" : "#6B7280";
      koBtn.setAttribute("aria-pressed", normalized === "ko" ? "true" : "false");
    }
    if (enBtn) {
      enBtn.style.backgroundColor = normalized === "en" ? "#fff" : "transparent";
      enBtn.style.color = normalized === "en" ? "#111827" : "#6B7280";
      enBtn.setAttribute("aria-pressed", normalized === "en" ? "true" : "false");
    }

    window.dispatchEvent(new CustomEvent("bb:languagechange", { detail: { lang: normalized } }));
  }

  window.bbI18n = {
    translations: translations,
    applyLanguage: applyLanguage,
  };

  // 3. 페이지가 켜질 때마다 실행되는 기본 세팅
  document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("preferred_language") || "ko";
    applyLanguage(savedLang);

    const btnKor = document.getElementById("btn-kor");
    const btnEng = document.getElementById("btn-eng");

    if (btnKor) btnKor.addEventListener("click", () => applyLanguage("ko"));
    if (btnEng) btnEng.addEventListener("click", () => applyLanguage("en"));
  });
})();
