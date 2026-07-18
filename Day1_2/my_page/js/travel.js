///여행 카드 클릭 시 iframe 미리보기 열고 닫기
const preview = document.querySelector("#page-preview");
const previewFrame = document.querySelector("#travel-preview-frame");

const openButtons = document.querySelectorAll(".travel-open-button");

///imframe안의 닫기 확장 버튼
const closeButton = document.querySelector("#preview-close");
const expandButton = document.querySelector("#preview-expand");
const backdrop = document.querySelector(".page-preview-backdrop");

///현재 페이지 주소 저장
let currentPage = "";


///미리보기 열기 함수
function openPreview(pageUrl) {
    currentPage = pageUrl; //현재 페이지 저장

    previewFrame.src = pageUrl; //저장한 현재 페이지 즉 iframe에 페이지 url를 넣어 불러옴 

    preview.classList.add("is-open"); //미리보기 열기
    preview.setAttribute("aria-hidden", "false");

    document.body.classList.add("preview-open");
}

///미리보기 닫기
function closePreview() {
    preview.classList.remove("is-open"); //is-open 클래스 제거
    preview.setAttribute("aria-hidden", "true");

    document.body.classList.remove("preview-open");

    ////창만 숨겼을 때 iframe 안의 동영상이 재생될 수 있으니까 현재 주소 초기화
    previewFrame.src = "";
    currentPage = "";
}
/////열기 버튼 클릭 처리
openButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const pageUrl = button.dataset.page;

        openPreview(pageUrl);
    });
});

//닫기 동작 등록
closeButton.addEventListener("click", closePreview);
backdrop.addEventListener("click", closePreview);

///전체 페이지로 이동
expandButton.addEventListener("click", () => {
    if (!currentPage) {
        return;
    }

    window.location.href = currentPage;
});

////esc 키로 창 닫기
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && preview.classList.contains("is-open")) {
        closePreview();
    }
});