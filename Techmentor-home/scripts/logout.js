// scripts/logout.js
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Logout logic
        localStorage.clear();
        sessionStorage.clear();
        
        // Optional: Add a simple fade-out effect
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '0';
        
        // Redirect to sign-in page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      });
    }
  });