/////////오늘의 한마디 부분////////
document.addEventListener("DOMContentLoaded", function () {
    const goalInput = document.getElementById("goalInput");
    const saveGoalBtn = document.getElementById("saveGoalBtn");
    const goalList = document.getElementById("goalList");

    //// HTML 요소 확인
    if (!goalInput || !saveGoalBtn || !goalList) {
        console.error("목표 관련 HTML 요소를 찾지 못했습니다.", {
            goalInput,
            saveGoalBtn,
            goalList
        });

        return;
    }

    //// localStorage 데이터 불러오기
    let goals = [];

    ////저장된 목록 실패했을대
    try {
        const savedGoals = localStorage.getItem("weeklyGoals");
        goals = savedGoals ? JSON.parse(savedGoals) : [];
    } catch (error) {
        console.error("저장된 목표를 불러오지 못했습니다.", error);
        goals = [];
    }

    // 목표 목록 출력
    function renderGoals() {
        goalList.innerHTML = "";

        goals.forEach(function (goal, index) {
            const goalItem = document.createElement("div");
            goalItem.classList.add("goal-item");

            const goalText = document.createElement("p");
            goalText.textContent = goal;

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "삭제";
            deleteBtn.classList.add("goal-delete-btn");

            deleteBtn.addEventListener("click", function () {
                goals.splice(index, 1);
                saveGoals();
                renderGoals();
            });

            goalItem.appendChild(goalText);
            goalItem.appendChild(deleteBtn);

            goalList.appendChild(goalItem);
        });
    }

    // localStorage 저장
    function saveGoals() {
        localStorage.setItem("weeklyGoals", JSON.stringify(goals));
    }

    // 목표 추가
    function addGoal() {
        const text = goalInput.value.trim();

        if (text === "") {
            alert("이번 주 목표를 입력해주세요.");
            goalInput.focus();
            return;
        }

        goals.push(text);

        saveGoals();
        renderGoals();

        goalInput.value = "";
        goalInput.focus();
    }

    saveGoalBtn.addEventListener("click", addGoal);

    renderGoals();
});




////////time block 부분 자바스크립트////////

let events = [];
let editingEventId = null;

// 캘린더 준비
function init() {
    updateDateDisplay(); ///오늘 날짜를 화면에 표시
    generateTimeSlots(); ///캘린더의 시간표를 생성
    setupEventListeners(); ///화면의 버튼과 입력 요소에 클릭 또는 제출 기능을 연결
    updateCurrentTimeIndicator(); ///현재 시간 빨간 선 로딩
    setInterval(updateCurrentTimeIndicator, 60000); ///함수를 60초마다 반복 실행
}

////날짜 업데이트
function updateDateDisplay() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', options);
}

///오전 6시부터 오후 10시까지의 시간이랑 일정 칸 생성 -> 캘린더 왼쪽 시간칸이랑 오른쪽 일정 칸을 생성함
function generateTimeSlots() {
    const timeLabels = document.getElementById('timeLabels');
    const calendarBody = document.getElementById('calendarBody');
    
    for (let hour = 6; hour < 23; hour++) {
        // 시간 칸 생성
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatTime(hour);
        timeLabels.appendChild(timeLabel);

        // 일정 칸 생성
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.dataset.hour = hour;
        timeSlot.addEventListener('click', () => openEventModal(hour));
        calendarBody.appendChild(timeSlot);
    }
}



///오전오후를 12시간 형식과 내부 계산에 사용하는 24시간 형식을 서로 변환
function convertInputTo24Hour(period, time) {
    const timePattern = /^(0?[1-9]|1[0-2]):([0-5][0-9])$/;

        if (!timePattern.test(time)) {
            return null;
        }

        const [hourText, minute] = time.split(':');
        let hour = Number(hourText);

        // 오전 12시는 00시
        if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        // 오후 1시~11시는 12를 더함
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }

        return `${String(hour).padStart(2, '0')}:${minute}`;

}


function convertTo12HourInput(time) {
    const [hourText, minute] = time.split(':');
    const hour24 = Number(hourText);

    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;

    return {
        period,
        time: `${hour12}:${minute}`
    };
}


function formatTime(hour) {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
}

