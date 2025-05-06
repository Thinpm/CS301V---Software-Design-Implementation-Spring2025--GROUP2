// Vocabulary API Service
import { apiGet, apiPost } from './client';

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

// Sample topics data to show when API fails
const SAMPLE_TOPICS: VocabularyTopic[] = [
  {
    id: '1',
    name: 'Từ vựng về gia đình',
    description: 'Học từ vựng về các thành viên trong gia đình và mối quan hệ',
    imageUrl: '/placeholder.svg',
    wordCount: 25
  },
  {
    id: '2',
    name: 'Từ vựng về trường học',
    description: 'Học từ vựng về trường học, lớp học và các hoạt động học tập',
    imageUrl: '/placeholder.svg',
    wordCount: 30
  },
  {
    id: '3',
    name: 'Từ vựng về động vật',
    description: 'Từ vựng về các loại động vật trong tự nhiên',
    imageUrl: '/placeholder.svg',
    wordCount: 40
  }
];

// Updated to use real API calls
// Ví dụ:
export const getVocabularyTopics = async (): Promise<VocabularyTopic[]> => {
  try {
    console.log('Fetching vocabulary topics from API');
    // Thêm /api vào đây
    const response = await apiGet<any>('/api/learning/topics');
    
    console.log('API response for topics:', response);
    
    // Kiểm tra cấu trúc response
    if (Array.isArray(response) && response.length > 0) {
      // Trường hợp API trả về mảng trực tiếp
      const mappedTopics = response.map(topic => ({
        id: topic.id?.toString() || '',
        name: topic.name || 'Chủ đề không tên',
        description: topic.description || 'Không có mô tả',
        imageUrl: '/placeholder.svg', // Default image
        wordCount: topic.total_vocabularies || 0
      }));
      console.log('Successfully mapped topics from array response:', mappedTopics.length);
      return mappedTopics;
    } else if (response && response.topics && Array.isArray(response.topics) && response.topics.length > 0) {
      // Trường hợp API trả về object có field topics là mảng
      const mappedTopics = response.topics.map(topic => ({
        id: topic.id?.toString() || '',
        name: topic.name || 'Chủ đề không tên',
        description: topic.description || 'Không có mô tả',
        imageUrl: '/placeholder.svg', // Default image
        wordCount: topic.total_vocabularies || 0
      }));
      console.log('Successfully mapped topics from object response:', mappedTopics.length);
      return mappedTopics;
    } else {
      // Trường hợp không có dữ liệu từ backend, sử dụng dữ liệu mẫu
      console.warn('No topics returned from API, using sample data');
      return SAMPLE_TOPICS;
    }
  } catch (error) {
    console.error('Error fetching vocabulary topics:', error);
    console.warn('Using sample topics data due to API error');
    return SAMPLE_TOPICS;
  }
};

export const getVocabularyByTopic = async (topicId: string): Promise<VocabularyWord[]> => {
  try {
    console.log('Fetching vocabulary for topic from API:', topicId);
    const response = await apiGet<any>(`/api/learning/topics/${topicId}/vocabularies`);
    
    console.log('Raw vocabulary response:', response);
    
    // Kiểm tra nếu response là null hoặc undefined
    if (!response) {
      console.warn(`Null or undefined response for topic ${topicId}`);
      return [];
    }
    
    const data = Array.isArray(response) ? response : response.data;

    if (!Array.isArray(data)) {
      console.warn('Expected array but got:', data);
      return [];
    }

    const mappedWords = data.map((word) => ({
      id: word.id?.toString() || '',
      word: word.word || 'Unknown',
      meaning: word.meaning || 'No meaning provided',
      phonetic: word.phonetic || '',
      topicId: topicId
    }));
    
    console.log(`Successfully mapped ${mappedWords.length} vocabulary words for topic ${topicId}`);
    return mappedWords;
  } catch (error) {
    console.error(`Error fetching vocabulary for topic ${topicId}:`, error);
    console.warn(`Could not load vocabulary for topic ${topicId} - returning empty array`);
    return []; // Return empty array instead of throwing error
  }
};

