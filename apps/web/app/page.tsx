'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const nav = [
  ['Overview', '⌂'], ['Customers', '◉'], ['Plans & Products', '▣'], ['Sessions', '◌'],
  ['Payments', '₮'], ['Network', '⌁'], ['Agents & Partners', '◎'], ['Analytics', '◫'],
  ['Reports', '▤'], ['Security & Audit', '◈'], ['Settings', '⚙'],
];

const demoLocations = [
  ['Tanzania', '14 sites', '6,482', 'TZS 9.24M', '99.98%'],
  ['Kenya', '8 sites', '3,104', 'TZS 5.61M', '99.96%'],
  ['Uganda', '5 sites', '2,087', 'TZS 2.74M', '99.94%'],
  ['Rwanda', '3 sites', '1,173', 'TZS 0.83M', '99.99%'],
];

const demoSessions = [
  ['Amani J.', 'Njiro', 'MikroTik CCR', 'Daily 5GB', '10.20.1.42', '01:42', 'ACTIVE'],
  ['Neema M.', 'Westlands', 'UniFi Gateway', '50 Mbps', '10.20.3.18', '00:57', 'ACTIVE'],
  ['Baraka K.', 'Kisongo', 'MikroTik hEX', 'Weekly 20GB', '10.20.7.31', '03:12', 'IDLE'],
  ['Grace N.', 'Kampala Central', 'Omada ER', '30 Mbps', '10.20.9.04', '00:31', 'ACTIVE'],
];

