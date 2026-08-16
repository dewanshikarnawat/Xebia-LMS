'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FolderOpen, HardDrive, Percent, ArrowUpRight,
  TrendingUp, Calendar, CheckCircle, Clock, Plus, BarChart2,
  Filter, Award, Download, Zap, Brain, Shield, ChevronDown,
  UserPlus, FolderPlus, ClipboardList, CheckSquare, Activity, FileText, Sparkles, Play, ArrowRight
} from 'lucide-react';
import api from '@/services-lms/api';
import { useToast } from '@/hooks-lms/useToast';
import Button from '@/components/ui-lms/Button';
import PageHeader from '@/components/layout-lms/PageHeader';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui-lms/Badge';

export default function Dashboard() {
  const { showToast } = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('summary');

  // Filter states
  const [filters, setFilters] = useState({
    year: '2026',
    quarter: 'all',
    region: 'all',
    location: 'all',
    businessUnit: 'all',
    department: 'all',
    practice: 'all',
    employeeGrade: 'all',
  });

  // Hardcoded Dashboard Mock Data matching backend schemas exactly
  const MOCK_ANALYTICS_DATA = {
    regionsList: ["India", "US", "UK"],
    locationsList: ["Delhi", "Gurgaon", "Bangalore", "Pune", "Noida", "Mumbai"],
    departmentsList: ["Computer Science", "Information Technology", "DevOps & Cloud", "AI & Analytics"],
    gradesList: ["E1", "E2", "E3", "M1", "M2"],
    businessUnitsList: ["Digital", "Cloud & Infra", "Data & AI", "Advisory"],
    practicesList: ["Java", "Python", "Cloud Native", "GenAI", "Security"],

    executiveSummary: {
      totalEmployees: 135,
      employeesNominated: 120,
      employeesTrained: 120,
      learningCoveragePct: 88.8,
      totalSessionsConducted: 48,
      totalAttendees: 120,
      totalNominations: 120,
      totalLearningHours: 2656.0,
      avgHoursPerSession: 55.3,
      totalCertificationsCompleted: 45,
      certificationGrowthPct: 14.5,
      employeesTrainedInAI: 59,
      aiCertificationsAchieved: 18,
      aiLearningHours: 1240.0,
      avgFeedbackRating: 4.6,
      trainingSatisfactionScore: 92,
      recommendationPct: 85
    },

    learningCoverage: {
      regionCoverage: { India: 84.2, US: 72.5, UK: 68.0 },
      locationCoverage: { Delhi: 85.0, Gurgaon: 82.3, Bangalore: 79.5, Pune: 76.0, Noida: 81.2, Mumbai: 74.5 },
      gradeCoverage: { E1: 90.0, E2: 82.5, E3: 75.0, M1: 62.0, M2: 55.0 },
      businessUnitCoverage: { Digital: 82.5, "Cloud & Infra": 79.0, "Data & AI": 88.4, Advisory: 64.0 }
    },

    learningHoursAnalytics: {
      totalLearningHours: 2656.0,
      avgLearningHoursPerEmployee: 19.7,
      avgLearningHoursPerActiveLearner: 22.1,
      topProjects: [
        { project: "Project-105", hours: 124.5 },
        { project: "Project-112", hours: 108.0 },
        { project: "Project-108", hours: 98.4 },
        { project: "Project-114", hours: 95.0 },
        { project: "Project-101", hours: 89.2 }
      ],
      topRegions: [
        { region: "India", hours: 1859.0 },
        { region: "US", hours: 531.0 },
        { region: "UK", hours: 266.0 }
      ],
      topLearners: [
        { name: "Aarav Sharma", hours: 94.5 },
        { name: "Megha Rana", hours: 91.0 },
        { name: "Karan Singh", hours: 88.0 },
        { name: "Rohit Vaishnav", hours: 85.5 },
        { name: "Nisha Sharma", hours: 82.0 },
        { name: "Amit Patel", hours: 78.5 },
        { name: "Neha Singh", hours: 75.0 },
        { name: "Rohan Verma", hours: 72.0 },
        { name: "Kirti Verma", hours: 68.5 },
        { name: "Suresh Kumar", hours: 65.0 }
      ]
    },

    learningPillars: [
      { pillar: "Pillar 1: Compliance Learning", hours: 250, trained: 85, active: true },
      { pillar: "Pillar 2: Technical Learning", hours: 1593, trained: 120, active: true },
      { pillar: "Pillar 3: AI & GenAI Learning", hours: 1240, trained: 59, active: true },
      { pillar: "Pillar 4: Leadership Development", hours: 180, trained: 40, active: true },
      { pillar: "Pillar 5: Upskilling & Cross-Skilling", hours: 320, trained: 65, active: true },
      { pillar: "Pillar 6: Certifications", hours: 450, trained: 45, active: true },
      { pillar: "Pillar 7: Flagship Programs", hours: 420, trained: 55, active: true }
    ],

    aiTransformation: {
      aiReadinessIndex: 82.4,
      employeesTrainedOnAI: 59,
      employeesCertifiedOnAI: 18,
      aiLearningHours: 1240,
      aiSessionsConducted: 12,
      aiAttendancePct: 92.5,
      funnel: {
        registered: 135,
        attended: 120,
        completed: 59,
        certified: 18,
        usingAITools: 41
      },
      toolsAdoption: [
        { tool: "Copilot Users", count: 45 },
        { tool: "Kiro Users", count: 32 },
        { tool: "Claude Users", count: 28 },
        { tool: "Other AI Tools", count: 15 }
      ],
      aiMaturityScore: 78.5
    },

    certificationTracker: {
      funnel: {
        assigned: 65,
        enrolled: 58,
        started: 50,
        completed: 45,
        submitted: 45,
        approvedInZoho: 45
      },
      totalCertifications: 65,
      certificationsByTechnology: {
        AWS: 18,
        Azure: 12,
        Databricks: 10,
        Java: 5
      },
      certificationsByRegion: {
        India: 35,
        US: 7,
        UK: 3
      },
      highDemandCertifications: [
        { name: "AWS Solutions Architect", count: 24 },
        { name: "Databricks Developer", count: 18 },
        { name: "Azure AI Engineer", count: 15 }
      ]
    },

    flagshipPrograms: [
      { program: "YMP (Young Managers)", participants: 25, completionRate: 92, learningHours: 120, feedback: 4.6 },
      { program: "Quantum Shift", participants: 18, completionRate: 88, learningHours: 90, feedback: 4.4 },
      { program: "Tech AI Thon", participants: 55, completionRate: 75, learningHours: 220, feedback: 4.8 },
      { program: "Databricks Program", participants: 30, completionRate: 90, learningHours: 150, feedback: 4.5 }
    ],

    learningTrends: [
      { label: "Jan", sessions: 5, trained: 20, hours: 80, certs: 2 },
      { label: "Feb", sessions: 8, trained: 35, hours: 140, certs: 4 },
      { label: "Mar", sessions: 12, trained: 58, hours: 232, certs: 7 },
      { label: "Apr", sessions: 15, trained: 72, hours: 288, certs: 10 },
      { label: "May", sessions: 20, trained: 95, hours: 380, certs: 15 },
      { label: "Jun", sessions: 25, trained: 120, hours: 2656, certs: 45 }
    ],

    trainingEffectiveness: {
      feedbackScore: 4.6,
      trainerRating: 4.5,
      sessionRating: 4.3,
      recommendationPct: 85,
      attendanceRate: 89.4,
      completionRate: 84.2,
      bestRatedTrainings: [
        { title: "GenAI & Prompt Engineering Foundation", rating: 4.8 },
        { title: "AWS Cloud Practitioner & DevOps Essentials", rating: 4.5 }
      ],
      bestRatedTrainers: [
        { name: "Dr. Priya Sharma", rating: 4.9 },
        { name: "Amit Patel", rating: 4.7 }
      ]
    },

    learningChampions: {
      topLearnerOfTheQuarter: "Aarav Sharma",
      topAILearner: "Akash Patel",
      topCertifiedEmployee: "Neha Singh",
      learningChampionsList: ["Aarav Sharma", "Megha Rana", "Karan Singh", "Rohit Vaishnav", "Nisha Sharma"]
    },

    projectInvestment: [
      { project: "Project-105", trained: 12, hours: 124.5, certs: 3, aiScore: 84.5, coverage: 80 },
      { project: "Project-112", trained: 10, hours: 108.0, certs: 2, aiScore: 78.0, coverage: 75 },
      { project: "Project-108", trained: 8, hours: 98.4, certs: 1, aiScore: 82.5, coverage: 70 },
      { project: "Project-114", trained: 7, hours: 95.0, certs: 2, aiScore: 90.0, coverage: 85 }
    ],

    fresherJourney: {
      funnel: {
        campusHiring: 50,
        trainingEnrollment: 50,
        trainingCompletion: 45,
        certificationCompletion: 40,
        projectAllocation: 42,
        billableDeployment: 38
      },
      freshersHired: 50,
      trainingCompletionRate: 90.0,
      certificationCompletionRate: 80.0,
      deploymentRate: 76.0,
      avgTimeToDeploymentDays: 105
    },

    futureEnhancements: {
      skillGapAnalysis: [
        { skill: "GenAI / LangChain", current: 45, required: 80 },
        { skill: "AWS Cloud Architecture", current: 65, required: 85 },
        { skill: "Databricks & Spark", current: 30, required: 75 }
      ],
      suggestedCourses: [
        { title: "Advanced Kubernetes Patterns", reason: "Popular in DevOps practice" },
        { title: "Generative AI Agents", reason: "Highly demanded skill gap in AI" }
      ],
      predictiveForecasts: {
        certificationCompletionPrediction: "84% success rate predicted",
        learningRiskIndicators: "5 learners behind schedule",
        aiReadinessForecast: "+25% increase in AI capacity next quarter"
      }
    }
  };

  // Data states
  const [data, setData] = useState(MOCK_ANALYTICS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard metrics (disabled to use local mock data)
  const fetchDashboardData = useCallback(async () => {
    // Local mock loading simulation if needed, currently instant
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // CSV Export logic
  const handleExportCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `Xebia_LMS_${activeTab}_Report.csv`;
    
    if (activeTab === 'summary') {
      const s = data.executiveSummary;
      csvContent += "Metric,Value\n";
      csvContent += `Total Employees,${s.totalEmployees}\n`;
      csvContent += `Employees Nominated,${s.employeesNominated}\n`;
      csvContent += `Employees Trained,${s.employeesTrained}\n`;
      csvContent += `Learning Coverage %,${s.learningCoveragePct}%\n`;
      csvContent += `Sessions Conducted,${s.totalSessionsConducted}\n`;
      csvContent += `Learning Hours,${s.totalLearningHours}\n`;
      csvContent += `Certifications Completed,${s.totalCertificationsCompleted}\n`;
      csvContent += `AI Trained,${s.employeesTrainedInAI}\n`;
    } else if (activeTab === 'coverage') {
      csvContent += "Dimension,Name,Coverage %\n";
      Object.entries(data.learningCoverage.regionCoverage).forEach(([k, v]) => {
        csvContent += `Region,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.locationCoverage).forEach(([k, v]) => {
        csvContent += `Location,${k},${v}%\n`;
      });
      Object.entries(data.learningCoverage.gradeCoverage).forEach(([k, v]) => {
        csvContent += `Grade,${k},${v}%\n`;
      });
    } else if (activeTab === 'hours') {
      csvContent += "Learner Name,Total Hours\n";
      data.learningHoursAnalytics.topLearners.forEach(l => {
        csvContent += `"${l.name}",${l.hours}\n`;
      });
    } else if (activeTab === 'pillars') {
      csvContent += "Pillar Name,Hours,Trained Employees\n";
      data.learningPillars.forEach(p => {
        csvContent += `"${p.pillar}",${p.hours},${p.trained}\n`;
      });
    } else if (activeTab === 'ai') {
      const ai = data.aiTransformation;
      csvContent += "AI Metric,Value\n";
      csvContent += `AI Readiness Index,${ai.aiReadinessIndex}%\n`;
      csvContent += `Trained on AI,${ai.employeesTrainedOnAI}\n`;
      csvContent += `Certified on AI,${ai.employeesCertifiedOnAI}\n`;
      csvContent += `AI Learning Hours,${ai.aiLearningHours}\n`;
    } else if (activeTab === 'certifications') {
      csvContent += "Technology,Completed Certifications\n";
      Object.entries(data.certificationTracker.certificationsByTechnology).forEach(([k, v]) => {
        csvContent += `"${k}",${v}\n`;
      });
    } else if (activeTab === 'flagship') {
      csvContent += "Program Name,Participants,Hours,Feedback Rating\n";
      data.flagshipPrograms.forEach(p => {
        csvContent += `"${p.program}",${p.participants},${p.learningHours},${p.feedback}\n`;
      });
    } else if (activeTab === 'trends') {
      csvContent += "Month,Sessions,Trained,Hours,Certs\n";
      data.learningTrends.forEach(t => {
        csvContent += `"${t.label}",${t.sessions},${t.trained},${t.hours},${t.certs}\n`;
      });
    } else if (activeTab === 'effectiveness') {
      const e = data.trainingEffectiveness;
      csvContent += "Effectiveness Metric,Score\n";
      csvContent += `Feedback Rating,${e.feedbackScore}/5\n`;
      csvContent += `Trainer Rating,${e.trainerRating}/5\n`;
      csvContent += `Recommendation %,${e.recommendationPct}%\n`;
      csvContent += `Completion %,${e.completionRate}%\n`;
    } else if (activeTab === 'champions') {
      csvContent += "Champion Category,Name\n";
      csvContent += `Top Learner of Quarter,${data.learningChampions.topLearnerOfTheQuarter}\n`;
      csvContent += `Top AI Learner,${data.learningChampions.topAILearner}\n`;
      csvContent += `Top Certified,${data.learningChampions.topCertifiedEmployee}\n`;
    } else if (activeTab === 'investment') {
      csvContent += "Project,Trained Employees,Hours,Certs,AI Score,Coverage\n";
      data.projectInvestment.forEach(p => {
        csvContent += `"${p.project}",${p.trained},${p.hours},${p.certs},${p.aiScore},${p.coverage}%\n`;
      });
    } else if (activeTab === 'fresher') {
      csvContent += "Freshers Hired,Training Completion %,Deployment %\n";
      csvContent += `${data.fresherJourney.freshersHired},${data.fresherJourney.trainingCompletionRate}%,${data.fresherJourney.deploymentRate}%\n`;
    } else {
      csvContent += "Skill,Current Level,Required Level\n";
      data.futureEnhancements.skillGapAnalysis.forEach(sg => {
        csvContent += `"${sg.skill}",${sg.current}%,${sg.required}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filename}`, 'success');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Predefined options matching Spring Boot Controller mappings
  const yearOptions = ['2026', '2025'];
  const quarterOptions = [
    { label: 'All Quarters', value: 'all' },
    { label: 'Q1 (Jan - Mar)', value: 'q1' },
    { label: 'Q2 (Apr - Jun)', value: 'q2' },
    { label: 'Q3 (Jul - Sep)', value: 'q3' },
    { label: 'Q4 (Oct - Dec)', value: 'q4' }
  ];
  const regionOptions = ['all', 'India', 'US', 'UK'];
  const locationOptions = ['all', 'Delhi', 'Gurgaon', 'Bangalore', 'Pune', 'Noida', 'Mumbai'];
  const buOptions = ['all', 'Digital', 'Cloud & Infra', 'Data & AI', 'Advisory'];
  const deptOptions = ['all', 'Computer Science', 'Information Technology', 'DevOps & Cloud', 'AI & Analytics'];
  const practiceOptions = ['all', 'Java', 'Python', 'Cloud Native', 'GenAI', 'Security'];
  const gradeOptions = ['all', 'E1', 'E2', 'E3', 'M1', 'M2'];

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-success border-t-transparent" />
          <p className="text-sm font-medium text-brand-text-secondary">Connecting to Backend Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-surface p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-brand-text-primary">Analytics Connection Offline</h2>
          <p className="text-sm text-brand-text-secondary">{error}</p>
          <Button onClick={fetchDashboardData} className="w-full">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-[#F8FAFC] px-8 pb-8 pt-6 transition-colors duration-300">
      
      {/* ── Premium Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 50%, #7C3AED 100%)',
          boxShadow: '0 0 50px -12px rgba(109,40,217,0.3)',
        }}
        className="mb-8 rounded-[24px] text-white p-10 lg:p-12 ring-1 ring-white/20 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute right-[-10%] top-[-20%] h-80 w-80 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] h-64 w-64 rounded-full bg-purple-550/15 blur-2xl pointer-events-none" />

        {/* Left Section (60% width) */}
        <div className="relative z-10 space-y-5 w-full lg:w-[58%]">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.1] max-w-xl">
            Learning Management Dashboard
          </h2>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium max-w-[500px] line-clamp-3">
            Manage courses, categories, learning programs, and training content from a centralized admin workspace. Track platform performance, monitor learner engagement, and streamline your organization's learning experience.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {[
              '2026',
              'Q2',
              'AI Transformation',
              '120 Employees',
              '8 Sessions'
            ].map((badge, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-4 py-1.5 h-8 flex items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section (40% width - Symmetrical 2x2 Stats Cards Grid) */}
        <div className="relative z-10 grid grid-cols-2 gap-5 w-full lg:w-[40%] shrink-0 min-w-[300px] lg:min-w-[460px]">
          {[
            { label: 'Total Learners', val: data?.executiveSummary?.employeesTrained || 120, icon: Users },
            { label: 'Completion Rate', val: `${data?.executiveSummary?.learningCoveragePct || 88}%`, icon: Percent },
            { label: 'Training Hours', val: `${data?.executiveSummary?.totalLearningHours || 2656} hrs`, icon: Clock },
            { label: 'AI Certified', val: data?.executiveSummary?.employeesTrainedInAI || 59, icon: Brain }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ 
                  y: -6, 
                  boxShadow: '0 0 20px rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.14)'
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
                className="rounded-[18px] p-5 shadow-lg flex flex-col justify-between min-h-[125px] w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center bg-purple-500/20 backdrop-blur-md shadow-inner text-purple-200">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-white/75 block">{stat.label}</span>
                  <span className="text-[34px] font-bold text-white block leading-none tracking-tight">{stat.val}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Filters Toolbar ── */}
      <div className="mb-8 rounded-3xl border border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-7 shadow-sm text-slate-800 dark:text-[#F8FAFC] transition-colors duration-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 border-b border-slate-100 dark:border-[#334155] pb-3 select-none">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#8B5CF6]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#F8FAFC]">Organizational Filters</span>
          </div>
          
          {/* Action buttons inside filter card header */}
          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-250 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5" /> Export Report
            </button>
            <Link to="/admin/courses/new">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer border-0"
              >
                <Plus className="h-4 w-4" /> Add Course
              </motion.button>
            </Link>
          </div>
        </div>
        
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Year', val: filters.year, opts: yearOptions, key: 'year' },
            { label: 'Quarter', val: filters.quarter, opts: quarterOptions, key: 'quarter', isObj: true },
            { label: 'Region', val: filters.region, opts: regionOptions, key: 'region' },
            { label: 'Location', val: filters.location, opts: locationOptions, key: 'location' },
            { label: 'Department', val: filters.department, opts: deptOptions, key: 'department' },
            { label: 'Practice', val: filters.practice, opts: practiceOptions, key: 'practice' },
            { label: 'Grade', val: filters.employeeGrade, opts: gradeOptions, key: 'employeeGrade' }
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] uppercase tracking-wider">{f.label}</label>
              <select
                value={f.val}
                onChange={e => handleFilterChange(f.key, e.target.value)}
                className="w-full h-[52px] rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1120] px-3.5 text-xs text-slate-800 dark:text-[#F8FAFC] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] hover:border-[#8B5CF6] transition-all duration-200 outline-none cursor-pointer"
              >
                {f.opts.map(o => (
                  <option key={f.isObj ? o.value : o} value={f.isObj ? o.value : o} className="dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                    {f.isObj ? o.label : (o === 'all' ? `All ${f.label}s` : o)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Navigation Tabs ── */}
      <div className="mb-8 flex flex-wrap gap-5 lg:gap-6 border-b border-slate-200 dark:border-[#334155] pb-3 select-none">
        {[
          { id: 'summary', label: 'Executive Summary', icon: BarChart2 },
          { id: 'coverage', label: 'Learning Coverage', icon: Users },
          { id: 'hours', label: 'Learning Hours', icon: Clock },
          { id: 'pillars', label: 'Training Pillars', icon: FolderOpen },
          { id: 'ai', label: 'AI Transformation', icon: Brain },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'flagship', label: 'Flagship Programs', icon: Zap },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'effectiveness', label: 'Effectiveness', icon: CheckCircle },
          { id: 'champions', label: 'Champions', icon: Award },
          { id: 'investment', label: 'Project Investment', icon: HardDrive },
          { id: 'fresher', label: 'Fresher Journey', icon: Users },
          { id: 'future', label: 'Future Analytics', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer relative ${
                active
                  ? 'bg-[#6D28D9]/15 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300'
                  : 'text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {active && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <div className="flex py-20 justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#6D28D9] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-8 animate-fade-in text-slate-805 dark:text-slate-100 select-none">
              
              {/* 10 Key Metrics Cards Grid */}
              <div className="grid gap-5 grid-cols-2 md:grid-cols-5">
                {[
                  { label: 'Total Users', val: '135', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
                  { label: 'Active Students', val: data?.executiveSummary?.employeesTrained || '120', icon: UserPlus, color: 'bg-emerald-500/10 text-emerald-500' },
                  { label: 'Active Admins', val: '5', icon: Shield, color: 'bg-indigo-500/10 text-indigo-500' },
                  { label: 'Total Courses', val: '12', icon: BookOpen, color: 'bg-purple-500/10 text-purple-500' },
                  { label: 'Published Courses', val: '9', icon: CheckCircle, color: 'bg-teal-500/10 text-teal-500' },
                  { label: 'Draft Courses', val: '3', icon: FolderOpen, color: 'bg-amber-500/10 text-amber-500' },
                  { label: 'Total Assessments', val: '24', icon: ClipboardList, color: 'bg-cyan-500/10 text-cyan-500' },
                  { label: 'Certificates Issued', val: data?.executiveSummary?.totalCertificationsCompleted || '45', icon: Award, color: 'bg-violet-500/10 text-violet-500' },
                  { label: 'Learning Hours', val: `${data?.executiveSummary?.totalLearningHours || 2656}h`, icon: Clock, color: 'bg-orange-500/10 text-orange-500' },
                  { label: 'Completion Rate', val: `${data?.executiveSummary?.learningCoveragePct || 88}%`, icon: Percent, color: 'bg-rose-500/10 text-rose-500' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4.5"
                    >
                      <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-[#CBD5E1] block truncate">{stat.label}</span>
                        <span className="text-xl lg:text-2xl font-extrabold tracking-tight mt-0.5 block truncate text-slate-900 dark:text-[#F8FAFC]">{stat.val}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Dashboard Widget Layout */}
              <div className="grid gap-8 lg:grid-cols-12">
                
                {/* Left Column (8 / 12) */}
                <div className="lg:col-span-8 space-y-8">
                  
                  {/* Visual Charts section */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Enrollments */}
                    <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Monthly Enrollments</h4>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">+24% YoY</span>
                      </div>
                      {/* CSS SVG Bar Chart */}
                      <div className="h-44 w-full flex items-end justify-between pt-4 pb-2 px-1">
                        {[
                          { m: 'Jan', val: 32 },
                          { m: 'Feb', val: 45 },
                          { m: 'Mar', val: 56 },
                          { m: 'Apr', val: 78 },
                          { m: 'May', val: 92 },
                          { m: 'Jun', val: 120 }
                        ].map((bar, i) => (
                          <div key={i} className="flex flex-col items-center flex-1 gap-2">
                            <div className="w-8 rounded-t bg-gradient-to-t from-purple-600 to-indigo-500 hover:opacity-85 transition-all relative group" style={{ height: `${(bar.val / 120) * 110}px` }}>
                              <span className="absolute top-[-26px] left-1/2 -translate-x-1/2 bg-slate-850 dark:bg-[#0B1120] text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm">{bar.val}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1]">{bar.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User Growth */}
                    <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">User Growth Trend</h4>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">MoM Growth</span>
                      </div>
                      {/* SVG Line Graph */}
                      <div className="h-44 w-full relative pt-4">
                        <svg className="w-full h-32" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,80 Q50,60 100,50 T200,30 T300,10" fill="none" stroke="#10B981" strokeWidth="3" />
                          <path d="M0,80 Q50,60 100,50 T200,30 T300,10 L300,100 L0,100 Z" fill="url(#growthGrad)" />
                        </svg>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] mt-2">
                          <span>Jan</span>
                          <span>Mar</span>
                          <span>May</span>
                          <span>Jun</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Learning Analytics */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">AI Learning Analytics & Index</h4>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3 text-xs">
                      <div className="bg-slate-50 dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-[#334155]">
                        <p className="font-semibold text-slate-450 dark:text-[#CBD5E1] uppercase tracking-wider text-[10px]">AI Readiness Index</p>
                        <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{data?.executiveSummary?.learningCoveragePct || 88}%</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-purple-600 h-full" style={{ width: `${data?.executiveSummary?.learningCoveragePct || 88}%` }} />
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-[#334155]">
                        <p className="font-semibold text-slate-450 dark:text-[#CBD5E1] uppercase tracking-wider text-[10px]">AI Certifications</p>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{data?.executiveSummary?.employeesTrainedInAI || 59} Certs</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1]/70 mt-2 font-medium">92% Completion success rate</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-[#334155]">
                        <p className="font-semibold text-slate-450 dark:text-[#CBD5E1] uppercase tracking-wider text-[10px]">GenAI Copilot Activity</p>
                        <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">94.8% Active</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1]/70 mt-2 font-medium">Active coding companion sessions</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Recent Activities Feed</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { text: 'Rohit Vaishnav registered as a new student', time: '10 mins ago', badge: 'User' },
                        { text: 'Dr. Sarah Chen updated Course Module: Cloud Native Deployments', time: '1 hour ago', badge: 'Course' },
                        { text: 'Priya Sharma created assessment: Terraform Automation Basics', time: '3 hours ago', badge: 'Assessment' },
                        { text: 'User Rohit completed certification: AI Foundation Program', time: '5 hours ago', badge: 'Certificate' }
                      ].map((act, idx) => (
                        <div key={act.time} className="flex justify-between items-start gap-4 text-xs border-b border-slate-100 dark:border-[#334155] last:border-0 pb-3 last:pb-0">
                          <div className="flex gap-2.5 items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" />
                            <p className="font-medium text-slate-700 dark:text-[#F8FAFC]">{act.text}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-[#CBD5E1] block">{act.time}</span>
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111827] text-slate-500 dark:text-[#CBD5E1] mt-1 uppercase">{act.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Performers Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Performing Courses */}
                    <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Top Performing Courses</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Docker & Kubernetes Basics', coverage: 95 },
                          { title: 'Spring Boot & Microservices', coverage: 91 },
                          { title: 'Next.js 14 Enterprise Masterclass', coverage: 88 }
                        ].map((c, i) => (
                          <div key={c.title} className="text-xs space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="truncate pr-4 text-slate-800 dark:text-[#F8FAFC]">{c.title}</span>
                              <span className="text-emerald-500 font-bold shrink-0">{c.coverage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${c.coverage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Trainers */}
                    <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Top Instructors</h4>
                      <div className="space-y-3.5">
                        {[
                          { name: 'Dr. Sarah Chen', dept: 'Cloud & DevOps', score: '4.9' },
                          { name: 'Dr. Priya Sharma', dept: 'Data & AI', score: '4.8' },
                          { name: 'Prof. James Wilson', dept: 'Enterprise Java', score: '4.7' }
                        ].map((t, i) => (
                          <div key={t.name} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-[#334155] pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-[#F8FAFC]">{t.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium">{t.dept}</p>
                            </div>
                            <span className="font-black text-xs text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full">⭐ {t.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column (4 / 12) */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* Quick Actions Panel */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Quick Actions Panel</h4>
                    <div className="flex flex-col gap-2.5">
                      <Link to="/admin/courses/new" className="w-full">
                        <Button className="w-full justify-start text-left text-xs py-3 rounded-xl cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" /> Add Course
                        </Button>
                      </Link>
                      <button
                        onClick={() => showToast('Add User opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 py-3 text-xs font-bold text-slate-705 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
                      >
                        <UserPlus className="h-4 w-4 text-purple-500 mr-1" /> Add User
                      </button>
                      <button
                        onClick={() => showToast('Create Assessment opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 py-3 text-xs font-bold text-slate-705 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
                      >
                        <ClipboardList className="h-4 w-4 text-emerald-500 mr-1" /> Create Assessment
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 py-3 text-xs font-bold text-slate-705 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
                      >
                        <FileText className="h-4 w-4 text-blue-500 mr-1" /> Generate Report
                      </button>
                      <button
                        onClick={() => showToast('Publish Certificate opened', 'info')}
                        className="w-full flex items-center gap-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-4 py-3 text-xs font-bold text-slate-705 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
                      >
                        <Award className="h-4 w-4 text-amber-500 mr-1" /> Publish Certificate
                      </button>
                    </div>
                  </div>

                  {/* Latest Course Uploads */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Latest Course Uploads</h4>
                    <div className="space-y-4">
                      {[
                        { title: 'Kubernetes Deep Dive', bu: 'Cloud & Infra', files: '12 submodules' },
                        { title: 'Advanced React Architecture', bu: 'Digital BU', files: '8 submodules' },
                        { title: 'Introduction to GenAI', bu: 'Data & AI BU', files: '6 submodules' }
                      ].map((c, i) => (
                        <div key={c.title} className="text-xs flex gap-3 items-center justify-between border-b border-slate-50 dark:border-[#334155] pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-[#F8FAFC]">{c.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium">{c.bu} · {c.files}</p>
                          </div>
                          <Play className="h-4 w-4 text-purple-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Student Registrations */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Recent Student Registrations</h4>
                    <div className="space-y-3.5">
                      {[
                        { name: 'Rohit Vaishnav', practice: 'Java Development', badge: 'Online' },
                        { name: 'Nisha Sharma', practice: 'GenAI Technologies', badge: 'Online' },
                        { name: 'Kirti Verma', practice: 'Security Services', badge: 'Offline' }
                      ].map((std, i) => (
                        <div key={std.name} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-[#F8FAFC]">{std.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium">{std.practice}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${std.badge === 'Online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-[#CBD5E1]'}`}>{std.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Pending Approvals</h4>
                    <div className="space-y-3 text-xs">
                      {[
                        { text: 'AWS Cloud Practitioner certification request', desc: 'Requested by Rohit Vaishnav' },
                        { text: 'Terraform Advanced course draft publish request', desc: 'Uploaded by Amit Patel' }
                      ].map((app, i) => (
                        <div key={app.text} className="p-3 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-100 dark:border-[#334155] space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-[#F8FAFC] leading-tight">{app.text}</p>
                          <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium">{app.desc}</p>
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => showToast('Approved successfully', 'success')} className="text-[9px] font-bold text-emerald-500 hover:underline bg-transparent border-0 cursor-pointer">Approve</button>
                            <button onClick={() => showToast('Declined request', 'warning')} className="text-[9px] font-bold text-red-500 hover:underline bg-transparent border-0 cursor-pointer">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Live Sessions */}
                  <div className="rounded-3xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] mb-4">Upcoming Live Sessions</h4>
                    <div className="space-y-3.5">
                      {[
                        { title: 'Kubernetes Hands-on Workshop', date: 'July 5th, 2:00 PM', host: 'Sarah Chen' },
                        { title: 'AI & GenAI Integration Q&A Session', date: 'July 8th, 11:00 AM', host: 'Priya Sharma' }
                      ].map((ses, i) => (
                        <div key={ses.title} className="text-xs flex gap-3.5 items-start">
                          <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 shrink-0 text-center min-w-[40px]">
                            <Calendar className="h-4 w-4 mx-auto" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-[#F8FAFC]">{ses.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium">Host: {ses.host} · {ses.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LEARNING COVERAGE */}
          {activeTab === 'coverage' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in text-slate-805 dark:text-[#F8FAFC]">
              <div className="rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Coverage by Region & Location</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.locationCoverage).map(([loc, val]) => (
                    <div key={loc} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{loc} location</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #7C3AED, #10B981)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold">Coverage by Employee Grade & BU</h3>
                <div className="space-y-3">
                  {Object.entries(data.learningCoverage.gradeCoverage).map(([grade, val]) => (
                    <div key={grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Grade {grade}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)' }} />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-4 pt-3" />
                  {Object.entries(data.learningCoverage.businessUnitCoverage).map(([bu, val]) => (
                    <div key={bu} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>BU: {bu}</span>
                        <span>{val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#10B981]" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TOTAL LEARNING HOURS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.learningHoursAnalytics.totalLearningHours} hrs</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG HOURS PER EMPLOYEE</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.learningHoursAnalytics.avgLearningHoursPerEmployee} hrs</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG HOURS PER ACTIVE LEARNER</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.learningHoursAnalytics.avgLearningHoursPerActiveLearner} hrs</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Top 10 Learners</h3>
                  <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-brand-background border-b border-brand-border font-bold">
                          <th className="px-4 py-2">Learner</th>
                          <th className="px-4 py-2 text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.learningHoursAnalytics.topLearners.map((l, idx) => (
                          <tr key={idx} className="border-b border-brand-border last:border-0">
                            <td className="px-4 py-2 font-medium">{l.name}</td>
                            <td className="px-4 py-2 text-right font-bold text-[#01ac9f]">{l.hours} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Hours by Project & Region</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-brand-text-secondary">Projects Investment</p>
                      {data.learningHoursAnalytics.topProjects.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{p.project}</span>
                          <span className="font-semibold text-brand-text-primary">{p.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-brand-border/60 my-4" />
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-brand-text-secondary">Regions Distribution</p>
                      {data.learningHoursAnalytics.topRegions.map((r, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{r.region}</span>
                          <span className="font-semibold text-brand-text-primary">{r.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING PILLARS */}
          {activeTab === 'pillars' && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
              {data.learningPillars.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
                    <h4 className="text-xs font-bold text-brand-text-primary">{p.pillar}</h4>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-xs text-brand-text-secondary">
                    <span>Trained Employees:</span>
                    <strong className="text-brand-text-primary">{p.trained}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-brand-text-secondary">
                    <span>Total Learning Hours:</span>
                    <strong className="text-[#01ac9f]">{p.hours} hrs</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AI TRANSFORMATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI READINESS INDEX</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.aiTransformation.aiReadinessIndex}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINED ON AI</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.aiTransformation.employeesTrainedOnAI}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI CERTIFICATIONS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.aiTransformation.employeesCertifiedOnAI}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AI MATURITY SCORE</p>
                  <p className="text-3xl font-extrabold mt-1 text-amber-500">{data.aiTransformation.aiMaturityScore} / 100</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Adoption Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Registered Pool', val: data.aiTransformation.funnel.registered, pct: 100, color: 'bg-slate-500' },
                      { label: 'Nominated Pool', val: data.aiTransformation.funnel.attended, pct: Math.round((data.aiTransformation.funnel.attended / data.aiTransformation.funnel.registered) * 100), color: 'bg-blue-500' },
                      { label: 'Trained Pool', val: data.aiTransformation.funnel.completed, pct: Math.round((data.aiTransformation.funnel.completed / data.aiTransformation.funnel.registered) * 100), color: 'bg-purple-500' },
                      { label: 'Certified Pool', val: data.aiTransformation.funnel.certified, pct: Math.round((data.aiTransformation.funnel.certified / data.aiTransformation.funnel.registered) * 100), color: 'bg-green-500' },
                      { label: 'Active Tool Usage', val: data.aiTransformation.funnel.usingAITools, pct: Math.round((data.aiTransformation.funnel.usingAITools / data.aiTransformation.funnel.registered) * 100), color: 'bg-amber-500' }
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{step.label}</span>
                          <span>{step.val} ({step.pct}%)</span>
                        </div>
                        <div className="h-3 w-full rounded-lg bg-brand-surface overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Tools Adoption</h3>
                  <div className="space-y-4">
                    {data.aiTransformation.toolsAdoption.map((ta, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{ta.tool}</span>
                        <Badge color="blue">{ta.count} active developers</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Certification Pipeline Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Assigned Certifications', count: data.certificationTracker.funnel.assigned, color: '#f59e0b' },
                      { label: 'Enrolled & Started', count: data.certificationTracker.funnel.enrolled, color: '#3b82f6' },
                      { label: 'Completed & Submitted', count: data.certificationTracker.funnel.completed, color: '#8b5cf6' },
                      { label: 'Zoho Approved', count: data.certificationTracker.funnel.approvedInZoho, color: '#10b981' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2.5">
                        <span className="font-medium text-brand-text-secondary">{item.label}</span>
                        <span className="font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: item.color }}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Certifications by Technology</h3>
                  <div className="space-y-3">
                    {Object.entries(data.certificationTracker.certificationsByTechnology).map(([tech, count]) => (
                      <div key={tech} className="flex justify-between items-center text-xs">
                        <span>{tech}</span>
                        <strong className="text-[#01ac9f]">{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FLAGSHIP PROGRAMS */}
          {activeTab === 'flagship' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Flagship Programs Analytics</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Program Name</th>
                      <th className="px-4 py-3">Participants</th>
                      <th className="px-4 py-3">Completion Rate</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Feedback Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flagshipPrograms.map((p, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-brand-text-primary">{p.program}</td>
                        <td className="px-4 py-3">{p.participants} members</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{p.completionRate}%</td>
                        <td className="px-4 py-3 font-semibold text-[#01ac9f]">{p.learningHours} hrs</td>
                        <td className="px-4 py-3 text-right font-bold text-amber-500">⭐ {p.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: TRENDS */}
          {activeTab === 'trends' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Month-over-Month Learning Progress</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Sessions Conducted</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Learning Hours</th>
                      <th className="px-4 py-3 text-right">Certifications Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.learningTrends.map((t, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold">{t.label}</td>
                        <td className="px-4 py-3">{t.sessions} sessions</td>
                        <td className="px-4 py-3">{t.trained} trainees</td>
                        <td className="px-4 py-3 font-bold text-brand-primary">{t.hours} hrs</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#01ac9f]">{t.certs} certs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: TRAINING EFFECTIVENESS */}
          {activeTab === 'effectiveness' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">FEEDBACK SCORE</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.trainingEffectiveness.feedbackScore} / 5.0</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINER RATING</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.trainingEffectiveness.trainerRating} / 5.0</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">RECOMMENDATION %</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#84117C]">{data.trainingEffectiveness.recommendationPct}%</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Best Rated Courses</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainings.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{br.title}</span>
                        <span className="text-amber-500 font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Top Trainers</h3>
                  <div className="space-y-3">
                    {data.trainingEffectiveness.bestRatedTrainers.map((br, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-brand-border/60 pb-2 last:border-0">
                        <span className="font-semibold">{br.name}</span>
                        <span className="text-[#01ac9f] font-bold">⭐ {br.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: LEARNING CHAMPIONS */}
          {activeTab === 'champions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top Learner of Quarter</p>
                  <h4 className="text-lg font-bold text-[#01ac9f]">{data.learningChampions.topLearnerOfTheQuarter}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Highest study hours recorded</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top AI Transformation Learner</p>
                  <h4 className="text-lg font-bold text-[#84117C]">{data.learningChampions.topAILearner}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Top scorer in AI certifications</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary uppercase">Top Certified Pioneer</p>
                  <h4 className="text-lg font-bold text-brand-primary">{data.learningChampions.topCertifiedEmployee}</h4>
                  <p className="text-[10px] text-brand-text-secondary">Completed multiple certifications</p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Executive Learning Champions List</h3>
                <div className="grid gap-3 sm:grid-cols-5 text-center">
                  {data.learningChampions.learningChampionsList.map((champ, idx) => (
                    <div key={idx} className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                      <span className="text-xl">🏆</span>
                      <p className="text-xs font-bold text-brand-text-primary mt-1">{champ}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PROJECT INVESTMENT */}
          {activeTab === 'investment' && (
            <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-brand-text-primary">Project learning investments</h3>
              <div className="overflow-x-auto rounded-lg border border-brand-border bg-brand-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-brand-background border-b border-brand-border font-bold">
                      <th className="px-4 py-3">Project Code</th>
                      <th className="px-4 py-3">Employees Trained</th>
                      <th className="px-4 py-3">Total Hours Invested</th>
                      <th className="px-4 py-3">Certifications Achieved</th>
                      <th className="px-4 py-3">AI Readiness Score</th>
                      <th className="px-4 py-3 text-right">Coverage Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectInvestment.map((p, idx) => (
                      <tr key={idx} className="border-b border-brand-border last:border-0">
                        <td className="px-4 py-3 font-semibold text-brand-text-primary">{p.project}</td>
                        <td className="px-4 py-3">{p.trained} trainees</td>
                        <td className="px-4 py-3 font-semibold text-[#01ac9f]">{p.hours} hrs</td>
                        <td className="px-4 py-3">{p.certs} completed</td>
                        <td className="px-4 py-3 font-bold text-[#84117C]">{p.aiScore} pts</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{p.coverage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: FRESHER JOURNEY */}
          {activeTab === 'fresher' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">CAMPUS RECRUITS</p>
                  <p className="text-3xl font-extrabold mt-1 text-[#01ac9f]">{data.fresherJourney.freshersHired}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">TRAINING COMPLETION</p>
                  <p className="text-3xl font-extrabold mt-1 text-green-600">{data.fresherJourney.trainingCompletionRate}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">DEPLOYMENT RATE</p>
                  <p className="text-3xl font-extrabold mt-1 text-brand-primary">{data.fresherJourney.deploymentRate}%</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-background p-4 text-center">
                  <p className="text-xs font-semibold text-brand-text-secondary">AVG TIME TO DEPLOY</p>
                  <p className="text-3xl font-extrabold mt-1 text-amber-500">{data.fresherJourney.avgTimeToDeploymentDays} Days</p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text-primary">Campus to Deployment Funnel Tracker</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Hired & Inducted', count: data.fresherJourney.funnel.campusHiring, color: 'bg-slate-400' },
                    { label: 'Enrolled in Technical Training', count: data.fresherJourney.funnel.trainingEnrollment, color: 'bg-blue-400' },
                    { label: 'Completed Learning Journey', count: data.fresherJourney.funnel.trainingCompletion, color: 'bg-purple-400' },
                    { label: 'Acquired Certification', count: data.fresherJourney.funnel.certificationCompletion, color: 'bg-pink-400' },
                    { label: 'Project Allocated', count: data.fresherJourney.funnel.projectAllocation, color: 'bg-amber-400' },
                    { label: 'Billably Deployed', count: data.fresherJourney.funnel.billableDeployment, color: 'bg-green-500' }
                  ].map((step, idx) => {
                    const maxCount = data.fresherJourney.funnel.campusHiring;
                    const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{step.label}</span>
                          <span>{step.count} candidates ({pct}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-lg bg-brand-surface overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FUTURE ANALYTICS */}
          {activeTab === 'future' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-[#84117C]" /> Skill Gap Analysis Matrix
                  </h3>
                  <div className="space-y-4">
                    {data.futureEnhancements.skillGapAnalysis.map((sg, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{sg.skill}</span>
                          <span>Current: {sg.current}% / Target: {sg.required}%</span>
                        </div>
                        <div className="relative h-3 w-full rounded-lg bg-brand-surface overflow-hidden">
                          {/* target indicator */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${sg.required}%` }} title="Target Required" />
                          <div className="h-full bg-gradient-to-r from-[#01ac9f] to-[#84117C]" style={{ width: `${sg.current}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-brand-text-primary">Predictive Forecasts & Risk Indicators</h3>
                  <div className="space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 text-green-700 p-3 rounded-lg text-xs">
                      <strong>🔮 Certification Forecast:</strong> {data.futureEnhancements.predictiveForecasts.certificationCompletionPrediction}
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3 rounded-lg text-xs">
                      <strong>⚠️ Risk Warning:</strong> {data.futureEnhancements.predictiveForecasts.learningRiskIndicators}
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 p-3 rounded-lg text-xs">
                      <strong>🚀 AI Readiness Forecast:</strong> {data.futureEnhancements.predictiveForecasts.aiReadinessForecast}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-brand-background p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-brand-text-primary">Suggested Skills Mitigation Courses</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {data.futureEnhancements.suggestedCourses.map((sc, idx) => (
                    <div key={idx} className="bg-brand-surface p-3.5 rounded-lg border border-brand-border space-y-1">
                      <p className="font-bold text-brand-text-primary">{sc.title}</p>
                      <p className="text-brand-text-secondary">{sc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

