import React, { useState } from 'react';
import { Search, Trash2, CheckCircle2, AlertCircle, Copy, Check, Filter, Sparkles, Users } from 'lucide-react';

export default function ContactReviewTable({ recipients, onUpdateRecipients, selectedRecipient, onSelectRecipient, onToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'VALID', 'FALLBACK'
  const [copiedEmail, setCopiedEmail] = useState(null);

  if (!recipients || recipients.length === 0) {
    return null;
  }

  const handleCopy = (email, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
    if (onToast) onToast('Copied email to clipboard: ' + email);
  };

  const filtered = recipients.filter(r => {
    // Mode filter
    if (filterMode === 'VALID' && !r.valid) return false;
    if (filterMode === 'FALLBACK') {
      const hasFallback = (!r.rawCompany || !r.rawCompany.trim()) || (!r.rawName || !r.rawName.trim());
      if (!hasFallback) return false;
    }

    // Search query
    const q = searchTerm.toLowerCase();
    return (r.email && r.email.toLowerCase().includes(q)) ||
      (r.resolvedCompany && r.resolvedCompany.toLowerCase().includes(q)) ||
      (r.resolvedName && r.resolvedName.toLowerCase().includes(q)) ||
      (r.jobRole && r.jobRole.toLowerCase().includes(q));
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = recipients.filter(r => r.id !== id);
    onUpdateRecipients(updated);
  };

  const validCount = recipients.filter(r => r.valid).length;
  const fallbackCount = recipients.filter(r => (!r.rawCompany || !r.rawName) && r.valid).length;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="var(--accent-brand)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Ingested Recruiters Review
            </h3>
            <span className="pill pill-brand" style={{ fontSize: '11px' }}>
              {validCount} Ready
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Click any row to instantly inspect its personalized email rendering in the Preview Studio.
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              className="btn"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                height: '28px',
                background: filterMode === 'ALL' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: filterMode === 'ALL' ? '#ffffff' : 'var(--text-tertiary)',
                border: filterMode === 'ALL' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none'
              }}
              onClick={() => setFilterMode('ALL')}
            >
              All ({recipients.length})
            </button>
            <button
              className="btn"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                height: '28px',
                background: filterMode === 'VALID' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: filterMode === 'VALID' ? '#34d399' : 'var(--text-tertiary)',
                border: filterMode === 'VALID' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none'
              }}
              onClick={() => setFilterMode('VALID')}
            >
              Ready ({validCount})
            </button>
            <button
              className="btn"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                height: '28px',
                background: filterMode === 'FALLBACK' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: filterMode === 'FALLBACK' ? '#fbbf24' : 'var(--text-tertiary)',
                border: filterMode === 'FALLBACK' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none'
              }}
              onClick={() => setFilterMode('FALLBACK')}
            >
              Fallbacks ({fallbackCount})
            </button>
          </div>

          <div style={{ position: 'relative', width: '180px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '30px', paddingRight: '8px', height: '30px', fontSize: '12px' }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* High-Precision Table */}
      <div className="table-scroll-container" style={{
        maxHeight: '340px',
        overflowY: 'auto',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(8, 9, 14, 0.8)'
      }}>
        <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <th style={{ padding: '9px 12px', width: '36px' }}>#</th>
              <th style={{ padding: '9px 12px' }}>Recruiter</th>
              <th style={{ padding: '9px 12px' }}>Company</th>
              <th style={{ padding: '9px 12px' }}>Email Address</th>
              <th style={{ padding: '9px 12px' }}>Target Role</th>
              <th style={{ padding: '9px 12px' }}>Validation</th>
              <th style={{ padding: '9px 12px', textAlign: 'right', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const isSelected = selectedRecipient?.id === r.id;
              const hasCompanyFallback = !r.rawCompany || !r.rawCompany.trim();
              const hasNameFallback = !r.rawName || !r.rawName.trim();

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecipient(r)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '9px 12px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {idx + 1}
                  </td>

                  {/* Recruiter Name */}
                  <td style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {r.resolvedName}
                    {hasNameFallback && (
                      <span className="pill pill-warning" style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 5px' }}>
                        <Sparkles size={8} /> Hiring Team
                      </span>
                    )}
                  </td>

                  {/* Company */}
                  <td style={{ padding: '9px 12px', color: '#c7d2fe' }}>
                    {r.resolvedCompany}
                    {hasCompanyFallback && (
                      <span className="pill pill-warning" style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 5px' }}>
                        <Sparkles size={8} /> {r.resolvedCompany === 'your company' ? 'Auto Fallback' : 'Domain Inferred'}
                      </span>
                    )}
                  </td>

                  {/* Email */}
                  <td style={{ padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: r.valid ? 'var(--text-primary)' : '#f87171' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{r.email || '(Empty)'}</span>
                      {r.email && (
                        <button
                          onClick={(e) => handleCopy(r.email, e)}
                          title="Copy email"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedEmail === r.email ? '#34d399' : 'var(--text-tertiary)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {copiedEmail === r.email ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '9px 12px', color: 'var(--text-secondary)' }}>
                    {r.jobRole}
                  </td>

                  {/* Validation Status */}
                  <td style={{ padding: '9px 12px' }}>
                    {r.valid ? (
                      <span className="pill pill-success" style={{ fontSize: '10px' }}>
                        <CheckCircle2 size={10} /> Ready
                      </span>
                    ) : (
                      <span className="pill pill-danger" style={{ fontSize: '10px' }} title={r.warnings?.join(', ')}>
                        <AlertCircle size={10} /> Skipped
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleDelete(r.id, e)}
                      title="Remove row"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
