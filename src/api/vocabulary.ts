
// Vocabulary API Service

export interface VocabularyTopic {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  wordCount: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  englishMeaning: string;
  vietnameseMeaning: string;
  pronunciation: string;
  example?: string;
  topicId: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  options: string[];
  correctAnswer: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
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
      englishMeaning: 'A greeting used when meeting someone',
      vietnameseMeaning: 'Xin chào',
      pronunciation: '/həˈloʊ/',
      example: 'Hello, how are you today?',
      topicId,
    },
    {
      id: '2',
      word: 'Goodbye',
      englishMeaning: 'A farewell remark',
      vietnameseMeaning: 'Tạm biệt',
      pronunciation: '/ˌɡʊdˈbaɪ/',
      example: 'Goodbye, see you tomorrow!',
      topicId,
    },
    {
      id: '3',
      word: 'Thank you',
      englishMeaning: 'An expression of gratitude',
      vietnameseMeaning: 'Cảm ơn',
      pronunciation: '/θæŋk juː/',
      example: 'Thank you for your help.',
      topicId,
    },
    {
      id: '4',
      word: 'Please',
      englishMeaning: 'Used as a polite request',
      vietnameseMeaning: 'Làm ơn, xin vui lòng',
      pronunciation: '/pliːz/',
      example: 'Please pass me the salt.',
      topicId,
    },
    {
      id: '5',
      word: 'Sorry',
      englishMeaning: 'Used as an apology',
      vietnameseMeaning: 'Xin lỗi',
      pronunciation: '/ˈsɒri/',
      example: 'I'm sorry for being late.',
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
      word: 'Hello',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Xin chào',
    },
    {
      id: '2',
      word: 'Goodbye',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Tạm biệt',
    },
    {
      id: '3',
      word: 'Thank you',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Làm ơn'],
      correctAnswer: 'Cảm ơn',
    },
  ];
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // This will be replaced with actual API call
  console.log('Fetching leaderboard');
  
  // Mock data for frontend development
  return [
    { userId: '1', username: 'User1', score: 95, rank: 1 },
    { userId: '2', username: 'User2', score: 90, rank: 2 },
    { userId: '3', username: 'User3', score: 85, rank: 3 },
    { userId: '4', username: 'User4', score: 80, rank: 4 },
    { userId: '5', username: 'User5', score: 75, rank: 5 },
  ];
};

export const submitQuizScore = async (topicId: string, score: number): Promise<void> => {
  // This will be replaced with actual API call
  console.log('Submitting quiz score:', { topicId, score });
};
