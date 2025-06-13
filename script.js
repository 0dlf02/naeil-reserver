// --- 전역 함수 등록 (모듈 방식에서도 HTML에서 쓸 수 있도록) ---
window.goToNextPage = goToNextPage;
window.skipEmotionSelection = skipEmotionSelection;
window.openPopup = openPopup;
window.closePopup = closePopup;
window.changeDiaryDate = changeDiaryDate;
window.onDiaryDateChange = onDiaryDateChange;
window.saveDiary = saveDiary;
window.addTodo = addTodo;
window.savePastTodo = savePastTodo;
window.closeDateInfoPopup = closeDateInfoPopup;

// Firebase App (modular 방식 사용)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ✅ 너의 Firebase 설정 정보 입력
const firebaseConfig = {
    apiKey: "AIzaSyDNX-A0vlNyQz4irUaxxrPl75cckbyJVuc",
    authDomain: "naeil-reserver.firebaseapp.com",
    projectId: "naeil-reserver",
    storageBucket: "naeil-reserver.firebasestorage.app",
    messagingSenderId: "900167795214",
    appId: "1:900167795214:web:0531903f233458046a325f"
};

// 🔹 Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);        // 🔸 auth 변수 선언
const db = getFirestore(app);     // 🔸 db 변수 선언

const user = auth.currentUser;
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

function getKSTDate(date = new Date()) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 60 * 60 * 1000));  // 🔹 KST 보정 적용
  return kst;
}

