import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ArrowLeft, Send, Volume2, Mic, Bot, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import type { User, StudentProfile } from '../types';

export default function ChatWithAI() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const u = userDoc.data() as User;
        setUser(u);
        setMessages([
          {
            role: 'model',
            parts: [{ text: `Hallo! I am your LinguaAI tutor. Let's practice some German today. How are you feeling?` }]
          }
        ]);
      }
    });
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'de-DE'; // Default to German recognition
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          if (currentTranscript) {
            setInput(prev => prev + (prev ? ' ' : '') + currentTranscript);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }

    return () => {
      unsubscribe();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput(''); // Optional: clear input when starting to listen
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to pick a German voice if it's German text, or English for English parts.
        // We'll default to German as the primary language being practiced.
        utterance.lang = 'de-DE';
        
        const voices = window.speechSynthesis.getVoices();
        const germanVoice = voices.find(v => v.lang.startsWith('de'));
        if (germanVoice) {
          utterance.voice = germanVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = { role: 'user' as const, parts: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch latest admin instructions
      const instructionsQ = query(collection(db, 'admin_instructions'), orderBy('timestamp', 'desc'), limit(5));
      const instructionsSnap = await getDocs(instructionsQ);
      const instructions = instructionsSnap.docs
        .filter(d => ['active', 'pending'].includes(d.data().status))
        .map(d => d.data().command)
        .join('\n');

      // Fetch knowledge base (syllabus, etc.)
      const kbQ = query(collection(db, 'knowledge_base'), orderBy('timestamp', 'desc'), limit(1));
      const kbSnap = await getDocs(kbQ);
      const kb = kbSnap.docs.map(d => d.data().content).join('\n');

      let dynamicContext = `You are a helpful German language tutor. The user is a beginner (A1 level). 
          Keep your responses relatively short, encouraging, and easy to understand. 
          Use both English and German to help the user learn. Correct their mistakes gently.`;

      if (kb) {
        dynamicContext += `\n\nCURRICULUM/SYLLABUS KNOWLEDGE:\n${kb}`;
      }
      
      if (instructions) {
        dynamicContext += `\n\nSPECIFIC TEACHING INSTRUCTIONS FROM ADMIN:\n${instructions}`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          context: dynamicContext
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages([...newMessages, { role: 'model', parts: [{ text: data.text }] }]);
        speakText(data.text);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'model', parts: [{ text: 'Sorry, I encountered an error connecting to my language core.' }] }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/student')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-indigo-950 uppercase tracking-tight flex items-center gap-2">
              <Bot className="text-purple-600 w-6 h-6" />
              Speaking Gym
            </h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Tutor Active
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              <div 
                className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-4 relative group font-medium",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-200" 
                    : "bg-white text-slate-800 border-b-4 border-slate-200 rounded-bl-sm shadow-sm"
                )}
              >
                <p className="leading-relaxed text-[15px]">{msg.parts[0].text}</p>
                
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speakText(msg.parts[0].text)}
                    className="absolute -right-12 bottom-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm border border-slate-100"
                    title="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-colors",
                isListening 
                  ? "bg-red-100 text-red-600 animate-pulse border-2 border-red-200" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your response..."}
                className={cn(
                  "w-full border-2 rounded-full px-6 py-3.5 pr-14 focus:outline-none transition-all text-[15px] font-medium",
                  isListening 
                    ? "bg-red-50 border-red-200 focus:border-red-400 placeholder:text-red-300 text-red-700" 
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                )}
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors shadow-md shadow-orange-500/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
