'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: 'demo@patientvoice.com', password: 'DemoPassword123!' });
      if (error) {
        await supabase.auth.signUp({ email: 'demo@patientvoice.com', password: 'DemoPassword123!' });
        await supabase.auth.signInWithPassword({ email: 'demo@patientvoice.com', password: 'DemoPassword123!' });
      }
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link, or log in if confirmation is disabled in Supabase.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)', padding: '24px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '48px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--primary)', fontFamily: 'Manrope, sans-serif', fontSize: '28px', fontWeight: 800 }}>PatientVoice</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '8px' }}>
            {isLogin ? 'Welcome back! Sign in to access your history.' : 'Create your secure account to start analyzing symptoms.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1.5px solid var(--outline-variant)', borderRadius: '12px', fontSize: '15px', fontFamily: 'Inter, sans-serif', outline: 'none' }} 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1.5px solid var(--outline-variant)', borderRadius: '12px', fontSize: '15px', fontFamily: 'Inter, sans-serif', outline: 'none' }} 
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            <span className="material-symbols-outlined">login</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button type="button" onClick={handleDemoLogin} className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '24px', background: 'white', color: 'var(--on-surface-variant)', borderColor: 'var(--outline-variant)' }}>
            <span className="material-symbols-outlined" style={{ color: 'orange' }}>bolt</span> 1-Click Demo Login
          </button>
          <button type="button" className="btn-text" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
