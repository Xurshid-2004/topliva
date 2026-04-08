
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import RentCalendar from './calendar';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import { db } from './lib/firbase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

interface FuelRecord {
  id: string; date: string; locCode: string; supplyPoint: string; time: string;
  route: string; locoCode: string; locoSeries: string; locoNumber: string;
  trainCode: string; trainNumber: string; moveType: string; trainIndex: string;
  weight: string; balanceBefore: string; fuelAmount: string; staffName: string;
}

interface Staff {
  id: string; erju: string; zapravka: string; tabelNumber: string; fullName: string;
}
interface ClosedDayMeta {
  date: string;
  closedAt: number;
}

const ERJU_DATA = [
  { name: 'Toshkent ERJU', short: 'Тошкент', zapravkalar: ['Toshkent zapravka', 'Angren zapravka', 'Sirdaryo zapravka', 'Xovos zapravka', 'Jizzax zapravka'] },
  { name: 'Buxoro ERJU', short: 'Бухара', zapravkalar: ['Samarqand zapravka', 'Ziyouddin zapravka', 'Tinchlik zapravka', 'Buxoro zapravka', 'Uchquduq zapravka'] },
  { name: 'Qarshi ERJU', short: 'Қарши', zapravkalar: ['Qarshi zapravka'] },
  { name: "Qo'qon ERJU", short: 'Қоқон', zapravkalar: ['Andijon zapravka', "Qo'qon zapravka", "Marg'ilon zapravka"] },
  { name: 'Termiz ERJU', short: 'Термиз', zapravkalar: ['Termiz zapravka', 'Darband zapravka', "Qumqo'rg'on zapravka"] },
  { name: "Qo'ng'irot ERJU", short: 'Қунгирот', zapravkalar: ["Qo'ng'irot zapravka", 'Urganch zapravka', 'Miskin zapravka'] },
];

const seriesOptions = [
  { key: '1', value: 'ТЭМ' }, { key: '2', value: 'ЧМЭ' }, { key: '3', value: '2Т2 10 М' },
  { key: '4', value: '3Т2 10 М' }, { key: '5', value: 'Узте 16 М2' }, { key: '6', value: 'Узте 16 М3' },
  { key: '7', value: 'Узте 16 М4' }, { key: '8', value: 'ТЗ 12 4' }, { key: '9', value: 'ТеП 705 С' }, { key: '10', value: 'ТГК' },
];

const initialMoveOptions = [
  { key: '1', value: 'Грузовой' }, { key: '2', value: 'Пассажирский' }, { key: '3', value: 'Ремонт' },
  { key: '4', value: 'Маневр' }, { key: '5', value: 'Пригородный' }, { key: '6', value: 'Аренда' },
];

const skladOptions = [
  { key: '1', value: 'Toshkent' }, { key: '3', value: 'Angren' }, { key: '4', value: 'Sirdaryo' },
  { key: '5', value: 'Hovos' }, { key: '6', value: 'Jizzax' }, { key: '10', value: 'Andijon' },
  { key: '7', value: "Qo'qon" }, { key: '8', value: "Marg'ilon" }, { key: '11', value: 'Samarqand' },
  { key: '13', value: 'Ziyouddin' }, { key: '14', value: 'Buxoro' }, { key: '15', value: 'Tinchlik' },
  { key: '16', value: 'Uchquduq' }, { key: '20', value: "Qo'ng'irot" }, { key: '23', value: 'Urganch' },
  { key: '24', value: 'Miskin' }, { key: '17', value: 'Qarshi' }, { key: '18', value: 'Termiz' },
  { key: '19', value: 'Darband' }, { key: '26', value: "Qumqo'rg'on" },
];

const fmt = (n: number) => n ? n.toFixed(2) : '';
const normalizeStr = (s: string) => s.toLowerCase().replace(/zapravka|заправка/gi, '').replace(/\s+/g, ' ').trim();

