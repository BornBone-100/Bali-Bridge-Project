/**
 * 결과 페이지 메인 마크업 — vault-content · 상세 페이지 등에서 재사용
 * href·src 는 호출부에서 신뢰 가능한 값만 넘깁니다 (이스케이프하지 않음).
 */

function escapeReportMainHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

/**
 * @param {object} cfg
 * @param {string} cfg.reportDateLabel 예: 실사 완료: 2026.05.07
 * @param {string} cfg.propertyTitle
 * @param {string} cfg.locationTag 위치 한 줄 (이모지 포함 가능)
 * @param {string} [cfg.agentImgSrcTrusted]
 * @param {string} [cfg.agentImgAlt]
 * @param {string} cfg.agentByLine 예: By Putu Arta
 * @param {string} cfg.headline 분석 제목
 * @param {string} cfg.analysisParagraph
 * @param {string} cfg.scoreDisplay 중앙 점수 숫자 (차트 평균과 맞추세요)
 * @param {string} [cfg.scoreLabel='Score']
 * @param {Array<{label:string,valueMain:string,valueUnit:string,statusClass:string,statusText:string}>} cfg.dataRows
 * @param {string} cfg.contractHrefTrusted
 * @param {boolean} [cfg.contractTargetBlank]
 * @param {string} [cfg.contractLabel]
 * @param {string} [cfg.pdfButtonLabel]
 * @param {string} [cfg.pdfOnclickAttr] 예: window.print()
 * @param {string} [cfg.sectionHeading]
 */
function buildReportMainHTML(cfg) {
  const scoreLabel = cfg.scoreLabel ?? "Score";
  const contractLabel = cfg.contractLabel ?? "에이전트와 계약 상담";
  const pdfButtonLabel = cfg.pdfButtonLabel ?? "보고서 PDF 저장";
  const sectionHeading =
    cfg.sectionHeading ?? "🔍 항목별 정밀 진단 데이터";

  const rowsHtml = (cfg.dataRows || [])
    .map((row) => {
      const val = `${escapeReportMainHtml(row.valueMain)} <small>${escapeReportMainHtml(row.valueUnit)}</small>`;
      return `
            <div class="data-item">
                <span class="d-label">${escapeReportMainHtml(row.label)}</span>
                <span class="d-value">${val}</span>
                <span class="d-status ${escapeReportMainHtml(row.statusClass)}">${escapeReportMainHtml(row.statusText)}</span>
            </div>`;
    })
    .join("");

  const agentImgSrc = cfg.agentImgSrcTrusted || "";
  const agentImg =
    agentImgSrc ?
      `<img src="${agentImgSrc}" alt="${escapeReportMainHtml(cfg.agentImgAlt || "")}" />`
    : `<span class="agent-mini-profile__fallback" aria-hidden="true">${escapeReportMainHtml((cfg.agentImgAlt || "A").slice(0, 1))}</span>`;

  const pdfClick =
    cfg.pdfOnclickAttr ?
      ` onclick="${escapeReportMainHtml(cfg.pdfOnclickAttr)}"`
    : "";

  const blankAttr = cfg.contractTargetBlank ?
    ` target="_blank" rel="noopener noreferrer"`
  : "";

  return `
<div class="report-main-container">
    <header class="report-header">
        <div class="header-titles">
            <span class="report-date">${escapeReportMainHtml(cfg.reportDateLabel)}</span>
            <h2>${escapeReportMainHtml(cfg.propertyTitle)}</h2>
            <p class="location-tag">${escapeReportMainHtml(cfg.locationTag)}</p>
        </div>
        <div class="agent-mini-profile">
            ${agentImg}
            <span>${escapeReportMainHtml(cfg.agentByLine)}</span>
        </div>
    </header>

    <section class="hero-analysis">
        <div class="chart-box">
            <canvas id="propertyRadarChart" role="img" aria-label="매물 진단 레이더 차트"></canvas>
            <div class="score-center">
                <span class="num">${escapeReportMainHtml(cfg.scoreDisplay)}</span>
                <span class="lab">${escapeReportMainHtml(scoreLabel)}</span>
            </div>
        </div>
        <div class="analysis-text">
            <h3>${escapeReportMainHtml(cfg.headline)}</h3>
            <p>${escapeReportMainHtml(cfg.analysisParagraph)}</p>
        </div>
    </section>

    <hr class="divider" />

    <section class="data-grid-section">
        <h3>${escapeReportMainHtml(sectionHeading)}</h3>
        <div class="data-grid">
            ${rowsHtml}
        </div>
    </section>

    <footer class="report-footer">
        <button type="button" class="btn-secondary"${pdfClick}>${escapeReportMainHtml(pdfButtonLabel)}</button>
        <a class="btn-primary" href="${cfg.contractHrefTrusted}"${blankAttr}>${escapeReportMainHtml(contractLabel)}</a>
    </footer>
</div>`;
}
