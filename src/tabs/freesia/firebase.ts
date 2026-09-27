import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAp2QOHPA7VzRtUd3TIdbSXTp49rxEsTEo",
  authDomain: "emotion-8ec70.firebaseapp.com",
  projectId: "emotion-8ec70",
  storageBucket: "emotion-8ec70.firebasestorage.app",
  messagingSenderId: "61911000586",
  appId: "1:61911000586:web:15788b7177320bad3e21f3"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// 로그인 화면이 없으므로, 로그인된 사용자가 없으면 익명으로 로그인.
// 익명 계정은 이 기기(브라우저)에 유지되고, 대화 기록은 그 uid 아래에 저장됨
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((error) => console.error('익명 로그인 실패:', error));
  }
});

// Firestore
export const db = getFirestore(app);