const TrainFuelSystem = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const router = useRouter();
  const [rows, setRows] = useState<FuelRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState<Partial<FuelRecord>>({ supplyPoint: '', route: '', locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffInputRaw, setStaffInputRaw] = useState('');
  const staffInputRawRef = useRef('');
  const staffInputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [supplyPointRaw, setSupplyPointRaw] = useState('');
  const supplyPointTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supplyPointRawRef = useRef('');
  const [moveOptions, setMoveOptions] = useState(initialMoveOptions);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isMoveAddOpen, setIsMoveAddOpen] = useState(false);
  const [newMoveKey, setNewMoveKey] = useState('');
  const [newMoveValue, setNewMoveValue] = useState('');
  const [editingMoveKey, setEditingMoveKey] = useState<string | null>(null);
  const [editMoveKey, setEditMoveKey] = useState('');
  const [editMoveValue, setEditMoveValue] = useState('');
  const [seriesOptionsState, setSeriesOptionsState] = useState(seriesOptions);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [isSeriesAddOpen, setIsSeriesAddOpen] = useState(false);
  const [newSeriesKey, setNewSeriesKey] = useState('');
  const [newSeriesValue, setNewSeriesValue] = useState('');
  const [editingSeriesKey, setEditingSeriesKey] = useState<string | null>(null);
  const [editSeriesKey, setEditSeriesKey] = useState('');
  const [editSeriesValue, setEditSeriesValue] = useState('');
  const [selectedErju, setSelectedErju] = useState('');
  const [selectedZapravka, setSelectedZapravka] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTabel, setNewStaffTabel] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaff, setEditStaff] = useState({ name: '', tabel: '', zapravka: '' });
  const [isSkladOpen, setIsSkladOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTodayClosed, setIsTodayClosed] = useState(false);
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [closedDaysMeta, setClosedDaysMeta] = useState<ClosedDayMeta[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeEntryDate, setActiveEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMobileExportOpen, setIsMobileExportOpen] = useState(false);
  const [mobileExportTitle, setMobileExportTitle] = useState('');
  const [mobileExportType, setMobileExportType] = useState<'pdf' | 'erju'>('pdf');
  const [mobileExportRows, setMobileExportRows] = useState<FuelRecord[]>([]);
  const mobileExportRef = useRef<HTMLDivElement | null>(null);
  const currentDateRef = useRef(new Date().toISOString().split('T')[0]);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; role: 'admin' | 'user'; createdAt: number }>>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState('');
  const [chatButtonPos, setChatButtonPos] = useState({ x: 0, y: 0 });
  const chatDragRef = useRef({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setChatButtonPos({ x: window.innerWidth - 68, y: window.innerHeight - 86 });
    }
  }, []);
  useEffect(() => {
    const unsubRows = onSnapshot(query(collection(db, 'fuelRecords'), orderBy('createdAt', 'desc')), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FuelRecord, 'id'>) }));
      setRows(data);
      setIsLoaded(true);
    });
    const unsubStaff = onSnapshot(query(collection(db, 'staff')), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Staff, 'id'>) }));
      setStaffList(data);
    });
    const unsubMoves = onSnapshot(query(collection(db, 'moveOptions')), (snap) => {
      if (snap.empty) return;
      const data = snap.docs.map((d) => ({ key: String(d.data().key ?? ''), value: String(d.data().value ?? '') })).filter(x => x.key && x.value);
      setMoveOptions(data);
    });
    const unsubSeries = onSnapshot(query(collection(db, 'seriesOptions')), (snap) => {
      if (snap.empty) return;
      const data = snap.docs.map((d) => ({ key: String(d.data().key ?? ''), value: String(d.data().value ?? '') })).filter(x => x.key && x.value);
      setSeriesOptionsState(data);
    });
    const unsubClosed = onSnapshot(query(collection(db, 'closedDays')), (snap) => {
      const metas = snap.docs.map((d) => {
        const payload = d.data() as { date?: string; closedAt?: number };
        return {
          date: payload.date || d.id,
          closedAt: Number(payload.closedAt || 0)
        };
      });
      setClosedDaysMeta(metas);
      setClosedDates(metas.map(m => m.date));
    });
    return () => {
      unsubRows();
      unsubStaff();
      unsubMoves();
      unsubSeries();
      unsubClosed();
    };
  }, []);
  useEffect(() => { document.body.style.overflow = isModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isModalOpen]);
  useEffect(() => { document.body.style.overflow = isSkladOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isSkladOpen]);
  useEffect(() => { document.body.style.overflow = isMoveModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isMoveModalOpen]);
  useEffect(() => { document.body.style.overflow = isSeriesModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isSeriesModalOpen]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = isDarkMode ? '#0a0f1e' : '#f0f2f5';
      document.body.style.color = isDarkMode ? '#e2e8f0' : '#1a1a2e';
    }
  }, [isDarkMode]);
  useEffect(() => {
    const unsubChat = onSnapshot(query(collection(db, 'chatMessages'), orderBy('createdAt', 'asc')), (snap) => {
      const data: Array<{ id: string; text: string; role: 'admin' | 'user'; createdAt: number }> = snap.docs.map((d) => {
        const v = d.data() as { text?: string; role?: 'admin' | 'user'; createdAt?: number };
        return {
          id: d.id,
          text: String(v.text || ''),
          role: v.role === 'admin' ? 'admin' : 'user',
          createdAt: Number(v.createdAt || 0)
        };
      });
      setChatMessages(data);
    });
    return () => unsubChat();
  }, []);

  const closeModal = () => { setIsModalOpen(false); setSelectedErju(''); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };
  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    await addDoc(collection(db, 'chatMessages'), { text, role: isAdmin ? 'admin' : 'user', createdAt: Date.now() });
    setChatInput('');
  };
  const clearChatMessages = async () => {
    const ok = window.confirm("Suhbatni tozalashni tasdiqlaysizmi?");
    if (!ok) return;
    const snap = await getDocs(collection(db, 'chatMessages'));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };
  const saveChatEdit = async () => {
    const text = editingChatText.trim();
    if (!editingChatId || !text) return;
    await updateDoc(doc(db, 'chatMessages', editingChatId), { text });
    setEditingChatId(null);
    setEditingChatText('');
  };
  const deleteChatMessage = async (id: string) => {
    await deleteDoc(doc(db, 'chatMessages', id));
    if (editingChatId === id) {
      setEditingChatId(null);
      setEditingChatText('');
    }
  };
  const onChatPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    chatDragRef.current = {
      dragging: true,
      moved: false,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onChatPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!chatDragRef.current.dragging) return;
    const nextX = Math.min(Math.max(8, e.clientX - chatDragRef.current.offsetX), Math.max(8, window.innerWidth - 56));
    const nextY = Math.min(Math.max(8, e.clientY - chatDragRef.current.offsetY), Math.max(8, window.innerHeight - 56));
    if (Math.abs(nextX - chatButtonPos.x) > 2 || Math.abs(nextY - chatButtonPos.y) > 2) {
      chatDragRef.current.moved = true;
    }
    setChatButtonPos({ x: nextX, y: nextY });
  };
  const onChatPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!chatDragRef.current.dragging) return;
    chatDragRef.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!chatDragRef.current.moved) setIsChatOpen(v => !v);
  };
  const handleErjuSelect = (name: string) => { setSelectedErju(name); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };
  const addStaff = async () => {
    if (!selectedErju || !selectedZapravka || !newStaffName.trim() || !newStaffTabel.trim()) return;
    if (staffList.find(s => s.tabelNumber === newStaffTabel.trim())) { alert('Bu tabel raqam allaqachon mavjud!'); return; }
    await addDoc(collection(db, 'staff'), {
      erju: selectedErju,
      zapravka: selectedZapravka,
      tabelNumber: newStaffTabel.trim(),
      fullName: newStaffName.trim()
    });
    setNewStaffName(''); setNewStaffTabel('');
  };
  const saveStaffEdit = async () => {
    if (!editStaff.name.trim() || !editStaff.tabel.trim()) return;
    if (!editingStaffId) return;
    await updateDoc(doc(db, 'staff', editingStaffId), {
      fullName: editStaff.name.trim(),
      tabelNumber: editStaff.tabel.trim(),
      zapravka: editStaff.zapravka
    });
    setEditingStaffId(null);
  };
  const closeMoveModal = () => { setIsMoveModalOpen(false); setIsMoveAddOpen(false); setNewMoveKey(''); setNewMoveValue(''); setEditingMoveKey(null); };
  const closeSeriesModal = () => { setIsSeriesModalOpen(false); setIsSeriesAddOpen(false); setNewSeriesKey(''); setNewSeriesValue(''); setEditingSeriesKey(null); };
  const addMoveOption = async () => {
    const key = newMoveKey.trim(); const value = newMoveValue.trim();
    if (!key || !value) return;
    if (moveOptions.some(o => o.key === key)) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    await setDoc(doc(db, 'moveOptions', key), { key, value });
    setNewMoveKey(''); setNewMoveValue(''); setIsMoveAddOpen(false);
  };
  const saveMoveEdit = async () => {
    if (!editMoveKey.trim() || !editMoveValue.trim()) return;
    if (editMoveKey.trim() !== editingMoveKey && moveOptions.some(o => o.key === editMoveKey.trim())) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    if (!editingMoveKey) return;
    await deleteDoc(doc(db, 'moveOptions', editingMoveKey));
    await setDoc(doc(db, 'moveOptions', editMoveKey.trim()), { key: editMoveKey.trim(), value: editMoveValue.trim() });
    setEditingMoveKey(null);
  };
  const addSeriesOption = async () => {
    const key = newSeriesKey.trim(); const value = newSeriesValue.trim();
    if (!key || !value) return;
    if (seriesOptionsState.some(o => o.key === key)) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    await setDoc(doc(db, 'seriesOptions', key), { key, value });
    setNewSeriesKey(''); setNewSeriesValue(''); setIsSeriesAddOpen(false);
  };
  const saveSeriesEdit = async () => {
    if (!editSeriesKey.trim() || !editSeriesValue.trim()) return;
    if (editSeriesKey.trim() !== editingSeriesKey && seriesOptionsState.some(o => o.key === editSeriesKey.trim())) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    if (!editingSeriesKey) return;
    await deleteDoc(doc(db, 'seriesOptions', editingSeriesKey));
    await setDoc(doc(db, 'seriesOptions', editSeriesKey.trim()), { key: editSeriesKey.trim(), value: editSeriesValue.trim() });
    setEditingSeriesKey(null);
  };
  const handleStaffInput = (raw: string) => {
    setStaffInputRaw(raw);
    staffInputRawRef.current = raw;
    if (staffInputTimerRef.current) {
      clearTimeout(staffInputTimerRef.current);
      staffInputTimerRef.current = null;
    }
    const v = raw.trim();
    const byTabel = staffList.find(s => s.tabelNumber === v);
    const hasLongerPrefix = staffList.some(s => s.tabelNumber.startsWith(v) && s.tabelNumber.length > v.length);
    if (byTabel && (!hasLongerPrefix || v.length >= 3)) {
      setFormData(prev => ({ ...prev, staffName: byTabel.fullName }));
      setStaffInputRaw(byTabel.fullName);
      staffInputRawRef.current = byTabel.fullName;
      return;
    }
    const byName = staffList.find(s => s.fullName === raw.trim());
    setFormData(prev => ({ ...prev, staffName: byName ? byName.fullName : raw }));
    if (byTabel && hasLongerPrefix && v.length < 3) {
      const currentRaw = raw;
      staffInputTimerRef.current = setTimeout(() => {
        if (staffInputRawRef.current === currentRaw) {
          setFormData(prev => ({ ...prev, staffName: byTabel.fullName }));
          setStaffInputRaw(byTabel.fullName);
          staffInputRawRef.current = byTabel.fullName;
        }
      }, 700);
    }
  };
  const handleSupplyPointInput = (raw: string, forceExact = false) => {
    const v = raw.trim();
    if (supplyPointTimerRef.current) { clearTimeout(supplyPointTimerRef.current); supplyPointTimerRef.current = null; }
    const byKey = skladOptions.find(o => o.key === v);
    const hasLongerPrefix = skladOptions.some(o => o.key.startsWith(v) && o.key.length > v.length);
    const shouldResolve = !!byKey && (forceExact || !hasLongerPrefix || v.length >= 2);
    if (shouldResolve) { setFormData(prev => ({ ...prev, supplyPoint: byKey.value, trainIndex: byKey.key })); setSupplyPointRaw(byKey.value); supplyPointRawRef.current = byKey.value; return; }
    setFormData(prev => ({ ...prev, supplyPoint: raw, trainIndex: byKey ? prev.trainIndex : '' }));
    setSupplyPointRaw(raw); supplyPointRawRef.current = raw;
    if (byKey && !forceExact && hasLongerPrefix && v.length === 1) {
      const currentRaw = raw;
      supplyPointTimerRef.current = setTimeout(() => {
        if (currentRaw === supplyPointRawRef.current) { setFormData(prev => ({ ...prev, supplyPoint: byKey.value, trainIndex: byKey.key })); setSupplyPointRaw(byKey.value); supplyPointRawRef.current = byKey.value; }
      }, 700);
    }
  };
  const selectSklad = (keyOrValue: string) => { handleSupplyPointInput(keyOrValue, true); setIsSkladOpen(false); };
  const visibleRows = useMemo(
    () => rows.filter(r => r.date === activeEntryDate && !closedDates.includes(r.date)),
    [rows, closedDates, activeEntryDate]
  );
  const stats = useMemo(() => ({ total: visibleRows.reduce((s, r) => s + (Number(r.balanceBefore) || 0) + (Number(r.fuelAmount) || 0), 0) }), [visibleRows]);
  const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const getZapravkaByStaff = (name: string | undefined) => { if (!name) return ''; const s = staffList.find(x => x.fullName === name); return s ? s.zapravka : ''; };

  const handleExportPdf = (sourceRows: FuelRecord[] = visibleRows) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const today = formatDate(new Date());
    const title = `${today} kun mobaynida tarqatilgan dizel yoqilg'isi tarqatilishi haqida ma'lumot`;
    const grouped = sourceRows
      .map((r): FuelRecord & { _zap: string } => { const zap = getZapravkaByStaff(r.staffName); return { ...r, _zap: zap }; })
      .sort((a, b) => { const z = (a._zap||'').localeCompare(b._zap||''); if(z!==0)return z; const s=(a.staffName||'').localeCompare(b.staffName||''); if(s!==0)return s; return (a.time||'').localeCompare(b.time||''); })
      .reduce((acc: Record<string, (FuelRecord & { _zap: string })[]>, r) => { const key=`${r._zap||''}|||${r.staffName||''}`; if(!acc[key])acc[key]=[]; acc[key].push(r); return acc; }, {});
    const tableHeader = `<thead><tr><th>№</th><th>Vaqt</th><th>Poyezd rusumi</th><th>Raqami</th><th>Harakat turi</th><th>P.Raqami</th><th>Harakat ruxsat indexi</th><th>Poyezd Vazni</th><th>Qoldiq</th><th>Yoqilg'i</th><th>Hisob</th></tr></thead>`;
    const tablesHtml = Object.entries(grouped).map(([key, group]) => {
      const [zap, staff] = key.split('|||');
      const rowsHtml = group.map((r, i) => `<tr><td>${i+1}</td><td>${r.time||''}</td><td>${r.locoSeries||''}</td><td>${r.trainIndex||''}</td><td>${r.moveType||''}</td><td>${r.locoNumber||''}</td><td>${r.trainNumber||''}</td><td>${r.weight||''}</td><td>${r.balanceBefore||''}</td><td>${r.fuelAmount||''}</td><td>${(Number(r.balanceBefore)+Number(r.fuelAmount))||''}</td></tr>`).join('');
      const cleanZap = (zap||'').replace(/\s*zapravka\s*/i,'').trim();
      return `<div class="group-title">${cleanZap||'-'} — ${staff||'-'}</div><table>${tableHeader}<tbody>${rowsHtml}</tbody></table>`;
    }).join('');
    printWindow.document.write(`<html><head><title>PDF</title><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#111;padding:24px;}h1{font-size:14px;font-weight:700;text-align:center;margin:0 0 12px;}.group-title{font-size:11px;font-weight:700;margin:10px 0 4px;}table{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:10px;}th,td{border:1px solid #999;padding:4px 6px;text-align:center;}thead th{background:#f3f3f3;}</style></head><body><h1>${title}</h1>${tablesHtml}</body></html>`);
    printWindow.document.close(); printWindow.focus(); printWindow.print();
  };

  const handleExportErjuPdf = (sourceRows: FuelRecord[] = visibleRows) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const today = formatDate(new Date());
    const title = `${today} sutkasi mobaynida dizel yoqilg'isi tarqatilishi haqida MA'LUMOTNOMA`;
    const moveTypeOrder = moveOptions.map(o => (o.value || '').trim()).filter(Boolean);
    const extraMoves: string[] = [];
    const moveTypeSet = new Set(moveTypeOrder);
    sourceRows.forEach(r => { const mv = (r.moveType || '').trim() || 'Noma'; if (!moveTypeSet.has(mv)) { moveTypeSet.add(mv); extraMoves.push(mv); } });
    const moveTypes = [...moveTypeOrder, ...extraMoves].filter((v, i, a) => a.indexOf(v) === i);
    const findErju = (supplyPoint: string, staffName: string): string => {
      const candidates = [supplyPoint, getZapravkaByStaff(staffName)].filter(Boolean);
      for (const cand of candidates) {
        for (const erju of ERJU_DATA) {
          for (const z of erju.zapravkalar) {
            if (normalizeStr(z) === normalizeStr(cand) || normalizeStr(z).includes(normalizeStr(cand)) || normalizeStr(cand).includes(normalizeStr(z))) return erju.name;
          }
        }
      }
      return 'Boshqa';
    };
    const cleanZapName = (s: string) => s.replace(/\s*zapravka\s*/i, '').trim();
    type ZapData = { total: number; moves: Record<string, number>; };
    const erjuData: Record<string, Record<string, ZapData>> = {};
    sourceRows.forEach(r => {
      const erjuName = findErju(r.supplyPoint || '', r.staffName || '');
      let zapName = r.supplyPoint || getZapravkaByStaff(r.staffName) || '-';
      zapName = cleanZapName(zapName);
      if (!erjuData[erjuName]) erjuData[erjuName] = {};
      if (!erjuData[erjuName][zapName]) erjuData[erjuName][zapName] = { total: 0, moves: {} };
      const fuel = Number(r.fuelAmount) || 0;
      const move = (r.moveType || '').trim() || 'Noma';
      erjuData[erjuName][zapName].total += fuel;
      erjuData[erjuName][zapName].moves[move] = (erjuData[erjuName][zapName].moves[move] || 0) + fuel;
    });
    const grand = { total: 0, moves: {} as Record<string, number> };
    const erjuTotalsForSummary: Record<string, { total: number; moves: Record<string, number> }> = {};
    let rowNum = 0;
    const colCount = 4 + moveTypes.length;
    const mainTableRows = ERJU_DATA.map(erju => {
      const zapMap = erjuData[erju.name];
      if (!zapMap) return '';
      const orderedNames: string[] = [];
      erju.zapravkalar.forEach(z => {
        const clean = cleanZapName(z);
        const match = Object.keys(zapMap).find(k => normalizeStr(k) === normalizeStr(clean) || normalizeStr(k).includes(normalizeStr(clean)) || normalizeStr(clean).includes(normalizeStr(k)));
        if (match && !orderedNames.includes(match)) orderedNames.push(match);
      });
      Object.keys(zapMap).forEach(k => { if (!orderedNames.includes(k)) orderedNames.push(k); });
      const sub = { total: 0, moves: {} as Record<string, number> };
      const zapRows = orderedNames.map(zap => {
        rowNum++;
        const d = zapMap[zap];
        const jami = moveTypes.reduce((s, m) => s + (d.moves[m] || 0), 0);
        sub.total += d.total;
        moveTypes.forEach(m => { sub.moves[m] = (sub.moves[m] || 0) + (d.moves[m] || 0); });
        const moveCells = moveTypes.map(m => `<td class="num">${fmt(d.moves[m] || 0)}</td>`).join('');
        return `<tr><td>${rowNum}</td><td class="left">${zap}</td><td class="num">${fmt(d.total)}</td><td class="num">${fmt(jami)}</td>${moveCells}</tr>`;
      }).join('');
      grand.total += sub.total;
      moveTypes.forEach(m => { grand.moves[m] = (grand.moves[m] || 0) + (sub.moves[m] || 0); });
      erjuTotalsForSummary[erju.name] = { total: sub.total, moves: { ...sub.moves } };
      const subJami = moveTypes.reduce((s, m) => s + (sub.moves[m] || 0), 0);
      const subMoves = moveTypes.map(m => `<td class="sub-num">${fmt(sub.moves[m] || 0)}</td>`).join('');
      return `<tr class="erju-header"><td colspan="${colCount}" class="erju-title">РКУ-${erju.short}</td></tr>${zapRows}<tr class="sub-row"><td></td><td class="left sub-label">Jami РКУ-${erju.short}</td><td class="sub-num">${fmt(sub.total)}</td><td class="sub-num">${fmt(subJami)}</td>${subMoves}</tr>`;
    }).join('');
    const grandJami = moveTypes.reduce((s, m) => s + (grand.moves[m] || 0), 0);
    const grandMoves = moveTypes.map(m => `<td class="grand-num">${fmt(grand.moves[m] || 0)}</td>`).join('');
    const grandRow = `<tr class="grand-row"><td></td><td class="left grand-label">UMUMIY JAMI</td><td class="grand-num">${fmt(grand.total)}</td><td class="grand-num">${fmt(grandJami)}</td>${grandMoves}</tr>`;
    const moveTypeData: Record<string, Record<string, number>> = {};
    const moveTypeTotals: Record<string, number> = {};
    moveTypes.forEach(mt => { moveTypeData[mt] = {}; ERJU_DATA.forEach(erju => { moveTypeData[mt][erju.name] = 0; }); moveTypeTotals[mt] = 0; });
    sourceRows.forEach(r => {
      const erjuName = findErju(r.supplyPoint || '', r.staffName || '');
      const fuel = Number(r.fuelAmount) || 0;
      const move = (r.moveType || '').trim() || 'Noma';
      if (moveTypeData[move]) { moveTypeData[move][erjuName] = (moveTypeData[move][erjuName] || 0) + fuel; moveTypeTotals[move] += fuel; }
    });
    const moveTypeSummaryRows = moveTypes.map(mt => {
      const erjuCells = ERJU_DATA.map(erju => `<td class="num">${fmt(moveTypeData[mt][erju.name] || 0)}</td>`).join('');
      return `<tr><td class="left">${mt}</td>${erjuCells}<td class="num">${fmt(moveTypeTotals[mt])}</td></tr>`;
    }).join('');
    const moveTypeGrandCells = ERJU_DATA.map(erju => { let total = 0; moveTypes.forEach(mt => { total += moveTypeData[mt][erju.name] || 0; }); return `<td class="num grand-num">${fmt(total)}</td>`; }).join('');
    const moveTypeGrandTotal = Object.values(moveTypeTotals).reduce((a, b) => a + b, 0);
    const moveTypeGrandRow = `<tr class="grand-r"><td class="left" style="font-weight:800">Jami</td>${moveTypeGrandCells}<td class="num grand-num">${fmt(moveTypeGrandTotal)}</td></tr>`;
    const totalLocos = new Set(sourceRows.filter(r => r.locoSeries || r.locoNumber).map(r => `${r.locoSeries}-${r.locoNumber}`)).size;
    printWindow.document.write(`<html><head><title>ERJU MA'LUMOTNOMA</title><meta charset="utf-8"/><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:9px;color:#000;padding:16px;}h1{font-size:10px;font-weight:800;text-align:center;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;}.main-table{width:100%;border-collapse:collapse;margin-bottom:20px;}.main-table th{border:1px solid #444;padding:4px 3px;text-align:center;background:#f0f0f0;font-size:9px;font-weight:700;vertical-align:middle;}.main-table td{border:1px solid #666;padding:3px 4px;text-align:center;vertical-align:middle;font-size:9px;}.main-table td.left{text-align:left;font-weight:700;font-size:9.5px;}.main-table td.num{text-align:right;font-family:'Courier New',monospace;font-weight:700;}.erju-header .erju-title{background:#d9d9d9;color:#000;font-weight:800;font-size:10px;text-align:left;padding:5px 6px;}.sub-row td{background:#eeeeee;font-weight:700;font-size:9px;border-color:#555;}.sub-row .sub-num{text-align:right;font-family:'Courier New',monospace;font-weight:700;}.sub-row .sub-label{font-weight:800;}.grand-row td{background:#cccccc;color:#000;font-weight:800;font-size:9px;border-color:#333;}.grand-row .grand-num{text-align:right;font-family:'Courier New',monospace;font-weight:700;}.grand-row .grand-label{text-align:left;font-weight:800;}.summary-title{font-size:9px;font-weight:800;margin:8px 0 5px;text-transform:uppercase;}.sum-table{width:100%;border-collapse:collapse;margin-bottom:10px;}.sum-table th{border:1px solid #555;padding:4px 5px;text-align:center;background:#f0f0f0;font-size:9px;font-weight:700;}.sum-table td{border:1px solid #666;padding:3px 5px;font-size:9px;}.sum-table td.left{text-align:left;font-weight:700;}.sum-table td.num{text-align:right;font-family:'Courier New',monospace;font-weight:700;}.sum-table .grand-r td{background:#cccccc;font-weight:800;}.stat-line{font-size:9px;font-weight:700;margin-top:6px;}</style></head><body><h1>${title}</h1><table class="main-table"><thead><tr><th rowspan="2" style="width:24px">№</th><th rowspan="2" style="min-width:90px">Yo'nig'i ombori</th><th rowspan="2">t sutkada tarqatigan</th><th rowspan="2">Jami teplovozlarga tarqatigan</th><th colspan="${moveTypes.length}">Shu jumladan:</th></tr><tr>${moveTypes.map(m => `<th>${m}</th>`).join('')}</tr></thead><tbody>${mainTableRows}${grandRow}</tbody></table><div class="summary-title">Harakat turi bo'yicha hisob-kitob</div><table class="sum-table"><thead><tr><th class="left">Harakat turi</th>${ERJU_DATA.map(e => `<th>${e.short}</th>`).join('')}<th>Jami</th></tr></thead><tbody>${moveTypeSummaryRows}${moveTypeGrandRow}</tbody></table><div class="stat-line" style="margin-top:15px;">Jami teplovozlar soni: ${totalLocos} ta | Jami yozuvlar: ${sourceRows.length} ta</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const parseIsoDate = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const getRowsByRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return visibleRows;
    const startAt = new Date(start); startAt.setHours(0, 0, 0, 0);
    const endAt = new Date(end); endAt.setHours(23, 59, 59, 999);
    return rows.filter(r => {
      const d = parseIsoDate(r.date);
      return d >= startAt && d <= endAt;
    });
  };
  const todayRows = rows.filter(r => r.date === activeEntryDate);
  const todayTotal = todayRows.reduce((s, r) => s + (Number(r.balanceBefore) || 0) + (Number(r.fuelAmount) || 0), 0);
  const isMobileDevice = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const openMobileExport = (type: 'pdf' | 'erju', sourceRows: FuelRecord[]) => {
    setMobileExportType(type);
    setMobileExportRows(sourceRows);
    setMobileExportTitle(type === 'pdf' ? 'PDF ro‘yxat (mobil)' : 'ERJU PDF ro‘yxat (mobil)');
    setIsMobileExportOpen(true);
  };
  const saveMobileExportAsImage = async () => {
    if (!mobileExportRef.current) return;
    const canvas = await html2canvas(mobileExportRef.current, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${mobileExportType}-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  const addRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, 'fuelRecords', editingId), { ...(formData as FuelRecord) });
      setEditingId(null);
    } else {
      const now = new Date();
      await addDoc(collection(db, 'fuelRecords'), {
        ...(formData as FuelRecord),
        date: activeEntryDate,
        time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        createdAt: now.getTime()
      });
    }
    setFormData(prev => ({ ...prev, locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '' }));
    setStaffInputRaw('');
    setSupplyPointRaw('');
    supplyPointRawRef.current = '';
    setFormData(prev => ({ ...prev, supplyPoint: '', trainIndex: '' }));
  };
  const deleteRow = async (id: string) => { await deleteDoc(doc(db, 'fuelRecords', id)); };
  const editRow = (row: FuelRecord) => { setFormData(row); setStaffInputRaw(row.staffName || ''); setSupplyPointRaw(row.supplyPoint || ''); supplyPointRawRef.current = row.supplyPoint || ''; setEditingId(row.id); };
  const clearForm = () => { setFormData({ supplyPoint: '', route: '', locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' }); setStaffInputRaw(''); setSupplyPointRaw(''); supplyPointRawRef.current = ''; setEditingId(null); };

  useEffect(() => {
    setIsTodayClosed(closedDates.includes(activeEntryDate));
  }, [closedDates, activeEntryDate]);
  useEffect(() => {
    currentDateRef.current = new Date().toISOString().split('T')[0];
    const timer = setInterval(() => {
      const nowIso = new Date().toISOString().split('T')[0];
      if (nowIso !== currentDateRef.current) {
        currentDateRef.current = nowIso;
        setActiveEntryDate(nowIso);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted || !isLoaded) return null;

  const erjuAllStaff = staffList.filter(s => s.erju === selectedErju);
  const selectedErjuData = ERJU_DATA.find(e => e.name === selectedErju);
  const todayDate = formatDate(parseIsoDate(activeEntryDate));

  // ─── Theme tokens ───────────────────────────────────────────────────────────
  const t = isDarkMode ? {
    // Dark — deep navy/midnight aesthetic
    bg: 'bg-[#0a0f1e]',
    text: 'text-slate-200',
    // Header bar
    headerBg: 'bg-[#0d1424] border-b border-white/[0.07]',
    // Nav buttons
    navBtn: 'bg-white/[0.06] border border-white/[0.1] text-slate-300 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.2]',
    navBtnActive: '',
    // Form card
    formCard: 'bg-[#111827] border border-white/[0.08] shadow-xl shadow-black/40',
    // Input
    inputBg: 'bg-[#0d1424] border border-white/[0.1] text-amber-100 placeholder:text-slate-600 focus:border-amber-400/70 focus:bg-[#111827]',
    inputLabel: 'text-amber-400/90',
    // Confirm badge
    confirmBadge: 'text-emerald-400',
    // Table
    tableBg: 'bg-[#0d1424] border border-white/[0.07]',
    tableHead: 'bg-[#111827] text-blue-300/90',
    tableRow: 'hover:bg-white/[0.04] border-b border-white/[0.05]',
    tableCell: 'text-slate-300',
    tableMono: 'text-amber-400',
    tableFuel: 'text-emerald-400',
    tableSum: 'text-white',
    // Footer bar
    footerBar: 'bg-[#0b4a2e]/60 border-t border-emerald-600/30',
    footerText: 'text-emerald-200',
    // Modal
    modalBg: 'bg-[#0d1424] border border-white/[0.1]',
    modalHeader: 'bg-[#0a0f1e]/95 border-b border-white/[0.1]',
    modalTitle: 'text-white',
    modalSub: 'text-slate-400',
    // Sidebar (ERJU list)
    sidebarBg: 'bg-[#0a0f1e] border-r border-white/[0.08]',
    sidebarItem: 'hover:bg-white/[0.05] text-slate-400',
    sidebarActive: 'bg-blue-600 text-white',
    // Inner modal panels
    panelBg: 'bg-[#0a0f1e]/80 border-r border-white/[0.08]',
    panelInput: 'bg-[#0d1424] border border-white/[0.1] text-white focus:border-blue-400',
    staffCard: 'bg-white/[0.04] border border-white/[0.08]',
    // Danger button close
    closeBtn: 'bg-red-500/80 hover:bg-red-600 border border-red-400/30 text-white',
    // Sklad sidebar
    skladBg: 'bg-[#0a0f1e] border-r border-white/[0.1] text-white',
    skladLabel: 'text-emerald-400',
    skladItem: 'bg-[#111827]/80 hover:bg-slate-700/60 text-slate-200',
  } : {
    // Light — clean Word/Office-like aesthetic
    bg: 'bg-[#f0f2f5]',
    text: 'text-[#1a1a2e]',
    headerBg: 'bg-white border-b border-slate-200 shadow-sm',
    navBtn: 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400 shadow-sm',
    navBtnActive: '',
    formCard: 'bg-white border border-slate-200 shadow-md shadow-slate-200/60',
    inputBg: 'bg-slate-50 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100',
    inputLabel: 'text-slate-600',
    confirmBadge: 'text-emerald-600',
    tableBg: 'bg-white border border-slate-200 shadow-md shadow-slate-200/50',
    tableHead: 'bg-slate-100 text-slate-600',
    tableRow: 'hover:bg-blue-50/60 border-b border-slate-100',
    tableCell: 'text-slate-700',
    tableMono: 'text-amber-700',
    tableFuel: 'text-emerald-700',
    tableSum: 'text-slate-900',
    footerBar: 'bg-emerald-50 border-t border-emerald-200',
    footerText: 'text-emerald-800',
    modalBg: 'bg-white border border-slate-200 shadow-2xl',
    modalHeader: 'bg-slate-50 border-b border-slate-200',
    modalTitle: 'text-slate-900',
    modalSub: 'text-slate-500',
    sidebarBg: 'bg-slate-50 border-r border-slate-200',
    sidebarItem: 'hover:bg-slate-100 text-slate-600',
    sidebarActive: 'bg-blue-600 text-white',
    panelBg: 'bg-slate-50/90 border-r border-slate-200',
    panelInput: 'bg-white border border-slate-300 text-slate-800 focus:border-blue-500',
    staffCard: 'bg-slate-50 border border-slate-200',
    closeBtn: 'bg-red-500 hover:bg-red-600 border border-red-400 text-white',
    skladBg: 'bg-white border-r border-slate-200 text-slate-900 shadow-xl',
    skladLabel: 'text-blue-600',
    skladItem: 'bg-slate-50 hover:bg-blue-50 text-slate-800 border border-slate-200',
  };

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} font-sans`}>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar{width:0;height:0;}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;appearance:textfield;}
        .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .table-scroll::-webkit-scrollbar{height:5px;}
        .table-scroll::-webkit-scrollbar-track{background:transparent;}
        .table-scroll::-webkit-scrollbar-thumb{background:rgba(100,100,120,0.3);border-radius:4px;}
      `}</style>

      {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 ${t.headerBg} px-3 sm:px-6 py-2.5`}>
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 flex-1 min-w-0">
            {isAdmin ? ([
              { icon: '👥', label: 'Xodimlar', action: () => setIsModalOpen(true) },
              { icon: '📅', label: 'Taqvim', action: () => setIsCalendarOpen(true) },
            ]).map(b => (
              <button
                key={b.label}
                type="button"
                onClick={b.action}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all active:scale-95 ${t.navBtn}`}
              >
                <span className="text-sm leading-none">{b.icon}</span>
                <span className="hidden xs:inline sm:inline">{b.label}</span>
              </button>
            )) : (
              [
                { icon: '📦', label: 'Toplin', action: () => setIsSkladOpen(true) },
                { icon: '🚆', label: 'Harakat', action: () => setIsMoveModalOpen(true) },
                { icon: '🧩', label: 'Rusum', action: () => setIsSeriesModalOpen(true) },
              ].map(b => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.action}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all active:scale-95 ${t.navBtn}`}
                >
                  <span className="text-sm leading-none">{b.icon}</span>
                  <span className="hidden xs:inline sm:inline">{b.label}</span>
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => router.push('/')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${t.navBtn}`}
              >
                User panel
              </button>
            )}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminAuthOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white border border-fuchsia-300/40 shadow-md shadow-fuchsia-700/25"
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDarkMode(p => !p)}
              title={isDarkMode ? "Kunduzgi rejim" : "Tungi rejim"}
              className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 text-base transition-all active:scale-95 ${t.navBtn}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {isAdmin && (
          <section className={`${t.tableBg} rounded-2xl p-3 sm:p-4`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className={`text-sm sm:text-base font-bold ${isDarkMode ? 'text-cyan-200' : 'text-indigo-800'}`}>Bugungi user yozuvlari (real-time)</h2>
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{rows.filter(r => r.date === new Date().toISOString().split('T')[0]).length} ta</span>
            </div>
            <div className="table-scroll">
              <table className="w-full text-xs sm:text-sm" style={{ minWidth: '700px' }}>
                <thead className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  <tr>
                    {['Vaqt', 'Zaprafka', 'Harakat', 'Xodim', "Yoqilg'i"].map(h => (
                      <th key={h} className={`px-2 py-2 text-left ${isDarkMode ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.date === new Date().toISOString().split('T')[0]).map((r) => (
                    <tr key={`admin-live-${r.id}`} className={t.tableRow}>
                      <td className="px-2 py-2">{r.time}</td>
                      <td className="px-2 py-2">{r.supplyPoint}</td>
                      <td className="px-2 py-2">{r.moveType}</td>
                      <td className="px-2 py-2">{r.staffName}</td>
                      <td className="px-2 py-2 text-right font-mono">{Number(r.fuelAmount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <section className={`${t.formCard} rounded-2xl p-4 sm:p-6`}>
          <form onSubmit={addRow}>
            {/* Desktop: always 2 rows (5x2) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

              {/* 1. Zapravka */}
              <div className="flex flex-col gap-1 col-span-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${t.inputLabel}`}>Zaprafka</label>
                <input
                  list="sklad-list"
                  placeholder="№ yoki nom..."
                  value={supplyPointRaw}
                  onChange={e => handleSupplyPointInput(e.target.value)}
                  className={`${t.inputBg} rounded-lg px-2.5 py-2 text-sm outline-none transition-all w-full`}
                />
                <datalist id="sklad-list">{skladOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>

              {/* 2. Poyezd rusumi */}
              <div className="flex flex-col gap-1 col-span-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${t.inputLabel}`}>Poyezd rusumi</label>
                <input
                  list="series-list"
                  placeholder="№ yozing..."
                  value={formData.locoSeries || ''}
                  onChange={e => { const v = e.target.value; const f = seriesOptionsState.find(o => o.key === v); setFormData({ ...formData, locoSeries: f ? f.value : v }); }}
                  className={`${t.inputBg} rounded-lg px-2.5 py-2 text-sm outline-none transition-all w-full`}
                />
                <datalist id="series-list">{seriesOptionsState.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>

              {/* 3. Raqami (locoCode) */}
              <FormInput label="Raqami" type="text" value={formData.locoCode} onChange={v => setFormData({ ...formData, locoCode: v })} theme={t.inputBg} labelClass={t.inputLabel} />

              {/* 4. Harakat turi */}
              <div className="flex flex-col gap-1 col-span-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${t.inputLabel}`}>Harakat turi</label>
                <input
                  list="move-list"
                  placeholder="№ yozing..."
                  value={formData.moveType || ''}
                  onChange={e => { const v = e.target.value; const f = moveOptions.find(o => o.key === v); setFormData({ ...formData, moveType: f ? f.value : v }); }}
                  className={`${t.inputBg} rounded-lg px-2.5 py-2 text-sm outline-none transition-all w-full`}
                />
                <datalist id="move-list">{moveOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>

              {/* 5. Poyezd Raqami (locoNumber) */}
              <FormInput label="P.Raqami" type="text" value={formData.locoNumber} onChange={v => setFormData({ ...formData, locoNumber: v })} theme={t.inputBg} labelClass={t.inputLabel} />

              {/* 6. Ruxsat indexi */}
              <FormInput label="Ruxsat indexi" value={formData.trainNumber} onChange={v => setFormData({ ...formData, trainNumber: v })} theme={t.inputBg} labelClass={t.inputLabel} />

              {/* 7. Poyezd Vazni */}
              <FormInput label="Poyezd Vazni" type="number" value={formData.weight} onChange={v => setFormData({ ...formData, weight: v })} theme={t.inputBg} labelClass={t.inputLabel} />

              {/* 8. Xodim */}
              <div className="flex flex-col gap-1 col-span-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${t.inputLabel}`}>Xodim</label>
                <input
                  list="staff-list"
                  placeholder="Tabel № yoki ism..."
                  value={staffInputRaw}
                  onChange={e => handleStaffInput(e.target.value)}
                  className={`${t.inputBg} rounded-lg px-2.5 py-2 text-sm outline-none transition-all w-full`}
                />
                <datalist id="staff-list">{staffList.map(s => <option key={s.id} value={s.tabelNumber}>{s.tabelNumber} - {s.fullName} ({s.zapravka})</option>)}</datalist>
                {formData.staffName && staffInputRaw !== formData.staffName && (
                  <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${t.confirmBadge}`}><span>✓</span> {formData.staffName}</p>
                )}
              </div>

              {/* 9. Qoldiq */}
              <FormInput label="Kelgan qoldiq" type="number" value={formData.balanceBefore} onChange={v => setFormData({ ...formData, balanceBefore: v })} theme={t.inputBg} labelClass={t.inputLabel} />

              {/* 10. Yoqilg'i */}
              <FormInput label="Berilgan yoqilg'i" type="number" value={formData.fuelAmount} onChange={v => setFormData({ ...formData, fuelAmount: v })} theme={t.inputBg} labelClass={t.inputLabel} />
            </div>

            {/* Action buttons */}
            <div className={`flex flex-wrap items-center justify-between gap-2 pt-4 mt-3 border-t ${isDarkMode ? 'border-white/[0.07]' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={clearForm}
                className={`px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-all active:scale-95 
                  ${isDarkMode ? 'bg-white/[0.06] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]' : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200'}`}
              >
                <span>↻</span> Tozalash
              </button>
              <button
                type="submit"
                disabled={isTodayClosed}
                className={`ml-auto px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-all active:scale-95 
                  ${isTodayClosed
                    ? (isDarkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed')
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
              >
                <span>{editingId ? '💾' : '+'}</span>
                {'Saqlash'}
              </button>
            </div>
          </form>
        </section>

        {/* ── DATA TABLE ────────────────────────────────────────────────── */}
        <section className={`${t.tableBg} rounded-2xl overflow-hidden`}>
          {/* Table header with export buttons */}
          <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 ${isDarkMode ? 'bg-[#111827] border-b border-white/[0.07]' : 'bg-slate-100 border-b border-slate-200'}`}>
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Jami yozuvlar: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{visibleRows.length}</strong>
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => {
                if (isMobileDevice()) openMobileExport('pdf', visibleRows);
                else handleExportPdf();
              }} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm">
                📄 PDF
              </button>
              <button type="button" onClick={() => {
                if (isMobileDevice()) openMobileExport('erju', visibleRows);
                else handleExportErjuPdf();
              }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm">
                📊 ERJU PDF
              </button>
            </div>
          </div>

          {/* Scrollable table */}
          <div className="table-scroll">
            <table className="w-full text-left" style={{ minWidth: '900px' }}>
              <thead className={`uppercase font-black tracking-[0.06em] ${isDarkMode ? 'text-red-400 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400' : 'text-red-700 bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-300'}`}>
                <tr>
                  {[
                    { full: '№', short: '№' },
                    { full: 'Vaqt', short: 'Vaqt' },
                    { full: 'Teplovoz', short: 'Tplv' },
                    { full: 'Raqami', short: 'Raqam' },
                    { full: 'Zaprafka', short: 'Zap' },
                    { full: 'Harakat', short: 'Hrk' },
                    { full: 'P.Raqami', short: 'P.R' },
                    { full: 'Ruxsat idx', short: 'Idx' },
                    { full: 'Vazn', short: 'Vazn' },
                    { full: 'Xodim', short: 'Xdm' },
                    { full: 'Qoldiq', short: 'Qol' },
                    { full: "Yoqilg'i", short: "Yoq." },
                    { full: 'Hisob', short: 'His' },
                    { full: '', short: '' }
                  ].map((h, i) => (
                    <th key={i} className={`px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-black drop-shadow-[0_1px_0_rgba(0,0,0,0.25)] whitespace-nowrap ${isDarkMode ? 'border-b border-amber-500/60' : 'border-b border-amber-400/70'} ${i === 0 ? 'text-center w-10' : ''} ${i >= 10 ? 'text-right' : ''} ${i === 13 ? 'w-20' : ''}`}>
                      <span className="sm:hidden">{h.short}</span>
                      <span className="hidden sm:inline">{h.full}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={14} className={`text-center py-12 text-sm ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      Hozircha ma&apos;lumot yo&apos;q
                    </td>
                  </tr>
                )}
                {visibleRows.map((row, idx) => (
                  <tr key={row.id} className={`transition-colors group ${t.tableRow}`}>
                    <td className={`px-3 py-2.5 text-center text-sm font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{visibleRows.length - idx}</td>
                    <td className={`px-3 py-2.5 text-sm font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{row.time}</td>
                    <td className={`px-3 py-2.5 text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{row.locoSeries}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.locoCode}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.supplyPoint}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.moveType}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.locoNumber}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.trainNumber}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell}`}>{row.weight}</td>
                    <td className={`px-3 py-2.5 text-sm ${t.tableCell} max-w-[120px] truncate`}>{row.staffName}</td>
                    <td className={`px-3 py-2.5 text-sm text-right font-mono font-semibold ${t.tableMono}`}>{Number(row.balanceBefore).toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-sm text-right font-mono font-bold ${t.tableFuel}`}>{Number(row.fuelAmount).toLocaleString()}</td>
                    <td className={`px-3 py-2.5 text-sm text-right font-mono font-bold ${t.tableSum}`}>{(Number(row.balanceBefore) + Number(row.fuelAmount)).toLocaleString()}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex justify-center gap-1 transition-all">
                        <button onClick={() => editRow(row)} className={`p-1.5 rounded-lg text-xs transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-100'}`}>✏️</button>
                        <button onClick={() => deleteRow(row.id)} className={`p-1.5 rounded-lg text-xs transition-colors ${isDarkMode ? 'text-rose-400 hover:bg-rose-400/10' : 'text-red-600 hover:bg-red-100'}`}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer bar */}
          <div className={`${t.footerBar} px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <span className={t.footerText}>Hisob yoqilg&apos;i: <strong>{stats.total.toLocaleString()}</strong></span>
              <span className={isDarkMode ? 'text-slate-600' : 'text-slate-400'}>|</span>
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Sana: {todayDate}</span>
              <span className={isDarkMode ? 'text-slate-600' : 'text-slate-400'}>|</span>
              <span className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>Bugungi jami: <strong>{todayTotal.toLocaleString()}</strong></span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (isTodayClosed) return;
                  const ok = window.confirm("Bugungi kunni yopishga aniqmisiz?");
                  if (!ok) return;
                  await setDoc(doc(db, 'closedDays', activeEntryDate), { date: activeEntryDate, closedAt: Date.now() });
                }}
                disabled={isTodayClosed}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95
                  ${isTodayClosed
                    ? (isDarkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                  }`}
              >
                Бугунги кунни ёпиш
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (closedDaysMeta.length === 0) return;
                  const last = [...closedDaysMeta].sort((a, b) => b.closedAt - a.closedAt)[0];
                  if (!last) return;
                  const ok = window.confirm(`${last.date} yopilgan kunini qaytarilsinmi?`);
                  if (!ok) return;
                  await deleteDoc(doc(db, 'closedDays', last.date));
                  setActiveEntryDate(last.date);
                }}
                disabled={closedDaysMeta.length === 0}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95
                  ${closedDaysMeta.length === 0
                    ? (isDarkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-sm'
                  }`}
              >
                Ёпилган кечаги кунни қайтариш
              </button>
            </div>
          </div>
        </section>

        {/* ── MODALS ─────────────────────────────────────────────────────── */}

        {/* XODIMLAR MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
            <div className={`relative ${t.modalBg} w-full sm:max-w-5xl rounded-t-3xl sm:rounded-3xl z-[10000] flex flex-col overflow-hidden`}
              style={{ maxHeight: '92vh' }}>
              <div className={`flex items-center justify-between px-5 py-4 shrink-0 ${t.modalHeader}`}>
                <div>
                  <h2 className={`font-bold text-lg ${t.modalTitle}`}>Xodimlarni boshqarish</h2>
                  <p className={`text-xs mt-0.5 ${t.modalSub}`}>ERJU va zapravkani tanlab, xodimlarni kiriting</p>
                </div>
                <button onClick={closeModal} className={`${t.closeBtn} p-2 rounded-full transition-all`}><span>✖</span></button>
              </div>
              <div className="flex overflow-hidden flex-1 min-h-0">
                {/* ERJU list */}
                <div className={`w-44 sm:w-52 shrink-0 overflow-y-auto p-3 space-y-1 ${t.panelBg}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-2 pb-1 ${t.modalSub}`}>Mintaqalar</p>
                  {ERJU_DATA.map(erju => {
                    const cnt = staffList.filter(s => s.erju === erju.name).length;
                    const active = selectedErju === erju.name;
                    return (
                      <button key={erju.name} onClick={() => handleErjuSelect(erju.name)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between
                          ${active ? t.sidebarActive : t.sidebarItem}`}>
                        <div>
                          <p className="font-semibold text-xs leading-tight">{erju.name}</p>
                          <p className={`text-[10px] mt-0.5 ${active ? 'opacity-80' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>{cnt} ta xodim</p>
                        </div>
                        <span className="text-xs opacity-60">›</span>
                      </button>
                    );
                  })}
                </div>
                {/* Zapravka & Add form */}
                <div className={`w-56 sm:w-64 shrink-0 overflow-y-auto p-4 space-y-4 ${t.panelBg}`}>
                  {!selectedErju ? <p className={`text-sm text-center pt-10 ${t.modalSub}`}>ERJU tanlang</p> : (
                    <>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${t.modalSub}`}>Zapravka</p>
                        <select value={selectedZapravka} onChange={e => setSelectedZapravka(e.target.value)}
                          className={`w-full ${t.panelInput} rounded-xl px-3 py-2.5 text-sm outline-none transition-all`}>
                          <option value="">Tanlang...</option>
                          {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                      {selectedZapravka && (
                        <div className="space-y-3">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${t.modalSub}`}>Yangi xodim</p>
                          <div>
                            <label className={`text-[10px] font-bold uppercase ml-1 ${t.modalSub}`}>Tabel raqam</label>
                            <input value={newStaffTabel} onChange={e => setNewStaffTabel(e.target.value)}
                              className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none transition-all`}
                              placeholder="12345" />
                          </div>
                          <div>
                            <label className={`text-[10px] font-bold uppercase ml-1 ${t.modalSub}`}>F.I.SH</label>
                            <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStaff()}
                              className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none transition-all`}
                              placeholder="Ism Familya" />
                          </div>
                          <button onClick={addStaff} disabled={!newStaffName.trim() || !newStaffTabel.trim()}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                            Saqlash
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* Staff list */}
                <div className="flex-1 overflow-y-auto p-4">
                  {!selectedErju ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
                      <span className="text-3xl">👥</span>
                      <p className="text-sm">ERJU tanlanganida xodimlar ko&apos;rinadi</p>
                    </div>
                  ) : (
                    <>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.modalSub}`}>
                        {selectedErju} — {erjuAllStaff.length} ta xodim
                      </p>
                      {erjuAllStaff.length === 0
                        ? <p className={`text-sm text-center py-8 ${t.modalSub}`}>Hozircha xodim yo&apos;q</p>
                        : (
                          <div className="space-y-2">
                            {erjuAllStaff.map((staff, i) => (
                              <div key={staff.id} className={`${t.staffCard} rounded-xl px-4 py-2.5 group`}>
                                {editingStaffId === staff.id ? (
                                  <div className="space-y-2">
                                    <select value={editStaff.zapravka} onChange={e => setEditStaff(p => ({ ...p, zapravka: e.target.value }))}
                                      className={`w-full ${t.panelInput} rounded-lg px-2 py-1.5 text-xs outline-none`}>
                                      {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                      <input value={editStaff.tabel} onChange={e => setEditStaff(p => ({ ...p, tabel: e.target.value }))}
                                        className={`w-24 ${t.panelInput} rounded-lg px-2 py-1.5 text-xs outline-none`} placeholder="Tabel" />
                                      <input value={editStaff.name} onChange={e => setEditStaff(p => ({ ...p, name: e.target.value }))}
                                        className={`flex-1 ${t.panelInput} rounded-lg px-2 py-1.5 text-xs outline-none`} placeholder="F.I.SH" />
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={saveStaffEdit} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">✓ Saqlash</button>
                                      <button onClick={() => setEditingStaffId(null)} className={`px-3 py-1.5 rounded-lg text-xs ${isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>Bekor</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className={`font-mono text-xs w-5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{i + 1}</span>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{staff.fullName}</span>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isDarkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>#{staff.tabelNumber}</span>
                                        </div>
                                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{staff.zapravka}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 transition-all">
                                      <button onClick={() => { setEditingStaffId(staff.id); setEditStaff({ name: staff.fullName, tabel: staff.tabelNumber, zapravka: staff.zapravka }); }}
                                        className={`p-1.5 rounded-lg text-xs ${isDarkMode ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-100'}`}>✏️</button>
                                      <button onClick={async () => { await deleteDoc(doc(db, 'staff', staff.id)); }}
                                        className={`p-1.5 rounded-lg text-xs ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-red-600 hover:bg-red-100'}`}>🗑️</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HARAKAT TURI MODAL */}
        {isMoveModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMoveModal} />
            <div className={`relative ${t.modalBg} w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl z-[10000] flex flex-col overflow-hidden`}
              style={{ maxHeight: '88vh' }}>
              <div className={`flex items-center justify-between px-5 py-4 shrink-0 ${t.modalHeader}`}>
                <div>
                  <h2 className={`font-bold text-lg ${isDarkMode ? 'text-amber-300' : 'text-slate-900'}`}>Harakat turlari</h2>
                  <p className={`text-xs mt-0.5 ${t.modalSub}`}>Ro&apos;yxatni boshqarish</p>
                </div>
                <button onClick={closeMoveModal} className={`${t.closeBtn} p-2 rounded-full transition-all`}><span>✖</span></button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto hide-scrollbar">
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] font-semibold uppercase tracking-widest ${t.modalSub}`}>Mavjud turlari</p>
                  <button onClick={() => setIsMoveAddOpen(v => !v)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">+ Qo&apos;shish</button>
                </div>
                {isMoveAddOpen && (
                  <div className={`${isDarkMode ? 'bg-black/30 border border-white/10' : 'bg-slate-100 border border-slate-200'} rounded-2xl p-4 space-y-3`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[10px] font-bold uppercase ${t.modalSub}`}>Tartib №</label>
                        <input value={newMoveKey} onChange={e => setNewMoveKey(e.target.value)} className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} placeholder="7" />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase ${t.modalSub}`}>Harakat nomi</label>
                        <input value={newMoveValue} onChange={e => setNewMoveValue(e.target.value)} className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} placeholder="Yangi harakat" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addMoveOption} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">Saqlash</button>
                      <button onClick={() => { setIsMoveAddOpen(false); setNewMoveKey(''); setNewMoveValue(''); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>Bekor</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {moveOptions.map(m => (
                    <div key={m.key} className={`${isDarkMode ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'} rounded-2xl px-4 py-3`}>
                      {editingMoveKey === m.key ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editMoveKey} onChange={e => setEditMoveKey(e.target.value)} className={`${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} />
                          <input value={editMoveValue} onChange={e => setEditMoveValue(e.target.value)} className={`${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} />
                          <div className="col-span-2 flex gap-2">
                            <button onClick={saveMoveEdit} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Saqlash</button>
                            <button onClick={() => setEditingMoveKey(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>Bekor</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-xs w-7 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>#{m.key}</span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{m.value}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditingMoveKey(m.key); setEditMoveKey(m.key); setEditMoveValue(m.value); }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isDarkMode ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>Edit</button>
                            <button onClick={async () => { await deleteDoc(doc(db, 'moveOptions', m.key)); }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isDarkMode ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Del</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POYEZD RUSUMI MODAL */}
        {isSeriesModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSeriesModal} />
            <div className={`relative ${t.modalBg} w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl z-[10000] flex flex-col overflow-hidden`}
              style={{ maxHeight: '88vh' }}>
              <div className={`flex items-center justify-between px-5 py-4 shrink-0 ${t.modalHeader}`}>
                <div>
                  <h2 className={`font-bold text-lg ${isDarkMode ? 'text-amber-300' : 'text-slate-900'}`}>Poyezd rusumi</h2>
                  <p className={`text-xs mt-0.5 ${t.modalSub}`}>Ro&apos;yxatni boshqarish</p>
                </div>
                <button onClick={closeSeriesModal} className={`${t.closeBtn} p-2 rounded-full transition-all`}><span>✖</span></button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto hide-scrollbar">
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] font-semibold uppercase tracking-widest ${t.modalSub}`}>Mavjud rusumlar</p>
                  <button onClick={() => setIsSeriesAddOpen(v => !v)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">+ Qo&apos;shish</button>
                </div>
                {isSeriesAddOpen && (
                  <div className={`${isDarkMode ? 'bg-black/30 border border-white/10' : 'bg-slate-100 border border-slate-200'} rounded-2xl p-4 space-y-3`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[10px] font-bold uppercase ${t.modalSub}`}>Tartib №</label>
                        <input value={newSeriesKey} onChange={e => setNewSeriesKey(e.target.value)} className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} placeholder="11" />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase ${t.modalSub}`}>Rusum nomi</label>
                        <input value={newSeriesValue} onChange={e => setNewSeriesValue(e.target.value)} className={`w-full mt-1 ${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} placeholder="Yangi rusum" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addSeriesOption} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">Saqlash</button>
                      <button onClick={() => { setIsSeriesAddOpen(false); setNewSeriesKey(''); setNewSeriesValue(''); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>Bekor</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {seriesOptionsState.map(m => (
                    <div key={m.key} className={`${isDarkMode ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'} rounded-2xl px-4 py-3`}>
                      {editingSeriesKey === m.key ? (
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editSeriesKey} onChange={e => setEditSeriesKey(e.target.value)} className={`${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} />
                          <input value={editSeriesValue} onChange={e => setEditSeriesValue(e.target.value)} className={`${t.panelInput} rounded-xl px-3 py-2 text-sm outline-none`} />
                          <div className="col-span-2 flex gap-2">
                            <button onClick={saveSeriesEdit} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Saqlash</button>
                            <button onClick={() => setEditingSeriesKey(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>Bekor</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-xs w-7 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>#{m.key}</span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{m.value}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditingSeriesKey(m.key); setEditSeriesKey(m.key); setEditSeriesValue(m.value); }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isDarkMode ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>Edit</button>
                            <button onClick={async () => { await deleteDoc(doc(db, 'seriesOptions', m.key)); }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isDarkMode ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>Del</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPLIN SKLAD SIDEBAR */}
        {isSkladOpen && (
          <>
            <div className={`fixed top-0 left-0 h-full w-64 shadow-2xl z-[10001] border-r ${t.skladBg}`}>
              <div className={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-white/[0.1] bg-[#0a0f1e]/95' : 'border-slate-200 bg-white'}`}>
                <h2 className={`text-base font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Toplin Sklad</h2>
                <button onClick={() => setIsSkladOpen(false)} className={`${t.closeBtn} p-1.5 rounded-full transition-all`}><span className="text-sm">✖</span></button>
              </div>
              <nav className="mt-3 space-y-4 overflow-y-auto hide-scrollbar pb-8 px-3" style={{ maxHeight: 'calc(100vh - 65px)' }}>
                {[
                  { label: 'Toshkent ERJU', items: [['1','Toshkent'],['3','Angren'],['4','Sirdaryo'],['5','Hovos'],['6','Jizzax']] },
                  { label: "Qo'qon ERJU", items: [['10','Andijon'],['7',"Qo'qon"],['8',"Marg'ilon"]] },
                  { label: 'Buxoro ERJU', items: [['11','Samarqand'],['13','Ziyouddin'],['14','Buxoro'],['15','Tinchlik'],['16','Uchquduq']] },
                  { label: "Qo'ng'irot ERJU", items: [['20',"Qo'ng'irot"],['23','Urganch'],['24','Miskin']] },
                  { label: 'Qarshi ERJU', items: [['17','Qarshi']] },
                  { label: 'Termiz ERJU', items: [['18','Termiz'],['19','Darband'],['26',"Qumqo'rg'on"]] },
                ].map(g => (
                  <div key={g.label}>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 px-1 ${t.skladLabel}`}>{g.label}</p>
                    <div className="space-y-1.5">
                      {g.items.map(([k, v]) => (
                        <button key={k} type="button" onClick={() => selectSklad(k)}
                          className={`text-left w-full px-3 py-2 rounded-xl transition-all text-sm ${t.skladItem}`}>
                          <span className={`font-mono text-[10px] mr-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>#{k}</span>
                          <span className="font-medium">{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div onClick={() => setIsSkladOpen(false)} className="fixed inset-0 bg-black/40 z-[10000]" />
          </>
        )}

        {isMobileExportOpen && (
          <div className="fixed inset-0 z-[10020] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileExportOpen(false)} />
            <div className={`relative ${t.modalBg} w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl z-[10021] overflow-hidden`} style={{ maxHeight: '90vh' }}>
              <div className={`flex items-center justify-between px-4 py-3 ${t.modalHeader}`}>
                <h3 className={`font-bold text-sm ${t.modalTitle}`}>{mobileExportTitle}</h3>
                <button onClick={() => setIsMobileExportOpen(false)} className={`${t.closeBtn} p-1.5 rounded-full`}>✖</button>
              </div>
              <div className="p-3 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <div ref={mobileExportRef} className="bg-white text-black rounded-xl p-3">
                  <h4 className="font-bold text-sm mb-2">{mobileExportType === 'pdf' ? 'Hisobot ro‘yxati' : 'ERJU ro‘yxati'}</h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-1">№</th>
                        <th className="border p-1">Vaqt</th>
                        <th className="border p-1">Zapravka</th>
                        <th className="border p-1">Harakat</th>
                        <th className="border p-1">Yoqilg&apos;i</th>
                        <th className="border p-1">Hisob</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mobileExportRows.map((r, i) => (
                        <tr key={r.id}>
                          <td className="border p-1 text-center">{i + 1}</td>
                          <td className="border p-1 text-center">{r.time}</td>
                          <td className="border p-1">{r.supplyPoint}</td>
                          <td className="border p-1">{r.moveType}</td>
                          <td className="border p-1 text-right">{Number(r.fuelAmount || 0).toLocaleString()}</td>
                          <td className="border p-1 text-right">{(Number(r.balanceBefore || 0) + Number(r.fuelAmount || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-3 border-t border-white/10 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (mobileExportType === 'pdf') handleExportPdf(mobileExportRows);
                    else handleExportErjuPdf(mobileExportRows);
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  PDF qilish
                </button>
                <button
                  type="button"
                  onClick={saveMobileExportAsImage}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Rasmga saqlash
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdminAuthOpen && !isAdmin && (
          <div className="fixed inset-0 z-[10030] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdminAuthOpen(false)} />
            <div className={`relative ${t.modalBg} w-full max-w-sm rounded-2xl p-4`}>
              <h3 className={`text-sm font-bold mb-2 ${t.modalTitle}`}>Admin kirish</h3>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Parol kiriting..."
                className={`${t.panelInput} w-full rounded-lg px-3 py-2 text-sm outline-none`}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setIsAdminAuthOpen(false)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>Bekor</button>
                <button
                  type="button"
                  onClick={() => {
                    if (adminPasswordInput === '1985') {
                      setAdminPasswordInput('');
                      setIsAdminAuthOpen(false);
                      router.push('/admin');
                    } else {
                      alert('Parol noto‘g‘ri');
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Kirish
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onPointerDown={onChatPointerDown}
          onPointerMove={onChatPointerMove}
          onPointerUp={onChatPointerUp}
          className="fixed z-[10040] w-12 h-12 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-xl text-lg touch-none"
          style={{ left: `${chatButtonPos.x}px`, top: `${chatButtonPos.y}px` }}
          title="Suhbat"
        >
          💬
        </button>
        {isChatOpen && (
          <div className={`fixed z-[10041] w-[320px] max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden ${t.modalBg}`}
            style={{ left: `${Math.max(8, Math.min(chatButtonPos.x - 264, window.innerWidth - 330))}px`, top: `${Math.max(8, chatButtonPos.y - 330)}px` }}>
            <div className={`px-3 py-2 flex items-center justify-between ${t.modalHeader}`}>
              <span className={`text-xs font-bold ${t.modalTitle}`}>User/Admin Chat</span>
              <div className="flex items-center gap-1">
                <button onClick={clearChatMessages} className="text-[10px] px-2 py-1 rounded bg-rose-600 text-white">Tozalash</button>
                <button onClick={() => setIsChatOpen(false)} className="text-xs px-2">✖</button>
              </div>
            </div>
            <div className="h-64 overflow-y-auto p-2 space-y-2">
              {chatMessages.map((m) => (
                <div key={m.id} className={`px-2 py-1.5 rounded-lg text-xs ${m.role === 'admin' ? 'bg-blue-600/20 text-blue-200' : 'bg-emerald-600/20 text-emerald-200'}`}>
                  <div className="font-semibold mb-0.5">{m.role === 'admin' ? 'Admin' : 'User'}</div>
                  {editingChatId === m.id ? (
                    <div className="space-y-1">
                      <input
                        value={editingChatText}
                        onChange={(e) => setEditingChatText(e.target.value)}
                        className={`${t.panelInput} w-full rounded px-2 py-1 text-xs`}
                      />
                      <div className="flex gap-1">
                        <button onClick={saveChatEdit} className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white">Saqlash</button>
                        <button onClick={() => { setEditingChatId(null); setEditingChatText(''); }} className="text-[10px] px-2 py-1 rounded bg-slate-600 text-white">Bekor</button>
                      </div>
                    </div>
                  ) : (
                    <div>{m.text}</div>
                  )}
                  <div className="flex justify-end gap-1 mt-1">
                    <button onClick={() => { setEditingChatId(m.id); setEditingChatText(m.text); }} className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white">Edit</button>
                    <button onClick={() => deleteChatMessage(m.id)} className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white">Del</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-white/10 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Xabar yozing..."
                className={`${t.panelInput} flex-1 rounded-lg px-2 py-1.5 text-xs outline-none`}
              />
              <button onClick={sendChatMessage} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">Yuborish</button>
            </div>
          </div>
        )}

        <RentCalendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onExportPdf={(start, end) => {
            const rangeRows = getRowsByRange(start, end);
            if (isMobileDevice()) openMobileExport('pdf', rangeRows);
            else handleExportPdf(rangeRows);
          }}
          onExportErjuPdf={(start, end) => {
            const rangeRows = getRowsByRange(start, end);
            if (isMobileDevice()) openMobileExport('erju', rangeRows);
            else handleExportErjuPdf(rangeRows);
          }}
        />
      </main>
    </div>
  );
};

// ── Reusable form input ───────────────────────────────────────────────────────
interface FormInputProps {
  label: string;
  type?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  theme: string;
  labelClass: string;
  placeholder?: string;
}
const FormInput = ({ label, type = 'text', value, onChange, theme, labelClass, placeholder }: FormInputProps) => (
  <div className="flex flex-col gap-1">
    <label className={`text-[10px] font-bold uppercase tracking-wider ${labelClass}`}>{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || `${label}...`}
      className={`${theme} rounded-lg px-2.5 py-2 text-sm outline-none transition-all w-full`}
    />
  </div>
);

export { TrainFuelSystem };

export default function UserPage() {
  return <TrainFuelSystem isAdmin={false} />;
}
