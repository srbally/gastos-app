/* ============================================================
   Gastos — App principal con auth multi-tenant (Supabase)
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#1f9b6b",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#1f9b6b": { p:"0.60 0.115 162", d:"0.50 0.10 162", s:"0.94 0.04 162",  i:"0.42 0.10 162" },
  "#2a78d4": { p:"0.58 0.11  245", d:"0.49 0.10 245", s:"0.95 0.035 245", i:"0.42 0.10 245" },
  "#0d9488": { p:"0.60 0.10  195", d:"0.51 0.09 195", s:"0.94 0.035 195", i:"0.42 0.09 195" },
  "#7c5ce0": { p:"0.58 0.13  295", d:"0.49 0.12 295", s:"0.95 0.04 295",  i:"0.43 0.11 295" },
};

function applyAccent(hex, dark) {
  const a = ACCENTS[hex] || ACCENTS["#1f9b6b"];
  const r = document.documentElement.style;
  const [, c, h] = a.p.split(" ");
  if (dark) {
    r.setProperty("--primary",      `oklch(0.70 ${c} ${h})`);
    r.setProperty("--primary-deep", `oklch(0.62 ${c} ${h})`);
    r.setProperty("--primary-soft", `oklch(0.30 0.05 ${h})`);
    r.setProperty("--primary-ink",  `oklch(0.82 ${c} ${h})`);
  } else {
    r.setProperty("--primary",      `oklch(${a.p})`);
    r.setProperty("--primary-deep", `oklch(${a.d})`);
    r.setProperty("--primary-soft", `oklch(${a.s})`);
    r.setProperty("--primary-ink",  `oklch(${a.i})`);
  }
}

const DENSITY = {
  compact: { pad:"16px", row:"48px" },
  regular: { pad:"22px", row:"56px" },
  comfy:   { pad:"28px", row:"64px" },
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/* ============================================================ */

