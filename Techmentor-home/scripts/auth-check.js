import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { app } from "./auth.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Function to check authentication state
export async function checkAuth(redirectIfUnauthenticated = true) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {
          uid: user.uid,
          email: user.email,
          quizCompleted: false
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        resolve(user);
      } else if (redirectIfUnauthenticated) {
        // No user is signed in, redirect to login
        window.location.href = "index.html";
        resolve(null);
      } else {
        resolve(null);
      }
    });
  });
}

// Function to get current user
export function getCurrentUser() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return user || null;
}

// Function to logout
export function logout() {
  localStorage.removeItem('currentUser');
  return signOut(auth);
}