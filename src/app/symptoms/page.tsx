'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const startAnalysis = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, userId: session?.user?.id }),
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
          <div className="voice-label">Your Voice</div>
          <textarea 
            className="voice-textarea" 
            id="symptomText" 
            placeholder="Today, I woke up with a dull pressure behind my left eye..." 
            rows={10}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          ></textarea>
          <div className="voice-footer">
            <div className="voice-mic">
              <span className="material-symbols-outlined">mic</span>
              <span>Prefer to speak? Record a voice note.</span>
            </div>
            <button className="btn-primary" onClick={startAnalysis} disabled={isLoading || !symptoms.trim()}>
              {isLoading ? 'Analyzing...' : 'Start Analysis'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="sidebar-cards">
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
