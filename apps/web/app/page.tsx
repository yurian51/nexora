const stats = [
  ['Today revenue', 'TZS 245,000'],
  ['Active customers', '1,284'],
  ['Active sessions', '427'],
  ['Online routers', '18 / 20'],
];

export default function Home() {
  return <main style={{padding:'32px',maxWidth:1400,margin:'auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
      <div><div style={{fontSize:13,color:'#a1a1aa'}}>YURIAN NETWORK OPERATIONS</div><h1 style={{margin:'6px 0',fontSize:32}}>WiFi Billing</h1></div>
      <span style={{border:'1px solid #3f3f46',borderRadius:999,padding:'8px 14px',fontSize:13}}>Production architecture</span>
    </header>
    <section style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>{stats.map(([label,value])=><article key={label} style={{padding:20,border:'1px solid #27272a',borderRadius:16,background:'#111113'}}><div style={{color:'#a1a1aa',fontSize:13}}>{label}</div><div style={{fontSize:25,fontWeight:700,marginTop:10}}>{value}</div></article>)}</section>
    <section style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginTop:16}}>
      <article style={{minHeight:300,padding:24,border:'1px solid #27272a',borderRadius:16,background:'#111113'}}><h2>Revenue overview</h2><p style={{color:'#a1a1aa'}}>Dashboard foundation is ready for API-backed revenue analytics.</p></article>
      <article style={{padding:24,border:'1px solid #27272a',borderRadius:16,background:'#111113'}}><h2>Router health</h2><p>18 online</p><p>1 degraded</p><p>1 offline</p></article>
    </section>
  </main>;
}
