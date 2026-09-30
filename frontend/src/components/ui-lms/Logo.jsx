'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils-lms';
import { useCatalog } from '@/hooks-lms/useCatalog';

import { Link } from 'react-router-dom';

const LogoSvg = ({ className }) => (
  <img src="/xebia_logo.png" alt="Xebia Logo" className={className} />
);

export default function Logo({ className, iconOnly = false, variant = 'light', subtitle = 'Admin Panel' }) {
  const isDark = variant === 'dark';
  let branding = null;

  try {
    const catalog = useCatalog();
    branding = catalog?.branding;
  } catch (e) {
    // Context may not be available outside CatalogProvider
  }

  const companyName = branding?.companyName || 'Xebia LMS';

  return (
    <Link to="/admin/dashboard" className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative flex h-8 w-8 shrink-0 items-center justify-center cursor-pointer"
      >
        <LogoSvg className="h-full w-full object-contain" />
      </motion.div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={cn(
              'text-sm font-bold tracking-tight transition-colors truncate',
              isDark ? 'text-white' : 'text-brand-text-primary dark:text-slate-50'
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {companyName}
          </span>
          {subtitle && (
            <span 
              className="text-[10px]" 
              style={{ color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#6b7280' }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
