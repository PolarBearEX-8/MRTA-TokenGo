import { useEffect, useState } from 'react';

const STATIONS = ['สุขุมวิท', 'พระราม 9', 'ศูนย์วัฒนธรรมฯ', 'ลาดพร้าว', 'สีลม', 'สามย่าน', 'หัวลำโพง', 'สนามไชย'];

function Header({ go }) {
  return <header className="topbar"><button className="brand plain" onClick={() => go('home')}><span className="brand-mark">V</span><span>via<span>MRT</span></span></button><div className="top-actions"><button className="icon-button" aria-label="การแจ้งเตือน">●<span className="dot" /></button><button className="avatar">NP</button></div></header>;
}

function Home({ go, origin, setOrigin, destination, setDestination }) {
  const swap = () => { const old = origin; setOrigin(destination); setDestination(old); };
  return <>
    <div className="hello"><p>สวัสดีตอนเช้า</p><h1>ไปไหนต่อดี<br/><em>วันนี้?</em></h1></div>
    <article className="balance-card"><div><span>Cash Balance</span><strong>฿124.00</strong></div><button onClick={() => go('wallet')}>ดูรายการ <span>→</span></button><div className="card-orbit" /></article>
    <section className="planner card">
      <div className="section-head"><div><span className="eyebrow">วางแผนการเดินทาง</span><h2>เลือกเส้นทาง</h2></div><span className="line-pill">MRT</span></div>
      <div className="route-fields">
        <label><i className="station-dot blue"/><span><small>ต้นทาง</small><select value={origin} onChange={e => setOrigin(e.target.value)}>{STATIONS.map(s => <option key={s}>{s}</option>)}</select></span></label>
        <button className="swap" onClick={swap} aria-label="สลับสถานี">⇅</button>
        <label><i className="station-dot"/><span><small>ปลายทาง</small><select value={destination} onChange={e => setDestination(e.target.value)}>{STATIONS.map(s => <option key={s}>{s}</option>)}</select></span></label>
      </div>
      <div className="journey-meta"><span><b>7</b> สถานี</span><span><b>18</b> นาที</span><strong>฿28</strong></div>
      <button className="primary full" onClick={() => go('checkout')} disabled={origin === destination}>จอง Token ล่วงหน้า <span>→</span></button>
    </section>
    <div className="quick-head"><h2>บริการด่วน</h2><button>ทั้งหมด</button></div>
    <div className="quick-grid"><button className="quick" onClick={() => go('tickets')}><span>◫</span><b>ตั๋วของฉัน</b><small>1 ใบพร้อมใช้</small></button><button className="quick" onClick={() => go('machine')}><span>⌁</span><b>รับ Token</b><small>Express machine</small></button><button className="quick" onClick={() => go('wallet')}><span>↗</span><b>ขอคืนเงิน</b><small>เข้าบัญชี Cash</small></button></div>
  </>;
}

function RouteTicket({ origin, destination, live = false }) {
  return <article className={live ? 'live-ticket' : 'ticket-preview'}>
    <div className="ticket-top"><span>{live ? 'SMART TOKEN' : 'BLUE LINE'}</span><b>ACTIVE</b></div>
    {live && <div className="ticket-code">STT—10293</div>}
    <div className="ticket-route"><div><small>จาก</small><strong>{origin}</strong></div><span>→</span><div><small>ถึง</small><strong>{destination}</strong></div></div>
    {live ? <><div className="perforation"/><div className="ticket-instruction"><span>◉</span><p><b>ใช้ตั๋วนี้ที่ตู้ Express</b><small>ตู้จะสร้าง QR ชั่วคราวให้คุณสแกน<br/>ตั๋วนี้ไม่ใช่ QR สำหรับเดินทาง</small></p></div></> : <><div className="rail-line"><i/><i/></div><div className="ticket-detail"><span>7 สถานี</span><span>ประมาณ 18 นาที</span></div></>}
  </article>;
}

function Checkout({ go, route, pay }) {
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">ตรวจสอบรายการ</span><h1>พร้อมออกเดินทาง</h1><RouteTicket {...route}/><div className="summary card"><h3>สรุปค่าใช้จ่าย</h3><p><span>ค่าโดยสาร</span><b>฿28.00</b></p><p><span>ค่าบริการ</span><b>฿0.00</b></p><hr/><p className="total"><span>ยอดชำระ</span><b>฿28.00</b></p></div><div className="payment card"><span className="wallet-icon">฿</span><div><b>Cash Balance</b><small>ยอดคงเหลือ ฿124.00</small></div><i>✓</i></div><button className="primary full" onClick={pay}>ยืนยันและชำระ ฿28 <span>→</span></button></>;
}

