import { TECHNOLOGIES, DIFFICULTY_LEVELS, LANGUAGES } from '@/constants-lms';

const ADMINS = [
  'Sarah Chen', 'James Wilson', 'Priya Sharma', 'Michael O\'Brien',
  'Emma Thompson', 'Raj Patel', 'Lisa Anderson', 'David Kim',
];

const CATEGORY_NAMES = [
  'Programming',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cloud Computing',
  'DevOps',
  'Cyber Security',
  'Mobile Development',
  'UI/UX Design',
  'Business Skills',
];

const CATEGORY_DESCRIPTIONS = [
  'Core programming languages and software development fundamentals.',
  'AI concepts, neural networks, and intelligent systems.',
  'ML algorithms, model training, and deployment pipelines.',
  'Data analysis, visualization, and statistical modeling.',
  'Cloud platforms, architecture, and serverless computing.',
  'CI/CD, infrastructure as code, and automation.',
  'Security principles, threat detection, and compliance.',
  'iOS, Android, and cross-platform mobile development.',
  'User research, prototyping, and design systems.',
  'Leadership, communication, and business acumen.',
];

const COURSE_TITLES = [
  'Python Masterclass', 'Java Enterprise Development', 'Advanced C Programming',
  'Modern C++ Development', 'JavaScript Full Stack', 'TypeScript Deep Dive',
  'React Advanced Patterns', 'Angular Enterprise Apps', 'Node.js Microservices',
  'Spring Boot REST APIs', 'Docker & Containerization', 'Kubernetes Orchestration',
  'AWS Solutions Architect', 'Azure Cloud Fundamentals', 'GCP Data Engineering',
  'TensorFlow for Production', 'PyTorch Neural Networks', 'MongoDB NoSQL Design',
  'MySQL Database Admin', 'PostgreSQL Performance', 'Machine Learning Foundations',
  'Deep Learning Specialization', 'Data Science with Python', 'DevOps Pipeline Mastery',
  'Cyber Security Essentials', 'React Native Mobile Apps', 'UI/UX Design Systems',
  'Agile Project Management', 'Python Data Analytics', 'Java Spring Security',
  'Cloud Native Architecture', 'Kubernetes Security', 'AWS DevOps Professional',
  'Azure AI Engineer', 'GCP Machine Learning', 'Full Stack JavaScript',
  'Advanced React Hooks', 'Angular State Management', 'Node.js Performance',
  'Docker Swarm & Compose', 'Terraform Infrastructure', 'Ethical Hacking Basics',
  'Mobile UI Patterns', 'Figma for Developers', 'Business Communication',
  'Python Automation Scripts', 'Java Multithreading', 'C++ STL Mastery',
  'TypeScript Design Patterns', 'React Server Components',
];

const TECH_KEYS = Object.keys(TECHNOLOGIES);

const CONTENT_TYPE_POOL = ['video', 'pdf', 'ppt', 'doc', 'notes', 'image', 'link'];

const MODULE_TITLES = [
  'Introduction & Setup', 'Core Concepts', 'Advanced Techniques',
  'Hands-on Labs', 'Best Practices', 'Real-world Projects',
  'Performance Optimization', 'Security Fundamentals', 'Testing Strategies',
  'Deployment & DevOps', 'Architecture Patterns', 'Case Studies',
];

const SUBMODULE_TITLES = [
  'Getting Started', 'Key Principles', 'Deep Dive', 'Practical Exercise',
  'Quiz & Assessment', 'Summary & Review', 'Advanced Topics', 'Workshop',
];

const FIRST_NAMES = [
  'Aarav', 'Aditya', 'Arjun', 'Amit', 'Aniket', 'Akash', 'Deepak', 'Dev',
  'Gaurav', 'Hari', 'Ishaan', 'Karan', 'Kabir', 'Kunwar', 'Manish', 'Nikhil',
  'Pranav', 'Rahul', 'Rohan', 'Sanjay', 'Siddharth', 'Utkarsh', 'Vikram',
  'Vijay', 'Yash', 'Abhishek', 'Rishi', 'Vivek', 'Sameer', 'Tushar', 'Ayush',
  'Ananya', 'Aishwarya', 'Aditi', 'Divya', 'Isha', 'Kavya', 'Meera', 'Neha',
  'Pooja', 'Priya', 'Riya', 'Shreya', 'Sneha', 'Swati', 'Tanvi', 'Vandana',
  'Kirti', 'Nisha', 'Jyoti', 'Geeta', 'Kiran', 'Sunita'
];

const LAST_NAMES = [
  'Sharma', 'Kumar', 'Singh', 'Gupta', 'Patel', 'Verma', 'Iyer', 'Nair',
  'Das', 'Sen', 'Joshi', 'Mehta', 'Rao', 'Reddy', 'Choudhury', 'Banerjee',
  'Chatterjee', 'Mishra', 'Trivedi', 'Pillai', 'Yadav', 'Prasad', 'Bose'
];

