// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Quiz elements
  const quizForm = document.getElementById('quiz-form');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const questionCounter = document.getElementById('question-counter');
  const progressBar = document.getElementById('quiz-progress');
  
  let currentQuestion = 0;
  const answers = {};
  
  // Personalized learning profile questions
  const questions = [
    {
      question: "What is your primary area of interest in technology?",
      type: "radio",
      name: "interest",
      options: [
        "Cybersecurity",
        "MERN Stack (MongoDB, Express, React, Node)",
        "Web3 & Blockchain",
        "Machine Learning & AI",
        "Cloud Computing",
        "IoT (Internet of Things)",
        "Other (please specify)"
      ]
    },
    {
      question: "What is your current skill level in your chosen area?",
      type: "radio",
      name: "skillLevel",
      options: [
        "Beginner (just starting out)",
        "Intermediate (some experience, comfortable with basics)",
        "Advanced (comfortable building projects)",
        "Expert (can teach others)"
      ]
    },
    {
      question: "What are your specific learning goals?",
      type: "text",
      name: "learningGoals",
      placeholder: "e.g., 'I want to build a full-stack web application' or 'I want to pass the AWS certification'"
    },
    {
      question: "How many hours per week can you dedicate to learning?",
      type: "radio",
      name: "studyHours",
      options: [
        "1-5 hours",
        "5-10 hours",
        "10-15 hours",
        "15-20 hours",
        "20+ hours"
      ]
    },
    {
      question: "What are your preferred learning methods? (Select all that apply)",
      type: "checkbox",
      name: "learningMethods",
      options: [
        "Video tutorials",
        "Interactive coding platforms",
        "Textbooks/documentation",
        "Hands-on projects",
        "Mentorship",
        "Online courses",
        "Study groups"
      ]
    },
    {
      question: "What time of day do you prefer to study?",
      type: "radio",
      name: "studyTime",
      options: [
        "Morning",
        "Afternoon",
        "Evening",
        "Night",
        "Flexible schedule"
      ]
    },
    {
      question: "Do you have any upcoming deadlines or time constraints?",
      type: "text",
      name: "deadlines",
      placeholder: "e.g., 'Need to learn React basics in 2 months for a project'"
    },
    {
      question: "What are your biggest challenges when learning new tech skills?",
      type: "checkbox",
      name: "challenges",
      options: [
        "Staying motivated",
        "Finding good resources",
        "Understanding complex concepts",
        "Time management",
        "Lack of guidance",
        "Applying theory to practice"
      ]
    },
    {
      question: "What kind of projects are you interested in building?",
      type: "text",
      name: "projectInterests",
      placeholder: "e.g., 'I want to build a personal portfolio website' or 'I'm interested in creating smart home IoT devices'"
    },
    {
      question: "Any additional information that would help personalize your learning experience?",
      type: "text",
      name: "additionalInfo",
      placeholder: "Share anything else about your background, preferences, or goals"
    }
  ];

  // Display current question
  function showQuestion() {
    // Clear previous question
    quizForm.innerHTML = '';
    
    // Update progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    
    // Get current question
    const q = questions[currentQuestion];
    
    // Create question element
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    
    // Add question text
    const questionText = document.createElement('h3');
    questionText.textContent = q.question;
    questionDiv.appendChild(questionText);
    
    // Add input based on question type
    if (q.type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = q.name;
      input.id = q.name;
      input.placeholder = q.placeholder || '';
      
      // Set previous answer if exists
      if (answers[currentQuestion]) {
        input.value = answers[currentQuestion];
      }
      
      questionDiv.appendChild(input);
    } else {
      // Add options for radio/checkbox questions
      q.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const input = document.createElement('input');
        input.type = q.type;
        input.name = q.name;
        input.id = `${q.name}-${i}`;
        input.value = option;
        
        // Check if this option was previously selected
        if (answers[currentQuestion]) {
          if (q.type === 'checkbox') {
            if (Array.isArray(answers[currentQuestion])) {
              input.checked = answers[currentQuestion].includes(option);
            } else {
              input.checked = answers[currentQuestion] === option;
            }
          } else {
            input.checked = answers[currentQuestion] === option;
          }
        }
        
        const label = document.createElement('label');
        label.htmlFor = `${q.name}-${i}`;
        label.textContent = option;
        
        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        questionDiv.appendChild(optionDiv);
      });
    }
    
    quizForm.appendChild(questionDiv);
    
    // Update button states
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.style.display = currentQuestion === questions.length - 1 ? 'none' : 'block';
    submitBtn.style.display = currentQuestion === questions.length - 1 ? 'block' : 'none';
  }
  
  // Save answer before moving to next/previous question
  function saveAnswer() {
    const q = questions[currentQuestion];
    
    if (q.type === 'text') {
      const input = document.querySelector(`input[name="${q.name}"]`);
      if (input && input.value.trim()) {
        answers[currentQuestion] = input.value.trim();
      }
    } else {
      const selectedOptions = Array.from(document.querySelectorAll(`input[name="${q.name}"]:checked`));
      
      if (selectedOptions.length > 0) {
        if (q.type === 'checkbox') {
          answers[currentQuestion] = selectedOptions.map(option => option.value);
        } else {
          answers[currentQuestion] = selectedOptions[0].value;
        }
      }
    }
  }
  
  // Format quiz results for AI context
  function formatQuizResultsForAI(answers, questions) {
    const result = {};
    
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer) {
        // For text answers, just use the value
        if (question.type === 'text') {
          result[question.name] = answer;
        } 
        // For multiple choice, format as array
        else if (question.type === 'checkbox') {
          result[question.name] = Array.isArray(answer) ? answer : [answer];
        }
        // For single choice, use the value
        else {
          result[question.name] = answer;
        }
      }
    });
    
    return result;
  }
  
  // Mark quiz as completed in user profile
  function markQuizCompleted() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].quizCompleted = true;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }
    }
  }
  
  // Event listeners
  nextBtn.addEventListener('click', function(e) {
    e.preventDefault();
    saveAnswer();
    currentQuestion++;
    showQuestion();
  });
  
  prevBtn.addEventListener('click', function(e) {
    e.preventDefault();
    saveAnswer();
    currentQuestion--;
    showQuestion();
  });
  
  submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    saveAnswer();
    
    // Format the quiz results
    const userProfile = {
      userId: getCurrentUserId(),
      timestamp: new Date().toISOString(),
      quizResults: formatQuizResultsForAI(answers, questions)
    };
    
    // Save to localStorage
    localStorage.setItem('userLearningProfile', JSON.stringify(userProfile));
    
    // Also save to server (optional)
    fetch('/api/save-quiz-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        localStorageData: { userLearningProfile: userProfile }
      })
    });
    
    // Redirect to home page
    window.location.href = 'home.html';
  });
  
  // Helper function to get current user ID
  function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.uid : 'anonymous';
  }
  
  // Start the quiz
  showQuestion();
});