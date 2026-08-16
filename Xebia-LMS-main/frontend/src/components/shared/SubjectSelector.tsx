import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import { teacherService } from '../../services/teacher.service';
import type { Subject } from '../../types';

interface SubjectSelectorProps {
  value: string;
  onChange: (subjectName: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  value,
  onChange,
  error,
  label = 'Subject',
  required = false,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter by semester (optional - can be removed if not needed)
  const [selectedSemester, setSelectedSemester] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch subjects from database (mocked to show specific subjects)
  useEffect(() => {
    const fetchSubjects = () => {
      setLoading(true);
      try {
        const allSubjects: Subject[] = [
          { id: '1', subjectCode: 'CS-501', subjectName: 'FSD', semester: 'Semester 5', department: 'Computer Science' },
          { id: '2', subjectCode: 'CS-402', subjectName: 'DBMS', semester: 'Semester 4', department: 'Computer Science' },
          { id: '3', subjectCode: 'CS-503', subjectName: 'Computer Network', semester: 'Semester 5', department: 'Computer Science' }
        ];

        let data = allSubjects;
        if (selectedSemester) {
          data = allSubjects.filter(s => s.semester === selectedSemester);
        }
        setSubjects(data);

        // Auto-select if only one subject exists
        if (data.length === 1 && !value) {
          const defaultSub = data[0].subjectName; // Only subject name
          onChange(defaultSub);
          localStorage.setItem('lastSelectedSubject', defaultSub);
        } else if (data.length > 1 && !value) {
          // Fallback to last selected subject from localStorage
          const lastSelected = localStorage.getItem('lastSelectedSubject');
          if (lastSelected) {
            const matches = data.some(s => s.subjectName === lastSelected);
            if (matches) {
              onChange(lastSelected);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedSemester, onChange, value]);

  // Extract unique semesters for filter
  const semesters = ['All Semesters', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

  // Local filter for search text
  const filteredSubjects = subjects.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.subjectName.toLowerCase().includes(term) ||
      s.subjectCode?.toLowerCase().includes(term)
    );
  });

  const handleSelect = (s: Subject) => {
    const displayValue = s.subjectName; // Only subject name
    onChange(displayValue);
    localStorage.setItem('lastSelectedSubject', displayValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Get display name for selected value
  const getDisplayName = () => {
    if (!value) return 'Select Subject';
    // If value contains code - name format, extract just the name
    if (value.includes(' - ')) {
      return value.split(' - ')[1];
    }
    return value;
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-sm font-medium text-[var(--text-primary)] block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Toggle Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-[#1E293B] border focus:outline-none rounded-xl py-2.5 px-3.5 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
          error ? 'border-red-500' : 'border-[var(--brand-border)] focus:border-[#4A1F4F]'
        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="truncate text-[var(--text-primary)]">
          {loading ? 'Loading subjects...' : getDisplayName()}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-[var(--text-secondary)] shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl shadow-xl p-3 space-y-3 max-h-[420px] flex flex-col">
            
            {/* Semester Filter (Optional - remove if not needed) */}
            <div className="relative shrink-0">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value === 'All Semesters' ? '' : e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] rounded-lg text-[var(--text-primary)] cursor-pointer appearance-none focus:outline-none focus:border-[#4A1F4F]"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search by subject name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] focus:border-[#4A1F4F] rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                  {subjects.length === 0 ? 'No subjects available' : 'No matching subjects'}
                </div>
              ) : (
                filteredSubjects.map((s) => {
                  const isSelected = value === s.subjectName;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelect(s)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#4A1F4F10] text-[#4A1F4F] dark:text-purple-400 font-semibold'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      <BookOpen 
                        size={16} 
                        className={isSelected ? 'text-[#4A1F4F] dark:text-purple-400' : 'text-[var(--text-secondary)]'} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.subjectName}</p>
                        {s.subjectCode && (
                          <p className="text-[10px] text-[var(--text-secondary)] truncate">Code: {s.subjectCode}</p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};