let selectedEmojis = [];
function getTomorrowKey() {
  const now = getKSTDate();
  now.setDate(now.getDate() + 1);  // 🔄 내일로 이동
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentDiaryDate = getKSTDate();  // 일기 날짜 상태

// 감정별 음악 추천
const emotionMusicMap = {
  "😁": ["아이유 - Blueming", "Red Velvet - Power Up", "AKMU - 200%", "볼빨간사춘기 - 여행", "트와이스 - Cheer Up", "브레이브걸스 - 롤린"],
  "😭": ["정승환 - 이 바보야", "이수 - 슬픔 속에 그댈 지워야만 해", "윤하 - 비가 내리는 날엔", "백예린 - 그건 아마 우리의 잘못은 아닐거야"],
  "😡": ["BTS - Mic Drop", "Stray Kids - Maniac", "Imagine Dragons - Believer"],
  "😴": ["우효 - 민들레", "Chet Baker - Almost Blue", "Rainy Jazz Cafe", "Billie Eilish - idontwannabeyouanymore", "새소년 - 긴 꿈"],
  "🥱": ["윤하 - 오르트구름", "브로콜리너마저 - 앵콜요청금지", "혁오 - 톰보이"],
  "🤒": ["아이유 - Love Poem", "이하이 - 한숨", "적재 - 나랑 같이 걸을래", "백예린 - 우주를 건너"]
};

function generateComment(emotions, diaryText) {
  const commentPool = [];

  if (emotions.includes("😭") || diaryText.includes("힘들") || diaryText.includes("속상")) {
    commentPool.push(
      "내일은 조금 더 단단한 내가 되길 바라요. 당신은 이미 잘하고 있어요.",
      "오늘의 무게는 내려놓고, 내일은 가볍게 걸어봐요.",
      "슬픔이 지나간 자리에 햇살이 머무르길 바라요."
    );
  }

  if (emotions.includes("😁") || diaryText.includes("행복") || diaryText.includes("좋았어")) {
    commentPool.push(
      "내일도 오늘처럼 밝은 웃음으로 시작할 수 있길 바라요 😊",
      "행복한 마음, 내일까지 이어지길 바랄게요.",
      "기분 좋은 하루는 내일의 나에게도 큰 선물이 될 거예요!"
    );
  }

  if (emotions.includes("😡") || diaryText.includes("짜증") || diaryText.includes("화나")) {
    commentPool.push(
      "내일은 마음을 더 가볍게, 나를 더 편하게 해주길 바라요.",
      "화났던 오늘을 털고, 부드러운 내일을 기대해요.",
      "분노도 감정이에요. 내일은 감정을 잘 돌보는 하루가 되길!"
    );
  }

  if (emotions.includes("😴") || emotions.includes("🥱") || diaryText.includes("피곤")) {
    commentPool.push(
      "오늘의 피로를 내려놓고, 내일은 더 가뿐하게 시작해봐요!",
      "충분히 쉰 당신, 내일은 더 활기찬 하루가 될 거예요.",
      "쉼도 계획의 일부예요. 내일은 새 힘으로 출발해요!"
    );
  }

  if (emotions.includes("🤒") || diaryText.includes("아팠어")) {
    commentPool.push(
      "몸과 마음 모두 회복하는 내일이 되길 바라요.",
      "오늘의 아픔은 내일의 회복으로 이어질 거예요.",
      "건강한 내일을 위해 오늘은 잘 쉬기로 해요 🍵"
    );
  }

  if (commentPool.length === 0) {
    commentPool.push(
      "내일의 내가 오늘보다 더 웃을 수 있도록, 지금 이 순간도 의미 있어요 🌿",
      "조용한 하루도 괜찮아요. 내일은 또 다른 흐름이 시작될 거예요.",
      "당신의 하루는 당신만의 색으로 충분히 아름다워요."
    );
  }

  // 랜덤 메시지 하나 선택
  const randomIndex = Math.floor(Math.random() * commentPool.length);
  return commentPool[randomIndex];
}

// 감정별 음식 추천
const emotionFoodMap = {
  "😁": ["연어 덮밥", "바질 크림 파스타", "새우 로제 파스타", "우동 정식", "포케"],
  "😭": ["크림 파스타", "카레라이스", "오므라이스", "치즈버거"],
  "😡": ["엽기 떡볶이", "불닭볶음면", "쭈꾸미볶음", "짬뽕", "제육볶음", "순두부 열라면"],
  "😴": ["삼겹살", "순댓국", "돈가스", "부대찌개", "스테이크 덮밥"],
  "🥱": ["김밥", "라볶이", "이삭토스트", "잔치국수", "떡만둣국"],
  "🤒": ["삼계탕", "야채죽", "전복죽", "미역국", "들깨칼국수"]
};

document.addEventListener('DOMContentLoaded', () => {
  const emojis = document.querySelectorAll('.emotion');
  if (emojis.length > 0) {
    emojis.forEach(e => {
      e.addEventListener('click', () => {
        e.classList.toggle('selected');
        const emoji = e.textContent;
        if (selectedEmojis.includes(emoji)) {
          selectedEmojis = selectedEmojis.filter(em => em !== emoji);
        } else {
          selectedEmojis.push(emoji);
        }
      });
    });
  }

  const display = document.getElementById('selectedEmotions');
  if (display) {
    const params = new URLSearchParams(window.location.search);
    const emotionList = params.get('emotions')?.split(',') || [];
    display.textContent = emotionList.join(' ');

    // 음악 추천
    let musicOptions = [];
    emotionList.forEach(em => {
      if (emotionMusicMap[em]) musicOptions.push(...emotionMusicMap[em]);
    });
    const randomMusic = musicOptions.length ? musicOptions[Math.floor(Math.random() * musicOptions.length)] : "🎵 추천 없음";
    document.getElementById('music-recommendation').textContent = `🎵 ${randomMusic}`;

    // 음식 추천
    let foodOptions = [];
    emotionList.forEach(em => {
      if (emotionFoodMap[em]) foodOptions.push(...emotionFoodMap[em]);
    });
    const randomFood = foodOptions.length ? foodOptions[Math.floor(Math.random() * foodOptions.length)] : "🍱 추천 없음";
    document.getElementById('food-recommendation').textContent = `🍱 ${randomFood}`;
  }

  loadTodo(); // 투두리스트 자동 로드
  fetchTomorrowForecast();
});


function goToNextPage() {
  if (selectedEmojis.length === 0) {
    alert("감정을 하나 이상 선택해주세요!");
    return;
  }

  const key = getTomorrowKey();
  localStorage.setItem(key, JSON.stringify(selectedEmojis));

  // 🟨 Firebase 로그인 사용자 정보 가져오기
  const user = auth.currentUser;

  // 🟨 Firestore에 감정 저장
  if (user) {
    setDoc(doc(db, "users", user.uid, "emotions", key), {
      emotions: selectedEmojis
    })
    .then(() => {
      console.log("Firestore에 감정 저장 완료 ✅");
    })
    .catch((err) => {
      console.error("Firestore 감정 저장 오류:", err);
    });
  }

  const params = new URLSearchParams();
  params.set("emotions", selectedEmojis.join(','));
  window.location.href = `main.html?${params.toString()}`;
}

function openPopup(id) {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById(id).style.display = 'block';

  if (id === 'calendar') generateCalendar();

  if (id === 'diary') {
  const now = getKSTDate();
  now.setDate(now.getDate() + 1); // 내일로 보기 원하면 이걸로
  setDiaryDate(now);
  }
}

function closePopup() {
  document.getElementById('overlay').style.display = 'none';
  document.querySelectorAll('.popup').forEach(p => p.style.display = 'none');
}

// 🔹 기록 상세 팝업만 닫는 함수
function closeDateInfoPopup() {
  document.getElementById('dateInfoPopup').style.display = 'none';
}

function generateCalendar() {
  const calendar = document.getElementById('calendar-body');
  calendar.innerHTML = "";

  const year = currentYear;
  const month = currentMonth;

  const firstDay = new Date(year, month, 1).getDay(); // 해당 월의 첫날 요일
  const lastDate = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월",
                      "7월", "8월", "9월", "10월", "11월", "12월"];

  // 📅 제목 + 버튼 영역
    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'calender-header-top';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.justifyContent = 'center';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.gap = '10px';
    headerWrapper.style.marginBottom = '10px';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀';
    prevBtn.onclick = () => changeMonth(-1);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '▶';
    nextBtn.onclick = () => changeMonth(1);

    const header = document.createElement('h4');
    header.textContent = `${year}년 ${monthNames[month]}`;
    header.style.margin = '0';

    headerWrapper.appendChild(prevBtn);
    headerWrapper.appendChild(header);
    headerWrapper.appendChild(nextBtn);

    calendar.appendChild(headerWrapper);

  const table = document.createElement('table');
  table.style.margin = "0 auto";

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const trHead = document.createElement('tr');
  for (let i = 0; i < days.length; i++) {
    const th = document.createElement('th');
    th.textContent = days[i];
    if (i === 0) th.style.color = 'red';
    if (i === 6) th.style.color = 'blue';
    trHead.appendChild(th);
  }
  table.appendChild(trHead);

  let tr = document.createElement('tr');
  let cellCount = 0;

  // 빈 칸 (1일 전까지)
  for (let i = 0; i < firstDay; i++) {
    tr.appendChild(document.createElement('td'));
    cellCount++;
  }

  for (let d = 1; d <= lastDate; d++) {
    const td = document.createElement('td');
    td.style.verticalAlign = 'top';
    td.style.padding = '4px';
    td.style.cursor = 'pointer';

    const date = new Date(year, month, d);
    const today = getKSTDate();

    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const dateObj = new Date(year, month, d + 1); // 내일 기록용
    const dateKey = dateObj.toISOString().split('T')[0];
    const savedEmotions = JSON.parse(localStorage.getItem(dateKey)) || [];

    td.innerHTML = `
      <div class="day-number${isToday ? ' today-indicator' : ''}">${d}</div>
      <div class="emotion-list">${savedEmotions.join(' ')}</div>
    `;

    td.onclick = () => openDateInfoPopup(year, month + 1, d);

    tr.appendChild(td);
    cellCount++;

    if (cellCount % 7 === 0) {
      table.appendChild(tr);
      tr = document.createElement('tr');
    }
  }

  if (cellCount % 7 !== 0) {
    for (let i = cellCount % 7; i < 7; i++) {
      tr.appendChild(document.createElement('td'));
    }
    table.appendChild(tr);
  }

  calendar.appendChild(table);
}

