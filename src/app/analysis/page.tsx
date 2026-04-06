'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

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
        
        // Fetch profile to see if doctor email is registered
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('doctor_email').eq('id', session.user.id).single();
          if (profile?.doctor_email) {
            setDoctorEmail(profile.doctor_email);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleEmailDoctor = () => {
    if (!doctorEmail) {
      alert("Please set your Family Doctor Email in the Profile Settings first.");
      return;
    }
    const analysis = data.analysis_result || {};
    const subject = `PatientVoice Clinical Brief - ${data.id.substring(0,8)}`;
    const body = `Hello,\n\nPlease review my recent symptom analysis generated via PatientVoice.\n\nNarrative: ${data.symptoms}\n\nTop Differentials:\n${analysis.differentialDiagnosis?.map((d:any) => `- ${d.name} (${d.score}%)`).join('\n')}\n\nThank you.`;
    window.location.href = `mailto:${doctorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendChat = async () => {
    if(!chatInput.trim()) return;
    const newMsgs = [...chatMessages, {role: 'user', content: chatInput}];
    setChatMessages(newMsgs);
    setChatInput('');
    setIsChatting(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, consultationId: data.id })
      });
      const resData = await res.json();
      if(res.ok) {
        setChatMessages([...newMsgs, {role: 'assistant', content: resData.reply}]);
      } else {
        alert("Error sending message: " + resData.error);
      }
    } catch(err) {
      console.error(err);
    }
    setIsChatting(false);
  };

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
      
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="hpo-label" style={{ marginBottom: '20px' }}>Ask Follow-Up Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
          {chatMessages.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Got questions about this report? Ask our medical AI below.</p>
          ) : chatMessages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role==='user'?'flex-end':'flex-start', background: m.role==='user'?'var(--primary)':'var(--surface-high)', color: m.role==='user'?'white':'var(--on-surface)', padding: '12px 18px', borderRadius: '18px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.6' }}>
              {m.content}
            </div>
          ))}
          {isChatting && <div style={{ alignSelf: 'flex-start', background: 'var(--surface-high)', color: 'var(--on-surface)', padding: '12px 18px', borderRadius: '18px', fontSize: '14px', fontStyle: 'italic' }}>Typing...</div>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Ask about symptoms, conditions, etc..." style={{ flex: 1, padding: '14px', borderRadius: '999px', border: '1.5px solid var(--outline-variant)', background: 'var(--surface-low)', color: 'var(--on-surface)', outline: 'none' }} />
          <button className="btn-primary" onClick={handleSendChat} disabled={isChatting} style={{ padding: '10px 24px' }}>
            <span className="material-symbols-outlined">send</span> Send
          </button>
        </div>
      </div>
      
      <div className="save-btn" style={{ marginTop: '24px', gap: '12px' }}>
        <button className="btn-outline" onClick={handleEmailDoctor} style={{ border: '2px solid var(--primary)' }}>
          <span className="material-symbols-outlined">mail</span> Forward to Doctor
        </button>
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
