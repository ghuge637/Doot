import React from 'react';
import { Play, Pause, Square, ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, Terminal, Cpu, Radio, Sparkles } from 'lucide-react';

export default function ExecutionMonitor({
  campaignStatus,
  countdown,
  events,
  validRecipientsCount,
  onStart,
  onPause,
  onResume,
  onStop,
  minDelay,
  setMinDelay,
  maxDelay,
  setMaxDelay
}) {
  const isRunning = campaignStatus?.state === 'RUNNING';
  const isPaused = campaignStatus?.state === 'PAUSED';
  const isStopped = campaignStatus?.state === 'STOPPED';
  const isIdle = !campaignStatus || campaignStatus?.state === 'IDLE';

  const total = campaignStatus?.total || validRecipientsCount || 0;
  const sent = campaignStatus?.sent || 0;
  const failed = campaignStatus?.failed || 0;
  const remaining = Math.max(0, total - sent - failed);
  const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header & Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isRunning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)',
            border: `1px solid ${isRunning ? 'var(--emerald-border)' : 'rgba(249, 115, 22, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRunning ? '#34d399' : '#fb923c'
          }}>
            <Cpu size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              3. Anti-Spam Dispatch Engine
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Randomized human intervals to safeguard Gmail domain reputation
            </p>
          </div>
        </div>

        <span className={`pill ${isRunning ? 'pill-success' : isPaused ? 'pill-warning' : 'pill-neutral'}`} style={{ padding: '4px 10px' }}>
          <span className={`status-dot ${isRunning ? 'status-dot-active status-dot-pulsing' : ''}`} />
          {campaignStatus?.state || 'READY'}
        </span>
      </div>

      {/* Safety Cap Banner (if batch > 50) */}
      {validRecipientsCount > 50 && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid var(--amber-border)',
          color: '#fbbf24',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Anti-Spam Safeguard:</strong> You have {validRecipientsCount} contacts. For maximum domain safety, dispatching in batches of 30–50 emails per day is recommended.
          </span>
        </div>
      )}

      {/* 4 Telemetry Metric Cards */}
      <div className="bento-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Queue Total</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{total}</span>
        </div>

        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-border)' }}>
          <span style={{ fontSize: '11px', color: '#34d399', display: 'block' }}>Delivered</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#34d399', fontFamily: 'var(--font-mono)' }}>{sent}</span>
        </div>

        <div style={{ padding: '12px', background: 'rgba(249, 115, 22, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
          <span style={{ fontSize: '11px', color: '#fed7aa', display: 'block' }}>Remaining</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fed7aa', fontFamily: 'var(--font-mono)' }}>{remaining}</span>
        </div>

        <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>Pacing Jitter</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{minDelay}s - {maxDelay}s</span>
        </div>
      </div>

      {/* High-Tech Shimmering Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Batch Execution: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{sent}</strong> of <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{total}</strong> dispatched
          </span>
          <span style={{ fontWeight: '700', color: '#fb923c', fontFamily: 'var(--font-mono)' }}>{percentage}%</span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #f97316 0%, #f59e0b 50%, #10b981 100%)',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
      </div>

      {/* Active Pacing Radar Panel (Live Countdown) */}
      {countdown && countdown.secondsRemaining > 0 && isRunning && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 0 20px rgba(249, 115, 22, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 0 12px rgba(249, 115, 22, 0.6)',
              flexShrink: 0
            }}>
              {countdown.secondsRemaining}s
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                Anti-Spam Human Interval Active
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Next: <span style={{ fontFamily: 'var(--font-mono)', color: '#fb923c' }}>{countdown.nextRecipient}</span>
              </p>
            </div>
          </div>
          <span className="pill pill-brand" style={{ fontSize: '10px' }}>
            <Radio size={12} className="spin" /> Jitter Active
          </span>
        </div>
      )}

      {/* Delay Sliders */}
      <div className="delay-sliders-grid" style={{
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Minimum Delay:</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{minDelay}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            disabled={isRunning || isPaused}
            value={minDelay}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setMinDelay(val);
              if (val > maxDelay) setMaxDelay(val + 5);
            }}
            style={{ width: '100%', accentColor: 'var(--accent-brand)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Maximum Delay:</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{maxDelay}s</span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            disabled={isRunning || isPaused}
            value={maxDelay}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setMaxDelay(val);
              if (val < minDelay) setMinDelay(val - 5);
            }}
            style={{ width: '100%', accentColor: 'var(--accent-brand)' }}
          />
        </div>
      </div>

      {/* High-Impact Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isIdle || isStopped ? (
          <button
            className="btn btn-primary"
            style={{ flex: 1, height: '40px', fontSize: '14px' }}
            disabled={validRecipientsCount === 0}
            onClick={onStart}
          >
            <Play size={15} fill="#09090b" />
            <span>Launch Safe Campaign ({validRecipientsCount} Contacts)</span>
          </button>
        ) : isPaused ? (
          <button
            className="btn btn-primary"
            style={{ flex: 1, height: '40px', fontSize: '14px' }}
            onClick={onResume}
          >
            <Play size={15} fill="#09090b" />
            <span>Resume Dispatch Pipeline</span>
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            style={{ flex: 1, height: '40px', fontSize: '14px' }}
            onClick={onPause}
          >
            <Pause size={15} />
            <span>Pause Pipeline</span>
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            className="btn btn-danger"
            style={{ height: '40px', padding: '0 18px', fontSize: '13px' }}
            onClick={onStop}
            title="Immediately stop and clear pending queue"
          >
            <Square size={14} />
            <span>Abort</span>
          </button>
        )}
      </div>

      {/* Terminal Real-Time Audit Console */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={13} color="var(--accent-brand)" />
            <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Real-Time Telemetry Stream
            </h4>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Auto-scrolling
          </span>
        </div>

        <div style={{
          maxHeight: '160px',
          overflowY: 'auto',
          background: 'rgba(8, 9, 14, 0.95)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4) inset'
        }}>
          {events && events.length > 0 ? (
            events.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  color: ev.type === 'SUCCESS' ? '#34d399' : ev.type === 'ERROR' ? '#f87171' : 'var(--text-secondary)',
                  lineHeight: '1.4'
                }}
              >
                <span style={{ color: 'var(--text-subtle)' }}>[{ev.time}]</span>
                <span style={{ fontWeight: '700' }}>{ev.type === 'SUCCESS' ? '✓ DISPATCHED' : ev.type === 'ERROR' ? '✕ REJECTED' : 'ℹ INFO'}:</span>
                <span style={{ color: 'var(--text-primary)' }}>{ev.message}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-subtle)', padding: '16px', textAlign: 'center' }}>
              Pipeline initialized. Awaiting campaign execution...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