function changeMonth(diff) {
  currentMonth += diff;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  generateCalendar();
}

function openDateInfoPopup(y, m, d) {
  const dateObj = new Date(y, m - 1, d);
  dateObj.setHours(dateObj.getHours() + 9);  // ✅ 한국시간 보정
  const key = dateObj.toISOString().split('T')[0];  // 🔑 정확한 키 생성

  const diary = localStorage.getItem('diary-' + key) || "(기록 없음)";
  const emotions = JSON.parse(localStorage.getItem(key)) || [];
  const todos = JSON.parse(localStorage.getItem('todo-' + key)) || [];

  document.getElementById('dateInfoTitle').textContent = `${key}의 기록`;

  const emoDiv = document.getElementById('dateEmotions');
  emoDiv.innerHTML = `<h4>😊 감정</h4><p>${emotions.length ? emotions.join(' ') : '(감정 없음)'}</p>`;

  document.getElementById('dateDiary').value = diary;
  const comment = localStorage.getItem('comment-' + key) || "(아직 코멘트가 없어요)";
document.getElementById('dateComment').textContent = comment;

  const todoList = document.getElementById('dateTodos');
  todoList.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.dataset.idx = idx;
    checkbox.style.marginRight = '10px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.text;
    input.dataset.idx = idx;
    input.style.flexGrow = '1';
    if (todo.done) {
      input.style.color = '#aaa';
      input.style.textDecoration = 'line-through';
    }

    li.appendChild(checkbox);
    li.appendChild(input);
    todoList.appendChild(li);
  });

  document.getElementById('overlay').style.display = 'block';
  document.getElementById('dateInfoPopup').style.display = 'block';

  document.getElementById('dateTodos').dataset.key = key;
}

