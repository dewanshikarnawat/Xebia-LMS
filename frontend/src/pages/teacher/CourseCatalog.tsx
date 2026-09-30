import React, { useState, useMemo } from 'react';
import { 
  Folder, BookOpen, Layers, BookMarked, FileText, Plus, Edit2, Trash2, 
  ChevronUp, ChevronDown, ChevronRight, Search, Layout, Filter, Play, 
  File, HelpCircle, ExternalLink, ArrowRight, Settings, Info, Check, X,
  Move, PlusCircle, LayoutGrid, List, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout as MainLayout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { EmptyState } from '../../components/shared/EmptyState';

// Types for Course Catalog Tree
interface Content {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'reading' | 'quiz' | 'external';
  urlOrContent: string;
  duration: number; // in minutes
}

interface Submodule {
  id: string;
  title: string;
  estimatedMinutes: number;
  contents: Content[];
}

interface Module {
  id: string;
  title: string;
  objective: string;
  durationHours: number;
  submodules: Submodule[];
}

interface Course {
  id: string;
  title: string;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  durationWeeks: number;
  modules: Module[];
}

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string; // Gradient color theme indicator
  courses: Course[];
}

// Seed Initial Data
const INITIAL_CATALOG: Category[] = [
  {
    id: 'cat-1',
    name: 'Cloud Computing',
    code: 'CS-CLOUD',
    description: 'Master public cloud deployments, serverless systems, and infrastructure as code.',
    color: 'from-blue-500 to-indigo-600',
    courses: [
      {
        id: 'course-1-1',
        title: 'AWS Cloud Solutions Architect',
        code: 'CS-AWS-201',
        level: 'Intermediate',
        description: 'Design and deploy secure, robust, and scalable solutions on Amazon Web Services.',
        durationWeeks: 12,
        modules: [
          {
            id: 'mod-1-1-1',
            title: 'AWS Core Infrastructure Services',
            objective: 'Understand key computing, networking, and security concepts in AWS.',
            durationHours: 15,
            submodules: [
              {
                id: 'sub-1-1-1-1',
                title: 'Compute & Auto-scaling (EC2)',
                estimatedMinutes: 45,
                contents: [
                  { id: 'c-1', title: 'EC2 Instances Deep Dive', type: 'video', urlOrContent: 'https://vimeo.com/example/ec2-deep-dive', duration: 15 },
                  { id: 'c-2', title: 'Configuring VPC Security Groups', type: 'reading', urlOrContent: 'Detailed text content on inbound/outbound rules.', duration: 10 },
                  { id: 'c-3', title: 'Auto Scaling Configuration Lab', type: 'pdf', urlOrContent: 'https://pdf-storage.com/scaling-lab.pdf', duration: 20 },
                ]
              },
              {
                id: 'sub-1-1-1-2',
                title: 'Virtual Private Cloud (VPC) Networking',
                estimatedMinutes: 60,
                contents: [
                  { id: 'c-4', title: 'Subnets, Routes & Gateways Architecture', type: 'video', urlOrContent: 'https://vimeo.com/example/vpc-architecture', duration: 25 },
                  { id: 'c-5', title: 'VPC Core Concepts Quiz', type: 'quiz', urlOrContent: 'Quiz questions in JSON format.', duration: 15 }
                ]
              }
            ]
          },
          {
            id: 'mod-1-1-2',
            title: 'Serverless Application Architecture',
            objective: 'Leverage managed services to build zero-management backends.',
            durationHours: 10,
            submodules: [
              {
                id: 'sub-1-1-2-1',
                title: 'AWS Lambda & Event-Driven Compute',
                estimatedMinutes: 30,
                contents: [
                  { id: 'c-6', title: 'Writing Lambda Handlers in Node.js', type: 'reading', urlOrContent: 'Guide on exports.handler block structure.', duration: 12 },
                  { id: 'c-7', title: 'API Gateway Integrations', type: 'external', urlOrContent: 'https://aws.amazon.com/api-gateway', duration: 18 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Software Engineering',
    code: 'CS-SWE',
    description: 'Learn modern software design patterns, clean coding practices, and system design.',
    color: 'from-purple-500 to-pink-600',
    courses: [
      {
        id: 'course-2-1',
        title: 'Design Patterns & Systems Architecture',
        code: 'CS-DS-301',
        level: 'Advanced',
        description: 'Understand core architectural patterns, SOLID principles, and microservices.',
        durationWeeks: 8,
        modules: [
          {
            id: 'mod-2-1-1',
            title: 'Creational & Structural Patterns',
            objective: 'Implement object composition and instantiations safely.',
            durationHours: 8,
            submodules: [
              {
                id: 'sub-2-1-1-1',
                title: 'Factory & Singleton Implementations',
                estimatedMinutes: 35,
                contents: [
                  { id: 'c-8', title: 'Thread-Safe Singletons in Java', type: 'reading', urlOrContent: 'Understanding double-checked locking mechanism.', duration: 15 },
                  { id: 'c-9', title: 'Creational Patterns Overview', type: 'pdf', urlOrContent: 'https://design-store.com/creational.pdf', duration: 20 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const CourseCatalog: React.FC = () => {
  const [catalog, setCatalog] = useState<Category[]>(INITIAL_CATALOG);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection/Focus States (Linear/Notion-like hierarchy exploration)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState<string | null>(null);

  // View modes
  const [explorerView, setExplorerView] = useState<'grid' | 'list'>('grid');

  // Modal control states
  const [modalType, setModalType] = useState<'category' | 'course' | 'module' | 'submodule' | 'content' | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Modal Input Fields
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('from-blue-500 to-indigo-600');

  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseWeeks, setCourseWeeks] = useState(8);

  const [modTitle, setModTitle] = useState('');
  const [modObjective, setModObjective] = useState('');
  const [modHours, setModHours] = useState(10);

  const [subTitle, setSubTitle] = useState('');
  const [subMins, setSubMins] = useState(30);

  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState<'video' | 'pdf' | 'reading' | 'quiz' | 'external'>('video');
  const [contentUrl, setContentUrl] = useState('');
  const [contentMins, setContentMins] = useState(15);

  // Dynamic Navigation Resolve
  const activeCategory = useMemo(() => catalog.find(c => c.id === activeCategoryId), [catalog, activeCategoryId]);
  const activeCourse = useMemo(() => activeCategory?.courses.find(co => co.id === activeCourseId), [activeCategory, activeCourseId]);
  const activeModule = useMemo(() => activeCourse?.modules.find(m => m.id === activeModuleId), [activeCourse, activeModuleId]);
  const activeSubmodule = useMemo(() => activeModule?.submodules.find(s => s.id === activeSubmoduleId), [activeModule, activeSubmoduleId]);

  // Search filter
  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return catalog;
    return catalog.map(cat => ({
      ...cat,
      courses: cat.courses.filter(co => 
        co.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        co.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.courses.length > 0 || cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [catalog, searchTerm]);

  // Open modals
  const handleOpenAddModal = (type: typeof modalType) => {
    setEditMode(false);
    setModalType(type);
    // Clear forms
    if (type === 'category') {
      setCatName(''); setCatCode(''); setCatDesc(''); setCatColor('from-blue-500 to-indigo-600');
    } else if (type === 'course') {
      setCourseTitle(''); setCourseCode(''); setCourseLevel('Intermediate'); setCourseDesc(''); setCourseWeeks(8);
    } else if (type === 'module') {
      setModTitle(''); setModObjective(''); setModHours(10);
    } else if (type === 'submodule') {
      setSubTitle(''); setSubMins(30);
    } else if (type === 'content') {
      setContentTitle(''); setContentType('video'); setContentUrl(''); setContentMins(15);
    }
  };

  const handleOpenEditModal = (type: typeof modalType, id: string, data: any) => {
    setEditMode(true);
    setEditTargetId(id);
    setModalType(type);
    
    if (type === 'category') {
      setCatName(data.name); setCatCode(data.code); setCatDesc(data.description); setCatColor(data.color || 'from-blue-500 to-indigo-600');
    } else if (type === 'course') {
      setCourseTitle(data.title); setCourseCode(data.code); setCourseLevel(data.level); setCourseDesc(data.description); setCourseWeeks(data.durationWeeks);
    } else if (type === 'module') {
      setModTitle(data.title); setModObjective(data.objective); setModHours(data.durationHours);
    } else if (type === 'submodule') {
      setSubTitle(data.title); setSubMins(data.estimatedMinutes);
    } else if (type === 'content') {
      setContentTitle(data.title); setContentType(data.type); setContentUrl(data.urlOrContent); setContentMins(data.duration);
    }
  };

  // Move element inside array (Re-ordering helper)
  const reorder = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
    const result = [...list];
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= result.length) return list;
    
    const [removed] = result.splice(index, 1);
    result.splice(newIdx, 0, removed);
    toast.success('Position updated successfully');
    return result;
  };

  // Category CRUD handler
  const saveCategory = () => {
    if (!catName || !catCode) { toast.error('Name and Code are required.'); return; }
    
    if (editMode && editTargetId) {
      setCatalog(prev => prev.map(c => c.id === editTargetId ? { ...c, name: catName, code: catCode, description: catDesc, color: catColor } : c));
      toast.success('Category updated successfully');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catName,
        code: catCode,
        description: catDesc,
        color: catColor,
        courses: []
      };
      setCatalog(prev => [...prev, newCat]);
      toast.success('Category created successfully');
    }
    setModalType(null);
  };

  // Course CRUD handler
  const saveCourse = () => {
    if (!activeCategoryId) return;
    if (!courseTitle || !courseCode) { toast.error('Title and Code are required.'); return; }

    setCatalog(prev => prev.map(cat => {
      if (cat.id !== activeCategoryId) return cat;
      if (editMode && editTargetId) {
        return {
          ...cat,
          courses: cat.courses.map(co => co.id === editTargetId ? { ...co, title: courseTitle, code: courseCode, level: courseLevel, description: courseDesc, durationWeeks: courseWeeks } : co)
        };
      } else {
        const newCo: Course = {
          id: `course-${Date.now()}`,
          title: courseTitle,
          code: courseCode,
          level: courseLevel,
          description: courseDesc,
          durationWeeks: courseWeeks,
          modules: []
        };
        return { ...cat, courses: [...cat.courses, newCo] };
      }
    }));

    toast.success(editMode ? 'Course updated' : 'Course created');
    setModalType(null);
  };

  // Module CRUD handler
  const saveModule = () => {
    if (!activeCategoryId || !activeCourseId) return;
    if (!modTitle) { toast.error('Module Title is required.'); return; }

    setCatalog(prev => prev.map(cat => {
      if (cat.id !== activeCategoryId) return cat;
      return {
        ...cat,
        courses: cat.courses.map(co => {
          if (co.id !== activeCourseId) return co;
          if (editMode && editTargetId) {
            return {
              ...co,
              modules: co.modules.map(m => m.id === editTargetId ? { ...m, title: modTitle, objective: modObjective, durationHours: modHours } : m)
            };
          } else {
            const newMod: Module = {
              id: `mod-${Date.now()}`,
              title: modTitle,
              objective: modObjective,
              durationHours: modHours,
              submodules: []
            };
            return { ...co, modules: [...co.modules, newMod] };
          }
        })
      };
    }));

    toast.success(editMode ? 'Module updated' : 'Module created');
    setModalType(null);
  };

  // Submodule CRUD handler
  const saveSubmodule = () => {
    if (!activeCategoryId || !activeCourseId || !activeModuleId) return;
    if (!subTitle) { toast.error('Submodule Title is required.'); return; }

    setCatalog(prev => prev.map(cat => {
      if (cat.id !== activeCategoryId) return cat;
      return {
        ...cat,
        courses: cat.courses.map(co => {
          if (co.id !== activeCourseId) return co;
          return {
            ...co,
            modules: co.modules.map(m => {
              if (m.id !== activeModuleId) return m;
              if (editMode && editTargetId) {
                return {
                  ...m,
                  submodules: m.submodules.map(s => s.id === editTargetId ? { ...s, title: subTitle, estimatedMinutes: subMins } : s)
                };
              } else {
                const newSub: Submodule = {
                  id: `sub-${Date.now()}`,
                  title: subTitle,
                  estimatedMinutes: subMins,
                  contents: []
                };
                return { ...m, submodules: [...m.submodules, newSub] };
              }
            })
          };
        })
      };
    }));

    toast.success(editMode ? 'Submodule updated' : 'Submodule created');
    setModalType(null);
  };

  // Content CRUD handler
  const saveContent = () => {
    if (!activeCategoryId || !activeCourseId || !activeModuleId || !activeSubmoduleId) return;
    if (!contentTitle) { toast.error('Content Title is required.'); return; }

    setCatalog(prev => prev.map(cat => {
      if (cat.id !== activeCategoryId) return cat;
      return {
        ...cat,
        courses: cat.courses.map(co => {
          if (co.id !== activeCourseId) return co;
          return {
            ...co,
            modules: co.modules.map(m => {
              if (m.id !== activeModuleId) return m;
              return {
                ...m,
                submodules: m.submodules.map(s => {
                  if (s.id !== activeSubmoduleId) return s;
                  if (editMode && editTargetId) {
                    return {
                      ...s,
                      contents: s.contents.map(c => c.id === editTargetId ? { ...c, title: contentTitle, type: contentType, urlOrContent: contentUrl, duration: contentMins } : c)
                    };
                  } else {
                    const newC: Content = {
                      id: `content-${Date.now()}`,
                      title: contentTitle,
                      type: contentType,
                      urlOrContent: contentUrl,
                      duration: contentMins
                    };
                    return { ...s, contents: [...s.contents, newC] };
                  }
                })
              };
            })
          };
        })
      };
    }));

    toast.success(editMode ? 'Content item updated' : 'Content item created');
    setModalType(null);
  };

  // Deletions
  const handleDeleteItem = (type: typeof modalType, id: string) => {
    const confirm = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirm) return;

    if (type === 'category') {
      setCatalog(prev => prev.filter(c => c.id !== id));
      if (activeCategoryId === id) {
        setActiveCategoryId(null); setActiveCourseId(null); setActiveModuleId(null); setActiveSubmoduleId(null);
      }
    } else if (type === 'course' && activeCategoryId) {
      setCatalog(prev => prev.map(cat => cat.id === activeCategoryId ? { ...cat, courses: cat.courses.filter(co => co.id !== id) } : cat));
      if (activeCourseId === id) {
        setActiveCourseId(null); setActiveModuleId(null); setActiveSubmoduleId(null);
      }
    } else if (type === 'module' && activeCategoryId && activeCourseId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => co.id === activeCourseId ? { ...co, modules: co.modules.filter(m => m.id !== id) } : co)
        };
      }));
      if (activeModuleId === id) {
        setActiveModuleId(null); setActiveSubmoduleId(null);
      }
    } else if (type === 'submodule' && activeCategoryId && activeCourseId && activeModuleId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => {
            if (co.id !== activeCourseId) return co;
            return {
              ...co,
              modules: co.modules.map(m => m.id === activeModuleId ? { ...m, submodules: m.submodules.filter(s => s.id !== id) } : m)
            };
          })
        };
      }));
      if (activeSubmoduleId === id) {
        setActiveSubmoduleId(null);
      }
    } else if (type === 'content' && activeCategoryId && activeCourseId && activeModuleId && activeSubmoduleId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => {
            if (co.id !== activeCourseId) return co;
            return {
              ...co,
              modules: co.modules.map(m => {
                if (m.id !== activeModuleId) return m;
                return {
                  ...m,
                  submodules: m.submodules.map(s => s.id === activeSubmoduleId ? { ...s, contents: s.contents.filter(c => c.id !== id) } : s)
                };
              })
            };
          })
        };
      }));
    }
    toast.success(`${type} deleted successfully.`);
  };

  // Re-ordering logic
  const handleReorder = (type: typeof modalType, index: number, direction: 'up' | 'down') => {
    if (type === 'category') {
      setCatalog(prev => reorder(prev, index, direction));
    } else if (type === 'course' && activeCategoryId) {
      setCatalog(prev => prev.map(cat => cat.id === activeCategoryId ? { ...cat, courses: reorder(cat.courses, index, direction) } : cat));
    } else if (type === 'module' && activeCategoryId && activeCourseId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => co.id === activeCourseId ? { ...co, modules: reorder(co.modules, index, direction) } : co)
        };
      }));
    } else if (type === 'submodule' && activeCategoryId && activeCourseId && activeModuleId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => {
            if (co.id !== activeCourseId) return co;
            return {
              ...co,
              modules: co.modules.map(m => m.id === activeModuleId ? { ...m, submodules: reorder(m.submodules, index, direction) } : m)
            };
          })
        };
      }));
    } else if (type === 'content' && activeCategoryId && activeCourseId && activeModuleId && activeSubmoduleId) {
      setCatalog(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          courses: cat.courses.map(co => {
            if (co.id !== activeCourseId) return co;
            return {
              ...co,
              modules: co.modules.map(m => {
                if (m.id !== activeModuleId) return m;
                return {
                  ...m,
                  submodules: m.submodules.map(s => s.id === activeSubmoduleId ? { ...s, contents: reorder(s.contents, index, direction) } : s)
                };
              })
            };
          })
        };
      }));
    }
  };

  // Helper type color badge
  const getContentTypeColor = (t: string) => {
    if (t === 'video') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    if (t === 'pdf') return 'bg-[#F5EAF8]0/10 text-red-600 dark:text-purple-400';
    if (t === 'reading') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    if (t === 'quiz') return 'bg-[#F5EAF8]0/10 text-purple-600 dark:text-purple-400';
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
  };

  return (
    <MainLayout role="teacher" title="Course Catalog Explorer" subtitle="Structured category, course, and content management for Xebia">
      
      {/* Dynamic Stripe/Apple Style Header Grid */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4A1E47] via-[#4A1F4F] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl border border-white/10 select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-wider text-xs">
            <SlidersHorizontal size={14} />
            <span>Xebia SaaS Platform</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Interactive Course Catalog</h1>
          <p className="text-xs text-white/70 max-w-xl">
            Model and structure your curriculum using Xebia's nested course format. Categorize topics, define courses, modules, submodules, and attach videos or articles.
          </p>
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {[
              { label: 'Categories', count: catalog.length },
              { label: 'Active Courses', count: catalog.reduce((acc, c) => acc + c.courses.length, 0) },
              { label: 'Lessons / Modules', count: catalog.reduce((acc, c) => acc + c.courses.reduce((acc2, co) => acc2 + co.modules.length, 0), 0) },
              { label: 'Submodules', count: catalog.reduce((acc, c) => acc + c.courses.reduce((acc2, co) => acc2 + co.modules.reduce((acc3, m) => acc3 + m.submodules.length, 0), 0), 0) },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <span className="text-[10px] text-white/60 block uppercase font-bold tracking-wider">{stat.label}</span>
                <span className="text-lg font-black">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Notion-style Navigation Breadcrumbs */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => { setActiveCategoryId(null); setActiveCourseId(null); setActiveModuleId(null); setActiveSubmoduleId(null); }}
            className={`font-semibold cursor-pointer py-1 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              !activeCategoryId ? 'text-[#4A1F4F] dark:text-purple-400 font-bold bg-[#4A1F4F10]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Catalog Root
          </button>
          
          {activeCategory && (
            <>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <button
                onClick={() => { setActiveCourseId(null); setActiveModuleId(null); setActiveSubmoduleId(null); }}
                className={`font-semibold cursor-pointer py-1 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  activeCategoryId && !activeCourseId ? 'text-[#4A1F4F] dark:text-purple-400 font-bold bg-[#4A1F4F10]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {activeCategory.name}
              </button>
            </>
          )}

          {activeCourse && (
            <>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <button
                onClick={() => { setActiveModuleId(null); setActiveSubmoduleId(null); }}
                className={`font-semibold cursor-pointer py-1 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  activeCourseId && !activeModuleId ? 'text-[#4A1F4F] dark:text-purple-400 font-bold bg-[#4A1F4F10]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {activeCourse.title}
              </button>
            </>
          )}

          {activeModule && (
            <>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <button
                onClick={() => { setActiveSubmoduleId(null); }}
                className={`font-semibold cursor-pointer py-1 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  activeModuleId && !activeSubmoduleId ? 'text-[#4A1F4F] dark:text-purple-400 font-bold bg-[#4A1F4F10]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {activeModule.title}
              </button>
            </>
          )}

          {activeSubmodule && (
            <>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
              <span className="font-bold text-[#4A1F4F] dark:text-purple-400 bg-[#4A1F4F10] py-1 px-2 rounded-lg shrink-0">
                {activeSubmodule.title}
              </span>
            </>
          )}
        </div>

        {/* Global Catalog Search */}
        {!activeCategoryId && (
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={13} />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] focus:border-[#4A1F4F] rounded-xl text-[var(--text-primary)] focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Explorer Grid/List Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================= LEVEL 1: CATEGORIES & COURSES ======================= */}
        {!activeCategoryId && (
          <div className="lg:col-span-12 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Categories</h2>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => handleOpenAddModal('category')}
              >
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map((cat, catIdx) => (
                <div 
                  key={cat.id} 
                  className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-3xl p-5 hover:shadow-lg transition-all duration-200 shadow-sm relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cat.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center text-white shrink-0`}>
                        <Folder size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{cat.name}</h3>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">{cat.code}</p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReorder('category', catIdx, 'up')}
                        disabled={catIdx === 0}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleReorder('category', catIdx, 'down')}
                        disabled={catIdx === catalog.length - 1}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal('category', cat.id, cat)}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[#2563EB] cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('category', cat.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[var(--brand-border)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                      {cat.courses.length} Course(s) available
                    </span>
                    <button
                      onClick={() => { setActiveCategoryId(cat.id); }}
                      className="text-xs text-[#2563EB] hover:text-[#2563EB]/80 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Explore Courses <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= LEVEL 2: COURSES OF SELECTED CATEGORY ======================= */}
        {activeCategoryId && !activeCourseId && (
          <div className="lg:col-span-12 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Courses in {activeCategory?.name}</h2>
                <p className="text-xs text-[var(--text-secondary)]">{activeCategory?.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveCategoryId(null)}>Back to Root</Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => handleOpenAddModal('course')}
                >
                  Create Course
                </Button>
              </div>
            </div>

            {activeCategory?.courses.length === 0 ? (
              <Card className="py-12 text-center">
                <EmptyState icon="book" title="No courses created yet" description={`Add a course to category ${activeCategory.name} to start mapping modules.`} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCategory?.courses.map((co, coIdx) => (
                  <div
                    key={co.id}
                    className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-3xl p-5 hover:shadow-lg transition-all duration-200 shadow-sm relative group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">{co.title}</h3>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">{co.code}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleReorder('course', coIdx, 'up')}
                          disabled={coIdx === 0}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleReorder('course', coIdx, 'down')}
                          disabled={coIdx === activeCategory.courses.length - 1}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal('course', co.id, co)}
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[#2563EB] cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('course', co.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                      {co.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[var(--brand-border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <div className="flex gap-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-indigo-600 dark:text-indigo-400">
                          {co.level}
                        </span>
                        <span>{co.durationWeeks} Weeks</span>
                      </div>
                      <button
                        onClick={() => { setActiveCourseId(co.id); }}
                        className="text-xs text-[#2563EB] hover:text-[#2563EB]/80 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Explore Modules <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= LEVEL 3 & 4: MODULES & SUBMODULES (SIDE-BY-SIDE PANELS) ======================= */}
        {activeCategoryId && activeCourseId && (
          <>
            {/* Left side: Module list with submodules */}
            <div className="lg:col-span-5 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">Modules List</h3>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={12} />}
                  onClick={() => handleOpenAddModal('module')}
                >
                  New Module
                </Button>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {activeCourse?.modules.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] text-center py-6">No modules in this course.</p>
                ) : (
                  activeCourse?.modules.map((m, mIdx) => {
                    const isSelectedMod = activeModuleId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => { setActiveModuleId(m.id); setActiveSubmoduleId(null); }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm relative group ${
                          isSelectedMod
                            ? 'border-[#4A1F4F] bg-[#4A1F4F05] dark:bg-slate-800 ring-1 ring-[#4A1F4F]'
                            : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{m.title}</h4>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{m.durationHours} Hours</p>
                          </div>
                          
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReorder('module', mIdx, 'up'); }}
                              disabled={mIdx === 0}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReorder('module', mIdx, 'down'); }}
                              disabled={mIdx === activeCourse.modules.length - 1}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenEditModal('module', m.id, m); }}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#2563EB] cursor-pointer"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem('module', m.id); }}
                              className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Submodules Accordion lists */}
                        {isSelectedMod && (
                          <div className="mt-3 pt-3 border-t border-[var(--brand-border)] space-y-1 animate-slide-up">
                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-[var(--text-secondary)]">
                              <span>SUBMODULES</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenAddModal('submodule'); }}
                                className="text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus size={10} /> Add Submodule
                              </button>
                            </div>
                            
                            {m.submodules.length === 0 ? (
                              <p className="text-[10px] text-[var(--text-secondary)] py-1 italic">No submodules added.</p>
                            ) : (
                              m.submodules.map((sub, sIdx) => {
                                const isSelectedSub = activeSubmoduleId === sub.id;
                                return (
                                  <div
                                    key={sub.id}
                                    onClick={(e) => { e.stopPropagation(); setActiveSubmoduleId(sub.id); }}
                                    className={`p-2 rounded-xl text-[11px] flex justify-between items-center transition-colors cursor-pointer group/sub ${
                                      isSelectedSub
                                        ? 'bg-[#2563EB15] text-[#2563EB] font-bold'
                                        : 'text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <span className="truncate flex items-center gap-1.5">
                                      <Layers size={10} />
                                      {sub.title}
                                    </span>
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleReorder('submodule', sIdx, 'up'); }}
                                        disabled={sIdx === 0}
                                        className="p-0.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                                      >
                                        <ChevronUp size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleReorder('submodule', sIdx, 'down'); }}
                                        disabled={sIdx === m.submodules.length - 1}
                                        className="p-0.5 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                                      >
                                        <ChevronDown size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal('submodule', sub.id, sub); }}
                                        className="p-0.5 text-[var(--text-secondary)] hover:text-[#2563EB] cursor-pointer"
                                      >
                                        <Edit2 size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem('submodule', sub.id); }}
                                        className="p-0.5 text-rose-500 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side: Submodule details and Content items */}
            <div className="lg:col-span-7 space-y-4 animate-slide-up">
              {!activeModuleId ? (
                <Card className="h-64 flex flex-col items-center justify-center text-center">
                  <EmptyState icon="folder" title="Select a Module" description="Click on a module in the list to manage its submodules and curriculum contents." />
                </Card>
              ) : !activeSubmoduleId ? (
                <Card className="h-64 flex flex-col items-center justify-center text-center">
                  <EmptyState icon="layers" title="Select a Submodule" description="Click on a submodule inside the selected module to load and configure lecture resources." />
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] p-4 rounded-2xl shadow-sm">
                    <div>
                      <h4 className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Active Submodule</h4>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{activeSubmodule?.title}</h3>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Est. Study: {activeSubmodule?.estimatedMinutes} mins</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus size={12} />}
                      onClick={() => handleOpenAddModal('content')}
                    >
                      Add Lesson Content
                    </Button>
                  </div>

                  {/* Content List */}
                  <div className="space-y-3">
                    {activeSubmodule?.contents.length === 0 ? (
                      <p className="text-xs text-[var(--text-secondary)] text-center py-10 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl">
                        No resource items uploaded for this submodule.
                      </p>
                    ) : (
                      activeSubmodule?.contents.map((c, cIdx) => (
                        <div
                          key={c.id}
                          className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] p-4 rounded-2xl flex items-center justify-between gap-4 group/content shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getContentTypeColor(c.type)}`}>
                              {c.type === 'video' && <Play size={14} />}
                              {c.type === 'pdf' && <File size={14} />}
                              {c.type === 'reading' && <FileText size={14} />}
                              {c.type === 'quiz' && <HelpCircle size={14} />}
                              {c.type === 'external' && <ExternalLink size={14} />}
                            </span>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{c.title}</h5>
                              <div className="flex gap-2 items-center text-[10px] text-[var(--text-secondary)] mt-0.5">
                                <span className="capitalize font-semibold">{c.type}</span>
                                <span>•</span>
                                <span>{c.duration} mins</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/content:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleReorder('content', cIdx, 'up')}
                              disabled={cIdx === 0}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              onClick={() => handleReorder('content', cIdx, 'down')}
                              disabled={cIdx === activeSubmodule.contents.length - 1}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#4A1F4F] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown size={12} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal('content', c.id, c)}
                              className="p-1 text-[var(--text-secondary)] hover:text-[#2563EB] cursor-pointer"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem('content', c.id)}
                              className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ======================= CRUD MODALS ======================= */}

      {/* Category Modal */}
      <Modal
        isOpen={modalType === 'category'}
        onClose={() => setModalType(null)}
        title={editMode ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveCategory}>Save Category</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Frontend Web Engineering" required />
          <Input label="Category Code" value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="e.g. CS-FRONTEND" required />
          <Textarea label="Description" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Provide summary of the field objective..." rows={3} />
          
          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">Color Gradient Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { class: 'from-blue-500 to-indigo-600', label: 'Indigo Cloud' },
                { class: 'from-purple-500 to-pink-600', label: 'Magenta Pink' },
                { class: 'from-emerald-500 to-teal-600', label: 'Emerald Mint' },
              ].map((clr) => (
                <button
                  key={clr.class}
                  onClick={() => setCatColor(clr.class)}
                  className={`p-2 rounded-xl text-[10px] text-white bg-gradient-to-r font-bold text-center border cursor-pointer ${clr.class} ${
                    catColor === clr.class ? 'border-[#4A1F4F] scale-95 ring-1 ring-[#4A1F4F]' : 'border-transparent'
                  }`}
                >
                  {clr.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Course Modal */}
      <Modal
        isOpen={modalType === 'course'}
        onClose={() => setModalType(null)}
        title={editMode ? 'Edit Course' : 'Create Course'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveCourse}>Save Course</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Course Title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. React & Redux Architecture" required />
          <Input label="Course Code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CS-REACT-202" required />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Course Level"
              value={courseLevel}
              onChange={(e) => setCourseLevel(e.target.value as any)}
              options={[{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]}
            />
            <Input label="Duration (Weeks)" type="number" value={String(courseWeeks)} onChange={(e) => setCourseWeeks(Number(e.target.value))} min={1} />
          </div>

          <Textarea label="Course Description" value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Describe course deliverables..." rows={3} />
        </div>
      </Modal>

      {/* Module Modal */}
      <Modal
        isOpen={modalType === 'module'}
        onClose={() => setModalType(null)}
        title={editMode ? 'Edit Module' : 'Create Module'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveModule}>Save Module</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Module Title" value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="e.g. Unit Testing & Jest" required />
          <Input label="Duration (Hours)" type="number" value={String(modHours)} onChange={(e) => setModHours(Number(e.target.value))} min={1} />
          <Textarea label="Objective / Goals" value={modObjective} onChange={(e) => setModObjective(e.target.value)} placeholder="What will the student learn in this module..." rows={3} />
        </div>
      </Modal>

      {/* Submodule Modal */}
      <Modal
        isOpen={modalType === 'submodule'}
        onClose={() => setModalType(null)}
        title={editMode ? 'Edit Submodule' : 'Create Submodule'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveSubmodule}>Save Submodule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Submodule Title" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="e.g. Mocking API endpoints" required />
          <Input label="Est. Study Time (Minutes)" type="number" value={String(subMins)} onChange={(e) => setSubMins(Number(e.target.value))} min={1} />
        </div>
      </Modal>

      {/* Content Modal */}
      <Modal
        isOpen={modalType === 'content'}
        onClose={() => setModalType(null)}
        title={editMode ? 'Edit Lesson Content' : 'Create Lesson Content'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveContent}>Save Content</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Content Title" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="e.g. Video: Mocking axios in Jest" required />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              options={[
                { value: 'video', label: 'Video Resource' },
                { value: 'pdf', label: 'PDF Document' },
                { value: 'reading', label: 'Text/Article Reading' },
                { value: 'quiz', label: 'Online Quiz' },
                { value: 'external', label: 'External Resource' },
              ]}
            />
            <Input label="Duration (Minutes)" type="number" value={String(contentMins)} onChange={(e) => setContentMins(Number(e.target.value))} min={1} />
          </div>

          <Input label="Resource URL or Inline Content" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="e.g. https://storage.com/resource-file.pdf" />
        </div>
      </Modal>

    </MainLayout>
  );
};
