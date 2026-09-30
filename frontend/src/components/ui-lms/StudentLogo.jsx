import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils-lms';
import { useCatalog } from '@/hooks-lms/useCatalog';

const LogoSvg = ({ className }) => (
  <img src="/xebia_logo.png" alt="Xebia Logo" className={className} />
);

export default function StudentLogo({ className, iconOnly = false, size = 'md' }) {
  let branding = null;

  try {
    const catalog = useCatalog();
    branding = catalog?.branding;
  } catch (e) {
    // Context may not be available
  }

  const companyName = branding?.companyName || 'Xebia LMS';

  const heightClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const heightClass = heightClasses[size] || heightClasses.md;

  return (
    <Link to="/student/dashboard" className={cn('flex items-center gap-3 select-none', className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={cn('relative flex shrink-0 items-center justify-center cursor-pointer', heightClass)}
      >
        <LogoSvg className="h-full w-full object-contain" />
      </motion.div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-extrabold tracking-tight transition-colors truncate text-white',
              size === 'lg' || size === 'xl' ? 'text-lg' : 'text-sm'
            )}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {companyName}
          </span>
        </div>
      )}
    </Link>
  );
}