// 화면에 있는 버튼, 모달, 입력 폼에 이벤트를 연결하는 함수
function setupEventListeners() {
    document
        .getElementById('addEventBtn')
        .addEventListener('click', () => openEventModal());

    document
        .getElementById('todayBtn')
        .addEventListener('click', scrollToCurrentTime);

    document
        .getElementById('clearAllBtn')
        .addEventListener('click', clearAllEvents);

    document
        .getElementById('cancelBtn')
        .addEventListener('click', closeEventModal);

    const eventForm = document.getElementById('eventForm');
    eventForm.addEventListener('submit', saveEvent);

    document
        .getElementById('eventModal')
        .addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                closeEventModal();
            }
        });
}




// addevent 버튼을 눌렀을 때 모달 창 오픈
function openEventModal(hour = null, event = null) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const eventTitle = document.getElementById('eventTitle');
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    const eventColor = document.getElementById('eventColor');

    if (event) {
        modalTitle.textContent = 'Edit Event';
        eventTitle.value = event.title;
        eventColor.value = event.color;

        const start = convertTo12HourInput(event.startTime);
        const end = convertTo12HourInput(event.endTime);

        document.getElementById('eventStartPeriod').value =
            start.period;

        document.getElementById('eventStart').value =
            start.time;

        document.getElementById('eventEndPeriod').value =
            end.period;

        document.getElementById('eventEnd').value =
            end.time;

        editingEventId = event.id;
    }else {
        modalTitle.textContent = 'Add New Event';
        eventTitle.value = '';
        eventColor.value = 'blue';
        editingEventId = null;

        let startTime;
        let endTime;

        if (hour === null) {
            /// Add Event 버튼으로 열면 현재 시스템 시각을 기본값으로 사용
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            ///날짜가 바뀌면 종료 시간이 시작 시간보다 앞서므로 당일 마지막 시각으로 제한
            endTime = oneHourLater.getDate() === now.getDate()
                ? `${String(oneHourLater.getHours()).padStart(2, '0')}:${String(oneHourLater.getMinutes()).padStart(2, '0')}`
                : '23:59';
        } else {
            /// 캘린더의 시간 칸을 클릭하면 해당 시간부터 1시간을 기본값으로 사용
            startTime = `${String(hour).padStart(2, '0')}:00`;
            endTime = `${String(hour + 1).padStart(2, '0')}:00`;
        }

        const start = convertTo12HourInput(startTime);
        const end = convertTo12HourInput(endTime);

        document.getElementById('eventStartPeriod').value =
            start.period;

        document.getElementById('eventStart').value =
            start.time;

        document.getElementById('eventEndPeriod').value =
            end.period;

        document.getElementById('eventEnd').value =
            end.time;
    }

    modal.style.display = 'block';
    eventTitle.focus();
}

// 모달 창 닫기
function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventId = null;
}

///이벤트 저장
function saveEvent(e) {
    e.preventDefault();

    const title = document
        .getElementById('eventTitle')
        .value
        .trim();

    const startPeriod =
        document.getElementById('eventStartPeriod').value;

    const endPeriod =
        document.getElementById('eventEndPeriod').value;

    const startInput =
        document.getElementById('eventStart').value.trim();

    const endInput =
        document.getElementById('eventEnd').value.trim();

    const color =
        document.getElementById('eventColor').value;

    const startTime =
        convertInputTo24Hour(startPeriod, startInput);

    const endTime =
        convertInputTo24Hour(endPeriod, endInput);

    if (!title) {
        alert('이벤트 제목을 입력해주세요.');
        return;
    }

    if (!startTime || !endTime) {
        alert('시간을 9:30 또는 12:00 형식으로 입력해주세요.');
        return;
    }

    if (startTime >= endTime) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
    }

    const eventData = {
        id: editingEventId || Date.now().toString(),
        title,
        startTime,
        endTime,
        color
    };

    if (editingEventId) {
        const index = events.findIndex(
            event => event.id === editingEventId
        );

        if (index !== -1) {
            events[index] = eventData;
        }
    } else {
        events.push(eventData);
    }

    renderEvents();
    closeEventModal();
}



// Render all events
function renderEvents() {
    // Clear existing events
    const existingEvents = document.querySelectorAll('.event');
    existingEvents.forEach(event => event.remove());

    // Render each event
    events.forEach(event => renderEvent(event));
}

// Render single event
function renderEvent(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event-${event.color}`;
    eventElement.textContent = event.title;
    eventElement.dataset.eventId = event.id;

    // Calculate position and height
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);

    // Only render events that fall within our display hours (6 AM - 11 PM)
    if (startHour < 6 || startHour >= 23) {
        console.warn('Event outside display hours:', event.title);
        return;
    }

    const startPosition = ((startHour - 6) * 60 + startMinute) * (60 / 60); // 60px per hour
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    const height = Math.max(20, duration * (60 / 60)); // Minimum 20px height

    eventElement.style.top = `${startPosition}px`;
    eventElement.style.height = `${height}px`;

    // Add click handler for editing
    eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openEventModal(null, event);
    });

    // Add double-click handler for deletion
    eventElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${event.title}"?`)) {
            deleteEvent(event.id);
        }
    });

    document.getElementById('calendarBody').appendChild(eventElement);
}

