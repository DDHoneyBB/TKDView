import React, { useState, useEffect } from 'react';
import './form.css';
import { useNavigate } from "react-router-dom";
import QRCodeViewer from "./components/QRCodeViewer";

export default function Registro() {
  const [rol, setRol] = useState('');
  const [quiereCompetir, setQuiereCompetir] = useState(false);
  const [saludar, setSaludar] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [historialQR, setHistorialQR] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const navigate = useNavigate();

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [fotoSubida, setFotoSubida] = useState(false);
  const [instructoresDisponibles, setInstructoresDisponibles] = useState([]);
  const [todosInstructores, setTodosInstructores] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    edad: '',
    peso: '',
    genero: '',
    graduacion: '',
    altura: '',
    categoria: '',
    instructor: '', 
    escuela: '',
    modalidad: '',
    logoEscuela: '',
  });

  useEffect(() => {
    fetch('/api/escuelas')
      .then(res => res.json())
      .then(data => setEscuelas(data))
      .catch(err => console.error('Error cargando escuelas:', err));
  }, []);
  useEffect(() => {
  fetch('/api/escuelas/instructores')
    .then(res => res.json())
    .then(data => setTodosInstructores(data))
    .catch(err => console.error('Error cargando instructores:', err));
}, []);


  useEffect(() => {
    const edadNum = parseInt(formData.edad, 10);
    if (!isNaN(edadNum)) {
      if (edadNum >= 5 && edadNum <= 13) setFormData(d => ({ ...d, categoria: 'Infantil' }));
      else if (edadNum >= 14 && edadNum <= 17) setFormData(d => ({ ...d, categoria: 'Juvenil' }));
      else if (edadNum >= 18 && edadNum <= 34) setFormData(d => ({ ...d, categoria: 'Adultos' }));
      else if (edadNum >= 35 && edadNum <= 59) setFormData(d => ({ ...d, categoria: 'Veteranos' }));
      else setFormData(d => ({ ...d, categoria: '' }));
    }
  }, [formData.edad]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'quiereCompetir') setQuiereCompetir(checked);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'escuela') {
  const escuelaSeleccionada = escuelas.find(e => e.nombre === value);

  if (escuelaSeleccionada) {
    // 🔹 Logo de la escuela seleccionada
   const logoUrl = escuelaSeleccionada?.logo || "";


    // 🔹 Filtrar instructores de esa escuela
    const instructoresDeEsaEscuela = todosInstructores.filter(
      inst => inst.escuela?.trim().toLowerCase() === value.trim().toLowerCase()
    );

   setFormData(prev => ({
   ...prev,
   escuela: value,
  logoEscuela: escuelaSeleccionada.logo,
  instructor: '' // resetea la selección anterior
  }));

setInstructoresDisponibles(instructoresDeEsaEscuela);

  } else {
    setInstructoresDisponibles([]);
    setFormData(prev => ({
      ...prev,
      escuela: '',
      logoEscuela: '',
      instructor: ''
    }));
        }
      }
    }
  };

  const handleRolChange = e => {
    setRol(e.target.value);
    setQuiereCompetir(false);
  };
  
