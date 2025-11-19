import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles/style-i.css';

export default function Inicio() {
  const sectionRef = useRef(null);
  const divCount = 50;
  const images = [
    'imagen2.png',
    'FAAT.png',
    'YUSAN.png',
  ];

  useEffect(() => {
    if (sectionRef.current) {
      const divs = sectionRef.current.querySelectorAll('.floating-div');
      
      divs.forEach((div, i) => {
        // Propiedades existentes
        div.style.setProperty('--i', i);
        div.style.setProperty('--d', Math.random() * 8);
        div.style.setProperty('--a', Math.random() * 8 + 4);
        div.style.setProperty('--hue', Math.floor(Math.random() * 360));
        div.style.setProperty('--y', Math.floor(Math.random() * 100));
        
        // Nueva propiedad: imagen aleatoria
        const randomImage = images[Math.floor(Math.random() * images.length)];
        div.style.backgroundImage = `url('${randomImage}')`;
      });
    }
  }, []);

  return (
    <div className="body-display">
      {/* Fondo animado */}
      <div className="animated-background">
        <div className="animated-background-main">
          <section className="animated-background-section" ref={sectionRef}>
            {Array.from({ length: divCount }).map((_, index) => (
              <div key={index} className="floating-div" />
            ))}
          </section>
        </div>
      </div>
      
      {/* Menú */}
      <div className="brutalist-card">
        <div className='menu'>Menu</div>
        <div className="brutalist-card__actions">
          <Link className="brutalist-card__button brutalist-card__button--mark" to="/subir-escuela"> 
            Subir Escuela e Instructor
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--read" to="/registro">
            Registro
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--mark" to="/llaves">
            Llaves Del Torneo
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--read" to="/dashboard">
            Gestor de Tatamis
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--mark" to="/visor-global">
            Visor del Torneo
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--read" to="/equipos">
            Equipos
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--read" to="/excel">
            Exporta datos
          </Link>
          <Link className="brutalist-card__button brutalist-card__button--mark" to="/dashboard-instructor">
            Panel de Instructor
         </Link>
         <Link className="brutalist-card__button brutalist-card__button--mark" to="/escanear" >
            📷 Escanear Credencial
         </Link>
         

        </div>
      </div>

    </div>
  );
}