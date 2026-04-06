'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading reports...</div>;

  const featured = reports[0];
  const history = reports.slice(1);

  return (
    <div className="page active" id="page-reports" style={{ display: 'block' }}>
      <div className="report-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: '8px' }}>Clinical Reports</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>Detailed breakdowns of your processed narratives.</p>
        </div>
        <div className="report-header-actions">
          <Link href="/history">
            <button className="btn-outline">View History Timeline</button>
          </Link>
        </div>
      </div>

      {!featured ? (
        <div className="empty-card">
          <div className="empty-icon"><span className="material-symbols-outlined">inbox</span></div>
          <h3>No reports generated</h3>
          <p>Analyze your symptoms to spawn dynamic clinical reports here.</p>
          <Link href="/symptoms"><button className="btn-primary" style={{marginTop: '16px'}}>Analyze Symptoms</button></Link>
        </div>
      ) : (
        <div className="featured-card">
          <div className="featured-img" style={{ background: 'var(--surface-high)' }}>
            <img src="/medical_scan.png" alt="Medical scan graphic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="featured-badge">Featured Analysis</div>
          </div>
          <div className="featured-content">
            <div className="featured-session">
              {new Date(featured.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
            </div>
            <h2 className="featured-title">{featured.condition || 'Pending Diagnosis'}</h2>
            <div className="featured-quote">"{featured.symptoms}"</div>
            <div className="featured-actions">
              <Link href={`/analysis?id=${featured.id}`}>
                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>View Full Report</button>
              </Link>
            </div>
          </div>
          <div className="featured-trend">
            <div>
              <div className="trend-title">Confidence Metric</div>
              <div className="trend-desc">AI confidence based on provided symptom markers compared against average thresholds.</div>
            </div>
            <div>
              <div className="trend-bar-label"><span>Current Score</span><span>{featured.confidence || 0}%</span></div>
              <div className="trend-bar"><div className="trend-bar-fill" style={{ width: `${featured.confidence || 0}%` }}></div></div>
            </div>
          </div>
        </div>
      )}
      
      {history.length > 0 && (
        <div className="report-grid">
          {history.map(record => (
            <Link key={record.id} href={`/analysis?id=${record.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="report-mini-card">
                <div className="mini-top">
                  <div className="mini-icon"><span className="material-symbols-outlined">microbiology</span></div>
                  <div className="mini-conf">{record.confidence}%</div>
                </div>
                <div className="mini-date">
                  {new Date(record.created_at).toLocaleDateString()}
                </div>
                <div className="mini-title">{record.condition}</div>
                <div className="mini-desc">"{record.symptoms}"</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