function Tickets({ go, route }) {
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">ตั๋วของฉัน</span><h1>พร้อมรับ Token</h1><RouteTicket {...route} live/><div className="info-strip"><span>ⓘ</span><p><b>ปลอดภัยกว่า QR แบบเดิม</b><small>QR ที่ตู้มีอายุเพียง 45 วินาที และใช้ได้ครั้งเดียว</small></p></div><button className="primary full" onClick={() => go('machine')}>ไปที่ Express Machine <span>→</span></button></>;
}

function Machine({ go }) {
  const [step, setStep] = useState('queue');
  useEffect(() => { if (step !== 'scan') return; const id = setTimeout(() => setStep('success'), 1900); return () => clearTimeout(id); }, [step]);
  const finish = () => { if (step === 'queue') setStep('scan'); else if (step === 'success') { setStep('queue'); go('home'); } };
  return <><button className="back" onClick={() => go('tickets')}>← ตั๋วของฉัน</button><span className="eyebrow">EXPRESS MACHINE · BL21</span><h1>{step === 'queue' ? 'รับ Token แบบด่วน' : step === 'scan' ? 'สแกน QR จากหน้าตู้' : 'เดินทางได้เลย'}</h1>
    {step === 'queue' && <div className="queue-panel"><div className="queue-ring"><span>คิวของคุณ</span><strong>A07</strong></div><div><h3>อีก 2 คิวจะถึงคุณ</h3><p>เวลารอประมาณ 2 นาที</p><div className="queue-progress"><i/></div></div></div>}
    {step === 'scan' && <div className="scan-panel"><div className="scan-frame"><div className="qr"/><i className="scan-line"/></div><p>กำลังตรวจสอบ QR จากตู้...</p></div>}
    {step === 'success' && <div className="success-panel"><div className="token"><i>V</i></div><span className="success-check">✓</span><h2>รับ Token สำเร็จ</h2><p>ตู้ BL21 จ่าย Token แล้ว<br/>ประตูทางเข้าอยู่ทางขวามือ</p></div>}
    {step !== 'scan' && <button className="primary full" onClick={finish}>{step === 'queue' ? <>จำลอง: ถึงคิวแล้ว <span>→</span></> : 'กลับหน้าหลัก'}</button>}
  </>;
}

function Wallet({ go }) {
  const items = [['↙','คืนเงินตั๋วหมดอายุ','STT—09112 · 6 ก.ค.','+฿28',true],['↗','จอง Token · สายสีน้ำเงิน','STT—10293 · วันนี้','−฿28'],['+','เติม Cash Balance','PromptPay · 2 ก.ค.','+฿100',true]];
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">กระเป๋าของฉัน</span><h1>Cash Balance</h1><article className="wallet-hero"><small>ยอดเงินพร้อมใช้</small><strong>฿124.00</strong><span>อัปเดตเมื่อสักครู่</span></article><div className="quick-head"><h2>รายการล่าสุด</h2><button>ดูทั้งหมด</button></div><div className="transactions">{items.map(([icon,title,meta,amount,credit]) => <div key={title}><i className={credit ? 'credit' : ''}>{icon}</i><p><b>{title}</b><small>{meta}</small></p><strong className={credit ? 'plus' : ''}>{amount}</strong></div>)}</div><button className="secondary full">ยื่นคำขอคืนเงินจริง</button></>;
}

function Nav({ view, go }) {
  return <nav className="bottom-nav">{[['home','⌂','หน้าหลัก'],['tickets','◫','ตั๋ว'],['machine','⌁','สแกน'],['wallet','◉','กระเป๋า']].map(([id,icon,label]) => <button key={id} className={`${view === id ? 'nav-active ' : ''}${id === 'machine' ? 'scan-nav' : ''}`} onClick={() => go(id)}><span>{icon}</span>{label}</button>)}</nav>;
}

export default function App() {
  const [view, setView] = useState('home');
  const [origin, setOrigin] = useState('สุขุมวิท');
  const [destination, setDestination] = useState('สีลม');
  const [toast, setToast] = useState(false);
  const go = id => { setView(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const pay = () => { setToast(true); setTimeout(() => setToast(false), 2200); setTimeout(() => go('tickets'), 350); };
  const route = { origin, destination };
  return <><div className="ambient ambient-a"/><div className="ambient ambient-b"/><main className="shell"><Header go={go}/><section className={`view active ${view !== 'home' ? 'subview' : ''}`}>{view === 'home' && <Home go={go} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/>} {view === 'checkout' && <Checkout go={go} route={route} pay={pay}/>} {view === 'tickets' && <Tickets go={go} route={route}/>} {view === 'machine' && <Machine go={go}/>} {view === 'wallet' && <Wallet go={go}/>}</section><Nav view={view} go={go}/></main><div className={`toast ${toast ? 'show' : ''}`}>ชำระเงินสำเร็จ — ตั๋วพร้อมใช้งาน</div></>;
}
