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
  const [allCompetitors, setAllCompetitors] = useState([]); // Nuevo estado para todos los competidores
  const [filteredCompetitors, setFilteredCompetitors] = useState([]); // Competidores filtrados

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
    fetchAllCompetitors(); // Cargar competidores al inicializar
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
    console.log('Competidor seleccionado:', competitor);
    // Aquí puedes hacer lo que necesites con el competidor seleccionado
    // Por ejemplo, mostrar detalles, asignar a un combate, etc.
    
    // Limpiar búsqueda después de seleccionar
    setSearchTerm('');
    setFilteredCompetitors([]);
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
      {!searchTerm && (
        <>
          <div className="tatami-content">
          </div>
        </>
      )}
    </div>
  );
};

export default TatamiManager;