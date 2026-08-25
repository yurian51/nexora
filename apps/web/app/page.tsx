const stats = [
  ['Revenue today', 'TZS 428,500', '+18.4%'],
  ['Active customers', '1,284', '+7.2%'],
  ['Active sessions', '347', '+12.1%'],
  ['Routers online', '18 / 19', '1 offline'],
];

const sessions = [
  ['Amani J.', 'Njiro', 'MTK-01', '10.20.1.42', 'Daily 5GB', '01:42', 'ACTIVE'],
  ['Neema M.', 'Kisongo', 'MTK-03', '10.20.3.18', '2 Hours', '00:57', 'ACTIVE'],
  ['Baraka K.', 'Mianzini', 'MTK-07', '10.20.7.31', 'Weekly 20GB', '03:12', 'IDLE'],
];

const alerts = [
  ['Router offline', 'Kisongo • 8 min ago', 'warning'],
  ['Payment failures', '7 attempts • 1 hr ago', 'critical'],
  ['Voucher expiry', '32 batches • today', 'info'],
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>YURIAN</span><small>WiFi Billing</small></div>
        <nav className="nav">
          {['Overview','Customers','Packages','Vouchers','Sessions','Payments','Locations & Routers','Agents','Reports','Audit Log','Settings'].map((item, i) => (
            <a key={item} className={i === 0 ? 'nav-item active' : 'nav-item'} href="#"><span className="nav-icon">{['⌂','◉','▣','◇','◌','₮','⌁','◎','▥','≡','⚙'][i]}</span>{item}</a>
          ))}
        </nav>
        <div className="profile"><div className="avatar">Y</div><div><strong>Yurian</strong><small>Owner / Admin</small></div></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><p className="eyebrow">NETWORK OPERATIONS</p><h1>Overview</h1><p className="context">Organization • All locations</p></div>
          <div className="system-status"><span>●</span> All systems operational</div>
        </header>

        <section className="metrics">
          {stats.map(([label, value, delta]) => <article className="metric-card" key={label}><p>{label}</p><strong>{value}</strong><span>{delta}</span></article>)}
        </section>

        <section className="grid-main">
          <article className="panel revenue"><div className="panel-head"><div><h2>Revenue trend</h2><p>Last 30 days</p></div><button>30 days ▾</button></div><div className="chart"><div className="grid-line one"/><div className="grid-line two"/><div className="grid-line three"/><div className="bars">{[42,67,54,88,61,76,96,72,83,64,91,78].map((h, i) => <span style={{height:`${h}%`}} key={i}/>)}</div></div></article>
          <article className="panel alerts"><div className="panel-head"><div><h2>Network alerts</h2><p>Needs attention</p></div><span className="count">3</span></div>{alerts.map(([title, detail, type]) => <div className="alert" key={title}><i className={type}/><div><strong>{title}</strong><small>{detail}</small></div></div>)}</article>
        </section>

        <article className="panel sessions"><div className="panel-head"><div><h2>Live sessions</h2><p>347 active connections</p></div><button className="outline">View all sessions</button></div><div className="table-wrap"><table><thead><tr>{['Customer','Location','Router','IP address','Package','Duration','Status'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{sessions.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i === 6 ? <span className={`status ${cell.toLowerCase()}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></article>
      </section>
    </main>
  );
}
