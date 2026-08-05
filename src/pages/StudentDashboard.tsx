import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, query, collection, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { BookOpen, PenTool, Mic, Headphones, BrainCircuit, Flame, Trophy, Ghost, User as UserIcon, Home, Check, HelpCircle, Volume2, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { User, StudentProfile } from '../types';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedWord, setSelectedWord] = useState<{word: string, def: string, context: string} | null>(null);
  const [latestInstruction, setLatestInstruction] = useState<string | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  const [currentWritingIndex, setCurrentWritingIndex] = useState(0);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<'idle'|'correct'|'incorrect'>('idle');
  
  const [listeningInput, setListeningInput] = useState('');
  const [listeningFeedback, setListeningFeedback] = useState<'idle'|'correct'|'incorrect'>('idle');
  
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabFlipped, setVocabFlipped] = useState(false);
  
  const [shadowIndex, setShadowIndex] = useState(0);
  const [isShadowListening, setIsShadowListening] = useState(false);
  const [shadowInput, setShadowInput] = useState('');
  const [shadowFeedback, setShadowFeedback] = useState<'idle'|'correct'|'incorrect'>('idle');
  const shadowRecognitionRef = React.useRef<any>(null);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tempNativeLang, setTempNativeLang] = useState('English');

  const lessons = [
    {
      title: "Hallo! Wie heißt du?",
      difficulty: "A1",
      wordsCount: 30,
      content: [
        {
          speaker: "Anna",
          german: "Hallo! Ich bin Anna. Ich komme aus ",
          germanClickable1: { word: "Berlin", def: "Capital city of Germany.", context: "Berlin is a major city in Germany.", original: "Berlin" },
          german2: ". Ich bin eine ",
          germanClickable2: { word: "Studentin", def: "Female student.", context: "Studentin refers to a female university student.", original: "Studentin" },
          german3: ". Und du? Wie heißt du?",
          english: "Hello! I am Anna. I come from Berlin. I am a student. And you? What is your name?"
        },
        {
          speaker: "Karl",
          german: "Ich heiße Karl. Ich komme aus München. ",
          germanClickable1: { word: "Freut mich", def: "Nice to meet you / Gladly.", context: "A common phrase to express pleasure in meeting someone.", original: "Freut mich" },
          german2: ", dich kennenzulernen!",
          germanClickable2: null,
          german3: "",
          english: "My name is Karl. I come from Munich. Nice to meet you!"
        }
      ],
      questions: [
        { q: "Woher kommt Anna?", answers: ["Karl", "Berlin"], correct: 1 },
        { q: "Wie heißt der Mann?", answers: ["Karl", "Berlin"], correct: 0 }
      ],
      speakAll: "Hallo! Ich bin Anna. Ich komme aus Berlin. Ich bin eine Studentin. Und du? Wie heißt du? Ich heiße Karl. Ich komme aus München. Freut mich, dich kennenzulernen!"
    },
    {
      title: "Wie geht es dir?",
      difficulty: "A1",
      wordsCount: 25,
      content: [
        {
          speaker: "Anna",
          german: "Guten Morgen, Karl! ",
          germanClickable1: { word: "Wie geht es dir", def: "How are you?", context: "A common phrase to ask how someone is doing.", original: "Wie geht es dir" },
          german2: " heute?",
          germanClickable2: null,
          german3: "",
          english: "Good morning, Karl! How are you today?"
        },
        {
          speaker: "Karl",
          german: "Mir geht es ",
          germanClickable1: { word: "sehr gut", def: "Very well.", context: "An expression of feeling good.", original: "sehr gut" },
          german2: ", ",
          germanClickable2: { word: "danke", def: "Thank you.", context: "A word used to express gratitude.", original: "danke" },
          german3: "! Und dir?",
          english: "I am doing very well, thank you! And you?"
        }
      ],
      questions: [
        { q: "Wem geht es sehr gut?", answers: ["Karl", "Anna"], correct: 0 },
        { q: "Wann sprechen sie?", answers: ["Morgen", "Abend"], correct: 0 }
      ],
      speakAll: "Guten Morgen, Karl! Wie geht es dir heute? Mir geht es sehr gut, danke! Und dir?"
    },
    {
      title: "Im Café",
      difficulty: "A1",
      wordsCount: 35,
      content: [
        {
          speaker: "Kellner",
          german: "Hallo! Was ",
          germanClickable1: { word: "möchten", def: "Would like.", context: "A polite way to express a wish.", original: "möchten" },
          german2: " Sie trinken?",
          germanClickable2: null,
          german3: "",
          english: "Hello! What would you like to drink?"
        },
        {
          speaker: "Anna",
          german: "Ich hätte gerne einen ",
          germanClickable1: { word: "Kaffee", def: "Coffee.", context: "A popular caffeinated drink.", original: "Kaffee" },
          german2: " mit ",
          germanClickable2: { word: "Milch", def: "Milk.", context: "A white liquid produced by mammals.", original: "Milch" },
          german3: ", bitte.",
          english: "I would like a coffee with milk, please."
        }
      ],
      questions: [
        { q: "Was möchte Anna trinken?", answers: ["Tee", "Kaffee"], correct: 1 },
        { q: "Mit was trinkt sie Kaffee?", answers: ["Zucker", "Milch"], correct: 1 }
      ],
      speakAll: "Hallo! Was möchten Sie trinken? Ich hätte gerne einen Kaffee mit Milch, bitte."
    }
  ];

  const shadowTasks = [
    { text: "Hallo, wie geht es dir?" },
    { text: "Ich möchte bitte einen Kaffee." },
    { text: "Wo ist der Bahnhof?" }
  ];

  const currentLesson = lessons[currentLessonIndex];
  
  const handleNextLesson = async () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextIndex);
      setSelectedWord(null);
      setSelectedAnswers({});
      if (user) {
        await setDoc(doc(db, 'student_profiles', user.id), { last_lesson_index: nextIndex }, { merge: true });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'de-DE';
        
        recognition.onresult = (event: any) => {
          if (event.results && event.results.length > 0) {
            const currentTranscript = event.results[0][0].transcript;
            setShadowInput(currentTranscript);
            
            const expected = shadowTasks[shadowIndex].text.toLowerCase().replace(/[?,.!]/g, '');
            const actual = currentTranscript.toLowerCase().replace(/[?,.!]/g, '');
            
            if (actual.includes(expected) || expected.includes(actual) || actual === expected) {
              setShadowFeedback('correct');
              awardXP(20);
            } else {
              setShadowFeedback('incorrect');
            }
          }
        };
        
        recognition.onend = () => {
          setIsShadowListening(false);
        };
        
        shadowRecognitionRef.current = recognition;
      }
    }
  }, [shadowIndex]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/');
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      } else {
        const newUserData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'student' as const,
          native_lang: 'en',
          target_lang: 'es',
          cefr_level: 'B1',
          learning_style: 'visual' as const,
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
        setUser(newUserData);
      }
      
      const profileDoc = await getDoc(doc(db, 'student_profiles', firebaseUser.uid));
      if (profileDoc.exists()) {
        const p = profileDoc.data() as StudentProfile;
        setProfile(p);
        if (!p.native_language) {
          setShowOnboarding(true);
        } else {
          if (p.last_lesson_index !== undefined) setCurrentLessonIndex(p.last_lesson_index);
          if (p.last_active_tab) setActiveTab(p.last_active_tab);
        }
      } else {
        const newProfileData = {
          id: firebaseUser.uid,
          streak: 0,
          xp: 0,
          dyslexia_mode: false,
        };
        await setDoc(doc(db, 'student_profiles', firebaseUser.uid), newProfileData);
        setProfile(newProfileData);
        setShowOnboarding(true);
      }

      const instructionsQ = query(collection(db, 'admin_instructions'), orderBy('timestamp', 'desc'), limit(1));
      const unsubInstructions = onSnapshot(instructionsQ, (snap) => {
        if (!snap.empty) {
          setLatestInstruction(snap.docs[0].data().command);
        }
      });
      return () => unsubInstructions();
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Pre-load voices for SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading your AI Tutor...</p>
      </div>
    </div>
  );

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border-b-8 border-slate-200 max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <BrainCircuit className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-black text-indigo-950 text-center uppercase tracking-tight mb-2">Welcome to LinguaAI</h2>
          <p className="text-slate-500 text-center mb-8">Let's set up your profile so the AI can translate things accurately for you.</p>
          
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">What is your native language?</label>
          <input 
            type="text" 
            value={tempNativeLang}
            onChange={(e) => setTempNativeLang(e.target.value)}
            placeholder="e.g. English, Spanish, French"
            className="w-full border-2 border-slate-200 rounded-xl p-4 text-lg font-medium focus:border-indigo-500 focus:ring-0 outline-none transition-colors mb-6"
          />
          
          <button 
            onClick={async () => {
              if (tempNativeLang.trim()) {
                await setDoc(doc(db, 'student_profiles', user.id), { native_language: tempNativeLang.trim() }, { merge: true });
                setProfile({ ...profile, native_language: tempNativeLang.trim() });
                setShowOnboarding(false);
              }
            }}
            disabled={!tempNativeLang.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  const handleWordClick = (word: string, def: string, context: string) => {
    setSelectedWord({ word, def, context });
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      
      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const awardXP = async (amount: number) => {
    if (user && profile) {
      const newXp = profile.xp + amount;
      const newStreak = profile.streak === 0 ? 1 : profile.streak;
      await setDoc(doc(db, 'student_profiles', user.id), { xp: newXp, streak: newStreak }, { merge: true });
      setProfile({ ...profile, xp: newXp, streak: newStreak });
    }
  };

  const changeTab = async (tab: string) => {
    setActiveTab(tab);
    if (user) {
      await setDoc(doc(db, 'student_profiles', user.id), { last_active_tab: tab }, { merge: true });
    }
  };

  const renderHome = () => (
    <div className="max-w-5xl mx-auto px-8 py-12 overflow-y-auto w-full h-full">
      <div className="mb-10">
        <h2 className="text-3xl font-black leading-none text-indigo-950 uppercase tracking-tight">Welcome back, {user.email?.split('@')[0]}!</h2>
        <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Your AI tutor has prepared 3 new exercises based on your recent progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {[
          { id: 'reading', name: 'Reading Lab', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Personalized exercises tailored to your level' },
          { id: 'writing', name: 'Writing Studio', icon: PenTool, color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Personalized exercises tailored to your level' },
          { id: 'speaking', name: 'Speaking Gym', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-100', desc: 'Practice conversations with your AI tutor', path: '/chat' },
          { id: 'listening', name: 'Listening Dojo', icon: Headphones, color: 'text-amber-600', bg: 'bg-amber-100', desc: 'Personalized exercises tailored to your level' },
          { id: 'vocab', name: 'Vocabulary Forge', icon: BrainCircuit, color: 'text-rose-600', bg: 'bg-rose-100', desc: 'Personalized exercises tailored to your level' },
          { id: 'shadow', name: 'Shadow Mode', icon: Ghost, color: 'text-slate-600', bg: 'bg-slate-200', desc: 'Personalized exercises tailored to your level', badge: 'AI Adaptive' },
        ].map((mod) => (
          <button
            key={mod.name}
            onClick={() => {
              if (mod.path) navigate(mod.path);
              else changeTab(mod.id);
            }}
            className="group relative bg-white p-6 rounded-3xl border-b-8 border-slate-200 shadow-sm hover:border-indigo-400 transition-all text-left overflow-hidden flex flex-col justify-between aspect-[4/3]"
          >
            <div className="flex justify-between items-start">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", mod.bg)}>
                <mod.icon className={cn("w-6 h-6", mod.color)} />
              </div>
              {mod.badge && (
                <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 rounded-md">
                  {mod.badge}
                </span>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="font-black text-lg text-indigo-950 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{mod.name}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-snug">{mod.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderReadingLab = () => (
    <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden h-full">
      {/* Left: Reading Passage Area */}
      <section className="col-span-8 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden relative">
          
          <div className="flex justify-between items-start mb-8 shrink-0">
            <div>
              <h2 className="text-3xl font-black leading-none text-indigo-950 tracking-tight">{currentLesson.title}</h2>
              <p className="text-slate-400 mt-2 font-medium">Difficulty: {currentLesson.difficulty} • {currentLesson.wordsCount} words</p>
            </div>
            <button 
              onClick={() => handleSpeak(currentLesson.speakAll)}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <Volume2 className="w-5 h-5 text-indigo-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 text-lg leading-relaxed font-medium pb-10">
            {currentLesson.content.map((line, i) => (
              <div className="mb-6" key={i}>
                <p className="text-slate-700">
                  <span className="font-bold text-indigo-900">{line.speaker}:</span> {line.german}
                  {line.germanClickable1 && (
                    <span 
                      onClick={() => handleWordClick(line.germanClickable1.original, line.germanClickable1.def, line.germanClickable1.context)}
                      className="bg-indigo-100 text-indigo-900 border-b-2 border-indigo-400 cursor-pointer hover:bg-indigo-200 px-1 rounded-t-sm"
                    >
                      {line.germanClickable1.original}
                    </span>
                  )}
                  {line.german2}
                  {line.germanClickable2 && (
                    <span 
                      onClick={() => handleWordClick(line.germanClickable2.original, line.germanClickable2.def, line.germanClickable2.context)}
                      className="bg-yellow-100 text-yellow-900 border-b-2 border-yellow-400 cursor-pointer hover:bg-yellow-200 px-1 rounded-t-sm"
                    >
                      {line.germanClickable2.original}
                    </span>
                  )}
                  {line.german3}
                </p>
                <p className="text-slate-500 text-base mt-2 font-normal italic">
                  <span className="font-semibold text-slate-600">{line.speaker}:</span> {line.english}
                </p>
              </div>
            ))}
          </div>
          
          {/* Bottom Action Area */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end shrink-0 relative z-10">
            <button 
              onClick={handleNextLesson}
              disabled={currentLessonIndex === lessons.length - 1}
              className={cn(
                "px-6 py-3 font-bold rounded-xl transition-colors flex items-center gap-2",
                currentLessonIndex === lessons.length - 1 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
              )}
            >
              Next Lesson
            </button>
          </div>

          {/* Gradient overlay for text scroll */}
          <div className="absolute bottom-20 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl"></div>
        </div>
      </section>

      {/* Right: AI Tools & Sidebar */}
      <section className="col-span-4 flex flex-col gap-6 h-full overflow-y-auto pb-6">
        
        {/* Word Translation Card */}
        {selectedWord ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-lg shadow-indigo-100 relative shrink-0">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
              AI Assistant
            </div>
            
            <div className="mt-2">
              <h3 className="text-2xl font-black text-indigo-950">{selectedWord.word}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Definition</p>
              
              <div className="my-4 pt-4 border-t border-slate-100">
                <p className="font-bold text-slate-800">{selectedWord.def}</p>
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedWord.context}
                </p>
              </div>
              
              <button className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Save to Vocab Forge
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-3xl p-6 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center shrink-0 min-h-[200px]">
            <BrainCircuit className="w-8 h-8 text-slate-400 mb-3" />
            <p className="text-slate-500 font-bold">Click on highlighted words to get AI translations and context.</p>
          </div>
        )}

        {/* Comprehension Questions */}
        <div className="bg-white rounded-3xl p-6 border-b-8 border-slate-200 shadow-sm flex-1 flex flex-col min-h-[300px]">
          <h3 className="font-black text-indigo-950 uppercase tracking-tight mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Quick Check
          </h3>
          
          <div className="space-y-4 flex-1">
            {currentLesson.questions.map((q, qIndex) => (
              <div 
                key={qIndex} 
                className={cn(
                  "p-4 rounded-2xl border-2 transition-colors relative overflow-hidden",
                  selectedAnswers[qIndex] !== undefined 
                    ? (selectedAnswers[qIndex] === q.correct ? "bg-emerald-50 border-emerald-400" : "bg-red-50 border-red-400")
                    : "bg-white border-slate-200 hover:border-indigo-300"
                )}
              >
                {selectedAnswers[qIndex] !== undefined && (
                  <div className={cn(
                    "absolute top-0 left-0 bottom-0 w-1",
                    selectedAnswers[qIndex] === q.correct ? "bg-emerald-400" : "bg-red-400"
                  )}></div>
                )}
                <p className="font-bold text-slate-900 text-sm">{qIndex + 1}. {q.q}</p>
                
                <div className="mt-4 flex gap-2">
                  {q.answers.map((ans, aIndex) => (
                    <button 
                      key={aIndex}
                      onClick={() => {
                        setSelectedAnswers(prev => ({ ...prev, [qIndex]: aIndex }));
                        if (aIndex === q.correct) {
                          awardXP(5);
                        }
                      }}
                      disabled={selectedAnswers[qIndex] !== undefined}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-left flex-1 border",
                        selectedAnswers[qIndex] !== undefined 
                          ? (aIndex === q.correct 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                              : (selectedAnswers[qIndex] === aIndex ? "bg-red-100 text-red-800 border-red-200" : "bg-slate-50 text-slate-400 border-slate-100"))
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      )}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const writingTasks = [
    { english: "Hello, my name is Anna.", german: "Hallo, ich heiße Anna." },
    { english: "I come from Berlin.", german: "Ich komme aus Berlin." },
    { english: "I would like a coffee with milk.", german: "Ich hätte gerne einen Kaffee mit Milch." }
  ];
  
  const currentWriting = writingTasks[currentWritingIndex];
  
  const handleCheckWriting = () => {
    if (writingInput.trim().toLowerCase() === currentWriting.german.toLowerCase()) {
      setWritingFeedback('correct');
      awardXP(10);
    } else {
      setWritingFeedback('incorrect');
    }
  };
  
  const handleNextWriting = () => {
    if (currentWritingIndex < writingTasks.length - 1) {
      setCurrentWritingIndex(currentWritingIndex + 1);
      setWritingInput('');
      setWritingFeedback('idle');
    }
  };

  const renderWritingStudio = () => (
    <div className="flex-1 p-6 flex items-center justify-center overflow-hidden h-full">
      <div className="bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm w-full max-w-3xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black leading-none text-indigo-950 tracking-tight">Translate to German</h2>
            <p className="text-slate-400 mt-2 font-medium">Writing Practice • A1 Beginner</p>
          </div>
          <div className="text-2xl font-bold text-slate-300">
            {currentWritingIndex + 1} / {writingTasks.length}
          </div>
        </div>
        
        <div className="w-full mb-8">
          <p className="text-2xl font-semibold text-slate-800 text-center mb-8">"{currentWriting.english}"</p>
          
          <textarea 
            value={writingInput}
            onChange={(e) => {
              setWritingInput(e.target.value);
              setWritingFeedback('idle');
            }}
            placeholder="Type your German translation here..."
            className={cn(
              "w-full p-6 text-xl font-medium bg-slate-50 border-2 rounded-2xl outline-none resize-none min-h-[150px] transition-colors",
              writingFeedback === 'idle' ? "border-slate-200 focus:border-indigo-400" :
              writingFeedback === 'correct' ? "border-emerald-400 bg-emerald-50 text-emerald-900" :
              "border-red-400 bg-red-50 text-red-900"
            )}
          />
        </div>
        
        {writingFeedback !== 'idle' && (
          <div className={cn(
            "w-full p-4 rounded-xl mb-6 flex items-center gap-3 font-bold",
            writingFeedback === 'correct' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {writingFeedback === 'correct' ? (
              <>
                <Check className="w-6 h-6" />
                Excellent! That is correct.
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6" />
                Not quite. The correct translation is: {currentWriting.german}
              </>
            )}
          </div>
        )}
        
        <div className="w-full flex justify-end gap-4">
          {writingFeedback === 'idle' ? (
            <button 
              onClick={handleCheckWriting}
              disabled={!writingInput.trim()}
              className="px-8 py-4 font-bold rounded-xl transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button 
              onClick={handleNextWriting}
              disabled={currentWritingIndex === writingTasks.length - 1}
              className="px-8 py-4 font-bold rounded-xl transition-colors bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Exercise
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const listeningTasks = [
    { text: "Guten Morgen", audio: "Guten Morgen" },
    { text: "Ich komme aus Berlin", audio: "Ich komme aus Berlin" },
    { text: "Wie geht es dir?", audio: "Wie geht es dir?" }
  ];

  const renderListeningDojo = () => (
    <div className="flex-1 p-6 flex items-center justify-center overflow-hidden h-full">
      <div className="bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm w-full max-w-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black leading-none text-indigo-950 tracking-tight mb-2">Listening Dojo</h2>
        <p className="text-slate-400 font-medium mb-8">Listen carefully and type what you hear.</p>
        
        <button 
          onClick={() => handleSpeak(listeningTasks[0].audio)}
          className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors mb-8 shadow-inner"
        >
          <Volume2 className="w-12 h-12 text-amber-600" />
        </button>
        
        <textarea 
          value={listeningInput}
          onChange={(e) => {
            setListeningInput(e.target.value);
            setListeningFeedback('idle');
          }}
          placeholder="Type the German sentence here..."
          className={cn(
            "w-full p-6 text-xl text-center font-medium bg-slate-50 border-2 rounded-2xl outline-none resize-none min-h-[120px] transition-colors mb-6",
            listeningFeedback === 'idle' ? "border-slate-200 focus:border-amber-400" :
            listeningFeedback === 'correct' ? "border-emerald-400 bg-emerald-50 text-emerald-900" :
            "border-red-400 bg-red-50 text-red-900"
          )}
        />
        
        {listeningFeedback !== 'idle' && (
          <div className={cn(
            "w-full p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-left",
            listeningFeedback === 'correct' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {listeningFeedback === 'correct' ? (
              <>
                <Check className="w-6 h-6 shrink-0" />
                Excellent! You heard correctly.
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 shrink-0" />
                Not quite. The correct text was: {listeningTasks[0].text}
              </>
            )}
          </div>
        )}
        
        <button 
          onClick={() => {
            if (listeningFeedback === 'idle') {
              if (listeningInput.trim().toLowerCase().replace(/[?,.!]/g, '') === listeningTasks[0].text.toLowerCase().replace(/[?,.!]/g, '')) {
                setListeningFeedback('correct');
                awardXP(15);
              } else {
                setListeningFeedback('incorrect');
              }
            } else {
              setListeningInput('');
              setListeningFeedback('idle');
            }
          }}
          disabled={!listeningInput.trim()}
          className={cn(
            "px-8 py-4 font-bold rounded-xl transition-colors text-white shadow-md w-full",
            listeningFeedback === 'idle' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
          )}
        >
          {listeningFeedback === 'idle' ? "Check Answer" : "Next Audio"}
        </button>
      </div>
    </div>
  );

  const vocabWords = [
    { word: "Studentin", def: "Female student", context: "Ich bin eine Studentin." },
    { word: "Kaffee", def: "Coffee", context: "Ich hätte gerne einen Kaffee." },
    { word: "Milch", def: "Milk", context: "Ein Kaffee mit Milch." },
  ];

  const renderVocabForge = () => (
    <div className="flex-1 p-6 flex items-center justify-center h-full">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm text-center flex flex-col h-[500px]">
        <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tight mb-2">Vocabulary Forge</h2>
        <p className="text-slate-400 font-medium mb-6">{vocabIndex + 1} / {vocabWords.length} words to review</p>
        
        <div 
          onClick={() => setVocabFlipped(!vocabFlipped)}
          className="flex-1 bg-slate-50 rounded-3xl border-2 border-slate-200 flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-slate-100 transition-colors p-6 relative"
        >
           {!vocabFlipped ? (
             <>
               <p className="text-4xl font-black text-indigo-900 mb-2">{vocabWords[vocabIndex].word}</p>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4 flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4" /> Tap to flip
               </p>
             </>
           ) : (
             <>
               <p className="text-2xl font-black text-emerald-700 mb-2">{vocabWords[vocabIndex].def}</p>
               <p className="text-slate-500 text-sm mt-4 italic">"{vocabWords[vocabIndex].context}"</p>
             </>
           )}
        </div>
        
        {vocabFlipped && (
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setVocabFlipped(false);
                setVocabIndex((i) => (i + 1) % vocabWords.length);
              }}
              className="flex-1 py-4 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors"
            >
              Hard
            </button>
            <button 
              onClick={() => {
                awardXP(2);
                setVocabFlipped(false);
                setVocabIndex((i) => (i + 1) % vocabWords.length);
              }}
              className="flex-1 py-4 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors shadow-md shadow-emerald-100"
            >
              Easy (+2 XP)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderShadowMode = () => (
    <div className="flex-1 p-6 flex items-center justify-center h-full">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm text-center flex flex-col items-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2 flex items-center justify-center gap-2">
          <Ghost className="w-8 h-8 text-slate-500" /> Shadow Mode
        </h2>
        <p className="text-slate-400 font-medium mb-8">Listen and repeat exactly what you hear.</p>
        
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8 w-full">
          <button 
            onClick={() => handleSpeak(shadowTasks[shadowIndex].text)}
            className="w-20 h-20 mx-auto rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors shadow-inner mb-4"
          >
            <Volume2 className="w-10 h-10 text-slate-600" />
          </button>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Listen</p>
        </div>
        
        <div className="flex flex-col items-center w-full relative">
          <button
            onClick={() => {
              if (isShadowListening) {
                if (shadowRecognitionRef.current) shadowRecognitionRef.current.stop();
                setIsShadowListening(false);
              } else {
                setShadowInput('');
                setShadowFeedback('idle');
                setIsShadowListening(true);
                if (shadowRecognitionRef.current) shadowRecognitionRef.current.start();
              }
            }}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-md mb-6 relative z-10",
              isShadowListening ? "bg-red-500 text-white animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105"
            )}
          >
            <Mic className="w-10 h-10" />
          </button>
          <p className="text-sm font-bold uppercase tracking-widest mb-6 h-4 text-slate-400">
            {isShadowListening ? "Recording..." : "Tap to Speak"}
          </p>
          
          <div className="w-full min-h-[60px] bg-white rounded-xl flex items-center justify-center p-4">
             {shadowInput ? (
               <p className="text-xl font-medium text-slate-700">"{shadowInput}"</p>
             ) : (
               <p className="text-xl text-slate-300 italic">Waiting for your voice...</p>
             )}
          </div>
        </div>
        
        {shadowFeedback !== 'idle' && (
          <div className={cn(
            "w-full p-4 rounded-xl mt-6 flex items-center gap-3 font-bold text-left",
            shadowFeedback === 'correct' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {shadowFeedback === 'correct' ? (
              <>
                <Check className="w-6 h-6 shrink-0" />
                Perfect! You nailed it.
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 shrink-0" />
                Not quite. The correct text was: {shadowTasks[shadowIndex].text}
              </>
            )}
          </div>
        )}
        
        {shadowFeedback !== 'idle' && (
           <button
             onClick={() => {
               setShadowInput('');
               setShadowFeedback('idle');
               if (shadowFeedback === 'correct') {
                 setShadowIndex((i) => (i + 1) % shadowTasks.length);
               }
             }}
             className={cn("mt-6 px-8 py-4 w-full font-bold text-white rounded-xl transition-colors", 
               shadowFeedback === 'correct' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-500 hover:bg-slate-600"
             )}
           >
             {shadowFeedback === 'correct' ? "Next Phrase" : "Try Again"}
           </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 font-sans flex overflow-hidden text-slate-800">
      {/* Sidebar Nav */}
      <nav className="w-20 bg-indigo-900 flex flex-col items-center py-6 gap-8 border-r border-indigo-800 shrink-0">
        {/* Logo */}
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        
        {/* Nav Links */}
        <div className="flex flex-col gap-6 w-full items-center flex-1 mt-4">
          <button 
            onClick={() => changeTab('home')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'home' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <Home className={cn("w-6 h-6", activeTab === 'home' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => changeTab('reading')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'reading' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <BookOpen className={cn("w-6 h-6", activeTab === 'reading' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => changeTab('writing')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'writing' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <PenTool className={cn("w-6 h-6", activeTab === 'writing' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => changeTab('listening')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'listening' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <Headphones className={cn("w-6 h-6", activeTab === 'listening' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => changeTab('vocab')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'vocab' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <BrainCircuit className={cn("w-6 h-6", activeTab === 'vocab' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => changeTab('shadow')}
            className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", activeTab === 'shadow' ? "bg-indigo-800 border-l-4 border-orange-500 shadow-inner" : "hover:bg-indigo-800/50")}
          >
            <Ghost className={cn("w-6 h-6", activeTab === 'shadow' ? "text-orange-400" : "text-indigo-400")} />
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="w-12 h-12 rounded-xl hover:bg-indigo-800/50 flex items-center justify-center transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </button>
        </div>
        
        {/* Profile */}
        <button 
          onClick={() => auth.signOut()}
          title="Sign Out"
          className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-400 hover:bg-indigo-300 transition-colors"
        >
          <span className="text-indigo-800 font-bold text-sm">JS</span>
        </button>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">
              Student Portal {activeTab === 'reading' && <span className="text-orange-500">/ Reading Lab</span>}
              {activeTab === 'writing' && <span className="text-blue-500">/ Writing Studio</span>}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Target: A1 Beginner • German
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full border border-orange-200">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-600 tracking-wide">{profile.streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-600 tracking-wide">{profile.xp} XP</span>
            </div>
          </div>
        </header>

        {activeTab === 'home' && renderHome()}
        {activeTab === 'reading' && renderReadingLab()}
        {activeTab === 'writing' && renderWritingStudio()}
        {activeTab === 'listening' && renderListeningDojo()}
        {activeTab === 'vocab' && renderVocabForge()}
        {activeTab === 'shadow' && renderShadowMode()}
        {activeTab !== 'home' && activeTab !== 'reading' && activeTab !== 'writing' && activeTab !== 'listening' && activeTab !== 'vocab' && activeTab !== 'shadow' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <BrainCircuit className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-400">Coming Soon</h2>
          </div>
        )}
      </main>
    </div>
  );
}
