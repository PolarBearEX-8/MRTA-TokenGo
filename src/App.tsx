import { useEffect, useState } from 'react';

type View = 'home' | 'checkout' | 'map' | 'machine' | 'wallet';
type Route = { origin: string; destination: string };
type Go = (id: View) => void;
type Step = 'queue' | 'scan' | 'success';
type IconName = 'plus' | 'map' | 'scan' | 'wallet' | 'home';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = { plus: 'M12 5v14M5 12h14', map: 'M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2-6-2zM9 4v14M15 6v14', scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3', wallet: 'M4 7h15a1 1 0 011 1v10a1 1 0 01-1 1H4a2 2 0 01-2-2V6a2 2 0 012-2h13v3M16 13h4', home: 'M3 11l9-8 9 8M5 10v10h14V10M9 20v-6h6v6' };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const STATIONS = ['สุขุมวิท', 'พระราม 9', 'ศูนย์วัฒนธรรมฯ', 'ลาดพร้าว', 'สีลม', 'สามย่าน', 'หัวลำโพง', 'สนามไชย'];

function Header({ go }: { go: Go }) {
  return <header className="topbar"><button className="brand plain" onClick={() => go('home')}><span className="brand-mark">V</span><span>Token<span>Go</span></span></button><div className="top-actions"><button className="icon-button" aria-label="การแจ้งเตือน">●<span className="dot" /></button><button className="avatar">NP</button></div></header>;
}

type HomeProps = {
  go: Go;
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
};

function Home({ go, origin, setOrigin, destination, setDestination }: HomeProps) {
  const swap = () => { const old = origin; setOrigin(destination); setDestination(old); };
  return <>
    <div className="hello"><p>สวัสดีตอนเช้า</p><h1>ไปไหนต่อดี<br/><em>วันนี้?</em></h1></div>
    <article className="balance-card"><div><span>Cash Balance</span><strong>฿124.00</strong></div><button onClick={() => go('wallet')}>ดูรายการ <span>→</span></button><div className="card-orbit" /></article>
    <div className="home-menu"><button className="home-menu-item" onClick={() => go('checkout')}><span><Icon name="plus" /></span><b>จองตั๋ว</b></button><button className="home-menu-item" onClick={() => go('map')}><span><Icon name="map" /></span><b>ดูแผนที่</b></button><button className="home-menu-item" onClick={() => go('machine')}><span><Icon name="scan" /></span><b>ตั๋ว + สแกน</b></button><button className="home-menu-item" onClick={() => go('wallet')}><span><Icon name="wallet" /></span><b>กระเป๋า</b></button></div>
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
  </>;
}

type RouteTicketProps = Route & { live?: boolean };

function RouteTicket({ origin, destination, live = false }: RouteTicketProps) {
  return <article className={live ? 'live-ticket' : 'ticket-preview'}>
    <div className="ticket-top"><span>{live ? 'SMART TOKEN' : 'BLUE LINE'}</span><b>ACTIVE</b></div>
    {live && <div className="ticket-code">STT—10293</div>}
    <div className="ticket-route"><div><small>จาก</small><strong>{origin}</strong></div><span>→</span><div><small>ถึง</small><strong>{destination}</strong></div></div>
    {live ? <><div className="perforation"/><div className="ticket-instruction"><span>◉</span><p><b>ใช้ตั๋วนี้ที่ตู้ Express</b><small>ตู้จะสร้าง QR ชั่วคราวให้คุณสแกน<br/>ตั๋วนี้ไม่ใช่ QR สำหรับเดินทาง</small></p></div></> : <><div className="rail-line"><i/><i/></div><div className="ticket-detail"><span>7 สถานี</span><span>ประมาณ 18 นาที</span></div></>}
  </article>;
}

function BookingMap({ origin, destination }: Route) {
  return <article className="booking-map"><div className="booking-map-head"><span>ROUTE MAP</span><b>BLUE LINE</b></div><div className="booking-map-body"><i className="booking-route-line"/><div className="booking-point departure"><span/><small>Departure</small><strong>{origin}</strong></div><div className="booking-point destination"><span/><small>Destination</small><strong>{destination}</strong></div></div></article>;
}

function Checkout({ go, route, pay }: { go: Go; route: Route; pay: () => void }) {
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">ตรวจสอบรายการ</span><h1>พร้อมออกเดินทาง</h1><BookingMap {...route}/><RouteTicket {...route}/><div className="summary card"><h3>สรุปค่าใช้จ่าย</h3><p><span>ค่าโดยสาร</span><b>฿28.00</b></p><p><span>ค่าบริการ</span><b>฿0.00</b></p><hr/><p className="total"><span>ยอดชำระ</span><b>฿28.00</b></p></div><div className="payment card"><span className="wallet-icon">฿</span><div><b>Cash Balance</b><small>ยอดคงเหลือ ฿124.00</small></div><i>✓</i></div><button className="primary full" onClick={pay}>ยืนยันและชำระ ฿28 <span>→</span></button></>;
}

function Tickets({ go, route }: { go: Go; route: Route }) {
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">ตั๋วของฉัน</span><h1>พร้อมรับ Token</h1><RouteTicket {...route} live/><div className="info-strip"><span>ⓘ</span><p><b>ปลอดภัยกว่า QR แบบเดิม</b><small>QR ที่ตู้มีอายุเพียง 45 วินาที และใช้ได้ครั้งเดียว</small></p></div><button className="primary full" onClick={() => go('machine')}>ไปที่ Express Machine <span>→</span></button></>;
}

function Machine({ go, route }: { go: Go; route: Route }) {
  const [step, setStep] = useState<Step>('queue');
  useEffect(() => { if (step !== 'scan') return; const id = setTimeout(() => setStep('success'), 1900); return () => clearTimeout(id); }, [step]);
  const finish = () => { if (step === 'queue') setStep('scan'); else if (step === 'success') { setStep('queue'); go('home'); } };
  return <><button className="back" onClick={() => go('home')}>← หน้าหลัก</button><span className="eyebrow">EXPRESS MACHINE · BL21</span><RouteTicket {...route} live/><h1>{step === 'queue' ? 'รับ Token แบบด่วน' : step === 'scan' ? 'สแกน QR จากหน้าตู้' : 'เดินทางได้เลย'}</h1>
    {step === 'queue' && <div className="queue-panel"><div className="queue-ring"><span>คิวของคุณ</span><strong>A07</strong></div><div><h3>อีก 2 คิวจะถึงคุณ</h3><p>เวลารอประมาณ 2 นาที</p><div className="queue-progress"><i/></div></div></div>}
    {step === 'scan' && <div className="scan-panel"><div className="scan-frame"><div className="qr"/><i className="scan-line"/></div><p>กำลังตรวจสอบ QR จากตู้...</p></div>}
    {step === 'success' && <div className="success-panel"><div className="token"><i>V</i></div><span className="success-check">✓</span><h2>รับ Token สำเร็จ</h2><p>ตู้ BL21 จ่าย Token แล้ว<br/>ประตูทางเข้าอยู่ทางขวามือ</p></div>}
    {step !== 'scan' && <button className="primary full" onClick={finish}>{step === 'queue' ? <>จำลอง: ถึงคิวแล้ว <span>→</span></> : 'กลับหน้าหลัก'}</button>}
  </>;
}

function MapView({ go }: { go: Go }) {
  return <><button className="back" onClick={() => go('home')}>← หน้าหลัก</button><span className="eyebrow">LIVE NETWORK</span><h1>แผนที่เส้นทาง</h1><article className="map-card"><div className="map-lines"><i className="map-line line-green"/><i className="map-line line-blue"/><b className="map-station station-a">BL21</b><b className="map-station station-b">BL18</b><b className="map-station station-c">BL14</b><span className="map-user">●</span></div><div className="map-caption"><span><i className="legend-dot green"/>สายสีเขียว</span><span><i className="legend-dot blue"/>สายสีน้ำเงิน</span></div></article><button className="primary full" onClick={() => go('machine')}>ดู Token และสแกน <span>→</span></button></>;
}

function Wallet({ go }: { go: Go }) {
  const items: [string, string, string, string, boolean?][] = [['↙','คืนเงินตั๋วหมดอายุ','STT—09112 · 6 ก.ค.','+฿28',true],['↗','จอง Token · สายสีน้ำเงิน','STT—10293 · วันนี้','−฿28'],['+','เติม Cash Balance','PromptPay · 2 ก.ค.','+฿100',true]];
  return <><button className="back" onClick={() => go('home')}>← กลับ</button><span className="eyebrow">กระเป๋าของฉัน</span><h1>Cash Balance</h1><article className="wallet-hero"><small>ยอดเงินพร้อมใช้</small><strong>฿124.00</strong><span>อัปเดตเมื่อสักครู่</span></article><div className="quick-head"><h2>รายการล่าสุด</h2><button>ดูทั้งหมด</button></div><div className="transactions">{items.map(([icon,title,meta,amount,credit]) => <div key={title}><i className={credit ? 'credit' : ''}>{icon}</i><p><b>{title}</b><small>{meta}</small></p><strong className={credit ? 'plus' : ''}>{amount}</strong></div>)}</div><button className="secondary full">ยื่นคำขอคืนเงินจริง</button></>;
}

function Nav({ view, go }: { view: View; go: Go }) {
  const tabs: [View, IconName, string][] = [['home','home','หน้าหลัก'],['map','map','Map'],['machine','scan','ตั๋ว + สแกน'],['wallet','wallet','กระเป๋า']];
  return <nav className="bottom-nav">{tabs.map(([id,icon,label]) => <button key={id} className={`${view === id ? 'nav-active ' : ''}${id === 'machine' ? 'scan-nav' : ''}`} onClick={() => go(id)}><span><Icon name={icon} /></span>{label}</button>)}</nav>;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [origin, setOrigin] = useState('สุขุมวิท');
  const [destination, setDestination] = useState('สีลม');
  const [toast, setToast] = useState(false);
  const go: Go = id => { setView(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const pay = () => { setToast(true); setTimeout(() => setToast(false), 2200); setTimeout(() => go('machine'), 350); };
  const route: Route = { origin, destination };
  return <><div className="ambient ambient-a"/><div className="ambient ambient-b"/><main className="shell"><Header go={go}/><section className={`view active ${view !== 'home' ? 'subview' : ''}`}>{view === 'home' && <Home go={go} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/>} {view === 'checkout' && <Checkout go={go} route={route} pay={pay}/>} {view === 'map' && <MapView go={go}/>} {view === 'machine' && <Machine go={go} route={route}/>} {view === 'wallet' && <Wallet go={go}/>}</section><Nav view={view} go={go}/></main><div className={`toast ${toast ? 'show' : ''}`}>ชำระเงินสำเร็จ — ตั๋วพร้อมใช้งาน</div></>;
}
