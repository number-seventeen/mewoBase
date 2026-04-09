import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Library, Clock, Zap, Cpu, FileText } from 'lucide-react';
import { HogwartsIllustration } from '../components/MagicalIllustrations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Home() {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  const fetchKbs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/knowledge-bases');
      const data = await res.json();
      setKnowledgeBases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKbs();
  }, []);

  const handleCreate = async () => {
    if (!newName) return;
    try {
      const res = await fetch('http://localhost:3001/api/knowledge-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      if (res.ok) {
        setIsCreating(false);
        setNewName('');
        setNewDesc('');
        fetchKbs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:3001/api/knowledge-bases/${id}`, { method: 'DELETE' });
      fetchKbs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full px-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Bases</h2>
          <p className="text-muted-foreground mt-1">Manage isolated contexts for your local AI agent</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          className="gap-2 shadow-sm rounded-full px-5 bg-primary text-white border-none hover:bg-primary/90 transition-all duration-300 opacity-100"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <Plus size={18} className="text-white" />
          <span className="text-white font-medium">Create New</span>
        </Button>
      </div>

      {isCreating && (
        <Card animationMode="wave" className="glass-panel shadow-sm border-border animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create Knowledge Base</CardTitle>
            <CardDescription>Setup a new isolated context for your AI agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                placeholder="e.g. Project Documents" 
                value={newName} 
                className="bg-black/20 border-border/50 shadow-sm backdrop-blur-sm"
                onChange={(e) => setNewName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="What is this knowledge base for?" 
                value={newDesc} 
                className="bg-black/20 border-border/50 shadow-sm min-h-[100px] backdrop-blur-sm"
                onChange={(e) => setNewDesc(e.target.value)} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              className="shadow-sm bg-primary text-white border-none hover:bg-primary/90 transition-all duration-300 opacity-100"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              <span className="text-white font-medium">Create</span>
            </Button>
          </CardFooter>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : knowledgeBases.length === 0 && !isCreating ? (
        <div className="text-center py-24 glass-panel rounded-2xl border border-dashed border-border/50 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle magical glow in the background */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative w-48 h-48 mb-6 opacity-90 z-10 hover:scale-105 transition-transform duration-700">
            <HogwartsIllustration className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground relative z-10">Welcome to Hogwarts</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-sm relative z-10">
            You haven't initialized any magical libraries yet. Create your first knowledge base to store your spells and documents.
          </p>
          <Button 
            onClick={() => setIsCreating(true)} 
            className="gap-2 shadow-md rounded-full px-8 relative z-10 bg-primary hover:bg-primary/90 text-white border-none transition-all duration-300 opacity-100"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <Plus size={18} className="text-white" />
            <span className="text-white font-medium">Initialize Magic Base</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {knowledgeBases.map((kb, index) => (
            <Card 
              key={kb.id} 
              animationMode={index % 3 === 0 ? 'scan' : index % 3 === 1 ? 'pulse' : 'wave'}
              className="cursor-pointer border border-border/20 hover:border-primary/50 transition-all duration-300 glass-panel group flex flex-col min-h-[170px] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_30px_-5px_hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => navigate(`/knowledge/${kb.id}`)}
              role="article"
              tabIndex={0}
              aria-labelledby={`kb-title-${kb.id}`}
            >
              {/* Sci-fi Background decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.15),_transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <CardContent className="p-6 flex-1 flex flex-col relative z-10">
                {/* Header Row */}
                <div className="flex justify-between items-start gap-4 mb-1">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-primary/30 flex shrink-0 items-center justify-center shadow-[inset_0_0_12px_hsl(var(--primary)/0.2)] group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.2)_0%,_transparent_70%)]"></div>
                      <Library size={22} className="text-primary relative z-10 drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
                    </div>
                    <div className="flex flex-col min-w-0 pt-1.5">
                      <h3 id={`kb-title-${kb.id}`} className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                        {kb.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/30 shadow-[inset_0_0_8px_rgba(16,185,129,0.1)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]"></span>
                      </span>
                      <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-widest">Active</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground/60 transition-all hover:text-white hover:bg-white/10 rounded-full"
                      onClick={(e) => { e.stopPropagation(); handleDelete(kb.id, e); }}
                      aria-label={`Delete knowledge base ${kb.name}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-3 mb-5 flex-1">
                  <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed font-sans pr-2">
                    {kb.description || 'No magical inscription found. Upload scrolls to initialize the neural pathways for this knowledge base.'}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-primary/20 text-[11px] text-primary/90 font-medium bg-primary/5 backdrop-blur-sm group-hover:bg-primary/10 transition-colors">
                      <Zap size={12} className="text-secondary/90" /> 
                      Vectorized
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-primary/20 text-[11px] text-primary/90 font-medium bg-primary/5 backdrop-blur-sm group-hover:bg-primary/10 transition-colors">
                      <Cpu size={12} className="text-secondary/90" /> 
                      Local Engine
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-secondary/80 group-hover:text-secondary transition-colors bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                      <FileText size={14} />
                      <span>{kb.documentCount || 0} Scrolls</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] opacity-60">
                      <Clock size={12} />
                      <span>{new Date(kb.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
