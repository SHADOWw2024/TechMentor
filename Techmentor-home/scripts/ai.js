import { getCurrentUser } from './auth-check.js';

export async function generateRecommendations(userId) {
  const container = document.getElementById('recommended-courses');
  if (!container) return;
  
  // Show loading state
  container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
  
  // Get current user and their quiz results
  const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
  const userResults = allResults.find(result => result.userId === userId);
  
  if (!userResults) {
    // No quiz results found, prompt to take quiz
    container.innerHTML = `
      <div class="no-results">
        <p>You haven't completed the quiz yet.</p>
        <a href="quiz.html" class="btn-primary">Take Quiz Now</a>
      </div>
    `;
    return;
  }
  
  // Generate recommendations based on user's quiz results
  const recommendations = generateCoursesBasedOnAnswers(userResults.answers);
  
  if (recommendations.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No recommendations found based on your quiz answers.</p>
        <button id="retake-quiz-btn" class="btn-primary">Retake Quiz</button>
      </div>
    `;
    return;
  }
  
  // Display recommendations
  container.innerHTML = '';
  
  recommendations.forEach(course => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    
    courseCard.innerHTML = `
      <h4>${course.title}</h4>
      <p class="provider">${course.provider}</p>
      <div class="course-meta">
        <span>${course.duration}</span>
        <span>${course.level}</span>
      </div>
      <p class="description">${course.description}</p>
      <button class="enroll-btn">Learn More</button>
    `;
    
    container.appendChild(courseCard);
  });
}

function generateCoursesBasedOnAnswers(answers) {
  // This is a simplified recommendation engine
  // In a real app, you would use more sophisticated logic or call an AI API
  
  const recommendations = [];
  
  // Example recommendation logic based on answers
  if (answers[0] && answers[0][0].includes("18-24")) {
    recommendations.push({
      title: "Introduction to Computer Science",
      provider: "Tech University",
      duration: "12 weeks",
      level: "Beginner",
      description: "Perfect for young learners starting their tech journey. Covers fundamental programming concepts."
    });
  }
  
  if (answers[1] && answers[1][0].includes("Undergraduate")) {
    recommendations.push({
      title: "Advanced Mathematics for University Students",
      provider: "Math Academy",
      duration: "8 weeks",
      level: "Intermediate",
      description: "Builds on undergraduate math concepts with practical applications."
    });
  }
  
  if (answers[2] && answers[2][0].includes("Technology")) {
    recommendations.push({
      title: "Web Development Bootcamp",
      provider: "Code Camp",
      duration: "16 weeks",
      level: "Beginner to Intermediate",
      description: "Comprehensive course covering HTML, CSS, JavaScript and modern frameworks."
    });
  }
  
  if (answers[3] && answers[3][0].includes("5-10 hours")) {
    recommendations.push({
      title: "Part-Time Python Programming",
      provider: "Python Institute",
      duration: "10 weeks",
      level: "Beginner",
      description: "Perfect for busy learners with 5-10 hours per week to dedicate."
    });
  }
  
  if (answers[4] && answers[4][0].includes("Career advancement")) {
    recommendations.push({
      title: "Professional Certification in Data Science",
      provider: "Data Science Council",
      duration: "20 weeks",
      level: "Intermediate",
      description: "Boost your career with in-demand data science skills."
    });
  }
  
  // Add more recommendation logic based on other answers...
  
  // If no specific recommendations, add some general ones
  if (recommendations.length === 0) {
    recommendations.push(
      {
        title: "Learning How to Learn",
        provider: "University of Learning",
        duration: "4 weeks",
        level: "Beginner",
        description: "Powerful mental tools to help you master tough subjects."
      },
      {
        title: "Critical Thinking at Work",
        provider: "Business Skills Institute",
        duration: "6 weeks",
        level: "Intermediate",
        description: "Develop essential critical thinking skills for professional success."
      }
    );
  }
  
  return recommendations;
}