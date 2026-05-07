/**
 * 정량 실사 데이터 표준 스키마 (백엔드/보관함 연동용)
 *
 * 예시:
 * const inspectionStandard = {
 *   utility_metrics: { water_pressure, ac_efficiency, wifi_speed },
 *   environmental_metrics: { ambient_noise, construction_nearby, road_width },
 *   structural_health: { wall_crack, mold_check, roof_leak },
 *   legal_zoning: { pondok_wisata_licensed, imb_number, leasehold_remaining_months }
 * };
 */

function parseOptionalFloat(elId) {
  const el = document.getElementById(elId);
  if (!el || String(el.value).trim() === "") return null;
  const n = parseFloat(String(el.value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseOptionalInt(elId) {
  const el = document.getElementById(elId);
  if (!el || String(el.value).trim() === "") return null;
  const n = parseInt(el.value, 10);
  return Number.isFinite(n) ? n : null;
}

function boolFromCheckbox(id) {
  const el = document.getElementById(id);
  return Boolean(el && el.checked);
}

/** 샤워·세면대 풀가동 기준 L/min → 상태 (임계값은 현장 가이드에 맞게 조정) */
function waterPressureStatus(lpm) {
  if (lpm == null) return "Unknown";
  if (lpm >= 10) return "Good";
  if (lpm >= 6) return "Fair";
  return "NeedsRepair";
}

function buildInspectionStandard() {
  const t0 = parseOptionalFloat("metric-ac-initial");
  const t1 = parseOptionalFloat("metric-ac-after");
  const deltaT =
    t0 != null && t1 != null ? Math.round((Math.abs(t0 - t1) + Number.EPSILON) * 10) / 10 : null;

  const w = parseOptionalFloat("water-flow");

  return {
    utility_metrics: {
      water_pressure: {
        value: w,
        unit: "L/min",
        status: waterPressureStatus(w),
      },
      ac_efficiency: {
        initial_temp: t0,
        after_10min: t1,
        ...(deltaT != null ? { delta_t: deltaT } : {}),
        unit: "Celsius",
      },
      wifi_speed: {
        download: parseOptionalFloat("wifi-speed"),
        upload: parseOptionalFloat("wifi-upload"),
        unit: "Mbps",
        screenshot_note: "Wi-Fi Speedtest 스크린샷은 상단 미디어 업로드에 포함",
      },
    },
    environmental_metrics: {
      ambient_noise: {
        indoor: parseOptionalFloat("noise-level"),
        outdoor: parseOptionalFloat("noise-bedroom"),
        unit: "dB",
        field_map_note: "indoor=거실(실내 평균), outdoor=침실 평균 dB",
      },
      construction_nearby: {
        count: parseOptionalInt("metric-construction-count"),
        distance: parseOptionalFloat("metric-construction-distance"),
        unit: "meters",
        radius_note: "반경 500m 이내 진행 공사 기준",
      },
      road_width: {
        value: parseOptionalFloat("metric-road-width"),
        unit: "meters",
      },
    },
    structural_health: {
      wall_crack: {
        exists: boolFromCheckbox("struct-wall-exists"),
        severity: parseOptionalInt("struct-wall-severity") ?? 0,
      },
      mold_check: {
        exists: boolFromCheckbox("struct-mold-exists"),
        location: document.getElementById("struct-mold-location")?.value?.trim() ?? "",
        severity: parseOptionalInt("struct-mold-severity") ?? 0,
      },
      roof_leak: {
        exists: boolFromCheckbox("struct-roof-exists"),
      },
    },
    legal_zoning: {
      pondok_wisata_licensed: (() => {
        const v = document.getElementById("legal-pondok")?.value;
        if (v === "yes") return true;
        if (v === "no") return false;
        return null;
      })(),
      imb_number: document.getElementById("legal-imb")?.value?.trim() ?? "",
      leasehold_remaining_months: parseOptionalInt("legal-lease-months"),
    },
  };
}

function acEfficiencyQualitative(std) {
  const d = std?.utility_metrics?.ac_efficiency?.delta_t;
  if (d == null) return "normal";
  if (d >= 6) return "good";
  if (d >= 4) return "normal";
  return "repair";
}

/** 레거시 select 와 호환되는 정성 태그 (매칭·요약용) */
function deriveQualitativeChecklist(std) {
  const ws = std?.utility_metrics?.water_pressure?.status || "Unknown";
  const waterMap = {
    Good: "good",
    Fair: "normal",
    NeedsRepair: "repair",
    Unknown: "normal",
  };
  return {
    waterPressure: waterMap[ws] || "normal",
    hvac: acEfficiencyQualitative(std),
  };
}

function applyInspectionStandardToForm(std) {
  if (!std || typeof std !== "object") return;

  const setNum = (id, v) => {
    const el = document.getElementById(id);
    if (el && v != null && typeof v === "number" && Number.isFinite(v)) el.value = String(v);
    else if (el && v === null) el.value = "";
  };

  const u = std.utility_metrics;
  if (u?.water_pressure?.value != null) setNum("water-flow", u.water_pressure.value);
  if (u?.ac_efficiency?.initial_temp != null) {
    setNum("metric-ac-initial", u.ac_efficiency.initial_temp);
  }
  if (u?.ac_efficiency?.after_10min != null) {
    setNum("metric-ac-after", u.ac_efficiency.after_10min);
  }
  if (u?.wifi_speed?.download != null) setNum("wifi-speed", u.wifi_speed.download);
  if (u?.wifi_speed?.upload != null) setNum("wifi-upload", u.wifi_speed.upload);

  const e = std.environmental_metrics;
  if (e?.ambient_noise?.indoor != null) setNum("noise-level", e.ambient_noise.indoor);
  if (e?.ambient_noise?.outdoor != null) setNum("noise-bedroom", e.ambient_noise.outdoor);
  if (e?.construction_nearby?.count != null) {
    const el = document.getElementById("metric-construction-count");
    if (el) el.value = String(e.construction_nearby.count);
  }
  if (e?.construction_nearby?.distance != null) {
    setNum("metric-construction-distance", e.construction_nearby.distance);
  }
  if (e?.road_width?.value != null) setNum("metric-road-width", e.road_width.value);

  const s = std.structural_health;
  if (s?.wall_crack) {
    const cx = document.getElementById("struct-wall-exists");
    if (cx) cx.checked = Boolean(s.wall_crack.exists);
    const sev = document.getElementById("struct-wall-severity");
    if (sev && s.wall_crack.severity != null) sev.value = String(s.wall_crack.severity);
  }
  if (s?.mold_check) {
    const mx = document.getElementById("struct-mold-exists");
    if (mx) mx.checked = Boolean(s.mold_check.exists);
    const loc = document.getElementById("struct-mold-location");
    if (loc && s.mold_check.location != null) loc.value = s.mold_check.location;
    const ms = document.getElementById("struct-mold-severity");
    if (ms && s.mold_check.severity != null) ms.value = String(s.mold_check.severity);
  }
  if (s?.roof_leak) {
    const rx = document.getElementById("struct-roof-exists");
    if (rx) rx.checked = Boolean(s.roof_leak.exists);
  }

  const l = std.legal_zoning;
  if (l) {
    const pd = document.getElementById("legal-pondok");
    if (pd) {
      if (l.pondok_wisata_licensed === true) pd.value = "yes";
      else if (l.pondok_wisata_licensed === false) pd.value = "no";
      else pd.value = "unknown";
    }
    const imb = document.getElementById("legal-imb");
    if (imb && l.imb_number != null) imb.value = l.imb_number;
    const lm = document.getElementById("legal-lease-months");
    if (lm && l.leasehold_remaining_months != null) {
      lm.value = String(l.leasehold_remaining_months);
    }
  }
}
