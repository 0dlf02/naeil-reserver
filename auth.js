import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNX-A0vlNyQz4irUaxxrPl75cckbyJVuc",
  authDomain: "naeil-reserver.firebaseapp.com",
  projectId: "naeil-reserver",
  storageBucket: "naeil-reserver.firebasestorage.app",
  messagingSenderId: "900167795214",
  appId: "1:900167795214:web:0531903f233458046a325f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 로그인
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pw)
    .then(() => {
      window.location.href = "index.html";  // 로그인 후 이동
    })
    .catch(err => {
      document.getElementById("status").textContent = `❌ 로그인 실패: ${err.message}`;
    });
});

// 회원가입
document.getElementById("signupBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, pw)
    .then(() => {
      document.getElementById("status").textContent = "✅ 회원가입 성공! 이제 로그인하세요.";
    })
    .catch(err => {
      document.getElementById("status").textContent = `❌ 회원가입 실패: ${err.message}`;
      console.log("🔥 Firebase 회원가입 에러 코드:", err.code);
      console.log("🔥 Firebase 회원가입 에러 메시지:", err.message);
    });
});