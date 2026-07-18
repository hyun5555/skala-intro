////헤더와 푸터 공통 컴포넌트 로딩 함수
async function loadComponent(selector, path) {
    try {
        const container = document.querySelector(selector);

        if (!container) {
            throw new Error(`${selector} 요소를 찾을 수 없습니다.`);
        }

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`${path} 불러오기 실패: ${response.status}`);
        }

        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}


////푸터에 있는 다크 모드 버튼 로딩함수
//다크 모드 버튼 클릭 이벤트 연결
function initializeDarkMode() {
    const modeBtn = document.getElementById("dark-mode-btn");

    if (!modeBtn) {
        console.error("dark-mode-btn 버튼을 찾을 수 없습니다.");
        return;
    }

    // 저장된 다크모드 상태 불러오기
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode === "true") {
        document.body.classList.add("dark-mode"); ////저장된 값이 true이면 body에 dark-mode 적용
        modeBtn.textContent = "light";
    } else {
        modeBtn.textContent = "dark";
    }

    modeBtn.addEventListener("click", function () {
        const isDarkMode = document.body.classList.toggle("dark-mode");

        localStorage.setItem("darkMode", isDarkMode);

        modeBtn.textContent = isDarkMode ? "light" : "dark";
    });
}


////숫자 맞추기 게임
function initializeNumberGame() {
    const guessInput = document.getElementById("guess-input");
    const guessBtn = document.getElementById("guess-btn");
    const resetBtn = document.getElementById("reset-btn");
    const result = document.getElementById("game-result");
    const tryCount = document.getElementById("try-count");

    if (!guessInput || !guessBtn || !resetBtn || !result || !tryCount) {
        return;
    }

    let answer = Math.floor(Math.random() * 100) + 1;
    let count = 0;

    function checkAnswer() {
        const guess = Number(guessInput.value);

        if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
            result.textContent = "1부터 100 사이의 정수를 입력해 주세요.";
            guessInput.focus();
            return;
        }

        count += 1;
        tryCount.textContent = count;

        if (guess < answer) {
            result.textContent = "더 큰 숫자예요!";
        } else if (guess > answer) {
            result.textContent = "더 작은 숫자예요!";
        } else {
            result.textContent = `정답입니다! ${count}번 만에 맞혔어요.`;
            guessBtn.disabled = true;
            guessInput.disabled = true;
        }

        guessInput.select();
    }

    function resetGame() {
        answer = Math.floor(Math.random() * 100) + 1;
        count = 0;
        tryCount.textContent = "0";
        result.textContent = "새로운 숫자가 정해졌어요!";
        guessInput.value = "";
        guessInput.disabled = false;
        guessBtn.disabled = false;
        guessInput.focus();
    }

    guessBtn.addEventListener("click", checkAnswer);
    resetBtn.addEventListener("click", resetGame);
    guessInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
}


async function initializeLayout() {
    await Promise.all([
        loadComponent("#header-container", "./components/header.html"),
        loadComponent("#footer-container", "./components/footer.html")
    ]);

    // footer.html이 화면에 삽입된 후 이벤트 연결
    initializeDarkMode();
}

document.addEventListener("DOMContentLoaded", initializeLayout);
document.addEventListener("DOMContentLoaded", initializeNumberGame);
