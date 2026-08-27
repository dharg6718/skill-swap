import { useState } from 'react';
import { Bot, Send, Sparkles, UserRound, RotateCcw } from 'lucide-react';
import { sendChatMessage } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';

const starterQuestions = [
  'How do I find the best person to learn from?',
  'How can I improve my profile match score?',
  'What should I include in my first swap request?'
];

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (question = input) => {
    const content = question.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(nextMessages);
      if (response.success) {
        setMessages([...nextMessages, { role: 'assistant', content: response.data.answer }]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'I could not answer right now. Please try again.';
      setMessages([...nextMessages, { role: 'assistant', content: message, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <div className="rounded-2xl overflow-hidden bg-slate-950 text-white shadow-xl shadow-slate-900/10">
        <div className="px-6 py-7 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-900">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300 mb-3"><Sparkles size={14} /> SkillSwap Coach</div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your guide to better skill exchanges.</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">Ask about matching, profiles, requests, sessions, or how to make your next learning exchange count.</p>
          </div>
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"><RotateCcw size={15} /> New chat</button>
        </div>

        <div className="bg-white text-slate-900 min-h-[480px] flex flex-col">
          <div className="flex-1 p-5 sm:p-8 space-y-5 overflow-y-auto max-h-[560px]">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto py-8 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Bot size={28} /></div>
                <h2 className="mt-5 text-xl font-bold">What are you working on, {user?.name?.split(' ')[0] || 'there'}?</h2>
                <p className="text-sm text-slate-500 mt-2">Start with a question or choose a prompt below.</p>
                <div className="mt-7 grid gap-3 text-left">
                  {starterQuestions.map((question) => <button key={question} onClick={() => ask(question)} className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors">{question}</button>)}
                </div>
              </div>
            ) : messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Bot size={17} /></div>}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${message.role === 'user' ? 'bg-slate-900 text-white rounded-br-md' : message.error ? 'bg-rose-50 text-rose-700 border border-rose-100 rounded-bl-md' : 'bg-slate-100 text-slate-700 rounded-bl-md'}`}>{message.content}</div>
                {message.role === 'user' && <div className="h-8 w-8 shrink-0 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center"><UserRound size={17} /></div>}
              </div>
            ))}
            {loading && <div className="flex items-center gap-3 text-sm text-slate-500"><div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Bot size={17} /></div><span className="animate-pulse">Thinking through your SkillSwap question...</span></div>}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="border-t border-slate-200 p-4 sm:p-5 flex gap-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your SkillSwap Coach..." className="input-field" disabled={loading} maxLength={4000} />
            <button type="submit" aria-label="Send message" disabled={loading || !input.trim()} className="btn-primary px-4"><Send size={17} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
