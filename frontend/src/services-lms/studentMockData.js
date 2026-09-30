export const studentProfile = {
  id: 'STU-1045',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@xebia.com',
  phone: '+91 98765 43210',
  department: 'Data Engineering',
  designation: 'Associate Engineer',
  location: 'Bengaluru, India',
  joiningDate: '2024-02-12',
  bio: 'Focused on building practical data pipelines and cloud-native analytics skills.',
  skills: ['React', 'Python', 'SQL', 'Data Modeling', 'Cloud'],
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
};

export const studentStats = [
  { title: 'Total Enrolled Courses', value: '12', icon: 'BookOpen', accent: 'from-brand-primary/10 to-accent-teal/10 text-brand-primary' },
  { title: 'Active Courses', value: '5', icon: 'PlayCircle', accent: 'from-accent-teal/10 to-emerald-500/10 text-accent-teal' },
  { title: 'Completed Courses', value: '3', icon: 'CheckCircle', accent: 'from-emerald-500/10 to-lime-500/10 text-emerald-600' },
  { title: 'Pending Assignments', value: '4', icon: 'ClipboardList', accent: 'from-amber-500/10 to-orange-500/10 text-amber-600' },
  { title: 'Upcoming Assessments', value: '2', icon: 'TimerReset', accent: 'from-purple-500/10 to-violet-500/10 text-violet-600' },
  { title: 'Overall Learning Progress', value: '74%', icon: 'TrendingUp', accent: 'from-sky-500/10 to-cyan-500/10 text-sky-600' },
];

export const courses = [
  {
    id: 'course-1',
    title: 'React for Enterprise Teams',
    trainer: 'Priya Nair',
    category: 'Frontend',
    duration: '6 weeks',
    progress: 72,
    lessonsCompleted: 18,
    lastAccessed: '2 hours ago',
    status: 'In Progress',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=900&q=80',
    description: 'Design systems, hooks, advanced state management, and scalable UI architecture.',
  },
  {
    id: 'course-2',
    title: 'Python for Data Engineering',
    trainer: 'Rahul Verma',
    category: 'Data',
    duration: '8 weeks',
    progress: 46,
    lessonsCompleted: 11,
    lastAccessed: 'Yesterday',
    status: 'In Progress',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
    description: 'Build ingestion pipelines, optimize ETL flows, and work with SQL and Airflow.',
  },
  {
    id: 'course-3',
    title: 'Cloud Foundations',
    trainer: 'Ananya Desai',
    category: 'Cloud',
    duration: '4 weeks',
    progress: 100,
    lessonsCompleted: 24,
    lastAccessed: '4 days ago',
    status: 'Completed',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    description: 'AWS, Azure, and GCP fundamentals with practical labs and architecture guidance.',
  },
];

export const learningResources = [
  { id: 1, title: 'React Performance Patterns', type: 'Video', duration: '18 min', completed: true, downloadUrl: '#', openUrl: '#' },
  { id: 2, title: 'Design System Tokens', type: 'PDF', duration: '6 pages', completed: false, downloadUrl: '#', openUrl: '#' },
  { id: 3, title: 'Module Architecture Deck', type: 'PPT', duration: '12 slides', completed: true, downloadUrl: '#', openUrl: '#' },
  { id: 4, title: 'API Contract Notes', type: 'Doc', duration: '4 min read', completed: false, downloadUrl: '#', openUrl: '#' },
];

export const assignments = [
  { id: 1, name: 'Build a Dashboard Layout', course: 'React for Enterprise Teams', dueDate: '2026-07-07', marks: 20, status: 'Pending', submissionDate: '-', action: 'Upload' },
  { id: 2, name: 'SQL Query Optimization', course: 'Python for Data Engineering', dueDate: '2026-07-10', marks: 15, status: 'Submitted', submissionDate: '2026-07-01', action: 'Replace' },
  { id: 3, name: 'Cloud Architecture Summary', course: 'Cloud Foundations', dueDate: '2026-06-24', marks: 10, status: 'Graded', submissionDate: '2026-06-22', action: 'View Feedback' },
];

