import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import SmtpModal from './components/SmtpModal';
import HistoryModal from './components/HistoryModal';
import FileUploader from './components/FileUploader';
import ContactReviewTable from './components/ContactReviewTable';
import TemplateStudio from './components/TemplateStudio';
import ExecutionMonitor from './components/ExecutionMonitor';
import ToastNotification from './components/ToastNotification';
import { FileText, UploadCloud, Sparkles, CheckCircle2, Code2, BriefcaseBusiness, Camera } from 'lucide-react';

export default function App() {
  const [backendConnected, setBackendConnected] = useState(false);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [smtpEmail, setSmtpEmail] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [templates, setTemplates] = useState([]);
  
  const [subject, setSubject] = useState('Application for {{role}} Role - [Your Name]');
  const [body, setBody] = useState(
    'Dear {{name}},\n\n' +
    'I hope this message finds you well.\n\n' +
    'I am writing to express my strong interest in software engineering opportunities at {{company}}. ' +
    'With hands-on experience designing robust backend architectures, RESTful services with Java / Spring Boot, and scalable frontend interfaces, ' +
    'I would be thrilled to contribute to your engineering goals.\n\n' +
    'Please find my resume attached for your kind review. I would welcome the opportunity to connect and discuss how my technical background aligns with your current openings.\n\n' +
    'Thank you for your time and consideration.\n\n' +
    'Sincerely,\n' +
    '[Your Name]\n' +
    'Portfolio / GitHub: [Your Link] | Mobile: [Your Phone]'
  );

  const [minDelay, setMinDelay] = useState(15);
  const [maxDelay, setMaxDelay] = useState(30);

  const [campaignStatus, setCampaignStatus] = useState({ state: 'IDLE', sent: 0, failed: 0, total: 0 });
  const [countdown, setCountdown] = useState(null);
  const [events, setEvents] = useState([]);

  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [smtpModalInitialTab, setSmtpModalInitialTab] = useState('config');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [toast, setToast] = useState(null);

  const resumeInputRef = useRef(null);
  const eventSourceRef = useRef(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Poll backend health & fetch initial data
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/health');
        if (res.ok) {
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (e) {
        setBackendConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);

    // Load Resume Info
    fetch('http://localhost:8080/api/resume/info')
      .then(res => res.json())
      .then(data => setResumeInfo(data))
      .catch(err => console.error(err));

    // Load SMTP Settings
    fetch('http://localhost:8080/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.username) setSmtpEmail(data.username);
      })
      .catch(err => console.error(err));

    // Load Templates
    fetch('http://localhost:8080/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) {
          setSubject(data[0].subject);
          setBody(data[0].body);
        }
      })
      .catch(err => console.error(err));

    return () => clearInterval(interval);
  }, []);

  // SSE Stream Connection
  useEffect(() => {
    const sse = new EventSource('http://localhost:8080/api/campaign/stream');
    eventSourceRef.current = sse;

    const addEvent = (type, message) => {
      const time = new Date().toLocaleTimeString();
      setEvents(prev => [{ time, type, message }, ...prev.slice(0, 50)]);
    };

    sse.addEventListener('CAMPAIGN_STARTED', (e) => {
      const data = JSON.parse(e.data);
      setCampaignStatus(prev => ({ ...prev, state: 'RUNNING', total: data.total, sent: 0, failed: 0 }));
      addEvent('INFO', `Batch launched: ${data.total} contacts queued with ${data.minDelay}s-${data.maxDelay}s human delay.`);
      showToast(`Campaign started with ${data.total} recipients!`, 'info');
    });

    sse.addEventListener('EMAIL_SENT', (e) => {
      const data = JSON.parse(e.data);
      setCampaignStatus(prev => ({ ...prev, sent: data.sentCount, failed: data.failedCount }));
      addEvent('SUCCESS', `Delivered application to ${data.recipient} (${data.company || 'Organization'})`);
    });

    sse.addEventListener('EMAIL_FAILED', (e) => {
      const data = JSON.parse(e.data);
      setCampaignStatus(prev => ({ ...prev, sent: data.sentCount, failed: data.failedCount }));
      addEvent('ERROR', `Rejected delivery to ${data.recipient}: ${data.error}`);
    });

    sse.addEventListener('COUNTDOWN', (e) => {
      const data = JSON.parse(e.data);
      setCountdown(data);
    });

    sse.addEventListener('CAMPAIGN_PAUSED', () => {
      setCampaignStatus(prev => ({ ...prev, state: 'PAUSED' }));
      addEvent('INFO', 'Dispatch pipeline paused by operator.');
      showToast('Campaign paused.', 'info');
    });

    sse.addEventListener('CAMPAIGN_RESUMED', () => {
      setCampaignStatus(prev => ({ ...prev, state: 'RUNNING' }));
      addEvent('INFO', 'Dispatch pipeline resumed.');
      showToast('Campaign resumed.', 'info');
    });

    sse.addEventListener('CAMPAIGN_STOPPED', () => {
      setCampaignStatus(prev => ({ ...prev, state: 'STOPPED' }));
      setCountdown(null);
      addEvent('INFO', 'Dispatch pipeline aborted.');
      showToast('Campaign aborted.', 'error');
    });

    sse.addEventListener('CAMPAIGN_COMPLETED', (e) => {
      const data = JSON.parse(e.data);
      setCampaignStatus(prev => ({ ...prev, state: 'IDLE', sent: data.sent, failed: data.failed }));
      setCountdown(null);
      addEvent('SUCCESS', `Campaign completed: ${data.sent} delivered, ${data.failed} failed.`);
      showToast(`🎉 Campaign completed! Successfully dispatched ${data.sent} applications.`, 'success');

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    });

    return () => {
      sse.close();
    };
  }, []);

  const handleResumeUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setResumeInfo(data);
        showToast(`Master resume attached: ${data.fileName}`, 'success');
      } else {
        showToast(data.error || 'Failed to upload resume.', 'error');
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    }
  };

  const handleParseSuccess = (parseResult) => {
    setRecipients(parseResult.recipients || []);
    if (parseResult.recipients && parseResult.recipients.length > 0) {
      setSelectedRecipient(parseResult.recipients[0]);
    }
    showToast(`Successfully ingested ${parseResult.validCount} valid contacts!`, 'success');
  };

  // Instant 1-Click Demo Loader
  const handleLoadDemoData = () => {
    const demoContacts = [
      {
        id: 1,
        rawName: 'Alex Rivera',
        resolvedName: 'Alex Rivera',
        rawCompany: 'Google',
        resolvedCompany: 'Google',
        email: 'alex.rivera.tech@gmail.com',
        jobRole: 'Senior Java Developer',
        valid: true,
        warnings: []
      },
      {
        id: 2,
        rawName: '',
        resolvedName: 'Hiring Team',
        rawCompany: 'Microsoft',
        resolvedCompany: 'Microsoft',
        email: 'hiring.msft@outlook.com',
        jobRole: 'Full Stack Engineer',
        valid: true,
        warnings: ['Missing recruiter name; default fallback applied']
      },
      {
        id: 3,
        rawName: 'Sarah Jenkins',
        resolvedName: 'Sarah Jenkins',
        rawCompany: '',
        resolvedCompany: 'Techstartup',
        email: 'sarah.jenkins@techstartup.io',
        jobRole: 'Backend Engineer',
        valid: true,
        warnings: ['Company inferred from email domain (Techstartup)']
      },
      {
        id: 4,
        rawName: 'Emily Watson',
        resolvedName: 'Emily Watson',
        rawCompany: 'Stripe',
        resolvedCompany: 'Stripe',
        email: 'emily.watson.careers@gmail.com',
        jobRole: 'Software Engineer',
        valid: true,
        warnings: []
      },
      {
        id: 5,
        rawName: 'David Vance',
        resolvedName: 'David Vance',
        rawCompany: 'Amazon',
        resolvedCompany: 'Amazon',
        email: 'invalid-email-address',
        jobRole: 'Cloud Engineer',
        valid: false,
        warnings: ['Invalid RFC 5322 email address format']
      }
    ];

    setRecipients(demoContacts);
    setSelectedRecipient(demoContacts[0]);
    showToast('Loaded demo recruiter contacts with smart fallbacks!', 'success');
  };

  const handleStartCampaign = async () => {
    const validOnes = recipients.filter(r => r.valid);
    if (validOnes.length === 0) {
      showToast('No valid recipients available to dispatch.', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/campaign/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: validOnes,
          subjectTemplate: subject,
          bodyTemplate: body,
          minDelay,
          maxDelay
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to start campaign.', 'error');
        if (data.error && data.error.includes('SMTP')) {
          setIsSmtpModalOpen(true);
        }
      }
    } catch (err) {
      showToast('Server error: ' + err.message, 'error');
    }
  };

  const handlePauseCampaign = async () => {
    await fetch('http://localhost:8080/api/campaign/pause', { method: 'POST' });
  };

  const handleResumeCampaign = async () => {
    await fetch('http://localhost:8080/api/campaign/resume', { method: 'POST' });
  };

  const handleStopCampaign = async () => {
    await fetch('http://localhost:8080/api/campaign/stop', { method: 'POST' });
  };

  const validRecipientsCount = recipients.filter(r => r.valid).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden Master Resume Input */}
      <input
        type="file"
        ref={resumeInputRef}
        style={{ display: 'none' }}
        accept=".pdf, .docx"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleResumeUpload(e.target.files[0]);
          }
        }}
      />

      {/* Floating Responsive Navigation Bar */}
      <Navbar
        backendConnected={backendConnected}
        resumeInfo={resumeInfo}
        smtpEmail={smtpEmail}
        onOpenSmtp={() => { setSmtpModalInitialTab('config'); setIsSmtpModalOpen(true); }}
        onOpenHelp={() => { setSmtpModalInitialTab('guide'); setIsSmtpModalOpen(true); }}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onUploadResumeTrigger={() => resumeInputRef.current?.click()}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* Main Studio Workspace */}
      <main className="main-container" style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Master Resume Upload Notice */}
        {(!resumeInfo || !resumeInfo.exists) && (
          <div className="glass-panel" style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
            background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.2)',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fb923c',
                flexShrink: 0
              }}>
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                  Master Resume Required
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Attach your PDF/DOCX resume once. Doot attaches it to every outbound email.
                </p>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => resumeInputRef.current?.click()}
              style={{ height: '34px', fontSize: '12px' }}
            >
              <UploadCloud size={14} />
              <span>Attach Resume</span>
            </button>
          </div>
        )}

        {/* Responsive Workspace Grid */}
        <div className="workspace-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Column 1: Contact Ingestion & Pitch Studio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FileUploader
              onParseSuccess={handleParseSuccess}
              isUploading={isUploadingFile}
              setIsUploading={setIsUploadingFile}
              onLoadDemoData={handleLoadDemoData}
            />

            <TemplateStudio
              subject={subject}
              setSubject={setSubject}
              body={body}
              setBody={setBody}
              selectedRecipient={selectedRecipient}
              templates={templates}
              onSelectTemplate={(tmpl) => {
                setSubject(tmpl.subject);
                setBody(tmpl.body);
              }}
              resumeInfo={resumeInfo}
            />
          </div>

          {/* Column 2: Execution Telemetry & Recruiters Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ExecutionMonitor
              campaignStatus={campaignStatus}
              countdown={countdown}
              events={events}
              validRecipientsCount={validRecipientsCount}
              onStart={handleStartCampaign}
              onPause={handlePauseCampaign}
              onResume={handleResumeCampaign}
              onStop={handleStopCampaign}
              minDelay={minDelay}
              setMinDelay={setMinDelay}
              maxDelay={maxDelay}
              setMaxDelay={setMaxDelay}
            />

            <ContactReviewTable
              recipients={recipients}
              onUpdateRecipients={setRecipients}
              selectedRecipient={selectedRecipient}
              onSelectRecipient={setSelectedRecipient}
              onToast={(msg) => showToast(msg, 'info')}
            />
          </div>
        </div>
      </main>

      {/* Responsive Modals */}
      <SmtpModal
        isOpen={isSmtpModalOpen}
        initialTab={smtpModalInitialTab}
        onClose={() => setIsSmtpModalOpen(false)}
        onSave={(cfg) => {
          if (cfg && cfg.username) setSmtpEmail(cfg.username);
          showToast('SMTP credentials saved successfully!', 'success');
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Floating Glass Toast */}
      <ToastNotification
        toast={toast}
        onDismiss={() => setToast(null)}
      />

      <footer className="app-footer">
        <div className="app-footer-cta">
          <strong>Need custom software or coding support?</strong>
          <span>Let’s work together.</span>
          <a className="app-footer-email" href="mailto:vishalghuge154@gmail.com">
            vishalghuge154@gmail.com
          </a>
        </div>

        <div className="app-footer-bottom">
          <span>© 2026 Doot · Built by Vishal Ghuge</span>
          <nav className="app-footer-links" aria-label="Developer social links">
            <a href="https://github.com/ghuge637" target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <Code2 size={15} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/ghuge-vishal/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <BriefcaseBusiness size={15} />
              <span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/code_postmortem" target="_blank" rel="noreferrer" aria-label="Instagram profile">
              <Camera size={15} />
              <span>Instagram</span>
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
