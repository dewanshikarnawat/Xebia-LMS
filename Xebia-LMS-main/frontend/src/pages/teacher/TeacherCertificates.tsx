import React, { useEffect, useState } from 'react';
import { Award, Search, Calendar, Download, Eye, ExternalLink, ShieldCheck, AlertCircle, RefreshCw, Users, CheckCircle2, PlayCircle, BarChart2, Settings } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/shared/EmptyState';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import api from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StudentProgressRow {
  studentId: string;
  studentName: string;
  enrollmentNumber: string;
  batchName: string;
  subjectName: string;
  assignmentMarksSecured: number;
  assignmentMarksMax: number;
  assignmentPercentage: number;
  quizMarksSecured: number;
  quizMarksMax: number;
  quizPercentage: number;
  overallPercentage: number;
  isCoursePassed: boolean;
  status: 'Eligible' | 'Not Eligible' | 'Generated';
  generatedDate?: string;
  certificateId?: string;
  pdfUrl?: string;
  verificationToken?: string;
  qrCodeUrl?: string;
}

export const TeacherCertificates: React.FC = () => {
  const [rows, setRows] = useState<StudentProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [certToDownload, setCertToDownload] = useState<any | null>(null);
  const downloadRef = React.useRef<HTMLDivElement>(null);

  const downloadCertificatePDF = async (cert: any) => {
    setCertToDownload(cert);
    setTimeout(async () => {
      if (!downloadRef.current) return;
      const loadingToast = toast.loading(`Generating certificate for ${cert.studentName}...`);
      try {
        const element = downloadRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#faf5ed'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`certificate-${cert.studentName.replace(/[^a-zA-Z0-9]/g, '_')}-${cert.subjectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

        toast.success('Certificate downloaded successfully!', { id: loadingToast });
      } catch (err) {
        console.error(err);
        toast.error('Failed to generate PDF', { id: loadingToast });
      } finally {
        setCertToDownload(null);
      }
    }, 100);
  };

  // Configuration Form State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configSubject, setConfigSubject] = useState('');
  const [configAssignmentPass, setConfigAssignmentPass] = useState(40);
  const [configQuizPass, setConfigQuizPass] = useState(40);
  const [configMinCert, setConfigMinCert] = useState(75);
  const [configReqAssignment, setConfigReqAssignment] = useState(100);
  const [configReqQuiz, setConfigReqQuiz] = useState(100);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch batches
      const batchesRes = await api.get('/teacher/batches');
      const batchesData = batchesRes.data.data;
      const fetchedBatches = Array.isArray(batchesData) ? batchesData : (batchesData?.content || []);
      setBatches(fetchedBatches);

      // 2. Fetch assignments & quizzes
      const assignmentsRes = await api.get('/teacher/assignments', { params: { page: '0', size: '1000' } });
      const assignmentsData = assignmentsRes.data.data;
      const allAssignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.content || []);
      const publishedTasks = allAssignments.filter((a: any) => a.status !== 'DRAFT');

      // Populate distinct subjects
      const subjects = Array.from(new Set(allAssignments.map((a: any) => (a.subject as string) || 'General'))) as string[];
      setSubjectsList(subjects);
      if (subjects.length > 0 && !configSubject) {
        setConfigSubject(subjects[0]);
      }

      // 3. Fetch certificates
      const certsData = await certificateService.searchCertificatesForTeacher();

      // 4. Fetch students for each batch
      const studentsPromises = fetchedBatches.map(async (b: any) => {
        try {
          const res = await api.get(`/teacher/batches/${b.id}/students`);
          return { batchId: String(b.id), batchName: b.batchName, students: res.data.data || [] };
        } catch {
          return { batchId: String(b.id), batchName: b.batchName, students: [] };
        }
      });
      const studentsResults = await Promise.all(studentsPromises);

      // 5. Fetch submissions for published tasks
      const submissionsPromises = publishedTasks.map(async (a: any) => {
        try {
          const res = await api.get(`/teacher/assignments/${a.id}/submitted`);
          return { assignmentId: String(a.id), submissions: res.data.data || [] };
        } catch {
          return { assignmentId: String(a.id), submissions: [] };
        }
      });
      const submissionsResults = await Promise.all(submissionsPromises);

      const submissionsMap = new Map<string, Map<string, any>>();
      submissionsResults.forEach((res: any) => {
        const innerMap = new Map<string, any>();
        res.submissions.forEach((s: any) => {
          innerMap.set(String(s.studentId), s);
        });
        submissionsMap.set(res.assignmentId, innerMap);
      });

      // 6. Compile progress per student, per subject
      const compiledRows: StudentProgressRow[] = [];

      studentsResults.forEach(({ batchId, batchName, students }) => {
        const batchTasks = publishedTasks.filter((t: any) => String(t.batchId) === batchId);
        
        // Find all subjects in this batch
        const batchSubjects = Array.from(new Set(batchTasks.map((t: any) => (t.subject as string) || 'General'))) as string[];

        students.forEach((student: any) => {
          batchSubjects.forEach((subject) => {
            // Load subject configuration
            const configStr = localStorage.getItem(`lms_cert_config_${subject}`);
            const config = configStr ? JSON.parse(configStr) : {
              assignmentPassingMarksPct: 40,
              quizPassingMarksPct: 40,
              minCertificateMarksPct: 75,
              requiredAssignmentCompletionPct: 100,
              requiredQuizCompletionPct: 100,
            };

            const subjectTasks = batchTasks.filter((t: any) => (t.subject || 'General') === subject);
            const subjectAssignments = subjectTasks.filter((t: any) => t.assignmentType !== 'QUIZ');
            const subjectQuizzes = subjectTasks.filter((t: any) => t.assignmentType === 'QUIZ');

            // Find final activity ID for this subject
            let finalActivityId: string | null = null;
            if (subjectQuizzes.length > 0) {
              const sorted = [...subjectQuizzes].sort((x: any, y: any) => Number(y.id) - Number(x.id));
              finalActivityId = String(sorted[0].id);
            } else if (subjectAssignments.length > 0) {
              const sorted = [...subjectAssignments].sort((x: any, y: any) => Number(y.id) - Number(x.id));
              finalActivityId = String(sorted[0].id);
            }

            // Calculations
            let assignmentMarksSecured = 0;
            let assignmentMarksMax = 0;
            let submittedAssignments = 0;

            subjectAssignments.forEach((a: any) => {
              const sub = submissionsMap.get(String(a.id))?.get(String(student.id));
              assignmentMarksMax += a.totalMarks || 100;
              if (sub && (sub.status === 'REVIEWED' || sub.status === 'SUBMITTED')) {
                submittedAssignments++;
                assignmentMarksSecured += sub.marks !== null ? sub.marks : a.totalMarks || 100;
              }
            });

            const assignmentPercentage = assignmentMarksMax > 0 
              ? Math.round((assignmentMarksSecured / assignmentMarksMax) * 100) 
              : 0;

            let quizMarksSecured = 0;
            let quizMarksMax = 0;
            let completedQuizzes = 0;

            subjectQuizzes.forEach((q: any) => {
              const sub = submissionsMap.get(String(q.id))?.get(String(student.id));
              quizMarksMax += q.totalMarks || 100;
              if (sub && (sub.status === 'REVIEWED' || sub.status === 'SUBMITTED')) {
                completedQuizzes++;
                quizMarksSecured += sub.marks !== null ? sub.marks : q.totalMarks || 100;
              }
            });

            const quizPercentage = quizMarksMax > 0 
              ? Math.round((quizMarksSecured / quizMarksMax) * 100) 
              : 0;

            let overallPercentage = 0;
            if (subjectAssignments.length > 0 && subjectQuizzes.length > 0) {
              overallPercentage = Math.round((assignmentPercentage + quizPercentage) / 2);
            } else if (subjectAssignments.length > 0) {
              overallPercentage = assignmentPercentage;
            } else if (subjectQuizzes.length > 0) {
              overallPercentage = quizPercentage;
            }

            const assignmentCompletionRate = subjectAssignments.length > 0 ? (submittedAssignments / subjectAssignments.length) * 100 : 100;
            const quizCompletionRate = subjectQuizzes.length > 0 ? (completedQuizzes / subjectQuizzes.length) * 100 : 100;

            // Check if passing marks are met for all individual tasks in subject
            let allPassing = true;
            subjectTasks.forEach((t: any) => {
              const sub = submissionsMap.get(String(t.id))?.get(String(student.id));
              const score = sub?.marks ?? null;
              const max = t.totalMarks || t.maxMarks || 100;
              const minPassing = t.passingMarks !== undefined ? t.passingMarks : Math.round(max * 0.4);
              const completed = sub && (sub.status === 'REVIEWED' || sub.status === 'SUBMITTED');
              if (!completed || (score !== null && score < minPassing)) {
                allPassing = false;
              }
            });

            const isCoursePassed = 
              assignmentCompletionRate >= config.requiredAssignmentCompletionPct &&
              quizCompletionRate >= config.requiredQuizCompletionPct &&
              allPassing &&
              subjectTasks.length > 0;

            // Check if certificate exists
            const cert = certsData.find((c: Certificate) => 
              String(c.studentId) === String(student.id) && 
              finalActivityId && 
              String(c.quizId || c.assignmentId) === finalActivityId
            );

            // Certificate eligibility: Course is passed, all tasks are completed, and all score conditions are met
            const allTasksCompleted = subjectTasks.every((t: any) => {
              const sub = submissionsMap.get(String(t.id))?.get(String(student.id));
              return sub && (sub.status === 'REVIEWED' || sub.status === 'SUBMITTED');
            });

            let metAllCertMarks = true;
            if (allTasksCompleted) {
              subjectTasks.forEach((t: any) => {
                const sub = submissionsMap.get(String(t.id))?.get(String(student.id));
                const score = sub?.marks ?? 0;
                const max = t.totalMarks || t.maxMarks || 100;
                const parseTaskCertEligibility = (instructionsStr: string = '') => {
                  if (instructionsStr && instructionsStr.trim().startsWith('{')) {
                    try {
                      const meta = JSON.parse(instructionsStr);
                      return meta.certEligibilityMarks !== undefined ? Number(meta.certEligibilityMarks) : 75;
                    } catch {}
                  } else if (instructionsStr) {
                    const match = instructionsStr.match(/\[CERT_ELIGIBILITY:(\d+)\]/);
                    if (match) {
                      return Number(match[1]);
                    }
                  }
                  return 75;
                };
                const certPct = parseTaskCertEligibility(t.instructions);
                const minCertMarks = max * (certPct / 100);
                if (score < minCertMarks) {
                  metAllCertMarks = false;
                }
              });
            } else {
              metAllCertMarks = false;
            }

            let status: 'Eligible' | 'Not Eligible' | 'Generated' = 'Not Eligible';
            if (cert) {
              status = 'Generated';
            } else if (isCoursePassed && allTasksCompleted && metAllCertMarks) {
              status = 'Eligible';
            }

            compiledRows.push({
              studentId: String(student.id),
              studentName: student.fullName || 'Student',
              enrollmentNumber: student.enrollmentNumber || `ENR-${student.id}`,
              batchName: batchName,
              subjectName: subject,
              assignmentMarksSecured,
              assignmentMarksMax,
              assignmentPercentage,
              quizMarksSecured,
              quizMarksMax,
              quizPercentage,
              overallPercentage,
              isCoursePassed,
              status,
              generatedDate: cert ? (cert.generatedAt || cert.completionDate) : undefined,
              certificateId: cert ? cert.certificateId : undefined,
              pdfUrl: cert ? (cert.pdfFileUrl || cert.certificateUrl) : undefined,
              verificationToken: cert ? cert.verificationToken : undefined,
              qrCodeUrl: cert ? cert.qrCodeUrl : undefined,
            });
          });
        });
      });

      setRows(compiledRows);
    } catch (err) {
      setError('Failed to load certificate tracking data');
      toast.error('Failed to compile student status grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update rule editing form values when target subject changes
  useEffect(() => {
    if (configSubject) {
      const configStr = localStorage.getItem(`lms_cert_config_${configSubject}`);
      const config = configStr ? JSON.parse(configStr) : {
        assignmentPassingMarksPct: 40,
        quizPassingMarksPct: 40,
        minCertificateMarksPct: 75,
        requiredAssignmentCompletionPct: 100,
        requiredQuizCompletionPct: 100,
      };
      setConfigAssignmentPass(config.assignmentPassingMarksPct);
      setConfigQuizPass(config.quizPassingMarksPct);
      setConfigMinCert(config.minCertificateMarksPct);
      setConfigReqAssignment(config.requiredAssignmentCompletionPct);
      setConfigReqQuiz(config.requiredQuizCompletionPct);
    }
  }, [configSubject, isConfigOpen]);

  const handleSaveConfig = () => {
    if (!configSubject) return;
    localStorage.setItem(`lms_cert_config_${configSubject}`, JSON.stringify({
      assignmentPassingMarksPct: Number(configAssignmentPass),
      quizPassingMarksPct: Number(configQuizPass),
      minCertificateMarksPct: Number(configMinCert),
      requiredAssignmentCompletionPct: Number(configReqAssignment),
      requiredQuizCompletionPct: Number(configReqQuiz),
    }));
    toast.success(`Rules updated for ${configSubject}!`);
    setIsConfigOpen(false);
    fetchAllData(); // Refresh the list
  };

  const handleVerify = (row: StudentProgressRow) => {
    if (!row.verificationToken) return;
    const verificationUrl = `${window.location.origin}/verify-certificate/${row.verificationToken}`;
    window.open(verificationUrl, '_blank');
  };

  // Filters
  const filteredRows = rows.filter((r) => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          r.enrollmentNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBatch = batchFilter === '' || r.batchName === batchFilter;
    const matchesSubject = subjectFilter === '' || r.subjectName === subjectFilter;
    const matchesStatus = statusFilter === '' || r.status === statusFilter;
    return matchesSearch && matchesBatch && matchesSubject && matchesStatus;
  });

  // KPI summaries
  const totalStudentsCount = Array.from(new Set(rows.map(r => r.studentId))).length;
  const eligibleCount = filteredRows.filter(r => r.status === 'Eligible').length;
  const generatedCount = filteredRows.filter(r => r.status === 'Generated').length;
  const inProgressCount = filteredRows.filter(r => r.status === 'Not Eligible').length;

  const validAssignments = filteredRows.filter(r => r.assignmentMarksMax > 0);
  const avgAssignmentScore = validAssignments.length > 0
    ? Math.round(validAssignments.reduce((sum, r) => sum + r.assignmentPercentage, 0) / validAssignments.length)
    : 0;

  const validQuizzes = filteredRows.filter(r => r.quizMarksMax > 0);
  const avgQuizScore = validQuizzes.length > 0
    ? Math.round(validQuizzes.reduce((sum, r) => sum + r.quizPercentage, 0) / validQuizzes.length)
    : 0;

  return (
    <Layout role="teacher" title="Certificates" subtitle="Monitor course rules, grades, and certificate issuance">
      
      {/* Reports Section Summary panel */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6 select-none">
        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">Total Enrolled</span>
            <Users size={14} />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)] mt-2">{totalStudentsCount}</h3>
        </Card>

        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">Eligible</span>
            <CheckCircle2 size={14} />
          </div>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{eligibleCount}</h3>
        </Card>

        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-blue-500">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">Generated</span>
            <Award size={14} />
          </div>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-2">{generatedCount}</h3>
        </Card>

        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-amber-500">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">In Progress</span>
            <PlayCircle size={14} />
          </div>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">{inProgressCount}</h3>
        </Card>

        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">Avg Assignment</span>
            <BarChart2 size={14} />
          </div>
          <h3 className="text-xl font-black text-[#4A1F4F] mt-2">{avgAssignmentScore}%</h3>
        </Card>

        <Card className="p-4 border border-[var(--brand-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase font-extrabold tracking-wide">Avg Quiz</span>
            <Award size={14} />
          </div>
          <h3 className="text-xl font-black text-emerald-600 mt-2">{avgQuizScore}%</h3>
        </Card>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 select-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#4A1F4F] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors focus:outline-none"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#4A1F4F]"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.batchName}>{b.batchName}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#4A1F4F]"
          >
            <option value="">All Subjects</option>
            {subjectsList.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#4A1F4F]"
          >
            <option value="">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Not Eligible">Not Eligible</option>
            <option value="Generated">Generated</option>
          </select>

          {/* Configure Rules Button */}
          <Button
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-[var(--brand-border)] text-[#4A1F4F] hover:bg-[#F5EAF8]"
            onClick={() => setIsConfigOpen(true)}
          >
            <Settings size={15} />
            <span>Configure Rules</span>
          </Button>

          <Button
            variant="outline"
            className="p-2.5 rounded-xl border-[var(--brand-border)] text-[var(--text-secondary)] hover:text-[#4A1F4F]"
            onClick={fetchAllData}
            disabled={loading}
            title="Refresh Tracking Grid"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Student', 'ID', 'Batch', 'Subject/Course', 'Assignment Score', 'Quiz Score', 'Overall Score', 'Course Result', 'Cert Status', 'Generated Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={11} />)
              ) : error ? (
                <tr>
                  <td colSpan={11} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <AlertCircle size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Please try refreshing or adjusting filters.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={fetchAllData}>
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState
                      icon="award"
                      title="No students found"
                      description="No records matched the filter query."
                    />
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => {
                  const formattedDate = r.generatedDate 
                    ? new Date(r.generatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-';

                  return (
                    <tr key={`${r.studentId}_${r.subjectName}`} className="table-row-hover">
                      <td className="px-4 py-3.5 text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {r.studentName}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {r.enrollmentNumber}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-primary)]">
                        {r.batchName}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {r.subjectName}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">{r.assignmentMarksSecured.toFixed(1)}/{r.assignmentMarksMax.toFixed(1)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] ml-1">({r.assignmentPercentage}%)</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">{r.quizMarksSecured.toFixed(1)}/{r.quizMarksMax.toFixed(1)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] ml-1">({r.quizPercentage}%)</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#4A1F4F]">
                        {r.overallPercentage}%
                      </td>
                      <td className="px-4 py-3.5">
                        {r.isCoursePassed ? (
                          <span className="text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                            Passed
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.status === 'Generated' ? (
                          <span className="text-[9px] uppercase font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                            Generated
                          </span>
                        ) : r.status === 'Eligible' ? (
                          <span className="text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                            Eligible
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                            Not Eligible
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)]">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {r.status === 'Generated' ? (
                            <>
                              <button
                                onClick={() => setSelectedCert(r)}
                                title="Preview Details"
                                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[#F5EAF8] hover:text-[#4A1F4F] dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => downloadCertificatePDF(r)}
                                title="Download PDF"
                                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              >
                                <Download size={15} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic">No Cert</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Config Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configure Course Certificate Rules"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsConfigOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveConfig}>Save Rules</Button>
          </>
        }
      >
        <div className="space-y-4 text-sm select-none">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Select Course / Subject</label>
            <select
              value={configSubject}
              onChange={(e) => setConfigSubject(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#4A1F4F]"
            >
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Assignment Passing Marks (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configAssignmentPass}
                onChange={(e) => setConfigAssignmentPass(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#4A1F4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Quiz Passing Marks (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configQuizPass}
                onChange={(e) => setConfigQuizPass(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#4A1F4F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Minimum Certificate Marks (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={configMinCert}
              onChange={(e) => setConfigMinCert(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#4A1F4F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Req. Assignment Completion (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configReqAssignment}
                onChange={(e) => setConfigReqAssignment(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#4A1F4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Req. Quiz Completion (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configReqQuiz}
                onChange={(e) => setConfigReqQuiz(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full p-2.5 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[#4A1F4F]"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Certificate Details Preview Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Certificate Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedCert(null)}>Close</Button>
            {selectedCert && selectedCert.verificationToken && (
              <Button
                variant="outline"
                className="flex items-center gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                onClick={() => handleVerify(selectedCert)}
              >
                <ShieldCheck size={14} />
                <span>Verify Authenticity</span>
              </Button>
            )}
            {selectedCert && selectedCert.certificateId && (
              <Button variant="primary" onClick={() => downloadCertificatePDF(selectedCert)}>
                <Download size={14} />
                <span>Download PDF</span>
              </Button>
            )}
          </>
        }
      >
        {selectedCert && (
          <div className="space-y-4 text-sm select-none">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-[var(--brand-border)]">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Certificate ID</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">{selectedCert.certificateId}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Student Name</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedCert.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Course Completed</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedCert.subjectName} Course
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Overall Grade Secured</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCert.overallPercentage}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--brand-border)]">
                <span className="text-[var(--text-secondary)]">Issue Date</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {new Date(selectedCert.generatedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800/20 border border-[var(--brand-border)] rounded-2xl">
              <div className="flex flex-col items-center gap-1">
                {selectedCert.qrCodeUrl && (
                  <img
                    src={selectedCert.qrCodeUrl}
                    alt="Verification QR Code"
                    className="w-32 h-32 rounded-lg border border-[var(--brand-border)]"
                  />
                )}
                <span className="text-[10px] text-[var(--text-secondary)] mt-1">Verification Ledger Link QR</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden Certificate element for client-side PDF generation */}
      {certToDownload && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', height: '565px' }}>
          <div ref={downloadRef} className="bg-[#fcf9f5] text-slate-800 rounded-lg border border-neutral-200 p-8 flex flex-col justify-between overflow-hidden" style={{ width: '800px', height: '565px', boxSizing: 'border-box' }}>
            <div className="border-[8px] border-[#4A1F4F] rounded-2xl p-4 flex flex-col justify-between" style={{ height: '100%', boxSizing: 'border-box', position: 'relative' }}>
              
              {/* Inner accent line */}
              <div className="absolute inset-1.5 border border-slate-200 pointer-events-none rounded-lg" />
              
              {/* Header Logos */}
              <div className="flex justify-between items-center z-10">
                <span className="font-bold text-slate-800 text-xs">LMS Portal</span>
                <span className="font-bold text-slate-800 text-xs">Xebia</span>
              </div>

              {/* Body Content */}
              <div className="text-center my-auto flex flex-col justify-center items-center space-y-4">
                <h1 className="font-serif text-3xl font-light tracking-[0.2em] text-[#2c221e] uppercase ml-[0.2em]">
                  Certificate
                </h1>
                <p className="font-serif italic text-[10px] text-[#7c6a5f] tracking-wide">
                  This document proudly certifies that the curriculum assessment was successfully completed by
                </p>
                <h2 className="font-serif text-xl font-bold text-[#4a362d] tracking-wide">
                  {certToDownload.studentName}
                </h2>
                <div className="w-3/5 h-[1px] bg-[#61473b]/40 mx-auto" />
                <p className="text-[9px] text-[#7c6a5f] max-w-md leading-relaxed tracking-wide font-sans">
                  for demonstrating exceptional core competencies, completing requirements, and successfully achieving passing evaluation benchmarks in the dynamic master track suite titled:
                  <span className="block font-serif font-bold text-xs text-[#2c221e] mt-1 italic">
                    "{certToDownload.subjectName} Course"
                  </span>
                </p>
              </div>

              {/* Footer Stamp / Seal / Signature */}
              <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-100 z-10 text-[9px]">
                <div className="flex items-center gap-2">
                  {certToDownload.qrCodeUrl ? (
                    <img src={certToDownload.qrCodeUrl} alt="QR" className="w-10 h-10 object-contain rounded border border-slate-100 bg-white p-0.5" />
                  ) : (
                    <div className="w-10 h-10 rounded border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-0.5 text-[5px] text-slate-400 text-center leading-none">
                      <span>Automatic</span>
                      <span>Verified QR</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[6px] uppercase font-bold text-slate-400">Certificate ID</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {certToDownload.certificateId || "CERT-PENDING"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center w-28 text-center">
                  <div className="w-full border-b border-[#61473b] pb-0.5 min-h-[12px]">
                    <span className="font-serif italic text-[10px] text-indigo-900">
                      {certToDownload.teacherName || "Authorized Instructor"}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-600 block mt-0.5">{certToDownload.teacherName || "Authorized Instructor"}</span>
                  <span className="text-[6px] text-slate-400 block">LMS Evaluator Signature</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
