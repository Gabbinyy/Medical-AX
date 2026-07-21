/* -------------------------------------------------------------
 * Handover AX React Application (Firebase Firestore Real-time Sync Edition)
 * Optimized for SBAR, dynamic date switching, and multi-user sync.
 * ------------------------------------------------------------- */

const { useState, useMemo, useEffect } = React;

// --- 1. Google Firebase Configuration ---
// TODO: Firebase Console -> Project Settings -> General -> Web Apps 에서 발급받은 키로 교체하십시오!
const firebaseConfig = {
  apiKey: "AIzaSyA-7fZqsJcBpQWM5cV5syvver-qRLcHscY",
  authDomain: "my-hospital-ai-20260721.firebaseapp.com",
  projectId: "my-hospital-ai-20260721",
  storageBucket: "my-hospital-ai-20260721.firebasestorage.app",
  messagingSenderId: "80886429588",
  appId: "1:80886429588:web:dcbc656e139eb6b7eb0181",
  measurementId: "G-1NDD9FJEPX"
};

// Initialize Firebase with hybrid offline-resilience
let db = null;
let isFirebaseActive = false;

if (typeof firebase !== "undefined" && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "GCP_API_KEY") {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseActive = true;
    console.log("🔥 Firebase Firestore connected successfully.");
  } catch (err) {
    console.warn("Firebase initialization failed. Falling back to local offline memory mode.", err);
  }
} else {
  console.log("ℹ️ No Firebase API key configured. Running in Local Memory Mode.");
}

