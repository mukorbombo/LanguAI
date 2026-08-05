import React, { useState } from 'react';
import { Book, Type, Hash, AlignLeft, Layers, UserCircle, Volume2 } from 'lucide-react';
import { cn } from './lib/utils';

export default function FoundationsModule() {
  const [activeTopic, setActiveTopic] = useState('nouns');

  const topics = [
    { id: 'nouns', label: 'Nouns', icon: Layers },
    { id: 'verbs', label: 'Verbs', icon: AlignLeft },
    { id: 'adjectives', label: 'Adjectives', icon: Book },
    { id: 'pronouns', label: 'Pronouns', icon: UserCircle },
    { id: 'numbers', label: 'Numbers (1-100k)', icon: Hash },
    { id: 'alphabet', label: 'Alphabet (A-Z)', icon: Type },
  ];

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderContent = () => {
    switch(activeTopic) {
      case 'nouns':
        return <WordList title="Common Nouns" words={[{de: "das Haus", en: "the house"}, {de: "der Hund", en: "the dog"}, {de: "die Katze", en: "the cat"}, {de: "das Auto", en: "the car"}, {de: "der Baum", en: "the tree"}, {de: "die Frau", en: "the woman"}, {de: "der Mann", en: "the man"}, {de: "das Kind", en: "the child"}, {de: "das Buch", en: "the book"}, {de: "die Stadt", en: "the city"}]} onSpeak={handleSpeak} />;
      case 'verbs':
        return <WordList title="Common Verbs" words={[{de: "sein", en: "to be"}, {de: "haben", en: "to have"}, {de: "werden", en: "to become"}, {de: "können", en: "can / to be able to"}, {de: "machen", en: "to do / make"}, {de: "gehen", en: "to go"}, {de: "sagen", en: "to say"}, {de: "sehen", en: "to see"}, {de: "kommen", en: "to come"}, {de: "wollen", en: "to want"}]} onSpeak={handleSpeak} />;
      case 'adjectives':
        return <WordList title="Common Adjectives" words={[{de: "gut", en: "good"}, {de: "groß", en: "big"}, {de: "klein", en: "small"}, {de: "neu", en: "new"}, {de: "alt", en: "old"}, {de: "schön", en: "beautiful"}, {de: "schnell", en: "fast"}, {de: "langsam", en: "slow"}, {de: "heiß", en: "hot"}, {de: "kalt", en: "cold"}]} onSpeak={handleSpeak} />;
      case 'pronouns':
        return <WordList title="Personal Pronouns" words={[{de: "ich", en: "I"}, {de: "du", en: "you (informal singular)"}, {de: "er", en: "he"}, {de: "sie", en: "she / they"}, {de: "es", en: "it"}, {de: "wir", en: "we"}, {de: "ihr", en: "you (informal plural)"}, {de: "Sie", en: "you (formal)"}, {de: "mich", en: "me (accusative)"}, {de: "mir", en: "me (dative)"}]} onSpeak={handleSpeak} />;
      case 'numbers':
        return <NumbersList onSpeak={handleSpeak} />;
      case 'alphabet':
        return <AlphabetList onSpeak={handleSpeak} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col overflow-hidden h-full max-w-5xl mx-auto w-full">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Language Foundations</h2>
        <p className="text-slate-500 font-medium mt-1">Master the building blocks of the language.</p>
      </div>
      
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(topic.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
              activeTopic === topic.id 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border-2 border-transparent hover:border-slate-200"
            )}
          >
            <topic.icon className="w-5 h-5" />
            {topic.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 border-b-8 border-slate-200 shadow-sm flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

function WordList({ title, words, onSpeak }: { title: string, words: {de: string, en: string}[], onSpeak: (t: string) => void }) {
  return (
    <div>
      <h3 className="text-2xl font-black text-slate-800 mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {words.map((w, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
            <div>
              <p className="text-xl font-bold text-indigo-950">{w.de}</p>
              <p className="text-slate-500 font-medium">{w.en}</p>
            </div>
            <button 
              onClick={() => onSpeak(w.de)}
              className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors shrink-0"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumbersList({ onSpeak }: { onSpeak: (t: string) => void }) {
  const numbers = [
    { num: "0", de: "null" },
    { num: "1", de: "eins" },
    { num: "2", de: "zwei" },
    { num: "3", de: "drei" },
    { num: "4", de: "vier" },
    { num: "5", de: "fünf" },
    { num: "6", de: "sechs" },
    { num: "7", de: "sieben" },
    { num: "8", de: "acht" },
    { num: "9", de: "neun" },
    { num: "10", de: "zehn" },
    { num: "11", de: "elf" },
    { num: "12", de: "zwölf" },
    { num: "20", de: "zwanzig" },
    { num: "21", de: "einundzwanzig" },
    { num: "30", de: "dreißig" },
    { num: "40", de: "vierzig" },
    { num: "50", de: "fünfzig" },
    { num: "100", de: "hundert" },
    { num: "1.000", de: "tausend" },
    { num: "10.000", de: "zehntausend" },
    { num: "100.000", de: "hunderttausend" }
  ];

  return (
    <div>
      <h3 className="text-2xl font-black text-slate-800 mb-6">Numbers (1 - 100,000)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {numbers.map((n, i) => (
          <button
            key={i}
            onClick={() => onSpeak(n.de)}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center group"
          >
            <span className="text-3xl font-black text-indigo-950 mb-1">{n.num}</span>
            <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">{n.de}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
        <h4 className="font-bold text-blue-900 mb-2">Number Building Rules</h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>13 to 19: Add "-zehn" to the unit (e.g. vierzehn)</li>
          <li>21 to 99: Say the unit first, then "und", then the ten (e.g. einundzwanzig = 21)</li>
          <li>Write numbers less than 1,000,000 as one single word.</li>
        </ul>
      </div>
    </div>
  );
}

function AlphabetList({ onSpeak }: { onSpeak: (t: string) => void }) {
  const letters = [
    { l: "A a", sound: "[ah]" }, { l: "B b", sound: "[bay]" }, { l: "C c", sound: "[tsay]" }, 
    { l: "D d", sound: "[day]" }, { l: "E e", sound: "[ay]" }, { l: "F f", sound: "[eff]" }, 
    { l: "G g", sound: "[gay]" }, { l: "H h", sound: "[hah]" }, { l: "I i", sound: "[ee]" }, 
    { l: "J j", sound: "[yot]" }, { l: "K k", sound: "[kah]" }, { l: "L l", sound: "[ell]" }, 
    { l: "M m", sound: "[em]" }, { l: "N n", sound: "[en]" }, { l: "O o", sound: "[oh]" }, 
    { l: "P p", sound: "[pay]" }, { l: "Q q", sound: "[koo]" }, { l: "R r", sound: "[err]" }, 
    { l: "S s", sound: "[ess]" }, { l: "T t", sound: "[tay]" }, { l: "U u", sound: "[oo]" }, 
    { l: "V v", sound: "[fow]" }, { l: "W w", sound: "[vay]" }, { l: "X x", sound: "[iks]" }, 
    { l: "Y y", sound: "[ypsilon]" }, { l: "Z z", sound: "[tset]" },
    { l: "Ä ä", sound: "[eh]" }, { l: "Ö ö", sound: "[uuh]" }, { l: "Ü ü", sound: "[ew]" }, 
    { l: "ß", sound: "[ess-tset]" }
  ];

  return (
    <div>
      <h3 className="text-2xl font-black text-slate-800 mb-6">The Alphabet</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {letters.map((letObj, i) => (
          <button
            key={i}
            onClick={() => onSpeak(letObj.l.split(' ')[0])}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center group"
          >
            <span className="text-3xl font-black text-indigo-950 mb-1">{letObj.l}</span>
            <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">{letObj.sound}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