export const assessments = [
  { id: 1, name: 'React State Management Quiz', course: 'React for Enterprise Teams', timeLimit: '20 min', questions: 10, passingMarks: 7, attemptsRemaining: 2, status: 'Pending' },
  { id: 2, name: 'Data Pipeline Basics', course: 'Python for Data Engineering', timeLimit: '15 min', questions: 8, passingMarks: 6, attemptsRemaining: 1, status: 'Resume' },
  { id: 3, name: 'Cloud Fundamentals Test', course: 'Cloud Foundations', timeLimit: '25 min', questions: 12, passingMarks: 8, attemptsRemaining: 0, status: 'Completed' },
];

export const certificates = [
  { id: 1, course: 'Cloud Foundations', completionDate: '2026-06-20', trainer: 'Ananya Desai', certificateNumber: 'CF-2048', preview: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80' },
  { id: 2, course: 'React for Enterprise Teams', completionDate: '2026-06-30', trainer: 'Priya Nair', certificateNumber: 'RE-1985', preview: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80' },
];

export const calendarEvents = [
  { id: 1, title: 'Assignment Due', date: '2026-07-07', type: 'Assignment' },
  { id: 2, title: 'Quiz: React State', date: '2026-07-09', type: 'Quiz' },
  { id: 3, title: 'Live Session', date: '2026-07-12', type: 'Live' },
  { id: 4, title: 'Course Deadline', date: '2026-07-15', type: 'Course' },
];

export const notifications = [
  { id: 1, type: 'Assignment', title: 'Assignment due tomorrow', message: 'Submit the dashboard layout by 11:59 PM.', read: false, time: '2h ago' },
  { id: 2, type: 'Course', title: 'New lesson released', message: 'A new lesson was added to React for Enterprise Teams.', read: false, time: '3h ago' },
  { id: 3, type: 'Quiz', title: 'Quiz reminder', message: 'Your assessment starts at 10 AM tomorrow.', read: true, time: 'Yesterday' },
];

export const announcements = [
  { id: 1, title: 'New Learning Path', description: 'A new curated path for cloud-native learners is now live.', date: '2026-07-01', priority: 'High', read: false },
  { id: 2, title: 'Office Hours Update', description: 'Instructor office hours are now available every Thursday.', date: '2026-06-29', priority: 'Medium', read: true },
];

export const notes = [
  { id: 1, title: 'React hooks recap', content: 'Remember to use useMemo for expensive computations.', timestamp: '2026-07-01 09:40' },
  { id: 2, title: 'Dashboard checklist', content: 'Complete the chart section and add empty states.', timestamp: '2026-06-30 16:15' },
];

export const bookmarks = [
  { id: 1, title: 'React Performance Patterns', type: 'Video', savedAt: '2026-06-30' },
  { id: 2, title: 'Cloud Architecture Summary', type: 'Assignment', savedAt: '2026-07-01' },
];

export const discussions = [
  { id: 1, user: 'Megha', message: 'How should I structure the dashboard state?', likes: 4, helpful: false, time: '1h ago' },
  { id: 2, user: 'Karan', message: 'The useReducer pattern works very well for this case.', likes: 6, helpful: true, time: '40m ago' },
];

export const leaderboard = [
  { id: 1, name: 'Aarav Sharma', score: 94, hours: 36, badges: 5 },
  { id: 2, name: 'Megha Rana', score: 91, hours: 32, badges: 4 },
  { id: 3, name: 'Karan Singh', score: 88, hours: 29, badges: 3 },
];

export const badges = [
  { id: 1, title: 'First Course Completed', description: 'Completed your first learning path', icon: 'Award' },
  { id: 2, title: 'Fast Learner', description: 'Finished 3 lessons in a day', icon: 'Zap' },
  { id: 3, title: 'Quiz Master', description: 'Scored above 90% in a quiz', icon: 'Brain' },
];
