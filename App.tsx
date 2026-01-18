
import React, { useState } from 'react';
import { AppState, EvaluationResult, Interaction } from './types';
import { analyzeMentorVideo } from './services/geminiService';
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(EvaluationResult & { sources?: any[] }) | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !videoUrl) {
      setError("Please provide a video file or URL to begin evaluation.");
      return;
    }

    setState(AppState.ANALYZING);
    setError(null);

    try {
      const input = selectedFile || videoUrl;
      const evaluation = await analyzeMentorVideo(input);
      setResult(evaluation);
      setState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      setState(AppState.ERROR);
    }
  };

  const reset = () => {
    setState(AppState.IDLE);
    setResult(null);
    setSelectedFile(null);
    setVideoUrl('');
    setError(null);
  };

  // Append percentages to the labels so they sit outside the diagram clearly
  const radarData = result ? [
    { subject: `Clarity (${result.metrics.clarity}%)`, A: result.metrics.clarity },
    { subject: `Empathy (${result.metrics.empathy}%)`, A: result.metrics.empathy },
    { subject: `Accuracy (${result.metrics.accuracy}%)`, A: result.metrics.accuracy },
    { subject: `Pacing (${result.metrics.pacing}%)`, A: result.metrics.pacing },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                MentorEvaluator Pro
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">AI Pedagogical Analysis</span>
            </div>
          </div>
          {state !== AppState.IDLE && (
            <button 
              onClick={reset}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              New Evaluation
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        {state === AppState.IDLE && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-4">AI-Driven Insights</span>
              <h2 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Evaluate Every Interaction <br/><span className="text-indigo-600">Improve Every Mentor.</span>
              </h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                Upload a recording or provide a URL to extract conversational loops and score pedagogical effectiveness.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-200 p-10 overflow-hidden relative">
              <div className="space-y-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Upload Session Recording</label>
                  <div 
                    className={`group border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-inner ${selectedFile ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input id="file-upload" type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${selectedFile ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-lg text-slate-800">
                        {selectedFile ? selectedFile.name : 'Select or Drop Video File'}
                      </span>
                      <span className="text-sm text-slate-500">Local MP4, MOV, or WebM files</span>
                    </div>
                  </div>
                </div>

                

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold flex gap-3 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  onClick={handleStartAnalysis}
                  disabled={!selectedFile && !videoUrl}
                  className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-[0.98]"
                >
                  Analyze Mentor Skills
                </button>
              </div>
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">
              {videoUrl ? "Searching & Evaluating URL" : "AI is Watching & Evaluating"}
            </h2>
            <div className="max-w-md w-full text-center space-y-2">
              <p className="text-slate-500 font-medium">
                {videoUrl ? "Accessing video context via Search Grounding..." : "Processing video frames locally..."}
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-1/2 animate-[progress_2s_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">Session Insights</h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Analysis Complete</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">{result.interactions.length} Interactions Found</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-right">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pedagogical Score</span>
                      <span className="text-3xl font-black text-slate-900">{result.overallScore}<span className="text-slate-300 text-xl">/100</span></span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none mb-10">
                  <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-indigo-200 pl-6 py-2">
                    "{result.summary}"
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Clarity', val: result.metrics.clarity, color: 'indigo' },
                    { label: 'Empathy', val: result.metrics.empathy, color: 'purple' },
                    { label: 'Accuracy', val: result.metrics.accuracy, color: 'blue' },
                    { label: 'Pacing', val: result.metrics.pacing, color: 'teal' }
                  ].map((m) => (
                    <div key={m.label} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500">{m.label}</span>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-black text-slate-900 leading-none">{m.val}</span>
                        <span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                      <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-${m.color}-600`} style={{ width: `${m.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col h-full overflow-hidden">
                <h3 className="text-xl font-black text-slate-900">Skill Competency</h3>
                <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">Pedagogical Proficiency Index</p>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#4f46e5', fontSize: 10, fontWeight: 700 }} 
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#cbd5e1', fontSize: 8, fontWeight: 'bold' }}
                        axisLine={false}
                        tickCount={6}
                      />
                      <Radar 
                        name="Mentor" 
                        dataKey="A" 
                        stroke="#4f46e5" 
                        strokeWidth={2} 
                        fill="#4f46e5" 
                        fillOpacity={0.1}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-3xl font-black text-slate-900">Conversation Timeline</h3>
              <div className="grid grid-cols-1 gap-6">
                {result.interactions.map((interaction, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col xl:flex-row transition-all hover:shadow-lg">
                    <div className="w-full xl:w-[280px] bg-slate-50 p-6 border-b xl:border-b-0 xl:border-r border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-500">{interaction.timestamp}</span>
                        <span className="text-xl font-black text-indigo-600">{interaction.effectivenessScore}%</span>
                      </div>
                      <div className="space-y-2">
                        {interaction.strengths.slice(0, 2).map((s, i) => (
                          <span key={i} className="block text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-8 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Learner Question</h4>
                        <p className="text-slate-900 font-bold">{interaction.learnerQuestion}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mentor Response</h4>
                        <p className="text-slate-600 italic">"{interaction.mentorAnswer}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-8">
                <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">Grounding Sources (Google Search)</h4>
                <div className="flex flex-wrap gap-4">
                  {result.sources.map((chunk: any, i: number) => (
                    chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {chunk.web.title || "External Content"}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center pt-6">
              <button onClick={reset} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
                Analyze Another Session
              </button>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Something went wrong</h2>
            <p className="text-slate-500 mb-10 font-medium">{error}</p>
            <button onClick={reset} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-600 transition-all">
              Back to Start
            </button>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default App;
