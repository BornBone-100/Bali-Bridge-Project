function initDdRoiChart() {
  const el = document.getElementById("roiChart");
  if (!el || typeof Chart === "undefined") return null;

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
      datasets: [
        {
          label: "보수적",
          data: [6.2, 7.1, 7.4, 7.8, 8.1],
          borderColor: "rgba(99, 110, 114, 0.95)",
          backgroundColor: "rgba(99, 110, 114, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "평균적",
          data: [9.0, 10.4, 11.6, 12.0, 12.5],
          borderColor: "rgba(9, 132, 227, 0.95)",
          backgroundColor: "rgba(9, 132, 227, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "공격적",
          data: [10.5, 12.2, 13.6, 14.3, 15.2],
          borderColor: "rgba(0, 184, 148, 0.95)",
          backgroundColor: "rgba(0, 184, 148, 0.18)",
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { mode: "index", intersect: false },
      },
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 20,
          ticks: {
            callback: (v) => `${v}%`,
          },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

function initDdVacancyChart() {
  const el = document.getElementById("vacancyChart");
  if (!el || typeof Chart === "undefined") return null;

  const ctx = el.getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["2024", "2025", "2026 (YTD)"],
      datasets: [
        {
          label: "평균 공실률",
          data: [18, 14, 12],
          backgroundColor: [
            "rgba(45, 52, 54, 0.25)",
            "rgba(9, 132, 227, 0.25)",
            "rgba(0, 184, 148, 0.25)",
          ],
          borderColor: ["#2d3436", "#0984e3", "#00b894"],
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx2) => `${ctx2.parsed.y}%`,
          },
        },
      },
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 30,
          ticks: { callback: (v) => `${v}%` },
          grid: { color: "rgba(45, 52, 54, 0.08)" },
        },
        x: { grid: { display: false } },
      },
    },
  });
}

function bindDdPdfDownload() {
  const btn = document.getElementById("download-pdf");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // 데모에서는 print로 대체합니다. (실제 PDF 파일이 생기면 href 다운로드로 교체)
    window.print();
  });
}

function initDdReport() {
  initDdRoiChart();
  initDdVacancyChart();
  bindDdPdfDownload();
}

document.addEventListener("DOMContentLoaded", initDdReport);

