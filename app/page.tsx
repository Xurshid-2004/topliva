
// "use client";

// import React, { useState, useEffect, useMemo, useRef } from 'react';

// interface FuelRecord {
//   id: string; date: string; locCode: string; supplyPoint: string; time: string;
//   route: string; locoCode: string; locoSeries: string; locoNumber: string;
//   trainCode: string; trainNumber: string; moveType: string; trainIndex: string;
//   weight: string; balanceBefore: string; fuelAmount: string; staffName: string;
// }

// interface Staff {
//   id: string; erju: string; zapravka: string; tabelNumber: string; fullName: string;
// }

// const ERJU_DATA = [
//   { name: 'Toshkent ERJU', zapravkalar: ['Toshkent zapravka', 'Angren zapravka', 'Sirdaryo zapravka', 'Xovos zapravka', 'Jizzax zapravka'] },
//   { name: 'Buxoro ERJU', zapravkalar: ['Samarqand zapravka', 'Ziyouddin zapravka', 'Tinchlik zapravka', 'Buxoro zapravka', 'Uchquduq zapravka'] },
//   { name: 'Qarshi ERJU', zapravkalar: ['Qarshi zapravka'] },
//   { name: "Qo'qon ERJU", zapravkalar: ['Andijon zapravka', "Qo'qon zapravka", "Marg'ilon zapravka"] },
//   { name: 'Termiz ERJU', zapravkalar: ['Termiz zapravka', 'Darband zapravka', "Qumqo'rg'on zapravka"] },
//   { name: "Qo'ng'irot ERJU", zapravkalar: ["Qo'ng'irot zapravka", 'Urganch zapravka', 'Miskin zapravka'] },
// ];

// const seriesOptions = [
//   { key: '1', value: 'ТЭМ' }, { key: '2', value: 'ЧМЭ' }, { key: '3', value: '2Т2 10 М' },
//   { key: '4', value: '3Т2 10 М' }, { key: '5', value: 'Узте 16 М2' }, { key: '6', value: 'Узте 16 М3' },
//   { key: '7', value: 'Узте 16 М4' }, { key: '8', value: 'ТЗ 12 4' }, { key: '9', value: 'ТеП 705 С' }, { key: '10', value: 'ТГК' },
// ];

// const initialMoveOptions = [
//   { key: '1', value: 'Грузовой' }, { key: '2', value: 'Пассажирский' }, { key: '3', value: 'Ремонт' },
//   { key: '4', value: 'Маневр' }, { key: '5', value: 'Пригородный' }, { key: '6', value: 'Аренда' },
// ];

// const skladOptions = [
//   { key: '1', value: 'Toshkent' },
//   { key: '3', value: 'Angren' },
//   { key: '4', value: 'Sirdaryo' },
//   { key: '5', value: 'Hovos' },
//   { key: '6', value: 'Jizzax' },
//   { key: '10', value: 'Andijon' },
//   { key: '7', value: "Qo'qon" },
//   { key: '8', value: "Marg'ilon" },
//   { key: '11', value: 'Samarqand' },
//   { key: '13', value: 'Ziyouddin' },
//   { key: '14', value: 'Buxoro' },
//   { key: '15', value: 'Tinchlik' },
//   { key: '16', value: 'Uchquduq' },
//   { key: '20', value: "Qo'ng'irot" },
//   { key: '23', value: 'Urganch' },
//   { key: '24', value: 'Miskin' },
//   { key: '17', value: 'Qarshi' },
//   { key: '18', value: 'Termiz' },
//   { key: '19', value: 'Darband' },
//   { key: '26', value: "Qumqo'rg'on" },
// ];

// const loadRows = (): FuelRecord[] => { try { return JSON.parse(localStorage.getItem('uty_fuel_records') || '[]'); } catch { return []; } };
// const loadStaff = (): Staff[] => { try { return JSON.parse(localStorage.getItem('uty_staff') || '[]'); } catch { return []; } };

// const TrainFuelSystem = () => {
//   const [rows, setRows] = useState<FuelRecord[]>([]);
//   const [staffList, setStaffList] = useState<Staff[]>([]);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [formData, setFormData] = useState<Partial<FuelRecord>>({ supplyPoint: '', route: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' });
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [staffInputRaw, setStaffInputRaw] = useState('');
//   const [supplyPointRaw, setSupplyPointRaw] = useState('');
//   const supplyPointTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const supplyPointRawRef = useRef('');
//   const [moveOptions, setMoveOptions] = useState(initialMoveOptions);
//   const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
//   const [isMoveAddOpen, setIsMoveAddOpen] = useState(false);
//   const [newMoveKey, setNewMoveKey] = useState('');
//   const [newMoveValue, setNewMoveValue] = useState('');
//   const [editingMoveKey, setEditingMoveKey] = useState<string | null>(null);
//   const [editMoveKey, setEditMoveKey] = useState('');
//   const [editMoveValue, setEditMoveValue] = useState('');

//   // Modal state
//   const [selectedErju, setSelectedErju] = useState('');
//   const [selectedZapravka, setSelectedZapravka] = useState('');
//   const [newStaffName, setNewStaffName] = useState('');
//   const [newStaffTabel, setNewStaffTabel] = useState('');
//   const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
//   const [editStaff, setEditStaff] = useState({ name: '', tabel: '', zapravka: '' });
//   const [isSkladOpen, setIsSkladOpen] = useState(false);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setRows(loadRows());
//       setStaffList(loadStaff());
//       setIsLoaded(true);
//     }
//   }, []);

//   useEffect(() => { 
//     if (isLoaded) {
//       localStorage.setItem('uty_fuel_records', JSON.stringify(rows)); 
//     }
//   }, [rows, isLoaded]);
  
//   useEffect(() => { 
//     if (isLoaded) {
//       localStorage.setItem('uty_staff', JSON.stringify(staffList)); 
//     }
//   }, [staffList, isLoaded]);
//   useEffect(() => {
//     document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isModalOpen]);

//   useEffect(() => {
//     document.body.style.overflow = isSkladOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isSkladOpen]);

//   useEffect(() => {
//     document.body.style.overflow = isMoveModalOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [isMoveModalOpen]);

//   const closeModal = () => { setIsModalOpen(false); setSelectedErju(''); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };

//   const handleErjuSelect = (name: string) => { setSelectedErju(name); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };

//   const addStaff = () => {
//     if (!selectedErju || !selectedZapravka || !newStaffName.trim() || !newStaffTabel.trim()) return;
//     if (staffList.find(s => s.tabelNumber === newStaffTabel.trim())) { alert('Bu tabel raqam allaqachon mavjud!'); return; }
//     setStaffList(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), erju: selectedErju, zapravka: selectedZapravka, tabelNumber: newStaffTabel.trim(), fullName: newStaffName.trim() }]);
//     setNewStaffName(''); setNewStaffTabel('');
//   };

//   const saveStaffEdit = () => {
//     if (!editStaff.name.trim() || !editStaff.tabel.trim()) return;
//     setStaffList(prev => prev.map(s => s.id === editingStaffId ? { ...s, fullName: editStaff.name.trim(), tabelNumber: editStaff.tabel.trim(), zapravka: editStaff.zapravka } : s));
//     setEditingStaffId(null);
//   };

//   const closeMoveModal = () => {
//     setIsMoveModalOpen(false);
//     setIsMoveAddOpen(false);
//     setNewMoveKey('');
//     setNewMoveValue('');
//     setEditingMoveKey(null);
//   };

//   const addMoveOption = () => {
//     const key = newMoveKey.trim();
//     const value = newMoveValue.trim();
//     if (!key || !value) return;
//     if (moveOptions.some(o => o.key === key)) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
//     setMoveOptions(prev => [...prev, { key, value }]);
//     setNewMoveKey('');
//     setNewMoveValue('');
//     setIsMoveAddOpen(false);
//   };

//   const saveMoveEdit = () => {
//     if (!editMoveKey.trim() || !editMoveValue.trim()) return;
//     if (editMoveKey.trim() !== editingMoveKey && moveOptions.some(o => o.key === editMoveKey.trim())) {
//       alert('Bu tartib raqam allaqachon mavjud!');
//       return;
//     }
//     setMoveOptions(prev => prev.map(o => o.key === editingMoveKey ? { key: editMoveKey.trim(), value: editMoveValue.trim() } : o));
//     setEditingMoveKey(null);
//   };

//   // Seriya kabi: tabel raqam kiritilsa ism auto-fill
//   const handleStaffInput = (raw: string) => {
//     setStaffInputRaw(raw);
//     const byTabel = staffList.find(s => s.tabelNumber === raw.trim());
//     if (byTabel) { setFormData(prev => ({ ...prev, staffName: byTabel.fullName })); return; }
//     const byName = staffList.find(s => s.fullName === raw.trim());
//     setFormData(prev => ({ ...prev, staffName: byName ? byName.fullName : raw }));
//   };

//   // Mesto: raqam yoki nomdan tanlang
//   const handleSupplyPointInput = (raw: string, forceExact = false) => {
//     const v = raw.trim();
//     if (supplyPointTimerRef.current) {
//       clearTimeout(supplyPointTimerRef.current);
//       supplyPointTimerRef.current = null;
//     }
//     const byKey = skladOptions.find(o => o.key === v);
//     const hasLongerPrefix = skladOptions.some(o => o.key.startsWith(v) && o.key.length > v.length);
//     const shouldResolve = !!byKey && (forceExact || !hasLongerPrefix || v.length >= 2);
//     if (shouldResolve) {
//       setFormData(prev => ({ ...prev, supplyPoint: byKey.value, trainIndex: byKey.key }));
//       setSupplyPointRaw(byKey.value);
//       supplyPointRawRef.current = byKey.value;
//       return;
//     }
//     setFormData(prev => ({ ...prev, supplyPoint: raw, trainIndex: byKey ? prev.trainIndex : '' }));
//     setSupplyPointRaw(raw);
//     supplyPointRawRef.current = raw;
//     if (byKey && !forceExact && hasLongerPrefix && v.length === 1) {
//       const currentRaw = raw;
//       supplyPointTimerRef.current = setTimeout(() => {
//         if (currentRaw === supplyPointRawRef.current) {
//           setFormData(prev => ({ ...prev, supplyPoint: byKey.value, trainIndex: byKey.key }));
//           setSupplyPointRaw(byKey.value);
//           supplyPointRawRef.current = byKey.value;
//         }
//       }, 700);
//     }
//   };

//   const selectSklad = (keyOrValue: string) => {
//     handleSupplyPointInput(keyOrValue, true);
//     setIsSkladOpen(false);
//   };

