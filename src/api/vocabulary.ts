
// Vocabulary API Service

export interface VocabularyTopic {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // This isn't in your DB but useful for UI
  wordCount?: number; // This will be calculated from related vocabularies
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string; // Vietnamese meaning
  phonetic: string; // Phonetic pronunciation
  topicId: string;
}

export interface QuizQuestion {
  id: string;
  question: string; // The word to be tested
  correctAnswer: string;
  options: string[]; // Will be constructed from option1, option2, option3 and correct_answer
}

export interface TestResult {
  userId: string;
  topicId: string;
  score: number;
  completionTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  topicId: string;
  totalScore: number;
  testsCompleted: number;
  averageScore: number;
  rank: number; // Will be calculated
}

// Placeholder functions to be implemented when backend is ready
export const getVocabularyTopics = async (): Promise<VocabularyTopic[]> => {
  // This will be replaced with actual API call
  console.log('Fetching vocabulary topics');
  
  // Mock data for frontend development
  return [
    {
      id: '1',
      name: 'Basic Conversations',
      description: 'Essential words for everyday conversations',
      imageUrl: '/placeholder.svg',
      wordCount: 20,
    },
    {
      id: '2',
      name: 'Food and Dining',
      description: 'Vocabulary related to food and restaurants',
      imageUrl: '/placeholder.svg',
      wordCount: 15,
    },
    {
      id: '3',
      name: 'Travel',
      description: 'Words for travel and transportation',
      imageUrl: '/placeholder.svg',
      wordCount: 25,
    },
    {
      id: '4',
      name: 'Business',
      description: 'Professional and business vocabulary',
      imageUrl: '/placeholder.svg',
      wordCount: 30,
    },
  ];
};

export const getVocabularyByTopic = async (topicId: string): Promise<VocabularyWord[]> => {
  // This will be replaced with actual API call
  console.log('Fetching vocabulary for topic:', topicId);
  
  // Mock data for frontend development
  return [
    {
      id: '1',
      word: 'Hello',
      meaning: 'Xin chào',
      phonetic: '/həˈloʊ/',
      topicId,
    },
    {
      id: '2',
      word: 'Goodbye',
      meaning: 'Tạm biệt',
      phonetic: '/ˌɡʊdˈbaɪ/',
      topicId,
    },
    {
      id: '3',
      word: 'Thank you',
      meaning: 'Cảm ơn',
      phonetic: '/θæŋk juː/',
      topicId,
    },
    {
      id: '4',
      word: 'Please',
      meaning: 'Làm ơn, xin vui lòng',
      phonetic: '/pliːz/',
      topicId,
    },
    {
      id: '5',
      word: 'Sorry',
      meaning: 'Xin lỗi',
      phonetic: '/ˈsɒri/',
      topicId,
    },
  ];
};

export const getQuizQuestions = async (topicId: string): Promise<QuizQuestion[]> => {
  // This will be replaced with actual API call
  console.log('Fetching quiz questions for topic:', topicId);
  
  // Mock data for frontend development
  return [
    {
      id: '1',
      question: 'Hello',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Xin chào',
    },
    {
      id: '2',
      question: 'Goodbye',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Tạm biệt',
    },
    {
      id: '3',
      question: 'Thank you',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Cảm ơn',
    },
  ];
};

export const getLeaderboard = async (topicId?: string): Promise<LeaderboardEntry[]> => {
  // This will be replaced with actual API call
  console.log('Fetching leaderboard', topicId ? `for topic: ${topicId}` : '');
  
  // Mock data for frontend development
  return [
    { userId: '1', username: 'User1', topicId: '1', totalScore: 95, testsCompleted: 3, averageScore: 95, rank: 1 },
    { userId: '2', username: 'User2', topicId: '1', totalScore: 90, testsCompleted: 3, averageScore: 90, rank: 2 },
    { userId: '3', username: 'User3', topicId: '1', totalScore: 85, testsCompleted: 3, averageScore: 85, rank: 3 },
    { userId: '4', username: 'User4', topicId: '1', totalScore: 80, testsCompleted: 2, averageScore: 80, rank: 4 },
    { userId: '5', username: 'User5', topicId: '1', totalScore: 75, testsCompleted: 2, averageScore: 75, rank: 5 },
  ];
};

export const submitQuizScore = async (userId: string, topicId: string, score: number, completionTime: number): Promise<void> => {
  // This will be replaced with actual API call
  console.log('Submitting quiz score:', { userId, topicId, score, completionTime });
};