function savePastTodo() {
  const key = document.getElementById('dateTodos').dataset.key;

  // 🔸 1. 투두리스트 저장
  const items = document.querySelectorAll('#dateTodos li');
  const newTodos = [];

  items.forEach(li => {
    const checkbox = li.querySelector('input[type="checkbox"]');
    const input = li.querySelector('input[type="text"]');
    newTodos.push({
      text: input.value.trim(),
      done: checkbox.checked
    });
  });
  localStorage.setItem('todo-' + key, JSON.stringify(newTodos));

  // 🔸 2. 다짐(일기) 저장
  const editedDiary = document.getElementById('dateDiary').value.trim();
  localStorage.setItem('diary-' + key, editedDiary);

  alert("수정 완료! 저장되었습니다 ✅");
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  const key = 'todo-' + getTomorrowKey();
  const todos = JSON.parse(localStorage.getItem(key)) || [];

  todos.push({ text, done: false });
  localStorage.setItem(key, JSON.stringify(todos));

  // 🟨 Firestore에도 저장
  const user = auth.currentUser;
  if (user) {
    const dateKey = getTomorrowKey();  // yyyy-mm-dd 형식
    setDoc(doc(db, "users", user.uid, "todo", dateKey), {
      todos: todos
    })
    .then(() => {
      console.log("✅ 투두리스트 Firestore 저장 완료");
    })
    .catch((err) => {
      console.error("❌ Firestore 투두 저장 실패:", err);
    });
  }

  input.value = "";
  loadTodo();
}

function loadTodo() {
  const list = document.getElementById('todo-list');
  list.innerHTML = "";

  const key = 'todo-' + getTomorrowKey();
  const todos = JSON.parse(localStorage.getItem(key)) || [];

  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.style.marginRight = '10px';
    checkbox.onchange = () => {
      todos[idx].done = checkbox.checked;
      localStorage.setItem(key, JSON.stringify(todos));
      loadTodo();
    };
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.style.flexGrow = '1';
    if (todo.done) {
      span.style.color = '#aaa';
      span.style.textDecoration = 'line-through';
    }
    li.appendChild(span);

    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.marginLeft = '10px';
    delBtn.onclick = () => {
      todos.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(todos));
      loadTodo();
    };
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

function saveDiary() {
  const text = document.getElementById('diary-text').value.trim();
  const key = getTomorrowKey();
  localStorage.setItem('diary-' + key, text);

  const emotions = JSON.parse(localStorage.getItem(key));
  const comment = generateComment(emotions || [], text);  // ✅ null일 때도 처리

  // 🟨 Firestore에도 저장
  const user = auth.currentUser;
  if (user) {
    setDoc(doc(db, "users", user.uid, "diary", key), {
      text: text
    })
    .then(() => {
      console.log("🔥 Firestore에 다짐 저장 완료");
    })
    .catch((err) => {
      console.error("❌ Firestore 다짐 저장 실패:", err);
    });
  }

  alert("✍ 내일의 다짐이 저장되었습니다!");
  closePopup();
}