export const getQuizQuestions = async (topicId: string): Promise<QuizQuestion[]> => {
  try {
    console.log('Fetching quiz questions from API for topic:', topicId);
    
    // Sử dụng GET thay vì POST và gọi endpoint chính xác
    const response = await apiGet<any>(`/api/learning/topics/${topicId}/tests`);
    
    console.log('Raw API response for quiz questions:', response);
    
    // Map the backend response to our frontend interface
    if (!Array.isArray(response)) {
      console.warn('Expected array of questions but got:', response);
      return [];
    }
    
    if (response.length === 0) {
      console.warn('No quiz questions returned from API for topic:', topicId);
      return [];
    }
    
    const mappedQuestions = response.map(q => {
      // Đảm bảo correctAnswer luôn có giá trị
      const correctAnswer = q.correct_answer || q.correctAnswer || '';
      
      // Sử dụng mảng options từ server nếu có sẵn, nếu không thì tự tạo
      let options = q.options;
      
      if (!options || !Array.isArray(options) || options.length === 0) {
        // Tạo mảng options từ các trường riêng lẻ
        const option1 = q.option1 || '';
        const option2 = q.option2 || '';
        const option3 = q.option3 || '';
        
        options = [correctAnswer, option1, option2, option3]
          .filter(opt => opt && opt.trim() !== '');
        
        // Make sure we have at least one option
        if (options.length === 0 && correctAnswer) {
          options = [correctAnswer];
        }
      }
      
      // Ensure we have a question text
      const questionText = q.question || 'Incomplete question';
      
      const mappedQuestion = {
        id: q.id?.toString() || '',
        question: questionText,
        correctAnswer: correctAnswer,
        options: options
      };
      
      console.log('Mapped quiz question:', mappedQuestion);
      return mappedQuestion;
    });
    
    console.log(`Successfully mapped ${mappedQuestions.length} quiz questions for topic ${topicId}`);
    return mappedQuestions;
  } catch (error) {
    console.error(`Error fetching quiz questions for topic ${topicId}:`, error);
    return []; // Return empty array instead of throwing error
  }
};

export const getLeaderboard = async (topicId?: string): Promise<LeaderboardEntry[]> => {
  try {
    console.log('Fetching leaderboard from API', topicId ? `for topic: ${topicId}` : '');
    // Add the /api prefix to be consistent with other endpoints
    const endpoint = topicId ? `/api/learning/topics/${topicId}/leaderboard` : '/api/learning/leaderboard';
    const response = await apiGet<any>(endpoint);
    
    console.log('Leaderboard API response:', response);
    
    // Kiểm tra cấu trúc của response
    if (Array.isArray(response)) {
      // Trường hợp API trả về mảng trực tiếp
      return response.map((entry, index) => {
        // Debug thông tin username
        console.log('Entry user information:', {
          user_id: entry.user_id,
          username: entry.username,
          hasUsername: !!entry.username
        });
        
        return {
          userId: entry.user_id?.toString() || '',
          username: entry.username || `User ${index + 1}`,
          topicId: entry.topic_id ? entry.topic_id.toString() : '',
          totalScore: entry.total_score || 0,
          testsCompleted: entry.tests_completed || 0,
          averageScore: entry.average_score || 0,
          rank: entry.rank || index + 1
        };
      });
    } else if (response && response.leaderboard && Array.isArray(response.leaderboard)) {
      // Trường hợp API trả về object có field leaderboard là mảng
      return response.leaderboard.map((entry, index) => {
        // Debug thông tin username
        console.log('Entry user information:', {
          user_id: entry.user_id,
          username: entry.username,
          hasUsername: !!entry.username
        });
        
        return {
          userId: entry.user_id?.toString() || '',
          username: entry.username || `User ${index + 1}`,
          topicId: entry.topic_id ? entry.topic_id.toString() : '',
          totalScore: entry.total_score || 0,
          testsCompleted: entry.tests_completed || 0,
          averageScore: entry.average_score || 0,
          rank: entry.rank || index + 1
        };
      });
    } else {
      // Trường hợp không có dữ liệu hợp lệ
      console.warn('Invalid leaderboard response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return []; // Trả về mảng rỗng thay vì ném lỗi
  }
};

export const submitQuizScore = async (userId: string, topicId: string, score: number, completionTime: number, questionResults?: Record<string, string>): Promise<void> => {
  try {
    console.log('Submitting quiz score to API:', { userId, topicId, score, completionTime });
    
    // Sử dụng kết quả thực tế nếu được cung cấp, nếu không tạo dữ liệu giả
    let answers: Record<string, string> = {};
    
    if (questionResults && Object.keys(questionResults).length > 0) {
      answers = questionResults;
    } else {
      // Tạo đối tượng answers từ số điểm - giả định mỗi câu hỏi đúng tương ứng với 1 điểm
      // Backup logic nếu không có kết quả chi tiết
      for (let i = 1; i <= 10; i++) {
        // Giả vờ rằng có 10 câu hỏi, với id từ 1-10, và trả lời đúng cho score câu đầu tiên
        answers[i.toString()] = i <= score ? "correct_answer" : "wrong_answer";
      }
    }
    
    // Call API to submit test results
    const response = await apiPost(`/api/learning/topics/${topicId}/tests`, {
      answers: answers,
      completion_time: completionTime
    });
    
    console.log('Quiz score submission response:', response);
  } catch (error) {
    console.error('Error submitting quiz score:', error);
    throw error;
  }
};
