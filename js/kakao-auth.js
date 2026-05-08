const KAKAO_JAVASCRIPT_KEY = "8a83bbb04eb282c6c694e95c969bbd36";

function initKakaoSdk() {
  if (typeof Kakao === "undefined") return false;
  if (KAKAO_JAVASCRIPT_KEY === "YOUR_JAVASCRIPT_KEY") return false;
  if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_JAVASCRIPT_KEY);
  }
  return true;
}

function persistLoggedInUser(user) {
  const userData = {
    id: user.id,
    name: user.name || "발리 투자자",
    email: user.email || "",
  };
  try {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("baliBridgeAuth", "kakao");
    sessionStorage.setItem("baliInvestorName", userData.name);
  } catch (_) {}
}

/**
 * @param {() => void} [onSuccess]
 */
function startKakaoLogin(onSuccess) {
  if (!initKakaoSdk()) {
    alert(
      "카카오 JavaScript 키가 설정되지 않았습니다. js/kakao-auth.js의 KAKAO_JAVASCRIPT_KEY를 실제 키로 교체해 주세요."
    );
    return;
  }

  Kakao.Auth.login({
    success: function () {
      Kakao.API.request({
        url: "/v2/user/me",
        success: function (res) {
          const userId = res.id;
          const userName = res.properties?.nickname || "발리 투자자";
          const email = res.kakao_account?.email || "";

          console.log(`${userName}님 환영합니다! (ID: ${userId})`);

          persistLoggedInUser({
            id: userId,
            name: userName,
            email,
          });

          if (typeof onSuccess === "function") onSuccess();
        },
        fail: function (error) {
          console.error(error);
          alert("사용자 정보를 가져오는 데 실패했습니다.");
        },
      });
    },
    fail: function (err) {
      console.error(err);
      alert("카카오 로그인에 실패했습니다.");
    },
  });
}
