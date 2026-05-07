/**
 * 실사 보고서 — 매물 진단 레이더 (Chart.js)
 * options.labels / options.scores 로 덮어쓸 수 있습니다 (100점 만점 기준).
 */

let propertyRadarChartInstance = null;

function initPropertyRadarChart(options) {
  const canvas = document.getElementById("propertyRadarChart");
  if (!canvas || typeof Chart === "undefined") return null;

  const labels =
    options?.labels ??
    ["수익성", "시설 상태", "입지 편의", "법적 안전", "환경 평온"];
  const scores = options?.scores ?? [90, 75, 85, 95, 60];

  const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const overlayScore =
    document.querySelector("#score-overlay .total-score") ??
    document.querySelector(".report-main-container .score-center .num");
  if (overlayScore) overlayScore.textContent = String(total);

  const ctx = canvas.getContext("2d");
  if (propertyRadarChartInstance) {
    propertyRadarChartInstance.destroy();
    propertyRadarChartInstance = null;
  }

  const data = {
    labels,
    datasets: [
      {
        label: options?.datasetLabel ?? "매물 진단 결과",
        data: scores,
        fill: true,
        backgroundColor: "rgba(45, 52, 54, 0.2)",
        borderColor: "#2d3436",
        pointBackgroundColor: "#00b894",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#00b894",
      },
    ],
  };

  const config = {
    type: "radar",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false },
          pointLabels: {
            font: {
              size: 11,
              family:
                "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
              weight: "700",
            },
            color: "#2d3436",
          },
          grid: {
            color: "rgba(45, 52, 54, 0.12)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  propertyRadarChartInstance = new Chart(ctx, config);
  return propertyRadarChartInstance;
}
