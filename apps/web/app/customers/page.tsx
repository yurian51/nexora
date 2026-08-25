'use client';

import { FormEvent, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
type Customer = { id: string; username?: string | null; fullName?: string | null; email?: string | null; phone?: string | null; isActive?: boolean; createdAt?: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', username: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  async function loadCustomers(query = search) {
    const token = window.localStorage.getItem('nexora.accessToken');
    if (!token) { setLoading(false); setError('Sign in to load live customer data.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/customers${query ? `?search=${encodeURIComponent(query)}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Unable to load customers');
      const payload = await response.json();
      setCustomers(payload.data ?? payload);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load customers'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadCustomers(''); }, []);

  async function createCustomer(event: FormEvent) {
    event.preventDefault();
    const token = window.localStorage.getItem('nexora.accessToken');
    if (!token) return setError('Sign in before creating a customer.');
    setSaving(true); setError('');
    try {
      const response = await fetch(`${API_URL}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to create customer');
      setForm({ fullName: '', username: '', email: '', phone: '' });
      await loadCustomers();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create customer'); }
    finally { setSaving(false); }
  }

  return <main className="customer-page"><header className="customer-header"><div><div className="eyebrow">NEXORA / CUSTOMER OPERATIONS</div><h1>Customers</h1><p>Manage subscribers, accounts and customer identity across your network.</p></div><button className="primary-button" onClick={() => document.getElementById('new-customer')?.scrollIntoView({ behavior: 'smooth' })}>+ New customer</button></header><section className="customer-layout"><article className="panel customer-list"><div className="list-head"><div><div className="panel-kicker">CUSTOMER DIRECTORY</div><h2>{customers.length} customers</h2></div><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadCustomers()} placeholder="Search name, username, phone..."/><button onClick={() => loadCustomers()}>Search</button></div></div>{error && <div className="notice">{error}</div>}<div className="customer-table"><div className="customer-row customer-table-head"><span>Customer</span><span>Contact</span><span>Username</span><span>Status</span><span>Joined</span></div>{loading ? <div className="empty-state">Loading customer directory…</div> : customers.length === 0 ? <div className="empty-state">No customers found in this tenant.</div> : customers.map(customer => <div className="customer-row" key={customer.id}><div className="customer-name"><span className="customer-avatar">{(customer.fullName ?? '?').slice(0,1).toUpperCase()}</span><div><strong>{customer.fullName}</strong><small>{customer.email || 'No email'}</small></div></div><span>{customer.phone || '—'}</span><span>{customer.username || '—'}</span><span><i className={customer.isActive ? 'status-dot active' : 'status-dot'}/>{customer.isActive ? 'Active' : 'Inactive'}</span><span>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}</span></div>)}</div></article><article className="panel create-panel" id="new-customer"><div className="panel-kicker">ACCOUNT PROVISIONING</div><h2>Create customer</h2><p>Register a subscriber in the current organization.</p><form onSubmit={createCustomer}><label>Full name<input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Jane Doe"/></label><label>Username<input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="jane.doe"/></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com"/></label><label>Phone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+255 7xx xxx xxx"/></label><button className="primary-button wide" disabled={saving}>{saving ? 'Creating…' : 'Create customer'}</button></form></article></section><style jsx>{`.customer-page{min-height:100vh;background:#f6f8fb;padding:36px 42px;color:#172033}.customer-header{display:flex;justify-content:space-between;align-items:flex-end;max-width:1500px;margin:0 0 22px}.customer-header h1{font-size:28px;letter-spacing:-.04em;margin:6px 0 4px}.customer-header p{margin:0;color:#7d899a;font-size:11px}.eyebrow,.panel-kicker{font-size:8px;font-weight:800;letter-spacing:.13em;color:#8a96a8}.primary-button{height:36px;padding:0 14px;border:0;border-radius:7px;background:#4f70dc;color:#fff;font-size:10px;font-weight:700}.customer-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;max-width:1500px}.panel{background:#fff;border:1px solid #e2e7ee;border-radius:10px;padding:18px}.list-head{display:flex;justify-content:space-between;align-items:center;gap:15px}.panel h2{font-size:13px;margin:5px 0 0}.search-box{height:34px;border:1px solid #dfe4eb;border-radius:7px;display:flex;align-items:center;overflow:hidden;min-width:340px}.search-box input{border:0;outline:0;flex:1;padding:0 8px;font-size:9px}.search-box button{height:100%;padding:0 11px;border:0;border-left:1px solid #e6eaf0;font-size:8px}.customer-table{margin-top:16px}.customer-row{display:grid;grid-template-columns:1.5fr 1fr 1fr .7fr .8fr;align-items:center;gap:12px;padding:11px 8px;border-bottom:1px solid #edf0f4;font-size:9px;color:#657286}.customer-table-head{font-size:7px;text-transform:uppercase;letter-spacing:.07em;font-weight:800;color:#9aa4b1}.customer-name{display:flex;gap:8px;align-items:center}.customer-avatar{width:27px;height:27px;border-radius:7px;display:grid;place-items:center;background:#eef2ff;color:#526bd0;font-weight:800}.customer-name strong,.customer-name small{display:block}.customer-name strong{font-size:9px;color:#263247}.customer-name small{font-size:7px;color:#9aa4b1}.status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a6afba;margin-right:5px}.status-dot.active{background:#39a970}.empty-state{text-align:center;padding:40px;color:#8a95a4;font-size:10px}.notice{margin-top:12px;padding:9px;border-radius:6px;background:#fff5f5;color:#b64b57;font-size:9px}.create-panel h2{font-size:16px;margin-top:7px}.create-panel>p{font-size:9px;color:#8b96a5;margin:5px 0 17px}.create-panel form{display:flex;flex-direction:column;gap:12px}.create-panel label{font-size:8px;font-weight:750;color:#69768a}.create-panel input{display:block;width:100%;height:35px;margin-top:5px;border:1px solid #dfe4eb;border-radius:6px;padding:0 9px;outline:0;font-size:9px}.wide{width:100%;margin-top:4px}@media(max-width:1000px){.customer-layout{grid-template-columns:1fr}.search-box{min-width:0;flex:1}}@media(max-width:700px){.customer-page{padding:20px 13px}.customer-header{align-items:flex-start;gap:14px;flex-direction:column}.list-head{align-items:stretch;flex-direction:column}.search-box{width:100%}.customer-row{grid-template-columns:1.5fr 1fr 1fr}.customer-row span:nth-child(4),.customer-row span:nth-child(5),.customer-table-head span:nth-child(4),.customer-table-head span:nth-child(5){display:none}}`}</style></main>;
}
