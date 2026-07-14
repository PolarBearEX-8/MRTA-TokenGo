// PLEASE READ LICENSE.md. TokenGo is protected software. Do not copy, rename, remove attribution, or submit derivative work without permission.
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import './welcome.css';

type View = 'home' | 'checkout' | 'booking' | 'planner' | 'map' | 'machine' | 'wallet';
type Route = { origin: string; destination: string; stationCount?: number; fare?: number };
type BookedTicket = Route & { id: number; code: string; status: 'unpaid' | 'ready' | 'completed' };
type Go = (id: View) => void;
type Step = 'queue' | 'scan' | 'success';
type IconName = 'plus' | 'map' | 'scan' | 'wallet' | 'home';

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const blueLineStations = [
  { code: 'BL01', nameTh: 'ท่าพระ', nameEn: 'Tha Phra' }, { code: 'BL02', nameTh: 'จรัญฯ 13', nameEn: 'Charan 13' },
  { code: 'BL03', nameTh: 'ไฟฉาย', nameEn: 'Fai Chai' }, { code: 'BL04', nameTh: 'บางขุนนนท์', nameEn: 'Bang Khun Non' },
  { code: 'BL05', nameTh: 'บางยี่ขัน', nameEn: 'Bang Yi Khan' }, { code: 'BL06', nameTh: 'สิรินธร', nameEn: 'Sirindhorn' },
  { code: 'BL07', nameTh: 'บางพลัด', nameEn: 'Bang Phlat' }, { code: 'BL08', nameTh: 'บางอ้อ', nameEn: 'Bang O' },
  { code: 'BL09', nameTh: 'บางโพ', nameEn: 'Bang Pho' }, { code: 'BL10', nameTh: 'เตาปูน', nameEn: 'Tao Poon' },
  { code: 'BL11', nameTh: 'บางซื่อ', nameEn: 'Bang Sue' }, { code: 'BL12', nameTh: 'กำแพงเพชร', nameEn: 'Kamphaeng Phet' },
  { code: 'BL13', nameTh: 'สวนจตุจักร', nameEn: 'Chatuchak Park' }, { code: 'BL14', nameTh: 'พหลโยธิน', nameEn: 'Phahon Yothin' },
  { code: 'BL15', nameTh: 'ลาดพร้าว', nameEn: 'Lat Phrao' }, { code: 'BL16', nameTh: 'รัชดาภิเษก', nameEn: 'Ratchadaphisek' },
  { code: 'BL17', nameTh: 'สุทธิสาร', nameEn: 'Sutthisan' }, { code: 'BL18', nameTh: 'ห้วยขวาง', nameEn: 'Huai Khwang' },
  { code: 'BL19', nameTh: 'ศูนย์วัฒนธรรมแห่งประเทศไทย', nameEn: 'Thailand Cultural Centre' }, { code: 'BL20', nameTh: 'พระราม 9', nameEn: 'Phra Ram 9' },
  { code: 'BL21', nameTh: 'เพชรบุรี', nameEn: 'Phetchaburi' }, { code: 'BL22', nameTh: 'สุขุมวิท', nameEn: 'Sukhumvit' },
  { code: 'BL23', nameTh: 'ศูนย์การประชุมแห่งชาติสิริกิติ์', nameEn: 'Queen Sirikit National Convention Centre' }, { code: 'BL24', nameTh: 'คลองเตย', nameEn: 'Khlong Toei' },
  { code: 'BL25', nameTh: 'ลุมพินี', nameEn: 'Lumphini' }, { code: 'BL26', nameTh: 'สีลม', nameEn: 'Si Lom' },
  { code: 'BL27', nameTh: 'สามย่าน', nameEn: 'Sam Yan' }, { code: 'BL28', nameTh: 'หัวลำโพง', nameEn: 'Hua Lamphong' },
  { code: 'BL29', nameTh: 'วัดมังกร', nameEn: 'Wat Mangkon' }, { code: 'BL30', nameTh: 'สามยอด', nameEn: 'Sam Yot' },
  { code: 'BL31', nameTh: 'สนามไชย', nameEn: 'Sanam Chai' }, { code: 'BL32', nameTh: 'อิสรภาพ', nameEn: 'Itsaraphap' },
  { code: 'BL33', nameTh: 'บางไผ่', nameEn: 'Bang Phai' }, { code: 'BL34', nameTh: 'บางหว้า', nameEn: 'Bang Wa' },
  { code: 'BL35', nameTh: 'เพชรเกษม 48', nameEn: 'Phetkasem 48' }, { code: 'BL36', nameTh: 'ภาษีเจริญ', nameEn: 'Phasi Charoen' },
  { code: 'BL37', nameTh: 'บางแค', nameEn: 'Bang Khae' }, { code: 'BL38', nameTh: 'หลักสอง', nameEn: 'Lak Song' },
];

const purpleLineStations = [
  { code: 'PP01', nameTh: 'คลองบางไผ่', nameEn: 'Khlong Bang Phai' }, { code: 'PP02', nameTh: 'ตลาดบางใหญ่', nameEn: 'Talad Bang Yai' },
  { code: 'PP03', nameTh: 'สามแยกบางใหญ่', nameEn: 'Sam Yaek Bang Yai' }, { code: 'PP04', nameTh: 'บางพลู', nameEn: 'Bang Phlu' },
  { code: 'PP05', nameTh: 'บางรักใหญ่', nameEn: 'Bang Rak Yai' }, { code: 'PP06', nameTh: 'บางรักน้อยท่าอิฐ', nameEn: 'Bang Rak Noi Tha It' },
  { code: 'PP07', nameTh: 'ไทรม้า', nameEn: 'Sai Ma' }, { code: 'PP08', nameTh: 'สะพานพระนั่งเกล้า', nameEn: 'Phra Nang Klao Bridge' },
  { code: 'PP09', nameTh: 'แยกนนทบุรี 1', nameEn: 'Yaek Nonthaburi 1' }, { code: 'PP10', nameTh: 'บางกระสอ', nameEn: 'Bang Krasor' },
  { code: 'PP11', nameTh: 'ศูนย์ราชการนนทบุรี', nameEn: 'Nonthaburi Civic Center' }, { code: 'PP12', nameTh: 'กระทรวงสาธารณสุข', nameEn: 'Ministry of Public Health' },
  { code: 'PP13', nameTh: 'แยกติวานนท์', nameEn: 'Yaek Tiwanon' }, { code: 'PP14', nameTh: 'วงศ์สว่าง', nameEn: 'Wong Sawang' },
  { code: 'PP15', nameTh: 'บางซ่อน', nameEn: 'Bang Son' }, { code: 'PP16', nameTh: 'เตาปูน (สายสีม่วง)', nameEn: 'Tao Poon' },
];

const metroStations = [...blueLineStations, ...purpleLineStations];

// MRT adult fare (บาท): 17–44 บาท, capped at 44 บาท from 13 stations onward.
// Source: mrta-fare-cal.md / BEM Fare Calculation.
const adultFareByStationCount: Record<number, number> = {
  1: 17, 2: 19, 3: 21, 4: 24, 5: 26, 6: 28, 7: 31, 8: 33, 9: 35,
  10: 37, 11: 40, 12: 42, 13: 44, 14: 44, 15: 44, 16: 44, 17: 44,
  18: 44, 19: 44,
};

const purpleAdultFareByStationCount: Record<number, number> = {
  0: 0, 1: 17, 2: 19, 3: 21, 4: 24, 5: 26, 6: 28, 7: 31, 8: 35,
  9: 37, 10: 38, 11: 40, 12: 42, 13: 42, 14: 42, 15: 42,
};

function createLineGraph(stations: typeof blueLineStations) {
  return Object.fromEntries(stations.map((station, index) => {
  const adjacentStations = [stations[index - 1], stations[index + 1]]
    .filter((candidate): candidate is typeof station => Boolean(candidate))
    .map(candidate => candidate.code);
  return [station.code, adjacentStations];
  })) as Record<string, string[]>;
}

const metroGraph = { ...createLineGraph(blueLineStations), ...createLineGraph(purpleLineStations) };
metroGraph.BL10.push('PP16');
metroGraph.PP16.push('BL10');

type Journey = { codes: string[]; stationCount: number; fare: number };

function findShortestRoute(originCode: string, destinationCode: string) {
  const queue: string[][] = [[originCode]];
  const visited = new Set([originCode]);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (current === destinationCode) return path;
    for (const next of metroGraph[current] ?? []) {
      if (!visited.has(next)) { visited.add(next); queue.push([...path, next]); }
    }
  }
  return [originCode];
}

