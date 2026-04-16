'use client';

import React, { useState, useRef, useCallback } from 'react';

interface SymptomImageUploadProps {
  onImageChange: (imageBase64: string | null, mimeType: string | null) => void;
  onClear: () => void;
}

export default function SymptomImageUpload({ onImageChange, onClear }: SymptomImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. Please use the upload tab.');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleTabChange = (tab: 'camera' | 'upload') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Initialize camera if on camera tab
  React.useEffect(() => {
    if (activeTab === 'camera' && !imagePreview) {
      startCamera();
    }
    return () => stopCamera();
  }, [activeTab, imagePreview]);

  const captureCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      setImagePreview(dataUrl);
      onImageChange(base64, 'image/jpeg');
      console.log('[IMG] captured/uploaded, base64 length:', base64.length);
      stopCamera();
    }
    setIsProcessing(false);
  }, [onImageChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large (max 10MB)");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      onImageChange(base64, file.type);
      console.log('[IMG] captured/uploaded, base64 length:', base64.length);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    onImageChange(null, null);
    onClear();
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="symptom-image-upload" style={{
      background: 'var(--surface)', 
      borderRadius: '16px', 
      padding: '16px', 
      border: '1px solid var(--outline-variant)',
      marginTop: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>center_focus_strong</span>
          Visual Context (Optional)
        </h3>
        {imagePreview && (
          <span className="badge" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '4px 8px' }}>
            Image will be analyzed
          </span>
        )}
      </div>

      {imagePreview ? (
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '240px', background: '#f0f0f0' }}>
          <img src={imagePreview} alt="Symptom preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <button 
            onClick={clearImage}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--outline-variant)' }}>
            <button 
              onClick={() => handleTabChange('camera')}
              style={{
                background: 'none', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: activeTab === 'camera' ? 700 : 500,
                color: activeTab === 'camera' ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: activeTab === 'camera' ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
              Use Camera
            </button>
            <button 
              onClick={() => handleTabChange('upload')}
              style={{
                background: 'none', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: activeTab === 'upload' ? 700 : 500,
                color: activeTab === 'upload' ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: activeTab === 'upload' ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>image</span>
              Upload Image
            </button>
          </div>

          {activeTab === 'camera' && (
            <div style={{ position: 'relative', height: '240px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cameraError ? (
                <div style={{ color: 'var(--error)', padding: '20px', textAlign: 'center', fontSize: '14px' }}>{cameraError}</div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '16px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <button 
                      onClick={captureCamera}
                      disabled={isProcessing}
                      style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '4px solid rgba(255,255,255,0.4)',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {isProcessing && <div className="loading-pulse" style={{ width: '20px', height: '20px', borderWidth: '3px', position: 'static' }}></div>}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div style={{ height: '240px', border: '2px dashed var(--outline-variant)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                title="Upload image"
              />
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '12px' }}>upload_file</span>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Click or drag image to upload</div>
              <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>JPEG, PNG, WEBP, HEIC less than 10MB</div>
              {isProcessing && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '14px', fontWeight: 500 }}>
                  <div className="loading-pulse" style={{ width: '16px', height: '16px', borderWidth: '2px', position: 'static' }}></div>
                  Processing...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
