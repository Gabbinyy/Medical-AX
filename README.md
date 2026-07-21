# 🏥 Handover AX (지능형 간호 인계 에이전트)

> **"EMR 기반 AI 1초 요약으로 간호사의 인수인계 업무를 혁신하는 AX 솔루션"**
> 
> 본 프로젝트는 간호사의 무임금 초과근무 및 사직의 주원인인 '교대 인수인계 서류 작성 및 수기 인계' 문제를 해결하기 위해 고안되었습니다. EMR 변동 데이터를 AI가 분석하여 대학병원 표준 **SBAR(상황-배경-평가-권고)** 보고 서식으로 즉시 요약해 주는 간호 전용 웹 플랫폼입니다.

<br />

---

## 1️⃣ 프로젝트 개요 (Overview)

* **기획 배경:**
  - 간호사들은 매 교대 시각마다 EMR의 수많은 데이터 변동사항을 수동으로 파악하고, 구두 인계장을 작성하는 데 하루 평균 1~2시간 이상의 무임금 초과근무를 수행하고 있습니다.
  - 본 솔루션은 이러한 업무 병목을 제거하고, 환자 안전을 극대화하기 위해 정보의 누락 없는 지능형 인계 환경을 제공합니다.

* **핵심 기능:**
  - ⚡ **SBAR 1초 자동 요약:** 당일 EMR 변동사항(Diff) 분석 및 병원 표준 문장 즉시 출력
  - 📅 **구역 및 날짜별 이력 관리:** 병동(301병동, 302병동 등) 및 미니 캘린더 연동을 통한 날짜별 인계 기록 실시간 조회
  - ⚠️ **투약/검사 사고 방지 체크리스트:** 금식(NPO), 라인 점검 등 간호사 필수 이행 오더 관리 및 체크 기능
  - 📝 **현장 메모 & 일괄 인계 완료:** 간호사 특이사항 실시간 반영 및 간호 서명(인계 완료) 시각화 기능
  - 🔄 **Firebase Firestore 실시간 연동:** 여러 명의 간호사가 동시에 접속하더라도 실시간 동기화 지원 (Firebase 미연결 시 로컬 메모리 모드로 즉시 하이브리드 구동)

<br />

---

## 2️⃣ 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 상세 설명 |
| :--- | :--- | :--- |
| **Front-End** | **React 18** | CDN 및 Babel Standalone을 활용한 경량 SPA 구조 |
| **Styling** | **Vanilla CSS3** | 프리미엄 다크 테마 & 메디컬 화이트 테마 지원, Glassmorphism UI |
| **Icons** | **Font Awesome v6.4.0** | 직관적인 인포그래픽 요소를 위한 벡터 아이콘 라이브러리 |
| **Backend / DB** | **Firebase Firestore** | 실시간 양방향 데이터 동기화 및 오프라인 하이브리드 연동 |
| **Environment** | **Node.js (v18 이상)** | 외부 의존성(Dependency)이 없는 경량 Node Web Server 구성 |

> [!NOTE]
> 본 프로젝트는 심사위원의 로컬 환경 검증 편의성을 위해 **Zero-dependency 정적 웹 서버(server.js)**를 기본 내장하고 있습니다. 외부 npm 모듈 설치나 네트워크 상태와 무관하게 로컬에서 즉시 구동됩니다.

<br />

---

## 3️⃣ 실행 방법 (Getting Started)

심사위원 및 평가자가 로컬 환경에서 즉시 구동해볼 수 있도록 아래와 같이 안내합니다.

### Prerequisites
- [Node.js](https://nodejs.org/) v18 이상 설치 권장

### Installation & Run

```bash
# 1. 저장소 클론 (Repository Clone)
git clone https://github.com/your-username/handover-ax.git
cd handover-ax

# 2. 의존성 패키지 설치 (Install Dependencies)
# (Zero-dependency로 구성되어 즉시 준비가 완료됩니다.)
npm install

# 3. 로컬 개발 서버 실행 (Run Local Server)
npm run dev
# 또는
npm start
```

* 실행 후 터미널에 출력되는 로컬 주소([http://localhost:3000](http://localhost:3000))로 브라우저에서 접속하시면 즉시 웹 애플리케이션을 체험하실 수 있습니다.

<br />

---

## 4️⃣ 프로젝트 주요 화면 및 특징

1. **지능형 SBAR 대시보드:** 환자 선택 시 상황(Situation), 배경(Background), 평가(Assessment) 및 체크리스트가 동적으로 렌더링됩니다.
2. **실시간 환자 상태 표시 및 완료 처리:** 완료 여부가 실시간 체크 및 흐림(Dim) 효과로 시각화되어 교대 시 혼선을 방지합니다.
3. **메디컬 스타일의 UI/UX:** 야간 근무(Night Shift)와 주간 근무(Day Shift) 시의 환경을 고려한 인체공학적 다크 테마 스타일링이 적용되어 있습니다.
