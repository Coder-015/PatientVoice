'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="page active" id="page-home" style={{ display: 'block' }}>
      <div className="home-hero">
        <div className="badge">Welcome to PatientVoice</div>
        <h1 className="home-title">Your Symptoms.<br/><span>Our Intelligence.</span><br/>Better Healthcare.</h1>
        <p className="home-subtitle">Transform your personal health narrative into clinically structured insights with AI-powered analysis and evidence-based recommendations.</p>
        <div className="home-ctas">
          <Link href="/symptoms">
            <button className="btn-primary">
              <span className="material-symbols-outlined">medical_services</span>Analyze Symptoms
            </button>
          </Link>
          <Link href="/history">
            <button className="btn-outline">
              <span className="material-symbols-outlined">history</span>View History
            </button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><span className="material-symbols-outlined">analytics</span></div>
          <div className="stat-number">127</div>
          <div className="stat-label">Analyses Run</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><span className="material-symbols-outlined">diagnosis</span></div>
          <div className="stat-number">43</div>
          <div className="stat-label">Conditions Identified</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><span className="material-symbols-outlined">library_books</span></div>
          <div className="stat-number">892</div>
          <div className="stat-label">Citations Retrieved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><span className="material-symbols-outlined">trending_up</span></div>
          <div className="stat-number">86%</div>
          <div className="stat-label">Avg Confidence Score</div>
        </div>
      </div>

      <h2 className="section-title">Recent Activity</h2>
      <div className="recent-list">
        <Link href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="recent-item">
            <div className="recent-left">
              <div className="recent-date">Oct 24, 2024</div>
              <div className="recent-condition">Lumbar Disc Involvement</div>
              <div className="recent-snippet">I've been feeling this persistent, dull ache in my lower back for three weeks...</div>
            </div>
            <div className="recent-right">
              <span className="conf-pill">94% High</span>
              <button className="btn-text">View Details <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span></button>
            </div>
          </div>
        </Link>
        <Link href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="recent-item">
            <div className="recent-left">
              <div className="recent-date">Oct 12, 2024</div>
              <div className="recent-condition">Post-Viral Syndrome</div>
              <div className="recent-snippet">Persistent fatigue and brain fog since recovering from flu six weeks ago...</div>
            </div>
            <div className="recent-right">
              <span className="conf-pill">82%</span>
              <button className="btn-text">View Details <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span></button>
            </div>
          </div>
        </Link>
        <Link href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="recent-item">
            <div className="recent-left">
              <div className="recent-date">Sep 28, 2024</div>
              <div className="recent-condition">Chronic Migraine Pattern</div>
              <div className="recent-snippet">Unilateral throbbing pain in the left temporal region with photophobia...</div>
            </div>
            <div className="recent-right">
              <span className="conf-pill">91% High</span>
              <button className="btn-text">View Details <span className="material-symbols-outlined" style={{fontSize:'16px'}}>arrow_forward</span></button>
            </div>
          </div>
        </Link>
      </div>

      <h2 className="section-title">How It Works</h2>
      <div className="how-grid">
        <div className="how-card">
          <div className="how-step">1</div>
          <div className="how-icon"><span className="material-symbols-outlined">edit_note</span></div>
          <div className="how-title">Input Symptoms</div>
          <div className="how-desc">Describe what you feel in plain language — no medical jargon needed. Just talk like you would to a friend.</div>
        </div>
        <div className="how-card">
          <div className="how-step">2</div>
          <div className="how-icon"><span className="material-symbols-outlined">hub</span></div>
          <div className="how-title">RAG Processing</div>
          <div className="how-desc">Our pipeline retrieves verified medical evidence from PubMed, HPO ontology, and clinical guidelines.</div>
        </div>
        <div className="how-card">
          <div className="how-step">3</div>
          <div className="how-icon"><span className="material-symbols-outlined">description</span></div>
          <div className="how-title">Clinical Brief</div>
          <div className="how-desc">Receive a structured, citation-backed report with differential diagnoses to share with your doctor.</div>
        </div>
      </div>
    </div>
  );
}
