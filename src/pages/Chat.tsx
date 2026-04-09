import React, { useState, useEffect, useRef } from 'react';
import { Send, Database, Paperclip, X, FileText, Wand2, User, Terminal, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ReactMarkdown from 'react-markdown';
import { OwlIllustration } from '../components/MagicalIllustrations';

interface ToolCall {
  name: string;
  args: Record<string, any>;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  toolsUsed?: ToolCall[];
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  knowledge_base_id?: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKb, setSelectedKb] = useState<string>('none');
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/conversations');
      const data = await res.json();
      setConversations(data);
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    }
  };

  useEffect(() => {
    const fetchKbs = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/knowledge-bases');
        const data = await res.json();
        setKnowledgeBases(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchKbs();
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/conversations/${id}/messages`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load conversation messages');
      }
      const data = await res.json();
      setMessages(data);
      setCurrentConversationId(id);
      
      const conv = conversations.find(c => c.id === id);
      if (conv && conv.knowledge_base_id) {
        setSelectedKb(conv.knowledge_base_id);
      } else {
        setSelectedKb('none');
      }
    } catch (e) {
      console.error('Failed to load conversation messages', e);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setSelectedKb('none');
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:3001/api/conversations/${id}`, { method: 'DELETE' });
      if (currentConversationId === id) {
        startNewConversation();
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && tempFiles.length === 0) return;
    
    // Convert images to base64 for preview
    const imageFiles = tempFiles.filter(f => f.type.startsWith('image/'));
    const otherFiles = tempFiles.filter(f => !f.type.startsWith('image/'));
    
    const imageUrls = await Promise.all(
      imageFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input + (otherFiles.length > 0 ? `\n\n*(Attached ${otherFiles.length} documents)*` : ''),
      images: imageUrls
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Create FormData for mixed content
    const formData = new FormData();
    if (selectedKb !== 'none') {
      formData.append('knowledgeBaseId', selectedKb);
    }
    if (currentConversationId) {
      formData.append('conversationId', currentConversationId);
    }
    formData.append('message', input);
    
    // Use user's selected default model from Settings, fallback to qwen2.5:latest
    const defaultModel = localStorage.getItem('meowbase-default-model') || 'qwen2.5:latest';
    formData.append('model', defaultModel);
    
    tempFiles.forEach(file => {
      formData.append('files', file);
    });

    // Clear temp files from UI immediately
    setTempFiles([]);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from magical assistant');
      }

      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
        fetchConversations();
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        toolsUsed: data.toolsUsed
      }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `*Magical Interference Detected:* ${e.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-6 w-full max-w-full px-6 py-6">
      {/* Sidebar for Conversations */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4 p-4">
        <Button 
          onClick={startNewConversation} 
          className="w-full gap-2 transition-all bg-transparent text-primary hover:text-primary/80 border-none shadow-none"
        >
          <Plus size={18} /> <span className="font-bold">New Chat</span>
        </Button>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 mt-2">Recent Magic</div>
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar -mx-2 px-2">
          {conversations.length === 0 ? (
            <div className="text-sm text-muted-foreground/60 text-center py-8">No history yet</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => loadConversation(conv.id)} 
                className={`group flex items-center justify-between p-3 cursor-pointer transition-all duration-300 border-none shadow-none bg-transparent ${
                  currentConversationId === conv.id 
                    ? 'text-primary' 
                    : 'text-foreground/80 hover:text-primary/80'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className={`shrink-0 ${currentConversationId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="truncate text-sm font-medium">{conv.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteConversation(e, conv.id)}
                  className={`shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all ${
                    currentConversationId === conv.id ? 'opacity-100 text-primary hover:text-destructive' : 'text-muted-foreground'
                  }`}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
        {/* Top Bar for Selection */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-transparent border-none shadow-none relative shrink-0">
        <div className="flex items-center gap-4 relative z-10">
          <div 
            className="flex items-center justify-center border-none shadow-none bg-transparent"
          >
            <Wand2 size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-xl leading-tight tracking-tight text-foreground">Magical Assistant</h2>
            <p className="text-sm text-muted-foreground/80 mt-0.5">Consult the ancient scrolls and cast your spells</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Database size={16} className="text-primary" />
          <div className="w-[280px]">
            <Select value={selectedKb} onValueChange={setSelectedKb}>
              <SelectTrigger className="w-full bg-transparent border-none shadow-none text-primary hover:text-primary/80 transition-colors h-10">
                <SelectValue placeholder="No Magic Base Selected (Optional)" />
              </SelectTrigger>
              <SelectContent className="bg-transparent backdrop-blur-xl border-none shadow-none">
                <SelectItem value="none" className="focus:bg-primary/10">No Magic Base Selected</SelectItem>
                {knowledgeBases.map(kb => (
                  <SelectItem key={kb.id} value={kb.id} className="focus:bg-primary/10 font-medium">
                    {kb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-transparent border-none shadow-none overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative w-48 h-48 mb-6 opacity-90 z-10 group-hover:scale-105 transition-transform duration-700">
                <OwlIllustration className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <p className="text-2xl font-semibold text-foreground tracking-tight relative z-10">How can I help you today?</p>
              <p className="text-sm mt-2 max-w-sm text-center relative z-10">Chat with pure magic, or select a knowledge base above to empower your spells.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div 
                  className="flex items-center justify-center shrink-0 border-none bg-transparent"
                >
                  {msg.role === 'user' ? <User size={24} className="text-primary" /> : <Wand2 size={24} className="text-primary" />}
                </div>
                <div 
                  className={`max-w-[80%] px-6 py-4 shadow-none bg-transparent border-none ${msg.role === 'user' ? 'text-primary' : 'text-foreground'}`}
                >
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {msg.images.map((img, i) => (
                        <img key={i} src={img} alt="attached" className="max-w-[200px] max-h-[200px] object-cover rounded-xl border border-border/50 shadow-sm" />
                      ))}
                    </div>
                  )}
                  <div className={`prose dark:prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'prose-p:text-primary text-primary font-medium' : 'prose-p:text-foreground text-foreground'}`}>
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4">
                        {msg.toolsUsed.map((tool, i) => (
                          <div key={i} className="flex items-start gap-2 bg-transparent border-none p-2.5 text-xs text-muted-foreground shadow-none">
                            <Terminal size={14} className="text-secondary mt-0.5 shrink-0" />
                            <div className="flex-1 overflow-hidden">
                              <span className="font-semibold text-primary/80">Used magic: {tool.name}</span>
                              {tool.args && Object.keys(tool.args).length > 0 && (
                                <pre className="mt-1.5 p-1.5 bg-black/30 rounded text-[10px] overflow-x-auto text-muted-foreground font-mono">
                                  {JSON.stringify(tool.args, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-center shrink-0 bg-transparent border-none shadow-none">
                <Wand2 size={24} className="text-primary animate-pulse" />
              </div>
              <div className="bg-transparent border-none text-foreground px-5 py-4 flex items-center gap-2 relative overflow-hidden shadow-none">
                <div className="flex gap-1.5 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-none" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-none" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-none" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-5 border-none bg-transparent flex flex-col gap-3 relative z-10">
          {tempFiles.length > 0 && (
            <div className="flex gap-2 flex-wrap animate-in slide-in-from-bottom-2">
              {tempFiles.map((f, i) => {
                const isImage = f.type.startsWith('image/');
                const objectUrl = isImage ? URL.createObjectURL(f) : null;

                return (
                  <div key={i} className="flex items-center gap-2 bg-background/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-xl text-xs border border-primary/20 shadow-sm relative group hover:border-primary/50 transition-colors">
                    {isImage ? (
                      <div className="w-8 h-8 rounded-md shrink-0 overflow-hidden bg-muted border border-border/50">
                        <img src={objectUrl!} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileText size={16} className="text-secondary shrink-0" />
                    )}
                    <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                    <button 
                      onClick={() => setTempFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-full p-1 transition-colors"
                      aria-label={`Remove attached file ${f.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-3 items-end relative">
            <input 
              type="file" 
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={e => {
                if (e.target.files) {
                  setTempFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                }
              }}
              accept=".pdf,.txt,.md,.docx,.jpg,.jpeg,.png,.webp"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 h-[52px] w-[52px] text-primary border-none bg-transparent shadow-none hover:text-primary/80 transition-all duration-300 opacity-100"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedKb}
              aria-label="Attach magical documents"
              title="Attach scroll or image"
            >
              <Paperclip size={24} />
            </Button>
            
            <div className="flex-1 relative group">
              <textarea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={selectedKb && selectedKb !== 'none' ? "Ask the magical texts a question..." : "Cast a spell or ask a question..."} 
                className="w-full bg-transparent border-none px-5 py-3.5 min-h-[52px] max-h-[150px] focus:outline-none focus:ring-0 text-foreground resize-none font-sans leading-relaxed transition-all placeholder:text-muted-foreground relative z-10 flex items-center shadow-none"
                rows={1}
                aria-label="Chat message input"
              />
            </div>
            
            <Button 
              onClick={handleSend} 
              disabled={loading || (!input.trim() && tempFiles.length === 0)} 
              className="h-[52px] shrink-0 bg-transparent text-primary hover:text-primary/80 hover:bg-transparent shadow-none transition-all duration-300 group border-none opacity-100"
              aria-label="Cast spell"
            >
              <span className="font-bold tracking-wider mr-2">Cast</span>
              <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
