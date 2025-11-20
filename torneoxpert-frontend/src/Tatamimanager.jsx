import React, { useState, useEffect, useCallback } from 'react';
import './Tatamimanager.css';

const TatamiManager = ({ initialTatamiData = null, tatamiId, onDataUpdate }) => {
  // Estados del componente
  const [tatamiData, setTatamiData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allCompetitors, setAllCompetitors] = useState([]);
  const [filteredCompetitors, setFilteredCompetitors] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  // Datos de ejemplo para demostración
  const sampleTatamiData = {
    id: tatamiId || 1,
    name: `Tatami ${tatamiId || 'Principal'}`,
    location: 'Área de competición A',
    judge: 'Maestro Rodríguez',
    matches: [
      // ... tus matches existentes ...
    ]
  };

  // Cargar todos los competidores desde la base de datos
  const fetchAllCompetitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competidores');
      if (!response.ok) {
        throw new Error('Error al cargar competidores');
      }
      const competitors = await response.json();
      setAllCompetitors(competitors);
    } catch (err) {
      console.error('Error fetching competitors:', err);
      setError('Error al cargar la lista de competidores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar datos del tatami y cargar competidores
  useEffect(() => {
    const initializeData = () => {
      setLoading(true);
      try {
        // Intentar cargar datos guardados localmente
        const savedData = localStorage.getItem(`tatami-${tatamiId}`);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setTatamiData(parsedData);
          setMatches(parsedData.matches || []);
        } else if (initialTatamiData) {
          // Usar datos proporcionados como prop
          setTatamiData(initialTatamiData);
          setMatches(initialTatamiData.matches || []);
          saveToLocalStorage(initialTatamiData);
        } else {
          // Usar datos de ejemplo
          setTatamiData(sampleTatamiData);
          setMatches(sampleTatamiData.matches);
          saveToLocalStorage(sampleTatamiData);
        }
      } catch (err) {
        setError('Error al cargar los datos del tatami');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    fetchAllCompetitors();
  }, [tatamiId, initialTatamiData, fetchAllCompetitors]);

  // Guardar datos en localStorage
  const saveToLocalStorage = useCallback((data) => {
    try {
      localStorage.setItem(`tatami-${tatamiId}`, JSON.stringify(data));
    } catch (err) {
      console.error('Error guardando en localStorage:', err);
    }
  }, [tatamiId]);

  // Manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredCompetitors([]);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = allCompetitors.filter(competitor => 
      competitor.nombre?.toLowerCase().includes(searchLower) ||
      competitor.dorsal?.toLowerCase().includes(searchLower) ||
      competitor.dni?.toLowerCase().includes(searchLower) ||
      competitor.escuela?.toLowerCase().includes(searchLower) ||
      competitor.categoria?.toLowerCase().includes(searchLower)
    );
    
    setFilteredCompetitors(filtered);
  };

  // Función para seleccionar un competidor de los resultados
  const handleSelectCompetitor = (competitor) => {
    setSelectedCompetitor(competitor);
    console.log('Competidor seleccionado:', competitor);
    // Limpiar búsqueda después de seleccionar
    setSearchTerm('');
    setFilteredCompetitors([]);
  };

  // Cerrar detalles del competidor
  const handleCloseDetails = () => {
    setSelectedCompetitor(null);
  };

  // Renderizar estado de carga
  if (loading && !searchTerm) {
    return (
      <div className="tatami-manager loading">
        <div className="loader"></div>
        <p>Cargando datos del tatami...</p>
      </div>
    );
  }

  // Renderizar estado de error
  if (error && !searchTerm) {
    return (
      <div className="tatami-manager error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tatami-manager">
      {/* Header del tatami */}
      {tatamiData && !searchTerm && !selectedCompetitor && (
        <div className="tatami-header">
          <div className="tatami-info">
            <h1>{tatamiData.name}</h1>
            <div className="tatami-details">
              <span className="location">
                <i className="fas fa-map-marker-alt"></i>
                {tatamiData.location}
              </span>
              <span className="judge">
                <i className="fas fa-user-tie"></i>
                Juez: {tatamiData.judge}
              </span>
            </div>
          </div>
          <div className="tatami-stats">
            <div className="stat">
              <span className="stat-value">{matches.length}</span>
              <span className="stat-label">Combates</span>
            </div>
            <div className="stat">
              <span className="stat-value">{allCompetitors.length}</span>
              <span className="stat-label">Competidores</span>
            </div>
          </div>
        </div>
      )}

      {/* Panel de búsqueda */}
      <div className="search-container">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, dorsal, DNI, escuela o categoría..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => {
                setSearchTerm('');
                setFilteredCompetitors([]);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {searchTerm && (
          <div className="search-results">
            {loading ? (
              <div className="search-loading">
                <div className="small-loader"></div>
                <span>Buscando competidores...</span>
              </div>
            ) : filteredCompetitors.length > 0 ? (
              <div className="competitors-list">
                <div className="search-results-header">
                  <h4>Resultados de búsqueda ({filteredCompetitors.length})</h4>
                </div>
                {filteredCompetitors.map(competitor => (
                  <div 
                    key={competitor.id} 
                    className="competitor-item"
                    onClick={() => handleSelectCompetitor(competitor)}
                  >
                    <div className="competitor-avatar">
                      {competitor.nombre ? competitor.nombre.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="competitor-info">
                      <div className="competitor-main">
                        <span className="competitor-name">{competitor.nombre}</span>
                        <span className="competitor-dorsal">Dorsal: {competitor.dorsal}</span>
                      </div>
                      <div className="competitor-details">
                        <span className="competitor-dni">DNI: {competitor.dni}</span>
                        <span className="competitor-school">Escuela: {competitor.escuela}</span>
                        <span className="competitor-category">Categoría: {competitor.categoria}</span>
                      </div>
                    </div>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No se encontraron competidores</p>
                <span>Intenta con otro término de búsqueda</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalles del competidor seleccionado */}
      {selectedCompetitor && (
        <div className="competitor-detail-panel">
          <div className="detail-header">
            <button className="back-button" onClick={handleCloseDetails}>
              <i className="fas fa-arrow-left"></i>
              Volver
            </button>
            <h2>Detalles del Competidor</h2>
          </div>
          <div className="competitor-detail-content">
            <div className="detail-avatar">
              {selectedCompetitor.nombre ? selectedCompetitor.nombre.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="detail-info">
              <h3>{selectedCompetitor.nombre}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Dorsal:</span>
                  <span className="info-value">{selectedCompetitor.dorsal}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">DNI:</span>
                  <span className="info-value">{selectedCompetitor.dni}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Escuela:</span>
                  <span className="info-value">{selectedCompetitor.escuela}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Categoría:</span>
                  <span className="info-value">{selectedCompetitor.categoria}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn-primary">
              <i className="fas fa-edit"></i>
              Editar
            </button>
            <button className="btn-secondary">
              <i className="fas fa-plus"></i>
              Asignar a Combate
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal cuando no hay búsqueda ni competidor seleccionado */}
      {!searchTerm && !selectedCompetitor && (
        <div className="tatami-content">
          <div className="content-section">
            <h2>Combates Programados</h2>
            {matches.length > 0 ? (
              <div className="matches-list">
                {matches.map((match, index) => (
                  <div key={index} className="match-card">
                    <div className="match-header">
                      <span className="match-category">{match.categoria || "Categoría General"}</span>
                      <span className="match-time">{match.hora || "Por definir"}</span>
                    </div>
                    <div className="competitors">
                      <div className="competitor competitor-1">
                        <span className="name">{match.competidor1 || "Por definir"}</span>
                        <span className="school">{match.escuela1 || "Escuela"}</span>
                      </div>
                      <div className="vs">VS</div>
                      <div className="competitor competitor-2">
                        <span className="name">{match.competidor2 || "Por definir"}</span>
                        <span className="school">{match.escuela2 || "Escuela"}</span>
                      </div>
                    </div>
                    <div className="match-status">
                      <span className={`status ${match.estado || 'pendiente'}`}>
                        {match.estado || 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-fist-raised"></i>
                <h3>No hay combates programados</h3>
                <p>Comienza asignando competidores a combates</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TatamiManager;