const UNIVERSITIES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur', 'BITS Pilani',
  'Delhi University', 'Anna University', 'IIIT Hyderabad', 'VIT Vellore', 'NIT Trichy',
  'DTU Delhi', 'RV College of Engineering', 'COEP Pune', 'Jadavpur University'
];

const CITIES = [
  'New Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Noida', 'Gurugram', 'Ahmedabad'
];

const DEPARTMENTS = [
  'Computer Science & Eng', 'Information Technology', 'Electronics & Comm',
  'Data Science & Analytics', 'Artificial Intelligence & ML', 'Software Engineering'
];

const BATCHES = [
  'Batch 2023–2027', 'Batch 2024–2028', 'Batch 2025–2029'
];

let _idCounter = 1;
const nextId = () => _idCounter++;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo = 365) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
}

function randomStatus() {
  const statuses = ['draft', 'in_review', 'published', 'archived'];
  const weights = [0.15, 0.1, 0.65, 0.1];
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < statuses.length; i++) {
    acc += weights[i];
    if (r <= acc) return statuses[i];
  }
  return 'published';
}

function generateContent(submoduleId, order) {
  const type = randomItem(CONTENT_TYPE_POOL);
  const titles = {
    video: ['Introduction Video', 'Lecture Recording', 'Demo Walkthrough', 'Tutorial Video'],
    pdf: ['Course Handbook', 'Reference Guide', 'Lab Manual', 'Study Notes PDF'],
    ppt: ['Slide Deck', 'Presentation Slides', 'Workshop Slides', 'Lecture Slides'],
    doc: ['Assignment Brief', 'Project Document', 'Reading Material', 'Worksheet'],
    notes: ['Key Takeaways', 'Summary Notes', 'Cheat Sheet', 'Quick Reference'],
    image: ['Architecture Diagram', 'Infographic', 'Flow Chart', 'Screenshot'],
    link: ['Official Documentation', 'External Resource', 'GitHub Repository', 'Tutorial Link'],
  };
  const sizes = { video: 52428800, pdf: 2097152, ppt: 5242880, doc: 1048576, notes: 8192, image: 512000, link: 0 };
  return {
    id: nextId(),
    submoduleId,
    title: randomItem(titles[type]),
    type,
    contentOrder: order,
    fileSize: sizes[type] + Math.floor(Math.random() * sizes[type] * 0.5),
    fileUrl: type === 'link' ? 'https://docs.example.com/resource' : `/media/${type}-${nextId()}.${type === 'notes' ? 'md' : type}`,
    duration: type === 'video' ? `${Math.floor(Math.random() * 45) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
    pageCount: type === 'pdf' ? Math.floor(Math.random() * 50) + 5 : null,
    slideCount: type === 'ppt' ? Math.floor(Math.random() * 40) + 10 : null,
    markdown: type === 'notes' ? '## Key Points\n\n- Important concept\n- Best practice\n- Common pitfalls' : null,
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    downloadEnabled: type !== 'link' && Math.random() > 0.2,
    createdAt: randomDate(180),
    updatedAt: randomDate(30),
    createdBy: randomItem(ADMINS),
    deletedAt: null,
  };
}

function generateSubmodule(moduleId, order) {
  const contentCount = Math.floor(Math.random() * 5) + 2;
  const contents = Array.from({ length: contentCount }, (_, i) =>
    generateContent(moduleId * 100 + order, i + 1)
  );
  return {
    id: nextId(),
    moduleId,
    title: randomItem(SUBMODULE_TITLES) + ` ${order}`,
    description: 'Structured learning unit with multimedia content and exercises.',
    submoduleOrder: order,
    status: Math.random() > 0.08 ? 'active' : 'inactive',
    contents,
    createdAt: randomDate(120),
    updatedAt: randomDate(20),
    deletedAt: null,
  };
}

function generateModule(courseId, order) {
  const subCount = Math.floor(Math.random() * 4) + 2;
  const submodules = Array.from({ length: subCount }, (_, i) =>
    generateSubmodule(courseId * 10 + order, i + 1)
  );
  return {
    id: nextId(),
    courseId,
    title: randomItem(MODULE_TITLES) + ` ${order}`,
    description: 'Comprehensive module covering essential topics and practical applications.',
    moduleOrder: order,
    status: Math.random() > 0.05 ? 'active' : 'inactive',
    submodules,
    createdAt: randomDate(150),
    updatedAt: randomDate(15),
    deletedAt: null,
  };
}

function generateCourse(categoryId, index) {
  const tech = TECH_KEYS[index % TECH_KEYS.length];
  const moduleCount = Math.floor(Math.random() * 3) + 3;
  const id = nextId();
  const modules = Array.from({ length: moduleCount }, (_, i) => generateModule(id, i + 1));
  const status = randomStatus();
  return {
    id,
    categoryId,
    title: COURSE_TITLES[index % COURSE_TITLES.length],
    slug: COURSE_TITLES[index % COURSE_TITLES.length].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: `Enterprise-grade ${tech} training program designed for professional developers and teams at Xebia.`,
    shortDescription: `Master ${tech} with hands-on labs, real projects, and expert guidance.`,
    technology: tech,
    thumbnail: `https://picsum.photos/seed/course-${id}/400/240`,
    difficulty: randomItem(DIFFICULTY_LEVELS),
    duration: `${Math.floor(Math.random() * 8) + 4} weeks`,
    durationHours: Math.floor(Math.random() * 40) + 20,
    language: randomItem(LANGUAGES),
    status,
    createdBy: randomItem(ADMINS),
    createdAt: randomDate(300),
    updatedAt: randomDate(14),
    enrolledStudents: Math.floor(Math.random() * 400) + 50,
    modules,
    deletedAt: null,
  };
}

