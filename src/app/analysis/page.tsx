'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep(s => (s < 4 ? s + 1 : s));
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleEmailDoctor = async () => {
    if (!doctorEmail) {
      alert("Please set your Family Doctor Email in the Profile Settings first.");
      return;
    }
    setIsSendingEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase.from('profiles').select('full_name, doctor_name').eq('id', session?.user?.id).single();
      
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           reportId: data.id,
           doctorEmail: doctorEmail,
           doctorName: profile?.doctor_name || doctorEmail.split('@')[0],
           reportMarkdown: data.analysis_result?.markdown_report || "No markdown available",
           patientName: profile?.full_name || "A patient"
        })
      });
      if (res.ok) alert(`Report sent to ${profile?.doctor_name || doctorEmail} successfully!`);
      else alert("Failed to send report via email.");
    } catch (e) {
      console.error(e);
      alert("Error sending report");
    }
    setIsSendingEmail(false);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const reportElement = document.getElementById('pdf-print-container');
      if (!reportElement) { 
        alert("PDF Generation Failed: Cannot find report body."); 
        return; 
      }

      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PatientVoice-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e: any) {
      console.error(e);
      alert("Failed to generate PDF: " + e.message);
    }
    setIsGeneratingPDF(false);
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
    const steps = ["Reading symptoms", "Analyzing image context", "Mapping to HPO ontology", "Building differentials", "Finalizing clinical report"];
    return (
      <div style={{ padding: 60, maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24, color: 'var(--primary)', fontSize: '24px' }}>Processing Analysis</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', background: 'var(--surface)', padding: 32, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          {steps.map((step, idx) => (
             <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: loadingStep >= idx ? 1 : 0.4, transition: 'opacity 0.3s' }}>
               {loadingStep > idx ? (
                 <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>check_circle</span>
               ) : loadingStep === idx ? (
                 <div className="loading-pulse" style={{ width: 16, height: 16, borderWidth: 2, position: 'static' }}></div>
               ) : (
                 <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>radio_button_unchecked</span>
               )}
               <span style={{ fontWeight: loadingStep === idx ? 700 : 500, color: loadingStep >= idx ? 'var(--on-surface)' : 'var(--on-surface-variant)', fontSize: '15px' }}>{step}</span>
             </div>
          ))}
          <div style={{ width: '100%', height: 6, background: 'var(--surface-high)', borderRadius: 4, marginTop: 16, overflow: 'hidden' }}>
             <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.min(((loadingStep + 1) / steps.length) * 100, 100)}%`, transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 40 }}>Analysis not found or still processing.</div>;
  }

  const analysis = data.analysis_result || {};

  return (
    <div className="page active" id="page-analysis" style={{ display: 'block' }}>
      <div className="analysis-header" style={{ position: 'sticky', top: '0', background: 'var(--surface)', zIndex: 10, paddingBottom: '16px', paddingTop: '16px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="session-label">Session: {data.id.substring(0,8).toUpperCase()}</div>
            <h1 className="analysis-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              AI Clinical Brief
              {analysis.urgency && (
                <span style={{ 
                  fontSize: '13px', padding: '4px 12px', borderRadius: '12px', fontWeight: 700,
                  background: analysis.urgency === 'Emergency' ? '#fee2e2' : analysis.urgency === 'Urgent' ? '#fef3c7' : '#d1fae5',
                  color: analysis.urgency === 'Emergency' ? '#ef4444' : analysis.urgency === 'Urgent' ? '#f59e0b' : '#10b981'
                }}>{analysis.urgency}</span>
              )}
            </h1>
            <p className="analysis-subtitle">Based on your narrative, here is how our AI interpreted your symptoms.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" onClick={handleEmailDoctor} disabled={isSendingEmail} style={{ border: '2px solid var(--primary)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isSendingEmail ? <div className="loading-pulse" style={{width:16,height:16,borderWidth:2,position:'static'}}></div> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>forward_to_inbox</span>}
              Forward to Doctor
            </button>
            <button className="btn-primary" onClick={handleDownloadPDF} disabled={isGeneratingPDF} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isGeneratingPDF ? <div className="loading-pulse" style={{width:16,height:16,borderWidth:2,position:'static'}}></div> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="analysis-grid" id="clinical-report-card">
        <div className="narrative-card">
          <div className="narrative-header">
            <div className="narrative-title"><span className="material-symbols-outlined">assignment</span> Narrative Core</div>
            <div className="narrative-time">Original Input</div>
          </div>
          <div className="narrative-quote">"{data.symptoms}"</div>
          {analysis.hpoTerms && (
            <div className="narrative-tags">
              {analysis.hpoTerms.slice(0, 5).map((term: any, idx: number) => (
                <span key={idx} className="tag">{term.name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mapping-card" style={{ padding: '28px', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
          {analysis.markdown_report ? (
             <ReactMarkdown 
               remarkPlugins={[remarkGfm]}
               components={{
                 h3: ({node, ...props}) => <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '24px 0 12px', color: 'var(--primary)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }} {...props} />,
                 h4: ({node, ...props}) => <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '16px 0 8px', color: 'var(--on-surface)' }} {...props} />,
                 p: ({node, ...props}) => <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '12px', color: 'var(--on-surface)' }} {...props} />,
                 ul: ({node, ...props}) => <ul style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'disc', fontSize: '15px', lineHeight: 1.6, color: 'var(--on-surface)' }} {...props} />,
                 ol: ({node, ...props}) => <ol style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'decimal', fontSize: '15px', lineHeight: 1.6, color: 'var(--on-surface)' }} {...props} />,
                 li: ({node, ...props}) => <li style={{ marginBottom: '6px', color: 'var(--on-surface)' }} {...props} />,
                 table: ({node, ...props}) => <div style={{ overflowX: 'auto', marginBottom: '16px' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: 'var(--on-surface)' }} {...props} /></div>,
                 th: ({node, ...props}) => <th style={{ background: 'var(--surface-high)', padding: '12px', borderBottom: '2px solid var(--outline-variant)', fontWeight: 600, color: 'var(--on-surface)' }} {...props} />,
                 td: ({node, ...props}) => <td style={{ padding: '12px', borderBottom: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)' }} {...props} />,
                 strong: ({node, ...props}) => <strong style={{ fontWeight: 700, color: 'var(--primary)' }} {...props} />
               }}
             >
               {analysis.markdown_report}
             </ReactMarkdown>
          ) : (
             <div>Legacy format report. Please run a new analysis.</div>
          )}
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
            <div>
              <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', fontStyle: 'italic', marginBottom: '16px' }}>Got questions about this report? Ask our medical AI below.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {["What specialist should I see?", "How urgent is this really?", "What should I tell my doctor first?"].map(q => (
                  <button key={q} onClick={() => setChatInput(q)} style={{ background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', borderRadius: '16px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : chatMessages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role==='user'?'flex-end':'flex-start', background: m.role==='user'?'var(--primary)':'var(--surface-high)', color: m.role==='user'?'var(--on-primary, white)':'var(--on-surface)', padding: '16px 20px', borderRadius: '18px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.6' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p style={{ marginBottom: '12px' }} {...props} />,
                  ul: ({node, ...props}) => <ul style={{ paddingLeft: '24px', marginBottom: '12px', listStyleType: 'disc' }} {...props} />,
                  ol: ({node, ...props}) => <ol style={{ paddingLeft: '24px', marginBottom: '12px', listStyleType: 'decimal' }} {...props} />,
                  li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
                  strong: ({node, ...props}) => <strong style={{ fontWeight: 800, color: m.role==='user'?'inherit':'var(--primary)' }} {...props} />
                }}
              >
                {m.content}
              </ReactMarkdown>
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

      {/* INVISIBLE PDF EXPORT CONTAINER */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, zIndex: -1 }}>
        <div id="pdf-print-container" style={{ width: '800px', background: 'white', padding: '60px', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '28px', borderBottom: '2px solid #006067', paddingBottom: '10px', color: '#006067', margin: 0 }}>
            PatientVoice Clinical Report
          </h1>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
            <strong>Session ID:</strong> {data.id}<br/>
            <strong>Date:</strong> {new Date(data.created_at || Date.now()).toLocaleDateString()}<br/>
            <strong>Urgency Level:</strong> {analysis.urgency || 'Routine'}
          </div>
          
          <h2 style={{ marginTop: '30px', fontSize: '20px', color: '#006067' }}>Patient Narrative</h2>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontStyle: 'italic', fontSize: '15px', color: '#333' }}>
            "{data.symptoms}"
          </div>

          <h2 style={{ marginTop: '30px', fontSize: '20px', color: '#006067' }}>AI Analysis & Mapping</h2>
          <div style={{ color: '#000' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({node, ...props}) => <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '24px 0 12px', color: '#006067', borderBottom: '1px solid #ddd', paddingBottom: '8px' }} {...props} />,
                h4: ({node, ...props}) => <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '16px 0 8px', color: '#111' }} {...props} />,
                p: ({node, ...props}) => <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '12px', color: '#222' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'disc', fontSize: '15px', lineHeight: 1.6, color: '#222' }} {...props} />,
                ol: ({node, ...props}) => <ol style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'decimal', fontSize: '15px', lineHeight: 1.6, color: '#222' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '6px', color: '#222' }} {...props} />,
                table: ({node, ...props}) => <div style={{ marginBottom: '16px' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#222' }} {...props} /></div>,
                th: ({node, ...props}) => <th style={{ background: '#f0f4f4', padding: '12px', borderBottom: '2px solid #ccc', fontWeight: 600, color: '#111' }} {...props} />,
                td: ({node, ...props}) => <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#444' }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ fontWeight: 700, color: '#006067' }} {...props} />
              }}
            >
              {analysis.markdown_report || "No markdown available"}
            </ReactMarkdown>
          </div>
          
          {analysis.doctorCommunication && analysis.doctorCommunication.length > 0 && (
            <>
              <h2 style={{ marginTop: '30px', fontSize: '20px', color: '#006067' }}>Questions for Doctor</h2>
              <ul style={{ color: '#222', fontSize: '15px', lineHeight: '1.6' }}>
                {analysis.doctorCommunication.map((comm: any, idx: number) => (
                  <li key={idx}><strong>{comm.topic}:</strong> {comm.question}</li>
                ))}
              </ul>
            </>
          )}

          <div style={{ marginTop: '40px', fontSize: '12px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            This report is AI-generated for clinical communication purposes only and does not constitute a medical diagnosis.
          </div>
        </div>
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
