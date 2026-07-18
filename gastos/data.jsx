/* ============================================================
   Gastos — Iconos, categorías y helpers de base de datos
   ============================================================ */

/* ---------- Iconos (stroke, lucide-style) ---------- */
const Icon = ({ d, size = 18, stroke = 2, fill = "none", ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const Icons = {
  home: <Icon d={<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/></>} />,
  list: <Icon d={<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>} />,
  wallet: <Icon d={<><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v0"/><path d="M3 8.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5"/><circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none"/></>} />,
  users: <Icon d={<><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M18 14.5c2 .6 3.5 2.4 3.5 5"/></>} />,
  target: <Icon d={<><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>} />,
  chart: <Icon d={<><path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6" rx=".7"/><rect x="12.5" y="7" width="3" height="10" rx=".7"/><rect x="18" y="13" width="3" height="4" rx=".7"/></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></>} />,
  plus: <Icon d={<><path d="M12 5v14M5 12h14"/></>} />,
  search: <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>} />,
  bell: <Icon d={<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.5 19a1.5 1.5 0 0 0 3 0"/></>} />,
  help: <Icon d={<><circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 0 1 4.5 1.3c0 1.6-2.3 2-2.3 3.5"/><circle cx="11.9" cy="17" r="0.6" fill="currentColor" stroke="none"/></>} />,
  chevL: <Icon d={<path d="m14 7-5 5 5 5"/>} />,
  chevR: <Icon d={<path d="m10 7 5 5-5 5"/>} />,
  chevD: <Icon d={<path d="m7 10 5 5 5-5"/>} />,
  arrowUp: <Icon d={<><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>} size={14} />,
  arrowDn: <Icon d={<><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></>} size={14} />,
  x: <Icon d={<><path d="M6 6l12 12M18 6 6 18"/></>} />,
  check: <Icon d={<path d="m5 12 4.5 4.5L19 7"/>} />,
  home2: <Icon d={<><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></>} />,
  cart: <Icon d={<><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3.5H5l2 11.5h11l1.8-8H6"/></>} />,
  car: <Icon d={<><path d="M5 13l1.5-5h11L19 13"/><path d="M3.5 13h17v4.5h-2v-1.5H5.5v1.5h-2z"/><circle cx="7.5" cy="16" r="1"/><circle cx="16.5" cy="16" r="1"/></>} />,
  film: <Icon d={<><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/></>} />,
  bolt: <Icon d={<path d="M12 2 5 13h6l-1 9 8-12h-6z"/>} />,
  heart: <Icon d={<path d="M12 20s-7-4.3-9.2-8.4C1.2 8.7 3 5.5 6.3 5.5c1.9 0 3.1 1 3.7 2 .6-1 1.8-2 3.7-2 3.3 0 5.1 3.2 3.5 6.1C19 15.7 12 20 12 20z"/>} />,
  tag: <Icon d={<><path d="M3.5 11V4.5A1 1 0 0 1 4.5 3.5H11l9.5 9.5a1.5 1.5 0 0 1 0 2L15 20.5a1.5 1.5 0 0 1-2 0z"/><circle cx="7.5" cy="7.5" r="1.1"/></>} />,
  repeat: <Icon d={<><path d="M4 9a5 5 0 0 1 5-5h7"/><path d="m13 1 3 3-3 3"/><path d="M20 15a5 5 0 0 1-5 5H8"/><path d="m11 23-3-3 3-3"/></>} size={13} />,
  calendar: <Icon d={<><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></>} size={14} />,
  sun: <Icon d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>} />,
  moon: <Icon d={<path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z"/>} />,
  download: <Icon d={<><path d="M12 4v10"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></>} size={15} />,
  filter: <Icon d={<path d="M3 5h18l-7 8v5l-4 2v-7z"/>} size={15} />,
  sparkle: <Icon d={<path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6z"/>} />,
  logout: <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
};

/* ---------- Categorías (estáticas) ---------- */
const CATEGORIES = [
  { id: "vivienda",    name: "Vivienda",   icon: Icons.home2, color: "var(--cat-vivienda)" },
  { id: "comida",      name: "Comida",     icon: Icons.cart,  color: "var(--cat-comida)" },
  { id: "transporte",  name: "Transporte", icon: Icons.car,   color: "var(--cat-transporte)" },
  { id: "servicios",   name: "Servicios",  icon: Icons.bolt,  color: "var(--cat-servicios)" },
  { id: "ocio",        name: "Ocio",       icon: Icons.film,  color: "var(--cat-ocio)" },
  { id: "salud",       name: "Salud",      icon: Icons.heart, color: "var(--cat-salud)" },
  { id: "otros",       name: "Otros",      icon: Icons.tag,   color: "var(--cat-otros)" },
];
const catById = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

/* ---------- Miembros y presupuestos (dinámicos — se pueblan desde DB) ---------- */
var MEMBERS = [];
var BUDGETS = {};
const memberById = (id) => MEMBERS.find(m => m.id === id) || { id, initials: '?', color: 'var(--muted)', name: 'Usuario' };

const MONTHLY_INCOME = 4200;

/* ---------- Helpers de formato ---------- */
const fmt     = (n) => Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0    = (n) => Math.round(n).toLocaleString("es-ES");
const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

/* Normaliza una fila de la tabla expenses al formato interno de la app */
const normalizeExpense = (e) => ({
  id:        e.id,
  title:     e.title,
  cat:       e.category,
  type:      e.type || 'gasto',
  amount:    Number(e.amount),
  member:    e.paid_by,
  date:      e.date,
  recurring: e.recurring || false,
});

/* ============================================================
   Helpers de base de datos
   ============================================================ */

async function db_loadExpenses(tenantId, year, month) {
  const pad  = (n) => String(n).padStart(2, '0');
  const from = `${year}-${pad(month + 1)}-01`;
  const to   = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;
  const { data, error } = await _sb
    .from('expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeExpense);
}

async function db_addExpense(tenantId, { title, amount, cat, type, member, date, recurring }) {
  const { data, error } = await _sb
    .from('expenses')
    .insert({ tenant_id: tenantId, title, amount, category: cat, type: type || 'gasto', paid_by: member, date, recurring })
    .select()
    .single();
  if (error) throw error;
  return normalizeExpense(data);
}

async function db_loadMembers(tenantId) {
  const { data, error } = await _sb
    .from('tenant_members')
    .select('role, profiles(id, full_name, initials, color)')
    .eq('tenant_id', tenantId);
  if (error) throw error;
  return (data || [])
    .filter(r => r.profiles)
    .map(r => ({
      id:       r.profiles.id,
      name:     r.profiles.full_name || 'Usuario',
      initials: r.profiles.initials  || (r.profiles.full_name || 'U')[0].toUpperCase(),
      color:    r.profiles.color     || 'oklch(0.62 0.12 162)',
      role:     r.role,
    }));
}

async function db_loadBudgets(tenantId) {
  const { data, error } = await _sb
    .from('budgets')
    .select('category, amount')
    .eq('tenant_id', tenantId);
  if (error) throw error;
  const obj = {};
  (data || []).forEach(b => { obj[b.category] = Number(b.amount); });
  return obj;
}

async function db_loadTenant(tenantId) {
  const { data, error } = await _sb
    .from('tenants').select('*').eq('id', tenantId).single();
  if (error) throw error;
  return data;
}

async function db_loadProfile(userId) {
  const { data, error } = await _sb
    .from('profiles').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/* Totales de los últimos 5 meses desde DB; el 6.° (actual) se rellena en vivo */
async function db_loadTrend(tenantId) {
  const MNAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const now    = new Date();
  const pad    = (n) => String(n).padStart(2, '0');
  const months = [];
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth(), label: MNAMES[d.getMonth()] });
  }

  const from = `${months[0].y}-${pad(months[0].m + 1)}-01`;
  const prev = new Date(now.getFullYear(), now.getMonth(), 0);
  const to   = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}-${pad(prev.getDate())}`;

  const { data } = await _sb
    .from('expenses').select('date, amount')
    .eq('tenant_id', tenantId).eq('type', 'gasto').gte('date', from).lte('date', to);

  const sums = {};
  (data || []).forEach(e => {
    const key = e.date.slice(0, 7);
    sums[key] = (sums[key] || 0) + Number(e.amount);
  });

  const trend = months.map(({ y, m, label }) => ({
    m: label, v: sums[`${y}-${pad(m + 1)}`] || 0,
  }));
  trend.push({ m: MNAMES[now.getMonth()], v: null }); // mes actual → live
  return trend;
}

Object.assign(window, {
  Icon, Icons, CATEGORIES, catById,
  MEMBERS, BUDGETS, memberById,
  MONTHLY_INCOME, fmt, fmt0, fmtDate, normalizeExpense,
  db_loadExpenses, db_addExpense, db_loadMembers,
  db_loadBudgets, db_loadTenant, db_loadProfile, db_loadTrend,
});
