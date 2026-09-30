import {
  dashboardOverviewMock,
  learningProgressMock,
  certificatesMock,
  aiProgressMock,
  learningHistoryMock,
  rankingMock,
  recommendationsMock
} from '@/mock-data-lms/studentDashboardMock';
import { announcements, notifications } from './studentMockData';

// Simulated latency helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /student/dashboard
 */
export async function getStudentDashboardData() {
  await delay(400);
  return {
    overviewStats: dashboardOverviewMock.stats,
    continueLearning: {
      title: 'React for Enterprise Teams',
      subtitle: 'State management with hooks and scalable patterns',
      progress: 72,
      description: 'You are 72% through this course. Finish the next lesson to keep your streak alive.',
      lessonLabel: 'Next lesson: Advanced hooks and testing strategies',
    },
    progressMetrics: [
      { label: 'Course Completion', value: '78%', width: '78%' },
      { label: 'Assignment Score', value: '90%', width: '90%' },
      { label: 'Learning Hours', value: '12.4h', width: '82%' },
    ],
    weeklyActivity: [1.5, 2.4, 1.8, 3.2, 2.0, 1.0, 0.5],
    certificates: certificatesMock.slice(0, 2),
    aiProgress: {
      score: '89 / 100',
      summary: aiProgressMock.summary,
      insights: aiProgressMock.insights,
      strengths: aiProgressMock.strengths,
      improvements: aiProgressMock.improvements,
    },
    learningHistory: learningHistoryMock.slice(0, 3),
    ranking: {
      visible: true,
      rank: `#${rankingMock.currentRank}`,
      summary: 'Top performer this month',
      detail: `You are ahead of 82% of your cohort (${rankingMock.totalStudents} total students).`,
    },
    recommendations: recommendationsMock.slice(0, 2).map(r => ({
      title: r.courseName,
      category: r.category,
      description: r.description,
      reason: r.whyRecommended
    })),
    courses: learningProgressMock.enrolledCourses,
    deadlines: notifications.slice(0, 3),
    announcements,
  };
}

/**
 * GET /student/progress
 */
export async function getStudentProgress() {
  await delay(300);
  return learningProgressMock;
}

/**
 * GET /student/certificates
 */
export async function getStudentCertificates() {
  await delay(300);
  return certificatesMock;
}

/**
 * GET /student/ai-progress
 */
export async function getStudentAIProgress() {
  await delay(350);
  return aiProgressMock;
}

/**
 * GET /student/history
 */
export async function getStudentHistory() {
  await delay(400);
  return learningHistoryMock;
}

/**
 * GET /student/ranking
 */
export async function getStudentRanking() {
  await delay(250);
  return rankingMock;
}

/**
 * GET /student/recommendations
 */
export async function getStudentRecommendations() {
  await delay(300);
  return recommendationsMock;
}

