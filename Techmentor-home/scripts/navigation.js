document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation between pages
    const handleNavigation = (event) => {
      event.preventDefault();
      const targetPage = event.currentTarget.getAttribute('href');
      
      // Add fade-out animation to current page
      document.body.classList.add('fade-out');
      
      // After animation completes, navigate to new page
      setTimeout(() => {
        window.location.href = targetPage;
      }, 300);
    };
  
    // Attach event listeners to navigation buttons
    const signUpBtn = document.getElementById('sign-up');
    const returnBtn = document.getElementById('return-btn');
    
    if (signUpBtn) signUpBtn.addEventListener('click', handleNavigation);
    if (returnBtn) returnBtn.addEventListener('click', handleNavigation);
  });

  