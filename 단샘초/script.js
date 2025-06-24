// 오늘 날짜 구하기 (YYYYMMDD)
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;
const todayApiStr = `${yyyy}${mm}${dd}`;

// 날짜 표시
const dateDiv = document.getElementById('date');
dateDiv.textContent = `${yyyy}년 ${mm}월 ${dd}일`;

// 급식 정보 API URL
const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7692196&MLSV_YMD=${todayApiStr}`;

const mealInfoDiv = document.getElementById('meal-info');

// 급식 정보 불러오기
fetch(apiUrl)
  .then(res => res.text())
  .then(xmlText => {
    // XML 파싱
    const parser = new window.DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const rows = xml.getElementsByTagName('row');
    if (rows.length > 0) {
      // 학교 이름 추출
      const schoolName = rows[0].getElementsByTagName('SCHUL_NM')[0]?.textContent || '';
      if (schoolName) {
        let schoolNameElem = document.getElementById('school-name');
        if (!schoolNameElem) {
          schoolNameElem = document.createElement('h2');
          schoolNameElem.id = 'school-name';
          schoolNameElem.style.color = '#1976d2';
          schoolNameElem.style.fontWeight = '700';
          schoolNameElem.style.margin = '0 0 10px 0';
          const container = document.querySelector('.container');
          container.insertBefore(schoolNameElem, dateDiv);
        }
        schoolNameElem.textContent = schoolName;
      }
      // 급식 정보 추출
      const dish = rows[0].getElementsByTagName('DDISH_NM')[0]?.textContent || '';
      // 특수문자 및 <br/> 처리
      const prettyDish = dish
        .replace(/<br\/?\s*>/gi, '\n') // <br>을 줄바꿈으로
        .replace(/\s*\d+\.?/g, '') // 숫자 제거
        .replace(/\([^)]*\)/g, '') // 괄호 제거
        .trim();
      mealInfoDiv.textContent = '';
      // 줄바꿈 기준으로 분리해서 각각 줄로 표시
      prettyDish.split(/\n|\r/).forEach(line => {
        if (line.trim()) {
          const div = document.createElement('div');
          div.textContent = line.trim();
          mealInfoDiv.appendChild(div);
        }
      });
    } else {
      mealInfoDiv.textContent = '오늘은 급식 정보가 없습니다.';
    }
  })
  .catch(() => {
    mealInfoDiv.textContent = '급식 정보를 불러오지 못했습니다.';
  });

// 마우스 이동 시 음식 이모지 잔상 효과
const foodEmojis = ['🍕','🍎','🥩','🍰','🥗','🥟','🥦'];
let emojiIndex = 0;

function showFoodEmoji(x, y) {
  const emoji = document.createElement('div');
  emoji.textContent = foodEmojis[emojiIndex];
  emojiIndex = (emojiIndex + 1) % foodEmojis.length;
  emoji.className = 'emoji-trail';
  emoji.style.left = x + 'px';
  emoji.style.top = y + 'px';
  document.body.appendChild(emoji);
  setTimeout(() => {
    emoji.style.opacity = '0';
    emoji.style.transform = 'translate(-50%, -50%) scale(1.7)';
  }, 10);
  setTimeout(() => {
    emoji.remove();
  }, 700);
}

window.addEventListener('mousemove', function(e) {
  showFoodEmoji(e.clientX, e.clientY);
});

window.addEventListener('touchmove', function(e) {
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    showFoodEmoji(touch.clientX, touch.clientY);
  }
}, {passive: true});
