import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Sparkles, Loader2, BookOpen, Star, Award } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function StudentLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/student/leaderboard');
        setLeaderboard(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load leaderboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
            <Trophy className="h-4 w-4" />
          </span>
        );
      case 2:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-700 shadow-md">
            <Medal className="h-4 w-4" />
          </span>
        );
      case 3:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white shadow-md">
            <Medal className="h-4 w-4" />
          </span>
        );
      default:
        return (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500">
            #{rank}
          </span>
        );
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      {/* Premium Leaderboard Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 mb-8 text-white border border-white/5 shadow-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-black tracking-wider uppercase">Rankings</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Student Leaderboard</h2>
            <p className="text-slate-300 text-xs max-w-md leading-relaxed">
              Compete, learn, and rank higher! Scores are compiled dynamically from your assignment evaluations and quiz results.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-6 py-4 rounded-3xl backdrop-blur-md">
            <Trophy className="h-10 w-10 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Top Spot Points</p>
              <p className="text-2xl font-black text-white">{leaderboard[0] ? leaderboard[0].points : 0} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings List Container */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <Trophy className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Rank Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            Performances will appear on the leaderboard after students complete their first assignments or quizzes.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-sm">
          <div className="border-b border-slate-100 dark:border-[#334155] bg-slate-50/60 dark:bg-slate-900/50 p-4">
            <div className="flex items-center gap-3 text-purple-600">
              <Trophy className="h-5 w-5" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Class Standings</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#334155]">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              return (
                <motion.div
                  key={entry.studentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between p-4.5 transition-colors ${rank <= 3 ? 'bg-purple-50/10 dark:bg-purple-950/5' : ''}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0">{getRankBadge(rank)}</div>
                    
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-extrabold text-xs shrink-0">
                      {getInitials(entry.name)}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{entry.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{entry.batchName} • {entry.hours} learning hrs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-right shrink-0">
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                        <Award className="h-3 w-3 text-amber-500" /> {entry.badges} Badges
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold flex items-center justify-end gap-1">
                        <BookOpen className="h-3 w-3 text-blue-500" /> {Math.round(entry.quizScore + entry.assignmentScore)} items
                      </p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100/50 dark:border-purple-900/40">
                      <span className="text-xs font-black">{Math.round(entry.points)} pts</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