function generateCategory(index) {
  const id = nextId();
  const coursesPerCategory = 5;
  const startIndex = index * coursesPerCategory;
  const courses = Array.from({ length: coursesPerCategory }, (_, i) =>
    generateCourse(id, startIndex + i)
  );
  return {
    id,
    name: CATEGORY_NAMES[index],
    description: CATEGORY_DESCRIPTIONS[index],
    slug: CATEGORY_NAMES[index].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    status: 'active',
    courseCount: courses.length,
    courses,
    createdAt: randomDate(400),
    updatedAt: randomDate(30),
    deletedAt: null,
  };
}

function generateStudents(count = 120) {
  return Array.from({ length: count }, (_, i) => {
    const first = randomItem(FIRST_NAMES);
    const last = randomItem(LAST_NAMES);
    const progress = Math.floor(Math.random() * 101);
    return {
      id: nextId(),
      firstName: first,
      lastName: last,
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@xebialms.edu.in`,
      phone: `+91 ${Math.floor(Math.random() * 50000000 + 9500000000)}`,
      university: randomItem(UNIVERSITIES),
      city: randomItem(CITIES),
      department: randomItem(DEPARTMENTS),
      batch: randomItem(BATCHES),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${first}%20${last}`,
      enrollmentDate: randomDate(200),
      activeCourses: Math.floor(Math.random() * 5) + 1,
      progress,
      completionPercentage: progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'active' : 'inactive',
    };
  });
}

function generateMediaLibrary(categories, courses) {
  const items = [];
  courses.forEach((course) => {
    course.modules?.forEach((mod) => {
      mod.submodules?.forEach((sub) => {
        sub.contents?.forEach((content) => {
          if (content.type !== 'link' && content.type !== 'notes') {
            items.push({
              id: `${course.id}-${mod.id}-${sub.id}-${content.id}`,
              title: content.title,
              type: content.type,
              fileSize: content.fileSize,
              fileUrl: content.fileUrl,
              courseId: course.id,
              courseName: course.title,
              uploadedAt: content.createdAt,
              updatedAt: content.updatedAt,
            });
          }
        });
      });
    });
  });
  return items;
}

export function generateMockData() {
  _idCounter = 1;
  const categories = CATEGORY_NAMES.map((_, i) => generateCategory(i));
  const courses = categories.flatMap((c) => c.courses);
  const students = generateStudents(120);
  const mediaLibrary = generateMediaLibrary(categories, courses);

  const instructors = [
    { id: 'inst-1', fullName: 'Dr. Sarah Chen', email: 'sarah.chen@xebia.com', department: 'Cloud & DevOps', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Chen', coursesCount: 3 },
    { id: 'inst-2', fullName: 'Prof. James Wilson', email: 'james.wilson@xebia.com', department: 'Enterprise Java', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=James%20Wilson', coursesCount: 2 },
    { id: 'inst-3', fullName: 'Dr. Priya Sharma', email: 'priya.sharma@xebia.com', department: 'Data Science & AI', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Sharma', coursesCount: 4 },
    { id: 'inst-4', fullName: 'Amit Patel', email: 'amit.patel@xebia.com', department: 'Frontend Architecture', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Amit%20Patel', coursesCount: 3 },
    { id: 'inst-5', fullName: 'Rohan Verma', email: 'rohan.verma@xebia.com', department: 'Cyber Security', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rohan%20Verma', coursesCount: 2 }
  ];

  return {
    categories: categories.map(({ courses: _, ...cat }) => ({
      ...cat,
      courseCount: categories.find((c) => c.id === cat.id)?.courses?.length || 0,
    })),
    courses,
    students,
    mediaLibrary,
    instructors,
  };
}

export const initialMockData = generateMockData();

