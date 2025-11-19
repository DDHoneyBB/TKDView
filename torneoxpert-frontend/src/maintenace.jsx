// Maintenance.js
import React from 'react';
import './Maintenance.css';

const Maintenance = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon">🔧</div>
        <h1>Sitio en Mantenimiento</h1>
        <p>Estamos realizando tareas de mantenimiento para mejorar tu experiencia.</p>
        <p>Por favor, vuelve más tarde.</p>
        <p>El Registro estara disponible a partir de las 13:00</p>
        <div className="maintenance-info">
        </div>
      </div>
    </div>
  );
};

export default Maintenance;