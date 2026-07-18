/* ============================================================
   Gastos — Modal Agregar gasto + vistas secundarias
   ============================================================ */

function AddTransactionModal({ open, onClose, onAdd }) {
  const [type, setType] = React.useState("gasto");
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [cat, setCat] = React.useState("comida");
  const [member, setMember] = React.useState("ana");
  const [recurring, setRecurring] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setType("gasto"); setTitle(""); setAmount(""); setCat("comida"); setMember("ana"); setRecurring(false);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    }
  }, [open]);

  React.useEffect(() => {
    function esc(e) { if (e.key === "Escape" && open) onClose(); }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  const isIncome = type === "ingreso";
  const valid = title.trim() && parseFloat(amount) > 0;
  const submit = () => {
    if (!valid) return;
    onAdd({
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      cat: isIncome ? "ingreso" : cat,
      member, recurring,
      date: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-label={isIncome ? "Agregar ingreso" : "Agregar gasto"}>
        <div className="modal-head">
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {isIncome ? "Agregar ingreso" : "Agregar gasto"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {isIncome ? "Se sumará al balance del mes." : "Se sumará al mes actual y al reparto del hogar."}
            </div>
          </div>
          <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Cerrar">
            {React.cloneElement(Icons.x, { size: 17 })}
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <div className="seg">
              <button className={!isIncome ? "sel" : ""} onClick={() => setType("gasto")}>Gasto</button>
              <button className={isIncome ? "sel" : ""} onClick={() => setType("ingreso")}>Ingreso</button>
            </div>
          </div>

          <div className="field">
            <label>Concepto</label>
            <input ref={inputRef} value={title} onChange={e => setTitle(e.target.value)}
              placeholder={isIncome ? "p. ej. Nómina" : "p. ej. Compra semanal"}
              onKeyDown={e => { if (e.key === "Enter") document.getElementById("amt-input").focus(); }} />
          </div>

          <div className="modal-row">
            <div className="field modal-row-amt">
              <label>Importe</label>
              <div className="amount-input">
                <span>€</span>
                <input id="amt-input" type="number" inputMode="decimal" min="0" step="0.01"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00"
                  onKeyDown={e => { if (e.key === "Enter") submit(); }} />
              </div>
            </div>
            <div className="field modal-row-payer">
              <label>{isIncome ? "Recibido por" : "Pagado por"}</label>
              <div className="member-pick">
                {MEMBERS.map(m => (
                  <button key={m.id} className={member === m.id ? "sel" : ""} onClick={() => setMember(m.id)} title={m.name}>
                    <Avatar member={m} size={34} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isIncome && (
            <div className="field">
              <label>Categoría</label>
              <div className="seg">
                {CATEGORIES.map(c => (
                  <button key={c.id} className={cat === c.id ? "sel" : ""} onClick={() => setCat(c.id)}>
                    <span style={{ color: cat === c.id ? "var(--primary)" : c.color, display: "inline-flex" }}>
                      {React.cloneElement(c.icon, { size: 15 })}
                    </span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)" }}>
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: "var(--primary)" }} />
            {isIncome ? "Es un ingreso recurrente (cada mes)" : "Es un gasto recurrente (cada mes)"}
          </label>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }} onClick={submit}>
            {React.cloneElement(Icons.check, { size: 17 })} {isIncome ? "Guardar ingreso" : "Guardar gasto"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Vista: Transacciones ---------------- */
function TransactionsView({ txns }) {
  const [filter, setFilter] = React.useState("todas");
  const list = (filter === "todas" ? txns : txns.filter(t => t.cat === filter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  return (
    <div className="content-inner fade-up">
      <div className="card card-pad">
        <div className="card-head" style={{ flexWrap: "wrap" }}>
          <div>
            <div className="card-title">Todas las transacciones</div>
            <div className="card-title-sub">{list.length} movimientos</div>
          </div>
          <div className="seg" style={{ marginLeft: "auto" }}>
            <button className={filter === "todas" ? "sel" : ""} onClick={() => setFilter("todas")}>Todas</button>
            {CATEGORIES.filter(c => txns.some(t => t.cat === c.id)).map(c => (
              <button key={c.id} className={filter === c.id ? "sel" : ""} onClick={() => setFilter(c.id)}>
                <span style={{ color: c.color, display: "inline-flex" }}>{React.cloneElement(c.icon, { size: 14 })}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {list.map(tx => <TxRow key={tx.id} tx={tx} />)}
        {list.length === 0 && <div className="empty-hint">No hay gastos en esta categoría.</div>}
      </div>
    </div>
  );
}

/* ---------------- Vista: Presupuestos ---------------- */
function BudgetsView({ byCat }) {
  return (
    <div className="content-inner fade-up">
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {CATEGORIES.map(c => {
          const spent = byCat[c.id] || 0;
          const budget = BUDGETS[c.id] || 0;
          const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
          const over = spent > budget;
          return (
            <div className="card card-pad" key={c.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                <span className="tx-ico" style={{ background: `color-mix(in oklab, ${c.color} 15%, transparent)`, color: c.color, width: 38, height: 38 }}>
                  {React.cloneElement(c.icon, { size: 18 })}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }} className="mono">€{fmt0(spent)} de €{fmt0(budget)}</div>
                </div>
                <span className="chip" style={{ marginLeft: "auto", background: over ? "var(--neg-soft)" : "var(--surface-2)", color: over ? "var(--neg)" : "var(--ink-soft)", border: "none" }}>
                  {Math.round(budget ? (spent / budget) * 100 : 0)}%
                </span>
              </div>
              <div className="bar" style={{ height: 9 }}>
                <i style={{ width: pct + "%", background: over ? "var(--neg)" : c.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Vista genérica (placeholder honesto) ---------------- */
function ComingSoon({ icon, title, desc }) {
  return (
    <div className="content-inner fade-up">
      <div className="card card-pad" style={{ textAlign: "center", padding: "56px 30px" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14.5, color: "var(--muted)", maxWidth: 380, margin: "0 auto", lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

Object.assign(window, { AddTransactionModal, TransactionsView, BudgetsView, ComingSoon });
