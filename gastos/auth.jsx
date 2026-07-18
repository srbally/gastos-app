/* ============================================================
   Gastos — Pantallas de autenticación y creación de tenant
   ============================================================ */

function AuthScreen() {
  const [tab, setTab] = React.useState('login');
  const [email, setEmail]         = React.useState('');
  const [password, setPassword]   = React.useState('');
  const [fullName, setFullName]   = React.useState('');
  const [loading, setLoading]     = React.useState(false);
  const [error, setError]         = React.useState(null);
  const [confirm, setConfirm]     = React.useState(false);

  const switchTab = (t) => { setTab(t); setError(null); setConfirm(false); };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error } = await _sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // el listener en App actualizará la sesión
      } else {
        const { data, error } = await _sb.auth.signUp({
          email, password,
          options: { data: { full_name: fullName.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          // Supabase tiene confirmación de email activada
          setConfirm(true);
        }
        // Si data.session existe, el listener lo captura automáticamente
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24,
    }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, justifyContent:'center' }}>
          <div className="brand-mark" style={{ width:44, height:44, borderRadius:13 }}>{Icons.wallet}</div>
          <div>
            <div className="brand-name" style={{ fontSize:22 }}>Gastos</div>
            <div className="brand-sub">Gestión del hogar</div>
          </div>
        </div>

        <div className="card" style={{ overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
            {[['login','Iniciar sesión'],['register','Crear cuenta']].map(([t,label]) => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex:1, padding:'14px 0', border:'none', background:'none', cursor:'pointer',
                fontWeight:600, fontSize:14, fontFamily:'inherit',
                color: tab === t ? 'var(--primary-ink)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                transition:'all .15s',
              }}>{label}</button>
            ))}
          </div>

          {confirm ? (
            <div style={{ padding:28, textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'var(--primary-soft)',
                color:'var(--primary)', display:'grid', placeItems:'center', margin:'0 auto 16px' }}>
                {React.cloneElement(Icons.check, { size:26 })}
              </div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Revisa tu correo</div>
              <div style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.55 }}>
                Te enviamos un enlace de confirmación a <strong>{email}</strong>.<br/>
                Confirma tu cuenta y vuelve a iniciar sesión.
              </div>
              <button className="btn btn-ghost" style={{ marginTop:20 }} onClick={() => switchTab('login')}>
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ padding:24 }}>
              {tab === 'register' && (
                <div className="field">
                  <label>Nombre completo</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Ana García" autoComplete="name" />
                </div>
              )}
              <div className="field">
                <label>Correo electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ana@ejemplo.com" required autoComplete="email" />
              </div>
              <div className="field" style={{ marginBottom: error ? 14 : 20 }}>
                <label>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
              </div>

              {error && (
                <div style={{ fontSize:13, color:'var(--neg)', background:'var(--neg-soft)',
                  padding:'10px 13px', borderRadius:8, marginBottom:14 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary"
                style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                {loading ? 'Cargando…' : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateTenantScreen({ userEmail, onCreated }) {
  const [name, setName]       = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await _sb.rpc('create_tenant', { p_name: name.trim() });
      if (error) throw error;
      onCreated(data); // UUID del nuevo tenant
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24,
    }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, justifyContent:'center' }}>
          <div className="brand-mark" style={{ width:44, height:44, borderRadius:13 }}>{Icons.wallet}</div>
          <div>
            <div className="brand-name" style={{ fontSize:22 }}>Gastos</div>
            <div className="brand-sub">Gestión del hogar</div>
          </div>
        </div>

        <div className="card card-pad">
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:21, fontWeight:800, letterSpacing:'-0.02em', marginBottom:8 }}>
              ¡Bienvenido/a! 👋
            </div>
            <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.55 }}>
              Dale un nombre a tu hogar. Será tu espacio compartido donde
              registrar y repartir gastos con tu familia o compañeros.
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre del hogar</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="p. ej. Casa García, Piso de los chicos…"
                autoFocus required />
            </div>

            {error && (
              <div style={{ fontSize:13, color:'var(--neg)', background:'var(--neg-soft)',
                padding:'10px 13px', borderRadius:8, marginBottom:14 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', opacity: name.trim() ? 1 : .5 }}
              disabled={loading || !name.trim()}>
              {loading ? 'Creando…' : 'Crear mi hogar →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', marginTop:14, fontSize:12.5, color:'var(--muted)' }}>
          Sesión como <strong>{userEmail}</strong> ·{' '}
          <button onClick={() => _sb.auth.signOut()}
            style={{ border:'none', background:'none', color:'var(--muted)',
              cursor:'pointer', fontSize:12.5, textDecoration:'underline', fontFamily:'inherit' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* Pantalla de carga genérica */
function LoadingScreen() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div className="brand-mark" style={{ width:44, height:44, borderRadius:13 }}>{Icons.wallet}</div>
        <div style={{ color:'var(--muted)', fontSize:14 }}>Cargando…</div>
      </div>
    </div>
  );
}

/* Pantalla de error (evita quedarse en "Cargando…" para siempre) */
function ErrorScreen({ error, onLogout }) {
  const msg = (error && (error.message || error.error_description || error.details)) || 'Error desconocido';
  const code = error && (error.code || error.status);
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24,
    }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div className="card card-pad" style={{ textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--neg-soft)',
            color:'var(--neg)', display:'grid', placeItems:'center', margin:'0 auto 16px' }}>
            {React.cloneElement(Icons.x, { size:26 })}
          </div>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>No se pudieron cargar los datos</div>
          <div style={{ fontSize:13.5, color:'var(--muted)', lineHeight:1.55, marginBottom:8 }}>
            La app no pudo conectarse con la base de datos. Este es el detalle técnico:
          </div>
          <div style={{ fontSize:12.5, color:'var(--neg)', background:'var(--neg-soft)',
            padding:'10px 13px', borderRadius:8, textAlign:'left', wordBreak:'break-word',
            fontFamily:'var(--font-mono)' }}>
            {code ? `[${code}] ` : ''}{msg}
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20 }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reintentar
            </button>
            <button className="btn btn-ghost" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, CreateTenantScreen, LoadingScreen, ErrorScreen });
