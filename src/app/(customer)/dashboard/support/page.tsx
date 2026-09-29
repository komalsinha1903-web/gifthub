'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { 
  HelpCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  Loader2, 
  Sparkles,
  Coins,
  Truck,
  Ticket
} from 'lucide-react';

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  admin_reply?: string;
  created_at: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('crypto_payment');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
      } else if (data) {
        setTickets(data);
      }
    }
    setLoading(false);
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Your concierge ticket has been opened. Our desk verifies within minutes.');
      setSubject('');
      setMessage('');
      setTickets((prev) => [data, ...prev]);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    setSubmitting(false);
  };

  const faqs = [
    {
      q: 'How long does cryptocurrency transaction confirmation take?',
      a: 'USDT (TRC20) and ERC20 confirmations typically resolve within 3 to 10 minutes once your transaction hash is submitted to the order ledger.',
    },
    {
      q: 'How are physical luxury timepieces delivered?',
      a: 'All watches are shipped via armored, fully insured priority transport (FedEx Custom Critical / Malca-Amit) requiring adult multi-signature verification.',
    },
    {
      q: 'When do digital gift card codes unlock?',
      a: 'Once the crypto hash is verified on-chain, digital voucher codes unlock immediately inside your order details page.',
    },
  ];

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Top Header */}
      <div className="pb-6 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
          Private Client Care
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Concierge Desk &amp; Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light">
          Dedicated assistance for blockchain transactions, delivery schedules, and allocations.
        </p>
      </div>

      {/* Support Overview Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Blockchain Desk</span>
          </div>
          <p className="text-xs text-zinc-300">Hash and deposit confirmations</p>
          <span className="text-[10px] text-amber-400/90 font-mono mt-2 block">Avg response: ~5 mins</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono uppercase tracking-wider">Armored Logistics</span>
          </div>
          <p className="text-xs text-zinc-300">Courier delivery tracking &amp; customs</p>
          <span className="text-[10px] text-blue-400 font-mono mt-2 block">Direct Courier Liaison</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider">VIP Membership</span>
          </div>
          <p className="text-xs text-zinc-300">Custom timepieces sourcing</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-2 block">24/7 Priority Channel</span>
        </div>
      </div>

      {/* Split Grid: Open Ticket Form & Tickets History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Open New Ticket Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Open Concierge Ticket</h2>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Ticket Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Transaction Hash Verification for #ORD-102"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="crypto_payment">Crypto Payment</option>
                  <option value="delivery_logistics">Armored Logistics</option>
                  <option value="gift_card_codes">Digital Codes</option>
                  <option value="vip_sourcing">VIP Watch Sourcing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                Detailed Message / Blockchain Hash
              </label>
              <textarea
                required
                rows={5}
                placeholder="Provide transaction details or specific request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Transmitting Ticket...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit to Concierge Desk
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: User's Tickets History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white">Your Inquiries Ledger</h2>
              <span className="text-xs text-zinc-500 font-mono">{tickets.length} Registered</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
                <p className="text-xs font-mono">Fetching ticket status...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-3.5">
                {tickets.map((t) => {
                  const isOpen = t.status === 'open';
                  const isProgress = t.status === 'in_progress';
                  const isResolved = t.status === 'resolved';

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{t.subject}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                            isResolved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isProgress
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 font-light leading-relaxed">{t.message}</p>

                      {t.admin_reply && (
                        <div className="p-3 mt-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                            Concierge Response:
                          </span>
                          <p className="text-zinc-200">{t.admin_reply}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                        <span>Category: {t.category.replace(/_/g, ' ')}</span>
                        <span>Opened: {t.created_at ? t.created_at.split('T')[0] : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No active support tickets found. Use the form to submit an inquiry.
              </div>
            )}
          </div>

          {/* Frequently Asked Inquiries Accordion */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Frequently Addressed Inquiries</h3>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${openFaq === idx ? 'rotate-180 text-amber-400' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-3.5 pt-0 text-xs text-zinc-400 border-t border-zinc-800/40 font-light leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}