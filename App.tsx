import React, { useState, useRef } from 'react';
import { BattleResult } from './types';
import { predictBattleOutcome, getRandomMatchup } from './services/geminiService';

const App: React.FC = () => {
  const [animal1, setAnimal1] = useState('');
  const [animal2, setAnimal2] = useState('');
  const [loading, setLoading] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const diceAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal1.trim() || !animal2.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const outcome = await predictBattleOutcome(animal1, animal2);
      setResult(outcome);
    } catch (err) {
      console.error(err);
      setError("SIMULATION ERROR: Neural link severed. Reconnect and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = async () => {
    if (diceAudioRef.current) {
      diceAudioRef.current.currentTime = 0;
      diceAudioRef.current.play().catch(() => {});
    }
    setRandomizing(true);
    setError(null);
    try {
      const matchup = await getRandomMatchup();
      setAnimal1(matchup.animal1);
      setAnimal2(matchup.animal2);
    } catch (err) {
      console.error(err);
      setError("RANDOMIZER FAILED: Unit archives unavailable.");
    } finally {
      setRandomizing(false);
    }
  };

  const getFallbackImage = (name: string) => `https://picsum.photos/seed/${encodeURIComponent(name)}/1200/800`;

  const MetricRow = ({ label, val1, val2, icon }: { label: string, val1: number, val2: number, icon: string }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <span className={`text-2xl font-orbitron font-black leading-none ${val1 >= val2 ? 'text-purple-400 neon-text-purple' : 'text-slate-700'}`}>
          {val1}
        </span>
        <div className="flex flex-col items-center">
          <i className={`${icon} text-slate-500 text-[12px] mb-2 opacity-40`}></i>
          <span className="text-[10px] font-orbitron font-bold tracking-[0.3em] uppercase text-slate-400">
            {label}
          </span>
        </div>
        <span className={`text-2xl font-orbitron font-black leading-none ${val2 >= val1 ? 'text-purple-400 neon-text-purple' : 'text-slate-700'}`}>
          {val2}
        </span>
      </div>
      <div className="flex items-center gap-6 h-3">
        <div className="flex-1 h-full bg-slate-900/50 rounded-full overflow-hidden flex justify-end border border-white/5 relative">
          <div 
            className={`h-full bar-fill animate-shine relative ${val1 >= val2 ? 'bg-gradient-to-l from-purple-500 to-indigo-900 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-800'}`} 
            style={{ width: `${val1}%` }} 
          />
        </div>
        <div className="w-[1px] h-4 bg-slate-800 shrink-0"></div>
        <div className="flex-1 h-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5 relative">
          <div 
            className={`h-full bar-fill animate-shine relative ${val2 >= val1 ? 'bg-gradient-to-r from-purple-500 to-indigo-900 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-slate-800'}`} 
            style={{ width: `${val2}%` }} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030408] text-slate-200 selection:bg-purple-500/30">
      <audio ref={diceAudioRef} src="https://www.soundjay.com/misc/sounds/dice-throw-1.mp3" preload="auto" />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[180px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]"></div>
      </div>

      {/* RAINBOW FIXED RANDOM BUTTON */}
      <div className="fixed bottom-12 right-12 z-[100] group">
        <div className="pulse-ring-rainbow"></div>
        <button
          onClick={handleRandomize}
          disabled={loading || randomizing}
          className="rainbow-sparkle-btn h-32 w-32 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl relative transition-transform duration-300 hover:scale-110 active:scale-90"
        >
          <i className={`fas fa-dice-d20 text-5xl mb-2 text-white ${randomizing ? 'animate-spin' : ''}`}></i>
          <span className="font-orbitron font-black text-[13px] tracking-[0.2em] sparkle-font">RANDOM</span>
        </button>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <header className="text-center mb-20">
          <h1 className="text-7xl md:text-[10rem] font-orbitron font-black tracking-tighter bg-gradient-to-b from-white via-slate-300 to-slate-700 bg-clip-text text-transparent mb-4 leading-none select-none">
            ANIMAL FACE OFF
          </h1>
          <div className="flex items-center justify-center gap-6">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-purple-500"></div>
            <p className="text-purple-500/80 text-sm md:text-xl tracking-[1em] uppercase font-orbitron font-bold">
              Interspecies Nexus
            </p>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-purple-500"></div>
          </div>
        </header>

        <section className="glass-panel rounded-[3.5rem] p-10 md:p-14 shadow-2xl mb-20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          
          <form onSubmit={handleBattle} className="flex flex-col lg:flex-row items-end gap-8">
            <div className="flex-1 w-full space-y-4">
              <label className="text-[11px] font-orbitron font-black uppercase tracking-[0.5em] text-purple-400 ml-2 block">Alpha Specification</label>
              <input
                type="text"
                value={animal1}
                onChange={(e) => setAnimal1(e.target.value)}
                placeholder="INPUT UNIT ALPHA"
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-2xl py-6 px-8 text-2xl outline-none font-orbitron text-white transition-all focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-800"
                disabled={loading || randomizing}
                required
              />
            </div>

            <div className="hidden lg:flex items-center pb-8 px-2 opacity-20">
              <span className="text-4xl font-orbitron font-black text-slate-700 italic">VS</span>
            </div>

            <div className="flex-1 w-full space-y-4">
              <label className="text-[11px] font-orbitron font-black uppercase tracking-[0.5em] text-slate-400 ml-2 block">Beta Specification</label>
              <input
                type="text"
                value={animal2}
                onChange={(e) => setAnimal2(e.target.value)}
                placeholder="INPUT UNIT BETA"
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-purple-400/50 rounded-2xl py-6 px-8 text-2xl outline-none font-orbitron text-white transition-all focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-800"
                disabled={loading || randomizing}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || randomizing || !animal1 || !animal2}
              className={`glow-btn w-full lg:w-64 h-[84px] rounded-2xl font-orbitron font-black uppercase tracking-[0.3em] text-xl flex items-center justify-center gap-4 ${
                loading 
                ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-wait' 
                : 'bg-purple-600 text-white hover:bg-purple-500 border-purple-400/30'
              }`}
            >
              {loading ? <i className="fas fa-atom fa-spin text-2xl"></i> : <i className="fas fa-bolt text-2xl"></i>}
              {loading ? 'SYNCING' : 'INITIATE'}
            </button>
          </form>
          
          <div className="mt-10 flex justify-center">
             <div className="px-8 py-3 bg-slate-950/40 rounded-full border border-slate-800/50 flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse [animation-delay:200ms]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse [animation-delay:400ms]"></div>
                </div>
                <span className="text-[10px] font-orbitron font-bold text-slate-500 tracking-[0.4em] uppercase">Biological Grounding Engine Online</span>
             </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-10 rounded-[2.5rem] text-center mb-12 animate-in zoom-in duration-300 font-orbitron tracking-widest uppercase text-sm">
            <i className="fas fa-exclamation-triangle mr-4 text-xl"></i> {error}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            {/* Primary Analysis - Left Column */}
            <div className="lg:col-span-7 space-y-12">
              <div className="glass-panel border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-12 left-12 z-20">
                  <div className="inline-flex items-center gap-4 bg-purple-600 text-white text-[12px] font-orbitron font-black uppercase tracking-[0.3em] px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(147,51,234,0.5)] border border-white/20">
                    <i className="fas fa-star animate-spin-slow"></i>
                    Dominant Specimen
                  </div>
                </div>
                
                <div className="h-[600px] md:h-[750px] relative overflow-hidden group">
                  <img 
                    src={result.winnerGifUrl || getFallbackImage(result.winner)} 
                    alt={result.winner} 
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== getFallbackImage(result.winner)) target.src = getFallbackImage(result.winner);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030408] via-[#030408]/20 to-transparent"></div>
                  
                  <div className="absolute bottom-16 left-16 right-16">
                    <h2 className="text-7xl md:text-9xl font-orbitron font-black uppercase text-white tracking-tighter leading-none mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
                      {result.winner}
                    </h2>
                    <div className="flex items-center gap-8">
                      <div className="h-2 w-32 bg-purple-600 rounded-full shadow-[0_0_20px_#9333ea]"></div>
                      <span className="text-purple-400 font-orbitron font-black text-5xl neon-text-purple">
                        {result.probability}% <span className="text-lg tracking-widest uppercase opacity-60">Success</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-16 pt-8">
                  <div className="flex items-center gap-6 mb-10">
                    <h3 className="text-[12px] font-orbitron font-black text-slate-500 uppercase tracking-[0.6em] whitespace-nowrap">Tactical Advantage</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                  </div>
                  <div className="text-2xl md:text-3xl text-slate-200 leading-relaxed font-light italic border-l-[6px] border-purple-600/60 pl-14 py-4 line-clamp-5">
                    {result.reasoning}
                  </div>
                </div>
              </div>

              {/* Research Citations */}
              <div className="glass-panel border border-slate-800/60 rounded-[3rem] p-12 shadow-xl animate-in fade-in duration-1000">
                <div className="flex items-center justify-between mb-10 border-b border-slate-800/80 pb-6">
                  <h4 className="text-[12px] font-orbitron font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6">
                    <i className="fas fa-network-wired text-purple-600 text-lg"></i> Intellectual Grounding Nodes
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-[10px] font-orbitron font-bold text-purple-500 uppercase tracking-widest">Neural Verify Active</span>
                  </div>
                </div>
                
                {result.groundingLinks && result.groundingLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group glow-btn flex items-center gap-5 bg-slate-950/50 p-6 rounded-3xl transition-all"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center group-hover:bg-purple-600/10 transition-colors border border-slate-800">
                          <i className="fas fa-external-link-alt text-sm text-slate-600 group-hover:text-purple-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white mb-1">
                            {link.title || 'Biological Intelligence Node'}
                          </p>
                          <p className="text-[10px] font-orbitron text-slate-600 tracking-wider truncate">
                            {new URL(link.uri).hostname.toUpperCase()}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-950/30 rounded-[2rem] border-2 border-dashed border-slate-900">
                    <p className="text-slate-700 text-[11px] font-orbitron font-black uppercase tracking-[0.5em] italic">
                      Biological Library Exhausted &bull; Fallback Enabled
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Dashboard - Right Column */}
            <div className="lg:col-span-5 h-full">
              <div className="glass-panel border border-white/5 rounded-[4rem] p-16 shadow-2xl h-full flex flex-col relative sticky top-12">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-600/10 blur-3xl rounded-full"></div>
                
                <h3 className="text-4xl font-orbitron font-black mb-16 flex items-center gap-6 text-white leading-none">
                  <div className="h-12 w-2 bg-purple-600 rounded-full shadow-[0_0_20px_#9333ea]"></div>
                  Combat Metrics
                </h3>

                <div className="grid grid-cols-2 gap-10 mb-20 relative">
                  <div className={`text-center space-y-5 transition-all duration-700 ${result.winner === animal1 ? 'opacity-100 scale-105' : 'opacity-20 grayscale'}`}>
                    <div className="h-28 w-28 mx-auto rounded-[2rem] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mb-6 overflow-hidden relative ring-4 ring-purple-500/10">
                      <img src={getFallbackImage(animal1)} className="w-full h-full object-cover opacity-60" alt="" />
                      <span className="absolute text-3xl font-orbitron font-black text-white/90 drop-shadow-lg">A</span>
                    </div>
                    <h4 className="font-orbitron font-black text-slate-100 uppercase tracking-widest text-xl truncate px-2">{animal1}</h4>
                    {result.winner === animal1 && (
                      <div className="inline-block px-4 py-2 bg-purple-600/20 text-purple-400 text-[10px] font-orbitron font-black tracking-[0.3em] rounded-full border border-purple-500/40">
                        DOMINANT
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute left-1/2 top-10 -translate-x-1/2 h-40 w-[1px] bg-gradient-to-b from-slate-800 to-transparent"></div>
                  <div className="absolute left-1/2 top-14 -translate-x-1/2 bg-[#0a0b14] p-3 rounded-full border border-slate-800 z-20">
                    <span className="text-sm font-orbitron font-black italic text-slate-700">VS</span>
                  </div>

                  <div className={`text-center space-y-5 transition-all duration-700 ${result.winner === animal2 ? 'opacity-100 scale-105' : 'opacity-20 grayscale'}`}>
                    <div className="h-28 w-28 mx-auto rounded-[2rem] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mb-6 overflow-hidden relative ring-4 ring-purple-500/10">
                      <img src={getFallbackImage(animal2)} className="w-full h-full object-cover opacity-60" alt="" />
                      <span className="absolute text-3xl font-orbitron font-black text-white/90 drop-shadow-lg">B</span>
                    </div>
                    <h4 className="font-orbitron font-black text-slate-100 uppercase tracking-widest text-xl truncate px-2">{animal2}</h4>
                    {result.winner === animal2 && (
                      <div className="inline-block px-4 py-2 bg-purple-600/20 text-purple-400 text-[10px] font-orbitron font-black tracking-[0.3em] rounded-full border border-purple-500/40">
                        DOMINANT
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-12">
                  <MetricRow label="Lethality" val1={result.stats.animal1Strength} val2={result.stats.animal2Strength} icon="fas fa-hand-fist" />
                  <MetricRow label="Velocity" val1={result.stats.animal1Speed} val2={result.stats.animal2Speed} icon="fas fa-bolt" />
                  <MetricRow label="Synaptic" val1={result.stats.animal1Intelligence} val2={result.stats.animal2Intelligence} icon="fas fa-brain" />
                  <MetricRow label="Armoring" val1={result.stats.animal1Defense} val2={result.stats.animal2Defense} icon="fas fa-shield" />
                  <MetricRow label="Fluidity" val1={result.stats.animal1Agility} val2={result.stats.animal2Agility} icon="fas fa-wind" />
                </div>

                <div className="mt-20 pt-16 border-t border-white/5">
                  <div className="bg-slate-950/60 rounded-[2.5rem] p-10 border border-slate-800/80 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                    <div className="text-[11px] font-orbitron font-black text-slate-600 uppercase tracking-[0.6em] mb-8">Dominance Correlation</div>
                    <div className="flex items-center gap-10 justify-center">
                      <span className={`text-6xl font-orbitron font-black ${result.winner === animal1 ? 'text-purple-500 neon-text-purple' : 'text-slate-900'}`}>A</span>
                      <div className="h-16 w-[1px] bg-slate-800"></div>
                      <span className={`text-6xl font-orbitron font-black ${result.winner === animal2 ? 'text-purple-500 neon-text-purple' : 'text-slate-900'}`}>B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
            <div className="text-center py-48 animate-pulse">
                <div className="inline-block p-20 rounded-[4rem] bg-slate-950/30 border-2 border-slate-900/50 mb-12 relative group hover:border-purple-900/40 transition-all duration-500">
                  <div className="absolute inset-0 bg-purple-600/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100"></div>
                  <i className="fas fa-dna text-[160px] text-slate-900/40 relative z-10"></i>
                </div>
                <h2 className="text-slate-600 text-4xl font-orbitron tracking-[0.5em] uppercase font-black mb-6">Nexus Awaiting Signal</h2>
                <p className="text-slate-800 text-lg font-orbitron tracking-[0.3em] font-medium uppercase italic">Specify biological units or engage Randomizer</p>
            </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-24 border-t border-slate-900/50 bg-slate-950/20 backdrop-blur-md">
        <div className="text-slate-800 text-[11px] font-orbitron font-black uppercase tracking-[1em] mb-4 opacity-50">
          Neural Interface V4.2 Final &bull; Deep Bio-Simulation
        </div>
        <div className="text-[9px] text-slate-900 font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto opacity-30 px-10">
          This system provides purely hypothetical biological simulations based on pre-trained neural data and web-grounded zoological research. Actual encounters may vary by ecosystem factors.
        </div>
      </footer>
    </div>
  );
};

export default App;