//   const stats = useMemo(() => ({ total: rows.reduce((s, r) => s + (Number(r.balanceBefore) || 0) + (Number(r.fuelAmount) || 0), 0) }), [rows]);

//   const formatDate = (d: Date) => {
//     const dd = String(d.getDate()).padStart(2, '0');
//     const mm = String(d.getMonth() + 1).padStart(2, '0');
//     const yyyy = d.getFullYear();
//     return `${dd}.${mm}.${yyyy}`;
//   };

//   const getZapravkaByStaff = (name: string | undefined) => {
//     if (!name) return '';
//     const s = staffList.find(x => x.fullName === name);
//     return s ? s.zapravka : '';
//   };

//   const normalizeZap = (s: string) => s.toLowerCase().replace(/zapravka/gi, '').replace(/\s+/g, ' ').trim();

//   const handleExportPdf = () => {
//     const printWindow = window.open('', '_blank');
//     if (!printWindow) return;
//     const today = formatDate(new Date());
//     const title = `${today} kun mobaynida tarqatilgan dizel yoqilg'isi tarqatilishi haqida ma'lumot`;

//     const grouped = rows
//       .map(r => {
//         const zap = getZapravkaByStaff(r.staffName);
//         return { ...r, _zap: zap };
//       })
//       .sort((a, b) => {
//         const z = (a._zap || '').localeCompare(b._zap || '');
//         if (z !== 0) return z;
//         const s = (a.staffName || '').localeCompare(b.staffName || '');
//         if (s !== 0) return s;
//         return (a.time || '').localeCompare(b.time || '');
//       })
//       .reduce((acc: Record<string, FuelRecord[]>, r) => {
//         const key = `${r._zap || ''}|||${r.staffName || ''}`;
//         if (!acc[key]) acc[key] = [];
//         acc[key].push(r);
//         return acc;
//       }, {});

//     const tableHeader = `
//       <thead>
//         <tr>
//           <th>№</th>
//           <th>Vaqt</th>
//           <th>Poyezd rusumi</th>
//           <th>Raqami</th>
//           <th>Harakat turi</th>
//           <th>P.Raqami</th>
//           <th>Harakat ruxsat indexi</th>
//           <th>Poyezd Vazni</th>
//           <th>Qoldiq</th>
//           <th>Yoqilg'i</th>
//           <th>Hisob</th>
//         </tr>
//       </thead>
//     `;

//     const tablesHtml = Object.entries(grouped).map(([key, group]) => {
//       const [zap, staff] = key.split('|||');
//       const rowsHtml = group.map((r, i) => `
//         <tr>
//           <td>${i + 1}</td>
//           <td>${r.time || ''}</td>
//           <td>${r.locoSeries || ''}</td>
//           <td>${r.trainIndex || ''}</td>
//           <td>${r.moveType || ''}</td>
//           <td>${r.locoNumber || ''}</td>
//           <td>${r.trainNumber || ''}</td>
//           <td>${r.weight || ''}</td>
//           <td>${r.balanceBefore || ''}</td>
//           <td>${r.fuelAmount || ''}</td>
//           <td>${(Number(r.balanceBefore) + Number(r.fuelAmount)) || ''}</td>
//         </tr>
//       `).join('');

//       const cleanZap = (zap || '').replace(/\s*zapravka\s*/i, '').trim();
//       const headerText = `${cleanZap || '-'} — ${staff || '-'}`;
//       return `
//         <div class="group-title">${headerText}</div>
//         <table>
//           ${tableHeader}
//           <tbody>
//             ${rowsHtml}
//           </tbody>
//         </table>
//       `;
//     }).join('');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>PDF</title>
//           <style>
//             * { box-sizing: border-box; }
//             body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
//             h1 { font-size: 14px; font-weight: 700; text-align: center; margin: 0 0 12px; }
//             .group-title { font-size: 11px; font-weight: 700; margin: 10px 0 4px; }
//             table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px; }
//             th, td { border: 1px solid #999; padding: 4px 6px; text-align: center; }
//             thead th { background: #f3f3f3; }
//           </style>
//         </head>
//         <body>
//           <h1>${title}</h1>
//           ${tablesHtml}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//   };

//   const handleExportErjuPdf = () => {
//     const printWindow = window.open('', '_blank');
//     if (!printWindow) return;
//     const today = formatDate(new Date());
//     const title = `${today} kun mobaynida tarqatilgan dizel yoqilg'isi tarqatilishi haqida ma'lumot`;

//     const zapToErju = new Map<string, string>();
//     const zapDisplay = new Map<string, string>();
//     ERJU_DATA.forEach(e => {
//       e.zapravkalar.forEach(z => {
//         const clean = z.replace(/\s*zapravka\s*/i, '').trim();
//         const key = normalizeZap(clean);
//         zapToErju.set(key, e.name);
//         zapDisplay.set(key, clean);
//       });
//     });

//     const moveSet = new Set(rows.map(r => r.moveType || '').filter(Boolean));
//     const moveOrder = moveOptions.map(o => o.value);
//     const moveTypes = [
//       ...moveOrder.filter(v => moveSet.has(v)),
//       ...Array.from(moveSet).filter(v => !moveOrder.includes(v)),
//     ];

//     const data: Record<string, Record<string, Record<string, number>>> = {};
//     const globalMoveTotals: Record<string, number> = {};
//     const globalLocoSet = new Set<string>();

//     rows.forEach(r => {
//       const staffZap = getZapravkaByStaff(r.staffName);
//       const rawZap = r.supplyPoint || staffZap || '';
//       const zapKey = normalizeZap(rawZap);
//       const erju = zapToErju.get(zapKey) || 'Boshqa';
//       const zapName = zapDisplay.get(zapKey) || rawZap || '-';
//       const move = r.moveType || 'Noma';
//       const val = Number(r.fuelAmount) || 0;
//       const locoKey = `${r.locoSeries || ''}-${r.locoNumber || ''}`;
//       if (r.locoSeries || r.locoNumber) globalLocoSet.add(locoKey);

//       if (!data[erju]) data[erju] = {};
//       if (!data[erju][zapName]) data[erju][zapName] = {};
//       data[erju][zapName][move] = (data[erju][zapName][move] || 0) + val;
//       globalMoveTotals[move] = (globalMoveTotals[move] || 0) + val;
//     });

//     const erjuOrder = [...ERJU_DATA.map(e => e.name), 'Boshqa'];

//     const erjuTotalsByMove: Record<string, Record<string, number>> = {};
//     const erjuTotalsAll: Record<string, number> = {};

//     const sectionHtml = erjuOrder.map(erjuName => {
//       const zapData = data[erjuName];
//       if (!zapData) return '';

//       const zapOrder = [
//         ...ERJU_DATA.find(e => e.name === erjuName)?.zapravkalar
//           .map(z => z.replace(/\s*zapravka\s*/i, '').trim()) || [],
//       ];
//       const zaps = Object.keys(zapData);
//       const orderedZaps = [
//         ...zapOrder.filter(z => zaps.includes(z)),
//         ...zaps.filter(z => !zapOrder.includes(z)),
//       ];

//       const erjuTotals: Record<string, number> = {};
//       const rowsHtml = orderedZaps.map((zap, idx) => {
//         const moveMap = zapData[zap];
//         const total = moveTypes.reduce((s, m) => s + (moveMap[m] || 0), 0);
//         moveTypes.forEach(m => { erjuTotals[m] = (erjuTotals[m] || 0) + (moveMap[m] || 0); });
//         const cells = moveTypes.map(m => `<td>${(moveMap[m] || 0) ? (moveMap[m] || 0).toLocaleString() : ''}</td>`).join('');
//         return `
//           <tr>
//             <td>${idx + 1}</td>
//             <td class="left">${zap}</td>
//             ${cells}
//             <td>${total ? total.toLocaleString() : ''}</td>
//           </tr>
//         `;
//       }).join('');
//       const erjuTotalAll = moveTypes.reduce((s, m) => s + (erjuTotals[m] || 0), 0);
//       erjuTotalsByMove[erjuName] = erjuTotals;
//       erjuTotalsAll[erjuName] = erjuTotalAll;
//       const totalCells = moveTypes.map(m => `<td class="total">${(erjuTotals[m] || 0) ? (erjuTotals[m] || 0).toLocaleString() : ''}</td>`).join('');

//       const headCells = moveTypes.map(m => `<th>${m}</th>`).join('');
//       return `
//         <div class="erju-title">${erjuName}</div>
//         <table>
//           <thead>
//             <tr>
//               <th>№</th>
//               <th class="left">Zapravka</th>
//               ${headCells}
//               <th>Jami</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${rowsHtml}
//             <tr class="total-row">
//               <td></td>
//               <td class="left total">Jami</td>
//               ${totalCells}
//               <td class="total">${erjuTotalAll ? erjuTotalAll.toLocaleString() : ''}</td>
//             </tr>
//           </tbody>
//         </table>
//       `;
//     }).join('');

//     const erjuNames = ERJU_DATA.map(e => e.name);
//     const erjuSummaryRows = moveTypes.map(m => {
//       const cells = erjuNames.map(name => {
//         const totals = erjuTotalsByMove[name] || {};
//         const v = totals[m] || 0;
//         return `<td>${v ? v.toLocaleString() : ''}</td>`;
//       }).join('');
//       return `
//         <tr>
//           <td class="left">${m}</td>
//           ${cells}
//         </tr>
//       `;
//     }).join('');
//     const erjuTotalsRow = erjuNames.map(name => {
//       const totalAll = erjuTotalsAll[name] || 0;
//       return `<td class="total">${totalAll ? totalAll.toLocaleString() : ''}</td>`;
//     }).join('');

