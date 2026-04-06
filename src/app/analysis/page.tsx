'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      const { data: result, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching data', error);
      } else {
        setData(result);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading analysis...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40 }}>Analysis not found or still processing.</div>;
  }

  const analysis = data.analysis_result || {};

  return (
    <div className="page active" id="page-analysis" style={{ display: 'block' }}>
      <div className="analysis-header">
        <div className="session-label">Session: {data.id.substring(0,8).toUpperCase()}</div>
        <h1 className="analysis-title">AI Clinical Brief</h1>
        <p className="analysis-subtitle">Based on your narrative, here is how our AI models interpreted your symptoms mapped to established medical ontologies.</p>
      </div>

      <div className="analysis-grid">
        <div className="narrative-card">
          <div className="narrative-header">
            <div className="narrative-title"><span className="material-symbols-outlined">assignment</span> Narrative Core</div>
            <div className="narrative-time">Just now</div>
          </div>
          <div className="narrative-quote">"{data.symptoms}"</div>
          <div className="narrative-tags">
            {analysis.hpoTerms?.map((term: any, idx: number) => (
              <span key={idx} className="tag">{term.name}</span>
            ))}
          </div>
        </div>

        <div className="mapping-card">
          <div className="hpo-label">Ontology Mapping</div>
          
          {analysis.hpoTerms?.map((term: any, idx: number) => (
            <div key={idx} className="hpo-item">
              <div className="hpo-code">{term.code}</div>
              <div className="hpo-name">{term.name}</div>
              <div className="hpo-desc">{term.desc}</div>
            </div>
          ))}

          <h3 style={{marginTop: '24px', fontSize: '15px', fontWeight: 700}}>Differentials</h3>
          <div style={{marginTop: '12px'}}>
            {analysis.differentialDiagnosis?.map((diff: any, idx: number) => (
              <div key={idx} style={{marginBottom: '10px'}}>
                <div className="confidence-row">
                  <span style={{fontSize: '13px', fontWeight: 600}}>{diff.name}</span>
                  <span className="match-score">{diff.score}%</span>
                </div>
                <div className="conf-bar-wrap">
                  <div className="conf-bar" style={{ width: `${diff.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysis.doctorCommunication && analysis.doctorCommunication.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="hpo-label" style={{ marginBottom: '20px' }}>What to tell your doctor</div>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            {analysis.doctorCommunication.map((comm: any, idx: number) => (
              <div key={idx} style={{ borderLeft: '3px solid var(--secondary-container)', paddingLeft: '16px', background: 'var(--surface)', padding: '16px 20px', borderRadius: '0 12px 12px 0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--primary)' }}>{comm.topic}</h4>
                <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>"{comm.question}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="save-btn" style={{ marginTop: '24px' }}>
        <button className="btn-primary" onClick={() => window.print()}>
          <span className="material-symbols-outlined">download</span> Download PDF Report
        </button>
      </div>
    </div>
  );
}

export default function Analysis() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading analysis module...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
