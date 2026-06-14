/* ============================================================
   Gastos — Ayuda contextual: tooltips + tour guiado
   ============================================================ */

const TIP_CONTENT = {
  agregar:     { h: "Agregar un gasto", b: "Registra cualquier gasto del hogar en segundos. Elige categoría, quién pagó y si es recurrente." },
  mes:         { h: "Cambiar de mes", b: "Navega entre meses para revisar gastos pasados o planificar el siguiente." },
  buscar:      { h: "Buscar", b: "Filtra movimientos por nombre, categoría o miembro al instante." },
  miembros:    { h: "Miembros del hogar", b: "Todos los que comparten cuentas. Cada gasto se asigna a quien pagó y se reparte de forma equitativa." },
  balance:     { h: "Balance del mes", b: "Ingresos menos gastos. En verde si ahorras; en rojo si gastas de más." },
  gastado:     { h: "Total gastado", b: "Suma de todos los gastos registrados este mes por el hogar." },
  presupuesto: { h: "Presupuesto", b: "Define un tope mensual. La barra se pone roja si lo superáis entre todos." },
  ahorro:      { h: "Ahorro del mes", b: "Lo que queda sin gastar respecto a tus ingresos. La meta es mantenerlo positivo." },
  categorias:  { h: "Gasto por categoría", b: "Mira en qué se va el dinero. Las categorías con más gasto aparecen arriba." },
  tendencia:   { h: "Tendencia", b: "Compara tu gasto mes a mes para detectar subidas antes de que se descontrolen." },
  recientes:   { h: "Movimientos recientes", b: "Los últimos gastos registrados. El icono ↻ indica gastos recurrentes." },
  compartidos: { h: "Cuentas compartidas", b: "Calculamos automáticamente quién ha puesto de más y quién debe al bote común." },
};

/* ---------------- Tooltip (modo ayuda) ---------------- */
function HelpTooltips({ active }) {
  const [tip, setTip] = React.useState(null); // {h,b,x,y}
  React.useEffect(() => {
    if (!active) { setTip(null); return; }
    function onOver(e) {
      const el = e.target.closest("[data-tip]");
      if (!el) { setTip(null); return; }
      const key = el.getAttribute("data-tip");
      const c = TIP_CONTENT[key];
      if (!c) { setTip(null); return; }
      const r = el.getBoundingClientRect();
      let x = r.left + r.width / 2;
      let y = r.bottom + 12;
      setTip({ ...c, x, y, anchorBottom: r.top });
    }
    function onOut(e) {
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest("[data-tip]")) setTip(null);
    }
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [active]);

  if (!tip) return null;
  // Keep within viewport
  const vw = window.innerWidth;
  let left = tip.x, transform = "translateX(-50%)";
  if (tip.x < 150) { left = 14; transform = "none"; }
  else if (tip.x > vw - 150) { left = vw - 14; transform = "translateX(-100%)"; }
  let top = tip.y;
  const flipUp = top > window.innerHeight - 130;
  if (flipUp) top = tip.anchorBottom - 12;
  return (
    <div className={"tip show"} style={{
      left, top, transform: transform + (flipUp ? " translateY(-100%)" : ""),
    }}>
      <span className="tip-h">{tip.h}</span>
      <span>{tip.b}</span>
    </div>
  );
}

/* ---------------- Tour guiado (coachmarks) ---------------- */
const TOUR_STEPS = [
  { sel: '[data-tip="agregar"]', title: "Empieza registrando un gasto", body: "Pulsa aquí para añadir cualquier gasto del hogar. Es el corazón de la app — pruébalo cuando quieras.", place: "bottom" },
  { sel: '[data-tip="balance"]', title: "Tu situación de un vistazo", body: "Estas cuatro tarjetas resumen el mes: balance, gasto total, presupuesto y ahorro.", place: "bottom" },
  { sel: '[data-tip="categorias"]', title: "¿En qué se va el dinero?", body: "El desglose por categoría te muestra dónde podéis recortar entre todos.", place: "right" },
  { sel: '[data-tip="compartidos"]', title: "Cuentas claras", body: "Calculamos automáticamente quién debe a quién, sin discusiones a final de mes.", place: "left" },
  { sel: '[data-help-anchor="help"]', title: "Ayuda siempre a mano", body: "Activa el modo ayuda (icono ?) y pasa el ratón sobre cualquier elemento para ver una explicación. Puedes repetir este tour desde Ajustes.", place: "bottom" },
];

function Tour({ open, onClose }) {
  const [step, setStep] = React.useState(0);
  const [rect, setRect] = React.useState(null);
  const s = TOUR_STEPS[step];

  React.useEffect(() => {
    if (!open) return;
    setStep(0);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function measure() {
      const el = document.querySelector(s.sel);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12, raw: r });
    }
    measure();
    const t = setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [open, step, s]);

  if (!open) return null;

  const finish = () => { onClose(); setStep(0); };
  const next = () => { if (step < TOUR_STEPS.length - 1) setStep(step + 1); else finish(); };
  const prev = () => setStep(Math.max(0, step - 1));

  // Position popover relative to spotlight
  let popStyle = { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  if (rect) {
    const r = rect.raw;
    const place = s.place;
    if (place === "bottom") popStyle = { top: Math.min(r.bottom + 14, window.innerHeight - 200), left: Math.min(Math.max(r.left + r.width / 2 - 160, 16), window.innerWidth - 336) };
    else if (place === "right") popStyle = { top: Math.min(r.top, window.innerHeight - 200), left: Math.min(r.right + 16, window.innerWidth - 336) };
    else if (place === "left") popStyle = { top: Math.min(r.top, window.innerHeight - 200), left: Math.max(r.left - 336, 16) };
  }

  return (
    <>
      <div className="tour-backdrop" onClick={finish} />
      {rect && <div className="tour-spot" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />}
      <div className="tour-pop" style={popStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--primary)" }}>
          {React.cloneElement(Icons.sparkle, { size: 17 })}
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            Guía · {step + 1}/{TOUR_STEPS.length}
          </span>
          <button onClick={finish} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--muted)", display: "grid", placeItems: "center" }} aria-label="Cerrar">
            {React.cloneElement(Icons.x, { size: 16 })}
          </button>
        </div>
        <h4>{s.title}</h4>
        <p>{s.body}</p>
        <div className="tour-foot">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, i) => <i key={i} className={i === step ? "on" : ""} />)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && <button className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 13 }} onClick={prev}>Atrás</button>}
            <button className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 13 }} onClick={next}>
              {step < TOUR_STEPS.length - 1 ? "Siguiente" : "¡Listo!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { HelpTooltips, Tour, TIP_CONTENT });