// Initial Mock Seed Data (Added dedicated memos lists)
const initialMockData = {
  "301병동": [
    {
      id: "p1_301",
      ward: "301병동",
      room: "302호",
      name: "김철수",
      ageGender: "남 / 58세",
      patientId: "PT-98042",
      diagnosis: "충수절제술 Post-op D+2",
      isHighRisk: true,
      isCompleted: false,
      tags: ["발열 주의", "금식(NPO)"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "충수절제술 Post-op D+2 상태로, 14:00 체온 38.2℃ 상승했으나 해열제 투약 후 37.3℃로 하강 및 안정화됨.",
            background: "복통으로 입원 후 수술 진행. 기존 Cefazolin 항생제 발진 부작용으로 Tazoperan(B제제)으로 변경 주입 중.",
            assessment: "내일 아침 복부 초음파 검사 예정. 오늘 자정(00:00)부터 금식(NPO) 유지 필수."
          },
          checklist: [
            { id: "c1_1", text: "오늘 자정(00:00) 금식(NPO) 안내 및 식판 회수 확인", checked: false },
            { id: "c1_2", text: "변경된 항생제 B제재(Tazoperan) 부작용 반응 관찰", checked: false }
          ],
          safetyQuestion: "김철수 환자는 내일 오전 09시 복부 초음파 검사가 예정되어 있습니다. 다음 교대자에게 '오늘 자정(00:00) NPO(금식)' 지침을 명확히 전달하셨습니까?",
          memos: [] // Dedicated memos array
        }
      }
    },
    {
      id: "p2_301",
      ward: "301병동",
      room: "308호",
      name: "이민우",
      ageGender: "남 / 45세",
      patientId: "PT-48201",
      diagnosis: "급성 췌장염 (Acute Pancreatitis)",
      isHighRisk: false,
      isCompleted: false,
      tags: ["금식(NPO)"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "췌장염 보존적 치료 금식 3일차로 명치 부위 통증 완화 상태임 (VAS 1점).",
            background: "과음 이력으로 급성 췌장염 재발하여 내과 입원 치료 진행 중.",
            assessment: "철저한 물 포함 NPO 금식 유지 필요 및 I&O 시간별 모니터링 요망."
          },
          checklist: [
            { id: "c2_1", text: "오늘 자정(00:00) 금식(NPO) 안내 확인", checked: false },
            { id: "c2_2", text: "수액 공급 개통성 및 속도 유지 점검", checked: false }
          ],
          safetyQuestion: "이민우 환자는 NPO 금식 상태입니다. 다음 교대자에게 '경구 복용 통제'를 인계하셨습니까?",
          memos: []
        }
      }
    }
  ],
  "302병동": [
    {
      id: "p1_302",
      ward: "302병동",
      room: "303호",
      name: "박영희",
      ageGender: "여 / 72세",
      patientId: "PT-10394",
      diagnosis: "대퇴골두 무혈성 괴사 (Post-op D+1)",
      isHighRisk: true,
      isCompleted: false,
      tags: ["낙상 고위험", "배뇨 장애"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "고관절 전치환 수술 Post-op D+1 상태로 수술 환부 통증 심하며(VAS 6점), 자가 배뇨 저류 발생함.",
            background: "골다공증 및 만성 관절염 병력 고령 환자로 낙상 위험도 매우 높음.",
            assessment: "Nelaton 카테터 인공 도뇨 진행하여 잔뇨 450cc 제거 완료. 낙상 방지 위해 사이드 레일 체결 필수."
          },
          checklist: [
            { id: "c3_1", text: "수술 침상 사이드레일 고정 상태 확인", checked: false },
            { id: "c3_2", text: "인공 도뇨(Nelaton) 후 잔뇨 배출량 점검", checked: false }
          ],
          safetyQuestion: "박영희 환자는 수술 1일차 낙상 고위험 상태입니다. 다음 교대자에게 '침대 난간 상시 고정' 수칙을 인계하셨습니까?",
          memos: []
        }
      }
    },
    {
      id: "p2_302",
      ward: "302병동",
      room: "305호",
      name: "최정숙",
      ageGender: "여 / 63세",
      patientId: "PT-77293",
      diagnosis: "요로감염증 (Urinary Tract Infection)",
      isHighRisk: false,
      isCompleted: false,
      tags: ["처방 변경", "수분 권장"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "요로감염 항생제 처방 치료 2일차로 미열 소실되었으며 소변 배출 시 찌릿함 다소 완화됨.",
            background: "당뇨 기저 환자로 소변 혼탁도 상승에 따른 균배양 확인 후 입원 조치됨.",
            assessment: "소변 내 대장균 검출로 Cefaclor 경구 교체 투약 개시. 일 수분 섭취 2.0L 이상 장려 요망."
          },
          checklist: [
            { id: "c4_1", text: "변경된 신규 경구 항생제 복용 지도 완료", checked: false },
            { id: "c4_2", text: "충분한 수분 섭취량 유도 및 I/O 체크", checked: false }
          ],
          safetyQuestion: "최정숙 환자는 E. coli 미감 항생제로 처방 변경되었습니다. 다음 교대자에게 '신규 경구약 투약 지도'를 인계하셨습니까?",
          memos: []
        }
      }
    }
  ],
  "중환자실(ICU)": [
    {
      id: "p1_icu",
      ward: "중환자실(ICU)",
      room: "ICU-01",
      name: "정태성",
      ageGender: "남 / 67세",
      patientId: "PT-22941",
      diagnosis: "패혈성 쇼크 (Septic Shock) / 인공호흡기 유지",
      isHighRisk: true,
      isCompleted: false,
      tags: ["승압제 투여", "호흡기 유지"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "패혈성 쇼크 치료 중으로 기계환기 CMV 모드 적용 및 Norepinephrine 승압 제재 조절 중.",
            background: "COPD 기저 환자로 폐렴 악화되어 중환자실 긴급 전실 및 동맥관 침습 삽입 완료됨.",
            assessment: "체온 38.5℃ 고열로 얼음 주머니 마사지 적용 중. 승압 주입 라인 혈관 침윤 여부 매시간 감시 바람."
          },
          checklist: [
            { id: "c5_1", text: "Norepinephrine 주입 속도 및 라인 개통성 점검", checked: false },
            { id: "c5_2", text: "인공호흡기 호스 고정 상태 및 FiO2 수치 확인", checked: false }
          ],
          safetyQuestion: "정태성 환자는 Norepinephrine 고용량 유지 중입니다. 다음 근무자에게 '승압제 주입부 괴사 방지 모니터링' 지침을 확실히 인계하셨습니까?",
          memos: []
        }
      }
    },
    {
      id: "p2_icu",
      ward: "중환자실(ICU)",
      room: "ICU-02",
      name: "한경희",
      ageGender: "여 / 54세",
      patientId: "PT-55392",
      diagnosis: "지주막하 출혈 (SAH) / EVD 거치 중",
      isHighRisk: true,
      isCompleted: false,
      tags: ["EVD 관리", "뇌압 상승 주의"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "뇌지주막하 출혈(SAH) 코일색전술 후 상태로 EVD 배액관 Chamber Tragus 상방 10cm 거치 중.",
            background: "가정 내 두통 및 의식 혼탁 주소로 내원하여 응급 EVD 거치 진행됨.",
            assessment: "의식 수준 명료하나 경미한 두통 호소. 체위 변경 시 반드시 EVD 벨브 잠금 절차 준수 요망."
          },
          checklist: [
            { id: "c5_3", text: "EVD Chamber 고정 높이 Tragus 상방 10cm 확인", checked: false },
            { id: "c5_4", text: "체위 변경 시 EVD 라인 잠금(Clamping) 절차 준수", checked: false }
          ],
          safetyQuestion: "한경희 환자는 EVD 배액 중입니다. 다음 교대자에게 '체위 변경 시 EVD 라인 클램핑 절차'를 인계하셨습니까?",
          memos: []
        }
      }
    }
  ],
  "응급실(ER)": [
    {
      id: "p1_er",
      ward: "응급실(ER)",
      room: "ER-01",
      name: "강동현",
      ageGender: "남 / 51세",
      patientId: "PT-33041",
      diagnosis: "급성 심근경색 의증 (r/o Acute MI)",
      isHighRisk: true,
      isCompleted: false,
      tags: ["흉통 호소", "심전도 모니터"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "흉골 하부 조여드는 격심한 방사 흉통(VAS 7점) 주소로 Troponin-I 양성 확인되어 응급 CAG 조영 대기 중.",
            background: "고지혈증 약 복용 중인 흡연자로 방사성 흉통 호소하여 119 통해 내원함.",
            assessment: "산소 2L 비강 캐뉼라 투여 중이며 듀얼 아스피린/플라빅스 경구 부하 공급 완료. continuous ECG 감시 바람."
          },
          checklist: [
            { id: "c6_1", text: "심혈관 조영술(CAG) 사전 동의서 서명 확인", checked: false },
            { id: "c6_2", text: "지속적인 ECG 모니터 리듬 부정맥 알람 점검", checked: false }
          ],
          safetyQuestion: "강동현 환자는 심근경색 의증 상태입니다. 다음 교대자에게 '흉통 발생 시 NTG 설하정 추가 처치법'을 확실히 인계하셨습니까?",
          memos: []
        }
      }
    },
    {
      id: "p2_er",
      ward: "응급실(ER)",
      room: "ER-02",
      name: "윤서진",
      ageGender: "여 / 28세",
      patientId: "PT-11203",
      diagnosis: "다발성 교통사고 손상 (Multiple Trauma)",
      isHighRisk: true,
      isCompleted: false,
      tags: ["출혈 감시", "통증 관리"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: "교통사고 충돌 손상으로 골반 골절 및 복강 내 소량 출혈 관찰되어 중환자실 전실 대기 중.",
            background: "금일 11시 보행 중 차에 부딪히는 다발성 둔상 충격으로 ER 이송됨.",
            assessment: "복강 출혈 의심되어 FAST 초음파 추적 관찰 중. 수축기 혈압 90 이하 하강 시 수혈 오더 개시 요망."
          },
          checklist: [
            { id: "c6_3", text: "복부 팽만(Abdomen distension) 및 복통 추적", checked: false },
            { id: "c6_4", text: "소변 내 혈뇨 유무 및 배설 요량 체크", checked: false }
          ],
          safetyQuestion: "윤서진 환자는 골반 골절 동반 출혈 상태입니다. 다음 교대자에게 '수축기 혈압 하강 시 수혈 처치 절차'를 인계하셨습니까?",
          memos: []
        }
      }
    }
  ]
};

