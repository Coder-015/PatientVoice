'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    medical_history: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            age: data.age || '',
            gender: data.gender || '',
            medical_history: data.medical_history || ''
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          ...profile,
          age: parseInt(profile.age) || null
        });
        
      if (error) {
        alert('Error saving profile');
      } else {
        alert('Profile saved successfully!');
      }
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading profile...</div>;

  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="report-header">
        <div>
          <h1 className="section-title" style={{ marginBottom: '8px' }}>Your Profile</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>Help PatientVoice understand your baseline history for better AI analysis.</p>
        </div>
        <div className="report-header-actions">
          <button className="btn-outline" onClick={handleSignOut} style={{ color: 'var(--error)', borderColor: 'var(--error-container)' }}>Sign Out</button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Full Name</label>
            <input 
              type="text" 
              value={profile.full_name}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--outline-variant)' }} 
              placeholder="John Doe" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Age</label>
              <input 
                type="number" 
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--outline-variant)' }} 
                placeholder="Years" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Gender Context</label>
              <select 
                value={profile.gender}
                onChange={(e) => setProfile({...profile, gender: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--outline-variant)', background: 'white' }}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Baseline Medical History</label>
            <textarea 
              value={profile.medical_history}
              onChange={(e) => setProfile({...profile, medical_history: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--outline-variant)', minHeight: '120px', fontFamily: 'Inter', resize: 'vertical' }} 
              placeholder="List any chronic conditions, past major surgeries, or ongoing medications..." 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
              <span className="material-symbols-outlined">save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
