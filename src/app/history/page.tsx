'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('consultations').delete().eq('id', deleteTarget);
    if (!error) {
      setHistory(history.filter(h => h.id !== deleteTarget));
    } else {
      alert("Error deleting record from database: " + error.message);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="page active" id="page-history" style={{ display: 'block' }}>
      <div className="history-header">
        <h1 className="section-title" style={{ marginBottom: '8px' }}>Consultation History</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>Access your past symptom narratives and AI clinical briefs.</p>
      </div>

      <div className="history-filters">
        <div className="filter-input">
          <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>search</span>
          <input type="text" placeholder="Search by condition or symptom..." style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '14px' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40 }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="empty-card" style={{ marginTop: '32px' }}>
          <div className="empty-icon"><span className="material-symbols-outlined">inbox</span></div>
          <h3>No consultations yet</h3>
          <p>Start by analyzing your symptoms to generate your first clinical brief.</p>
          <Link href="/symptoms">
            <button className="btn-primary" style={{ marginTop: '16px' }}>New Entry</button>
          </Link>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((record) => (
            <Link key={record.id} href={`/analysis?id=${record.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="history-card">
                <div className="history-card-top">
                  <div>
                    <div className="history-date">
                      {new Date(record.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="history-condition">{record.condition || 'Pending Analysis'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className={`status-pill ${record.condition ? 'status-generated' : 'status-draft'}`}>
                      {record.condition ? 'Generated' : 'Draft'}
                    </span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(record.id); }} className="icon-btn" style={{ color: 'var(--error)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                    </button>
                  </div>
                </div>
                <div className="history-quote">"{record.symptoms}"</div>
                
                {record.analysis_result?.hpoTerms && (
                  <div className="condition-chips">
                    {record.analysis_result.hpoTerms.slice(0, 3).map((term: any, idx: number) => (
                      <span key={idx} className="cond-chip">
                        <span className="material-symbols-outlined">prescriptions</span> {term.name}
                      </span>
                    ))}
                    {record.analysis_result.hpoTerms.length > 3 && (
                      <span className="cond-chip">+{record.analysis_result.hpoTerms.length - 3}</span>
                    )}
                  </div>
                )}
                
                <div className="history-card-footer">
                  <div className="history-actions">
                    <button className="btn-text" style={{ padding: 0 }}>View Analysis <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span></button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(246,250,250,0.85)', backdropFilter:'blur(5px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="card" style={{ width:'400px', textAlign:'center', border:'1px solid var(--outline-variant)', background:'white', boxShadow:'0 16px 40px rgba(0,96,103,0.1)' }}>
            <div style={{ background:'var(--error-container)', color:'var(--error)', width:'56px', height:'56px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'28px' }}>delete_forever</span>
            </div>
            <h2 style={{ fontSize:'20px', fontWeight:800, marginBottom:'12px', color:'var(--on-surface)' }}>Delete Medical Record?</h2>
            <p style={{ fontSize:'14px', color:'var(--on-surface-variant)', marginBottom:'24px' }}>This action cannot be undone. This clinical overview will be permanently removed from your history.</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
              <button className="btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-primary" style={{ background:'var(--error)', color:'white' }} onClick={confirmDelete}>Delete Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
