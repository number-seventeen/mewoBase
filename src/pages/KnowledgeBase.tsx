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
            className="gap-2 px-5 transition-all duration-300 opacity-100 bg-transparent text-primary hover:text-primary/80 border-none shadow-none"
          >
            {uploading ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            <span className="font-bold">{uploading ? 'Processing...' : 'Upload Document'}</span>
          </Button>
        </div>
      </div>

      <div className="shadow-sm rounded-2xl overflow-hidden bg-transparent">
        <div className="p-4 bg-transparent">
          <h3 className="font-semibold flex items-center gap-2 tracking-tight">
            <FileText size={18} className="text-primary" />
            Training Documents
          </h3>
        </div>
        
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center border-none bg-transparent relative overflow-hidden group">
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
                  className="flex flex-col p-5 rounded-xl bg-transparent transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 focus-visible:outline-none relative overflow-hidden"
                  role="article"
                  aria-labelledby={`doc-title-${doc.id}`}
                  tabIndex={0}
                >
                  {/* Subtle magic glow behind the card */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_hsl(var(--primary)/0.05),_transparent_60%)] opacity-0 transition-opacity duration-700 pointer-events-none"></div>

                  <div className="flex items-start justify-between w-full relative z-10 -mt-2">
                    <div className="flex items-center gap-4 overflow-hidden flex-1 pr-4 mt-2">
                      <div className="flex shrink-0 items-center justify-center relative overflow-hidden">
                        <Scroll size={28} className="text-primary relative z-10" />
                      </div>
                      
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <p id={`doc-title-${doc.id}`} className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate pr-2" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-secondary bg-transparent border-none px-0 py-0.5 rounded-none uppercase tracking-widest shadow-none">
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
                        className="h-8 w-8 text-muted-foreground hover:text-primary bg-transparent transition-colors rounded-none focus-visible:opacity-100 border-none shadow-none"
                        onClick={() => window.open(`http://localhost:3001/api/documents/preview/${doc.id}`, '_blank')}
                        title="Preview Spell"
                        aria-label={`Preview ${doc.filename}`}
                      >
                        <Search size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive bg-transparent transition-colors rounded-none focus-visible:opacity-100 border-none shadow-none"
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