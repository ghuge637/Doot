import React, { useState } from 'react';
import { FileText, SlidersHorizontal, Archive, CheckCircle2, UploadCloud, Sparkles, ShieldCheck, Menu, X, HelpCircle } from 'lucide-react';

export default function Navbar({
  backendConnected,
  resumeInfo,
  smtpEmail,
  onOpenSmtp,
  onOpenHistory,
  onUploadResumeTrigger,
  onLoadDemoData,
  onOpenHelp
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 9, 14, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-logo-shell" aria-hidden="true">
            <img className="brand-logo" src="/Doot.png" alt="" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Doot
              </span>
              <span className="pill pill-brand" style={{ fontSize: '9px', padding: '1px 5px' }}>
                PRO
              </span>
            </div>
            <p className="hide-on-mobile" style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '-0.1px' }}>
              Cold Outreach Platform
            </p>
          </div>
        </div>

        {/* Desktop Center Pills (Hidden on Mobile) */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Backend Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px'
          }}>
            <span className={`status-dot ${backendConnected ? 'status-dot-active status-dot-pulsing' : ''}`} style={{ background: backendConnected ? '#10b981' : '#ef4444' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
              {backendConnected ? 'Engine Ready' : 'Connecting...'}
            </span>
          </div>

          {/* SMTP Pill */}
          <div
            onClick={onOpenSmtp}
            title="Click to manage SMTP gateway"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              background: smtpEmail ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
              border: `1px solid ${smtpEmail ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <ShieldCheck size={13} color={smtpEmail ? '#34d399' : '#fbbf24'} />
            <span style={{ color: smtpEmail ? 'var(--text-primary)' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {smtpEmail ? smtpEmail : 'Setup SMTP'}
            </span>
          </div>

          {/* Resume Chip */}
          <div
            onClick={onUploadResumeTrigger}
            title="Click to replace active resume"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              background: resumeInfo?.exists ? 'rgba(249, 115, 22, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${resumeInfo?.exists ? 'rgba(249, 115, 22, 0.3)' : 'var(--amber-border)'}`,
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <FileText size={13} color={resumeInfo?.exists ? '#fb923c' : '#fbbf24'} />
            {resumeInfo?.exists ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{resumeInfo.fileName}</span>
            ) : (
              <span style={{ color: '#fbbf24' }}>Attach Resume</span>
            )}
          </div>
        </div>

        {/* Desktop Action Buttons (Hidden on Mobile) */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onLoadDemoData && (
            <button
              className="btn btn-secondary"
              onClick={onLoadDemoData}
              style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}
            >
              <Sparkles size={12} color="#fb923c" />
              <span>Demo Data</span>
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onOpenHistory}
            style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}
          >
            <Archive size={13} />
            <span>Logs</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenHelp}
            title="Open SMTP Gateway Setup Guide"
            style={{ height: '32px', padding: '0 10px', fontSize: '11px', color: '#fed7aa', borderColor: 'rgba(249, 115, 22, 0.3)' }}
          >
            <HelpCircle size={13} color="#fb923c" />
            <span>Setup Guide</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenSmtp}
            style={{ height: '32px', padding: '0 10px', fontSize: '11px' }}
          >
            <SlidersHorizontal size={13} />
            <span>Settings</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div style={{ display: 'none' }} className="show-on-mobile">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '36px' }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 17, 26, 0.98)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Status Indicators Row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px'
            }}>
              <span className={`status-dot ${backendConnected ? 'status-dot-active' : ''}`} style={{ background: backendConnected ? '#10b981' : '#ef4444' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{backendConnected ? 'Engine Ready' : 'Connecting...'}</span>
            </div>

            <div
              onClick={() => { setMobileMenuOpen(false); onOpenSmtp(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: smtpEmail ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${smtpEmail ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
                fontSize: '12px'
              }}
            >
              <ShieldCheck size={14} color={smtpEmail ? '#34d399' : '#fbbf24'} />
              <span style={{ color: smtpEmail ? 'var(--text-primary)' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                {smtpEmail ? smtpEmail : 'Setup SMTP'}
              </span>
            </div>
          </div>

          {/* Quick Actions List */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setMobileMenuOpen(false); onUploadResumeTrigger(); }}
              style={{ fontSize: '12px' }}
            >
              <FileText size={14} color="#fb923c" />
              <span>{resumeInfo?.exists ? 'Update Resume' : 'Attach Resume'}</span>
            </button>

            {onLoadDemoData && (
              <button
                className="btn btn-secondary"
                onClick={() => { setMobileMenuOpen(false); onLoadDemoData(); }}
                style={{ fontSize: '12px' }}
              >
                <Sparkles size={14} color="#fb923c" />
                <span>Load Demo Data</span>
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => { setMobileMenuOpen(false); onOpenHistory(); }}
              style={{ fontSize: '12px' }}
            >
              <Archive size={14} />
              <span>Dispatch Logs</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => { setMobileMenuOpen(false); onOpenHelp(); }}
              style={{ fontSize: '12px', color: '#fed7aa', borderColor: 'rgba(249, 115, 22, 0.4)' }}
            >
              <HelpCircle size={14} color="#fb923c" />
              <span>Setup Guide</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={() => { setMobileMenuOpen(false); onOpenSmtp(); }}
              style={{ fontSize: '12px' }}
            >
              <SlidersHorizontal size={14} />
              <span>SMTP Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
