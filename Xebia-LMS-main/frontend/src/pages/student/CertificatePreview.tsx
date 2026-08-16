import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CertificatePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      certificateService.getCertificatePreview(id)
        .then(data => {
          setCert(data);
        })
        .catch(err => {
          toast.error(err.response?.data?.message || 'Failed to load certificate preview');
          navigate('/student/certificates');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!id || !cert || !certificateRef.current) return;
    setDownloading(true);
    const loadingToast = toast.loading('Generating and downloading your certificate...');
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#faf5ed'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const activityName = cert.quizTitle || cert.assignmentTitle || cert.assignmentName || 'Course';
      pdf.save(`certificate-${activityName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

      toast.success('Certificate downloaded successfully!', { id: loadingToast });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate and download certificate', { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Layout role="student" title="Certificate Preview">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 tracking-wide">Loading Certificate Presentation...</p>
        </div>
      </Layout>
    );
  }

  if (!cert) return null;

  return (
    <Layout role="student" title="Certificate Preview">
      <div className="max-w-5xl mx-auto px-4 h-[calc(100vh-7rem)] flex flex-col justify-between py-2 overflow-hidden select-none">
        
        {/* Top Control Bar */}
        <div className="flex justify-end items-center mb-2 shrink-0">
          <Button
            variant="primary"
            onClick={handleDownload}
            loading={downloading}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Download size={14} />
            Download Official PDF
          </Button>
        </div>

        {/* --- CLASSIC BEIGE & BROWN CERTIFICATE CANVAS --- */}
        <div ref={certificateRef} className="relative bg-[#fcf9f5] rounded-lg border border-neutral-200 shadow-2xl flex-1 flex flex-col justify-center overflow-hidden p-1">
          
          {/* Top-Left Diagonal Corner Shapes */}
          <div className="absolute top-0 left-0 w-44 h-44 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-[#61473b] rotate-45 transform -translate-x-[70%] -translate-y-[70%]" />
            <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-[#a37c4c] rotate-45 transform -translate-x-[64%] -translate-y-[64%]" />
          </div>

          {/* Bottom-Right Diagonal Corner Shapes */}
          <div className="absolute bottom-0 right-0 w-44 h-44 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 right-0 w-[200%] h-[200%] bg-[#61473b] rotate-45 transform translate-x-[70%] translate-y-[70%]" />
            <div className="absolute bottom-0 right-0 w-[200%] h-[200%] bg-[#a37c4c] rotate-45 transform translate-x-[64%] translate-y-[64%]" />
          </div>

          {/* Top-Right & Bottom-Left Classic Victorian Corner Accents */}
          {/* Top-Right Corner Accent */}
          <div className="absolute top-4 right-4 w-24 h-24 pointer-events-none opacity-80">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#61473b] fill-none stroke-1">
              <path d="M 10 10 L 90 10 L 90 90 M 80 10 C 80 40, 40 80, 10 80 M 90 20 C 60 20, 20 60, 20 90" />
              <circle cx="90" cy="10" r="2" className="fill-[#61473b]" />
            </svg>
          </div>
          {/* Bottom-Left Corner Accent */}
          <div className="absolute bottom-4 left-4 w-24 h-24 pointer-events-none opacity-80 rotate-180">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#61473b] fill-none stroke-1">
              <path d="M 10 10 L 90 10 L 90 90 M 80 10 C 80 40, 40 80, 10 80 M 90 20 C 60 20, 20 60, 20 90" />
              <circle cx="90" cy="10" r="2" className="fill-[#61473b]" />
            </svg>
          </div>

          {/* Golden Badge Emblem (Top Left Overlapping Corner) */}
          <div className="absolute top-10 left-10 z-10 drop-shadow-md">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center">
              {/* Starburst Ribbons underneath */}
              <div className="absolute bottom-[-10px] left-3 w-4 h-8 bg-amber-500 clip-ribbon transform rotate-[15deg]" />
              <div className="absolute bottom-[-10px] right-3 w-4 h-8 bg-amber-600 clip-ribbon transform rotate-[-15deg]" />
              <div className="w-[86%] h-[86%] rounded-full border-2 border-dashed border-amber-100/60 flex items-center justify-center">
                <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-amber-600 via-amber-400 to-amber-200 opacity-90 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Inner Content Area */}
          <div className="h-full w-full flex flex-col justify-between items-center p-8 sm:p-12 md:p-16 relative z-10">
            
            {/* Top Center: Lotus Emblem Line Art */}
            <div className="w-16 h-12 flex items-center justify-center opacity-70 mt-2">
              <svg viewBox="0 0 100 60" className="w-full h-full stroke-[#61473b] fill-none stroke-[1.2]">
                <path d="M50 55 C40 35, 30 25, 15 35 C30 15, 45 25, 50 55 Z" />
                <path d="M50 55 C60 35, 70 25, 85 35 C70 15, 55 25, 50 55 Z" />
                <path d="M50 55 C42 30, 45 10, 50 5 C55 10, 58 30, 50 55 Z" />
                <path d="M50 55 C35 40, 20 45, 25 55 C35 50, 45 52, 50 55 Z" />
                <path d="M50 55 C65 40, 80 45, 75 55 C65 50, 55 52, 50 55 Z" />
              </svg>
            </div>

            {/* Main Typographic Block */}
            <div className="text-center w-full max-w-2xl my-auto flex flex-col justify-center items-center space-y-6">
              
              {/* Title heading */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.25em] text-[#2c221e] uppercase ml-[0.25em]">
                Certificate
              </h1>

              {/* Context Statement */}
              <p className="font-serif italic text-xs sm:text-sm text-[#7c6a5f] tracking-wide max-w-md">
                This document proudly certifies that the curriculum assessment was successfully completed by
              </p>

              {/* Recipient Dynamic Name */}
              <div className="w-full max-w-lg mt-2">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#4a362d] tracking-wide px-4">
                  {cert.studentName}
                </h2>
                {/* Clean signature line under recipient name */}
                <div className="w-4/5 h-[1px] bg-[#61473b]/40 mx-auto mt-2" />
              </div>

              {/* Description Context */}
              <p className="text-xs text-[#7c6a5f] max-w-xl leading-relaxed tracking-wide font-sans px-4">
                for demonstrating exceptional core competencies, completing requirements, and successfully achieving passing evaluation benchmarks in the dynamic master track suite titled:
                <span className="block font-serif font-bold text-sm sm:text-base text-[#2c221e] mt-2 italic bg-[#f5efe6]/60 py-1.5 px-4 rounded border border-[#e8dfd3]">
                  {cert.quizTitle || cert.assignmentTitle || cert.assignmentName}
                </span>
              </p>
            </div>

            {/* Corporate/Instructor Footer Signature Base */}
            <div className="w-full max-w-3xl mt-auto pt-6">
              <div className="grid grid-cols-2 gap-20 sm:gap-32 md:gap-48 px-6 sm:px-12 text-center">
                
                {/* Left Signee */}
                <div className="flex flex-col items-center">
                  <div className="w-full border-b border-[#61473b] pb-1">
                    <p className="font-serif text-sm text-[#4a362d] font-semibold italic min-h-[20px]">
                      {cert.teacherName}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#918074] mt-1">
                    Authorized Instructor
                  </p>
                </div>

                {/* Right Signee */}
                <div className="flex flex-col items-center">
                  <div className="w-full border-b border-[#61473b] pb-1">
                    <p className="font-serif text-sm text-[#4a362d] font-semibold italic min-h-[20px]">
                      Drew Feig
                    </p>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#918074] mt-1">
                    Program Director
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Global Verification Tracking Line */}
        <div className="mt-2 text-center shrink-0">
          <p className="text-[10px] text-[#918074] tracking-wide font-mono">
            Dynamic Credential Record Verification Registry Key ID: <span className="text-[#4a362d] font-bold select-all">{cert.certificateId}</span> • lms.xebia.com/verify
          </p>
        </div>

      </div>
    </Layout>
  );
};