function fetchTomorrowForecast() {
  if (!navigator.geolocation) {
    document.getElementById("weather-info").textContent = "위치 정보를 지원하지 않아요.";
    return;
  }

  navigator.geolocation.getCurrentPosition(success => {
    const lat = success.coords.latitude;
    const lon = success.coords.longitude;
    const apiKey = '217f5cf44e55c32dbac1c438603094f0';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const key = tomorrow.toISOString().split('T')[0];

        const forecasts = data.list.filter(entry =>
          entry.dt_txt.startsWith(key)
        );

        if (forecasts.length === 0) {
          document.getElementById("weather-info").textContent = "내일 날씨 정보를 불러올 수 없어요.";
          return;
        }

        const timeWeather = {};
        const temps = [];

        forecasts.forEach(entry => {
          const hour = new Date(entry.dt_txt).getHours();
          const desc = entry.weather[0].description;
          const temp = entry.main.temp;
          temps.push(temp);
          if (hour < 12) timeWeather["오전"] = desc;
          else if (hour < 18) timeWeather["오후"] = desc;
          else timeWeather["저녁"] = desc;
        });

        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        // 날씨 설명 변환
        const descMap = {
          "맑음": "맑음☀️",
          "구름 많음": "구름 많음🌤️",
          "흐림": "흐림☁️",
          "온흐림": "완전 흐림☁️",
          "튼구름": "대체로 맑음",
          "소나기": "소나기 🌦️",
          "비": "비🌧️",
          "눈": "눈❄️",
          "천둥번개": "천둥번개⚡"
        };

        const summary = Object.entries(timeWeather).map(
          ([time, desc]) => `${time}에는 ${descMap[desc] || desc}`
        ).join("\n");

        document.getElementById("weather-info").innerHTML =
        `내일은 ${summary.replace(/\//g, "<br>")}입니다.<br>기온은 ${minTemp.toFixed(1)}°C ~ ${maxTemp.toFixed(1)}°C예요.`;

        // 상세 코디 추천
        let outfit = "";

        if (maxTemp < 5) {
          outfit += "두꺼운 패딩, 히트텍, 니트 필수! 🧥❄️\n";
          outfit += "목도리, 장갑, 귀마개까지 챙기면 좋아요.\n";
          outfit += "보온 내의, 기모 바지도 추천해요.\n";
        } else if (maxTemp < 12) {
          outfit += "코트나 점퍼 + 니트 or 맨투맨이 좋아요 🧥🧶\n";
          outfit += "양말은 두꺼운 걸로, 스니커즈보다는 앵클부츠 추천 👢\n";
        } else if (maxTemp < 18) {
          outfit += "가디건, 얇은 니트, 트렌치코트 적당해요 🌬️\n";
          outfit += "청바지나 면바지와 함께 깔끔하게 코디해보세요.\n";
        } else if (maxTemp < 23) {
          outfit += "긴팔 셔츠나 맨투맨이 좋고, 낮엔 덥게 느껴질 수 있어요 👕\n";
          outfit += "얇은 외투 하나 챙기면 아침 저녁에 유용해요.\n";
        } else {
          outfit += "반팔 티셔츠 + 반바지 or 얇은 원피스 추천! ☀️🩳\n";
          outfit += "모자와 선크림도 잊지 마세요 🧴🧢\n";
        }

        const fullDesc = Object.values(timeWeather).join(" ");
        if (fullDesc.includes("비") || fullDesc.includes("소나기")) {
          outfit += "\n비 예보가 있으니 우산과 방수 신발을 준비하세요 ☔👟";
        }
        if (maxTemp > 28) {
          outfit += "\n폭염 주의! 물 자주 마시고 통풍 잘 되는 옷을 입으세요 💦";
        }

        document.getElementById("outfit-recommendation").innerHTML = outfit.replace(/\n/g, "<br>");
      })
      .catch(() => {
        document.getElementById("weather-info").textContent = "날씨 정보를 불러올 수 없어요.";
        document.getElementById("outfit-recommendation").textContent = "코디 추천을 제공할 수 없어요.";
      });
  }, () => {
    document.getElementById("weather-info").textContent = "위치 권한이 필요해요.";
  });
}

function setDiaryDate(dateObj) {
  currentDiaryDate = dateObj;

  // ✅ KST 보정
  const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
  const yyyyMMdd = kstDate.toISOString().split('T')[0];

  // 📆 날짜 텍스트 표시
  document.getElementById('diary-date-display').textContent = yyyyMMdd;
  document.getElementById('diary-date-picker').value = yyyyMMdd;

  // 📄 저장된 다짐 불러오기
  const saved = localStorage.getItem('diary-' + yyyyMMdd);
  document.getElementById('diary-text').value = saved || "";
}

function onDiaryDateChange() {
  const pickedDate = document.getElementById('diary-date-picker').value;
  if (pickedDate) {
    setDiaryDate(new Date(pickedDate + "T00:00:00"));
  }
}

function changeDiaryDate(offset) {
  const newDate = new Date(currentDiaryDate);
  newDate.setDate(newDate.getDate() + offset);
  setDiaryDate(newDate);
}

function skipEmotionSelection() {
  const key = getTomorrowKey();
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    alert("이전에 선택한 감정이 없어요. 먼저 감정을 선택해 주세요.");
    return;
  }

  const params = new URLSearchParams();
  params.set("emotions", JSON.parse(stored).join(','));
  window.location.href = `main.html?${params.toString()}`;
}