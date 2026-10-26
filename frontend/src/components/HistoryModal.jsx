import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, XCircle, Search, Calendar } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all dispatched application logs?')) return;
    try {
      await fetch('http://localhost:8080/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filtered = history.filter(h => {
    const q = searchTerm.toLowerCase();
    return (h.recipientEmail && h.recipientEmail.toLowerCase().includes(q)) ||
      (h.companyName && h.companyName.toLowerCase().includes(q)) ||
      (h.recruiterName && h.recruiterName.toLowerCase().includes(q));
  });

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel modal-dialog" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        padding: 0
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Dispatched Application Logs
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Persistent audit trail stored in local H2 database
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '30px', height: '32px', fontSize: '12px' }}
              placeholder="Search dispatched records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total Logs: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{history.length}</strong>
            </span>
            {history.length > 0 && (
              <button className="btn btn-secondary" onClick={handleClear} style={{ height: '30px', fontSize: '11px', color: '#f87171' }}>
                <Trash2 size={12} />
                <span>Purge Records</span>
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="table-scroll-container" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {filtered.length > 0 ? (
            <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <th style={{ padding: '8px 10px' }}>Timestamp</th>
                  <th style={{ padding: '8px 10px' }}>Target Email</th>
                  <th style={{ padding: '8px 10px' }}>Organization</th>
                  <th style={{ padding: '8px 10px' }}>Role</th>
                  <th style={{ padding: '8px 10px' }}>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--text-tertiary)', fontSize: '11px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {log.recipientEmail}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                      {log.companyName || '-'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                      {log.jobRole || '-'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {log.status === 'SENT' ? (
                        <span className="pill pill-success" style={{ fontSize: '10px' }}>
                          <CheckCircle2 size={10} /> Dispatched
                        </span>
                      ) : (
                        <span className="pill pill-danger" style={{ fontSize: '10px' }} title={log.errorMessage}>
                          <XCircle size={10} /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
              {loading ? 'Retrieving audit logs...' : 'No dispatched records found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