function App() {
  /* ── Auth ─────────────────────────────────────────────────
     undefined = cargando | null = sin sesión | object = sesión */
  const [session,   setSession]   = React.useState(undefined);
  const [profile,   setProfile]   = React.useState(null);
  const [tenant,    setTenant]    = React.useState(null);
  const [dataReady, setDataReady] = React.useState(false);

  /* ── App ───────────────────────────────────────────────── */
  const [t, setTweak]     = useTweaks(TWEAK_DEFAULTS);
  const [view, setView]   = React.useState("resumen");
  const [txns, setTxns]   = React.useState([]);
  const [trend, setTrend] = React.useState([]);
  const [curYear,  setCurYear]  = React.useState(new Date().getFullYear());
  const [curMonth, setCurMonth] = React.useState(new Date().getMonth());
  const [modal,    setModal]    = React.useState(false);
  const [helpMode, setHelpMode] = React.useState(false);
  const [tour,     setTour]     = React.useState(false);
  const [toast,    setToast]    = React.useState(null);

  /* ── Escucha sesión ────────────────────────────────────── */
  React.useEffect(() => {
    _sb.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = _sb.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (!session) { setProfile(null); setTenant(null); setDataReady(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Cuando llega sesión, carga perfil ─────────────────── */
  React.useEffect(() => {
    if (!session?.user?.id) return;
    db_loadProfile(session.user.id).then(p => {
      setProfile(p);
      if (p?.current_tenant_id) loadTenantData(p.current_tenant_id);
    });
  }, [session?.user?.id]);

  async function loadTenantData(tenantId) {
    setDataReady(false);
    const now = new Date();
    const [ten, members, budgets, expenses, trendData] = await Promise.all([
      db_loadTenant(tenantId),
      db_loadMembers(tenantId),
      db_loadBudgets(tenantId),
      db_loadExpenses(tenantId, now.getFullYear(), now.getMonth()),
      db_loadTrend(tenantId),
    ]);
    MEMBERS = members;   // actualiza globales usados por componentes legacy
    BUDGETS = budgets;
    setTenant(ten);
    setTxns(expenses);
    setTrend(trendData);
    setCurYear(now.getFullYear());
    setCurMonth(now.getMonth());
    setDataReady(true);
    if (!localStorage.getItem('gastos_tour_seen')) setTimeout(() => setTour(true), 700);
  }

  const handleTenantCreated = async (tenantId) => {
    const p = await db_loadProfile(session.user.id);
    setProfile(p);
    await loadTenantData(tenantId);
  };

  /* ── Tema / densidad ───────────────────────────────────── */
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
    applyAccent(t.accent, t.dark);
  }, [t.dark, t.accent]);
  React.useEffect(() => {
    const d = DENSITY[t.density] || DENSITY.regular;
    document.documentElement.style.setProperty("--pad",   d.pad);
    document.documentElement.style.setProperty("--row-h", d.row);
  }, [t.density]);
  React.useEffect(() => {
    document.body.classList.toggle("help-mode", helpMode);
  }, [helpMode]);

  /* ── Guards ────────────────────────────────────────────── */
  if (session === undefined) return <LoadingScreen />;
  if (!session)              return <AuthScreen />;
  if (!profile)              return <LoadingScreen />;
  if (!profile.current_tenant_id)
    return <CreateTenantScreen userEmail={session.user.email} onCreated={handleTenantCreated} />;
  if (!dataReady)            return <LoadingScreen />;

  /* ── Datos derivados ───────────────────────────────────── */
  const byCat = React.useMemo(() => {
    const m = {};
    txns.forEach(tx => { m[tx.cat] = (m[tx.cat] || 0) + tx.amount; });
    return m;
  }, [txns]);

  const totalSpent  = txns.reduce((s, x) => s + x.amount, 0);
  const totalBudget = Object.values(BUDGETS).reduce((a, b) => a + b, 0);
  const balance     = MONTHLY_INCOME - totalSpent;
  const savingsRate = MONTHLY_INCOME ? Math.round((balance / MONTHLY_INCOME) * 100) : 0;
  const overBudgetCount = CATEGORIES.filter(c => (byCat[c.id] || 0) > (BUDGETS[c.id] || 0)).length;

  const trendLive = React.useMemo(() => {
    const arr = trend.map(x => ({ ...x }));
    if (arr.length) arr[arr.length - 1].v = totalSpent;
    return arr;
  }, [trend, totalSpent]);

  /* ── Navegación de mes ─────────────────────────────────── */
  const changeMonth = async (delta) => {
    let m = curMonth + delta, y = curYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setCurMonth(m); setCurYear(y);
    setTxns(await db_loadExpenses(tenant.id, y, m));
  };

  /* ── Agregar gasto ─────────────────────────────────────── */
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const addExpense = async (data) => {
    try {
      const expense = await db_addExpense(tenant.id, data);
      const now = new Date();
      if (curYear === now.getFullYear() && curMonth === now.getMonth()) {
        setTxns(prev => [expense, ...prev]);
      }
      showToast(`Gasto de €${fmt(data.amount)} guardado`);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const closeTour = () => { setTour(false); localStorage.setItem('gastos_tour_seen', '1'); };

  const PAGE = {
    resumen:       { t:"Resumen del hogar",     s:`${MONTHS[curMonth]} ${curYear} · ${tenant.name}` },
    transacciones: { t:"Transacciones",          s:"Todos los movimientos del mes" },
    presupuestos:  { t:"Presupuestos",           s:"Topes mensuales por categoría" },
    compartidos:   { t:"Compartidos",            s:"Reparto de cuentas entre miembros" },
    metas:         { t:"Metas de ahorro",        s:"Objetivos del hogar" },
    reportes:      { t:"Reportes",               s:"Análisis y exportación" },
    ajustes:       { t:"Ajustes",                s:"Hogar, miembros y preferencias" },
  };
  const pg = PAGE[view] || PAGE.resumen;

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="app">
      <Sidebar view={view} setView={setView}
        overBudgetCount={overBudgetCount} tenantName={tenant.name} />

      <div className="main">
        <TopBar
          title={pg.t} sub={pg.s}
          month={`${MONTHS[curMonth]} ${curYear}`}
          onPrevMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
          helpMode={helpMode} setHelpMode={setHelpMode}
          onAdd={() => setModal(true)}
          dark={t.dark} toggleDark={() => setTweak("dark", !t.dark)}
          onLogout={() => _sb.auth.signOut()}
        />

        <div className="content">
          {view === "resumen" && (
            <div className="content-inner">
              <div className="grid stat-grid" style={{ marginBottom:16 }}>
                <Stat label="Balance del mes" value={fmt0(balance)}
                  tint="var(--primary)" icon={Icons.wallet}
                  delta={`${savingsRate}% de ingresos`} deltaDir={balance >= 0 ? "down" : "up"} tip="balance" />
                <Stat label="Gastado" value={fmt0(totalSpent)}
                  tint="var(--cat-comida)" icon={Icons.cart}
                  delta={txns.length ? `${txns.length} movimientos` : "Sin gastos"} deltaDir="down" tip="gastado" />
                <Stat label="Presupuesto" value={fmt0(totalBudget)}
                  tint="var(--blue)" icon={Icons.target}
                  sub={`€${fmt0(totalBudget - totalSpent)} disponibles`} tip="presupuesto" />
                <Stat label="Ahorro" value={fmt0(Math.max(balance, 0))}
                  tint="var(--cat-ocio)" icon={Icons.sparkle}
                  delta={balance >= 0 ? "vas por buen camino" : "en negativo"}
                  deltaDir={balance >= 0 ? "down" : "up"} tip="ahorro" />
              </div>

              <div className="grid main-grid">
                <div className="grid">
                  <TrendChart trend={trendLive} />
                  <RecentTransactions txns={txns} onViewAll={() => setView("transacciones")} />
                </div>
                <div className="grid">
                  <BudgetOverall spent={totalSpent} budget={totalBudget} />
                  <CategoryBreakdown byCat={byCat} total={totalSpent} />
                  <SharedSettle txns={txns} />
                </div>
              </div>
            </div>
          )}

          {view === "transacciones" && <TransactionsView txns={txns} />}
          {view === "presupuestos"  && <BudgetsView byCat={byCat} />}

          {view === "compartidos" && (
            <div className="content-inner fade-up" style={{ maxWidth:560 }}>
              <SharedSettle txns={txns} />
            </div>
          )}

          {view === "metas" && (
            <ComingSoon icon={Icons.target} title="Metas de ahorro"
              desc="Define objetivos como "fondo de emergencia" o "vacaciones" y sigue el progreso del hogar mes a mes. Próximamente." />
          )}
          {view === "reportes" && (
            <ComingSoon icon={Icons.chart} title="Reportes y exportación"
              desc="Genera informes mensuales o anuales y expórtalos a PDF o CSV para tu contabilidad. Próximamente." />
          )}

          {view === "ajustes" && (
            <div className="content-inner fade-up" style={{ maxWidth:560 }}>
              <div className="card card-pad">
                <div className="card-title" style={{ marginBottom:16 }}>Preferencias</div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>Volver a ver la guía</div>
                    <div style={{ fontSize:12.5, color:"var(--muted)" }}>Repite el tour de bienvenida.</div>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setTour(true)}>
                    {React.cloneElement(Icons.sparkle, { size:15 })} Iniciar guía
                  </button>
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>Modo ayuda</div>
                    <div style={{ fontSize:12.5, color:"var(--muted)" }}>Muestra pistas "?" al pasar el ratón.</div>
                  </div>
                  <button className={"btn " + (helpMode ? "btn-primary" : "btn-ghost")}
                    onClick={() => setHelpMode(h => !h)}>
                    {helpMode ? "Activado" : "Activar"}
                  </button>
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"12px 0" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>Cuenta</div>
                    <div style={{ fontSize:12.5, color:"var(--muted)" }}>{session.user.email}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ color:"var(--neg)" }}
                    onClick={() => _sb.auth.signOut()}>
                    {React.cloneElement(Icons.logout, { size:15 })} Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal open={modal} onClose={() => setModal(false)} onAdd={addExpense} />
      <HelpTooltips active={helpMode} />
      <Tour open={tour} onClose={closeTour} />

      <div className={"toast" + (toast ? " show" : "")}>
        {toast && <>{React.cloneElement(Icons.check, { size:16 })}{toast}</>}
      </div>

      <TweaksPanel>
        <TweakSection label="Tema" />
        <TweakToggle label="Modo oscuro" value={t.dark} onChange={v => setTweak("dark", v)} />
        <TweakColor  label="Color de acento" value={t.accent}
          options={Object.keys(ACCENTS)} onChange={v => setTweak("accent", v)} />
        <TweakSection label="Disposición" />
        <TweakRadio  label="Densidad" value={t.density}
          options={["compact","regular","comfy"]} onChange={v => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
