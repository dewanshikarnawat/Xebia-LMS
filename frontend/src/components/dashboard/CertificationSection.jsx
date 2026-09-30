import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, Eye, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { useToast } from '@/hooks-lms/useToast';
import Modal from '@/components/ui-lms/Modal';

export default function CertificationSection({ certificates = [], isLoading = false }) {
  const { showToast } = useToast();
  const [selectedCert, setSelectedCert] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleDownload = (cert) => {
    showToast(`Downloading PDF for ${cert.courseName}...`, 'info');
    setTimeout(() => {
      // Simulate file download
      const link = document.createElement('a');
      link.href = cert.thumbnail;
      link.download = `${cert.courseName.replace(/\s+/g, '_')}_Certificate.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Certificate for "${cert.courseName}" downloaded successfully!`, 'success');
    }, 1200);
  };

  const handleShare = (cert) => {
    const mockUrl = `https://lms.xebia.com/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(mockUrl);
    setCopiedId(cert.id);
    showToast('Verification URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-border/70 bg-white px-6 py-16 text-center shadow-card dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-accent-teal/10 text-brand-primary">
          <Award className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">No Certifications Yet</h3>
        <p className="mt-2 max-w-sm text-sm text-brand-text-secondary">
          Complete courses and pass the required final assessments to unlock professional, downloadable certifications.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {certificates.map((cert, idx) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-card transition-all hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Thumbnail Header with Overlay */}
            <div className="relative h-40 overflow-hidden bg-brand-surface dark:bg-slate-800">
              <img
                src={cert.thumbnail}
                alt={cert.courseName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-primary/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedCert(cert)}
                  className="rounded-full bg-white text-brand-primary hover:bg-brand-surface shadow-md"
                >
                  <Eye className="h-4 w-4 mr-1.5" /> View
                </Button>
              </div>
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-brand-success px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                <ShieldCheck className="h-3 w-3" /> Certified
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">
                ID: {cert.certificateId}
              </span>
              <h4 className="font-bold text-brand-text-primary dark:text-slate-100 mt-1 line-clamp-1 text-sm md:text-base">
                {cert.courseName}
              </h4>
              
              <div className="mt-3 space-y-1 text-xs text-brand-text-secondary">
                <p>Instructor: <strong className="font-semibold text-brand-text-primary dark:text-slate-200">{cert.instructorName}</strong></p>
                <p>Issued: {cert.completionDate}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-brand-border/60 pt-4 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(cert)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleShare(cert)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-text-secondary hover:text-brand-primary"
                >
                  {copiedId === cert.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-brand-success animate-bounce" /> Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Modal for Certificate Preview ── */}
      <AnimatePresence>
        {selectedCert && (
          <Modal
            isOpen={!!selectedCert}
            onClose={() => setSelectedCert(null)}
            title="Certificate Verification"
          >
            <div className="space-y-4 p-2 text-center">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-brand-border/80 dark:border-slate-800 shadow-lg">
                <img
                  src={selectedCert.thumbnail}
                  alt={selectedCert.courseName}
                  className="w-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">
                  {selectedCert.courseName}
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Issued to Aarav Sharma on {selectedCert.completionDate}
                </p>
                <p className="text-xs font-mono text-brand-primary mt-1.5 bg-brand-primary/5 inline-block px-3 py-1 rounded-md">
                  Verification ID: {selectedCert.certificateId}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t border-brand-border/65 dark:border-slate-800">
                <Button onClick={() => handleDownload(selectedCert)}>
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedCert)}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Verify Authenticity
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

