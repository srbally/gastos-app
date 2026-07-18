/* ============================================================
   Gastos — Componentes UI compartidos
   ============================================================ */

function Avatar({ member, size = 30, ring }) {
  const m = typeof member === "string" ? memberById(member) : member;
  return (
    <span className="av" style={{
      width: size, height: size, background: m.color,
      fontSize: size * 0.4, border: ring ? "2px solid var(--surface)" : undefined,
    }} title={m.name}>{m.initials}</span>
  );
}

/* ---------------- Sidebar ---------------- */
function Sidebar({ view, setView, overBudgetCount, tenantName }) {
  const nav = [
    { id: "resumen", label: "Resumen", icon: Icons.home },
    { id: "transacciones", label: "Transacciones", icon: Icons.list },
    { id: "presupuestos", label: "Presupuestos", icon: Icons.wallet, badge: overBudgetCount || null },
    { id: "compartidos", label: "Compartidos", icon: Icons.users },
    { id: "metas", label: "Metas de ahorro", icon: Icons.target },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">{Icons.wallet}</div>
        <div>
          <div className="brand-name">Gastos</div>
          <div className="brand-sub">{tenantName || 'Mi hogar'}</div>
        </div>
      </div>

      <div className="nav-label">Principal</div>
      {nav.map(n => (
        <button key={n.id} className={"nav-item" + (view === n.id ? " active" : "")}
          onClick={() => setView(n.id)}>
          {n.icon}
          <span>{n.label}</span>
          {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
        </button>
      ))}

      <div className="nav-label">Análisis</div>
      <button className={"nav-item" + (view === "reportes" ? " active" : "")} onClick={() => setView("reportes")}>
        {Icons.chart}<span>Reportes</span>
      </button>
      <button className={"nav-item" + (view === "ajustes" ? " active" : "")} onClick={() => setView("ajustes")}>
        {Icons.settings}<span>Ajustes</span>
      </button>

      <div className="household-card" data-help-target data-tip="miembros">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>Miembros</span>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{MEMBERS.length} activos</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="avatar-stack">
            {MEMBERS.map(m => <Avatar key={m.id} member={m} ring />)}
          </div>
          <button className="icon-btn" style={{ width: 30, height: 30, borderRadius: 8 }} title="Invitar miembro">
            {React.cloneElement(Icons.plus, { size: 15 })}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- TopBar ---------------- */
function TopBar({ title, sub, month, onPrevMonth, onNextMonth, helpMode, setHelpMode, onAdd, dark, toggleDark, onLogout }) {
  return (
    <header className="topbar">
      <div style={{ flex: "0 0 auto" }}>
        <div className="page-title">{title}</div>
        {sub ? <div className="page-sub">{sub}</div> : null}
      </div>

      <div style={{ flex: 1 }} />

      <div className="search" data-help-target data-tip="buscar">
        {React.cloneElement(Icons.search, { size: 16 })}
        <input placeholder="Buscar gastos…" />
      </div>

      <div className="month-pill" data-help-target data-tip="mes">
        <button onClick={onPrevMonth} aria-label="Mes anterior">{Icons.chevL}</button>
        <span className="mlabel">{month}</span>
        <button onClick={onNextMonth} aria-label="Mes siguiente">{Icons.chevR}</button>
      </div>

      <button className="icon-btn" onClick={toggleDark} title="Cambiar tema">
        {dark ? Icons.sun : Icons.moon}
      </button>

      <button className={"icon-btn" + (helpMode ? " on" : "")} onClick={() => setHelpMode(h => !h)}
        title="Modo ayuda" data-help-anchor="help">
        {Icons.help}
      </button>

      {onLogout && (
        <button className="icon-btn" onClick={onLogout} title="Cerrar sesión">
          {Icons.logout}
        </button>
      )}

      <button className="btn btn-primary add-btn-desktop" onClick={onAdd} data-help-target data-tip="agregar">
        {React.cloneElement(Icons.plus, { size: 17 })}
        <span>Agregar</span>
      </button>
    </header>
  );
}

/* ---------------- Bottom nav (móvil) ---------------- */
function BottomNav({ view, setView, onAdd, overBudgetCount }) {
  return (
    <nav className="bottom-nav">
      <button className={"bn-item" + (view === "resumen" ? " active" : "")} onClick={() => setView("resumen")}>
        {Icons.home}<span>Resumen</span>
      </button>
      <button className={"bn-item" + (view === "transacciones" ? " active" : "")} onClick={() => setView("transacciones")}>
        {Icons.list}<span>Movs.</span>
      </button>

      <button className="bn-fab" onClick={onAdd} aria-label="Agregar gasto o ingreso"
        data-help-target data-tip="agregar-movil">
        {React.cloneElement(Icons.plus, { size: 22 })}
      </button>

      <button className={"bn-item" + (view === "presupuestos" ? " active" : "")} onClick={() => setView("presupuestos")}>
        {Icons.wallet}<span>Presup.</span>
        {overBudgetCount ? <span className="nav-badge bn-badge">{overBudgetCount}</span> : null}
      </button>
      <button className={"bn-item" + (view === "ajustes" ? " active" : "")} onClick={() => setView("ajustes")}>
        {Icons.settings}<span>Ajustes</span>
      </button>
    </nav>
  );
}

/* ---------------- Stat card ---------------- */
function Stat({ label, value, prefix = "€", delta, deltaDir, icon, tint, tip, sub }) {
  return (
    <div className="stat fade-up" data-help-target={tip ? "" : undefined} data-tip={tip}>
      <div className="ico" style={{ background: `color-mix(in oklab, ${tint} 16%, transparent)`, color: tint }}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="label">{label}</div>
      <div className="value tnum">
        {prefix && <small>{prefix}</small>}{value}
      </div>
      {delta != null && (
        <div className={"delta " + (deltaDir === "up" ? "up" : "down")}>
          {deltaDir === "up" ? Icons.arrowUp : Icons.arrowDn}
          {delta}
        </div>
      )}
      {sub && <div className="delta" style={{ color: "var(--muted)" }}>{sub}</div>}
    </div>
  );
}

/* ---------------- Category breakdown ---------------- */
function CategoryBreakdown({ byCat, total }) {
  const rows = CATEGORIES
    .map(c => ({ ...c, amount: byCat[c.id] || 0 }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="card card-pad" data-help-target data-tip="categorias">
      <div className="card-head">
        <div>
          <div className="card-title">Gasto por categoría</div>
          <div className="card-title-sub">Distribución del mes</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>€{fmt0(total)}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>total gastado</div>
        </div>
      </div>
      {rows.length === 0 && <div className="empty-hint">Sin gastos este mes todavía.</div>}
      {rows.map(c => {
        const pct = total ? (c.amount / total) * 100 : 0;
        return (
          <div className="cat-row" key={c.id}>
            <span className="cat-dot" style={{ background: c.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="cat-name">{c.name}</span>
                <span className="cat-name mono tnum">€{fmt0(c.amount)}</span>
              </div>
              <div className="bar"><i style={{ width: pct + "%", background: c.color }} /></div>
            </div>
            <span className="cat-meta tnum" style={{ width: 38, textAlign: "right" }}>{Math.round(pct)}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Trend bar chart ---------------- */
function TrendChart({ trend }) {
  const max = Math.max(...trend.map(t => t.v || 0)) * 1.12;
  return (
    <div className="card card-pad" data-help-target data-tip="tendencia">
      <div className="card-head">
        <div>
          <div className="card-title">Tendencia de gasto</div>
          <div className="card-title-sub">Últimos 6 meses</div>
        </div>
        <span className="chip" style={{ marginLeft: "auto" }}>vs. media €3.072</span>
      </div>
      <div className="chart">
        {trend.map((t, i) => {
          const h = max ? ((t.v || 0) / max) * 100 : 0;
          const now = i === trend.length - 1;
          return (
            <div className={"col" + (now ? " now" : "")} key={t.m}>
              <div style={{ fontSize: 11, fontWeight: 700, color: now ? "var(--primary)" : "var(--muted)" }} className="mono">
                {t.v ? "€" + fmt0(t.v) : "—"}
              </div>
              <div className="stack" style={{ height: h + "%" }} />
              <div className="xl">{t.m}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Transaction list ---------------- */
function TxRow({ tx }) {
  const isIncome = tx.type === "ingreso";
  const c = isIncome ? null : catById(tx.cat);
  return (
    <div className="tx">
      <span className="tx-ico" style={{
        background: `color-mix(in oklab, ${isIncome ? "var(--pos)" : c.color} 15%, transparent)`,
        color: isIncome ? "var(--pos)" : c.color,
      }}>
        {React.cloneElement(isIncome ? Icons.wallet : c.icon, { size: 19 })}
      </span>
      <div className="tx-main">
        <div className="tx-title">
          {tx.title}
          {tx.recurring && <span style={{ color: "var(--muted)", marginLeft: 7, verticalAlign: "middle", display: "inline-flex" }} title="Recurrente">{Icons.repeat}</span>}
        </div>
        <div className="tx-sub">
          <span>{isIncome ? "Ingreso" : c.name}</span>
          <span style={{ opacity: .5 }}>·</span>
          <span>{fmtDate(tx.date)}</span>
        </div>
      </div>
      <Avatar member={tx.member} size={26} />
      <div className="tx-amt mono tnum" style={{ color: isIncome ? "var(--pos)" : undefined }}>
        {isIncome ? "+" : ""}€{fmt(tx.amount)}
      </div>
    </div>
  );
}

function RecentTransactions({ txns, onViewAll, limit = 6 }) {
  const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  return (
    <div className="card card-pad" data-help-target data-tip="recientes">
      <div className="card-head">
        <div>
          <div className="card-title">Movimientos recientes</div>
          <div className="card-title-sub">{txns.length} este mes</div>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: "auto", padding: "7px 13px", fontSize: 13 }} onClick={onViewAll}>
          Ver todos
        </button>
      </div>
      <div>
        {sorted.slice(0, limit).map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}

/* ---------------- Budget mini (overall) ---------------- */
function BudgetOverall({ spent, budget }) {
  const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const over = spent > budget;
  const remain = budget - spent;
  return (
    <div className="card card-pad" data-help-target data-tip="presupuesto">
      <div className="card-head">
        <div>
          <div className="card-title">Presupuesto del mes</div>
          <div className="card-title-sub">{over ? "Te has pasado" : "Vas dentro del plan"}</div>
        </div>
        <span className="chip" style={{ marginLeft: "auto", background: over ? "var(--neg-soft)" : "var(--primary-soft)", color: over ? "var(--neg)" : "var(--primary-ink)", border: "none" }}>
          {Math.round((spent / budget) * 100)}%
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>€{fmt0(spent)}</span>
        <span style={{ color: "var(--muted)", fontSize: 14 }} className="mono">/ €{fmt0(budget)}</span>
      </div>
      <div className="bar" style={{ height: 10 }}>
        <i style={{ width: pct + "%", background: over ? "var(--neg)" : "var(--primary)" }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: over ? "var(--neg)" : "var(--ink-soft)", fontWeight: 600 }}>
        {over
          ? <>Has superado el presupuesto en <span className="mono">€{fmt0(Math.abs(remain))}</span></>
          : <>Te quedan <span className="mono">€{fmt0(remain)}</span> disponibles</>}
      </div>
    </div>
  );
}

/* ---------------- Who owes who ---------------- */
function SharedSettle({ txns }) {
  // Each expense split equally; compute net balance per member.
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const share = total / MEMBERS.length;
  const paid = {};
  MEMBERS.forEach(m => paid[m.id] = 0);
  txns.forEach(t => { paid[t.member] = (paid[t.member] || 0) + t.amount; });
  const balances = MEMBERS.map(m => ({ ...m, net: paid[m.id] - share }));

  return (
    <div className="card card-pad" data-help-target data-tip="compartidos">
      <div className="card-head">
        <div>
          <div className="card-title">Cuentas compartidas</div>
          <div className="card-title-sub">Reparto equitativo del mes</div>
        </div>
        <span className="chip" style={{ marginLeft: "auto" }}>÷ {MEMBERS.length}</span>
      </div>
      {balances.map(m => (
        <div className="settle-row" key={m.id}>
          <Avatar member={m} size={28} />
          <span style={{ fontWeight: 600 }}>{m.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 700 }} className={"mono tnum"}>
            <span style={{ color: m.net >= 0 ? "var(--pos)" : "var(--neg)" }}>
              {m.net >= 0 ? "+" : "−"}€{fmt0(Math.abs(m.net))}
            </span>
          </span>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
        En verde, a quién le deben; en rojo, quién debe poner al bote común.
      </div>
    </div>
  );
}

Object.assign(window, {
  Avatar, Sidebar, TopBar, BottomNav, Stat, CategoryBreakdown, TrendChart,
  TxRow, RecentTransactions, BudgetOverall, SharedSettle,
});