////이벤트 삭제
function deleteEvent(eventId) {
    events = events.filter(event => event.id !== eventId);
    renderEvents();
}

//전체 이벤트 삭제
function clearAllEvents() {
    if (events.length === 0) {
        alert('No events to clear');
        return;
    }

    if (confirm('모든 일정을 삭제하시겠습니까?')) {
        events = [];
        renderEvents();
    }
}

///현재 시스템 시간을 기준으로 캘린더 안의 위치를 계산
function scrollToCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour >= 6 && currentHour < 23) {
        const position = ((currentHour - 6) * 60 + currentMinute) * (60 / 60);
        const calendarContainer = document.querySelector('.calendar-container');
        calendarContainer.scrollTop = Math.max(0, position - 200);
    }
}

////캘린더 위에 현재 시간을 나타내는 가로선의 위치를 갱신하는 함수
function updateCurrentTimeIndicator() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const indicator = document.getElementById('currentTimeIndicator');

    if (currentHour >= 6 && currentHour < 23) {
        const position = ((currentHour - 6) * 60 + currentMinute) * (60 / 60);
        indicator.style.top = `${position}px`;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// 캘린더 로드 init
init();







//////////////To Do 할 일 관리//////////////

document.addEventListener("DOMContentLoaded", function () {
    const todoInput = document.getElementById("todoInput");
    const todoStatus = document.getElementById("todoStatus");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const todoList = document.getElementById("todoList");

    const todoStage = document.getElementById("todoStage");
    const progressStage = document.getElementById("progressStage");
    const doneStage = document.getElementById("doneStage");

    const todoCount = document.getElementById("todoCount");
    const progressCount = document.getElementById("progressCount");
    const doneCount = document.getElementById("doneCount");

    const filterBtns = document.querySelectorAll(".filter-btn");

    // 현재 선택된 필터
    let currentFilter = "all";

    // localStorage에 저장된 할 일 불러오기
    let todos = JSON.parse(localStorage.getItem("todos")) || [];

    // 할 일 목록 localStorage 저장
    function saveTodos() {
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    // 상태값을 한글로 변환
    function getStatusText(status) {
        const statusText = {
            todo: "대기",
            progress: "진행중",
            done: "완료"
        };

        return statusText[status];
    }

    // 필터 조건에 맞는 할 일인지 확인
    function isVisibleTodo(todo) {
        if (currentFilter === "all") {
            return true;
        }

        if (currentFilter === "active") {
            return todo.status !== "done";
        }

        if (currentFilter === "completed") {
            return todo.status === "done";
        }

        return true;
    }

    /////왼쪽 할 일 목록 출력
    function renderTodoList() {
        todoList.innerHTML = "";

        const filteredTodos = todos.filter(isVisibleTodo);

        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.classList.add("todo-empty");
            emptyMessage.textContent = "등록된 할 일이 없습니다.";

            todoList.appendChild(emptyMessage);
            return;
        }

        filteredTodos.forEach(function (todo) {
            const todoItem = document.createElement("li");
            todoItem.classList.add("todo-item");

            if (todo.status === "done") {
                todoItem.classList.add("completed");
            }

            

            // 할 일 내용
            const todoText = document.createElement("span");
            todoText.classList.add("todo-text");
            todoText.textContent = todo.text;

            // 상태 선택 박스
            const statusSelect = document.createElement("select");
            statusSelect.classList.add("todo-status-select");

            const statusOptions = [
                { value: "todo", text: "대기" },
                { value: "progress", text: "진행중" },
                { value: "done", text: "완료" }
            ];

            statusOptions.forEach(function (optionData) {
                const option = document.createElement("option");

                option.value = optionData.value;
                option.textContent = optionData.text;

                if (todo.status === optionData.value) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);
            });

            statusSelect.addEventListener("change", function () {
                changeTodoStatus(todo.id, statusSelect.value);
            });

            // 삭제 버튼
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.classList.add("todo-delete-btn");
            deleteBtn.textContent = "삭제";

            deleteBtn.addEventListener("click", function () {
                deleteTodo(todo.id);
            });

            todoItem.appendChild(todoText);
            todoItem.appendChild(statusSelect);
            todoItem.appendChild(deleteBtn);

            todoList.appendChild(todoItem);
        });
    }

    ///// 오른쪽 스테이징 보드 출력
    function renderStatusBoard() {
        // 기존 스테이징 내용 초기화
        todoStage.innerHTML = "";
        progressStage.innerHTML = "";
        doneStage.innerHTML = "";

        todos.forEach(function (todo) {
            const stageItem = document.createElement("button");

            stageItem.type = "button";
            stageItem.classList.add("stage-item");
            stageItem.classList.add(`stage-${todo.status}`);
            stageItem.textContent = todo.text;
            stageItem.dataset.id = todo.id;

            // 현재 상태 안내
            stageItem.title = `${getStatusText(todo.status)} 상태입니다. 클릭하면 상태를 변경할 수 있습니다.`;

            /*스테이징 일정을 클릭하면
            대기 → 진행중 → 완료 → 대기 순서로 상태 변경 */
            stageItem.addEventListener("click", function () {
                changeToNextStatus(todo.id);
            });

            if (todo.status === "todo") {
                todoStage.appendChild(stageItem);
            }

            if (todo.status === "progress") {
                progressStage.appendChild(stageItem);
            }

            if (todo.status === "done") {
                doneStage.appendChild(stageItem);
            }
        });

        renderEmptyStageMessage(todoStage, "대기 중인 일정이 없습니다.");
        renderEmptyStageMessage(progressStage, "진행 중인 일정이 없습니다.");
        renderEmptyStageMessage(doneStage, "완료된 일정이 없습니다.");

        updateStatusCount();
    }

    ///// 스테이징 일정이 없을 때 메시지 출력
    function renderEmptyStageMessage(stageElement, message) {
        if (stageElement.children.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.classList.add("stage-empty");
            emptyMessage.textContent = message;

            stageElement.appendChild(emptyMessage);
        }
    }

    // 상태별 일정 개수 출력
    function updateStatusCount() {
        todoCount.textContent = todos.filter(function (todo) {
            return todo.status === "todo";
        }).length;

        progressCount.textContent = todos.filter(function (todo) {
            return todo.status === "progress";
        }).length;

        doneCount.textContent = todos.filter(function (todo) {
            return todo.status === "done";
        }).length;
    }

    // 화면 전체 다시 출력
    function renderTodos() {
        renderTodoList();
        renderStatusBoard();
    }

    // 할 일 추가
    function addTodo() {
        const todoText = todoInput.value.trim();
        const status = todoStatus.value;

        if (todoText === "") {
            alert("할 일을 입력해주세요.");
            todoInput.focus();
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoText,
            status: status
        };

        todos.push(newTodo);

        saveTodos();
        renderTodos();

        todoInput.value = "";
        todoStatus.value = "todo";
        todoInput.focus();
    }

    // 할 일 상태 변경
    function changeTodoStatus(todoId, newStatus) {
        const selectedTodo = todos.find(function (todo) {
            return todo.id === todoId;
        });

        if (!selectedTodo) {
            return;
        }

        selectedTodo.status = newStatus;

        saveTodos();
        renderTodos();
    }

    // 스테이징 카드를 클릭했을 때 다음 상태로 변경
    function changeToNextStatus(todoId) {
        const selectedTodo = todos.find(function (todo) {
            return todo.id === todoId;
        });

        if (!selectedTodo) {
            return;
        }

        if (selectedTodo.status === "todo") {
            selectedTodo.status = "progress";
        } else if (selectedTodo.status === "progress") {
            selectedTodo.status = "done";
        } else {
            selectedTodo.status = "todo";
        }

        saveTodos();
        renderTodos();
    }

    // 할 일 삭제
    function deleteTodo(todoId) {
        todos = todos.filter(function (todo) {
            return todo.id !== todoId;
        });

        saveTodos();
        renderTodos();
    }

    // 추가 버튼 클릭
    addTodoBtn.addEventListener("click", addTodo);

    // 입력창에서 Enter를 눌렀을 때 할 일 추가
    todoInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addTodo();
        }
    });

    // 필터 버튼
    filterBtns.forEach(function (button) {
        button.addEventListener("click", function () {
            filterBtns.forEach(function (filterButton) {
                filterButton.classList.remove("active");
            });

            button.classList.add("active");
            currentFilter = button.dataset.filter;

            renderTodoList();
        });
    });

    // 페이지가 처음 열렸을 때 저장된 할 일 출력
    renderTodos();
});
