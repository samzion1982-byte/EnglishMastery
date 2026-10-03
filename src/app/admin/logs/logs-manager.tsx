'use client';
import { useState } from 'react';
import { LoginLogTable } from './login-log';
import { SpeechLog } from './speech-log';

export function LogsManager() {
  const [tab, setTab] = useState('sessions');
  return <div className="admin-workspace">
    <header className="workspace-heading"><p>WORKSPACE / LOGS</p><h1>Logs</h1><span>Review user sessions and speech recognition activity.</span></header>
    <div className="login-log-controls" role="group" aria-label="Log type">
      <button type="button" aria-pressed={tab === 'sessions'} onClick={() => setTab('sessions')}>User logins</button>
      <button type="button" aria-pressed={tab === 'speech'} onClick={() => setTab('speech')}>Speech recognition</button>
    </div>
    {tab === 'sessions' ? <LoginLogTable /> : <SpeechLog />}
  </div>;
}
