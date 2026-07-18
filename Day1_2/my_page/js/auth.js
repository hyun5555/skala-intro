/////회원가입페이지에서 데이터 받아와 결과페이지에 출력

function showSignupResult() {
    const params = new URLSearchParams(window.location.search);

    ////회원가입 정보 받기
    const name = params.get("user-name") || "";
    const userId = params.get("user-id") || "";
    const emailId = params.get("user-email") || "";
    const emailDomain = params.get("email-domain") || "";
    const tel = params.get("phone-num") || "";
    const birth = params.get("user-birth") || "";
    const gender = params.get("identity-gender") || "";
    const region = params.get("region") || "";

    ///관심분야는 배열로 받기(복수선택)
    const interests = params.getAll("interest");

    ///결과페이지에 받아온 데이터 출력
    document.getElementById("resultName").textContent =
        name || "입력하지 않음";

    document.getElementById("resultId").textContent =
        userId || "입력하지 않음";

    document.getElementById("resultEmail").textContent =
        emailId && emailDomain && emailDomain !== "direct"
            ? `${emailId}@${emailDomain}`
            : emailId || "입력하지 않음";

    document.getElementById("resultTel").textContent =
        tel || "입력하지 않음";

    document.getElementById("resultBirth").textContent =
        birth || "입력하지 않음";

    document.getElementById("resultGender").textContent =
        gender === "M"
            ? "남자"
            : gender === "F"
                ? "여자"
                : "선택하지 않음";

    document.getElementById("resultInterest").textContent =
        interests.length > 0
            ? interests.map(getInterestName).join(", ")
            : "선택하지 않음";

    document.getElementById("resultRegion").textContent =
        getRegionName(region);
}

/// 관심 분야 코드값을 화면에 표시할 이름으로 변환
function getInterestName(interest) {
    const interestNames = {
        frontend: "Frontend",
        backend: "Backend",
        design: "Design",
        ai: "AI"
    };

    return interestNames[interest] || interest;
}

function getRegionName(region) {
    const regionNames = {
        seoul: "서울",
        kyeonggi: "경기",
        incheon: "인천",
        busan: "부산",
        ulsan: "울산",
        daegu: "대구",
        gwangju: "광주",
        jeju: "제주"
    };

    return regionNames[region] || "선택하지 않음";
}

///HTML 문서가 모두 로드되면 실행
//결과 페이지(resultName 요소가 존재하는 경우)에만 회원가입 정보 출력
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("resultName")) {
        showSignupResult();
    }
});