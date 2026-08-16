// Mock responses matching GET /student/* endpoints

export const dashboardOverviewMock = {
  stats: [
    { id: 'enrolled', title: 'Total Enrolled Courses', value: '12', trend: '+2 this month', icon: 'BookOpen', color: 'purple' },
    { id: 'active', title: 'Active Courses', value: '5', trend: '3 in progress', icon: 'PlayCircle', color: 'teal' },
    { id: 'completed', title: 'Completed Courses', value: '7', trend: '+1 last week', icon: 'CheckCircle', color: 'emerald' },
    { id: 'hours', title: 'Total Learning Hours', value: '48.5h', trend: '+5.2h this week', icon: 'Clock', color: 'orange' },
    { id: 'certificates', title: 'Certificates Earned', value: '4', trend: '2 shareable', icon: 'Award', color: 'plum' },
    { id: 'progress', title: 'Overall Learning Progress', value: '78%', trend: '+4% progress MoM', icon: 'TrendingUp', color: 'pink' }
  ]
};

export const learningProgressMock = {
  metrics: {
    overallCourseCompletion: 78,
    moduleCompletion: 84,
    assignmentCompletion: 90,
    quizCompletion: 82,
    weeklyLearningHours: 12.4,
    monthlyLearningHours: 48.5
  },
  enrolledCourses: [
    {
      id: 'course-1',
      name: 'React for Enterprise Teams',
      progress: 72,
      lessonsCompleted: 18,
      remainingLessons: 7,
      category: 'Frontend',
      trainer: 'Priya Nair',
      thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'course-2',
      name: 'Python for Data Engineering',
      progress: 46,
      lessonsCompleted: 11,
      remainingLessons: 13,
      category: 'Data Engineering',
      trainer: 'Rahul Verma',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'course-3',
      name: 'Cloud Native Foundations',
      progress: 100,
      lessonsCompleted: 24,
      remainingLessons: 0,
      category: 'Cloud',
      trainer: 'Ananya Desai',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'course-4',
      name: 'Generative AI Applications',
      progress: 15,
      lessonsCompleted: 3,
      remainingLessons: 17,
      category: 'AI & Analytics',
      trainer: 'Vikram Mehta',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80'
    }
  ],
  charts: {
    weeklyActivity: [
      { day: 'Mon', hours: 1.5 },
      { day: 'Tue', hours: 2.4 },
      { day: 'Wed', hours: 1.8 },
      { day: 'Thu', hours: 3.2 },
      { day: 'Fri', hours: 2.0 },
      { day: 'Sat', hours: 1.0 },
      { day: 'Sun', hours: 0.5 }
    ],
    monthlyHours: [
      { month: 'Jan', hours: 12.0 },
      { month: 'Feb', hours: 18.5 },
      { month: 'Mar', hours: 22.0 },
      { month: 'Apr', hours: 31.4 },
      { month: 'May', hours: 40.2 },
      { month: 'Jun', hours: 48.5 }
    ],
    courseProgress: [
      { course: 'React Enterprise', progress: 72 },
      { course: 'Python Data', progress: 46 },
      { course: 'Cloud Native', progress: 100 },
      { course: 'GenAI Apps', progress: 15 }
    ]
  }
};

export const certificatesMock = [
  {
    id: 'cert-1',
    courseName: 'Cloud Native Foundations',
    completionDate: '2026-05-15',
    instructorName: 'Ananya Desai',
    certificateId: 'XEB-CNF-9028',
    thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cert-2',
    courseName: 'UI Design Tokens & Architecture',
    completionDate: '2026-06-02',
    instructorName: 'Siddharth Sen',
    certificateId: 'XEB-UDA-4491',
    thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cert-3',
    courseName: 'React Hook Architecture',
    completionDate: '2026-06-20',
    instructorName: 'Priya Nair',
    certificateId: 'XEB-RHA-1048',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cert-4',
    courseName: 'Docker & Kubernetes Core',
    completionDate: '2026-06-28',
    instructorName: 'Ananya Desai',
    certificateId: 'XEB-DKC-3849',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
  }
];

