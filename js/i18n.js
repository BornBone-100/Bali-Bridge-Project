// js/i18n.js — 공통 번역 마스터
// translations.js와 전역 이름이 겹치지 않도록 IIFE 안에 두고, 외부에서는 window.bbI18n 으로 접근합니다.

(function () {
  // 1. 글로벌 번역 사전 (여기에 웹사이트의 모든 단어를 등록하세요!)
  const translations = {
    ko: {
      // 네비게이션 (사이드바)
      nav_dashboard: "대시보드 홈",
      nav_vault: "나의 투자 자산",
      nav_dd: "실사 보고서(DD)",
      nav_register: "신규 매물 등록",
      nav_explore: "신규 매물 탐색",
      nav_settings: "설정(에이전트)",

      // 메인 대시보드
      welcome: "환영합니다, 고객님",
      subtitle: "오늘의 핵심 지표와 실사 진행 상황을 한 화면에서 확인하세요.",
      total_investment: "총 투자 금액",
      avg_roi: "평균 예상 수익률(ROI)",
      ongoing_dd: "진행 중인 실사",
      owned_props: "보유 매물 수",

      // 공통 버튼
      btn_logout: "로그아웃",
      btn_new_scenario: "새로운 시나리오 만들기",
    },
    en: {
      // Navigation
      nav_dashboard: "Dashboard Home",
      nav_vault: "My Investment Vault",
      nav_dd: "DD Reports",
      nav_register: "Register Property",
      nav_explore: "Property Search",
      nav_settings: "Settings (Agent)",

      // Main Dashboard
      welcome: "Welcome, Investor",
      subtitle: "Check today's key metrics and DD progress on one screen.",
      total_investment: "Total Investment",
      avg_roi: "Average Expected ROI",
      ongoing_dd: "Ongoing DD",
      owned_props: "Owned Properties",

      // Common Buttons
      btn_logout: "Logout",
      btn_new_scenario: "Create New Scenario",
    },
  };

  // 2. 언어 변경 및 적용 함수
  function applyLanguage(lang) {
    const normalized = lang === "en" ? "en" : "ko";
    localStorage.setItem("preferred_language", normalized);
    localStorage.setItem("bbLang", normalized);

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
