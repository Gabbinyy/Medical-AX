# Handover AX

`Handover AX` - EMR 차트의 변경사항(Diff)을 SBAR 구조로 자동 파싱하여 간호사 교대 인계 시간을 단축하는 웹 솔루션

---

## 해결하고자 한 문제 (Problem)
기존 병동 인계 프로세스는 EMR 수동 조회와 구두 인계로 인해 비효율이 발생하고 환자 안전을 위협합니다. 구체적인 현장 문제는 다음과 같습니다.
* **교대 시 EMR 수기 정리 및 확인으로 인한 초과 근무 발생:** 근무 교대 전후로 환자 데이터 변동내역을 손으로 정리하고 교차 검증하는 과정에서 매일 불필요한 연장 근무가 발생합니다.
* **구두/노트 인계 시 금식(NPO) 및 처방 변경사항 누락 리스크:** 수기 노트나 구두 전달에 의존할 경우, 갑작스러운 NPO 지시나 긴급 투약 처방 등의 주요 변동사항이 누락될 위험이 큽니다.
* **비간호 행정 작업 과중으로 인한 업무 피로도 증가:** 단순 데이터 취합 및 인계서 작성과 같은 행정업무의 비중이 높아 실제 환자 간호에 집중할 수 있는 시간과 에너지가 손실됩니다.

---

## 핵심 기능 (Key Features)
EMR 데이터의 파싱 및 상태 관리를 자동화하여 인수인계의 정확도와 속도를 높입니다.
* **SBAR 1초 파싱:** EMR 변동 데이터를 상황(Situation), 배경(Background), 평가(Assessment), 권고(Recommendation) 형태로 구조화하여 즉시 표출합니다.
* **구역/날짜별 스위칭:** 병동(301병동, ICU, ER) 및 캘린더 날짜 선택에 따라 해당 시점의 인계 이력을 동적으로 로드합니다.
* **인계 안전 체크리스트:** NPO(금식), 라인 점검 등 간호 필수 수칙의 이행 상태를 체크하며 업무 누락을 예방합니다.
* **실시간 메모 & 상태 업데이트:** 환자별 특이사항을 실시간으로 메모에 추가하고, 1-Click으로 인계 완료 여부를 배지로 갱신합니다.

---

## 기술 스택 (Tech Stack)
웹 표준 준수와 효율적인 상태 관리를 고려하여 다음 기술을 적용했습니다.
* **Framework:** React / Next.js
* **Styling:** Tailwind CSS (Pure White Light Theme)
* **Icons:** Lucide-react
* **State:** React State / Hooks

---

## 실행 방법 (Quick Start)
아래 명령어를 사용하여 로컬 개발 환경에서 프로젝트를 실행할 수 있습니다.
```bash
# Repository Clone
git clone https://github.com/username/handover-ax.git
cd handover-ax

# Dependencies Install
npm install

# Run Project
npm run dev
```
