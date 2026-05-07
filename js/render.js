/** 카드 지역 태그용 — hydrate 후 regions는 코드 배열 */
const REGION_LABELS_DISPLAY = {
  canggu: "짱구",
  ubud: "우붓",
  uluwatu: "울루와투",
  seminyak: "세미냑",
  jimbaran: "짐바란",
};

// 1. DOM 요소 선택
const agentGrid = document.getElementById("agentGrid");
const modalEl = document.getElementById("agentModal");
const modalBody = document.getElementById("modalBody");

function escapeHtmlRender(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function initialsFromName(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function regionsForCardTags(agent) {
  const regs = agent.regions ?? agent.region ?? [];
  return regs.map((r) => REGION_LABELS_DISPLAY[r] || r);
}

// 2. 렌더링 함수 정의
function renderAgents(agents) {
  if (!agentGrid) return;

  agentGrid.innerHTML = "";

  agents.forEach((agent) => {
    const regionLabels = regionsForCardTags(agent);

    const langTags = (agent.languages || [])
      .map(
        (lang) =>
          `<span class="tag ${lang === "KR" ? "highlight" : ""}">${escapeHtmlRender(lang)}</span>`
      )
      .join("");

    const regionTagsHtml = regionLabels
      .map((r) => `<span class="tag">${escapeHtmlRender(String(r))}</span>`)
      .join("");

    const rating =
      typeof agent.rating === "number" ?
        String(agent.rating)
      : escapeHtmlRender(String(agent.rating));
    const reviews = agent.reviews ?? agent.reviewCount ?? 0;
    const exp = escapeHtmlRender(agent.exp ?? agent.experience ?? "");

    const waDigits = String(agent.whatsapp).replace(/\D/g, "");

    const imgBlock =
      agent.image ?
        `<img src="${escapeHtmlRender(agent.image)}" class="agent-img" alt="${escapeHtmlRender(agent.name)}">`
      : `<div class="agent-img agent-img--fallback" aria-hidden="true">${escapeHtmlRender(initialsFromName(agent.name))}</div>`;

    const cardHTML = `
            <div class="agent-card" role="button" tabindex="0"
                 onclick="openModal(${agent.id})"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openModal(${agent.id});}">
                <div class="card-header">
                    ${imgBlock}
                    ${agent.verified ? '<span class="badge-verified">✓ Verified</span>' : ""}
                </div>
                <div class="card-body">
                    <h3 class="agent-name">${escapeHtmlRender(agent.name)}</h3>
                    <p class="agent-company">${escapeHtmlRender(agent.company)}</p>
                    
                    <div class="tag-container">
                        ${regionTagsHtml}
                        ${langTags}
                    </div>

                    <div class="stats-row">
                        <span class="stat-item">⭐ ${rating} (${reviews})</span>
                        <span class="stat-item">경력 ${exp}</span>
                    </div>

                    <button type="button" class="contact-btn" onclick="event.stopPropagation(); openWhatsApp('${waDigits}')">
                        WhatsApp 상담하기
                    </button>
                </div>
            </div>
        `;

    agentGrid.insertAdjacentHTML("beforeend", cardHTML);
  });
}

// 3. 왓츠앱 연결 함수
function openWhatsApp(number) {
  const digits = String(number).replace(/\D/g, "");
  const message = encodeURIComponent(
    "안녕하세요, 발리 에어비앤비 투자 건으로 연락드렸습니다."
  );
  window.open(
    `https://wa.me/${digits}?text=${message}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/** 모달 닫기 — 배경 클릭·닫기 버튼·Escape 에서 호출 */
function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/** 카드에서 전달된 ID로 agentData 조회 후 모달 본문 렌더 */
function openModal(agentId) {
  if (!modalEl || !modalBody || typeof agentData === "undefined") return;

  const agent = agentData.find(
    (a) => a.id === agentId || String(a.id) === String(agentId)
  );
  if (!agent) return;

  const waDigits = String(agent.whatsapp).replace(/\D/g, "");

  const portfolioHtml = (agent.portfolio || [])
    .map(
      (src) =>
        `<div class="portfolio-item"><img src="${escapeHtmlRender(src)}" alt="" loading="lazy" decoding="async"></div>`
    )
    .join("");

  const profileBlock =
    agent.image ?
      `<img src="${escapeHtmlRender(agent.image)}" class="modal-profile-img" alt="${escapeHtmlRender(agent.name)}">`
    : `<div class="modal-profile-img modal-profile-img--fallback" aria-hidden="true">${escapeHtmlRender(initialsFromName(agent.name))}</div>`;

  const aboutText = agent.about || "소개 글이 준비 중입니다.";
  const roiText = agent.avgROI || "—";

  modalBody.innerHTML = `
        <div class="modal-header">
            ${profileBlock}
            <div class="modal-header-text">
                <h2>${escapeHtmlRender(agent.name)}</h2>
                <p>${escapeHtmlRender(agent.company)}</p>
            </div>
        </div>

        <div class="roi-badge">평균 예상 수익률: ${escapeHtmlRender(roiText)}</div>

        <h3 class="modal-section-title">전문가 소개</h3>
        <p class="modal-about">${escapeHtmlRender(aboutText)}</p>

        <h3 class="modal-section-title">운영 중인 포트폴리오</h3>
        ${
          portfolioHtml ?
            `<div class="portfolio-grid">${portfolioHtml}</div>`
          : `<p class="modal-empty">등록된 포트폴리오 이미지가 없습니다.</p>`
        }

        <button type="button" class="contact-btn modal-contact-btn" onclick="openWhatsApp('${waDigits}')">
            지금 바로 상담 시작하기
        </button>
    `;

  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

(function initModalControls() {
  const closeBtn = document.querySelector("#agentModal .close-modal");
  if (!modalEl || !closeBtn) return;

  closeBtn.addEventListener("click", closeModal);

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("is-open")) {
      closeModal();
    }
  });
})();
