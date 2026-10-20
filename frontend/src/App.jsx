import { useCallback, useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [formulario, setFormulario] = useState({ nombre: '', correo: '' });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [confirmarEliminacionId, setConfirmarEliminacionId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');

  const cargarUsuarios = useCallback(async () => {
    setCargandoUsuarios(true);
    setErrorUsuarios('');

    try {
      const response = await fetch(`${apiUrl}/api/usuarios`);
      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'No se pudieron consultar los usuarios.');
      }

      setUsuarios(resultado);
    } catch (requestError) {
      setErrorUsuarios(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el backend. Verifica que esté iniciado.'
          : requestError.message,
      );
    } finally {
      setCargandoUsuarios(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setError('');
    setMensaje('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const editando = usuarioEditando !== null;
      const response = await fetch(
        editando
          ? `${apiUrl}/api/usuarios/${usuarioEditando.id}`
          : `${apiUrl}/api/usuarios`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formulario),
        },
      );
      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'No se pudo guardar el usuario.');
      }

      setMensaje(editando ? 'Usuario actualizado correctamente.' : 'Usuario registrado correctamente.');
      setFormulario({ nombre: '', correo: '' });
      setUsuarioEditando(null);
      await cargarUsuarios();
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el backend. Verifica que esté iniciado en el puerto 3000.'
          : requestError.message,
      );
    } finally {
      setGuardando(false);
    }
  }

  function iniciarEdicion(usuario) {
    setUsuarioEditando(usuario);
    setFormulario({ nombre: usuario.nombre, correo: usuario.correo });
    setError('');
    setMensaje('');
    setConfirmarEliminacionId(null);
    document.getElementById('page-title')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setUsuarioEditando(null);
    setFormulario({ nombre: '', correo: '' });
    setError('');
    setMensaje('');
  }

  async function eliminarUsuario(usuario) {
    setEliminandoId(usuario.id);
    setErrorUsuarios('');
    setMensaje('');

    try {
      const response = await fetch(`${apiUrl}/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
      });
      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'No se pudo eliminar el usuario.');
      }

      if (usuarioEditando?.id === usuario.id) {
        cancelarEdicion();
      }

      setConfirmarEliminacionId(null);
      setMensaje('Usuario eliminado correctamente.');
      await cargarUsuarios();
    } catch (requestError) {
      setErrorUsuarios(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el backend. Verifica que esté iniciado.'
          : requestError.message,
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <main className="page">
      <div className="content">
        <section className="registration-card" aria-labelledby="page-title">
          <p className="eyebrow">PROYECTO INTEGRADOR · GESTIÓN DE USUARIOS</p>
          <h1 id="page-title">{usuarioEditando ? 'Actualizar usuario' : 'Registro de usuario'}</h1>
          <p className="intro">
            {usuarioEditando
              ? `Edita los datos de ${usuarioEditando.nombre}.`
              : 'Completa el formulario para guardar un usuario en la base de datos.'}
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Ej. Ana Pérez"
              value={formulario.nombre}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              placeholder="ana@ejemplo.com"
              value={formulario.correo}
              onChange={handleChange}
              maxLength={100}
              required
            />

            <div className="form-actions">
              <button type="submit" disabled={guardando}>
                {guardando
                  ? 'Guardando…'
                  : usuarioEditando
                    ? 'Guardar cambios'
                    : 'Registrar usuario'}
              </button>
              {usuarioEditando && (
                <button
                  className="button-secondary"
                  type="button"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="feedback" aria-live="polite">
            {error && <p className="message message-error" role="alert">{error}</p>}
            {mensaje && <p className="message message-success" role="status">{mensaje}</p>}
          </div>
        </section>

        <section className="users-card" aria-labelledby="users-title">
          <div className="users-heading">
            <div>
              <p className="eyebrow">DIRECTORIO</p>
              <h2 id="users-title">Usuarios registrados</h2>
            </div>
            <button
              className="button-refresh"
              type="button"
              onClick={cargarUsuarios}
              disabled={cargandoUsuarios}
            >
              {cargandoUsuarios ? 'Actualizando…' : 'Actualizar lista'}
            </button>
          </div>

          {errorUsuarios && <p className="message message-error" role="alert">{errorUsuarios}</p>}
          {cargandoUsuarios ? (
            <p className="empty-state">Cargando usuarios…</p>
          ) : usuarios.length === 0 ? (
            <p className="empty-state">Todavía no hay usuarios registrados.</p>
          ) : (
            <ul className="user-list">
              {usuarios.map((usuario) => (
                <li className="user-row" key={usuario.id}>
                  <div className="user-details">
                    <span className="user-avatar" aria-hidden="true">
                      {usuario.nombre.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="user-copy">
                      <strong>{usuario.nombre}</strong>
                      <span>{usuario.correo}</span>
                      <small>ID {usuario.id}</small>
                    </div>
                  </div>
                  <div className="user-actions">
                    {confirmarEliminacionId === usuario.id ? (
                      <>
                        <span className="confirm-label">¿Eliminar?</span>
                        <button
                          className="button-delete"
                          type="button"
                          onClick={() => eliminarUsuario(usuario)}
                          disabled={eliminandoId === usuario.id}
                        >
                          {eliminandoId === usuario.id ? 'Eliminando…' : 'Sí, eliminar'}
                        </button>
                        <button
                          className="button-secondary button-small"
                          type="button"
                          onClick={() => setConfirmarEliminacionId(null)}
                          disabled={eliminandoId === usuario.id}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button-edit"
                          type="button"
                          onClick={() => iniciarEdicion(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          className="button-delete"
                          type="button"
                          onClick={() => setConfirmarEliminacionId(usuario.id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="footer-note">React · Express · MySQL</p>
      </div>
    </main>
  );
}

export default App;