function calculateJourney(origin: string, destination: string): Journey {
  const originStation = metroStations.find(station => station.nameTh === origin);
  const destinationStation = metroStations.find(station => station.nameTh === destination);
  if (!originStation || !destinationStation || originStation.code === destinationStation.code) {
    return { codes: originStation ? [originStation.code] : [], stationCount: 0, fare: 0 };
  }
  const codes = findShortestRoute(originStation.code, destinationStation.code);
  const stationCount = Math.max(0, codes.length - 1);
  const blueSegments = codes.filter(code => code.startsWith('BL')).length - 1;
  const purpleSegments = codes.filter(code => code.startsWith('PP')).length - 1;
  const blueFare = blueSegments > 0 ? adultFareByStationCount[blueSegments] ?? 44 : 0;
  const purpleFare = purpleSegments > 0 ? purpleAdultFareByStationCount[purpleSegments] ?? 42 : 0;
  const fare = blueFare && purpleFare ? blueFare + purpleFare - 17 : blueFare || purpleFare;
  return { codes, stationCount, fare };
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = { plus: 'M12 5v14M5 12h14', map: 'M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2-6-2zM9 4v14M15 6v14', scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3', wallet: 'M4 7h15a1 1 0 011 1v10a1 1 0 01-1 1H4a2 2 0 01-2-2V6a2 2 0 012-2h13v3M16 13h4', home: 'M3 11l9-8 9 8M5 10v10h14V10M9 20v-6h6v6' };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function BellIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>;
}

function Header({ go }: { go: Go }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const openView = (view: View) => { setProfileOpen(false); go(view); };
  return <header className="topbar"><button className="brand plain" onClick={() => go('home')}><span className="brand-mark">M</span><span>Token<span>Go</span></span></button><div className="top-actions"><button className="icon-button" onClick={() => go('map')} aria-label="เปิดแผนที่"><Icon name="map" /></button><button className="avatar" onClick={() => setProfileOpen(current => !current)} aria-expanded={profileOpen} aria-label="เปิดโปรไฟล์">NP</button>{profileOpen && <div className="profile-slider"><button type="button" onClick={() => openView('home')}><BellIcon /><span>Notify</span><i className="dot" /></button><button type="button" onClick={() => openView('wallet')}><Icon name="wallet" /><span>กระเป๋า</span></button></div>}</div></header>;
}

type HomeProps = {
  go: Go;
  bookToken: () => void;
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
};

function StationSelect({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = metroStations.find(station => station.nameTh === value);
  const filteredStations = metroStations.filter(station => {
    const search = query.trim().toLowerCase();
    return !search || `${station.code} ${station.nameTh} ${station.nameEn}`.toLowerCase().includes(search);
  });
  useEffect(() => { const closeOther = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) setOpen(false); }; window.addEventListener('station-select-open', closeOther); return () => window.removeEventListener('station-select-open', closeOther); }, [id]);
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      window.dispatchEvent(new CustomEvent('station-select-open', { detail: id }));
      const trigger = event.currentTarget;
      window.requestAnimationFrame(() => {
        const view = trigger.closest('.subview') as HTMLElement | null;
        if (!view) return;
        const viewBounds = view.getBoundingClientRect();
        const triggerBounds = trigger.getBoundingClientRect();
        view.scrollTo({ top: Math.max(0, view.scrollTop + triggerBounds.top - viewBounds.top - 18), behavior: 'smooth' });
      });
    }
    setOpen(current => !current);
    setQuery('');
  };
  return <div className="station-select"><small>{label}</small><button type="button" className="station-select-trigger" onClick={toggle}><span>{selected ? <><b>{selected.code}</b> {selected.nameTh}</> : <em>เลือกสถานี</em>}</span><i>⌄</i></button>{open && <div className="station-options"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="พิมพ์ค้นหาสถานี..." aria-label={`ค้นหา${label}`} autoFocus />{filteredStations.length ? filteredStations.map(station => <button type="button" key={station.code} className={station.code === selected?.code ? 'selected' : ''} onClick={() => { onChange(station.nameTh); setOpen(false); setQuery(''); }}><b>{station.code}</b><span>{station.nameTh}<small>{station.nameEn}</small></span></button>) : <p className="station-empty">ไม่พบสถานีที่ค้นหา</p>}</div>}</div>;
}

