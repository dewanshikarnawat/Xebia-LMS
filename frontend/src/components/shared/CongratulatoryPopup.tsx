import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, X, CheckCircle, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { certificateService, type Certificate } from '../../services/certificate.service';

interface CongratulatoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  activityTitle: string;
  score: number;
  maxScore: number;
  assignmentOrQuizId: string;
}

export const CongratulatoryPopup: React.FC<CongratulatoryPopupProps> = ({
  isOpen,
  onClose,
  certificate,
  activityTitle,
  score,
  maxScore,
  assignmentOrQuizId
}) => {
  const navigate = useNavigate();
  // Trigger internal visual checks or effects on mount if needed
  useEffect(() => {
    if (isOpen) {
      // Audio or other triggers can be put here
    }
  }, [isOpen]);

  if (!isOpen || !certificate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="relative p-6 text-center select-none overflow-hidden font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Celebrating Background Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-emerald-500/10 to-purple-500/10 dark:from-emerald-500/5 dark:to-purple-500/5 rounded-full blur-2xl -z-10 animate-pulse" />

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 transform rotate-12 hover:rotate-0 transition-transform duration-300">
          <Award size={42} className="animate-bounce" />
          <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-[#1E293B]">
            <CheckCircle size={12} />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-6 space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 tracking-tight">
            <span>Congratulations!</span>
            <Sparkles size={20} className="text-yellow-400 fill-yellow-400" />
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-4">
            You have successfully completed and passed the activity criteria!
          </p>
        </div>

        {/* Activity Summary Card */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-left space-y-3.5">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Activity Name</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{activityTitle}</p>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Your Score</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {score.toFixed(1)} / {maxScore.toFixed(1)} Pts
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Certificate ID</span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                {certificate?.certificateId || 'Pending Download'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#4A1F4F]/10"
            onClick={() => {
              navigate(`/student/certificates/preview/${assignmentOrQuizId}`);
              onClose();
            }}
          >
            <Award size={14} />
            <span>View Certificate</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-2.5"
            onClick={onClose}
          >
            Back to Portal
          </Button>
        </div>

      </div>
    </Modal>
  );
};
