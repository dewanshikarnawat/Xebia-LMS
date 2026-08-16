import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, Heading1, Heading2, Code, RotateCcw } from 'lucide-react';
import { cn } from '@/utils-lms';

export default function RichNotesEditor({ value = '', onChange, label, placeholder = 'Start typing your notes here...' }) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    code: false,
  });

  // Track cursor position to update active formats
  const handleSelectionChange = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      code: document.queryCommandState('fontName') === 'monospace',
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Format action execution
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  // Synchronize initial value once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const toolbarButtons = [
    { label: 'Bold', icon: Bold, action: () => executeCommand('bold'), active: activeFormats.bold },
    { label: 'Italic', icon: Italic, action: () => executeCommand('italic'), active: activeFormats.italic },
    { label: 'Underline', icon: Underline, action: () => executeCommand('underline'), active: activeFormats.underline },
    { label: 'Heading 1', icon: Heading1, action: () => executeCommand('formatBlock', '<h1>'), active: false },
    { label: 'Heading 2', icon: Heading2, action: () => executeCommand('formatBlock', '<h2>'), active: false },
    { label: 'Bullet List', icon: List, action: () => executeCommand('insertUnorderedList'), active: false },
    { label: 'Code Block', icon: Code, action: () => executeCommand('formatBlock', '<pre>'), active: activeFormats.code },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-brand-text-primary dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm focus-within:border-accent-teal focus-within:ring-2 focus-within:ring-accent-teal/20 transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-2">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              className={cn(
                'rounded p-1.5 text-brand-text-secondary dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-brand-text-primary dark:hover:text-slate-100 transition-colors',
                btn.active && 'bg-white dark:bg-slate-900 text-accent-teal dark:text-accent-teal border border-brand-border dark:border-slate-800 shadow-sm'
              )}
              title={btn.label}
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}
          <div className="h-4 w-[1px] bg-brand-border dark:bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="rounded p-1.5 text-brand-text-secondary dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-brand-text-primary dark:hover:text-slate-100 transition-colors"
            title="Clear Formatting"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          placeholder={placeholder}
          className="min-h-[260px] p-4 text-sm text-brand-text-primary dark:text-slate-200 focus:outline-none prose prose-sm dark:prose-invert max-w-none scrollbar-thin overflow-y-auto"
          style={{ outline: 'none' }}
        />
      </div>
    </div>
  );
}

