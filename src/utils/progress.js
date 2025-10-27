import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

// Save user progress when they complete a problem
export const saveUserProgress = async (userId, problemId, solution) => {
  try {
    const user = auth.currentUser;
    const userProgressRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(userProgressRef);

    const userInfo = user ? {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    } : {};

    if (docSnap.exists()) {
      // Document exists, so we update it.
      const updateData = {
        // Use dot notation to update the specific problem in the map.
        [`completedProblems.${problemId}`]: {
          completedAt: serverTimestamp(),
          solution: solution,
        },
        lastUpdated: serverTimestamp(),
      };
      
      // Always update user info if available (to keep it current)
      if (userInfo && Object.keys(userInfo).length > 0) {
        if (userInfo.displayName !== undefined) updateData.displayName = userInfo.displayName;
        if (userInfo.email !== undefined) updateData.email = userInfo.email;
        if (userInfo.photoURL !== undefined) updateData.photoURL = userInfo.photoURL;
      }
      
      await updateDoc(userProgressRef, updateData);
      console.log('Progress updated successfully for problem:', problemId);
    } else {
      // Document does not exist, so we create it.
      await setDoc(userProgressRef, {
        userId: userId,
        completedProblems: {
          [problemId]: {
            completedAt: serverTimestamp(),
            solution: solution,
          },
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        ...userInfo,
      });
      console.log('Progress created successfully for problem:', problemId);
    }
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

// Load user progress
export const loadUserProgress = async (userId) => {
  try {
    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressDoc = await getDoc(userProgressRef);
    
    if (userProgressDoc.exists()) {
      const data = userProgressDoc.data();
      return {
        completedProblems: data.completedProblems || {},
        viewedSolutions: data.viewedSolutions || {},
      };
    }
    
    return { completedProblems: {}, viewedSolutions: {} };
  } catch (error) {
    console.error('Error loading progress:', error);
    return { completedProblems: {}, viewedSolutions: {} };
  }
};

// Get completion count
export const getCompletionCount = (completedProblems) => {
  return Object.keys(completedProblems || {}).length;
};

// Check if a problem is completed
export const isProblemCompleted = (completedProblems, problemId) => {
  return completedProblems && completedProblems[problemId];
};

// Mark a problem's solution as viewed
export const markSolutionAsViewed = async (userId, problemId) => {
  try {
    const user = auth.currentUser;
    const userProgressRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(userProgressRef);

    const userInfo = user ? {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    } : {};

    if (docSnap.exists()) {
      const updateData = {
        [`viewedSolutions.${problemId}`]: true,
        lastUpdated: serverTimestamp(),
      };
      
      // Only update user info if it exists and is not empty
      if (userInfo && Object.keys(userInfo).length > 0) {
        if (userInfo.displayName) updateData.displayName = userInfo.displayName;
        if (userInfo.email) updateData.email = userInfo.email;
        if (userInfo.photoURL) updateData.photoURL = userInfo.photoURL;
      }
      
      await updateDoc(userProgressRef, updateData);
      console.log('Solution marked as viewed for problem:', problemId);
    } else {
      await setDoc(userProgressRef, {
        userId: userId,
        viewedSolutions: {
          [problemId]: true,
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        ...userInfo,
      });
      console.log('Progress created with solution viewed for problem:', problemId);
    }
    return true;
  } catch (error) {
    console.error('Error marking solution as viewed:', error);
    return false;
  }
};

// Get leaderboard data - fetch all users and their completion counts
export const getLeaderboardData = async () => {
  try {
    const userProgressCollection = collection(db, 'userProgress');
    const querySnapshot = await getDocs(userProgressCollection);
    
    const leaderboardData = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Get completedProblems
      let completedProblems = data.completedProblems || {};
      
      // If completedProblems is an array (old structure), skip it
      if (Array.isArray(completedProblems)) {
        completedProblems = {};
      }
      
      const completedCount = Object.keys(completedProblems).length;
      
      if (completedCount > 0) {
        leaderboardData.push({
          userId: doc.id,
          displayName: data.displayName || data.email || 'Anonymous',
          email: data.email || '',
          photoURL: data.photoURL || '',
          completedCount: completedCount,
          completedProblems: completedProblems,
        });
      }
    });
    
    // Add 25 random demo users for leaderboard fill
    const demoUsers = [
      { displayName: 'Stellar', email: 'quantum@example.com', completedCount: 30 },
      { displayName: 'Anonymous', email: 'qubit@example.com', completedCount: 19 },
      { displayName: 'QN123', email: 'alice@example.com', completedCount: 19 },
      { displayName: 'Anonymous', email: 'coder@example.com', completedCount: 13 },
      { displayName: 'Luma12', email: 'bob@example.com', completedCount: 12 },
      { displayName: 'QuantumG', email: 'super@example.com', completedCount: 10 },
      { displayName: 'Cinco', email: 'schrodinger@example.com', completedCount: 9 },
      { displayName: 'JoshuaBerry', email: 'guru@example.com', completedCount: 8 },
      { displayName: 'NehaR', email: 'entangle@example.com', completedCount: 7 },
      { displayName: 'Reddy', email: 'ninja@example.com', completedCount: 7 },
      { displayName: 'Daniel', email: 'hacker@example.com', completedCount: 8 },
      { displayName: 'Aditi', email: 'qft@example.com', completedCount: 7 },
      { displayName: 'Wang', email: 'grover@example.com', completedCount: 8 },
      { displayName: 'Anonymous', email: 'bell@example.com', completedCount: 9 },
      { displayName: 'JJ123', email: 'phase@example.com', completedCount: 6 },
      { displayName: 'Ada', email: 'nerd@example.com', completedCount: 5 },
      { displayName: 'Anonymous', email: 'gate@example.com', completedCount: 8 },
      { displayName: 'QuantumBoss', email: 'superpro@example.com', completedCount: 12 },
      { displayName: 'Preet', email: 'voyager@example.com', completedCount: 15 },
      { displayName: 'LiamD', email: 'queen@example.com', completedCount: 9 },
      { displayName: 'Anonymous', email: 'architect@example.com', completedCount: 10 },
      { displayName: 'Anonymous', email: 'nc@example.com', completedCount: 12 },
      { displayName: 'MetaFact', email: 'shor@example.com', completedCount: 11 }
    ];

    // Add demo users to leaderboard
    demoUsers.forEach((demo, index) => {
      leaderboardData.push({
        userId: `demo_${index}`,
        displayName: demo.displayName,
        email: demo.email,
        photoURL: '',
        completedCount: demo.completedCount,
        completedProblems: {},
        isDemo: true,
      });
    });

    // Sort by completed count (descending)
    leaderboardData.sort((a, b) => b.completedCount - a.completedCount);
    
    return leaderboardData;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return [];
  }
};
