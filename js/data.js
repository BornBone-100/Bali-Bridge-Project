/** 에이전트 원본 샘플 — 지역은 한글 라벨, 통계는 reviews / exp 필드 사용 — 상세용 about·avgROI·portfolio 포함 */
const agentData = [
  {
    id: 1,
    name: "Putu Arta",
    company: "Bali Oasis Management",
    regions: ["짱구", "세미냑"],
    specialty: "럭셔리 빌라",
    verified: true,
    rating: 4.9,
    reviews: 128,
    exp: "8년",
    languages: ["EN", "ID", "KR"],
    whatsapp: "628123456789",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400",
    about:
      "8년간 발리 전역에서 50채 이상의 빌라를 성공적으로 런칭시킨 전문가입니다. 에어비앤비 운영·인허가·현지 파트너십까지 원스톱으로 지원합니다.",
    avgROI: "연 12.5%",
    portfolio: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
    ],
  },
  {
    id: 2,
    name: "Santi Devi",
    company: "Ubud Dream Property",
    regions: ["우붓"],
    specialty: "친환경 리조트",
    verified: true,
    rating: 4.7,
    reviews: 85,
    exp: "5년",
    languages: ["EN", "ID"],
    whatsapp: "628987654321",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400",
    about:
      "우붓 중심의 장기 스테이·웰니스 리조트 매물을 전문으로 합니다. 지속 가능한 건축 자재와 현지 커뮤니티와의 협업을 중시합니다.",
    avgROI: "연 10.2%",
    portfolio: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800",
    ],
  },
  {
    id: 3,
    name: "Made Wijaya",
    company: "South Bali Realty",
    regions: ["울루와투", "짐바란"],
    specialty: "토지 매매 & 개발",
    verified: false,
    rating: 4.5,
    reviews: 42,
    exp: "12년",
    languages: ["EN", "ID"],
    whatsapp: "628111222333",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400",
    about:
      "남부 발리 해안권 토지 매각·분할·호텔·빌라 개발 컨설팅 경험이 풍부합니다. PMA 구조와 현지 법규 리스크를 사전에 정리해 드립니다.",
    avgROI: "연 11.0%",
    portfolio: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1526481280695-8cddd991d87e?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
    ],
  },
];

/** 한글 지역명 → 카테고리 필터용 코드 (script.js · detail 공통) */
const REGION_CODE_BY_LABEL = {
  짱구: "canggu",
  우붓: "ubud",
  울루와투: "uluwatu",
  세미냑: "seminyak",
  짐바란: "jimbaran",
};

/** reviews·exp·한글 regions 등을 카드/필터용 필드로 통일 */
function hydrateAgent(raw) {
  const koRegions = raw.regions ?? raw.region ?? [];
  const codes = koRegions.map((r) => REGION_CODE_BY_LABEL[r] || r);
  const exp = raw.exp ?? raw.experience ?? "";
  const m = String(exp).match(/\d+/);
  const experienceYears =
    raw.experienceYears ?? (m ? parseInt(m[0], 10) : null);
  return {
    ...raw,
    /** 원본 한글 지역명 — 카테고리 버튼 라벨과 매칭할 때 사용 */
    regionsKo: koRegions.map(String),
    regions: codes,
    region: codes,
    reviewCount: raw.reviews ?? raw.reviewCount ?? 0,
    experience: exp,
    experienceYears,
  };
}