const bars = [38, 51, 44, 64, 58, 71, 67, 83, 74, 88, 79, 94, 86, 91, 100];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function Home() {
  const [active, setActive] = useState('Overview');
  const [period, setPeriod] = useState('30D');
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('nexora.accessToken');
    if (!token) return;

    fetch(`${API_URL}/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setOverview(data); })
      .catch(() => undefined);
  }, []);

  const currency = overview?.tenant?.currency ?? 'TZS';
  const monthlyRevenue = overview?.kpis?.monthlyRevenue ?? 18420000;
  const activeCustomers = overview?.kpis?.activeCustomers ?? 12846;
  const onlineSessions = overview?.kpis?.onlineSessions ?? 2731;
  const availability = overview?.kpis?.networkAvailability ?? 99.97;
  const network = overview?.network ?? { totalRouters: 30, online: 28, degraded: 2, offline: 0 };
  const liveSessions = overview?.sessions?.length ? overview.sessions.map((row: any) => [
    row.customer, row.location, row.router, 'Connected', row.ip_address ?? '—', 'LIVE', row.status,
  ]) : demoSessions;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><span>NEXORA</span><small>Connected business OS</small></div>
        </div>
        <div className="workspace-switch"><span className="workspace-dot"/> Global Workspace <span>⌄</span></div>
        <nav className="nav">
          <p className="nav-section">OPERATIONS</p>
          {nav.slice(0, 7).map(([item, icon]) => (
            <button key={item} onClick={() => setActive(item)} className={active === item ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">{icon}</span><span>{item}</span>
            </button>
          ))}
          <p className="nav-section second">INSIGHTS & CONTROL</p>
          {nav.slice(7).map(([item, icon]) => (
            <button key={item} onClick={() => setActive(item)} className={active === item ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">{icon}</span><span>{item}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-status"><span className="pulse"/><div><strong>All systems operational</strong><small>{overview ? 'Live data connected' : 'Demo data · sign in to connect'}</small></div></div>
        <div className="profile"><div className="avatar">Y</div><div><strong>Yurian</strong><small>Owner · Global Admin</small></div><span className="profile-more">•••</span></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><div className="eyebrow">NEXORA / {active.toUpperCase()}</div><h1>Operations overview</h1><p className="context">A real-time view of revenue, subscribers, network health and activity.</p></div>
          <div className="top-actions">
            <button className="date-button">◷ <span>25 Aug 2026</span></button>
            <button className="selector">All regions <span>⌄</span></button>
            <button className="icon-button">⌕</button><button className="icon-button notification">♧<i/></button>
            <div className="avatar small-avatar">Y</div>
          </div>
        </header>

        <section className="kpi-grid">
          {[
            ['Monthly recurring revenue', `${currency} ${formatNumber(monthlyRevenue)}`, '+14.8%', 'current month'],
            ['Active subscribers', formatNumber(activeCustomers), '+8.6%', 'active customers'],
            ['Online sessions', formatNumber(onlineSessions), '+11.2%', 'currently connected'],
            ['Network availability', `${availability}%`, '+0.08%', 'current fleet'],
          ].map(([label, value, delta, note]) => <article className="kpi" key={label}>
            <div className="kpi-label"><span>{label}</span><button>•••</button></div>
            <strong>{value}</strong><div className="kpi-foot"><span>↗ {delta}</span><small>{note}</small></div>
          </article>)}
        </section>

        <section className="hero-grid">
          <article className="panel revenue-panel">
            <div className="panel-head"><div><div className="panel-kicker">FINANCIAL PERFORMANCE</div><h2>Revenue performance</h2><p>Consolidated across all operating regions</p></div><div className="periods">{['7D','30D','90D','1Y'].map(x => <button key={x} onClick={() => setPeriod(x)} className={period === x ? 'selected' : ''}>{x}</button>)}</div></div>
            <div className="revenue-total"><strong>{currency} {formatNumber(monthlyRevenue)}</strong><span>↗ 18.4%</span><small>current month</small></div>
            <div className="chart"><div className="chart-scale"><span>50M</span><span>35M</span><span>20M</span><span>5M</span><span>0</span></div><div className="chart-body"><div className="grid-line g1"/><div className="grid-line g2"/><div className="grid-line g3"/><div className="grid-line g4"/><div className="bars">{bars.map((h, i) => <span style={{ height: `${h}%` }} key={i} />)}</div><div className="x-labels"><span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div></div></div>
          </article>
          <article className="panel health-panel">
            <div className="panel-kicker">NETWORK HEALTH</div><h2>Infrastructure status</h2><p>Across {network.totalRouters} registered routers</p>
            <div className="health-ring"><div><strong>{availability}%</strong><span>availability</span></div></div>
            <div className="health-stats"><div><span className="health-dot online"/> <strong>{network.online}</strong><small>Operational</small></div><div><span className="health-dot warn"/><strong>{network.degraded}</strong><small>Attention</small></div><div><span className="health-dot down"/><strong>{network.offline}</strong><small>Offline</small></div></div>
            <button className="full-button">Open network operations <span>→</span></button>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel locations-panel"><div className="panel-head"><div><div className="panel-kicker">GLOBAL FOOTPRINT</div><h2>Regional performance</h2><p>Subscriber and revenue distribution</p></div><button className="outline-button">View all regions →</button></div>
            <div className="location-table"><div className="location-header"><span>REGION</span><span>SITES</span><span>SUBSCRIBERS</span><span>REVENUE</span><span>UPTIME</span></div>{(overview?.locations?.length ? overview.locations : demoLocations).map((row: any, i: number) => {
              const demo = demoLocations[i] ?? ['Global', '—', '0', `${currency} 0`, '100%'];
              const name = row.name;
              const sites = Array.isArray(row) ? row[1] : `${row.routers} routers`;
              const subscribers = Array.isArray(row) ? row[2] : formatNumber(row.activeUsers);
              const revenue = Array.isArray(row) ? row[3] : 'Live data';
              const uptime = Array.isArray(row) ? row[4] : `${row.routers ? Math.round((row.onlineRouters / row.routers) * 10000) / 100 : 100}%`;
              return <div className="location-row" key={name}><div className="region"><span className="region-code">{Array.isArray(row) ? ['TZ','KE','UG','RW'][i] ?? 'GL' : name.slice(0,2).toUpperCase()}</span><strong>{name}</strong></div><span>{sites}</span><span>{subscribers}</span><strong>{revenue || demo[3]}</strong><span className="uptime">● {uptime}</span></div>;
            })}</div>
          </article>
          <article className="panel attention-panel"><div className="panel-head"><div><div className="panel-kicker">OPERATIONS</div><h2>Attention required</h2><p>Prioritized events from your network</p></div><span className="alert-count">{overview?.kpis?.paymentFailures ?? 3}</span></div>
            <div className="attention-item"><span className="severity critical"/><div><strong>Payment failures detected</strong><small>{overview?.kpis?.paymentFailures ?? 7} failed attempts · current period</small></div><span>›</span></div>
            <div className="attention-item"><span className="severity warning"/><div><strong>Router requires review</strong><small>{network.degraded} routers · degraded state</small></div><span>›</span></div>
            <div className="attention-item"><span className="severity info"/><div><strong>Voucher batches expiring</strong><small>Review active inventory before expiry</small></div><span>›</span></div>
            <button className="full-button">Review all alerts <span>→</span></button>
          </article>
        </section>

        <section className="panel sessions-panel"><div className="panel-head"><div><div className="panel-kicker">LIVE NETWORK</div><h2>Active sessions</h2><p>{formatNumber(onlineSessions)} users currently connected</p></div><div className="session-actions"><span className="live-pill"><i/> LIVE</span><button className="outline-button">Export CSV</button><button className="outline-button">View sessions →</button></div></div>
          <div className="table-wrap"><table><thead><tr>{['Customer','Location','Gateway','Plan','IP address','Duration','Status'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{liveSessions.map((row: string[]) => <tr key={`${row[0]}-${row[4]}`}>{row.map((cell, i) => <td key={i}>{i === 6 ? <span className={`status ${cell.toLowerCase()}`}><i/> {cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>
        </section>
        <footer className="footer"><span>NEXORA Cloud · v0.1 Foundation</span><span>{overview ? 'Live tenant data · refreshed on load' : 'Demo workspace · authentication required for live data'}</span></footer>
      </section>
    </main>
  );
}