export const aiProgressMock = {
  score: 89,
  summary: 'Your learning pace and quiz scores show solid growth. You are highly consistent with weekday study hours, though slightly less engaged over weekends. Recommended actions will help you maintain momentum and complete upcoming assessments.',
  consistency: 'High (8.4 hrs/week average)',
  completionTrend: 'Accelerating (+12% rate increase)',
  quizPerformance: 'Above average (88% passing rate)',
  assignmentPerformance: 'Excellent (92% completion rate)',
  learningEfficiency: 'Optimal (1.2h per lesson average)',
  insights: [
    'Your consistency is in the top 10% of learners in your cohort.',
    'Quiz performance has improved by 14% after the last revision lesson.',
    'You usually study between 2:00 PM and 4:00 PM on weekdays.',
    'Fast completion times observed for coding assessments.'
  ],
  strengths: [
    'Highly consistent weekday learning schedule',
    'Exceptional performance on coding assignments',
    'Timely submission of all practical projects'
  ],
  improvements: [
    'Increase weekend activity to avoid review spikes',
    'Attempt quizzes right after completing modules',
    'Bookmark review sheets for faster retention'
  ],
  recommendations: [
    { id: 1, action: 'Complete pending React State Management module', detail: 'Estimated time: 45 min' },
    { id: 2, action: 'Spend 2.5 more learning hours this week', detail: 'To reach weekly cohort baseline' },
    { id: 3, action: 'Attempt the upcoming Python ETL assessment', detail: 'Scheduled for July 10' },
    { id: 4, action: 'Finish React for Enterprise Teams to unlock certification', detail: '72% complete' }
  ]
};

export const learningHistoryMock = [
  { id: 1, date: '2026-07-02', course: 'React for Enterprise Teams', activity: 'Quiz Attempted', duration: '20 mins', status: 'Passed (9/10)' },
  { id: 2, date: '2026-07-02', course: 'React for Enterprise Teams', activity: 'Lesson Completed', duration: '15 mins', status: 'Completed' },
  { id: 3, date: '2026-07-01', course: 'React for Enterprise Teams', activity: 'Video Watched', duration: '12 mins', status: 'Completed' },
  { id: 4, date: '2026-06-30', course: 'Python for Data Engineering', activity: 'Assignment Submitted', duration: '2 hours', status: 'Submitted' },
  { id: 5, date: '2026-06-29', course: 'Python for Data Engineering', activity: 'PDF Opened', duration: '5 mins', status: 'Read' },
  { id: 6, date: '2026-06-28', course: 'Cloud Native Foundations', activity: 'Certificate Earned', duration: '-', status: 'Issued' },
  { id: 7, date: '2026-06-28', course: 'Cloud Native Foundations', activity: 'Lesson Completed', duration: '30 mins', status: 'Completed' },
  { id: 8, date: '2026-06-27', course: 'React for Enterprise Teams', activity: 'Course Started', duration: '-', status: 'In Progress' },
  { id: 9, date: '2026-06-26', course: 'Docker & Kubernetes Core', activity: 'Certificate Earned', duration: '-', status: 'Issued' },
  { id: 10, date: '2026-06-25', course: 'UI Design Tokens & Architecture', activity: 'Certificate Earned', duration: '-', status: 'Issued' }
];

export const rankingMock = {
  currentRank: 4,
  totalStudents: 120,
  overallPoints: 1420,
  learningHours: 48.5,
  completionPercentage: 84,
  quizScore: 92,
  badges: [
    { title: 'Gold Learner', icon: '🥇', description: 'Awarded for placing in top 5% of cohort' },
    { title: 'Fast Learner', icon: '⚡', description: 'Finished 3 lessons in a single day' },
    { title: 'Quiz Champion', icon: '🧠', description: 'Scored 100% on 3 consecutive quizzes' },
    { title: 'Top Performer', icon: '🌟', description: 'Consistently high assignment marks' }
  ]
};

export const recommendationsMock = [
  {
    id: 1,
    courseName: 'AI-Driven Product Strategy',
    category: 'Leadership',
    skillLevel: 'Intermediate',
    duration: '5 weeks',
    rating: 4.8,
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    description: 'Learn product development framework, optimization models, and AI-enabled prototyping.',
    whyRecommended: 'Based on your recent Generative AI course completion and fast quiz pacing.'
  },
  {
    id: 2,
    courseName: 'AWS Advanced DevOps Engineer',
    category: 'Cloud',
    skillLevel: 'Advanced',
    duration: '8 weeks',
    rating: 4.9,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description: 'Master provisioning, operating, and managing distributed application systems on AWS.',
    whyRecommended: 'Builds upon your perfect score in Cloud Native Foundations.'
  },
  {
    id: 3,
    courseName: 'Advanced TypeScript Patterns',
    category: 'Frontend',
    skillLevel: 'Advanced',
    duration: '4 weeks',
    rating: 4.7,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    description: 'Deep dive into conditional types, mapped types, decorators, and generic library design.',
    whyRecommended: 'AI suggestion based on your React for Enterprise Teams progress.'
  }
];
