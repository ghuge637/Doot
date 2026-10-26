import React, { useState, useEffect } from 'react';
import {
  X, SendHorizontal, CheckCircle2, AlertCircle, KeyRound,
  ExternalLink, HelpCircle, Settings, ShieldCheck, Mail, Server, Info, ArrowRight, Check
} from 'lucide-react';

export default function SmtpModal({ isOpen, onClose, onSave, initialTab = 'config' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'config' | 'guide'
  const [guideProvider, setGuideProvider] = useState('gmail'); // 'gmail' | 'outlook' | 'troubleshooting'

  const [config, setConfig] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromName: ''
  });

  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'config');
      fetch('http://localhost:8080/api/smtp/config')
        .then(res => res.json())
        .then(data => {
          setConfig(data);
          if (data.username && !testEmail) {
            setTestEmail(data.username);
          }
        })
        .catch(err => console.error('Failed to load SMTP settings:', err));
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleApplyPreset = (provider) => {
    if (provider === 'gmail') {
      setConfig(prev => ({ ...prev, host: 'smtp.gmail.com', port: 587 }));
    } else if (provider === 'outlook') {
      setConfig(prev => ({ ...prev, host: 'smtp.office365.com', port: 587 }));
    } else if (provider === 'yahoo') {
      setConfig(prev => ({ ...prev, host: 'smtp.mail.yahoo.com', port: 587 }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        if (onSave) onSave(config);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTest = async () => {
    if (!config.username || !config.password) {
      setTestResult({ success: false, message: 'Please supply sender credentials first.' });
      return;
    }
    const target = testEmail || config.username;
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('http://localhost:8080/api/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, recipientEmail: target })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || `Test verification email delivered to ${target}. Check your inbox!` });
      } else {
        setTestResult({ success: false, message: data.error || 'SMTP delivery rejected by host.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Connection error: ' + err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-panel modal-dialog" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* Modal Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 17, 26, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb923c'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                SMTP Gateway & Outreach Center
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Direct, encrypted outbound email transmission for job pitches
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs (Config vs Step-by-Step Guide) */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(8, 9, 14, 0.6)',
          padding: '0 22px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            style={{
              padding: '12px 16px',
              fontSize: '12px',
              fontWeight: activeTab === 'config' ? '600' : '500',
              color: activeTab === 'config' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'config' ? '2px solid var(--accent-brand)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)'
            }}
          >
            <Settings size={14} color={activeTab === 'config' ? 'var(--accent-brand)' : 'currentColor'} />
            <span>Credentials & Configuration</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '12px 16px',
              fontSize: '12px',
              fontWeight: activeTab === 'guide' ? '600' : '500',
              color: activeTab === 'guide' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'guide' ? '2px solid var(--accent-brand)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)'
            }}
          >
            <HelpCircle size={14} color={activeTab === 'guide' ? 'var(--accent-brand)' : 'currentColor'} />
            <span>Step-by-Step Setup Guide & Links</span>
            <span className="pill pill-brand" style={{ fontSize: '9px', padding: '1px 5px', marginLeft: '2px' }}>
              Tutorial
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {activeTab === 'config' ? (
            /* =========================================================================
               TAB 1: CONFIGURATION FORM
               ========================================================================= */
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Top Guide Callout Banner */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <KeyRound size={17} color="var(--accent-brand)" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      Using Gmail? A 16-character Google App Password is required.
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                      Google blocks standard account passwords for third-party automated tools.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="btn btn-secondary"
                  style={{ height: '28px', fontSize: '11px', padding: '0 10px', color: '#fed7aa', borderColor: 'rgba(249, 115, 22, 0.4)' }}
                >
                  <span>View Step-by-Step Instructions &rarr;</span>
                </button>
              </div>

              {/* Provider Quick Presets */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px', display: 'block' }}>
                  One-Click Host Presets
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('gmail')}
                    className={`btn ${config.host.includes('gmail') ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px' }}
                  >
                    Google / Gmail (Port 587)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('outlook')}
                    className={`btn ${config.host.includes('office365') ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px' }}
                  >
                    Microsoft Outlook / 365
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('yahoo')}
                    className={`btn ${config.host.includes('yahoo') ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px' }}
                  >
                    Yahoo Mail
                  </button>
                </div>
              </div>

              {/* Server Host & Port */}
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Server size={12} /> SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={config.host}
                    onChange={e => setConfig({ ...config, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                    Port (TLS)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={config.port}
                    onChange={e => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
                    placeholder="587"
                    required
                  />
                </div>
              </div>

              {/* Sender Email / Username */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} /> Sender Email Address (Your Account)
                </label>
                <input
                  type="email"
                  className="input"
                  value={config.username}
                  onChange={e => {
                    setConfig({ ...config, username: e.target.value });
                    if (!testEmail) setTestEmail(e.target.value);
                  }}
                  placeholder="e.g. dev.applicant@gmail.com"
                  required
                />
              </div>

              {/* 16-Char App Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <KeyRound size={12} /> App Password (16 Characters)
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: '#fb923c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>Get Google Password</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <input
                  type="password"
                  className="input"
                  value={config.password}
                  onChange={e => setConfig({ ...config, password: e.target.value })}
                  placeholder="Paste 16-character password (e.g. abcd efgh ijkl mnop)"
                  required
                />
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Tip: Spaces in the 16 characters are automatically removed by Doot.
                </p>
              </div>

              {/* Sender Display Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                  Sender Display Name (Shows in Recruiter's Inbox)
                </label>
                <input
                  type="text"
                  className="input"
                  value={config.fromName}
                  onChange={e => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="e.g. John Doe (Full Stack Engineer)"
                />
              </div>

              {/* Verification Delivery Section */}
              <div style={{
                marginTop: '4px',
                padding: '14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Instant SMTP Connection Verification
                  </h4>
                  <span className="pill pill-secondary" style={{ fontSize: '9px' }}>
                    Live Test
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                  Dispatches a test verification email with your attached resume to confirm host connection and credentials.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    className="input"
                    style={{ flex: 1, height: '34px', fontSize: '12px' }}
                    placeholder="Destination email (defaults to your address)"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ height: '34px', fontSize: '12px' }}
                    onClick={handleSendTest}
                    disabled={testLoading}
                  >
                    <SendHorizontal size={13} />
                    <span>{testLoading ? 'Testing...' : 'Send Test'}</span>
                  </button>
                </div>

                {testResult && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    background: testResult.success ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
                    border: `1px solid ${testResult.success ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
                    color: testResult.success ? '#34d399' : '#f87171'
                  }}>
                    {testResult.success ? <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                {saveSuccess && (
                  <span style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Credentials Saved!
                  </span>
                )}
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ height: '34px' }}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" style={{ height: '34px' }}>
                  Save Credentials
                </button>
              </div>
            </form>
          ) : (
            /* =========================================================================
               TAB 2: DETAILED STEP-BY-STEP SETUP GUIDE & DIRECT LINKS
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Provider Selection Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '4px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => setGuideProvider('gmail')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: guideProvider === 'gmail' ? '600' : '400',
                    background: guideProvider === 'gmail' ? 'rgba(249, 115, 22, 0.2)' : 'none',
                    border: guideProvider === 'gmail' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                    color: guideProvider === 'gmail' ? '#ffffff' : 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  Google / Gmail (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setGuideProvider('outlook')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: guideProvider === 'outlook' ? '600' : '400',
                    background: guideProvider === 'outlook' ? 'rgba(249, 115, 22, 0.2)' : 'none',
                    border: guideProvider === 'outlook' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                    color: guideProvider === 'outlook' ? '#ffffff' : 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  Microsoft Outlook / 365
                </button>
                <button
                  type="button"
                  onClick={() => setGuideProvider('troubleshooting')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: guideProvider === 'troubleshooting' ? '600' : '400',
                    background: guideProvider === 'troubleshooting' ? 'rgba(249, 115, 22, 0.2)' : 'none',
                    border: guideProvider === 'troubleshooting' ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                    color: guideProvider === 'troubleshooting' ? '#ffffff' : 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  Troubleshooting & FAQ
                </button>
              </div>

              {/* GMAIL SETUP GUIDE */}
              {guideProvider === 'gmail' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(249, 115, 22, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Why is a Google App Password required?</strong>
                    <br />
                    Google requires modern applications connecting via SMTP to use a dedicated <strong>16-character App Password</strong> rather than your personal password. This keeps your personal Google account secure and prevents login blockades.
                  </div>

                  {/* Step 1 */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--accent-brand)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>1</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Turn ON 2-Step Verification (Mandatory Prerequisite)
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Google only allows creating App Passwords if 2-Step Verification is active on your Google Account. If you already have 2-Step Verification turned on, you can proceed to Step 2.
                      </p>
                      <a
                        href="https://myaccount.google.com/signinoptions/two-step-verification"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', height: '30px', fontSize: '11px', color: '#fb923c', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                      >
                        <span>Open Google 2-Step Verification</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--accent-brand)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>2</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Generate a 16-Character App Password
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Navigate to Google's App Passwords portal. In the <strong>App name</strong> field, type <code>Doot</code> (or any label), and click <strong>Create</strong>.
                      </p>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', height: '30px', fontSize: '11px' }}
                      >
                        <span>Open Google App Passwords Page &rarr;</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--accent-brand)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>3</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Copy the Generated 16-Character Code
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Google will display a yellow dialog containing a 16-character code (example: <code>abcd efgh ijkl mnop</code>). Copy this code.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--accent-brand)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>4</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Paste into Doot & Verify
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Paste the code into the App Password input on the Credentials tab, ensure the host is <code>smtp.gmail.com</code> (Port <code>587</code>), and click <strong>Send Test</strong> to confirm delivery.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyPreset('gmail');
                          setActiveTab('config');
                        }}
                        className="btn btn-secondary"
                        style={{ height: '30px', fontSize: '11px', color: '#34d399', borderColor: 'var(--emerald-border)' }}
                      >
                        <Check size={12} />
                        <span>Apply Gmail Settings & Return to Form</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MICROSOFT OUTLOOK SETUP GUIDE */}
              {guideProvider === 'outlook' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(251, 146, 60, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(251, 146, 60, 0.2)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Microsoft Outlook & Office 365 Setup:</strong>
                    <br />
                    Works with <code>@outlook.com</code>, <code>@hotmail.com</code>, <code>@live.com</code>, and corporate Office 365 accounts.
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fb923c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>1</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Enable Microsoft Two-Step Verification
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Visit your Microsoft Account Security dashboard and confirm Two-Step Verification is active.
                      </p>
                      <a
                        href="https://account.live.com/proofs/manage/additional"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', height: '30px', fontSize: '11px', color: '#fb923c' }}
                      >
                        <span>Open Microsoft Security Dashboard</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fb923c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>2</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Create an App Password
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Under the "App passwords" section, click <strong>Create a new app password</strong>.
                      </p>
                      <a
                        href="https://account.live.com/proofs/AppPassword"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', height: '30px', fontSize: '11px', color: '#fb923c' }}
                      >
                        <span>Direct Link: Microsoft App Password</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fb923c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>3</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Configure in Doot
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                        Use Host: <code>smtp.office365.com</code>, Port: <code>587</code>, and paste your generated App Password.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyPreset('outlook');
                          setActiveTab('config');
                        }}
                        className="btn btn-secondary"
                        style={{ height: '30px', fontSize: '11px', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.3)' }}
                      >
                        <Check size={12} />
                        <span>Apply Outlook Settings & Return to Form</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TROUBLESHOOTING & FAQ */}
              {guideProvider === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#f87171', marginBottom: '4px' }}>
                      Error 535: 5.7.8 Username and Password not accepted
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong>Why this happens:</strong> You entered your regular Gmail password rather than a 16-character App Password, OR 2-Step Verification is turned off on your Google Account.
                      <br />
                      <strong>Solution:</strong> Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#fb923c' }}>Google App Passwords</a>, create an App Password, and paste the 16 characters into the password field.
                    </p>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24', marginBottom: '4px' }}>
                      Connection Timed Out or Blocked Port
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong>Why this happens:</strong> Some home routers or corporate VPNs block port 25 or 465.
                      <br />
                      <strong>Solution:</strong> Doot defaults to Port <strong>587</strong> with STARTTLS encryption, which is universally permitted. If you are on a restricted corporate VPN, disconnect temporarily or whitelist port 587.
                    </p>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Daily Email Sending Limits
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      • <strong>Personal Gmail:</strong> Google allows up to 500 emails per 24 hours.
                      <br />
                      • <strong>Google Workspace:</strong> Allows up to 2,000 emails per 24 hours.
                      <br />
                      • <strong>Pacing Protection:</strong> Doot's built-in 15s–30s humanized delay prevents triggering spam filters and keeps your sender reputation high.
                    </p>
                  </div>
                </div>
              )}

              {/* Guide Bottom Navigation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className="btn btn-primary"
                  style={{ height: '34px', fontSize: '12px' }}
                >
                  <span>Ready to Configure Credentials</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
