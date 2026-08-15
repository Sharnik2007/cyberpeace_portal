import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 🌟 Active View State Routing
  const [activeTab, setActiveTab] = useState('dashboard');

  const [history, setHistory] = useState([
    { name: 'cyber-reward@ybl', type: 'UPI Address', score: 43, status: 'Suspicious' },
    { name: 'electricity-bill@ybl', type: 'UPI Address', score: 12, status: 'Low Risk' },
    { name: 'claim-bonus-S000', type: 'SMS Context', score: 78, status: 'High Risk' }
  ]);

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: inputText }),
      });
      
      const data = await response.json();
      setResult(data);

      if (data && !data.msg) {
        const newRecord = {
          name: data.extracted_element || 'Telemetry Block',
          type: data.type || 'N/A',
          score: data.final_risk_score ?? 0,
          status: data.status || 'Unknown'
        };
        setHistory(prev => [newRecord, ...prev]);
      }
    } catch (error) {
      console.error("API Gateway error:", error);
      alert("Failed to reach Python backend server. Check if Uvicorn is active on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'High Risk': return 'bg-red-50 text-red-700 border border-red-200/60';
      case 'Suspicious': return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'Low Risk':
      case 'Safe': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans flex flex-col antialiased">
      
      {/* Global Top Navigation Bar */}
      <header className="bg-bg-card border-b border-border-clean px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-blue text-white p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">CyberPeace Core</h1>
            <p className="text-xs text-text-muted font-medium">Threat Intelligence Routing Matrix &bull; <span className="font-mono text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded">v2.0.0</span></p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-border-clean">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-brand-blue text-xs shadow-inner">
            S
          </div>
          <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase hidden sm:block">SHARNIK</span>
        </div>
      </header>

      <div className="flex flex-1">
        
        {/* Modern Enterprise Left Sidebar Navigation Menu */}
        <nav className="w-64 bg-bg-card border-r border-border-clean p-4 hidden lg:flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase px-4 mb-2 block">Control Center</span>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all duration-200 group w-full text-left ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 text-brand-blue border border-blue-100/80 shadow-sm' 
                : 'text-text-muted hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <svg className={`w-4 h-4 transition-colors ${activeTab === 'dashboard' ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            <span>Analytics Suite</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all duration-200 group w-full text-left ${
              activeTab === 'history' 
                ? 'bg-blue-50 text-brand-blue border border-blue-100/80 shadow-sm' 
                : 'text-text-muted hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <svg className={`w-4 h-4 transition-colors ${activeTab === 'history' ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History Ledger</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('mlModel')}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all duration-200 group w-full text-left ${
              activeTab === 'mlModel' 
                ? 'bg-blue-50 text-brand-blue border border-blue-100/80 shadow-sm' 
                : 'text-text-muted hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <svg className={`w-4 h-4 transition-colors ${activeTab === 'mlModel' ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473L21 21l-1.096-5.096L21 11l-5.096 1.096L11 9l1.096 5.096L7 13l2.813 2.904z" />
            </svg>
            <span>Model Spec</span>
          </button>
        </nav>

        {/* Workspace Route Switcher Viewport */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-6">
          
          {/* VIEW 1: ANALYTICS SUITE */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Input Telemetry Terminal Block */}
                <div className="xl:col-span-1 bg-bg-card border border-border-clean rounded-2xl p-6 shadow-sm flex flex-col h-[360px] justify-between">
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">Threat Parsing Target</h3>
                    <p className="text-xs text-text-muted leading-normal">Input raw system strings, transactional hooks, or contextual SMS blocks for evaluation.</p>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste target trace logs or transaction metadata here..."
                      className="w-full h-44 bg-slate-50 border border-border-clean rounded-xl p-4 text-xs font-mono text-text-main placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-brand-blue resize-none transition-all duration-150 leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <button
                      onClick={handleScan}
                      disabled={loading || !inputText.trim()}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-sm ${
                        loading || !inputText.trim() 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-brand-blue hover:bg-blue-600 text-white hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.99]'
                      }`}
                    >
                      {loading ? 'Analyzing Pipeline...' : 'Run Processing Core'}
                    </button>
                    <button onClick={() => { setInputText(''); setResult(null); }} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-text-muted border border-border-clean font-bold text-xs rounded-xl tracking-wider uppercase transition-colors">Clear</button>
                  </div>
                </div>

                {/* API Output Visualization Terminal Block */}
                <div className="xl:col-span-2 bg-bg-card border border-border-clean rounded-2xl p-6 shadow-sm flex flex-col h-[360px] justify-between">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between border-b border-border-clean pb-3 mb-4">
                      <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">Live Pipeline Execution Node</h3>
                      {result && <span className="text-[9px] font-mono font-bold tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">DATA RECEIVED</span>}
                    </div>

                    {!result ? (
                      <div className="flex-1 border border-dashed border-border-clean rounded-xl flex flex-col items-center justify-center bg-slate-50/40 text-center p-6 space-y-2">
                        <svg className="w-8 h-8 text-slate-300 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 018.716 2.253M12 3a9.015 9.015 0 00-8.716 2.253m0 0A9.015 9.015 0 0112 12c2.485 0 4.5 4.03 4.5 9m-9-9a9.015 9.015 0 018.716-2.253m0 0A9.015 9.015 0 0012 12" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-400">System Standing By</span>
                        <p className="text-[11px] text-text-muted max-w-xs leading-normal">Submit analytical payloads via the left input portal to run structural heuristics and probability models.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-0">
                        <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto border border-slate-950 leading-relaxed shadow-inner">
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                        <div className="flex flex-col justify-between space-y-3">
                          <div className="bg-slate-50 border border-border-clean rounded-xl p-3.5 flex justify-between items-center shadow-inner">
                            <div>
                              <p className="text-[9px] uppercase font-bold tracking-wide text-text-muted">Extracted Parameter</p>
                              <p className="text-xs font-mono font-bold text-slate-800 truncate max-w-[160px]">{result.extracted_element}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-brand-blue rounded-md border border-blue-100">{result.type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 flex-1">
                            <div className="bg-slate-50 border border-border-clean rounded-xl p-3 flex flex-col justify-center">
                              <p className="text-[9px] uppercase font-bold tracking-wide text-text-muted mb-1">NLP Content Weight</p>
                              <p className="text-xl font-mono font-black text-brand-purple">{result.ml_probability_weight?.toFixed(2)}%</p>
                            </div>
                            <div className="bg-slate-50 border border-border-clean rounded-xl p-3 flex flex-col justify-center">
                              <p className="text-[9px] uppercase font-bold tracking-wide text-text-muted mb-1">Structural Risk Factor</p>
                              <p className="text-xl font-mono font-black text-brand-orange">{result.technical_severity_weight}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {result && (
                    <div className="mt-4 pt-4 border-t border-border-clean flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wide text-text-muted block">Composite Risk Index</span>
                          <span className="text-2xl font-black font-mono text-slate-900">{result.final_risk_score} <span className="text-text-muted text-xs font-normal">/ 100</span></span>
                        </div>
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-border-clean hidden sm:block">
                          <div className={`h-full transition-all duration-500 ${result.final_risk_score >= 70 ? 'bg-red-500' : result.final_risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${result.final_risk_score}%` }} />
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-center font-bold tracking-wider text-xs uppercase shadow-inner ${getStatusStyles(result.status)}`}>
                        Pipeline Status: {result.status}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* mini real-time operational window log updates */}
              <div className="bg-bg-card border border-border-clean rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Operation Log Snapshots</h3>
                  <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                </div>
                <div className="overflow-x-auto border border-border-clean rounded-xl bg-slate-50/50">
                  <table className="w-full text-left text-xs text-text-main">
                    <thead className="bg-slate-100 text-text-muted uppercase font-mono text-[10px] border-b border-border-clean">
                      <tr>
                        <th className="py-2.5 px-4">Telemetry Stream</th>
                        <th className="py-2.5 px-4">Scoring Index</th>
                        <th className="py-2.5 px-4 text-right">System Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-clean font-mono text-[11px]">
                      {history.slice(0, 3).map((item, idx) => (
                        <tr key={idx} className="hover:bg-bg-card transition-colors">
                          <td className="py-2.5 px-4 font-medium text-slate-700">{item.name}</td>
                          <td className="py-2.5 px-4 font-bold">{item.score}/100</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${getStatusStyles(item.status)}`}>{item.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VIEW 2: FULL HISTORY LEDGER */}
          {activeTab === 'history' && (
            <div className="bg-bg-card border border-border-clean rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">System Operational Audit Registry</h2>
                <p className="text-xs text-text-muted leading-relaxed">Complete immutable lookup block tracking all multi-vector scoring core calls during session lifecycle operations.</p>
              </div>
              <div className="overflow-x-auto border border-border-clean rounded-xl bg-slate-50/50">
                <table className="w-full text-left text-xs text-text-main">
                  <thead className="bg-slate-100 text-text-muted uppercase font-mono text-[10px] border-b border-border-clean">
                    <tr>
                      <th className="py-3 px-4">Telemetry Vector Target</th>
                      <th className="py-3 px-4">Classification Class</th>
                      <th className="py-3 px-4">Computed Scoring Scale</th>
                      <th className="py-3 px-4 text-right">Pipeline Action Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-clean font-mono text-[11px] bg-bg-card">
                    {history.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-700 font-medium">{item.name}</td>
                        <td className="py-3 px-4"><span className="text-brand-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{item.type}</span></td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.score} <span className="text-text-muted font-normal text-[10px]">/100</span></td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${getStatusStyles(item.status)}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: MODEL SPECIFICATION MATRIX */}
          {activeTab === 'mlModel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-bg-card border border-border-clean rounded-2xl p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase flex items-center space-x-2">
                  <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.008v.008H12V18zm0-4.5h.008v.008H12V13.5l-2.25-.75M12 7.5h.008v.008H12V7.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>NLP Model Engine Architecture</span>
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  The semantic processing model evaluates context strings through vectorization layers to look for keyword patterns that point to social engineering attempts.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-border-clean space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-text-muted">Pipeline Type:</span> <span className="text-brand-purple font-bold">TF-IDF Vectorizer Matrix Extraction</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Target Strategy:</span> <span className="text-brand-purple font-bold">Asynchronous Ingestion Mode</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Softmax Cutoff Scale:</span> <span className="text-brand-purple font-bold">0.50 Baseline Ratio</span></div>
                </div>
              </div>
              
              <div className="bg-bg-card border border-border-clean rounded-2xl p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase flex items-center space-x-2">
                  <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                  <span>Composite Matrix Core Calculations</span>
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Risk scoring indices are compiled by running balancing weight algorithms across distinct vectors to reduce false positive counts.
                </p>
                <div className="space-y-4 font-mono text-[11px] bg-slate-50 p-4 rounded-xl border border-border-clean">
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-slate-600">Machine Learning Context Weights</span> <span className="text-slate-800 font-bold">40% Ratio</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-brand-purple h-full w-[40%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-slate-600">Static System Heuristics Severity</span> <span className="text-slate-800 font-bold">60% Ratio</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-brand-orange h-full w-[60%]"></div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;