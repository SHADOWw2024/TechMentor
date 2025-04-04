import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYEl3iYUk6ZSmyrs3KeZmZIrO6GPJl-WQ",
  authDomain: "myauthapp-c9382.firebaseapp.com",
  projectId: "myauthapp-c9382",
  storageBucket: "myauthapp-c9382.appspot.com",
  messagingSenderId: "972508198171",
  appId: "1:972508198171:web:53666cac775aaf9fe34fbe",
  measurementId: "G-3GKSESXV7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct");
const returnBtn = document.getElementById("return-btn");
const themeToggle = document.querySelector(".theme-toggle");
const toast = document.getElementById("toast");
const rememberMe = document.getElementById("remember-me");

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Check for saved credentials
  if (rememberMe && localStorage.getItem("rememberEmail")) {
    emailInput.value = localStorage.getItem("rememberEmail");
    rememberMe.checked = true;
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", function() {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });
  }

  // Sign in button
  if (submitButton) {
    submitButton.addEventListener("click", handleSignIn);
  }

  // Sign up button
  if (signupButton) {
    signupButton.addEventListener("click", function() {
      window.location.href = "signup.html";
    });
  }
});

async function handleSignIn(e) {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Reset errors
  resetErrors();
  
  // Validate inputs
  if (!email) {
    showError(emailInput, "Email is required");
    return;
  }
  
  if (!password) {
    showError(passwordInput, "Password is required");
    return;
  }
  
  // Remember email if checkbox is checked
  if (rememberMe && rememberMe.checked) {
    localStorage.setItem("rememberEmail", email);
  } else {
    localStorage.removeItem("rememberEmail");
  }
  
  // Show loading state
  submitButton.classList.add("loading");
  submitButton.disabled = true;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {
      uid: userCredential.user.uid,
      email: email,
      quizCompleted: false
    };
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    showToast("Login successful! Redirecting...", "success");
    
    // Redirect based on quiz completion
    setTimeout(() => {
      window.location.href = userData.quizCompleted ? 'dashboard.html' : 'quiz.html';
    }, 1500);
    
  } catch (error) {
    handleAuthError(error);
  } finally {
    submitButton.classList.remove("loading");
    submitButton.disabled = false;
  }
}

// Helper functions
function resetErrors() {
  document.querySelectorAll(".input-group").forEach(group => {
    group.classList.remove("input-error");
    const errorMsg = group.querySelector(".error-message");
    if (errorMsg) errorMsg.remove();
  });
}

function showError(inputElement, message) {
  const inputGroup = inputElement.closest(".input-group");
  inputGroup.classList.add("input-error");
  
  const errorElement = document.createElement("span");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  inputGroup.appendChild(errorElement);
}

function showToast(message, type = "info", duration = 3000) {
  toast.textContent = message;
  toast.className = "";
  toast.classList.add(type, "show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function handleAuthError(error) {
  let errorMessage = "An error occurred. Please try again.";
  
  switch(error.code) {
    case "auth/invalid-email":
      errorMessage = "Please enter a valid email address.";
      showError(emailInput, errorMessage);
      break;
    case "auth/user-disabled":
      errorMessage = "This account has been disabled.";
      showError(emailInput, errorMessage);
      break;
    case "auth/user-not-found":
      errorMessage = "No account found with this email.";
      showError(emailInput, errorMessage);
      break;
    case "auth/wrong-password":
      errorMessage = "Incorrect password. Please try again.";
      showError(passwordInput, errorMessage);
      break;
    default:
      errorMessage = error.message || "An unknown error occurred.";
  }
  
  showToast(errorMessage, "error");
}
// Toggle between sign in and sign up forms
document.addEventListener('DOMContentLoaded', function() {
  const signUpBtn = document.getElementById('sign-up');
  const returnBtn = document.getElementById('return-btn');
  
  if (signUpBtn) {
    signUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'signup.html';
    });
  }
  
  if (returnBtn) {
    returnBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});