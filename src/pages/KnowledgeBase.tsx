import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Search, Scroll } from 'lucide-react';
import { MagicBookIllustration } from '../components/MagicalIllustrations';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface Document {
  id: string;
  filename: string;
  file_type: string;
}

export function KnowledgeBase() {
  const { id: knowledgeBaseId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${knowledgeBaseId}`);
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledgeBaseId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !knowledgeBaseId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('knowledgeBaseId', knowledgeBaseId);

    try {
      await fetch('http://localhost:3001/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await fetch(`http://localhost:3001/api/documents/${docId}`, { method: 'DELETE' });
      fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/knowledge')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Train Knowledge Base</h2>
            <p className="text-muted-foreground mt-1">Upload and manage documents for your AI agent</p>
          </div>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".pdf,.txt,.md,.docx,.jpg,.jpeg,.png,.webp"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading} 
            className="gap-2 shadow-sm rounded-full px-5 bg-primary text-white border-none hover:bg-primary/90 transition-all duration-300 opacity-100"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            {uploading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Upload size={18} className="text-white" />
            )}
            <span className="text-white font-medium">{uploading ? 'Processing...' : 'Upload Document'}</span>
          </Button>
        </div>
      </div>

      <div className="glass-panel shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold flex items-center gap-2 tracking-tight">
            <FileText size={18} className="text-primary" />
            Training Documents
          </h3>
        </div>
        
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center border-2 border-dashed border-border/50 rounded-xl bg-black/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
              <div className="relative w-40 h-40 mb-4 opacity-90 z-10 group-hover:scale-105 transition-transform duration-700">
                <MagicBookIllustration className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <p className="text-xl font-semibold tracking-tight text-foreground relative z-10">The Library is Empty</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6 relative z-10">Upload scrolls, parchments (PDF, TXT), or images to start training your magical agent.</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="shadow-sm rounded-full relative z-10 hover:border-primary/50 hover:bg-primary/10 text-foreground">
                Select Spells
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <Card 
                  key={doc.id} 
                  animationMode={index % 2 === 0 ? 'pulse' : 'wave'} 
                  className="flex flex-col p-5 rounded-xl border border-border/20 bg-background/60 hover:bg-background/80 hover:border-primary/40 transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_hsl(var(--primary)/0.25)] focus-visible:outline-none relative overflow-hidden"
                  role="article"
                  aria-labelledby={`doc-title-${doc.id}`}
                  tabIndex={0}
                >
                  {/* Subtle magic glow behind the card */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_hsl(var(--primary)/0.05),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                  <div className="flex items-start justify-between w-full relative z-10 -mt-2">
                    <div className="flex items-center gap-4 overflow-hidden flex-1 pr-4 mt-2">
                      <div className="w-12 h-12 rounded-full bg-background border-2 border-primary/30 flex shrink-0 items-center justify-center group-hover:border-primary/60 group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.2)_0%,_transparent_70%)]"></div>
                        <Scroll size={20} className="text-primary relative z-10" />
                      </div>
                      
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <p id={`doc-title-${doc.id}`} className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate pr-2" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-[inset_0_0_5px_hsl(var(--secondary)/0.1)]">
                            {doc.file_type.replace('.', '')}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-border/50"></div>
                          <span className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                            Parsed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons moved to the top right, with a clear separation from text */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-full focus-visible:opacity-100 border border-transparent hover:border-primary/20 bg-background/50 backdrop-blur-sm"
                        onClick={() => window.open(`http://localhost:3001/api/documents/preview/${doc.id}`, '_blank')}
                        title="Preview Spell"
                        aria-label={`Preview ${doc.filename}`}
                      >
                        <Search size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-colors rounded-full focus-visible:opacity-100 border border-transparent hover:border-destructive/20 bg-background/50 backdrop-blur-sm"
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Incinerate Scroll"
                        aria-label={`Delete ${doc.filename}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}