'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import type { DepositRequest, DepositStatus } from '@/types/database.types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

type Filter = 'all' | DepositStatus;

export default function AdminDepositsPage() {
  const supabase = createClient();
  const [deposits, setDeposits]     = useState<DepositRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>('pending');
  const [selected, setSelected]     = useState<DepositRequest | null>(null);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote]   = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadDeposits(); }, [filter]);

  async function loadDeposits() {
    setLoading(true);
    let q = supabase
      .from('deposit_requests')
      .select('*, profiles(username, full_name, phone)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') q = q.eq('status', filter);

    const { data } = await q;
    setDeposits(data || []);
    setLoading(false);
  }

  async function handleApprove() {
    if (!selected) return;
    setProcessing(true);
    const { error } = await supabase.rpc('approve_deposit', {
      deposit_id: selected.id,
      admin_uid:  (await supabase.auth.getUser()).data.user?.id,
      admin_note: adminNote || null,
    });
    setProcessing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Depo ${formatCurrency(selected.amount)} apwouve!`);
    setActionModal(null); setSelected(null); setAdminNote('');
    loadDeposits();
  }

  async function handleReject() {
    if (!selected) return;
    setProcessing(true);
    const { error } = await supabase.rpc('reject_deposit', {
      deposit_id: selected.id,
      admin_uid:  (await supabase.auth.getUser()).data.user?.id,
      admin_note: adminNote || null,
    });
    setProcessing(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Depo refize.');
    setActionModal(null); setSelected(null); setAdminNote('');
    loadDeposits();
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'pending',  label: 'An Atant' },
    { value: 'approved', label: 'Apwouve' },
    { value: 'rejected', label: 'Refize' },
    { value: 'all',      label: 'Tout' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Depo / Dépôts</h1>
        <button onClick={loadDeposits} className="text-xs text-brand-gold hover:underline">Rechaje</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-brand-gold text-bg-base'
                : 'bg-bg-muted border border-bg-border text-gray-400 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-400">Chajman...</p>
        ) : deposits.length === 0 ? (
          <p className="text-center py-12 text-gray-400">Pa gen demann</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  {['Itilizatè', 'Montan', 'Metòd', 'Referans', 'Dat', 'Estati', 'Aksyon'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id} className="border-b border-bg-border hover:bg-bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{(d as any).profiles?.username || '—'}</p>
                        <p className="text-xs text-gray-500">{(d as any).profiles?.phone || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-gold">{formatCurrency(d.amount)}</td>
                    <td className="px-4 py-3 text-gray-300">{PAYMENT_METHOD_LABELS[d.payment_method]}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{d.reference_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={d.status as any}>{d.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {d.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => { setSelected(d); setActionModal('approve'); }}
                            className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors" title="Apwouve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => { setSelected(d); setActionModal('reject'); }}
                            className="p-1.5 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors" title="Refize">
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setSelected(d)}
                          className="p-1.5 rounded-lg bg-bg-muted text-gray-400 hover:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal open={actionModal === 'approve'} onClose={() => { setActionModal(null); setSelected(null); setAdminNote(''); }}
        title={`Apwouve Depo — ${selected ? formatCurrency(selected.amount) : ''}`}>
        <div className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
            <p className="text-sm text-white">
              Ou pral kreye <span className="font-bold text-brand-gold">{selected ? formatCurrency(selected.amount) : ''}</span> pou{' '}
              <span className="font-bold">{(selected as any)?.profiles?.username}</span> via{' '}
              {selected ? PAYMENT_METHOD_LABELS[selected.payment_method] : ''}.
            </p>
            <p className="text-xs text-gray-400 mt-1">Referans: {selected?.reference_number || '—'}</p>
          </div>
          <Input label="Nòt Admin (opsyonèl)" value={adminNote} onChange={e => setAdminNote(e.target.value)}
            placeholder="Tout bagay bon..." />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setActionModal(null); setAdminNote(''); }}>Anile</Button>
            <Button className="flex-1" loading={processing} onClick={handleApprove}>
              ✓ Apwouve Depo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={actionModal === 'reject'} onClose={() => { setActionModal(null); setSelected(null); setAdminNote(''); }}
        title={`Refize Depo — ${selected ? formatCurrency(selected.amount) : ''}`}>
        <div className="space-y-4">
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl">
            <p className="text-sm text-white">
              Ou pral refize demann depo pou <span className="font-bold">{(selected as any)?.profiles?.username}</span>.
            </p>
          </div>
          <Input label="Rezon Refi (obligatwa pou itilizatè a)" value={adminNote}
            onChange={e => setAdminNote(e.target.value)} placeholder="Referans pa valid..." required />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setActionModal(null); setAdminNote(''); }}>Anile</Button>
            <Button variant="danger" className="flex-1" loading={processing} onClick={handleReject}>
              ✕ Refize Depo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
