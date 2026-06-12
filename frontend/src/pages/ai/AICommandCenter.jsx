import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, Bot, User, ArrowRight, Zap, Brain, BarChart2, Rocket, ExternalLink } from 'lucide-react';
import { aiAPI } from '../../api/ai';

const starters = [
  { text: 'Bring back inactive customers', icon: '🔥', desc: 'Re-engage churning users' },
  { text: 'Increase repeat purchases', icon: '🔄', desc: 'Boost customer lifetime value' },
  { text: 'Promote summer collection', icon: '☀️', desc: 'Seasonal campaign strategy' },
  { text: 'Reward my top customers', icon: '⭐', desc: 'VIP loyalty campaign' },
];

// Render markdown-like bold text
function renderText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AICommandCenter() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memoriesUsed, setMemoriesUsed] = useState(0);
  const [lastCampaign, setLastCampaign] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.command(msg, newMessages.slice(-8));
      const fullText = res.data.response;
      setMemoriesUsed(res.data.memories_used || 0);

      // Check if a campaign was created
      if (res.data.campaign_created) {
        setLastCampaign(res.data.campaign_created);
      }

      // Typewriter effect
      setMessages([...newMessages, { role: 'assistant', content: '', campaign: res.data.campaign_created || null }]);
      let i = 0;
      const typeInterval = setInterval(() => {
        i += 3;
        if (i >= fullText.length) {
          clearInterval(typeInterval);
          setMessages([...newMessages, { role: 'assistant', content: fullText, campaign: res.data.campaign_created || null }]);
          setLoading(false);
        } else {
          setMessages([...newMessages, { role: 'assistant', content: fullText.slice(0, i), campaign: res.data.campaign_created || null }]);
        }
      }, 15);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2.5 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">AI Command Center</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-slate-400">Powered by PulseAI Memory Engine</p>
            </div>
          </div>
        </div>
        {memoriesUsed > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="badge badge-info text-xs"
          >
            <Brain size={12} /> {memoriesUsed} memories active
          </motion.span>
        )}
      </motion.div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto card p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-5 shadow-md"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Sparkles size={32} className="text-primary-500" />
            </motion.div>
            <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">What's your marketing goal?</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md">
              Tell me what you want to achieve and I'll create a data-driven campaign strategy with audience targeting, channel selection, and message crafting.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              {starters.map((s, i) => (
                <motion.button
                  key={s.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(99, 102, 241, 0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(s.text)}
                  className="card-interactive p-4 text-left group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-xs text-primary-500 font-semibold group-hover:text-primary-600">Suggest</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{s.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* Capability badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 mt-8"
            >
              {[
                { icon: Brain, text: 'Memory Engine' },
                { icon: BarChart2, text: 'Data Driven' },
                { icon: Zap, text: 'Instant Plans' },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <b.icon size={12} /> {b.text}
                </span>
              ))}
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-md"
                >
                  <Bot size={14} className="text-white" />
                </motion.div>
              )}
              <div className="max-w-[70%]">
                <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>{renderText(line)}</p>
                  ))}
                  {msg.role === 'assistant' && msg.content === '' && loading && (
                    <span className="inline-block w-1 h-4 bg-primary-400 animate-pulse ml-0.5" />
                  )}
                </div>

                {/* Campaign Created Card */}
                {msg.role === 'assistant' && msg.campaign && msg.content && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="mt-3 p-4 bg-gradient-to-r from-emerald-50 to-primary-50 border border-emerald-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"
                      >
                        <Rocket size={14} className="text-white" />
                      </motion.div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Campaign Created</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">{msg.campaign.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span>📨 {(msg.campaign.channel || 'email').toUpperCase()}</span>
                      <span>👥 {msg.campaign.predicted_reach || 0} reach</span>
                      <span>💰 ₹{(msg.campaign.predicted_revenue || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/campaigns/${msg.campaign.id}`)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View Campaign <ExternalLink size={12} />
                    </motion.button>
                  </motion.div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex gap-1.5">
                  {[0, 1, 2].map(d => (
                    <motion.span
                      key={d}
                      className="w-2.5 h-2.5 bg-primary-400 rounded-full"
                      animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: d * 0.15, ease: 'easeInOut' }}
                    />
                  ))}
                </span>
                <motion.span
                  className="text-xs"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  PulseAI is thinking...
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4"
      >
        <div className="flex items-end gap-3 bg-white border border-slate-200 rounded-2xl p-2 shadow-card focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-300 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Tell PulseAI your marketing goal..."
            className="flex-1 resize-none border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 py-2 px-3 max-h-32 bg-transparent"
            style={{ minHeight: '40px' }}
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-40 flex-shrink-0"
            style={{ boxShadow: input.trim() ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none' }}
          >
            <Send size={16} />
          </motion.button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </motion.div>
    </div>
  );
}