//     const globalTotalAll = moveTypes.reduce((s, m) => s + (globalMoveTotals[m] || 0), 0);
//     const globalCells = moveTypes.map(m => `<td class="total">${(globalMoveTotals[m] || 0) ? (globalMoveTotals[m] || 0).toLocaleString() : ''}</td>`).join('');
//     const summaryHtml = `
//       <div class="summary-title">ERJU bo'yicha umumiy yig'indilar</div>
//       <table>
//         <thead>
//           <tr>
//             <th class="left">Harakat turi</th>
//             ${erjuNames.map(n => `<th>${n}</th>`).join('')}
//           </tr>
//         </thead>
//         <tbody>
//           ${erjuSummaryRows}
//           <tr class="total-row">
//             <td class="left total">Jami</td>
//             ${erjuTotalsRow}
//           </tr>
//         </tbody>
//       </table>
//       <div class="summary-title">Umumiy yig'indilar</div>
//       <table>
//         <thead>
//           <tr>
//             <th class="left">Harakat turlari bo'yicha</th>
//             ${moveTypes.map(m => `<th>${m}</th>`).join('')}
//             <th>Jami</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td class="left">Jami yoqilg'i</td>
//             ${globalCells}
//             <td class="total">${globalTotalAll ? globalTotalAll.toLocaleString() : ''}</td>
//           </tr>
//         </tbody>
//       </table>
//       <div class="summary-line">Jami teplovozlar soni: ${globalLocoSet.size}</div>
//     `;

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>ERJU PDF</title>
//           <style>
//             * { box-sizing: border-box; }
//             body { font-family: Arial, sans-serif; color: #111; padding: 20px; }
//             h1 { font-size: 14px; font-weight: 700; text-align: center; margin: 0 0 10px; }
//             .erju-title { font-size: 14px; font-weight: 800; margin: 12px 0 6px; }
//             .summary-title { font-size: 11px; font-weight: 700; margin: 10px 0 4px; }
//             .summary-line { font-size: 10px; font-weight: 700; margin: 4px 0 0; }
//             table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
//             th, td { border: none; padding: 3px 4px; text-align: center; }
//             thead th { background: transparent; }
//             td.left, th.left { text-align: left; }
//             .total-row td { background: #f7f7f7; }
//             .total { font-weight: 700; }
//           </style>
//         </head>
//         <body>
//           <h1>${title}</h1>
//           ${sectionHtml}
//           ${summaryHtml}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//   };

//   const addRow = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingId) {
//       setRows(rows.map(r => r.id === editingId ? { ...(r as FuelRecord), ...(formData as FuelRecord) } : r));
//       setEditingId(null);
//     } else {
//       const now = new Date();
//       setRows([{ ...(formData as FuelRecord), date: now.toISOString().split('T')[0], time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }), id: Math.random().toString(36).substr(2, 9) } as FuelRecord, ...rows]);
//     }
//     setFormData(prev => ({ ...prev, locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '' }));
//     setStaffInputRaw('');
//   };

//   const deleteRow = (id: string) => setRows(rows.filter(r => r.id !== id));
//   const editRow = (row: FuelRecord) => { setFormData(row); setStaffInputRaw(row.staffName || ''); setSupplyPointRaw(row.supplyPoint || ''); supplyPointRawRef.current = row.supplyPoint || ''; setEditingId(row.id); };
//   const clearForm = () => { setFormData({ supplyPoint: '', route: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' }); setStaffInputRaw(''); setSupplyPointRaw(''); supplyPointRawRef.current = ''; setEditingId(null); };

//   if (!isLoaded) return null;

//   const erjuAllStaff = staffList.filter(s => s.erju === selectedErju);
//   const selectedErjuData = ERJU_DATA.find(e => e.name === selectedErju);

//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
//       <style jsx global>{`
//         .hide-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; }
//         .hide-scrollbar::-webkit-scrollbar-thumb { background: transparent; }
//         .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         input[type=number]::-webkit-outer-spin-button,
//         input[type=number]::-webkit-inner-spin-button {
//           -webkit-appearance: none;
//           margin: 0;
//         }
//         input[type=number] {
//           -moz-appearance: textfield;
//           appearance: textfield;
//         }
//       `}</style>
//       <main className="max-w-7xl mx-auto space-y-8">

//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl">
//               <span className="text-lg">👥</span> Xodimlar
//             </button>
//             <button type="button" onClick={() => setIsSkladOpen(true)} className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl">
//               <span className="text-lg">📦</span> Toplin sklad
//             </button>
//             <button type="button" onClick={() => setIsMoveModalOpen(true)} className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl">
//               <span className="text-lg"></span> Harakat turi
//             </button>
//             <button type="button" className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl">
//               <span className="text-lg">📅</span> Calendar
//             </button>
//           </div>
//           <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 font-semibold text-emerald-400">
//             Hisob yoqilg&apos;i: {stats.total.toLocaleString()}
//           </div>
//         </div>

//         {/* ══ MODAL ══ */}
//         {isModalOpen && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
//             <div className="relative bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-white/10 w-full max-w-5xl rounded-[2rem] shadow-[0_35px_120px_rgba(15,23,42,0.75)] z-[10000] flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>

//               {/* Header */}
//               <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 backdrop-blur-sm">
//                 <div>
//                   <h2 className="font-bold text-emerald-300 text-xl">Xodimlarni boshqarish</h2>
//                   <p className="text-slate-300/80 text-xs mt-0.5">ERJU va zapravkani tanlab, xodimlarni kiriting</p>
//                 </div>
//                 <button onClick={closeModal} className="text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/50 p-2 rounded-full transition-all"><span className="text-lg">✖</span></button>
//               </div>

//               <div className="flex overflow-hidden flex-1 min-h-0">

//                 {/* CHAP: ERJU */}
//                 <div className="w-52 shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-2">
//                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.35em] px-2 pb-2">Mintaqaviy uzellar</p>
//                   {ERJU_DATA.map(erju => {
//                     const cnt = staffList.filter(s => s.erju === erju.name).length;
//                     const active = selectedErju === erju.name;
//                     return (
//                       <button key={erju.name} onClick={() => handleErjuSelect(erju.name)}
//                         className={`w-full text-left px-3 py-3 rounded-2xl transition-all flex items-center justify-between group shadow-sm ${active ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'hover:bg-slate-800/50 text-slate-300 hover:text-slate-100'}`}>
//                         <div>
//                           <p className="font-bold text-sm leading-tight">{erju.name}</p>
//                           <p className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-slate-500'}`}>{cnt} ta xodim</p>
//                         </div>
//                         <span className={active ? 'text-white' : 'text-slate-600'}>›</span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* O'RTA: ZAPRAVKA + QO'SHISH */}
//                 <div className="w-60 shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-4">
//                   {!selectedErju ? (
//                     <p className="text-slate-600 text-sm text-center pt-10">ERJU tanlang</p>
//                   ) : (
//                     <>
//                       <div>
//                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Zapravka</p>
//                         <select value={selectedZapravka} onChange={e => setSelectedZapravka(e.target.value)}
//                           className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">
//                           <option value="">Tanlang...</option>
//                           {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
//                         </select>
//                       </div>
//                       {selectedZapravka && (
//                         <div className="space-y-3">
//                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yangi xodim</p>
//                           <div>
//                             <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Tabel raqam</label>
//                             <input value={newStaffTabel} onChange={e => setNewStaffTabel(e.target.value)}
//                               className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="12345" />
//                           </div>
//                           <div>
//                             <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">F.I.SH</label>
//                             <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStaff()}
//                               className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="Ism Familya" />
//                           </div>
//                           <button onClick={addStaff} disabled={!newStaffName.trim() || !newStaffTabel.trim()}
//                             className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95">
//                             + Qo&apos;shish
//                           </button>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>

//                 {/* O'NG: BARCHA ERJU XODIMLARI (zapravka o'zgarganda yo'qolmaydi) */}
//                 <div className="flex-1 overflow-y-auto p-4">
//                   {!selectedErju ? (
//                     <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm text-center gap-2">
//                       <span className="text-3xl">👥</span>
//                       <p>ERJU tanlanganida xodimlar ko&apos;rinadi</p>
//                     </div>
//                   ) : (
//                     <>
//                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
//                         {selectedErju} — barcha xodimlar ({erjuAllStaff.length} ta)
//                       </p>
//                       {erjuAllStaff.length === 0 ? (
//                         <p className="text-slate-600 text-sm text-center py-8">Hozircha xodim yo&apos;q</p>
//                       ) : (
//                         <div className="space-y-2">
//                           {erjuAllStaff.map((staff, i) => (
//                             <div key={staff.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 group">
//                               {editingStaffId === staff.id ? (
//                                 <div className="space-y-2">
//                                   <select value={editStaff.zapravka} onChange={e => setEditStaff(p => ({ ...p, zapravka: e.target.value }))}
//                                     className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none">
//                                     {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
//                                   </select>
//                                   <div className="flex gap-2">
//                                     <input value={editStaff.tabel} onChange={e => setEditStaff(p => ({ ...p, tabel: e.target.value }))}
//                                       className="w-24 bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" placeholder="Tabel" />
//                                     <input value={editStaff.name} onChange={e => setEditStaff(p => ({ ...p, name: e.target.value }))}
//                                       className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" placeholder="F.I.SH" />
//                                   </div>
//                                   <div className="flex gap-2">
//                                     <button onClick={saveStaffEdit} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all">
//                                       <span>✓</span> Saqlash
//                                     </button>
//                                     <button onClick={() => setEditingStaffId(null)} className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-lg text-xs transition-all">Bekor</button>
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center gap-3">
//                                     <span className="text-slate-600 font-mono text-xs w-5">{i + 1}</span>
//                                     <div>
//                                       <div className="flex items-center gap-2">
//                                         <span className="font-bold text-white text-sm">{staff.fullName}</span>
//                                         <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full font-mono">#{staff.tabelNumber}</span>
//                                       </div>
//                                       <p className="text-[10px] text-slate-500 mt-0.5">{staff.zapravka}</p>
//                                     </div>
//                                   </div>
//                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
//                                     <button onClick={() => { setEditingStaffId(staff.id); setEditStaff({ name: staff.fullName, tabel: staff.tabelNumber, zapravka: staff.zapravka }); }}
//                                       className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"><span>✏️</span></button>
//                                     <button onClick={() => setStaffList(prev => prev.filter(s => s.id !== staff.id))}
//                                       className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"><span>🗑️</span></button>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ══ HARAKAT TURI MODAL ══ */}
//         {isMoveModalOpen && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeMoveModal} />
//             <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-3xl rounded-3xl shadow-2xl z-[10000] flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
//               <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
//                 <div>
//                   <h2 className="font-bold text-amber-300 text-xl tracking-widest drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">Harakat turlari</h2>
//                   <p className="text-amber-200/80 text-xs mt-0.5">Ro&apos;yxatni boshqarish</p>
//                 </div>
//                 <button onClick={closeMoveModal} className="text-amber-200 hover:text-white bg-rose-500/30 hover:bg-rose-500/40 border border-rose-400/40 p-2 rounded-full transition-all shadow-[0_0_10px_rgba(244,63,94,0.35)]">
//                   <span className="text-lg">✖</span>
//                 </button>
//               </div>

//               <div className="p-6 space-y-4 overflow-y-auto hide-scrollbar" style={{ maxHeight: 'calc(72vh - 72px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                 <div className="flex items-center justify-between">
//                   <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">Mavjud harakat turlari</p>
//                   <button type="button" onClick={() => setIsMoveAddOpen(v => !v)}
//                     className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/35 to-green-500/25 border border-emerald-400/50 text-emerald-200 text-xs font-bold uppercase tracking-widest hover:from-emerald-600/50 hover:to-green-500/40 transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)]">
//                     + Harakat turi qo&apos;shish
//                   </button>
//                 </div>