const handleSubmit = async e => {
  e.preventDefault();

  try {
    let endpoint;
    let data = { ...formData };

    // 🔹 Registro de invitados (espectadores)
if (rol === "espectador") {
   const res = await fetch("/register/espectador", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: formData.nombre, dni: formData.dni })
  });

  const result = await res.json();

  if (!res.ok) {
    alert(result.error || "Error al registrase");
    return;
  }

  alert("✅ registrado correctamente");

  setSaludar(true);
  setShowToast(true);
  setHistorialQR(prev => [
    ...prev,
    {
      nombre: formData.nombre,
      dni: formData.dni,
      categoria: "Invitado",
      dorsal: null,
      escuela: null,
      modalidad: null,
      rol: rol,
      logoEscuela: null
    }
  ]);

  return; 
}


    if (rol === 'Coach') {
      if (quiereCompetir) {
        // 🔹 CORREGIDO: Usar endpoint específico para coach-competidor
        endpoint = "/register/coach-competidor";
        
        // Validar campos requeridos para competencia
        if (!formData.modalidad) {
          alert("Debe seleccionar una modalidad para competir");
          return;
        }
      } else {
        // 🔹 CORREGIDO: Usar endpoint para coach normal
        endpoint = "/register/coach";
      }

      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        formDataToSend.append(key, data[key]);
      });

      if (imagen) {
        formDataToSend.append('fotoPerfil', imagen);
      }

      formDataToSend.append('rol', rol);
      formDataToSend.append('quiereCompetir', quiereCompetir);

      console.log("➡️ Enviando coach al endpoint:", endpoint);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Error al registrar coach');
        return;
      }

      // Mostrar mensaje informativo
      if (!quiereCompetir && imagen) {
        alert(`Coach registrado exitosamente. La foto se usará para la credencial y luego se eliminará automáticamente.`);
      } else if (quiereCompetir) {
        alert(`Coach-competidor registrado exitosamente${result.dorsal ? ` - Dorsal: ${result.dorsal}` : ''}`);
      } else {
        alert(`Coach registrado exitosamente`);
      }

      setSaludar(true);
      setShowToast(true);
      setHistorialQR(prev => [
        ...prev,
        {
          nombre: formData.nombre,
          dni: formData.dni,
          categoria: formData.categoria,
          dorsal: result.dorsal || null,
          escuela: formData.escuela,
          modalidad: formData.modalidad,
          rol: rol,
          quiereCompetir: quiereCompetir,
          logoEscuela: formData.logoEscuela,
        }
      ]);

    } else {
      // 🔹 CORREGIDO: Lógica para otros roles (competidor normal)
      const endpoints = [];
      if (formData.modalidad === "ambos") {
        endpoints.push("/register/combate");
        endpoints.push("/register/forma");
      } else if (formData.modalidad === "combate") {
        endpoints.push("/register/combate");
      } else if (formData.modalidad === "forma") {
        endpoints.push("/register/forma");
      }

      let dorsalAsignado = null;

      for (const endpoint of endpoints) {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          formDataToSend.append(key, formData[key]);
        });

        if (imagen) {
          formDataToSend.append('fotoPerfil', imagen);
        }

        formDataToSend.append('rol', rol);
        formDataToSend.append('quiereCompetir', quiereCompetir);

        const res = await fetch(endpoint, {
          method: 'POST',
          body: formDataToSend
        });

        const result = await res.json();

        if (!res.ok) {
          alert(result.error || 'Error al registrar');
          return;
        }

        if (result.dorsal) {
          dorsalAsignado = result.dorsal;
        }
      }

      if (dorsalAsignado) {
        alert(`Dorsal asignado: ${dorsalAsignado}`);
      }

      setSaludar(true);
      setShowToast(true);
      setHistorialQR(prev => [
        ...prev,
        {
          nombre: formData.nombre,
          dni: formData.dni,
          categoria: formData.categoria,
          dorsal: dorsalAsignado,
          escuela: formData.escuela,
          modalidad: formData.modalidad,
          rol: rol,
          quiereCompetir: quiereCompetir,
          logoEscuela: formData.logoEscuela,
        }
      ]);
    }

    setTimeout(() => {
      setShowToast(false);
    }, 3000);

  } catch (error) {
    alert('Error al registrar');
  }
};

  const handleImagenSeleccionada = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setFotoSubida(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const mostrarCamposCompetidor = rol === 'competidor' || ((rol === 'Coach') && quiereCompetir);

  const handleNuevaInscripcion = () => {
    setSaludar(false);
    setShowToast(false);
    setRol('');
    setQuiereCompetir(false);
    setFormData({
      nombre: '',
      dni: '',
      edad: '',
      peso: '',
      genero: '',
      graduacion: '',
      altura: '',
      categoria: '',
      instructor: '',
      escuela: '',
      modalidad: '',
      logoEscuela: '',
      fotoPerfil: '',
    });
  };

  return (
    <main>
      <section>
        <div className="form-container">
          <h1 className="form-title">Registro de Usuario</h1>
          {showToast && (
            <div
              style={{
                position: "fixed",
                top: 30,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#4caf50",
                color: "#fff",
                padding: "16px 32px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 9999,
                fontWeight: "bold",
                fontSize: "3.1em",
                transition: "opacity 0.3s"
              }}
            >
              ¡Registro exitoso!
            </div>
          )}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-rol">
          <label className="form-label">Seleccione su rol:</label>
          <div className="role-buttons-container">
            {[
              { value: 'competidor', label: 'Competidor' },
              { value: 'Coach', label: 'Coach' },
              { value: 'espectador', label: 'Familiares y Acompañantes' },
            ].map(role => (
              <button
                key={role.value}
                type="button"
                className={`role-button ${rol === role.value ? 'role-selected' : ''}`}
                onClick={() => {
                  setRol(role.value);
                  setQuiereCompetir(false);
                }}
                disabled={saludar}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

           {rol && !saludar && (
  <>
    {(rol === 'Coach') && (
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="quiereCompetir"
            checked={quiereCompetir}
            onChange={handleChange}
          />
          ¿Desea competir además de su rol?
        </label>
        {rol === 'Coach' && !quiereCompetir && (
          <div style={{ 
            fontSize: '0.8em', 
            color: '#666', 
            marginTop: '5px',
            backgroundColor: '#fff3cd',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            ⓘ Nota: Si solo se registra como Coach (sin competir), la foto se usará para la credencial y luego se eliminará automáticamente.
          </div>
        )}
      </div>
    )}
    
    <div className="form-group">
      <input
        placeholder='Nombre'
        className="form-control"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange} 
        required
      />

      <input
        placeholder='DNI'
        className="form-control"
        name="dni"
        value={formData.dni}
        onChange={handleChange}
        required
        pattern="^\d{7,8}$"
        title="El DNI debe contener 7 u 8 números"
      />
    </div>

    {mostrarCamposCompetidor && (
      <>
        <div className="form-group">
          <input
            placeholder='Edad'
            className="form-control"
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            min="1"
            required
          />

          <select className="form-select" name="categoria" value={formData.categoria} onChange={handleChange} required disabled>
            <option value="">Categoria(Seleccion automatica)</option>
            <option value="Infantil">Infantil</option>
            <option value="Juvenil">Juvenil</option>
            <option value="Adultos">Adultos</option>
            <option value="Veteranos">Veteranos</option>
            <option value="instructor">Instructor</option>
            <option value="Coach">Coach</option>
          </select>
        </div>

        {/* 🔹 Campo Escuela movido aquí */}
        {rol !== 'espectador' && (
          <div className='input-escuela form-group'>
            <label className="form-label">Escuela</label>
            <select
              className='form-select'
              name="escuela"
              value={formData.escuela}
              onChange={handleChange}
              required={rol !== 'espectador'}
            >
              <option value="">Seleccione una Escuela</option>
              {escuelas.map(esc => (
                <option key={esc.id} value={esc.nombre}>{esc.nombre}</option>
              ))}
            </select>

            {formData.logoEscuela && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <img
                  src={formData.logoEscuela}
                  alt="Logo Escuela"
                  style={{ maxHeight: 100, maxWidth: 150, objectFit: 'contain' }}
                  onError={e => e.currentTarget.style.display = 'none'}
                />
              </div>
            )}
          </div>
        )}

        <div className="form-group">
  <label className="form-label">Instructor</label>
  {instructoresDisponibles.length > 0 ? (
    <select
      className="form-select"
      name="instructor"
      value={formData.instructor}
      onChange={handleChange}
      required
    >
      <option value="">Seleccione un instructor</option>
      {instructoresDisponibles.map((inst, idx) => (
        <option key={idx} value={inst.nombre}>
          {inst.nombre}
        </option>
      ))}
    </select>
  ) : (
    <input
      placeholder="Sin instructores disponibles"
      className="form-control"
      type="text"
      name="instructor"
      value={formData.instructor}
      disabled
    />
  )}
</div>

        <div className="form-group">
          <input
            placeholder='Peso(Kg)'
            className="form-control"
            type="number"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
          />

          <select className="form-select" name="genero" value={formData.genero} onChange={handleChange} required>
            <option value="">Género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div className="form-group">
          <select className="form-select" name="graduacion" value={formData.graduacion} onChange={handleChange} required>
            <option value="">Cinturón</option>
            <option value="Blanco">Blanco</option>
            <option value="Blanco punta Amarilla">Blanco punta Amarilla</option>
            <option value="Amarillo">Amarillo</option>
            <option value="Amarillo punta verde">Amarillo punta verde</option>
            <option value="Verde">Verde</option>
            <option value="Verde punta azul">Verde punta azul</option>
            <option value="Azul">Azul</option>
            <option value="Azul punta roja">Azul punta roja</option>
            <option value="Rojo">Rojo</option>
            <option value="Rojo punta negra">Rojo punta negra</option>
            <option value="Negro I Dan">Negro I Dan</option>
            <option value="Negro II Dan">Negro II Dan</option>
            <option value="Negro III Dan">Negro III Dan</option>
             <option value="Negro III Dan">Negro IV Dan</option>
              <option value="Negro III Dan">Negro V Dan</option>
            <option value="Negro VI Dan">Negro VI Dan</option>
          </select>

          <input
            placeholder='Altura(cm)'
            className="form-control"
            type="number"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-m-e">
          <label className="form-label">Modalidad</label>
          <select className="form-select" name="modalidad" value={formData.modalidad} onChange={handleChange} required>
            <option value="">Seleccione una Modalidad</option>
            <option value="combate">Combate</option>
            <option value="forma">Formas</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
      </>
    )}

                {/* Solo mostrar foto si NO es invitado */}
                {rol && rol !== 'espectador' && (
                  <div className="form-group">
                    <label className="form-label">Foto de perfil:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenSeleccionada}
                      className="form-control"
                      disabled={saludar}
                    />
                    {imagenPreview && (
                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <img
                          src={imagenPreview}
                          alt="Vista previa"
                          style={{
                            maxHeight: '100px',
                            maxWidth: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}


              </>
            )}
              {!saludar && (
                  <button className="btn-primary" type="submit">Registrar</button>
                )}
          </form>

          {saludar && (
            <>
            <QRCodeViewer
              nombre={formData.nombre}
              dni={formData.dni}
              categoria={formData.categoria}
              dorsal={historialQR[historialQR.length - 1]?.dorsal}  // 🔹 aquí
              escuela={formData.escuela}
              modalidad={formData.modalidad}
              rol={rol}
              quiereCompetir={quiereCompetir}
              foto={imagenPreview}
              logoEscuela={formData.logoEscuela}
              allowDownload
              allowPrint
              ocultarFoto={rol === 'espectador' || rol === 'invitado'}
              />
               
               
              <button
                className="btn-secondary"
                style={{ marginTop: '10px' }}
                onClick={handleNuevaInscripcion}
              >
                Nueva inscripción
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
} 