function App() {
  const [patientsMap, setPatientsMap] = useState(initialMockData);
  const [activeWard, setActiveWard] = useState("301병동");
  const [activeId, setActiveId] = useState("p1_301");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Date selection states
  const [selectedDate, setSelectedDate] = useState("2026-07-21");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Quick note text input
  const [noteInput, setNoteInput] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // SBAR editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editSituation, setEditSituation] = useState("");
  const [editBackground, setEditBackground] = useState("");
  const [editAssessment, setEditAssessment] = useState("");

  // Single Modal states
  const [transmission, setTransmission] = useState({ open: false, step: 0, logs: "대기 완료" });
  const [safetyCheckOpen, setSafetyCheckOpen] = useState(false);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    room: "",
    name: "",
    age: "",      // Numerical input age
    gender: "남", // Selectable gender
    diagnosis: "",
    isHighRisk: false
  });

  const [toasts, setToasts] = useState([]);

  // --- 2. Firebase Firestore Database Real-time Sync ---
  useEffect(() => {
    if (!isFirebaseActive || !db) return;

    const unsubscribe = db.collection("patients").onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ ...doc.data(), id: doc.id });
      });

      if (list.length === 0) {
        // If Firestore collection is empty, seed initial dataset
        Object.keys(initialMockData).forEach(wardName => {
          initialMockData[wardName].forEach(p => {
            db.collection("patients").doc(p.id).set(p);
          });
        });
      } else {
        // Group raw list back into Ward dictionary map
        const mapped = { "301병동": [], "302병동": [], "중환자실(ICU)": [], "응급실(ER)": [] };
        list.forEach(p => {
          if (mapped[p.ward]) {
            // Ensure memos array is initialised
            const formatted = {
              ...p,
              records: Object.keys(p.records).reduce((acc, dt) => {
                acc[dt] = {
                  ...p.records[dt],
                  memos: p.records[dt].memos || []
                };
                return acc;
              }, {})
            };
            mapped[p.ward].push(formatted);
          }
        });
        setPatientsMap(mapped);
      }
    }, (err) => {
      console.warn("Firestore subscription failed, running local sandbox:", err);
    });

    return () => unsubscribe();
  }, []);

  // --- 3. Ward Switch Safety Sync Block ---
  const currentWardPatients = useMemo(() => {
    return patientsMap[activeWard] || [];
  }, [patientsMap, activeWard]);

  // Synchronise Active Patient selection safely when activeWard changes to prevent rendering exceptions
  useEffect(() => {
    const list = patientsMap[activeWard] || [];
    if (list.length > 0) {
      const hasSelected = list.some(p => p.id === activeId);
      if (!hasSelected) {
        setActiveId(list[0].id);
      }
    } else {
      setActiveId(null);
    }
    setIsEditing(false);
  }, [activeWard]);

  const filteredPatients = useMemo(() => {
    return currentWardPatients.filter(p => {
      const matchesSearch = 
        p.name.includes(searchQuery) ||
        p.room.includes(searchQuery) ||
        p.diagnosis.includes(searchQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "urgent" && p.isHighRisk) ||
        (filter === "check" && !p.isCompleted);

      return matchesSearch && matchesFilter;
    });
  }, [currentWardPatients, searchQuery, filter]);

  const activePatient = useMemo(() => {
    return currentWardPatients.find(p => p.id === activeId) || null;
  }, [currentWardPatients, activeId]);

  // Read record details ONLY when selectedDate === "2026-07-21"
  const activeRecord = useMemo(() => {
    if (!activePatient) return null;
    if (selectedDate !== "2026-07-21") return null;
    const rec = activePatient.records["2026-07-21"] || null;
    if (rec && !rec.memos) {
      rec.memos = []; // Safeguard
    }
    return rec;
  }, [activePatient, selectedDate]);

  // Synchronise inline editors when selection changes
  useEffect(() => {
    if (activeRecord) {
      setEditSituation(activeRecord.sbar.situation || "");
      setEditBackground(activeRecord.sbar.background || "");
      setEditAssessment(activeRecord.sbar.assessment || "");
      setIsEditing(false);
    } else {
      setEditSituation("");
      setEditBackground("");
      setEditAssessment("");
      setIsEditing(false);
    }
  }, [activeId, selectedDate, activeRecord]);

  const stats = useMemo(() => {
    const total = currentWardPatients.length;
    const completed = currentWardPatients.filter(p => p.isCompleted).length;
    return `${completed} / ${total}명 완료`;
  }, [currentWardPatients]);

  const isChecklistComplete = useMemo(() => {
    if (!activeRecord) return false;
    return activeRecord.checklist.every(item => item.checked);
  }, [activeRecord]);

  const triggerToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  // --- Helper to update a Patient document either on Firebase or local memory ---
  const savePatientMutation = (updatedPatient) => {
    if (isFirebaseActive && db) {
      db.collection("patients").doc(updatedPatient.id).set(updatedPatient)
        .catch(err => console.error("Firebase save mutation error:", err));
    } else {
      setPatientsMap(prev => {
        const list = prev[activeWard].map(p => p.id === updatedPatient.id ? updatedPatient : p);
        return { ...prev, [activeWard]: list };
      });
    }
  };

  // --- 4. SBAR Local Inline Saving ---
  const handleSaveSbarChanges = () => {
    if (!activePatient || !activeRecord) return;
    
    const updatedPatient = {
      ...activePatient,
      records: {
        ...activePatient.records,
        "2026-07-21": {
          ...activePatient.records["2026-07-21"],
          sbar: {
            situation: editSituation,
            background: editBackground,
            assessment: editAssessment
          }
        }
      }
    };

    savePatientMutation(updatedPatient);
    setIsEditing(false);
    triggerToast("💾 SBAR 인계 사항 변경이 저장되었습니다.");
  };

  // --- 5. Checklist & Note Memo Addition (Appends to separate list array) ---
  const handleToggleChecklist = (itemId) => {
    if (!activeRecord) return;

    const currentRec = activePatient.records["2026-07-21"];
    const updatedPatient = {
      ...activePatient,
      records: {
        ...activePatient.records,
        "2026-07-21": {
          ...currentRec,
          checklist: currentRec.checklist.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      }
    };

    savePatientMutation(updatedPatient);
  };

  // Pushes note text into records.memos list
  const handleAppendMemoText = () => {
    if (!noteInput.trim() || !activePatient || !activeRecord) return;

    const currentRec = activePatient.records["2026-07-21"];
    const updatedMemos = [...(currentRec.memos || []), noteInput.trim()];

    const updatedPatient = {
      ...activePatient,
      records: {
        ...activePatient.records,
        "2026-07-21": {
          ...currentRec,
          memos: updatedMemos
        }
      }
    };

    savePatientMutation(updatedPatient);
    triggerToast(`✏️ 추가 현장 메모가 카드 하단에 한 줄 추가되었습니다.`);
    setNoteInput("");
  };

  // Deletes note text by index
  const handleDeleteMemo = (memoIdx) => {
    if (!activePatient || !activeRecord) return;

    const currentRec = activePatient.records["2026-07-21"];
    const updatedMemos = (currentRec.memos || []).filter((_, idx) => idx !== memoIdx);

    const updatedPatient = {
      ...activePatient,
      records: {
        ...activePatient.records,
        "2026-07-21": {
          ...currentRec,
          memos: updatedMemos
        }
      }
    };

    savePatientMutation(updatedPatient);
    triggerToast(`🗑️ 메모가 삭제되었습니다.`);
  };

  const handleConfirmHandover = () => {
    if (!activePatient || !activeRecord) return;
    if (isEditing) {
      alert("수정 중인 내용을 먼저 저장해주십시오.");
      return;
    }
    if (!isChecklistComplete) {
      triggerToast("⚠️ 체크리스트 항목을 전부 체크하십시오.");
      return;
    }
    setSafetyCheckOpen(true);
  };

  const handleBypassSafetyAndConfirm = () => {
    setSafetyCheckOpen(false);

    setTransmission({
      open: true,
      step: 1,
      logs: "EMR 동기화 암호 패킷 빌드 중..."
    });

    setTimeout(() => {
      setTransmission({
        open: true,
        step: 2,
        logs: "원내 EMR 연동 완료!"
      });
      
      setTimeout(() => {
        setTransmission(prev => ({ ...prev, open: false }));
        
        const updatedPatient = {
          ...activePatient,
          isCompleted: true
        };

        savePatientMutation(updatedPatient);
        alert(`${activePatient.name} 환자의 인계가 완료되었습니다.`);
      }, 1000);
    }, 1000);
  };

  // --- 6. Patient CRUD: Add / Delete ---
  const handleDischargePatient = (pToDischarge) => {
    if (!pToDischarge) return;
    const accept = window.confirm(`[환자 퇴원/전과 처리]\n\n${pToDischarge.room} ${pToDischarge.name} 환자를 목록에서 제외하시겠습니까?`);
    if (!accept) return;

    if (isFirebaseActive && db) {
      db.collection("patients").doc(pToDischarge.id).delete()
        .then(() => triggerToast(`🏥 ${pToDischarge.name} 환자가 퇴원 처리되었습니다.`))
        .catch(err => console.error("Firebase deletion failed:", err));
    } else {
      setPatientsMap(prev => {
        const updatedList = prev[activeWard].filter(p => p.id !== pToDischarge.id);
        return { ...prev, [activeWard]: updatedList };
      });
      triggerToast(`🏥 ${pToDischarge.name} 환자가 퇴원 처리되었습니다.`);
    }
  };

  const handleCreatePatientSubmit = (e) => {
    e.preventDefault();
    if (!newPatientForm.room || !newPatientForm.name || !newPatientForm.diagnosis || !newPatientForm.age) {
      alert("항목을 채워주세요.");
      return;
    }

    const newId = "p_added_" + Date.now();
    const newObj = {
      id: newId,
      ward: activeWard,
      room: newPatientForm.room.includes("호") || newPatientForm.room.includes("ICU") || newPatientForm.room.includes("ER") ? newPatientForm.room : `${newPatientForm.room}호`,
      name: newPatientForm.name,
      ageGender: `${newPatientForm.gender} / ${newPatientForm.age}세`,
      patientId: "PT-" + Math.floor(10000 + Math.random() * 90000),
      diagnosis: newPatientForm.diagnosis,
      isHighRisk: newPatientForm.isHighRisk,
      isCompleted: false,
      tags: newPatientForm.isHighRisk ? ["긴급 주의", "신규"] : ["확인 필요", "신규"],
      records: {
        "2026-07-21": {
          sbar: {
            situation: `신규 입원 등록 완료. 진단명: ${newPatientForm.diagnosis}`,
            background: `자가 보행 입원. 과거력 검토 및 초기 감사 동의서 준비 중.`,
            assessment: `초기 수치 안정적. 병실 환경 및 낙상 예방 규칙 설명 수행 완료.`
          },
          checklist: [
            { id: `c_add_${Date.now()}_1`, text: "오늘 자정(00:00) 금식(NPO) 안내 확인", checked: false },
            { id: `c_add_${Date.now()}_2`, text: "수술 침상 사이드레일 고정 상태 확인", checked: false }
          ],
          safetyQuestion: `${newPatientForm.name} 환자는 오늘 신규 입원하였습니다. 안전 낙상 예지 지도를 교육하셨습니까?`,
          memos: [] // Empty memos array
        }
      }
    };

    if (isFirebaseActive && db) {
      db.collection("patients").doc(newId).set(newObj)
        .then(() => {
          setNewPatientModalOpen(false);
          setNewPatientForm({ room: "", name: "", age: "", gender: "남", diagnosis: "", isHighRisk: false });
          setActiveId(newId);
          triggerToast(`🎉 신규 환자 ${newPatientForm.name}님이 추가되었습니다.`);
        })
        .catch(err => console.error("Firebase write error:", err));
    } else {
      setPatientsMap(prev => {
        const list = prev[activeWard] || [];
        return { ...prev, [activeWard]: [...list, newObj] };
      });
      setNewPatientModalOpen(false);
      setNewPatientForm({ room: "", name: "", age: "", gender: "남", diagnosis: "", isHighRisk: false });
      setActiveId(newId);
      triggerToast(`🎉 신규 환자 ${newPatientForm.name}님이 추가되었습니다.`);
    }
  };

  // --- 7. Date Blank Blueprint Creator ---
  const handleCreateEmptyRecord = () => {
    if (!activePatient) return;
    const emptyBlueprint = {
      sbar: {
        situation: "",
        background: "",
        assessment: ""
      },
      checklist: [
        { id: `c_emp_${Date.now()}_1`, text: "오늘 자정(00:00) 금식(NPO) 안내 확인", checked: false },
        { id: `c_emp_${Date.now()}_2`, text: "수술 침상 사이드레일 고정 상태 확인", checked: false }
      ],
      safetyQuestion: `${activePatient.name} 환자 지정 날짜(${selectedDate}) 인계입니다. 변동 오더 확인을 완료하셨습니까?`,
      memos: [] // Empty memos array
    };

    const updatedPatient = {
      ...activePatient,
      records: {
        ...activePatient.records,
        "2026-07-21": emptyBlueprint
      }
    };

    savePatientMutation(updatedPatient);
    setSelectedDate("2026-07-21");
    setEditSituation("");
    setEditBackground("");
    setEditAssessment("");
    setIsEditing(true);
    triggerToast(`📅 ${selectedDate} 날짜에 새 인계 작성 양식이 초기화되었습니다.`);
  };

  // Mini Calendar date collections helper
  const daysInJuly2026 = useMemo(() => {
    const days = [];
    for (let i = 0; i < 3; i++) days.push({ day: null, dateStr: null });
    for (let d = 1; d <= 31; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      days.push({ day: d, dateStr: `2026-07-${dayStr}` });
    }
    return days;
  }, []);

  const getDayOfWeek = (dateString) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  useEffect(() => {
    const closeAll = () => {
      setActiveDropdown(null);
      setDatePickerOpen(false);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  return (
    <div className="app-container">
      {/* 1. Minimal Header */}
      <header className="main-header" onClick={e => e.stopPropagation()}>
        <div className="header-left">
          <div className="logo-area">
            <i className="fa-solid fa-house-medical logo-icon"></i>
            <h1>Handover <span>AX</span></h1>
          </div>
          
          <div className="status-badges">
            {/* Ward dropdown */}
            <div className="badge-interactive" onClick={() => setActiveDropdown(activeDropdown === 'ward' ? null : 'ward')}>
              <span>📍 {activeWard} ∨</span>
              {activeDropdown === 'ward' && (
                <div className="dropdown-menu">
                  {["301병동", "302병동", "중환자실(ICU)", "응급실(ER)"].map(w => (
                    <button 
                      key={w} 
                      className={`dropdown-item ${activeWard === w ? 'active' : ''}`}
                      onClick={() => { setActiveWard(w); setActiveDropdown(null); }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{fontSize: '13px', color: '#cbd5e1', fontWeight: 300}}>|</div>
            <div className="nurse-name-lbl">Day 근무 (김지혜 간호사)</div>
          </div>
        </div>

        <div className="header-right">
          <span className="stat-pill">{stats}</span>
        </div>
      </header>

      {/* 2. Main Content Layout */}
      <main className="main-content">
        {/* Left Column Patient List */}
        <section className="left-column">
          <div className="panel-header">
            <div className="panel-header-title-row">
              <h2>담당 환자</h2>
              <button className="btn btn-primary-outline" onClick={() => setNewPatientModalOpen(true)}>
                + 신규 환자 등록
              </button>
            </div>
            
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input 
                type="text" 
                placeholder="검색(이름, 병실)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="patient-list">
            {filteredPatients.map(p => {
              const isCompleted = p.isCompleted;
              const hasData = selectedDate === "2026-07-21" ? !!p.records["2026-07-21"] : !!p.records[selectedDate];

              return (
                <div 
                  key={p.id}
                  className={`patient-card ${activeId === p.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className="card-top">
                    <span className="card-room-lbl">{p.room}</span>
                    <span className="card-name-lbl">
                      {p.name}
                      {isCompleted && <span style={{marginLeft: '6px', fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold'}}>[완료]</span>}
                    </span>
                    <span style={{fontSize: '11px', color: '#9ca3af'}}>{p.ageGender.split(" / ")[0]}</span>
                  </div>
                  <div className="card-desc">{p.diagnosis}</div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                    <div className="card-bottom-tags">
                      {p.isHighRisk && <span className="tag-minimal tag-red">주의</span>}
                      {hasData && <span className="tag-minimal tag-green" style={{background: 'rgba(37,99,235,0.04)', color: 'var(--accent-blue)'}}>기록</span>}
                      {isCompleted && <span className="tag-minimal tag-green">완료</span>}
                    </div>

                    <button 
                      className="card-trash-btn"
                      onClick={(e) => { e.stopPropagation(); handleDischargePatient(p); }}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column details (3-Section Structure) */}
        <section className="right-column" id="detail-panel" onClick={e => e.stopPropagation()}>
          {!activePatient ? (
            <div style={{textAlign: 'center', margin: 'auto', color: 'var(--text-muted)'}}>
              <p>환자를 선택해주십시오.</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              
              {/* [Section 1] Patient Info & Date Picker (Top) */}
              <div className="block-info-header">
                <div className="info-header-left">
                  <span className="info-header-room">{activePatient.room}</span>
                  <span className="info-header-name">{activePatient.name}</span>
                  <span className="info-header-gender">({activePatient.ageGender})</span>
                  <span className="info-header-diag">| {activePatient.diagnosis}</span>
                </div>

                <div className="info-header-right">
                  {/* Calendar Widget Date Picker */}
                  <div className="calendar-widget-wrapper">
                    <button 
                      className="calendar-picker-btn"
                      onClick={() => setDatePickerOpen(!datePickerOpen)}
                    >
                      <i className="fa-solid fa-calendar" style={{color: 'var(--accent-blue)'}}></i>
                      <span>{selectedDate.replace(/-/g, ".")} ∨</span>
                    </button>

                    {datePickerOpen && (
                      <div className="mini-calendar-popup">
                        <div style={{fontSize: '11px', fontWeight: '800', textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '6px'}}>
                          2026.07
                        </div>
                        <div className="calendar-grid">
                          {['일', '월', '화', '수', '목', '금', '토'].map(lbl => (
                            <span key={lbl} className="calendar-day-lbl">{lbl}</span>
                          ))}
                          {daysInJuly2026.map((item, idx) => {
                            if (!item.day) {
                              return <span key={`empty_${idx}`} className="calendar-day-cell empty-cell"></span>;
                            }
                            const isSelected = selectedDate === item.dateStr;
                            const hasRecord = item.dateStr === "2026-07-21" ? !!activePatient.records["2026-07-21"] : !!activePatient.records[item.dateStr];

                            return (
                              <span 
                                key={item.dateStr}
                                className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${hasRecord ? 'has-data' : ''}`}
                                onClick={() => {
                                  setSelectedDate(item.dateStr);
                                  setDatePickerOpen(false);
                                }}
                              >
                                {item.day}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="btn btn-secondary" style={{padding: '5px 8px'}} onClick={() => window.print()}>
                    <i className="fa-solid fa-print"></i>
                  </button>

                  <button 
                    className="btn btn-danger" 
                    style={{padding: '5px 10px'}} 
                    onClick={() => handleDischargePatient(activePatient)}
                  >
                    <i className="fa-solid fa-trash"></i> 퇴원/전과 처리
                  </button>
                </div>
              </div>

              {/* Core SBAR Card or date empty state conditional rendering */}
              {selectedDate !== "2026-07-21" ? (
                /* Date Empty State - Triggers when date is not today */
                <div className="date-empty-state">
                  <p>선택하신 날짜({selectedDate})에 등록된 인계 데이터가 없습니다.</p>
                  <button className="btn btn-primary" onClick={handleCreateEmptyRecord}>
                    + 새 인계 작성하기
                  </button>
                </div>
              ) : !activeRecord ? (
                /* Empty Fallback for Today if missing */
                <div className="date-empty-state">
                  <p>해당 날짜에 등록된 인계 내역이 없습니다.</p>
                  <button className="btn btn-primary" onClick={handleCreateEmptyRecord}>
                    + 새 인계 작성
                  </button>
                </div>
              ) : (
                <React.Fragment>
                  {/* [Section 2] AI SBAR 3-Line Summary Card & Editors (Middle) */}
                  <div className="block-sbar-summary">
                    <div className="sbar-minimal-card">
                      
                      {/* SBAR Header with Edit/Save button */}
                      <div className="sbar-edit-header-row">
                        <span>AI 1초 핵심 SBAR 인계 요약</span>
                        {isEditing ? (
                          <button 
                            className="btn btn-primary" 
                            style={{padding: '2px 8px', fontSize: '11px', borderRadius: '4px'}}
                            onClick={handleSaveSbarChanges}
                          >
                            <i className="fa-solid fa-floppy-disk"></i> 저장
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary" 
                            style={{padding: '2px 8px', fontSize: '11px', borderRadius: '4px'}}
                            onClick={() => setIsEditing(true)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> 수정
                          </button>
                        )}
                      </div>

                      {/* Situation Segment */}
                      <div className="sbar-minimal-row">
                        <span className="sbar-minimal-lbl" style={{color: 'var(--accent-blue)'}}>상황 / 경과 (Situation)</span>
                        {isEditing ? (
                          <textarea 
                            className="sbar-textarea-editor"
                            placeholder="상황을 적어주십시오..."
                            value={editSituation}
                            onChange={e => setEditSituation(e.target.value)}
                          />
                        ) : (
                          <p className="sbar-minimal-txt">
                            {activeRecord.sbar.situation || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>상황 내용이 비어있습니다.</span>}
                          </p>
                        )}
                      </div>
                      
                      <div style={{height: '1px', background: '#e5e7eb', margin: '4px 0'}}></div>

                      {/* Background Segment */}
                      <div className="sbar-minimal-row">
                        <span className="sbar-minimal-lbl" style={{color: 'var(--accent-green)'}}>배경 / 내역 (Background)</span>
                        {isEditing ? (
                          <textarea 
                            className="sbar-textarea-editor"
                            placeholder="배경을 적어주십시오..."
                            value={editBackground}
                            onChange={e => setEditBackground(e.target.value)}
                          />
                        ) : (
                          <p className="sbar-minimal-txt">
                            {activeRecord.sbar.background || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>배경 내용이 비어있습니다.</span>}
                          </p>
                        )}
                      </div>

                      <div style={{height: '1px', background: '#e5e7eb', margin: '4px 0'}}></div>

                      {/* Assessment / Recommendation Segment */}
                      <div className="sbar-minimal-row">
                        <span className="sbar-minimal-lbl" style={{color: 'var(--accent-danger)'}}>평가 및 권고 (Assessment & Recommendation)</span>
                        {isEditing ? (
                          <textarea 
                            className="sbar-textarea-editor"
                            placeholder="주의사항 및 권고를 적어주십시오..."
                            value={editAssessment}
                            onChange={e => setEditAssessment(e.target.value)}
                          />
                        ) : (
                          <p className="sbar-minimal-txt">
                            {activeRecord.sbar.assessment || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>권고 내용이 비어있습니다.</span>}
                          </p>
                        )}
                      </div>

                      {/* New Dedicated Real-time Memo List Output block inside SBAR card */}
                      {activeRecord.memos && activeRecord.memos.length > 0 && (
                        <div style={{ marginTop: '16px', borderTop: '1.5px dashed #cbd5e1', paddingTop: '14px' }}>
                          <span className="sbar-minimal-lbl" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            ✍️ 추가 현장 메모
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {activeRecord.memos.map((memo, mIdx) => (
                              <div 
                                key={mIdx} 
                                style={{ 
                                  fontSize: '13px', 
                                  color: 'var(--text-main)', 
                                  fontWeight: '600', 
                                  padding: '6px 10px', 
                                  background: '#f9fafb', 
                                  borderRadius: '6px',
                                  borderLeft: '3.5px solid var(--accent-blue)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  border: '1px solid #cbd5e1',
                                  borderLeftWidth: '3.5px'
                                }}
                              >
                                <span>{memo}</span>
                                <button 
                                  onClick={() => handleDeleteMemo(mIdx)}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--accent-danger)', 
                                    cursor: 'pointer', 
                                    fontSize: '11px',
                                    fontWeight: '800'
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* [Section 3] Checklist & Quick Note Memo & Submit (Bottom) */}
                  <div className="block-actions-bottom">
                    {/* Checklist Column */}
                    <div className="bottom-checklist-col">
                      <h3>필수 체크리스트</h3>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px'}}>
                        {activeRecord.checklist.map(item => (
                          <div 
                            key={item.id}
                            className={`chk-minimal-item ${item.checked ? 'checked' : ''}`}
                            onClick={() => handleToggleChecklist(item.id)}
                          >
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => {}}
                            />
                            <span className="chk-minimal-lbl">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Note & Submit Column */}
                    <div className="bottom-note-col">
                      <h3>현장 메모 추가</h3>
                      <div className="note-input-wrapper" style={{marginTop: '4px'}}>
                        <input 
                          type="text"
                          placeholder="✏️ 추가 인계 메모 입력..."
                          value={noteInput}
                          onChange={e => setNoteInput(e.target.value)}
                        />
                        <button 
                          className="btn btn-primary"
                          style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px'}}
                          onClick={handleAppendMemoText}
                        >
                          + 메모 반영
                        </button>
                      </div>

                      <button 
                        className="btn-large-submit"
                        onClick={handleConfirmHandover}
                        disabled={!isChecklistComplete}
                        title={!isChecklistComplete ? "체크 항목을 완료해야 인계 확정이 가능합니다." : ""}
                      >
                        인계 완료
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              )}

            </div>
          )}
        </section>
      </main>

      {/* Safety Confirm Warning Interceptor Modal */}
      {safetyCheckOpen && activePatient && activeRecord && (
        <div className="safety-modal-overlay">
          <div className="safety-modal-card">
            <div className="safety-modal-header">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>[안전 인계 가이드라인]</span>
            </div>
            <p className="safety-modal-desc">
              <strong>{activePatient.name}</strong> 환자 전송 전에 다음 지침을 확인하셨습니까?
              <br/><br/>
              <em>"{activeRecord.safetyQuestion}"</em>
            </p>
            <div className="safety-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSafetyCheckOpen(false)}>이전</button>
              <button className="btn btn-danger" onClick={handleBypassSafetyAndConfirm}>확인 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* Simple EMR Sync Modal */}
      {transmission.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>원내 EMR 동기화 실행 중</h3>
            <div className="modal-log">{transmission.logs}</div>
          </div>
        </div>
      )}

      {/* CRUD: Add Patient Modal */}
      {newPatientModalOpen && (
        <div className="modal-overlay" onClick={() => setNewPatientModalOpen(false)}>
          <div className="crud-modal-card" onClick={e => e.stopPropagation()}>
            <h3>신규 환자 등록</h3>
            <form onSubmit={handleCreatePatientSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px'}}>
              <div className="crud-form-group">
                <label>병실 번호</label>
                <input 
                  type="text" 
                  placeholder="예: 302"
                  value={newPatientForm.room}
                  onChange={e => setNewPatientForm(prev => ({ ...prev, room: e.target.value }))}
                  required
                />
              </div>
              <div className="crud-form-group">
                <label>환자 이름</label>
                <input 
                  type="text" 
                  placeholder="환자명"
                  value={newPatientForm.name}
                  onChange={e => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Side-by-side row for Gender selection and Age input */}
              <div className="crud-form-row">
                <div className="crud-form-group">
                  <label>성별</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                
                <div className="crud-form-group">
                  <label>나이 (세)</label>
                  <input 
                    type="number" 
                    placeholder="예: 45"
                    value={newPatientForm.age}
                    onChange={e => setNewPatientForm(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="crud-form-group">
                <label>진단 정보</label>
                <input 
                  type="text" 
                  placeholder="진단명 또는 처방 명세"
                  value={newPatientForm.diagnosis}
                  onChange={e => setNewPatientForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  required
                />
              </div>
              <div className="crud-form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '6px'}}>
                <input 
                  type="checkbox"
                  checked={newPatientForm.isHighRisk}
                  onChange={e => setNewPatientForm(prev => ({ ...prev, isHighRisk: e.target.checked }))}
                />
                <label style={{cursor: 'pointer'}}>주의 환자로 분류</label>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewPatientModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <i className="fa-solid fa-circle-check" style={{color: 'var(--accent-green)'}}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(React.createElement(App));