//                 {isMoveAddOpen && (
//                   <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Tartib №</label>
//                         <input value={newMoveKey} onChange={e => setNewMoveKey(e.target.value)}
//                           className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 placeholder:text-slate-500" placeholder="7" />
//                       </div>
//                       <div>
//                         <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Harakat nomi</label>
//                         <input value={newMoveValue} onChange={e => setNewMoveValue(e.target.value)}
//                           className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 placeholder:text-slate-500" placeholder="Yangi harakat" />
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <button onClick={addMoveOption} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all">Saqlash</button>
//                       <button onClick={() => { setIsMoveAddOpen(false); setNewMoveKey(''); setNewMoveValue(''); }} className="px-4 py-2 rounded-xl bg-white/10 text-amber-200 text-xs font-bold uppercase tracking-widest">Bekor</button>
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   {moveOptions.map((m) => (
//                     <div key={m.key} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
//                       {editingMoveKey === m.key ? (
//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Tartib №</label>
//                             <input value={editMoveKey} onChange={e => setEditMoveKey(e.target.value)}
//                               className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400" />
//                           </div>
//                           <div>
//                             <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Harakat nomi</label>
//                             <input value={editMoveValue} onChange={e => setEditMoveValue(e.target.value)}
//                               className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400" />
//                           </div>
//                           <div className="col-span-2 flex gap-2">
//                             <button onClick={saveMoveEdit} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all">Saqlash</button>
//                             <button onClick={() => setEditingMoveKey(null)} className="px-4 py-2 rounded-xl bg-white/10 text-amber-200 text-xs font-bold uppercase tracking-widest">Bekor</button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <span className="text-amber-300 font-mono text-xs w-8">#{m.key}</span>
//                             <span className="text-amber-200 font-semibold">{m.value}</span>
//                           </div>
//                           <div className="flex gap-2">
//                             <button onClick={() => { setEditingMoveKey(m.key); setEditMoveKey(m.key); setEditMoveValue(m.value); }}
//                               className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30">Edit</button>
//                             <button onClick={() => setMoveOptions(prev => prev.filter(x => x.key !== m.key))}
//                               className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/30">Delete</button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ══ TOPLIN SKLAD SIDEBAR ══ */}
//         {isSkladOpen && (
//           <>
//             <div className="fixed top-0 left-0 h-full w-64 bg-slate-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[10001] translate-x-0">
//               <div className="p-5 flex justify-between items-center border-b border-slate-700">
//                 <h2 className="text-xl font-semibold">Menyu</h2>
//                 <button onClick={() => setIsSkladOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
//               </div>
//               <nav className="mt-4 space-y-4">
//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Toshkent ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('1')} className="text-left w-full hover:text-emerald-300">1. Toshkent</button>
//                     <button type="button" onClick={() => selectSklad('3')} className="text-left w-full hover:text-emerald-300">3. Angren</button>
//                     <button type="button" onClick={() => selectSklad('4')} className="text-left w-full hover:text-emerald-300">4. Sirdaryo</button>
//                     <button type="button" onClick={() => selectSklad('5')} className="text-left w-full hover:text-emerald-300">5. Hovos</button>
//                     <button type="button" onClick={() => selectSklad('6')} className="text-left w-full hover:text-emerald-300">6. Jizzax</button>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Qo&apos;qon ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('10')} className="text-left w-full hover:text-emerald-300">10. Andijon</button>
//                     <button type="button" onClick={() => selectSklad('7')} className="text-left w-full hover:text-emerald-300">7. Qo&apos;qon</button>
//                     <button type="button" onClick={() => selectSklad('8')} className="text-left w-full hover:text-emerald-300">8. Marg&apos;ilon</button>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Buxoro ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('11')} className="text-left w-full hover:text-emerald-300">11. Samarqand</button>
//                     <button type="button" onClick={() => selectSklad('13')} className="text-left w-full hover:text-emerald-300">13. Ziyouddin</button>
//                     <button type="button" onClick={() => selectSklad('14')} className="text-left w-full hover:text-emerald-300">14. Buxoro</button>
//                     <button type="button" onClick={() => selectSklad('15')} className="text-left w-full hover:text-emerald-300">15. Tinchlik</button>
//                     <button type="button" onClick={() => selectSklad('16')} className="text-left w-full hover:text-emerald-300">16. Uchquduq</button>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Qo&apos;ng&apos;irot ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('20')} className="text-left w-full hover:text-emerald-300">20. Qo&apos;ng&apos;irot</button>
//                     <button type="button" onClick={() => selectSklad('23')} className="text-left w-full hover:text-emerald-300">23. Urganch</button>
//                     <button type="button" onClick={() => selectSklad('24')} className="text-left w-full hover:text-emerald-300">24. Miskin</button>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Qarshi ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('17')} className="text-left w-full hover:text-emerald-300">17. Qarshi</button>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Termiz ERJU</p>
//                   <div className="mt-2 space-y-1 text-sm text-slate-200">
//                     <button type="button" onClick={() => selectSklad('18')} className="text-left w-full hover:text-emerald-300">18. Termiz</button>
//                     <button type="button" onClick={() => selectSklad('19')} className="text-left w-full hover:text-emerald-300">19. Darband</button>
//                     <button type="button" onClick={() => selectSklad('26')} className="text-left w-full hover:text-emerald-300">26. Qumqo&apos;rg&apos;on</button>
//                   </div>
//                 </div>
//               </nav>
//             </div>
//             <div onClick={() => setIsSkladOpen(false)} className="fixed inset-0 bg-black/50 z-[10000]" />
//           </>
//         )}

//         {/* ══ FORMA ══ */}
//         <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
//           <form onSubmit={addRow} className="space-y-6">
//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">Zaprafka</label>
//                 <input list="sklad-list" placeholder="№ yoki nom yozing..."
//                   value={supplyPointRaw}
//                   onChange={e => handleSupplyPointInput(e.target.value)}
//                   className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
//                 <datalist id="sklad-list">
//                   {skladOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}
//                 </datalist>
//               </div>

//               {/* SERIYA */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">Poyezd rusumi</label>
//                 <input list="series-list" placeholder="№ yozing..."
//                   value={formData.locoSeries || ''}
//                   onChange={e => { const v = e.target.value; const f = seriesOptions.find(o => o.key === v); setFormData({ ...formData, locoSeries: f ? f.value : v }); }}
//                   className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
//                 <datalist id="series-list">{seriesOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
//               </div>


//               {/* HARAKAT TURI */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">Harakat turi</label>
//                 <input list="move-list" placeholder="№ yozing..."
//                   value={formData.moveType || ''}
//                   onChange={e => { const v = e.target.value; const f = moveOptions.find(o => o.key === v); setFormData({ ...formData, moveType: f ? f.value : v }); }}
//                   className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
//                 <datalist id="move-list">{moveOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
//               </div>

//               <InputGroup label=" Poyezd Raqami" type="text" value={formData.locoNumber} onChange={v => setFormData({ ...formData, locoNumber: v })} />
//               <InputGroup label="Ruxsat index" value={formData.trainNumber} onChange={v => setFormData({ ...formData, trainNumber: v })} />
//               <InputGroup label="Poyezd Vazni" type="number" value={formData.weight} onChange={v => setFormData({ ...formData, weight: v })} />

//               {/* XODIM — Seriya kabi: tabel № yozsa ism auto-fill */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">
//                   Xodim
//                 </label>
//                 <input list="staff-list" placeholder="Tabel № yozing yoki ismdan tanlang..."
//                   value={staffInputRaw}
//                   onChange={e => handleStaffInput(e.target.value)}
//                   className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
//                 <datalist id="staff-list">
//                   {staffList.map(s => (
//                     <option key={s.id} value={s.tabelNumber}>{s.tabelNumber} - {s.fullName} ({s.zapravka})</option>
//                   ))}
//                 </datalist>
//                 {/* Topilgan xodim ismi ko'rsatiladi */}
//                 {formData.staffName && staffInputRaw !== formData.staffName && (
//                   <p className="text-xs text-emerald-400 ml-1 flex items-center gap-1">
//                     <span>✓</span> {formData.staffName}
//                   </p>
//                 )}
//               </div>

//               <InputGroup label="o'zida kelgan qoldiq" type="number" value={formData.balanceBefore} onChange={v => setFormData({ ...formData, balanceBefore: v })} />
//               <InputGroup label=" Berilgan Yoqilg'i" type="number" value={formData.fuelAmount} onChange={v => setFormData({ ...formData, fuelAmount: v })} />
//             </div>

//             <div className="flex gap-4 pt-4 border-t border-white/5">
//               <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
//                 <span>+</span> {editingId ? 'Saqlash' : "Qo'shish"}
//               </button>
//               <button type="button" onClick={clearForm} className="bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-white/10 transition-all">
//                 <span>↻</span> Tozalash
//               </button>
//             </div>
//           </form>
//         </section>

//         {/* ══ JADVAL ══ */}
//         <section className="bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left min-w-[1000px]">
//               <thead className="bg-white/5 text-[10px] uppercase text-blue-300 font-bold tracking-widest">
//                 <tr>
//                   <th className="p-4 border-b border-white/5 w-12 text-center">№</th>
//                   <th className="p-4 border-b border-white/5">Sana</th>
//                     <th className="p-4 border-b border-white/5">Teplovoz</th>
//                     <th className="p-4 border-b border-white/5">Kod</th>
//                     <th className="p-4 border-b border-white/5">Zaprafka</th>
//                     <th className="p-4 border-b border-white/5">Harakat turi</th>
//                     <th className="p-4 border-b border-white/5">P.Raqami</th>
//                     <th className="p-4 border-b border-white/5">Harakat ruxsat indexi</th>
//                     <th className="p-4 border-b border-white/5">Poyezd Vazni</th>
//                     <th className="p-4 border-b border-white/5">Xodim</th>
//                   <th className="p-4 border-b border-white/5 text-center"> qoldiq</th>
//                   <th className="p-4 border-b border-white/5 text-center">Yoqilg&apos;i</th>
//                   <th className="p-4 border-b border-white/5 text-center">Hisob</th>
//                   <th className="p-4 border-b border-white/5 text-center w-28">
//                     <div className="flex flex-col items-center gap-2">
//                       <button type="button" onClick={handleExportPdf} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest">
//                         PDF
//                       </button>
//                       <button type="button" onClick={handleExportErjuPdf} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest">
//                         ERJU PDF
//                       </button>
//                     </div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/5">
//                 {rows.map((row, idx) => (
//                   <tr key={row.id} className="hover:bg-white/5 transition-colors group">
//                     <td className="p-4 text-slate-500 font-mono text-center">{rows.length - idx}</td>
//                     <td className="p-4 font-mono text-xs">{row.date}<br /><span className="text-slate-600">{row.time}</span></td>
//                     <td className="p-4"><span className="text-blue-400 font-bold">{row.locoSeries}</span><span className="text-slate-500 ml-2 text-xs">#{row.locoNumber}</span></td>
//                     <td className="p-4 text-sm text-slate-300">{row.trainIndex}</td>
//                     <td className="p-4 text-sm text-slate-300">{row.supplyPoint}</td>
//                     <td className="p-4 text-sm">{row.moveType}</td>
//                     <td className="p-4 text-sm text-slate-300">{row.locoNumber}</td>
//                     <td className="p-4 text-sm text-slate-300">{row.trainNumber}</td>
//                     <td className="p-4 text-sm text-slate-300">{row.weight}</td>
//                     <td className="p-4 text-sm text-slate-300">{row.staffName}</td>
//                     <td className="p-4 text-center text-amber-500 font-mono">{Number(row.balanceBefore).toLocaleString()}</td>
//                     <td className="p-4 text-center text-emerald-400 font-bold font-mono">{Number(row.fuelAmount).toLocaleString()}</td>
//                     <td className="p-4 text-center font-bold font-mono">{(Number(row.balanceBefore) + Number(row.fuelAmount)).toLocaleString()}</td>
//                     <td className="p-4 text-center">
//                       <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
//                         <button onClick={() => editRow(row)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><span>✏️</span></button>
//                         <button onClick={() => deleteRow(row.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><span>🗑️</span></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// interface InputGroupProps { label: string; type?: string; value: string | undefined; onChange: (v: string) => void; }
// const InputGroup = ({ label, type = 'text', value, onChange }: InputGroupProps) => (
//   <div className="flex flex-col gap-1.5">
//     <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">{label}</label>
//     <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
//       className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 focus:border-amber-400 outline-none transition-all w-full placeholder:text-slate-500" />
//   </div>
// );

// export default TrainFuelSystem;
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import RentCalendar from './calendar';

interface FuelRecord {
  id: string; date: string; locCode: string; supplyPoint: string; time: string;
  route: string; locoCode: string; locoSeries: string; locoNumber: string;
  trainCode: string; trainNumber: string; moveType: string; trainIndex: string;
  weight: string; balanceBefore: string; fuelAmount: string; staffName: string;
}

interface Staff {
  id: string; erju: string; zapravka: string; tabelNumber: string; fullName: string;
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

const loadRows = (): FuelRecord[] => { try { return JSON.parse(localStorage.getItem('uty_fuel_records') || '[]'); } catch { return []; } };
const loadStaff = (): Staff[] => { try { return JSON.parse(localStorage.getItem('uty_staff') || '[]'); } catch { return []; } };

const TrainFuelSystem = () => {
  const [rows, setRows] = useState<FuelRecord[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState<Partial<FuelRecord>>({ supplyPoint: '', route: '', locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffInputRaw, setStaffInputRaw] = useState('');
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

  useEffect(() => {
    if (typeof window !== 'undefined') { setRows(loadRows()); setStaffList(loadStaff()); setIsLoaded(true); }
  }, []);
  useEffect(() => { if (isLoaded) localStorage.setItem('uty_fuel_records', JSON.stringify(rows)); }, [rows, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('uty_staff', JSON.stringify(staffList)); }, [staffList, isLoaded]);
  useEffect(() => { document.body.style.overflow = isModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isModalOpen]);
  useEffect(() => { document.body.style.overflow = isSkladOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isSkladOpen]);
  useEffect(() => { document.body.style.overflow = isMoveModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isMoveModalOpen]);
  useEffect(() => { document.body.style.overflow = isSeriesModalOpen ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; }; }, [isSeriesModalOpen]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = isDarkMode ? '#020617' : '#f8fafc';
      document.body.style.color = isDarkMode ? '#e2e8f0' : '#0f172a';
    }
  }, [isDarkMode]);

  const closeModal = () => { setIsModalOpen(false); setSelectedErju(''); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };
  const handleErjuSelect = (name: string) => { setSelectedErju(name); setSelectedZapravka(''); setNewStaffName(''); setNewStaffTabel(''); setEditingStaffId(null); };
  const addStaff = () => {
    if (!selectedErju || !selectedZapravka || !newStaffName.trim() || !newStaffTabel.trim()) return;
    if (staffList.find(s => s.tabelNumber === newStaffTabel.trim())) { alert('Bu tabel raqam allaqachon mavjud!'); return; }
    setStaffList(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), erju: selectedErju, zapravka: selectedZapravka, tabelNumber: newStaffTabel.trim(), fullName: newStaffName.trim() }]);
    setNewStaffName(''); setNewStaffTabel('');
  };
  const saveStaffEdit = () => {
    if (!editStaff.name.trim() || !editStaff.tabel.trim()) return;
    setStaffList(prev => prev.map(s => s.id === editingStaffId ? { ...s, fullName: editStaff.name.trim(), tabelNumber: editStaff.tabel.trim(), zapravka: editStaff.zapravka } : s));
    setEditingStaffId(null);
  };
  const closeMoveModal = () => { setIsMoveModalOpen(false); setIsMoveAddOpen(false); setNewMoveKey(''); setNewMoveValue(''); setEditingMoveKey(null); };
  const closeSeriesModal = () => { setIsSeriesModalOpen(false); setIsSeriesAddOpen(false); setNewSeriesKey(''); setNewSeriesValue(''); setEditingSeriesKey(null); };
  const addMoveOption = () => {
    const key = newMoveKey.trim(); const value = newMoveValue.trim();
    if (!key || !value) return;
    if (moveOptions.some(o => o.key === key)) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    setMoveOptions(prev => [...prev, { key, value }]);
    setNewMoveKey(''); setNewMoveValue(''); setIsMoveAddOpen(false);
  };
  const saveMoveEdit = () => {
    if (!editMoveKey.trim() || !editMoveValue.trim()) return;
    if (editMoveKey.trim() !== editingMoveKey && moveOptions.some(o => o.key === editMoveKey.trim())) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    setMoveOptions(prev => prev.map(o => o.key === editingMoveKey ? { key: editMoveKey.trim(), value: editMoveValue.trim() } : o));
    setEditingMoveKey(null);
  };
  const addSeriesOption = () => {
    const key = newSeriesKey.trim(); const value = newSeriesValue.trim();
    if (!key || !value) return;
    if (seriesOptionsState.some(o => o.key === key)) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    setSeriesOptionsState(prev => [...prev, { key, value }]);
    setNewSeriesKey(''); setNewSeriesValue(''); setIsSeriesAddOpen(false);
  };
  const saveSeriesEdit = () => {
    if (!editSeriesKey.trim() || !editSeriesValue.trim()) return;
    if (editSeriesKey.trim() !== editingSeriesKey && seriesOptionsState.some(o => o.key === editSeriesKey.trim())) { alert('Bu tartib raqam allaqachon mavjud!'); return; }
    setSeriesOptionsState(prev => prev.map(o => o.key === editingSeriesKey ? { key: editSeriesKey.trim(), value: editSeriesValue.trim() } : o));
    setEditingSeriesKey(null);
  };
  const handleStaffInput = (raw: string) => {
    setStaffInputRaw(raw);
    const byTabel = staffList.find(s => s.tabelNumber === raw.trim());
    if (byTabel) { setFormData(prev => ({ ...prev, staffName: byTabel.fullName })); return; }
    const byName = staffList.find(s => s.fullName === raw.trim());
    setFormData(prev => ({ ...prev, staffName: byName ? byName.fullName : raw }));
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
  const stats = useMemo(() => ({ total: rows.reduce((s, r) => s + (Number(r.balanceBefore) || 0) + (Number(r.fuelAmount) || 0), 0) }), [rows]);
  const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const getZapravkaByStaff = (name: string | undefined) => { if (!name) return ''; const s = staffList.find(x => x.fullName === name); return s ? s.zapravka : ''; };

  // ═══════════════════════════════════════════════
  // PDF 1: Xodim bo'yicha (mavjud logika)
  // ═══════════════════════════════════════════════
  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const today = formatDate(new Date());
    const title = `${today} kun mobaynida tarqatilgan dizel yoqilg'isi tarqatilishi haqida ma'lumot`;
    const grouped = rows
      .map(r => { const zap = getZapravkaByStaff(r.staffName); return { ...r, _zap: zap }; })
      .sort((a, b) => { const z = (a._zap||'').localeCompare(b._zap||''); if(z!==0)return z; const s=(a.staffName||'').localeCompare(b.staffName||''); if(s!==0)return s; return (a.time||'').localeCompare(b.time||''); })
      .reduce((acc: Record<string, FuelRecord[]>, r) => { const key=`${(r as any)._zap||''}|||${r.staffName||''}`; if(!acc[key])acc[key]=[]; acc[key].push(r); return acc; }, {});
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

  // ═══════════════════════════════════════════════
  // PDF 2: ERJU bo'yicha — rasmga o'xshash format
  // ═══════════════════════════════════════════════
  const handleExportErjuPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = formatDate(new Date());
    const title = `${today} sutkasi mobaynida dizel yoqilg'isi tarqatilishi haqida MA'LUMOTNOMA`;

    // All move types are columns (no "standard" vs "custom")
    const moveTypeOrder = moveOptions.map(o => (o.value || '').trim()).filter(Boolean);
    const extraMoves: string[] = [];
    const moveTypeSet = new Set(moveTypeOrder);
    rows.forEach(r => {
      const mv = (r.moveType || '').trim() || 'Noma';
      if (!moveTypeSet.has(mv)) { moveTypeSet.add(mv); extraMoves.push(mv); }
    });
    const moveTypes = [...moveTypeOrder, ...extraMoves].filter((v, i, a) => a.indexOf(v) === i);

    // Helper: which ERJU does a zapravka belong to
    const findErju = (supplyPoint: string, staffName: string): string => {
      const candidates = [supplyPoint, getZapravkaByStaff(staffName)].filter(Boolean);
      for (const cand of candidates) {
        for (const erju of ERJU_DATA) {
          for (const z of erju.zapravkalar) {
            if (normalizeStr(z) === normalizeStr(cand) || normalizeStr(z).includes(normalizeStr(cand)) || normalizeStr(cand).includes(normalizeStr(z))) {
              return erju.name;
            }
          }
        }
      }
      return 'Boshqa';
    };

    // Helper: display name for zapravka (clean, without "zapravka" word)
    const cleanZapName = (s: string) => s.replace(/\s*zapravka\s*/i, '').trim();

    // Build aggregated data structure
    type ZapData = { total: number; moves: Record<string, number>; };
    const erjuData: Record<string, Record<string, ZapData>> = {};

    rows.forEach(r => {
      const erjuName = findErju(r.supplyPoint || '', r.staffName || '');
      // Determine zapravka display name
      let zapName = r.supplyPoint || getZapravkaByStaff(r.staffName) || '-';
      zapName = cleanZapName(zapName);

      if (!erjuData[erjuName]) erjuData[erjuName] = {};
      if (!erjuData[erjuName][zapName]) {
        erjuData[erjuName][zapName] = { total: 0, moves: {} };
      }

      const fuel = Number(r.fuelAmount) || 0;
      const move = (r.moveType || '').trim() || 'Noma';
      erjuData[erjuName][zapName].total += fuel;
      erjuData[erjuName][zapName].moves[move] = (erjuData[erjuName][zapName].moves[move] || 0) + fuel;
    });

    // Grand totals
    const grand = { total: 0, moves: {} as Record<string, number> };
    const erjuTotalsForSummary: Record<string, { total: number; moves: Record<string, number> }> = {};

    let rowNum = 0;
    const colCount = 4 + moveTypes.length; // №, Ombori, tarqatigan, jami, ...move types

    const mainTableRows = ERJU_DATA.map(erju => {
      const zapMap = erjuData[erju.name];
      if (!zapMap) return '';

      // Order zapravkas according to ERJU_DATA order
      const orderedNames: string[] = [];
      erju.zapravkalar.forEach(z => {
        const clean = cleanZapName(z);
        // find matching key in zapMap
        const match = Object.keys(zapMap).find(k =>
          normalizeStr(k) === normalizeStr(clean) ||
          normalizeStr(k).includes(normalizeStr(clean)) ||
          normalizeStr(clean).includes(normalizeStr(k))
        );
        if (match && !orderedNames.includes(match)) orderedNames.push(match);
      });
      Object.keys(zapMap).forEach(k => { if (!orderedNames.includes(k)) orderedNames.push(k); });

      // ERJU subtotals
      const sub = { total: 0, moves: {} as Record<string, number> };

      const zapRows = orderedNames.map(zap => {
        rowNum++;
        const d = zapMap[zap];
        const jami = moveTypes.reduce((s, m) => s + (d.moves[m] || 0), 0);
        sub.total += d.total;
        moveTypes.forEach(m => { sub.moves[m] = (sub.moves[m] || 0) + (d.moves[m] || 0); });

        const moveCells = moveTypes.map(m => `<td class="num">${fmt(d.moves[m] || 0)}</td>`).join('');
        return `
          <tr>
            <td>${rowNum}</td>
            <td class="left">${zap}</td>
            <td class="num">${fmt(d.total)}</td>
            <td class="num">${fmt(jami)}</td>
            ${moveCells}
          </tr>`;
      }).join('');

      // Accumulate grand
      grand.total += sub.total;
      moveTypes.forEach(m => { grand.moves[m] = (grand.moves[m] || 0) + (sub.moves[m] || 0); });
      erjuTotalsForSummary[erju.name] = { total: sub.total, moves: { ...sub.moves } };

      const subJami = moveTypes.reduce((s, m) => s + (sub.moves[m] || 0), 0);
      const subMoves = moveTypes.map(m => `<td class="sub-num">${fmt(sub.moves[m] || 0)}</td>`).join('');

      return `
        <tr class="erju-header">
          <td colspan="${colCount}" class="erju-title">РКУ-${erju.short}</td>
        </tr>
        ${zapRows}
        <tr class="sub-row">
          <td></td>
          <td class="left sub-label">Jami РКУ-${erju.short}</td>
          <td class="sub-num">${fmt(sub.total)}</td>
          <td class="sub-num">${fmt(subJami)}</td>
          ${subMoves}
        </tr>`;
    }).join('');

    // Grand total row
    const grandJami = moveTypes.reduce((s, m) => s + (grand.moves[m] || 0), 0);
    const grandMoves = moveTypes.map(m => `<td class="grand-num">${fmt(grand.moves[m] || 0)}</td>`).join('');
    const grandRow = `
      <tr class="grand-row">
        <td></td>
        <td class="left grand-label">UMUMIY JAMI</td>
        <td class="grand-num">${fmt(grand.total)}</td>
        <td class="grand-num">${fmt(grandJami)}</td>
        ${grandMoves}
      </tr>`;

    // Summary table by ERJU
    const summaryRows = ERJU_DATA.map(erju => {
      const t = erjuTotalsForSummary[erju.name];
      if (!t) {
        const blanks = moveTypes.map(() => '<td></td>').join('');
        return `<tr><td class="left">${erju.name}</td><td></td><td></td>${blanks}</tr>`;
      }
      const jami = moveTypes.reduce((s, m) => s + (t.moves[m] || 0), 0);
      const moveCells = moveTypes.map(m => `<td class="num">${fmt(t.moves[m] || 0)}</td>`).join('');
      return `
        <tr>
          <td class="left">${erju.name}</td>
          <td class="num">${fmt(t.total)}</td>
          <td class="num">${fmt(jami)}</td>
          ${moveCells}
        </tr>`;
    }).join('');

    const summaryGrand = ERJU_DATA.reduce((acc, erju) => {
      const t = erjuTotalsForSummary[erju.name] || { total: 0, moves: {} as Record<string, number> };
      acc.total += t.total;
      moveTypes.forEach(m => { acc.moves[m] = (acc.moves[m] || 0) + (t.moves[m] || 0); });
      return acc;
    }, { total: 0, moves: {} as Record<string, number> });

    const totalLocos = new Set(rows.filter(r => r.locoSeries || r.locoNumber).map(r => `${r.locoSeries}-${r.locoNumber}`)).size;

    printWindow.document.write(`
      <html>
        <head>
          <title>ERJU MA'LUMOTNOMA</title>
          <meta charset="utf-8"/>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 9px; color: #000; padding: 16px; }
            h1 { font-size: 10px; font-weight: 800; text-align: center; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }

            /* Main table */
            .main-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .main-table th { border: 1px solid #444; padding: 4px 3px; text-align: center; background: #f0f0f0; font-size: 9px; font-weight: 700; vertical-align: middle; }
            .main-table td { border: 1px solid #666; padding: 3px 4px; text-align: center; vertical-align: middle; font-size: 9px; }
            .main-table td.left { text-align: left; font-weight: 700; font-size: 9.5px; }
            .main-table td.num { text-align: right; font-family: 'Courier New', monospace; font-weight: 700; color: #000; }

            /* ERJU header row */
            .erju-header .erju-title { background: #d9d9d9; color: #000; font-weight: 800; font-size: 10px; text-align: left; padding: 5px 6px; letter-spacing: 0.5px; }

            /* Subtotal row */
            .sub-row td { background: #eeeeee; font-weight: 700; font-size: 9px; border-color: #555; }
            .sub-row .sub-num { text-align: right; font-family: 'Courier New', monospace; font-weight: 700; color: #000; }
            .sub-row .sub-label { font-weight: 800; }

            /* Grand total row */
            .grand-row td { background: #cccccc; color: #000; font-weight: 800; font-size: 9px; border-color: #333; }
            .grand-row .grand-num { text-align: right; font-family: 'Courier New', monospace; font-weight: 700; color: #000; }
            .grand-row .grand-label { text-align: left; font-weight: 800; }

            /* Zebra striping */
            .main-table tbody tr:not(.erju-header):not(.sub-row):not(.grand-row):nth-child(even) td { background: #f7f7f7; }

            /* Summary table */
            .summary-title { font-size: 9px; font-weight: 800; margin: 8px 0 5px; text-transform: uppercase; }
            .sum-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .sum-table th { border: 1px solid #555; padding: 4px 5px; text-align: center; background: #f0f0f0; color: #000; font-size: 9px; font-weight: 700; }
            .sum-table td { border: 1px solid #666; padding: 3px 5px; font-size: 9px; }
            .sum-table td.left { text-align: left; font-weight: 700; font-size: 9.5px; }
            .sum-table td.num { text-align: right; font-family: 'Courier New', monospace; font-weight: 700; color: #000; }
            .sum-table .grand-r td { background: #cccccc; color: #000; font-weight: 800; }
            .sum-table .grand-r td.num { text-align: right; font-weight: 700; color: #000; }

            .stat-line { font-size: 9px; font-weight: 700; margin-top: 6px; }

            @media print {
              body { padding: 8px; }
              .main-table { page-break-inside: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>

          <!-- ASOSIY JADVAL -->
          <table class="main-table">
            <thead>
              <tr>
                <th rowspan="2" style="width:24px">№</th>
                <th rowspan="2" style="min-width:90px">Yo'nig'i ombori</th>
                <th rowspan="2">t sutkada<br>tarqatigan</th>
                <th rowspan="2">Jami teplo-<br>vozlarga<br>tarqatigan</th>
                <th colspan="${moveTypes.length}">Shu jumladan:</th>
              </tr>
              <tr>
                ${moveTypes.map(m => `<th>${m}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${mainTableRows}
              ${grandRow}
            </tbody>
          </table>

          <!-- ERJU BO'YICHA YIG'INDI -->
          <div class="summary-title">ERJU bo'yicha umumiy ko'rsatkichlar</div>
          <table class="sum-table">
            <thead>
              <tr>
                <th class="left" style="min-width:120px">ERJU nomi</th>
                <th>Jami<br>tarqatilgan</th>
                <th>Jami<br>teplovozlarga</th>
                ${moveTypes.map(m => `<th>${m}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${summaryRows}
              <tr class="grand-r">
                <td class="left" style="font-weight:800">JAMI</td>
                <td class="num">${fmt(summaryGrand.total)}</td>
                <td class="num">${fmt(moveTypes.reduce((s, m) => s + (summaryGrand.moves[m] || 0), 0))}</td>
                ${moveTypes.map(m => `<td class="num">${fmt(summaryGrand.moves[m] || 0)}</td>`).join('')}
              </tr>
            </tbody>
          </table>

          <div class="stat-line">Jami teplovozlar soni: ${totalLocos} ta &nbsp;|&nbsp; Jami yozuvlar: ${rows.length} ta</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const addRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { setRows(rows.map(r => r.id === editingId ? { ...(r as FuelRecord), ...(formData as FuelRecord) } : r)); setEditingId(null); }
    else { const now = new Date(); setRows([{ ...(formData as FuelRecord), date: now.toISOString().split('T')[0], time: now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }), id: Math.random().toString(36).substr(2, 9) } as FuelRecord, ...rows]); }
    setFormData(prev => ({ ...prev, locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '' }));
    setStaffInputRaw('');
  };
  const deleteRow = (id: string) => setRows(rows.filter(r => r.id !== id));
  const editRow = (row: FuelRecord) => { setFormData(row); setStaffInputRaw(row.staffName || ''); setSupplyPointRaw(row.supplyPoint || ''); supplyPointRawRef.current = row.supplyPoint || ''; setEditingId(row.id); };
  const clearForm = () => { setFormData({ supplyPoint: '', route: '', locoCode: '', locoSeries: '', locoNumber: '', trainNumber: '', moveType: '', weight: '', balanceBefore: '', fuelAmount: '', staffName: '' }); setStaffInputRaw(''); setSupplyPointRaw(''); supplyPointRawRef.current = ''; setEditingId(null); };

  if (!isLoaded) return null;

  const erjuAllStaff = staffList.filter(s => s.erju === selectedErju);
  const selectedErjuData = ERJU_DATA.find(e => e.name === selectedErju);
  const todayDate = formatDate(new Date());

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-100 text-slate-900'}`}>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar{width:0;height:0;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;appearance:textfield;}
      `}</style>
      <main className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-sm">👥</span> Xodimlar
            </button>
            <button type="button" onClick={() => setIsSkladOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-sm">📦</span> Toplin sklad
            </button>
            <button type="button" onClick={() => setIsMoveModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-sm">🚆</span> Harakat turi
            </button>
            <button type="button" onClick={() => setIsCalendarOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-sm">📅</span> Calendar
            </button>
            <button type="button" onClick={() => setIsSeriesModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
              <span className="text-sm">🧩</span> Poyezd rusumi
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsDarkMode(prev => !prev)} className="flex items-center justify-center text-sm font-bold text-white hover:text-emerald-400 transition-colors active:scale-95 bg-white/10 border border-white/10 px-2 py-1 rounded-md">
              <span className="text-sm">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>

        {/* XODIMLAR MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-black border border-white/10 w-full max-w-5xl rounded-[2rem] shadow-[0_35px_120px_rgba(0,0,0,0.75)] z-[10000] flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/95">
                <div><h2 className="font-bold text-white text-xl">Xodimlarni boshqarish</h2><p className="text-slate-200/80 text-xs mt-0.5">ERJU va zapravkani tanlab, xodimlarni kiriting</p></div>
                <button onClick={closeModal} className="text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 p-2 rounded-full transition-all shadow-sm hover:shadow-emerald-500/20"><span className="text-lg">✖</span></button>
              </div>
              <div className="flex overflow-hidden flex-1 min-h-0">
                <div className="w-52 shrink-0 border-r border-white/10 overflow-y-auto p-3 space-y-1.5 bg-black/80">
                  <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest px-2 pb-1">Mintaqaviy uzellar</p>
                  {ERJU_DATA.map(erju => {
                    const cnt = staffList.filter(s => s.erju === erju.name).length;
                    const active = selectedErju === erju.name;
                    return (
                      <button key={erju.name} onClick={() => handleErjuSelect(erju.name)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${active ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-300'}`}>
                        <div><p className="font-bold text-sm leading-tight">{erju.name}</p><p className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-slate-300'}`}>{cnt} ta xodim</p></div>
                        <span className={active ? 'text-white' : 'text-slate-300'}>›</span>
                      </button>
                    );
                  })}
                </div>
                <div className="w-60 shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-4 bg-black/80">
                  {!selectedErju ? <p className="text-slate-200 text-sm text-center pt-10">ERJU tanlang</p> : (
                    <>
                      <div>
                        <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-2">Zapravka</p>
                        <select value={selectedZapravka} onChange={e => setSelectedZapravka(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                          <option value="">Tanlang...</option>
                          {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                      {selectedZapravka && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Yangi xodim</p>
                          <div><label className="text-[10px] text-slate-200 uppercase font-bold ml-1">Tabel raqam</label><input value={newStaffTabel} onChange={e => setNewStaffTabel(e.target.value)} className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="12345" /></div>
                          <div><label className="text-[10px] text-slate-200 uppercase font-bold ml-1">F.I.SH</label><input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStaff()} className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="Ism Familya" /></div>
                          <button onClick={addStaff} disabled={!newStaffName.trim() || !newStaffTabel.trim()} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95">+ Qo&apos;shish</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {!selectedErju ? <div className="flex flex-col items-center justify-center h-full text-slate-200 text-sm text-center gap-2"><span className="text-3xl">👥</span><p>ERJU tanlanganida xodimlar ko&apos;rinadi</p></div> : (
                    <>
                      <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-3">{selectedErju} — barcha xodimlar ({erjuAllStaff.length} ta)</p>
                      {erjuAllStaff.length === 0 ? <p className="text-slate-200 text-sm text-center py-8">Hozircha xodim yo&apos;q</p> : (
                        <div className="space-y-2">
                          {erjuAllStaff.map((staff, i) => (
                            <div key={staff.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 group">
                              {editingStaffId === staff.id ? (
                                <div className="space-y-2">
                                  <select value={editStaff.zapravka} onChange={e => setEditStaff(p => ({ ...p, zapravka: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none">
                                    {selectedErjuData?.zapravkalar.map(z => <option key={z} value={z}>{z}</option>)}
                                  </select>
                                  <div className="flex gap-2">
                                    <input value={editStaff.tabel} onChange={e => setEditStaff(p => ({ ...p, tabel: e.target.value }))} className="w-24 bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" placeholder="Tabel" />
                                    <input value={editStaff.name} onChange={e => setEditStaff(p => ({ ...p, name: e.target.value }))} className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" placeholder="F.I.SH" />
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={saveStaffEdit} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"><span>✓</span> Saqlash</button>
                                    <button onClick={() => setEditingStaffId(null)} className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-lg text-xs transition-all">Bekor</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-300 font-mono text-xs w-5">{i + 1}</span>
                                    <div>
                                      <div className="flex items-center gap-2"><span className="font-bold text-white text-sm">{staff.fullName}</span><span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full font-mono">#{staff.tabelNumber}</span></div>
                                      <p className="text-[10px] text-slate-300 mt-0.5">{staff.zapravka}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditingStaffId(staff.id); setEditStaff({ name: staff.fullName, tabel: staff.tabelNumber, zapravka: staff.zapravka }); }} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"><span>✏️</span></button>
                                    <button onClick={() => setStaffList(prev => prev.filter(s => s.id !== staff.id))} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"><span>🗑️</span></button>
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeMoveModal} />
            <div className="relative bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-white/10 w-full max-w-3xl rounded-[2rem] shadow-[0_35px_120px_rgba(15,23,42,0.75)] z-[10000] flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm">
                <div>
                  <h2 className="font-bold text-amber-300 text-xl tracking-[0.2em] uppercase">Harakat turlari</h2>
                  <p className="text-slate-300/80 text-sm mt-1">Ro&apos;yxatni boshqarish</p>
                </div>
                <button onClick={closeMoveModal} className="text-white bg-red-500/90 hover:bg-red-600 border border-red-400/40 p-2 rounded-full transition-all shadow-lg hover:shadow-red-500/20">
                  <span className="text-base">✖</span>
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto hide-scrollbar" style={{ maxHeight: 'calc(72vh - 72px)' }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.35em]">Mavjud harakat turlari</p>
                  <button type="button" onClick={() => setIsMoveAddOpen(v => !v)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-sm">
                    + Qo&apos;shish
                  </button>
                </div>
                {isMoveAddOpen && (
                  <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 space-y-4 shadow-inner shadow-slate-950/40">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tartib №</label>
                        <input value={newMoveKey} onChange={e => setNewMoveKey(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="7" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Harakat nomi</label>
                        <input value={newMoveValue} onChange={e => setNewMoveValue(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="Yangi harakat" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={addMoveOption} className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                        Saqlash
                      </button>
                      <button onClick={() => { setIsMoveAddOpen(false); setNewMoveKey(''); setNewMoveValue(''); }} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm">
                        Bekor
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {moveOptions.map((m) => (
                    <div key={m.key} className="bg-slate-900/90 border border-white/10 rounded-3xl px-4 py-3 shadow-sm shadow-slate-950/20">
                      {editingMoveKey === m.key ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tartib №</label>
                            <input value={editMoveKey} onChange={e => setEditMoveKey(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Harakat nomi</label>
                            <input value={editMoveValue} onChange={e => setEditMoveValue(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
                          </div>
                          <div className="col-span-2 flex flex-wrap gap-2">
                            <button onClick={saveMoveEdit} className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                              Saqlash
                            </button>
                            <button onClick={() => setEditingMoveKey(null)} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm">
                              Bekor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-amber-300 font-mono text-xs w-8">#{m.key}</span>
                            <span className="text-slate-100 font-semibold">{m.value}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setEditingMoveKey(m.key); setEditMoveKey(m.key); setEditMoveValue(m.value); }} className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-200 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all">
                              Edit
                            </button>
                            <button onClick={() => setMoveOptions(prev => prev.filter(x => x.key !== m.key))} className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-200 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/30 transition-all">
                              Delete
                            </button>
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

        {/* POYEZD RUSUMI SIDEBAR */}
        {isSeriesModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSeriesModal} />
            <div className="relative bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-white/10 w-full max-w-3xl rounded-[2rem] shadow-[0_35px_120px_rgba(15,23,42,0.75)] z-[10000] flex flex-col overflow-hidden" style={{ maxHeight: '72vh' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm">
                <div>
                  <h2 className="font-bold text-amber-300 text-xl tracking-[0.2em] uppercase">Poyezd rusumi</h2>
                  <p className="text-slate-300/80 text-sm mt-1">Ro&apos;yxatni boshqarish</p>
                </div>
                <button onClick={closeSeriesModal} className="text-white bg-red-500/90 hover:bg-red-600 border border-red-400/40 p-2 rounded-full transition-all shadow-lg hover:shadow-red-500/20">
                  <span className="text-base">✖</span>
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto hide-scrollbar" style={{ maxHeight: 'calc(72vh - 72px)' }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.35em]">Mavjud rusumlar</p>
                  <button type="button" onClick={() => setIsSeriesAddOpen(v => !v)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-sm">
                    + Qo&apos;shish
                  </button>
                </div>
                {isSeriesAddOpen && (
                  <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 space-y-4 shadow-inner shadow-slate-950/40">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tartib №</label>
                        <input value={newSeriesKey} onChange={e => setNewSeriesKey(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="11" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Rusum nomi</label>
                        <input value={newSeriesValue} onChange={e => setNewSeriesValue(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" placeholder="Yangi rusum" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={addSeriesOption} className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                        Saqlash
                      </button>
                      <button onClick={() => { setIsSeriesAddOpen(false); setNewSeriesKey(''); setNewSeriesValue(''); }} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm">
                        Bekor
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {seriesOptionsState.map((m) => (
                    <div key={m.key} className="bg-slate-900/90 border border-white/10 rounded-3xl px-4 py-3 shadow-sm shadow-slate-950/20">
                      {editingSeriesKey === m.key ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tartib №</label>
                            <input value={editSeriesKey} onChange={e => setEditSeriesKey(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Rusum nomi</label>
                            <input value={editSeriesValue} onChange={e => setEditSeriesValue(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
                          </div>
                          <div className="col-span-2 flex flex-wrap gap-2">
                            <button onClick={saveSeriesEdit} className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
                              Saqlash
                            </button>
                            <button onClick={() => setEditingSeriesKey(null)} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm">
                              Bekor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-amber-300 font-mono text-xs w-8">#{m.key}</span>
                            <span className="text-slate-100 font-semibold">{m.value}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setEditingSeriesKey(m.key); setEditSeriesKey(m.key); setEditSeriesValue(m.value); }} className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-200 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all">
                              Edit
                            </button>
                            <button onClick={() => setSeriesOptionsState(prev => prev.filter(x => x.key !== m.key))} className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-200 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/30 transition-all">
                              Delete
                            </button>
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
            <div className="fixed top-0 left-0 h-full w-64 bg-black text-white shadow-[0_35px_120px_rgba(0,0,0,0.65)] z-[10001] border-r border-white/10">
              <div className="p-5 flex justify-between items-center border-b border-white/10 bg-black/95 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-slate-100 tracking-[0.2em] uppercase">Menyu</h2>
                <button onClick={() => setIsSkladOpen(false)} className="text-white bg-red-500/90 hover:bg-red-600 border border-red-400/40 p-2 rounded-full transition-all shadow-lg hover:shadow-red-500/20">
                  <span className="text-base">✖</span>
                </button>
              </div>
              <nav className="mt-4 space-y-4 overflow-y-auto hide-scrollbar pb-6 pr-2" style={{ maxHeight: 'calc(100vh - 70px)' }}>
                {[{ label: 'Toshkent ERJU', items: [['1','Toshkent'],['3','Angren'],['4','Sirdaryo'],['5','Hovos'],['6','Jizzax']] },
                  { label: "Qo'qon ERJU", items: [['10','Andijon'],['7',"Qo'qon"],['8',"Marg'ilon"]] },
                  { label: 'Buxoro ERJU', items: [['11','Samarqand'],['13','Ziyouddin'],['14','Buxoro'],['15','Tinchlik'],['16','Uchquduq']] },
                  { label: "Qo'ng'irot ERJU", items: [['20',"Qo'ng'irot"],['23','Urganch'],['24','Miskin']] },
                  { label: 'Qarshi ERJU', items: [['17','Qarshi']] },
                  { label: 'Termiz ERJU', items: [['18','Termiz'],['19','Darband'],['26',"Qumqo'rg'on"]] },
                ].map(g => (
                  <div key={g.label} className="px-4">
                    <p className="text-[9px] font-semibold text-emerald-300 uppercase tracking-[0.35em] mb-3">{g.label}</p>
                    <div className="space-y-2">
                      {g.items.map(([k, v]) => (
                        <button key={k} type="button" onClick={() => selectSklad(k)} className="text-left w-full px-3 py-2 rounded-2xl bg-slate-900/80 text-slate-100 hover:text-white hover:bg-slate-700/60 transition-all shadow-sm hover:shadow-md">
                          <span className="text-amber-300 font-mono text-[11px] mr-2">#{k}</span>
                          <span className="font-medium text-[13px] text-slate-100">{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
            <div onClick={() => setIsSkladOpen(false)} className="fixed inset-0 bg-black/50 z-[10000]" />
          </>
        )}

        {/* FORMA */}
        <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
          <form onSubmit={addRow} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Zaprafka</label>
                <input list="sklad-list" placeholder="№ yoki nom yozing..." value={supplyPointRaw} onChange={e => handleSupplyPointInput(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
                <datalist id="sklad-list">{skladOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Poyezd rusumi</label>
                <input list="series-list" placeholder="№ yozing..." value={formData.locoSeries || ''} onChange={e => { const v = e.target.value; const f = seriesOptionsState.find(o => o.key === v); setFormData({ ...formData, locoSeries: f ? f.value : v }); }} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
                <datalist id="series-list">{seriesOptionsState.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>
              <InputGroup label="Raqami" type="text" value={formData.locoCode} onChange={v => setFormData({ ...formData, locoCode: v })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Harakat turi</label>
                <input list="move-list" placeholder="№ yozing..." value={formData.moveType || ''} onChange={e => { const v = e.target.value; const f = moveOptions.find(o => o.key === v); setFormData({ ...formData, moveType: f ? f.value : v }); }} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
                <datalist id="move-list">{moveOptions.map(o => <option key={o.key} value={o.value}>{o.key} - {o.value}</option>)}</datalist>
              </div>
              <InputGroup label="Poyezd Raqami" type="text" value={formData.locoNumber} onChange={v => setFormData({ ...formData, locoNumber: v })} />
              <InputGroup label="Ruxsat index" value={formData.trainNumber} onChange={v => setFormData({ ...formData, trainNumber: v })} />
              <InputGroup label="Poyezd Vazni" type="number" value={formData.weight} onChange={v => setFormData({ ...formData, weight: v })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">Xodim</label>
                <input list="staff-list" placeholder="Tabel № yozing yoki ismdan tanlang..." value={staffInputRaw} onChange={e => handleStaffInput(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 outline-none focus:border-amber-400 transition-all w-full placeholder:text-slate-500" />
                <datalist id="staff-list">{staffList.map(s => <option key={s.id} value={s.tabelNumber}>{s.tabelNumber} - {s.fullName} ({s.zapravka})</option>)}</datalist>
                {formData.staffName && staffInputRaw !== formData.staffName && (<p className="text-xs text-emerald-400 ml-1 flex items-center gap-1"><span>✓</span> {formData.staffName}</p>)}
              </div>
              <InputGroup label="O'zida kelgan qoldiq" type="number" value={formData.balanceBefore} onChange={v => setFormData({ ...formData, balanceBefore: v })} />
              <InputGroup label="Berilgan Yoqilg'i" type="number" value={formData.fuelAmount} onChange={v => setFormData({ ...formData, fuelAmount: v })} />
            </div>
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button type="submit" disabled={isTodayClosed} className={`${isTodayClosed ? 'opacity-60 cursor-not-allowed bg-slate-700 hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500'} px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95`}><span>+</span> {editingId ? 'Saqlash' : "Qo'shish"}</button>
              <button type="button" onClick={clearForm} className="bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-white/10 transition-all"><span>↻</span> Tozalash</button>
            </div>
          </form>
        </section>

        {/* JADVAL */}
        <section className="bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-hidden">
            <table className="w-full text-left table-auto">
              <thead className="bg-white/5 text-[9px] uppercase text-blue-300 font-bold tracking-widest">
                <tr>
                  <th className="p-3 border-b border-white/5 w-12 text-center">№</th>
                  <th className="p-3 border-b border-white/5">Sana</th>
                  <th className="p-3 border-b border-white/5">Teplovoz</th>
                  <th className="p-3 border-b border-white/5">Raqami</th>
                  <th className="p-3 border-b border-white/5">Kod</th>
                  <th className="p-3 border-b border-white/5">Zaprafka</th>
                  <th className="p-3 border-b border-white/5">Harakat turi</th>
                  <th className="p-3 border-b border-white/5">P.Raqami</th>
                  <th className="p-3 border-b border-white/5">Ruxsat indexi</th>
                  <th className="p-3 border-b border-white/5">Poyezd Vazni</th>
                  <th className="p-3 border-b border-white/5">Xodim</th>
                  <th className="p-3 border-b border-white/5 text-center">Qoldiq</th>
                  <th className="p-3 border-b border-white/5 text-center">Yoqilg&apos;i</th>
                  <th className="p-3 border-b border-white/5 text-center">Hisob</th>
                  <th className="p-3 border-b border-white/5 text-center w-28">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={handleExportPdf} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest">PDF</button>
                      <button type="button" onClick={handleExportErjuPdf} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest">ERJU PDF</button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 text-slate-500 font-mono text-center text-[11px]">{rows.length - idx}</td>
                    <td className="p-3 font-mono text-[11px]">
                      <span className="text-slate-200">{row.time}</span>
                    </td>
                    <td className="p-3"><span className="text-blue-400 font-bold text-[11px]">{row.locoSeries}</span></td>
                    <td className="p-3 text-[11px] text-slate-300">{row.locoCode}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.trainIndex}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.supplyPoint}</td>
                    <td className="p-3 text-[11px]">{row.moveType}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.locoNumber}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.trainNumber}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.weight}</td>
                    <td className="p-3 text-[11px] text-slate-300">{row.staffName}</td>
                    <td className="p-3 text-center text-amber-500 font-mono text-[11px]">{Number(row.balanceBefore).toLocaleString()}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold font-mono text-[11px]">{Number(row.fuelAmount).toLocaleString()}</td>
                    <td className="p-3 text-center font-bold font-mono text-[11px]">{(Number(row.balanceBefore) + Number(row.fuelAmount)).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => editRow(row)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><span>✏️</span></button>
                        <button onClick={() => deleteRow(row.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><span>🗑️</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-emerald-600/40 bg-emerald-700/20 px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="text-emerald-100">Hisob yoqilg&apos;i: {stats.total.toLocaleString()}</span>
              <span className="text-slate-200">|</span>
              <span className="text-slate-100">Sana: {todayDate}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setIsTodayClosed(true)} disabled={isTodayClosed} className={`self-start md:self-auto text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl ${isTodayClosed ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white'} transition-all active:scale-95`}>
                Бугунги кунни ёпиш
              </button>
              <button type="button" onClick={() => {}} disabled={!isTodayClosed} className={`self-start md:self-auto text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl ${!isTodayClosed ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'} transition-all active:scale-95`}>
                Ёпилган кунга қўшиб кетиш
              </button>
            </div>
          </div>
        </section>
        <RentCalendar
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onSave={() => setIsCalendarOpen(false)}
        />
      </main>
    </div>
  );
};

interface InputGroupProps { label: string; type?: string; value: string | undefined; onChange: (v: string) => void; }
const InputGroup = ({ label, type = 'text', value, onChange }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-extrabold text-amber-300 uppercase ml-1 tracking-widest">{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-200 focus:border-amber-400 outline-none transition-all w-full" />
  </div>
);

export default TrainFuelSystem;
