import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Compass, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { useToast } from '@/hooks-lms/useToast';

export default function RecommendedCourses({ recommendations = [], isLoading = false }) {
  const { showToast } = useToast();

  const handleEnroll = (courseName) => {
    showToast(`Successfully enrolled in "${courseName}"! Ready to start learning.`, 'success');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-brand-border bg-white p-8 text-center text-brand-text-secondary dark:border-slate-800 dark:bg-slate-900">
        No recommendations available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-card transition-all hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Thumbnail Header */}
            <div>
              <div className="relative h-44 overflow-hidden bg-brand-surface dark:bg-slate-800">
                <img
                  src={rec.thumbnail}
                  alt={rec.courseName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay Metadata */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-brand-text-primary shadow-sm dark:bg-slate-900 dark:text-slate-100">
                  <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                  {rec.rating}
                </div>

                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  {rec.category}
                </div>
              </div>

              {/* Course details */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider text-brand-text-secondary">
                  <span>{rec.skillLevel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {rec.duration}
                  </span>
                </div>

                <h4 className="font-bold text-brand-text-primary dark:text-slate-100 mt-2 line-clamp-1 text-sm md:text-base">
                  {rec.courseName}
                </h4>

                <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed line-clamp-2">
                  {rec.description}
                </p>

                {/* Reason box */}
                <div className="mt-4 flex gap-2 rounded-xl bg-gradient-to-br from-brand-primary/5 to-accent-teal/5 p-3 border border-brand-primary/10 dark:border-slate-800">
                  <Sparkles className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-brand-text-secondary leading-normal font-medium">
                    <strong className="text-brand-text-primary dark:text-slate-200">Recommended because:</strong> {rec.whyRecommended}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="p-5 pt-0 mt-auto border-t border-brand-border/40 dark:border-slate-850">
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                >
                  View Course
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEnroll(rec.courseName)}
                  className="w-full text-xs shadow-sm"
                >
                  Enroll Now
                </Button>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}

