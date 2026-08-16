import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, Calendar, User, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';

export const VerifyCertificate: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      certificateService.verifyCertificate(token)
        .then((res) => {
          setCert(res);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Certificate verification failed. The token might be invalid or expired.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No verification token provided.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center p-4 selection:bg-[#4A1F4F]/10">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#4A1F4F]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform">
        
        {/* Top Accent Band */}
        <div className="h-2.5 bg-gradient-to-r from-[#4A1F4F] to-[#2563EB]" />

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#4A1F4F]/30 border-t-[#4A1F4F] animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verifying certificate authenticity...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 animate-bounce">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verification Failure</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{error}</p>
            <a 
              href="/"
              className="mt-2 text-xs font-semibold text-[#4A1F4F] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Go to Portal Home
            </a>
          </div>
        ) : cert ? (
          <div className="p-8">
            
            {/* Header Badge */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <ShieldCheck size={36} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Authentic Certificate</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Status: Valid & Verified
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="py-6 space-y-4">
              
              {/* ID */}
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400 dark:text-slate-500">Certificate ID</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cert.certificateId}</span>
              </div>

              {/* Student Name */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#F5EAF8]0/10 flex items-center justify-center text-[#4A1F4F] dark:text-purple-400 shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recipient Name</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{cert.studentName}</p>
                </div>
              </div>

              {/* Assignment/Quiz Title */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Activity Completed</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cert.assignmentTitle || cert.quizTitle || cert.assignmentName}
                  </p>
                  <span className="inline-block text-[9px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 bg-[#F5EAF8] dark:bg-purple-950/20 px-1 rounded mt-1">
                    {cert.certificateType}
                  </span>
                </div>
              </div>

              {/* Completion Date */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date of Issue</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {cert.completionDate ? new Date(cert.completionDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : new Date(cert.generatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Teacher Name */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Award size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Instructed & Evaluated By</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{cert.teacherName || 'System Verified Evaluator'}</p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <a
                href={cert.pdfFileUrl || cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <span>View Original PDF</span>
                <ExternalLink size={13} />
              </a>
            </div>

          </div>
        ) : null}

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-800/20 px-8 py-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Xebia LMS Verification Authority · Digitally Signed Cryptographic Ledger
          </p>
        </div>

      </div>
    </div>
  );
};
