'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import type { WithdrawalRequest, WithdrawalStatus } from '@/types/database.types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

type Filter = 'all' | WithdrawalStatus;

export default function AdminWithdrawalsPage() {
  const supabase = createClient();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<Filter>('pending');
  const [selected, setSelected]       = useState<WithdrawalRequest | null>(null);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | null>(null);
  const [txRef, setTxRef]             = useState('');
  const [adminNote, setAdminNote]     = useState('');
  const [processing, setProcessing]   = useState(false);

  useEffect(() => { loadWithdrawals(); }, [filter]);

  async function loadWithdrawals() {
    setLoading(true);
    let q = supabase
      .from('withdrawal_requests')
      .select('*, profiles(username, full_name, phone)')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setWithdrawals(data || []);
    setLoading(false);
  }

  async function handleApprove() {
    if (!selected) return;
    setProcessing(true);
    const { error } = await supabase.rpc('approve_withdrawal', {
      withdrawal_id: selected.id,
      admin_uid:     (await supabase.auth.getUser()).data.user?.id,
      tx_ref:        txRef || null,
      admin_note:    adminNote || null,
    });
    setProcessing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Retrè ${formatCurrency(selected.amount)} apwouve!`);
    setActionModal(null); setSelected(null); setTxRef(''); setAdminNote('');
    loadWithdrawals();
  }

  async function handleReject() {
    if (!selected) return;
    setProcessing(true);
    const { error } = await supabase.rpc('reject_withdrawal', {
      withdrawal_id: selected.id,
      admin_uid:     (await supabase.auth.getUser()).data.user?.id,
      admin_note:    adminNote || null,
    });
    setProcessing(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Retrè refize.');
    setActionModal(null); setSelected(null); setAdminNote('');
    loadWithdrawals();
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'pending',    label: 'An Atant' },
    { value: 'processing', label: 'Ap Trete' },
    { value: 'completed',  label: 'Konplete' },
    { value: 'rejected',   label: 'Refize' },
    { value: 'all',        label: 'Tout' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Retrè / Retraits</h1>
        <button onClick={loadWithdrawals} className="text-xs text-brand-gold hover:underline">Rechaje</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value ? 'bg-brand-gold text-bg-base' : 'bg-bg-muted border border-bg-border text-gray-400 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-400">Chajman...</p>
        ) : withdrawals.length === 0 ? (
          <p className="text-center py-12 text-gray-400">Pa gen demann</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  {['Itilizatè', 'Montan', 'Metòd', 'Destinasyon', 'Dat', 'Estati', 'Aksyon'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-bg-border hover:bg-bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{(w as any).profiles?.username || '—'}</p>
                      <p className="text-xs text-gray-500">{(w as any).profiles?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-red">{formatCurrency(w.amount)}</td>
                    <td className="px-4 py-3 text-gray-300">{PAYMENT_METHOD_LABELS[w.payment_method]}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{w.destination}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(w.created_at)}</td>
                    <td className="px-4 py-3"><Badge variant={w.status as any}>{w.status}</Badge></td>
                    <td className="px-4 py-3">
                      {(w.status === 'pending' || w.status === 'processing') && (
                        <div className="flex gap-2">
                          <button onClick={() => { setSelected(w); setActionModal('approve'); }}
                            className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => { setSelected(w); setActionModal('reject'); }}
                            className="p-1.5 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={actionModal === 'approve'} onClose={() => { setActionModal(null); setSelected(null); setTxRef(''); setAdminNote(''); }}
        title={`Apwouve Retrè — ${selected ? formatCurrency(selected.amount) : ''}`}>
        <div className="space-y-4">
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <p className="text-sm text-white">
              Voye <span className="font-bold text-brand-gold">{selected ? formatCurrency(selected.amount) : ''}</span> bay{' '}
              <span className="font-bold">{selected?.destination}</span> via {selected ? PAYMENT_METHOD_LABELS[selected.payment_method] : ''}.
            </p>
            <p className="text-xs text-gray-400 mt-1">Itilizatè: {(selected as any)?.profiles?.username}</p>
          </div>
          <Input label="Referans Tranzaksyon (opsyonèl)" value={txRef} onChange={e => setTxRef(e.target.value)}
            placeholder="TX-XXXXXXXX" />
          <Input label="Nòt Admin" value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="..." />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setActionModal(null); }}>Anile</Button>
            <Button className="flex-1" loading={processing} onClick={handleApprove}>✓ Konfime Peman</Button>
          </div>
        </div>
      </Modal>

      <Modal open={actionModal === 'reject'} onClose={() => { setActionModal(null); setSelected(null); setAdminNote(''); }}
        title="Refize Retrè">
        <div className="space-y-4">
          <Input label="Rezon Refi" value={adminNote} onChange={e => setAdminNote(e.target.value)}
            placeholder="Enfòmasyon pa kòrèk..." required />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setActionModal(null)}>Anile</Button>
            <Button variant="danger" className="flex-1" loading={processing} onClick={handleReject}>✕ Refize</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
