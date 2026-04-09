import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Wand2, Database, Sparkles } from 'lucide-react';
import { useTheme } from '../components/theme-provider';
import { CauldronIllustration } from '../components/MagicalIllustrations';

export function Settings() {
  const [models, setModels] = useState<any[]>([]);
  const [status, setStatus] = useState('checking...');
  const [defaultModel, setDefaultModel] = useState<string | null>(null);
  const { theme, setTheme, effectsEnabled, setEffectsEnabled } = useTheme();

  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/ollama/status');
        const data = await res.json();
        setStatus(data.status);

        if (data.status === 'running') {
          const modelsRes = await fetch('http://localhost:3001/api/ollama/models');
          const modelsData = await modelsRes.json();
          setModels(modelsData || []);
          
          // Set the first model as default if none is selected
          const savedDefault = localStorage.getItem('meowbase-default-model');
          if (savedDefault && modelsData.find((m: any) => m.name === savedDefault)) {
            setDefaultModel(savedDefault);
          } else if (modelsData && modelsData.length > 0) {
            setDefaultModel(modelsData[0].name);
            localStorage.setItem('meowbase-default-model', modelsData[0].name);
          }
        }
      } catch (e) {
        setStatus('stopped');
      }
    };
    checkOllama();
  }, []);

  return (
    <div className="w-full max-w-full space-y-6 px-6 py-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your local AI environment</p>
      </div>

      <Card animationMode="pulse" className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-primary" size={20} />
            House Selection (Theme)
          </CardTitle>
          <CardDescription>Choose your magical house to customize your interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setTheme('gryffindor')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'gryffindor' ? 'border-[#b51c33] bg-[#b51c33]/10 shadow-[0_0_15px_rgba(181,28,51,0.3)]' : 'border-border/50 hover:border-[#b51c33]/50 bg-black/20 hover:bg-[#b51c33]/5'}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b51c33] to-[#e0a82e] mb-3 shadow-lg"></div>
              <span className="font-bold tracking-widest text-[#e0a82e]">Gryffindor</span>
              <span className="text-[10px] text-muted-foreground mt-1">Bravery & Nerve</span>
            </button>
            <button
              onClick={() => setTheme('slytherin')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'slytherin' ? 'border-[#1a6e38] bg-[#1a6e38]/10 shadow-[0_0_15px_rgba(26,110,56,0.3)]' : 'border-border/50 hover:border-[#1a6e38]/50 bg-black/20 hover:bg-[#1a6e38]/5'}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a6e38] to-[#cccccc] mb-3 shadow-lg"></div>
              <span className="font-bold tracking-widest text-[#1a6e38]">Slytherin</span>
              <span className="text-[10px] text-muted-foreground mt-1">Ambition & Cunning</span>
            </button>
            <button
              onClick={() => setTheme('ravenclaw')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'ravenclaw' ? 'border-[#224f85] bg-[#224f85]/10 shadow-[0_0_15px_rgba(34,79,133,0.3)]' : 'border-border/50 hover:border-[#224f85]/50 bg-black/20 hover:bg-[#224f85]/5'}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#224f85] to-[#b38529] mb-3 shadow-lg"></div>
              <span className="font-bold tracking-widest text-[#508bd6]">Ravenclaw</span>
              <span className="text-[10px] text-muted-foreground mt-1">Wisdom & Wit</span>
            </button>
            <button
              onClick={() => setTheme('hufflepuff')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'hufflepuff' ? 'border-[#e6b325] bg-[#e6b325]/10 shadow-[0_0_15px_rgba(230,179,37,0.3)]' : 'border-border/50 hover:border-[#e6b325]/50 bg-black/20 hover:bg-[#e6b325]/5'}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e6b325] to-[#1f1f1f] mb-3 shadow-lg"></div>
              <span className="font-bold tracking-widest text-[#e6b325]">Hufflepuff</span>
              <span className="text-[10px] text-muted-foreground mt-1">Loyalty & Patience</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card animationMode="scan" className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Magical Atmosphere (Effects)
          </CardTitle>
          <CardDescription>Control the intensity of the magical background animations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-black/20 gap-8">
            <div className="flex-1">
              <p className="font-medium text-foreground">Enable Ambient Magic</p>
              <p className="text-sm text-muted-foreground mt-1">
                Toggles floating particles, mouse halos, water ripples on click, and breathing gradients. Disable to save battery or reduce CPU usage.
              </p>
            </div>
            <button
              onClick={() => setEffectsEnabled(!effectsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
              style={{ backgroundColor: effectsEnabled ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
              role="switch"
              aria-checked={effectsEnabled}
            >
              <span className="sr-only">Toggle ambient magic</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-0 transition-transform duration-300 ease-in-out ${
                  effectsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card animationMode="scan" className="glass-panel">
        <CardHeader>
          <CardTitle>Ollama Service</CardTitle>
          <CardDescription>Local LLM engine status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-medium capitalize">{status}</span>
              </div>
              {status !== 'running' && (
                <p className="text-sm text-muted-foreground">
                  Please make sure Ollama app is running on your machine.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  setStatus('starting...');
                  try {
                    // Send request to backend to start ollama
                    const res = await fetch('http://localhost:3001/api/ollama/start', { method: 'POST' });
                    if (res.ok) {
                      setStatus('running');
                    } else {
                      setStatus('stopped');
                    }
                  } catch (e) {
                    setStatus('stopped');
                  }
                }}
                disabled={status === 'running' || status === 'starting...'}
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/30 hover:border-green-500/50 transition-colors"
              >
                Start Engine
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    // Send request to backend to stop ollama
                    const res = await fetch('http://localhost:3001/api/ollama/stop', { method: 'POST' });
                    if (res.ok) {
                      setStatus('stopped');
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                disabled={status !== 'running'}
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 transition-colors"
              >
                Stop Engine
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {status === 'running' && (
        <Card animationMode="pulse" className="glass-panel">
          <CardHeader>
            <CardTitle>Installed Models</CardTitle>
            <CardDescription>Models available for chat and embeddings</CardDescription>
          </CardHeader>
          <CardContent>
            {models.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center relative overflow-hidden group rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                <div className="relative w-32 h-32 mb-4 opacity-90 z-10 group-hover:scale-105 transition-transform duration-700">
                  <CauldronIllustration className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <p className="text-lg font-semibold tracking-tight text-foreground relative z-10">No Magical Entities Found</p>
                <p className="text-sm text-muted-foreground mt-1 relative z-10">
                  Brew a new model by running <code className="text-primary bg-black/30 px-1 rounded">ollama run llama3</code> in your terminal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {models.map(m => {
                  const isDefault = defaultModel === m.name;
                  return (
                      <div 
                      key={m.name} 
                      className={`flex justify-between items-center p-4 border rounded-xl backdrop-blur-sm transition-all duration-300 border-border/50 bg-black/20 ${
                        isDefault ? 'transform-none' : 'hover:bg-black/40 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-muted text-muted-foreground">
                          <Database size={16} />
                        </div>
                        <div>
                          <div className={`font-bold tracking-tight ${isDefault ? 'text-primary' : 'text-foreground'}`}>
                            {m.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                            <span>{(m.size / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                            {isDefault && (
                              <>
                                <div className="w-1 h-1 rounded-full bg-primary"></div>
                                <span className="text-primary tracking-widest uppercase text-[9px]">Active Engine</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant={isDefault ? "default" : "outline"} 
                        size="sm"
                        className={`gap-2 rounded-full px-4 transition-all duration-300 ${
                          isDefault 
                            ? 'text-white shadow-[0_0_10px_hsl(var(--primary)/0.3)] pointer-events-none' 
                            : 'hover:border-primary/50 hover:text-primary'
                        }`}
                        style={isDefault ? { backgroundColor: 'hsl(var(--primary))' } : {}}
                        onClick={() => {
                          setDefaultModel(m.name);
                          localStorage.setItem('meowbase-default-model', m.name);
                        }}
                      >
                        {isDefault ? (
                          <>
                            <CheckCircle size={14} className="animate-in zoom-in duration-300" />
                            Default
                          </>
                        ) : (
                          'Set Default'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
