import { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';
import api from '@/services-lms/api';
import { cn } from '@/utils-lms';

export default function ImageUploader({ 
  value = '', 
  onChange, 
  label, 
  aspectRatio = 'square', // 'square', 'video', 'banner', 'any'
  maxSizeMB = 5,
  className 
}) {
  const [preview, setPreview] = useState(value);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Crop & Transform state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);

  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];

  const validateFile = (selectedFile) => {
    setError('');
    
    // Format validation
    if (!allowedFormats.includes(selectedFile.type)) {
      setError('Unsupported file type. Use JPG, JPEG, PNG, SVG, or WEBP.');
      return false;
    }

    // Size validation
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max allowed size is ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    
    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setIsEditing(true); // Open edit tools on load
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) handleFile(selectedFile);
  };

  // Perform client-side compression using canvas before upload
  const compressAndUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10); // Start progress bar

    try {
      // 1. Client-Side Mock Compression & Canvas Render
      const img = new Image();
      if (preview && (preview.startsWith('http') || preview.startsWith('//'))) {
        img.crossOrigin = 'anonymous';
      }
      img.src = preview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Zoom & Rotation Transforms
      const maxDim = Math.max(img.width, img.height);
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert to blob (compression level: 0.8)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Convert data URL to Blob synchronously to avoid fetch() errors on data: URLs
      const parts = compressedDataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const resBlob = new Blob([u8arr], { type: mime });

      setProgress(40);

      // 2. Upload file to backend
      const formData = new FormData();
      formData.append('file', resBlob, file.name || 'uploaded_image.jpg');

      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 40) / progressEvent.total);
          setProgress(40 + percentCompleted); // Map 40-80% to upload
        }
      });

      setProgress(95);

      const uploadedUrl = response.data.data.url;
      onChange?.(uploadedUrl);
      setPreview(uploadedUrl);
      setIsEditing(false);
      setFile(null);
      setProgress(100);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      setError('Upload failed. Server error.');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview('');
    setFile(null);
    setIsEditing(false);
    onChange?.('');
  };

  const handleResetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'h-28 w-full',
    any: 'min-h-[140px]'
  }[aspectRatio];

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-semibold text-brand-text-primary dark:text-slate-200 block">
          {label}
        </label>
      )}

      {/* Main Upload Box */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl overflow-hidden bg-brand-surface dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-all duration-300",
          preview ? "border-brand-border dark:border-slate-800" : "border-brand-border dark:border-slate-800 hover:border-accent-teal/40 cursor-pointer",
          aspectClass
        )}
        onClick={!preview ? handleBrowse : undefined}
      >
        {/* Input element */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          accept={allowedFormats.join(',')} 
          className="hidden" 
        />

        {preview ? (
          /* Uploaded Preview State */
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${isEditing ? zoom : 1}) rotate(${isEditing ? rotation : 0}deg)`
              }}
            />

            {/* Overlays / Editing bars */}
            {!uploading && (
              <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                <button 
                  type="button" 
                  onClick={handleBrowse} 
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-colors"
                  title="Replace Image"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                </button>
                <button 
                  type="button" 
                  onClick={handleRemove} 
                  className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white backdrop-blur transition-colors"
                  title="Remove Image"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            )}

            {/* Editing Controls (Rotation & Zoom) */}
            {isEditing && !uploading && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 rounded-xl p-2 flex items-center justify-between text-white backdrop-blur gap-4 z-10 text-xs">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="h-3.5 w-3.5" /></button>
                  <span className="w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="h-3.5 w-3.5" /></button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setRotation(r => (r + 90) % 360)} className="p-1 hover:bg-white/10 rounded flex items-center gap-1">
                    <RotateCw className="h-3.5 w-3.5" /> 90°
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button" 
                    onClick={compressAndUpload} 
                    className="bg-accent-teal hover:bg-accent-teal-dark px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 transition-colors"
                  >
                    <Check className="h-3 w-3" /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                <UploadCloud className="h-8 w-8 text-accent-teal animate-bounce mb-2" />
                <p className="text-xs font-semibold">Uploading & Compressing...</p>
                <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-accent-teal transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Prompt State */
          <div className="text-center p-6 space-y-2 select-none pointer-events-none">
            <UploadCloud className="h-10 w-10 mx-auto text-brand-text-secondary dark:text-slate-500" />
            <p className="text-xs font-semibold text-brand-text-primary dark:text-slate-200">
              Drag and drop file here, or <span className="text-accent-teal font-bold">browse</span>
            </p>
            <p className="text-[10px] text-brand-text-secondary dark:text-slate-450">
              JPG, PNG, SVG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}


