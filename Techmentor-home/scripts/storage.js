// This file simulates cloud storage using localStorage
// In a real app, you would use Firebase Firestore or another database

export function saveQuizResults(userId, results) {
    const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    const userResults = allResults.find(result => result.userId === userId);
    
    if (userResults) {
      // Update existing results
      Object.assign(userResults, results);
    } else {
      // Add new results
      allResults.push({
        userId,
        ...results
      });
    }
    
    localStorage.setItem('quizResults', JSON.stringify(allResults));
  }
  
  export function getUserResults(userId) {
    const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    return allResults.find(result => result.userId === userId);
  }
  
  export function updateUserProfile(userId, updates) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.uid === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user if it's the same user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.uid === userId) {
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }
      
      return true;
    }
    
    return false;
  }