function Home({ go, bookToken, origin, setOrigin, destination, setDestination }: HomeProps) {
  const swap = () => { const old = origin; setOrigin(destination); setDestination(old); };
  const journey = calculateJourney(origin, destination);
  return <>
    <div className="hello"><p>สวัสดีตอนเช้า</p><h1>ไปไหนต่อดี<br/><em>วันนี้?</em></h1></div>
    <article className="balance-card"><div><span>Cash Balance</span><strong>฿124.00</strong></div><button onClick={() => go('wallet')}>ดูรายการ <span>→</span></button><div className="card-orbit" /></article>
    <div className="home-menu"><button className="home-menu-item" onClick={() => go('planner')}><span><Icon name="plus" /></span><b>จองตั๋วเลย</b></button><button className="home-menu-item" onClick={() => go('map')}><span><Icon name="map" /></span><b>ดูแผนที่</b></button><button className="home-menu-item" onClick={() => go('booking')}><span><Icon name="scan" /></span><b>ตั๋วของฉัน</b></button><button className="home-menu-item" onClick={() => go('wallet')}><span><Icon name="wallet" /></span><b>กระเป๋า</b></button></div>
    <section className="planner card">
      <div className="section-head"><div><span className="eyebrow">วางแผนการเดินทาง</span><h2>เลือกเส้นทาง</h2></div><span className="line-pill">MRT</span></div>
      <div className="route-fields">
        <label><StationSelect id="origin" label="Departure" value={origin} onChange={setOrigin} /></label>
        <button className="swap" onClick={swap} aria-label="สลับสถานี">⇅</button>
        <label><StationSelect id="destination" label="Destination" value={destination} onChange={setDestination} /></label>
      </div>
      <div className="journey-meta"><span><b>{journey.stationCount}</b> สถานี</span><span><b>{journey.stationCount * 3}</b> นาที</span><strong>฿{journey.fare}</strong></div>
      <button className="primary full" onClick={bookToken} disabled={!origin || !destination || origin === destination}>จอง Token ล่วงหน้า <span>→</span></button>
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

function MyTickets({ go, tickets, payTicket, useTicket }: { go: Go; tickets: BookedTicket[]; payTicket: (ticket: BookedTicket) => void; useTicket: (ticket: BookedTicket) => void }) {
  const [redeemTicket, setRedeemTicket] = useState<BookedTicket | null>(null);
  const confirmRedeem = () => {
    if (!redeemTicket) return;
    const ticket = redeemTicket;
    setRedeemTicket(null);
    useTicket(ticket);
  };
  return <section className="booking-container card"><div className="booking-page-head"><div><h1>ตั๋วของฉัน</h1><small>{tickets.length ? `${tickets.length} รายการ` : 'ยังไม่มีรายการ'}</small></div><button className="add-ticket" onClick={() => go('planner')} aria-label="จองตั๋วใหม่">+</button></div>{tickets.length ? <div className="booking-list">{tickets.map(ticket => <article className="booking-list-item" key={ticket.id}><div className="booking-list-head"><span>SMART TOKEN · {ticket.code}</span><b className={ticket.status}>{ticket.status === 'unpaid' ? 'รอชำระเงิน' : ticket.status === 'ready' ? 'พร้อมรับ Token' : 'เสร็จสิ้น'}</b></div><div className="booking-list-route"><div><small>จาก</small><strong>{ticket.origin}</strong></div><span>→</span><div><small>ถึง</small><strong>{ticket.destination}</strong></div></div><div className="booking-list-meta"><span>{ticket.stationCount} สถานี</span><strong>฿{ticket.fare}</strong>{ticket.status === 'unpaid' ? <button type="button" onClick={() => payTicket(ticket)}>ชำระเงิน</button> : ticket.status === 'ready' ? <button type="button" className="scan-qr-button" onClick={() => setRedeemTicket(ticket)} aria-label={`สแกน QR เพื่อรับ Token รหัส ${ticket.code}`}><span className="scan-ticket-icon" aria-hidden="true"><img src={publicAsset('icons/scan-qr-transparent.png')} alt=""/></span><small>Scan QR</small></button> : null}</div></article>)}</div> : <div className="empty-booking"><div className="empty-ticket-icon"><Icon name="map" /></div><h2>ไม่พบตั๋ว</h2><p>เริ่มวางแผนการเดินทาง<br/>และจอง Token ใบแรกของคุณ</p><button className="primary" onClick={() => go('planner')}>จองตั๋วใหม่ <span>→</span></button></div>}{redeemTicket && <div className="ticket-redeem-modal" role="dialog" aria-modal="true" aria-label="ยืนยันการแลกรับ Token" onClick={() => setRedeemTicket(null)}><section onClick={event => event.stopPropagation()}><span className="redeem-kicker">ยืนยันการแลกรับ</span><h2>รับ Token สำหรับตั๋วนี้?</h2><div className="redeem-code"><small>รหัสตั๋ว</small><strong>{redeemTicket.code}</strong></div><div className="redeem-route"><div><small>ต้นทาง</small><b>{redeemTicket.origin}</b></div><span>→</span><div><small>ปลายทาง</small><b>{redeemTicket.destination}</b></div></div><div className="redeem-meta"><span>{redeemTicket.stationCount} สถานี</span><span>ค่าโดยสาร ฿{redeemTicket.fare}</span></div><p>หลังยืนยัน ระบบจะเปิดหน้าสแกน QR ทันทีเพื่อแลกรับ Token สำหรับตั๋วรายการนี้</p><div className="redeem-actions"><button type="button" className="secondary" onClick={() => setRedeemTicket(null)}>ยกเลิก</button><button type="button" className="primary" onClick={confirmRedeem}>ยืนยันรับ Token <span>→</span></button></div></section></div>}</section>;
}

function BookingPlanner({ go, bookToken, origin, setOrigin, destination, setDestination }: HomeProps) {
  const swap = () => { const old = origin; setOrigin(destination); setDestination(old); };
  const journey = calculateJourney(origin, destination);
  return <><button className="back" onClick={() => go('booking')} aria-label="กลับหน้าตั๋ว">← ตั๋วของฉัน</button><h1>จองตั๋ว</h1><PlannerMapReplica origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/><section className="planner card"><div className="section-head"><div><span className="eyebrow">ROUTE PLANNER</span><h2>เลือกเส้นทาง</h2></div><span className="line-pill">MRT</span></div><div className="route-fields"><label><StationSelect id="origin" label="Departure" value={origin} onChange={setOrigin} /></label><button className="swap" onClick={swap} aria-label="สลับสถานี">⇅</button><label><StationSelect id="destination" label="Destination" value={destination} onChange={setDestination} /></label></div><div className="journey-meta"><span><b>{journey.stationCount}</b> สถานี</span><span><b>{journey.stationCount * 3}</b> นาที</span><strong>฿{journey.fare}</strong></div><button className="primary full" onClick={bookToken} disabled={!origin || !destination || origin === destination}>จอง Token ล่วงหน้า <span>→</span></button></section></>;
}

function PlannerMapReplica({ origin, setOrigin, destination, setDestination }: Pick<HomeProps, 'origin' | 'setOrigin' | 'destination' | 'setDestination'>) {
  const [pendingStationCode, setPendingStationCode] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const mapZoomRef = useRef(1);
  const focusAnimationRef = useRef<number | null>(null);
  const previousSelectionRef = useRef({ origin, destination });
  const mapDrag = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });
  const originStation = metroStations.find(station => station.nameTh === origin);
  const destinationStation = metroStations.find(station => station.nameTh === destination);
  const pendingStation = metroStations.find(station => station.code === pendingStationCode);
  const journey = calculateJourney(origin, destination);
  const routePoints = (origin && destination ? journey.codes : [])
    .map(code => officialMapHotspots[code === 'BL10' ? 'PP16' : code])
    .filter((point): point is { x: number; y: number } => Boolean(point));

  useEffect(() => {
    const previous = previousSelectionRef.current;
    const focusStation = origin !== previous.origin ? originStation : destination !== previous.destination ? destinationStation : null;
    previousSelectionRef.current = { origin, destination };
    const scroller = mapScrollRef.current;
    const point = focusStation && officialMapHotspots[focusStation.code === 'BL10' ? 'PP16' : focusStation.code];
    if (!scroller || !point) return;
    if (focusAnimationRef.current !== null) cancelAnimationFrame(focusAnimationRef.current);
    const startLeft = scroller.scrollLeft;
    const startTop = scroller.scrollTop;
    const targetLeft = Math.max(0, Math.min(scroller.scrollWidth - scroller.clientWidth, (point.x / 100) * scroller.scrollWidth - scroller.clientWidth / 2));
    const targetTop = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, (point.y / 100) * scroller.scrollHeight - scroller.clientHeight / 2));
    const startedAt = performance.now();
    const animateFocus = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 650);
      const eased = 1 - Math.pow(1 - progress, 3);
      scroller.scrollLeft = startLeft + (targetLeft - startLeft) * eased;
      scroller.scrollTop = startTop + (targetTop - startTop) * eased;
      if (progress < 1) focusAnimationRef.current = requestAnimationFrame(animateFocus);
      else focusAnimationRef.current = null;
    };
    focusAnimationRef.current = requestAnimationFrame(animateFocus);
    return () => {
      if (focusAnimationRef.current !== null) cancelAnimationFrame(focusAnimationRef.current);
      focusAnimationRef.current = null;
    };
  }, [origin, destination, originStation?.code, destinationStation?.code]);

  useEffect(() => {
    const scroller = mapScrollRef.current;
    if (!scroller) return;
    const zoomWithWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (focusAnimationRef.current !== null) cancelAnimationFrame(focusAnimationRef.current);
      focusAnimationRef.current = null;
      const stage = scroller.querySelector<HTMLElement>('.sim-map-stage');
      if (!stage) return;
      const viewportCenterX = scroller.scrollLeft + scroller.clientWidth / 2;
      const viewportCenterY = scroller.scrollTop + scroller.clientHeight / 2;
      const currentZoom = mapZoomRef.current;
      const nextZoom = Math.min(2.2, Math.max(.65, currentZoom * Math.exp(-event.deltaY * .0015)));
      if (Math.abs(nextZoom - currentZoom) < .001) return;
      const ratio = nextZoom / currentZoom;
      mapZoomRef.current = nextZoom;
      stage.style.width = `${1000 * nextZoom}px`;
      stage.getBoundingClientRect();
      scroller.scrollLeft = viewportCenterX * ratio - scroller.clientWidth / 2;
      scroller.scrollTop = viewportCenterY * ratio - scroller.clientHeight / 2;
      setMapZoom(nextZoom);
    };
    scroller.addEventListener('wheel', zoomWithWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', zoomWithWheel);
  }, []);

  const startMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (focusAnimationRef.current !== null) cancelAnimationFrame(focusAnimationRef.current);
    focusAnimationRef.current = null;
    const scroller = mapScrollRef.current;
    if (!scroller) return;
    mapDrag.current = { active: true, x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
    scroller.setPointerCapture(event.pointerId);
    scroller.classList.add('dragging');
  };
  const moveMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = mapScrollRef.current;
    if (!scroller || !mapDrag.current.active) return;
    scroller.scrollLeft = mapDrag.current.left - (event.clientX - mapDrag.current.x);
    scroller.scrollTop = mapDrag.current.top - (event.clientY - mapDrag.current.y);
  };
  const stopMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = mapScrollRef.current;
    mapDrag.current.active = false;
    if (scroller?.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
    scroller?.classList.remove('dragging');
  };
  const chooseOrigin = () => {
    if (!pendingStation || pendingStation.nameTh === destination) return;
    setOrigin(pendingStation.nameTh);
    setPendingStationCode(null);
  };
  const chooseDestination = () => {
    if (!pendingStation || pendingStation.nameTh === origin) return;
    setDestination(pendingStation.nameTh);
    setPendingStationCode(null);
  };
  const resetRoute = () => {
    setOrigin('');
    setDestination('');
    setPendingStationCode(null);
  };

  return <>
    <div className="sim-map-heading planner-map-heading"><div><span className="eyebrow">INTERACTIVE MRT MAP</span><h1>เลือกสถานีบนแผนที่</h1></div><button type="button" onClick={resetRoute}>เริ่มใหม่</button></div>
    <article className="sim-map-card planner-map-card">
      <div ref={mapScrollRef} className="sim-map-scroll" aria-label="แผนที่รถไฟฟ้า MRT คลิกค้างแล้วลากเพื่อเลื่อน" onPointerDown={startMapDrag} onPointerMove={moveMapDrag} onPointerUp={stopMapDrag} onPointerCancel={stopMapDrag}>
        <div className="official-map-stage sim-map-stage" style={{ width: `${1000 * mapZoom}px` }}>
          <img className="official-mrt-map" src={publicAsset('maps/mrt-network-map.jpg')} alt="แผนที่รถไฟฟ้า MRT จาก BEM" width="6287" height="4788" style={{ width: '100%' }} draggable={false}/>
          {routePoints.length > 1 && <svg className="map-route-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={routePoints.map(point => `${point.x},${point.y}`).join(' ')}/></svg>}
          {metroStations.filter(station => station.code !== 'BL10').map(station => {
            const point = officialMapHotspots[station.code];
            const isOrigin = station.code === originStation?.code || (station.code === 'PP16' && originStation?.code === 'BL10');
            const isDestination = station.code === destinationStation?.code || (station.code === 'PP16' && destinationStation?.code === 'BL10');
            const isTaoPoon = station.code === 'PP16';
            return point && <button key={station.code} type="button" className={`map-hotspot ${station.code.startsWith('BL') ? 'blue' : 'purple'} ${isOrigin ? 'origin' : ''} ${isDestination ? 'destination' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onPointerDown={event => event.stopPropagation()} onClick={() => setPendingStationCode(station.code)} aria-label={`เลือก ${station.nameTh} ${isTaoPoon ? 'BL10 / PP16' : station.code}`}><span><b>{isTaoPoon ? 'BL10 / PP16' : station.code}</b>{station.nameTh}</span></button>;
          })}
        </div>
      </div>
      <div className="map-legend sim-map-legend"><span><i className="blue"/>สายสีน้ำเงิน</span><span><i className="purple"/>สายสีม่วง</span><b className="zoom-level">{Math.round(mapZoom * 100)}%</b><span className="drag-hint">คลิกค้างเพื่อลาก · Scroll เพื่อซูม</span></div>
    </article>
    {pendingStation && <div className="sim-station-action-modal" role="dialog" aria-modal="true" aria-label="เลือกการใช้งานสถานี" onClick={() => setPendingStationCode(null)}><section onClick={event => event.stopPropagation()}><span>เลือกสถานี</span><h2>{pendingStation.nameTh}</h2><p>{pendingStation.code === 'PP16' ? 'BL10 / PP16' : pendingStation.code}</p><div><button type="button" className="primary" onClick={chooseOrigin} disabled={pendingStation.nameTh === destination}>เลือกเป็นต้นทาง</button><button type="button" className="secondary" onClick={chooseDestination} disabled={pendingStation.nameTh === origin}>เลือกเป็นปลายทาง</button></div><button type="button" className="modal-back" onClick={() => setPendingStationCode(null)}>ยกเลิก</button></section></div>}
  </>;
}

function BookingMap({ origin, destination }: Route) {
  return <article className="booking-map"><div className="booking-map-head"><span>ROUTE MAP</span><b>BLUE LINE</b></div><div className="booking-map-body"><i className="booking-route-line"/><div className="booking-point departure"><small>Departure</small><strong>{origin}</strong></div><div className="booking-point destination"><small>Destination</small><strong>{destination}</strong></div></div></article>;
}

function BookingInteractiveMap({ origin, setOrigin, destination, setDestination }: Pick<HomeProps, 'origin' | 'setOrigin' | 'destination' | 'setDestination'>) {
  const [pendingStationCode, setPendingStationCode] = useState<string | null>(null);
  const [cameraScale, setCameraScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const cameraRef = useRef({ scale: 1, x: 0, y: 0 });
  const previousRouteRef = useRef({ origin, destination });
  const hasFocusedStationRef = useRef(false);
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0, cameraX: 0, cameraY: 0 });
  const journey = calculateJourney(origin, destination);
  const originStation = metroStations.find(station => station.nameTh === origin);
  const destinationStation = metroStations.find(station => station.nameTh === destination);
  const pendingStation = metroStations.find(station => station.code === pendingStationCode);
  const routePoints = journey.codes
    .map(code => officialMapHotspots[code === 'BL10' ? 'PP16' : code])
    .filter((point): point is { x: number; y: number } => Boolean(point));
  const originPoint = originStation && officialMapHotspots[originStation.code === 'BL10' ? 'PP16' : originStation.code];
  const destinationPoint = destinationStation && officialMapHotspots[destinationStation.code === 'BL10' ? 'PP16' : destinationStation.code];
  const clampCamera = (scale: number, x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { scale, x, y };
    const overflowX = Math.max(0, canvas.clientWidth * scale - canvas.clientWidth);
    const overflowY = Math.max(0, canvas.clientHeight * scale - canvas.clientHeight);
    return {
      scale,
      x: Math.min(0, Math.max(-overflowX, x)),
      y: Math.min(0, Math.max(-overflowY, y)),
    };
  };
  useEffect(() => {
    const previousRoute = previousRouteRef.current;
    const focusPoint = origin !== previousRoute.origin ? originPoint : destination !== previousRoute.destination ? destinationPoint : null;
    previousRouteRef.current = { origin, destination };
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage || !focusPoint) return;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    const startCamera = { ...cameraRef.current };
    const targetScale = hasFocusedStationRef.current ? startCamera.scale : Math.max(2.5, startCamera.scale);
    const targetCamera = clampCamera(
      targetScale,
      canvas.clientWidth / 2 - (focusPoint.x / 100) * canvas.clientWidth * targetScale,
      canvas.clientHeight / 2 - (focusPoint.y / 100) * canvas.clientHeight * targetScale,
    );
    const startedAt = performance.now();
    const duration = 650;
    hasFocusedStationRef.current = true;
    const animateCamera = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const scale = startCamera.scale + (targetScale - startCamera.scale) * eased;
      const camera = clampCamera(
        scale,
        startCamera.x + (targetCamera.x - startCamera.x) * eased,
        startCamera.y + (targetCamera.y - startCamera.y) * eased,
      );
      cameraRef.current = camera;
      stage.style.width = `${scale * 100}%`;
      stage.style.left = `${progress === 1 ? Math.round(camera.x) : camera.x}px`;
      stage.style.top = `${progress === 1 ? Math.round(camera.y) : camera.y}px`;
      if (progress < 1) animationRef.current = requestAnimationFrame(animateCamera);
      else { animationRef.current = null; setCameraScale(targetScale); }
    };
    animationRef.current = requestAnimationFrame(animateCamera);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [origin, destination, originPoint, destinationPoint]);
  useEffect(() => () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const zoomMap = (event: WheelEvent) => {
      event.preventDefault();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      const current = cameraRef.current;
      const nextScale = Math.min(3.5, Math.max(1, current.scale * Math.exp(-event.deltaY * .0015)));
      const bounds = canvas.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      const mapX = (pointerX - current.x) / current.scale;
      const mapY = (pointerY - current.y) / current.scale;
      const camera = clampCamera(nextScale, pointerX - mapX * nextScale, pointerY - mapY * nextScale);
      cameraRef.current = camera;
      stage.style.width = `${nextScale * 100}%`;
      stage.style.left = `${camera.x}px`;
      stage.style.top = `${camera.y}px`;
      setCameraScale(nextScale);
    };
    canvas.addEventListener('wheel', zoomMap, { passive: false });
    return () => canvas.removeEventListener('wheel', zoomMap);
  }, []);
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('.map-hotspot')) return;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    const camera = cameraRef.current;
    dragRef.current = { active: true, moved: false, x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('dragging');
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !stageRef.current) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) dragRef.current.moved = true;
    const camera = clampCamera(
      cameraRef.current.scale,
      dragRef.current.cameraX + deltaX,
      dragRef.current.cameraY + deltaY,
    );
    cameraRef.current = camera;
    stageRef.current.style.left = `${camera.x}px`;
    stageRef.current.style.top = `${camera.y}px`;
  };
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.classList.remove('dragging');
  };
  const chooseOrigin = () => {
    if (!pendingStation || pendingStation.nameTh === destination) return;
    setOrigin(pendingStation.nameTh);
    setPendingStationCode(null);
  };
  const chooseDestination = () => {
    if (!pendingStation || pendingStation.nameTh === origin) return;
    setDestination(pendingStation.nameTh);
    setPendingStationCode(null);
  };
  const resetMapRoute = () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setOrigin('');
    setDestination('');
    setPendingStationCode(null);
    previousRouteRef.current = { origin: '', destination: '' };
    hasFocusedStationRef.current = false;
    cameraRef.current = { scale: 1, x: 0, y: 0 };
    setCameraScale(1);
    if (stageRef.current) {
      stageRef.current.style.width = '100%';
      stageRef.current.style.left = '0';
      stageRef.current.style.top = '0';
    }
  };
  return <article className="booking-map booking-interactive-preview">
    <div className="booking-map-head"><span>INTERACTIVE ROUTE MAP</span><div><b>{Math.round(cameraScale * 100)}%</b><button type="button" onClick={resetMapRoute}>เริ่มใหม่</button></div></div>
    <div ref={canvasRef} className="booking-interactive-canvas" aria-label="แผนที่เลือกต้นทางและปลายทาง" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <div ref={stageRef} className="official-map-stage booking-interactive-stage">
        <img className="official-mrt-map" src={publicAsset('maps/mrt-network-map.jpg')} alt="แผนที่รถไฟฟ้า MRT จาก BEM" width="6287" height="4788" draggable={false}/>
        {routePoints.length > 1 && <svg className="booking-route-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={routePoints.map(point => `${point.x},${point.y}`).join(' ')}/></svg>}
        {metroStations.filter(station => station.code !== 'BL10').map(station => {
          const point = officialMapHotspots[station.code];
          const isOrigin = station.code === originStation?.code || (station.code === 'PP16' && originStation?.code === 'BL10');
          const isDestination = station.code === destinationStation?.code || (station.code === 'PP16' && destinationStation?.code === 'BL10');
          const isTaoPoon = station.code === 'PP16';
          return point && <button key={station.code} type="button" className={`map-hotspot ${station.code.startsWith('BL') ? 'blue' : 'purple'} ${isOrigin ? 'origin' : ''} ${isDestination ? 'destination' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onPointerDown={event => event.stopPropagation()} onClick={() => setPendingStationCode(station.code)} aria-label={`เลือก ${station.nameTh} ${isTaoPoon ? 'BL10 / PP16' : station.code}`}><span><b>{isTaoPoon ? 'BL10 / PP16' : station.code}</b>{station.nameTh}</span></button>;
        })}
      </div>
    </div>
    <div className="booking-map-help">ลากเพื่อเลื่อน · Scroll เพื่อซูม · กดหมุดเพื่อเลือกสถานี</div>
    {pendingStation && <div className="sim-station-action-modal" role="dialog" aria-modal="true" aria-label="เลือกการใช้งานสถานี" onClick={() => setPendingStationCode(null)}><section onClick={event => event.stopPropagation()}><span>เลือกสถานี</span><h2>{pendingStation.nameTh}</h2><p>{pendingStation.code === 'PP16' ? 'BL10 / PP16' : pendingStation.code}</p><div><button type="button" className="primary" onClick={chooseOrigin} disabled={pendingStation.nameTh === destination}>เลือกเป็นต้นทาง</button><button type="button" className="secondary" onClick={chooseDestination} disabled={pendingStation.nameTh === origin}>เลือกเป็นปลายทาง</button></div><button type="button" className="modal-back" onClick={() => setPendingStationCode(null)}>ยกเลิก</button></section></div>}
  </article>;
}

function Checkout({ go, route, pay }: { go: Go; route: Route; pay: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cash'>('promptpay');
  const fare = route.fare ?? calculateJourney(route.origin, route.destination).fare;
  return <><button className="back" onClick={() => go('booking')} aria-label="กลับหน้าตั๋วของฉัน">← กลับ</button><h1>พร้อมออกเดินทาง</h1><RouteTicket {...route}/><div className="summary card"><h3>สรุปค่าใช้จ่าย</h3><p><span>ค่าโดยสาร</span><b>฿{fare}.00</b></p><p><span>ค่าบริการ</span><b>฿0.00</b></p><hr/><p className="total"><span>ยอดชำระ</span><b>฿{fare}.00</b></p></div><div className="payment-methods" role="radiogroup" aria-label="เลือกช่องทางชำระเงิน"><button type="button" className={`payment payment-option card ${paymentMethod === 'promptpay' ? 'selected' : ''}`} onClick={() => setPaymentMethod('promptpay')} role="radio" aria-checked={paymentMethod === 'promptpay'}><span className="payment-logo promptpay">PP</span><span className="payment-copy"><b>PromptPay</b><small>ชำระผ่านแอปธนาคารหรือ QR PromptPay</small></span><i>{paymentMethod === 'promptpay' ? '✓' : ''}</i></button><button type="button" className={`payment payment-option card ${paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cash')} role="radio" aria-checked={paymentMethod === 'cash'}><span className="payment-logo">฿</span><span className="payment-copy"><b>Cash Balance</b><small>ยอดคงเหลือ ฿124.00</small></span><i>{paymentMethod === 'cash' ? '✓' : ''}</i></button></div><button className="primary full" onClick={pay}>ยืนยันและชำระ ฿{fare} <span>→</span></button></>;
}

function Tickets({ go, route }: { go: Go; route: Route }) {
  return <><button className="back" onClick={() => go('home')} aria-label="กลับหน้าหลัก">← กลับ</button><h1>พร้อมรับ Token</h1><RouteTicket {...route} live/><div className="info-strip"><span>ⓘ</span><p><b>ปลอดภัยกว่า QR แบบเดิม</b><small>QR ที่ตู้มีอายุเพียง 45 วินาที และใช้ได้ครั้งเดียว</small></p></div><button className="primary full" onClick={() => go('machine')}>ไปที่ Express Machine <span>→</span></button></>;
}

function Machine({ go, route }: { go: Go; route: Route }) {
  const [step, setStep] = useState<Step>('queue');
  useEffect(() => { if (step !== 'scan') return; const id = setTimeout(() => setStep('success'), 1900); return () => clearTimeout(id); }, [step]);
  const finish = () => { if (step === 'queue') setStep('scan'); else if (step === 'success') { setStep('queue'); go('home'); } };
  return <><button className="back" onClick={() => go('home')} aria-label="กลับหน้าหลัก">← หน้าหลัก</button><RouteTicket {...route} live/><h1>{step === 'queue' ? 'รับ Token แบบด่วน' : step === 'scan' ? 'สแกน QR จากหน้าตู้' : 'เดินทางได้เลย'}</h1>
    {step === 'queue' && <div className="queue-panel"><div className="queue-ring"><span>คิวของคุณ</span><strong>A07</strong></div><div><h3>อีก 2 คิวจะถึงคุณ</h3><p>เวลารอประมาณ 2 นาที</p><div className="queue-progress"><i/></div></div></div>}
    {step === 'scan' && <div className="scan-panel"><div className="scan-frame"><div className="qr"/><i className="scan-line"/></div><p>กำลังตรวจสอบ QR จากตู้...</p></div>}
    {step === 'success' && <div className="success-panel"><div className="token"><i>V</i></div><span className="success-check">✓</span><h2>รับ Token สำเร็จ</h2><p>ตู้ BL21 จ่าย Token แล้ว<br/>ประตูทางเข้าอยู่ทางขวามือ</p></div>}
    {step !== 'scan' && <button className="primary full" onClick={finish}>{step === 'queue' ? <>จำลอง: ถึงคิวแล้ว <span>→</span></> : 'กลับหน้าหลัก'}</button>}
  </>;
}

function MapView({ go, backView, origin, setOrigin, destination, setDestination }: HomeProps & { backView: View }) {
  const [pendingStationCode, setPendingStationCode] = useState<string | null>(null);
  const [hasSelectedOrigin, setHasSelectedOrigin] = useState(false);
  const [hasSelectedDestination, setHasSelectedDestination] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const mapZoomRef = useRef(1);
  const mapDrag = useRef({ active: false, moved: false, x: 0, y: 0, left: 0, top: 0 });
  const originStation = metroStations.find(station => station.nameTh === origin);
  const destinationStation = metroStations.find(station => station.nameTh === destination);
  const pendingStation = metroStations.find(station => station.code === pendingStationCode);
  const journey = calculateJourney(origin, destination);
  const routePoints = (hasSelectedOrigin && hasSelectedDestination ? journey.codes : [])
    .map(code => officialMapHotspots[code === 'BL10' ? 'PP16' : code])
    .filter((point): point is { x: number; y: number } => Boolean(point));
  useEffect(() => {
    const scroller = mapScrollRef.current;
    const point = originStation && officialMapHotspots[originStation.code === 'BL10' ? 'PP16' : originStation.code];
    if (!hasSelectedOrigin || !scroller || !point) return;
    scroller.scrollLeft = Math.max(0, (point.x / 100) * scroller.scrollWidth - scroller.clientWidth / 2);
    scroller.scrollTop = Math.max(0, (point.y / 100) * scroller.scrollHeight - scroller.clientHeight / 2);
  }, [hasSelectedOrigin, originStation?.code]);
  useEffect(() => {
    const scroller = mapScrollRef.current;
    if (!scroller) return;
    const zoomWithWheel = (event: WheelEvent) => {
      event.preventDefault();
      const stage = scroller.querySelector<HTMLElement>('.sim-map-stage');
      if (!stage) return;
      const viewportCenterX = scroller.scrollLeft + scroller.clientWidth / 2;
      const viewportCenterY = scroller.scrollTop + scroller.clientHeight / 2;
      const currentZoom = mapZoomRef.current;
      const nextZoom = Math.min(2.2, Math.max(0.65, currentZoom * Math.exp(-event.deltaY * 0.0015)));
      if (Math.abs(nextZoom - currentZoom) < 0.001) return;
      const ratio = nextZoom / currentZoom;
      mapZoomRef.current = nextZoom;
      stage.style.width = `${1000 * nextZoom}px`;
      stage.getBoundingClientRect();
      scroller.scrollLeft = viewportCenterX * ratio - scroller.clientWidth / 2;
      scroller.scrollTop = viewportCenterY * ratio - scroller.clientHeight / 2;
      setMapZoom(nextZoom);
    };
    scroller.addEventListener('wheel', zoomWithWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', zoomWithWheel);
  }, []);
  const startMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const scroller = mapScrollRef.current;
    if (!scroller) return;
    mapDrag.current = { active: true, moved: false, x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
    scroller.setPointerCapture(event.pointerId);
    scroller.classList.add('dragging');
  };
  const moveMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = mapScrollRef.current;
    if (!scroller || !mapDrag.current.active) return;
    const deltaX = event.clientX - mapDrag.current.x;
    const deltaY = event.clientY - mapDrag.current.y;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) mapDrag.current.moved = true;
    scroller.scrollLeft = mapDrag.current.left - deltaX;
    scroller.scrollTop = mapDrag.current.top - deltaY;
  };
  const stopMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = mapScrollRef.current;
    mapDrag.current.active = false;
    if (scroller?.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
    scroller?.classList.remove('dragging');
  };
  const chooseOrigin = () => {
    if (!pendingStation || (hasSelectedDestination && pendingStation.nameTh === destination)) return;
    setOrigin(pendingStation.nameTh);
    setHasSelectedOrigin(true);
    setPendingStationCode(null);
  };
  const chooseDestination = () => {
    if (!pendingStation || (hasSelectedOrigin && pendingStation.nameTh === origin)) return;
    setDestination(pendingStation.nameTh);
    setHasSelectedDestination(true);
    setPendingStationCode(null);
  };
  const resetRoute = () => {
    setHasSelectedOrigin(false);
    setHasSelectedDestination(false);
    setPendingStationCode(null);
  };

  return <>
    <button className="back" onClick={() => go(backView)} aria-label="กลับหน้าก่อนหน้า">← {backView === 'planner' ? 'หน้าจองตั๋ว' : 'หน้าหลัก'}</button>
    <div className="sim-map-heading"><div><span className="eyebrow">INTERACTIVE MRT MAP</span><h1>เลือกสถานีบนแผนที่</h1></div><button type="button" onClick={resetRoute}>เริ่มใหม่</button></div>
    <article className="sim-map-card">
      <div ref={mapScrollRef} className="sim-map-scroll" aria-label="แผนที่รถไฟฟ้า MRT คลิกค้างแล้วลากเพื่อเลื่อน" onPointerDown={startMapDrag} onPointerMove={moveMapDrag} onPointerUp={stopMapDrag} onPointerCancel={stopMapDrag}>
        <div className="official-map-stage sim-map-stage" style={{ width: `${1000 * mapZoom}px` }}>
          <img className="official-mrt-map" src={publicAsset('maps/mrt-network-map.jpg')} alt="แผนที่รถไฟฟ้า MRT จาก BEM" width="6287" height="4788" style={{ width: '100%' }} draggable={false}/>
          {routePoints.length > 1 && <svg className="map-route-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={routePoints.map(point => `${point.x},${point.y}`).join(' ')}/></svg>}
          {metroStations.filter(station => station.code !== 'BL10').map(station => {
            const point = officialMapHotspots[station.code];
            const isOrigin = hasSelectedOrigin && (station.code === originStation?.code || (station.code === 'PP16' && originStation?.code === 'BL10'));
            const isDestination = hasSelectedDestination && (station.code === destinationStation?.code || (station.code === 'PP16' && destinationStation?.code === 'BL10'));
            const isTaoPoon = station.code === 'PP16';
            return point && <button key={station.code} type="button" className={`map-hotspot ${station.code.startsWith('BL') ? 'blue' : 'purple'} ${isOrigin ? 'origin' : ''} ${isDestination ? 'destination' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onPointerDown={event => event.stopPropagation()} onClick={() => setPendingStationCode(station.code)} aria-label={`เลือก ${station.nameTh} ${isTaoPoon ? 'BL10 / PP16' : station.code}`}><span><b>{isTaoPoon ? 'BL10 / PP16' : station.code}</b>{station.nameTh}</span></button>;
          })}
        </div>
      </div>
      <div className="map-legend sim-map-legend"><span><i className="blue"/>สายสีน้ำเงิน</span><span><i className="purple"/>สายสีม่วง</span><b className="zoom-level">{Math.round(mapZoom * 100)}%</b><span className="drag-hint">คลิกค้างเพื่อลาก · Scroll เพื่อซูม</span></div>
    </article>
    <section className="sim-map-summary card">
      <div><small>ต้นทาง</small><b>{hasSelectedOrigin && originStation ? <>{originStation.nameTh} <em>{originStation.code}</em></> : 'ยังไม่ได้เลือก'}</b></div>
      <span>→</span>
      <div><small>ปลายทาง</small><b>{hasSelectedDestination && destinationStation ? <>{destinationStation.nameTh} <em>{destinationStation.code}</em></> : 'ยังไม่ได้เลือก'}</b></div>
      <p>{hasSelectedOrigin && hasSelectedDestination ? <><span>{journey.stationCount} สถานี · ประมาณ {Math.max(1, journey.stationCount * 3)} นาที</span><strong>฿{journey.fare}</strong></> : <span>เลือกต้นทางและปลายทางเพื่อดูเส้นทาง</span>}</p>
    </section>
    <button className="primary full" onClick={() => go('planner')} disabled={!hasSelectedOrigin || !hasSelectedDestination || origin === destination}>ใช้เส้นทางนี้เพื่อจองตั๋ว <span>→</span></button>
    {pendingStation && <div className="sim-station-action-modal" role="dialog" aria-modal="true" aria-label="เลือกการใช้งานสถานี" onClick={() => setPendingStationCode(null)}><section onClick={event => event.stopPropagation()}><span>เลือกสถานี</span><h2>{pendingStation.nameTh}</h2><p>{pendingStation.code === 'PP16' ? 'BL10 / PP16' : pendingStation.code}</p><div><button type="button" className="primary" onClick={chooseOrigin} disabled={hasSelectedDestination && pendingStation.nameTh === destination}>เลือกเป็นต้นทาง</button><button type="button" className="secondary" onClick={chooseDestination} disabled={hasSelectedOrigin && pendingStation.nameTh === origin}>เลือกเป็นปลายทาง</button></div><button type="button" className="modal-back" onClick={() => setPendingStationCode(null)}>ยกเลิก</button></section></div>}
  </>;
}

function TokenScanner({ go, ticket, onComplete }: { go: Go; ticket: BookedTicket | null; onComplete: (ticketId: number) => void }) {
  const [scanned, setScanned] = useState(false);
  useEffect(() => {
    if (!ticket) return;
    const id = setTimeout(() => {
      setScanned(true);
      onComplete(ticket.id);
    }, 1900);
    return () => clearTimeout(id);
  }, [ticket?.id]);
  if (!ticket) return <><button className="back" onClick={() => go('booking')}>← ตั๋วของฉัน</button><div className="scan-panel"><p>ไม่พบตั๋วสำหรับสแกน</p></div></>;
  return <><button className="back" onClick={() => go('booking')} aria-label="กลับหน้าตั๋วของฉัน">← ตั๋วของฉัน</button><h1>{scanned ? 'รับ Token สำเร็จ' : 'สแกน QR เพื่อรับ Token'}</h1>{!scanned ? <div className="direct-scan-panel"><span className="scanner-code">รหัสตั๋ว <b>{ticket.code}</b></span><div className="scan-frame"><div className="qr"/><i className="scan-line"/></div><p>กำลังตรวจสอบ QR สำหรับเส้นทาง<br/><b>{ticket.origin}</b> → <b>{ticket.destination}</b></p><small>กรุณารอ ระบบกำลังยืนยันสิทธิ์การรับ Token</small></div> : <div className="success-panel"><div className="token"><i>V</i></div><span className="success-check">✓</span><h2>แลกรับ Token เรียบร้อย</h2><p>ตั๋วรหัส {ticket.code}<br/>{ticket.origin} → {ticket.destination}</p><button className="primary full" onClick={() => go('home')}>กลับหน้าหลัก <span>→</span></button></div>}</>;
}

function Wallet({ go }: { go: Go }) {
  const items: [string, string, string, string, boolean?][] = [['↙','คืนเงินตั๋วหมดอายุ','STT—09112 · 6 ก.ค.','+฿28',true],['↗','จอง Token · สายสีน้ำเงิน','STT—10293 · วันนี้','−฿28'],['+','เติม Cash Balance','PromptPay · 2 ก.ค.','+฿100',true]];
  return <><button className="back" onClick={() => go('home')} aria-label="กลับหน้าหลัก">← กลับ</button><h1>Cash Balance</h1><article className="wallet-hero"><small>ยอดเงินพร้อมใช้</small><strong>฿124.00</strong><span>อัปเดตเมื่อสักครู่</span></article><div className="quick-head"><h2>รายการล่าสุด</h2><button>ดูทั้งหมด</button></div><div className="transactions">{items.map(([icon,title,meta,amount,credit]) => <div key={title}><i className={credit ? 'credit' : ''}>{icon}</i><p><b>{title}</b><small>{meta}</small></p><strong className={credit ? 'plus' : ''}>{amount}</strong></div>)}</div><button className="secondary full">ยื่นคำขอคืนเงินจริง</button></>;
}

function Nav({ view, go }: { view: View; go: Go }) {
  const tabs: [View, IconName, string][] = [['home','home','หน้าหลัก'],['booking','scan','ตั๋วของฉัน'],['wallet','wallet','กระเป๋า']];
  return <nav className="bottom-nav">{tabs.map(([id,icon,label]) => <button key={id} className={`${view === id ? 'nav-active ' : ''}${id === 'booking' ? 'scan-nav' : ''}`} onClick={() => go(id)}><span><Icon name={icon} /></span>{label}</button>)}</nav>;
}

function WelcomePage({ onSimulate, onInteractiveMap }: { onSimulate: () => void; onInteractiveMap: () => void }) {
  return <main className="welcome-page"><div className="welcome-glow welcome-glow-a"/><div className="welcome-glow welcome-glow-b"/><section className="welcome-shell"><header className="welcome-header"><div className="welcome-brand"><span className="welcome-mark">M</span><span>MRT<span> - TokenGo</span></span></div><span className="welcome-status"><i/> Blue Line</span></header><div className="welcome-hero"><span className="welcome-kicker">SMART TRANSIT TOKEN</span><h1>เดินทางง่ายขึ้น<br/><em>เริ่มต้นได้ที่นี่</em></h1><p>วางแผนเส้นทาง จอง Token และติดตามการเดินทางของคุณในที่เดียว</p><div className="welcome-actions"><button className="welcome-cta" onClick={onSimulate}>เข้าสู่ Simulate App <span>→</span></button><button className="welcome-map-cta" onClick={onInteractiveMap}><Icon name="map"/> แผนที่ Interactive</button></div></div><div className="welcome-orbit"><div className="welcome-orbit-inner"><span>BL</span><strong>01</strong></div><i className="orbit-dot orbit-dot-a"/><i className="orbit-dot orbit-dot-b"/></div><div className="welcome-features"><article><span><Icon name="map"/></span><b>วางแผนเส้นทาง</b><small>เลือกสถานีที่ต้องการเดินทาง</small></article><article><span><Icon name="plus"/></span><b>จอง Token</b><small>รับ Token ได้ง่ายและรวดเร็ว</small></article><article><span><Icon name="scan"/></span><b>ดูแผนที่</b><small>ติดตามเส้นทางสายสีน้ำเงิน</small></article></div><footer className="welcome-footer"><span>พร้อมเดินทางไปกับคุณ</span><span>v1.0 · MRT Bangkok</span></footer></section></main>;
}

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'simulate' | 'interactive-map'>('welcome');
  if (screen === 'simulate') return <SimulateApp onWelcome={() => setScreen('welcome')}/>;
  if (screen === 'interactive-map') return <InteractiveMapPage onBack={() => setScreen('welcome')}/>;
  return <WelcomePage onSimulate={() => setScreen('simulate')} onInteractiveMap={() => setScreen('interactive-map')}/>;
}

const blueMapHotspots = [
  [28.7, 71.0], [28.8, 68.8], [28.6, 66.2], [28.1, 62.9], [28.8, 59.3], [28.8, 55.5], [28.9, 51.8], [30.2, 48.2], [33.3, 44.8], [37.5, 43.9],
  [41.1, 43.5], [47.2, 43.5], [48.6, 40.3], [51.0, 37.0], [53.8, 37.0], [56.1, 40.2], [58.2, 42.5], [59.8, 44.7], [59.8, 49.0], [59.8, 51.8],
  [60.7, 55.2], [60.9, 61.2], [59.6, 64.3], [57.9, 67.1], [54.8, 67.1], [51.6, 67.1], [47.5, 67.1], [44.9, 67.1], [41.2, 67.1], [37.7, 67.1],
  [34.4, 68.8], [32.0, 71.1], [26.6, 71.0], [22.8, 71.0], [20.7, 71.1], [18.1, 71.0], [15.5, 71.0], [13.0, 71.0],
] as const;

const purpleMapHotspots = [
  [3.4, 20.8], [3.3, 24.6], [5.1, 28.7], [8.5, 28.7], [12.2, 28.7], [15.7, 28.7], [19.2, 28.7], [22.3, 28.7], [25.4, 28.7], [27.9, 28.7],
  [30.9, 28.6], [30.0, 31.4], [32.4, 34.7], [34.5, 37.7], [36.9, 40.4], [37.4, 43.3],
] as const;

const officialMapHotspots: Record<string, { x: number; y: number }> = Object.fromEntries([
  ...blueLineStations.map((station, index) => [station.code, { x: blueMapHotspots[index][0], y: blueMapHotspots[index][1] }]),
  ...purpleLineStations.map((station, index) => [station.code, { x: purpleMapHotspots[index][0], y: purpleMapHotspots[index][1] }]),
]);

function InteractiveMapPage({ onBack }: { onBack: () => void }) {
  const [originCode, setOriginCode] = useState<string | null>(null);
  const [destinationCode, setDestinationCode] = useState<string | null>(null);
  const [pendingStationCode, setPendingStationCode] = useState<string | null>(null);
  const [coordinateDebug, setCoordinateDebug] = useState(false);
  const [mapCoordinate, setMapCoordinate] = useState<{ x: number; y: number } | null>(null);
  const origin = metroStations.find(station => station.code === originCode);
  const destination = metroStations.find(station => station.code === destinationCode);
  const journey = origin && destination ? calculateJourney(origin.nameTh, destination.nameTh) : null;
  const routePoints = journey?.codes
    .map(code => officialMapHotspots[code === 'BL10' ? 'PP16' : code])
    .filter((point): point is { x: number; y: number } => Boolean(point)) ?? [];
  const readMapCoordinate = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setMapCoordinate({
      x: Number((((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1)),
      y: Number((((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1)),
    });
  };
  const selectStation = (code: string) => {
    setPendingStationCode(code);
  };
  const selectionStep = !originCode ? 'เลือกสถานีต้นทาง' : !destinationCode ? 'เลือกสถานีปลายทาง' : 'เลือกสถานีครบแล้ว';
  const undoSelection = () => {
    if (destinationCode) setDestinationCode(null);
    else setOriginCode(null);
  };
  const pendingStation = metroStations.find(station => station.code === pendingStationCode);
  const chooseOrigin = () => { if (pendingStationCode) { setOriginCode(pendingStationCode); setDestinationCode(null); setPendingStationCode(null); } };
  const chooseDestination = () => { if (pendingStationCode && pendingStationCode !== originCode) { setDestinationCode(pendingStationCode); setPendingStationCode(null); } };
  useEffect(() => {
    if (!pendingStationCode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [pendingStationCode]);

  return <main className="interactive-map-page"><header className="interactive-map-header"><button className="map-back" onClick={onBack}>← กลับ Welcome</button><div><span>INTERACTIVE MRT MAP</span><h1>เลือกสถานีบนแผนที่</h1></div><button className="map-reset" onClick={() => { setOriginCode(null); setDestinationCode(null); }}>เริ่มใหม่</button></header><section className="interactive-map-layout"><div className="interactive-map-canvas"><div className="official-map-stage" onClick={coordinateDebug ? readMapCoordinate : undefined} onContextMenu={event => event.preventDefault()}><img className="official-mrt-map" src={publicAsset('maps/mrt-network-map.jpg')} alt="แผนที่รถไฟฟ้า MRT จาก BEM" draggable={false}/>{routePoints.length > 1 && <svg className="map-route-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={routePoints.map(point => `${point.x},${point.y}`).join(' ')}/></svg>}{coordinateDebug && mapCoordinate && <span className="map-coordinate" style={{ left: `${mapCoordinate.x}%`, top: `${mapCoordinate.y}%` }}>x: {mapCoordinate.x}, y: {mapCoordinate.y}</span>}{metroStations.filter(station => station.code !== 'BL10').map(station => { const point = officialMapHotspots[station.code]; const isTaoPoon = station.code === 'PP16'; return point && <button key={station.code} className={`map-hotspot ${station.code.startsWith('BL') ? 'blue' : 'purple'} ${station.code === originCode ? 'origin' : ''} ${station.code === destinationCode ? 'destination' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={event => { event.stopPropagation(); selectStation(station.code); }} aria-label={`เลือก ${station.nameTh} ${isTaoPoon ? 'BL10 / PP16' : station.code}`}><span><b>{isTaoPoon ? 'BL10 / PP16' : station.code}</b>{station.nameTh}</span></button>; })}</div><div className="map-legend"><span><i className="blue"/>สายสีน้ำเงิน</span><span><i className="purple"/>สายสีม่วง</span><span>กดจุดบนแผนที่เพื่อเลือกสถานี</span></div>{coordinateDebug && <div className="map-coordinate-help">เปิดตัวอ่านพิกัดแล้ว — คลิกบนแผนที่เพื่ออ่าน x, y</div>}<div className="map-station-picker">{metroStations.filter(station => station.code !== 'BL10').map(station => <button key={station.code} className={`${station.code.startsWith('BL') ? 'blue' : 'purple'} ${station.code === originCode ? 'origin' : ''} ${station.code === destinationCode ? 'destination' : ''}`} onClick={() => selectStation(station.code)}><b>{station.code === 'PP16' ? 'BL10 / PP16' : station.code}</b><span>{station.nameTh}</span></button>)}</div></div><aside className="interactive-map-info"><span className="map-info-kicker">ROUTE SELECTION</span>{pendingStation && <div className="station-action-modal" role="dialog" aria-modal="true" aria-label="เลือกการใช้งานสถานี"><section><span>เลือกสถานี</span><h2>{pendingStation.nameTh}</h2><p>{pendingStation.code}</p><div><button type="button" className="primary" onClick={chooseOrigin}>เลือกเป็นต้นทาง</button><button type="button" className="secondary" onClick={chooseDestination} disabled={pendingStation.code === originCode}>เลือกเป็นปลายทาง</button><button type="button" className="modal-back" onClick={() => setPendingStationCode(null)}>← ย้อนกลับ</button></div></section></div>}<div className="map-selection"><small>ต้นทาง</small><b>{origin ? `${origin.nameTh} (${origin.code})` : 'กดเลือกสถานีแรก'}</b></div><div className="map-selection"><small>ปลายทาง</small><b>{destination ? `${destination.nameTh} (${destination.code})` : 'กดเลือกสถานีที่สอง'}</b></div>{journey && <div className="map-result"><span>{journey.stationCount} สถานี</span><span>{Math.max(1, journey.stationCount * 3)} นาทีโดยประมาณ</span><strong>฿{journey.fare}</strong></div>}<p>กดจุดสถานีบนแผนที่ครั้งแรกเพื่อตั้งต้นทาง และครั้งที่สองเพื่อตั้งปลายทาง ระบบจะคำนวณราคาให้ทันที</p><section className="map-debug-tool"><div><span>DEBUG TOOL</span><b>Coordinate reader</b></div><button type="button" className={coordinateDebug ? 'enabled' : ''} onClick={() => { setCoordinateDebug(current => !current); setMapCoordinate(null); }} aria-pressed={coordinateDebug}>{coordinateDebug ? 'ON' : 'OFF'}</button><small>{coordinateDebug ? 'คลิกบนแผนที่เพื่ออ่านพิกัด' : 'ปิดอยู่ — เปิดเมื่อต้องการปรับหมุด'}</small></section></aside></section></main>;
}

function DebugPanel({ view, route, go, setOrigin, setDestination, showToast, reset }: { view: View; route: Route; go: Go; setOrigin: (value: string) => void; setDestination: (value: string) => void; showToast: () => void; reset: () => void }) {
  const setRoute = (originIndex: number, destinationIndex: number, nextView: View = 'planner') => {
    setOrigin(metroStations[originIndex].nameTh);
    setDestination(metroStations[destinationIndex].nameTh);
    go(nextView);
  };

  return <aside className="debug-panel" aria-label="Developer debug controls">
    <div className="debug-panel-head"><span>DEBUG</span><i>DEV</i></div>
    <p>View: <b>{view}</b></p>
    <p className="debug-route">{route.origin} <span>→</span> {route.destination}</p>
    <div className="debug-group"><small>Navigate</small><div className="debug-grid"><button onClick={() => go('home')}>Home</button><button onClick={() => go('booking')}>Tickets</button><button onClick={() => go('planner')}>Booking</button><button onClick={() => go('checkout')}>Checkout</button><button onClick={() => go('map')}>Map</button><button onClick={() => go('machine')}>QR Scanner</button><button onClick={() => go('wallet')}>Wallet</button></div></div>
    <div className="debug-group"><small>Test route</small><button className="debug-action" onClick={() => setRoute(20, 21)}>Short route · BL21 → BL22</button><button className="debug-action" onClick={() => setRoute(0, 37)}>Full line · BL01 → BL38</button><button className="debug-action" onClick={() => setRoute(38, 9)}>Purple → Blue · PP01 → BL10</button></div>
    <div className="debug-group"><small>Actions</small><button className="debug-action" onClick={showToast}>Show payment toast</button><button className="debug-reset" onClick={reset}>Reset simulation</button></div>
  </aside>;
}

function SimulateApp({ onWelcome }: { onWelcome: () => void }) {
  const [view, setView] = useState<View>('home');
  const [mapReturnView, setMapReturnView] = useState<View>('home');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [bookedTickets, setBookedTickets] = useState<BookedTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<BookedTicket | null>(null);
  const [toast, setToast] = useState(false);
  const go: Go = id => { if (id === 'map' && view !== 'map') setMapReturnView(view); if (id === 'planner' && view !== 'map') { setOrigin(''); setDestination(''); } setView(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const journey = calculateJourney(origin, destination);
  const route: Route = { origin, destination, stationCount: journey.stationCount, fare: journey.fare };
  const bookToken = () => {
    if (!origin || !destination || origin === destination) return;
    let code = '';
    do code = String(Math.floor(100000 + Math.random() * 900000));
    while (bookedTickets.some(ticket => ticket.code === code));
    const ticket: BookedTicket = { ...route, id: Date.now(), code, status: 'unpaid' };
    setBookedTickets(current => [ticket, ...current]);
    setActiveTicket(ticket);
    go('booking');
  };
  const payTicket = (ticket: BookedTicket) => {
    setActiveTicket(ticket);
    go('checkout');
  };
  const useTicket = (ticket: BookedTicket) => {
    if (ticket.status !== 'ready') return;
    setActiveTicket(ticket);
    go('machine');
  };
  const completeTicket = (ticketId: number) => {
    setBookedTickets(current => current.map(ticket => ticket.id === ticketId ? { ...ticket, status: 'completed' } : ticket));
    setActiveTicket(current => current?.id === ticketId ? { ...current, status: 'completed' } : current);
  };
  const pay = () => {
    if (!activeTicket) return;
    setBookedTickets(current => current.map(ticket => ticket.id === activeTicket.id ? { ...ticket, status: 'ready' } : ticket));
    setActiveTicket(current => current ? { ...current, status: 'ready' } : current);
    setToast(true);
    setTimeout(() => setToast(false), 2200);
    setTimeout(() => go('booking'), 350);
  };
  const showDebugToast = () => { setToast(true); setTimeout(() => setToast(false), 2200); };
  const reset = () => { setOrigin(''); setDestination(''); setBookedTickets([]); setActiveTicket(null); setToast(false); go('home'); };
  return <><button className="welcome-return" onClick={onWelcome}>← Welcome</button><div className="ambient ambient-a"/><div className="ambient ambient-b"/><main className={`shell ${view === 'home' ? 'home-shell' : ''}`}><Header go={go}/><section key={view} className={`view active ${view !== 'home' ? 'subview' : ''}`}>{view === 'home' && <Home go={go} bookToken={bookToken} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/>} {view === 'checkout' && <Checkout go={go} route={activeTicket ?? route} pay={pay}/>} {view === 'booking' && <MyTickets go={go} tickets={bookedTickets} payTicket={payTicket} useTicket={useTicket}/>} {view === 'planner' && <BookingPlanner go={go} bookToken={bookToken} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/>} {view === 'map' && <MapView go={go} backView={mapReturnView} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination}/>} {view === 'machine' && <TokenScanner go={go} ticket={activeTicket} onComplete={completeTicket}/>} {view === 'wallet' && <Wallet go={go}/>}</section><Nav view={view} go={go}/></main><DebugPanel view={view} route={route} go={go} setOrigin={setOrigin} setDestination={setDestination} showToast={showDebugToast} reset={reset}/><div className={`toast ${toast ? 'show' : ''}`}>ชำระเงินสำเร็จ — พร้อมรับ Token</div></>;
}
