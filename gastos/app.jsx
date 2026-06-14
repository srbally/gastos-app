/* ============================================================
   Gastos — App principal
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#1f9b6b",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#1f9b6b": { p: "0.60 0.115 162", d: "0.50 0.10 162", s: "0.94 0.04 162", i: "0.42 0.10 162" }, // verde
  "#2a78d4": { p: "0.58 0.11 245", d: "0.49 0.10 245", s: "0.95 0.035 245", i: "0.42 0.10 245" }, // azul
  "#0d9488": { p: "0.60 0.10 195", d: "0.51 0.09 195", s: "0.94 0.035 195", i: "0.42 0.09 195" }, // teal
  "#7c5ce0": { p: "0.58 0.13 295", d: "0.49 0.12 295", s: "0.95 0.04 295", i: "0.43 0.11 295" }, // violeta
};

function applyAccent(hex, dark) {
  const a = ACCENTS[hex] || ACCENTS["#1f9b6b"];
  const root = document.documentElement.style;
  if (dark) {
    const [, c, h] = a.p.split(" ");
    root.setProperty("--primary", `oklch(0.70 ${c} ${h})`);
    root.setProperty("--primary-deep", `oklch(0.62 ${c} ${h})`);
    root.setProperty("--primary-soft", `oklch(0.30 0.05 ${h})`);
    root.setProperty("--primary-ink", `oklch(0.82 ${c} ${h})`);
  } else {
    root.setProperty("--primary", `oklch(${a.p})`);
    root.setProperty("--primary-deep", `oklch(${a.d})`);
    root.setProperty("--primary-soft", `oklch(${a.s})`);
    root.setProperty("--primary-ink", `oklch(${a.i})`);
  }
}

const DENSITY = {
  compact: { pad: "16px", row: "48px" },
  regular: { pad: "22px", row: "56px" },
  comfy:   { pad: "28px", row: "64px" },
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState("resumen");
  const [txns, setTxns] = React.useState(SEED_TX);
  const [monthIdx, setMonthIdx] = React.useState(5); // Junio
  const [modal, setModal] = React.useState(false);
  const [helpMode, setHelpMode] = React.useState(false);
  const [tour, setTour] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  /* Apply theme + accent + density */
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
    applyAccent(t.accent, t.dark);
  }, [t.dark, t.accent]);
  React.useEffect(() => {
    const d = DENSITY[t.density] || DENSITY.regular;
    document.documentElement.style.setProperty("--pad", d.pad);
    document.documentElement.style.setProperty("--row-h", d.row);
  }, [t.density]);
  React.useEffect(() => {
    document.body.classList.toggle("help-mode", helpMode);
  }, [helpMode]);

  /* First-visit tour */
  React.useEffect(() => {
    const seen = localStorage.getItem("gastos_tour_seen");
    if (!seen) {
      const tm = setTimeout(() => setTour(true), 700);
      return () => clearTimeout(tm);
    }
  }, []);
  const closeTour = () => {
    setTour(false);
    localStorage.setItem("gastos_tour_seen", "1");
  };

  /* Derived figures */
  const byCat = React.useMemo(() => {
    const m = {};
    txns.forEach(tx => { m[tx.cat] = (m[tx.cat] || 0) + tx.amount; });
    return m;
  }, [txns]);
  const totalSpent = React.useMemo(() => txns.reduce((s, x) => s + x.amount, 0), [txns]);
  const totalBudget = Object.values(BUDGETS).reduce((a, b) => a + b, 0);
  const balance = MONTHLY_INCOME - totalSpent;
  const savingsRate = Math.round((balance / MONTHLY_INCOME) * 100);

  const trend = React.useMemo(() => {
    const arr = TREND.map(x => ({ ...x }));
    arr[arr.length - 1].v = totalSpent;
    return arr;
  }, [totalSpent]);

  const overBudgetCount = CATEGORIES.filter(c => (byCat[c.id] || 0) > (BUDGETS[c.id] || 0)).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const addExpense = (data) => {
    const id = Math.max(0, ...txns.map(x => x.id)) + 1;
    setTxns([{ id, ...data }, ...txns]);
    showToast(`Gasto de €${fmt(data.amount)} guardado`);
  };

  const titles = {
    resumen: { t: "Resumen del hogar", s: "Junio 2026 · Casa de los García" },
    transacciones: { t: "Transacciones", s: "Todos los movimientos del mes" },
    presupuestos: { t: "Presupuestos", s: "Topes mensuales por categoría" },
    compartidos: { t: "Compartidos", s: "Reparto de cuentas entre miembros" },
    metas: { t: "Metas de ahorro", s: "Objetivos del hogar" },
    reportes: { t: "Reportes", s: "Análisis y exportación" },
    ajustes: { t: "Ajustes", s: "Hogar, miembros y preferencias" },
  };
  const pg = titles[view] || titles.resumen;

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} overBudgetCount={overBudgetCount} />

      <div className="main">
        <TopBar
          title={pg.t} sub={pg.s}
          month={`${MONTHS[monthIdx]} 2026`}
          onPrevMonth={() => setMonthIdx(i => Math.max(0, i - 1))}
          onNextMonth={() => setMonthIdx(i => Math.min(11, i + 1))}
          helpMode={helpMode} setHelpMode={setHelpMode}
          onAdd={() => setModal(true)}
          dark={t.dark} toggleDark={() => setTweak("dark", !t.dark)}
        />

        <div className="content">
          {view === "resumen" && (
            <div className="content-inner">
              <div className="grid stat-grid" style={{ marginBottom: 16 }}>
                <Stat label="Balance del mes" value={fmt0(balance)} tint="var(--primary)" icon={Icons.wallet}
                  delta={`${savingsRate}% de ingresos`} deltaDir={balance >= 0 ? "down" : "up"} tip="balance" />
                <Stat label="Gastado" value={fmt0(totalSpent)} tint="var(--cat-comida)" icon={Icons.cart}
                  delta="vs. €3.050 en mayo" deltaDir={totalSpent > 3050 ? "up" : "down"} tip="gastado" />
                <Stat label="Presupuesto" value={fmt0(totalBudget)} tint="var(--blue)" icon={Icons.target}
                  sub={`€${fmt0(totalBudget - totalSpent)} disponibles`} tip="presupuesto" />
                <Stat label="Ahorro" value={fmt0(Math.max(balance, 0))} tint="var(--cat-ocio)" icon={Icons.sparkle}
                  delta={balance >= 0 ? "vas por buen camino" : "en negativo"} deltaDir={balance >= 0 ? "down" : "up"} tip="ahorro" />
              </div>

              <div className="grid main-grid">
                <div className="grid">
                  <TrendChart trend={trend} />
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
          {view === "presupuestos" && <BudgetsView byCat={byCat} />}
          {view === "compartidos" && (
            <div className="content-inner fade-up" style={{ maxWidth: 560 }}>
              <SharedSettle txns={txns} />
            </div>
          )}
          {view === "metas" && <ComingSoon icon={Icons.target} title="Metas de ahorro"
            desc="Define objetivos como “fondo de emergencia” o “vacaciones” y sigue el progreso del hogar mes a mes. Próximamente." />}
          {view === "reportes" && <ComingSoon icon={Icons.chart} title="Reportes y exportación"
            desc="Genera informes mensuales o anuales y expórtalos a PDF o CSV para tu contabilidad. Próximamente." />}
          {view === "ajustes" && (
            <div className="content-inner fade-up" style={{ maxWidth: 560 }}>
              <div className="card card-pad">
                <div className="card-title" style={{ marginBottom: 16 }}>Preferencias</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Volver a ver la guía</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Repite el tour de bienvenida paso a paso.</div>
                  </div>
                  <button className="btn btn-ghost" onClick={() => setTour(true)}>
                    {React.cloneElement(Icons.sparkle, { size: 15 })} Iniciar guía
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Modo ayuda</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Muestra pistas “?” al pasar el ratón.</div>
                  </div>
                  <button className={"btn " + (helpMode ? "btn-primary" : "btn-ghost")} onClick={() => setHelpMode(h => !h)}>
                    {helpMode ? "Activado" : "Activar"}
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
        {toast && <>{React.cloneElement(Icons.check, { size: 16 })}{toast}</>}
      </div>

      <TweaksPanel>
        <TweakSection label="Tema" />
        <TweakToggle label="Modo oscuro" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakColor label="Color de acento" value={t.accent}
          options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Disposición" />
        <TweakRadio label="Densidad" value={t.density}
          options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
