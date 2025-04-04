document.addEventListener('DOMContentLoaded', function() {
    const transitionElement = document.querySelector('.page-transition');
    const links = document.querySelectorAll('a[href^="index.html"], a[href^="signup.html"]');
    
    // Handle click events
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        
        // Activate transition
        transitionElement.classList.add('active');
        
        // Wait for transition to complete
        setTimeout(() => {
          window.location.href = target;
        }, 300);
      });
    });
    
    // Handle page load
    window.addEventListener('load', function() {
      // Fade in content
      document.body.style.opacity = 1;
      
      // Deactivate transition overlay
      setTimeout(() => {
        if (transitionElement.classList.contains('active')) {
          transitionElement.classList.remove('active');
        }
      }, 100);
    });

    // Handle form submission transition
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        transitionElement.classList.add('active');
        
        // Simulate form submission and redirect
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 500);
      });
    }

    // Handle initial page load animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });