import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';

export default function FileUploader({ onParseSuccess, isUploading, setIsUploading, onLoadDemoData }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [parseSummary, setParseSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setErrorMsg('Invalid format. Please supply a valid .xlsx or .csv spreadsheet.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/contacts/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setParseSummary(data);
        if (onParseSuccess) onParseSuccess(data);
      } else {
        setErrorMsg(data.error || 'Failed to parse file.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="var(--accent-brand)" />
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              1. Contact Data Ingestion
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Upload raw contact worksheets (.xlsx, .csv). Smart fallbacks run on ingestion.
          </p>
        </div>

        {parseSummary && (
          <span className="pill pill-success">
            <CheckCircle2 size={12} /> {parseSummary.validCount} Contacts Ready
          </span>
        )}
      </div>

      {/* Cybernetic Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1px dashed ${isDragActive ? 'var(--accent-brand)' : 'rgba(255, 255, 255, 0.15)'}`,
          background: isDragActive ? 'rgba(249, 115, 22, 0.08)' : 'rgba(15, 18, 28, 0.6)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: isDragActive ? '0 0 24px rgba(249, 115, 22, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isDragActive) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx, .xls, .csv"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fb923c'
        }}>
          {isUploading ? (
            <Loader2 className="spin" size={22} color="var(--accent-brand)" />
          ) : (
            <UploadCloud size={22} />
          )}
        </div>

        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isUploading ? 'Parsing worksheet & deduplicating...' : 'Drop your contact spreadsheet here, or browse files'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Supports .xlsx, .xls, or .csv with Email, Company, Recruiter Name, and Role
          </p>
        </div>

        {/* Demo Data Quick Trigger */}
        {onLoadDemoData && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemoData();
            }}
            style={{
              marginTop: '4px',
              padding: '5px 12px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              color: '#fed7aa',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <Sparkles size={12} />
            <span>Need sample data? Click to load sample recruiters instantly</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--rose-subtle)',
          border: '1px solid var(--rose-border)',
          color: '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Bento Telemetry Metric Cards */}
      {parseSummary && (
        <div className="bento-grid-4" style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px'
        }}>
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Rows Parsed</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{parseSummary.totalRows}</span>
          </div>

          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid var(--emerald-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: '#34d399', display: 'block' }}>Verified Contacts</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#34d399', fontFamily: 'var(--font-mono)' }}>{parseSummary.validCount}</span>
          </div>

          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: '#fbbf24', display: 'block' }}>Smart Fallbacks</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {parseSummary.recipients?.filter(r => (!r.rawCompany || !r.rawName) && r.valid).length || 0}
            </span>
          </div>

          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid var(--rose-border)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: '#f87171', display: 'block' }}>Filtered Out</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#f87171', fontFamily: 'var(--font-mono)' }}>{parseSummary.flaggedCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
