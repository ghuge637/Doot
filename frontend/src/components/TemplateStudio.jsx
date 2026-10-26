import React, { useState, useEffect } from 'react';
import { Code2, Eye, Bookmark, Variable, Check, Sparkles, Paperclip, Mail } from 'lucide-react';

export default function TemplateStudio({
  subject,
  setSubject,
  body,
  setBody,
  selectedRecipient,
  templates,
  onSelectTemplate,
  resumeInfo
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const [renderedPreview, setRenderedPreview] = useState(null);
  const [copiedTag, setCopiedTag] = useState(null);

  const insertTag = (tag) => {
    setBody(prev => prev + tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1200);
  };

  const insertSubjectTag = (tag) => {
    setSubject(prev => prev + tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1200);
  };

  useEffect(() => {
    if (activeTab === 'preview') {
      const recipient = selectedRecipient || {
        email: 'alex.rivera.tech@gmail.com',
        resolvedName: 'Alex Rivera',
        resolvedCompany: 'Google',
        jobRole: 'Senior Java Developer'
      };

      fetch('http://localhost:8080/api/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, recipient })
      })
        .then(res => res.json())
        .then(data => setRenderedPreview(data))
        .catch(err => console.error('Preview error:', err));
    }
  }, [activeTab, subject, body, selectedRecipient]);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header & Segmented Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} color="var(--accent-brand)" />
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              2. Outreach Pitch Studio
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Compose your template with dynamic tags. Preview live recipient rendering.
          </p>
        </div>

        {/* Segmented Control */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            className="btn"
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              height: '30px',
              background: activeTab === 'editor' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'editor' ? '#ffffff' : 'var(--text-tertiary)',
              border: activeTab === 'editor' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
              boxShadow: activeTab === 'editor' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : 'none'
            }}
            onClick={() => setActiveTab('editor')}
          >
            <Code2 size={13} />
            <span>Template Editor</span>
          </button>
          <button
            className="btn"
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              height: '30px',
              background: activeTab === 'preview' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'preview' ? '#ffffff' : 'var(--text-tertiary)',
              border: activeTab === 'preview' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
              boxShadow: activeTab === 'preview' ? '0 2px 6px rgba(0, 0, 0, 0.3)' : 'none'
            }}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={13} />
            <span>Live Recipient Preview</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      {templates && templates.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Bookmark size={14} color="var(--accent-brand)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pitch Preset:</span>
          <select
            className="select"
            style={{ padding: '4px 10px', fontSize: '12px', height: '30px', flex: 1, background: 'rgba(11, 13, 20, 0.8)' }}
            onChange={(e) => {
              const tmpl = templates.find(t => t.id === parseInt(e.target.value));
              if (tmpl && onSelectTemplate) onSelectTemplate(tmpl);
            }}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'editor' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject Line Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Email Subject
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => insertSubjectTag(' {{role}}')}
                  className="pill pill-brand"
                  style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                >
                  + &#123;&#123;role&#125;&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertSubjectTag(' {{company}}')}
                  className="pill pill-brand"
                  style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                >
                  + &#123;&#123;company&#125;&#125;
                </button>
              </div>
            </div>
            <input
              type="text"
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Application for {{role}} - [Your Name]"
            />
          </div>

          {/* Dynamic Variable Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Variable size={12} /> Click to Inject:
            </span>
            <button
              type="button"
              onClick={() => insertTag(' {{name}}')}
              className="pill pill-brand"
              style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              &#123;&#123;name&#125;&#125; (Recruiter Name)
            </button>
            <button
              type="button"
              onClick={() => insertTag(' {{company}}')}
              className="pill pill-brand"
              style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              &#123;&#123;company&#125;&#125; (Target Company)
            </button>
            <button
              type="button"
              onClick={() => insertTag(' {{role}}')}
              className="pill pill-brand"
              style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              &#123;&#123;role&#125;&#125; (Target Role)
            </button>
          </div>

          {/* Body Editor */}
          <div>
            <textarea
              className="textarea"
              style={{ minHeight: '220px', fontSize: '13px' }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email pitch here..."
            />
          </div>
        </div>
      ) : (
        /* Realistic macOS Mail / Gmail Client Preview Frame */
        <div style={{
          background: 'rgba(11, 13, 20, 0.95)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)'
        }}>
          {/* macOS Traffic Lights Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Recipient: {selectedRecipient ? selectedRecipient.email : 'alex.rivera.tech@gmail.com'}
            </span>

            <span className="pill pill-success" style={{ fontSize: '10px', padding: '1px 6px' }}>
              Live Render
            </span>
          </div>

          {/* Email Envelope Metadata */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                {renderedPreview?.subject || subject}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Just now</span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>To:</span>
              <span className="pill pill-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {selectedRecipient ? selectedRecipient.email : 'alex.rivera.tech@gmail.com'}
              </span>
            </div>

            {/* Resume Attachment Chip */}
            {resumeInfo?.exists && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
                color: '#fed7aa',
                fontSize: '11px',
                width: 'fit-content',
                marginTop: '4px'
              }}>
                <Paperclip size={12} />
                <span>{resumeInfo.fileName}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>({resumeInfo.fileSize})</span>
              </div>
            )}
          </div>

          {/* Formatted Rendered Letter Body */}
          <div style={{
            padding: '20px',
            whiteSpace: 'pre-line',
            fontSize: '13px',
            lineHeight: '1.8',
            color: '#e2e8f0',
            fontFamily: 'var(--font-sans)',
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {renderedPreview?.body || body}
          </div>
        </div>
      )}
    </div>
  );
}
