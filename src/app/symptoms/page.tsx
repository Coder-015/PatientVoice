'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import SymptomImageUpload from '@/components/SymptomImageUpload';

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const bodyParts = ['Head', 'Neck', 'Chest', 'Back', 'Stomach/Abdomen', 'Arm/Hand', 'Leg/Foot', 'Joints', 'Skin', 'Whole Body'];

  const handleBodyPartClick = (part: string) => {
    setSymptoms((prev) => prev + (prev ? ' \n' : '') + `[Location: ${part}] - `);
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Try Chrome or Safari.");
      return;
    }

    if (isListening) return; // Prevent multiple instances

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop when they pause
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.start();
  };

  const startAnalysis = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('[SUBMIT] imageBase64 present:', !!imageBase64);
      console.log('[SUBMIT] imageBase64 length:', imageBase64?.length ?? 0);
      
      sessionStorage.setItem('symptomImage', imageBase64 ?? '');
      sessionStorage.setItem('symptomMime', mimeType ?? '');

      const { data: { session } } = await supabase.auth.getSession();
      
      let visualFindings = '';
      if (imageBase64 && mimeType) {
        console.log('[ANALYSIS] image found, calling analyze-image...');
        // Call analyze-image first
        const visionRes = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mimeType, textSymptoms: symptoms, userId: session?.user?.id }),
        });
        if (visionRes.ok) {
          const visionData = await visionRes.json();
          visualFindings = visionData.visualFindings;
          console.log('[ANALYSIS] visualFindings received:', visualFindings.slice(0, 100));
        }
      }
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, userId: session?.user?.id, visualFindings }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Navigate to the analysis page if successful
        router.push(`/analysis?id=${data.id}`);
      } else {
        alert('Error analyzing symptoms: ' + data.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const getCharCountColor = () => {
    const len = symptoms.length;
    if (len < 200) return '#10b981'; // green
    if (len <= 500) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="page active" id="page-symptoms" style={{ display: 'block' }}>
      
      {isLoading && (
        <div className="loading-overlay show" id="loadingOverlay">
          <div className="loading-pulse"></div>
          <div className="loading-logo">PatientVoice</div>
          <div className="loading-steps">
            <div className="loading-step visible done" id="ls1">
              <div className="step-icon-wrap"><span className="material-symbols-outlined">translate</span></div>
              <span className="step-text">Translating symptoms to HPO ontology...</span>
            </div>
            <div className="loading-step visible" id="ls2">
              <div className="step-icon-wrap"><span className="material-symbols-outlined">hub</span></div>
              <span className="step-text">Consulting Groq Llama3 Models...</span>
            </div>
            <div className="loading-step" id="ls3">
              <div className="step-icon-wrap"><span className="material-symbols-outlined">description</span></div>
              <span className="step-text">Generating clinical brief...</span>
            </div>
          </div>
        </div>
      )}

      <div className="hero-grid">
        <div>
          <div className="badge">Symptom Entry</div>
          <h1 className="hero-title">Tell us how you're <em>really</em> feeling.</h1>
          <p className="hero-subtitle">Don't worry about medical terminology. Describe your experience in your own words — like you're talking to a trusted friend. We're here to help translate your story into actionable clinical insights.</p>
        </div>
        <div className="hero-image-wrap">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB81GlmQM3mpypRsjJ0k_LP44ejsOMcAothCIGprbVevbYuvLbtrNOR5updGHJxX1wqkSkJ0O9lREOebVuwijWGli87EgFZBhJ_X_ddWYtxFcz26Qw89DKTYurTl-y5oqGmcsrkEA_Gk6xY4So15j7rm3tKvmN8GrqXpnLE5GAMDfJgNf3QPGOE73xsZuBMdzo7uXi5SdJlxH8AXePLp8CFMYMpgWmztoYYLiqRyMEYlt_EvId-9c4ozdYykIM3V48FYQ3014BfIko" alt="Hands holding tea"/>
          <div className="hero-icon-badge">
            <span className="material-symbols-outlined">volunteer_activism</span>
          </div>
        </div>
      </div>

      <div className="input-grid">
        <div className="voice-card">
          <div className="voice-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Your Voice</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: getCharCountColor() }}>
              {symptoms.length} chars
            </span>
          </div>
          <textarea 
            className="voice-textarea" 
            id="symptomText" 
            placeholder="Today, I woke up with a dull pressure behind my left eye..." 
            rows={10}
            value={symptoms}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSymptoms(e.target.value)}
            style={{ 
              transition: 'all 0.3s ease',
              boxShadow: isFocused ? '0 0 0 3px rgba(0, 160, 176, 0.2)' : 'none',
              borderColor: isFocused ? 'var(--primary)' : 'var(--outline-variant)'
            }}
          ></textarea>
          
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <SymptomImageUpload 
              onImageChange={(base64, mime) => { 
                setImageBase64(base64); 
                setMimeType(mime); 
                console.log('[SYMPTOMS PAGE] image state updated, length:', base64?.length);
              }}
              onClear={() => { setImageBase64(null); setMimeType(null); }}
            />
          </div>

          <div className="voice-footer" style={{ marginTop: '20px' }}>
            <div 
              className="voice-mic" 
              onClick={startListening} 
              style={{ cursor: 'pointer', color: isListening ? 'var(--error)' : 'var(--on-surface-variant)', fontWeight: isListening ? 700 : 400, transition: 'all 0.3s' }}
            >
              <span className="material-symbols-outlined" style={{ color: isListening ? 'var(--error)' : 'var(--primary)' }}>
                {isListening ? 'graphic_eq' : 'mic'}
              </span>
              <span>{isListening ? 'Listening... Speak now.' : 'Prefer to speak? Tap to dictate.'}</span>
            </div>
            <button className="btn-primary" onClick={startAnalysis} disabled={isLoading || !symptoms.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (isLoading || !symptoms.trim()) ? 0.7 : 1 }}>
              {isLoading && <div className="loading-pulse" style={{ width: '16px', height: '16px', borderWidth: '2px', position: 'static' }}></div>}
              {isLoading ? (imageBase64 ? 'Analyzing Image...' : 'Analyzing...') : 'Start Analysis'}
              {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </div>

        <div className="sidebar-cards">
          <div className="why-card">
            <h3>Quick Body Select</h3>
            <p style={{fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '16px'}}>Tap affected locations to instantly append them to your narrative context.</p>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {bodyParts.map(part => (
                <div 
                  key={part} 
                  onClick={() => handleBodyPartClick(part)} 
                  style={{background: 'var(--surface)', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--outline-variant)', transition: 'all 0.2s', display: 'flex', gap: '4px', alignItems: 'center'}}
                  onMouseOver={(e: any) => e.target.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e: any) => e.target.style.borderColor = 'var(--outline-variant)'}
                >
                  {part} 
                  <span className="material-symbols-outlined" style={{fontSize: '14px', color: 'var(--primary)'}}>add</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="why-card">
            <h3>Why this matters</h3>
            <div className="why-item">
              <div className="why-icon"><span className="material-symbols-outlined">history_edu</span></div>
              <div>
                <h4>Capture the Nuance</h4>
                <p>Small details matter. Time of day, type of pain, triggers—our AI analyzes it all to build a complete clinical picture.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-icon"><span className="material-symbols-outlined">gpp_good</span></div>
              <div>
                <h4>Secure & Private</h4>
                <p>Your narrative is processed securely. We don't store identifiable markers.</p>
              </div>
            </div>
          </div>
          
          <div className="tips-card">
            <h3>Tips for good entry</h3>
            <p>Try to include specific times or severity if you can remember them.</p>
            <div className="tips-chips">
              <span className="tip-chip">Duration</span>
              <span className="tip-chip">Severity</span>
              <span className="tip-chip">Triggers</span>
            </div>
            <span className="material-symbols-outlined tips-bg-icon">lightbulb</span>
          </div>
        </div>
      </div>
    </div>
  );
}
