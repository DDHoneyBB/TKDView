import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Registro from "./Registro";
import ErrorBoundary from "./ErrorBoundary";
import Inicio from "./Inicio";
import TatamiSala from "./components/Tatamisala";
import LlavesGeneralView from "./LlavesView";
import "./app.css";
import SubirEscuela from "./SubirEscuela";
import SalaControles from "./SalaControles";
import TatamiViewUnificado from "./TatamiViewUnificado";
import TatamisDashboard from "./TatamisDashboard";
import TatamiManager from "./Tatamimanager";
import LoginInstructor from "./LoginInstructor";
import VisorGlobal from "./VisorGlobal";
import InscribirEquipo from "./InscribirEquipo";
import ListaEquipo from "./ListaEquipo";
import ExcelExport from "./excel";
import PlayerPanelPage from "./PlayerPanelPage";
import ValidarCompetidores from "./validarCompetidores";
import DashboardInstructor from "./DashboardInstructor";
import EscanearQR from "./EscanearQR";
import TestQR from "./TestQr";
import Maintenance from "./maintenace";

function ProtectedRoute({ children }) {
  const isLoggedIn = false; // cambiar si usás JWT o contexto de sesión
  return isLoggedIn ? children : <Navigate to="/mantenimiento" />;
}

function App() {
  const [medicalTime, setMedicalTime] = useState(false);

  return (
    <div>
      <Routes>
        {/* Accesibles sin login */}
        <Route path="/mantenimiento" element={<Maintenance />} />
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/subir-escuela" element={<SubirEscuela />} />
        <Route path="/login-instructor" element={<LoginInstructor />} />
        <Route path="/dashboard-instructor" element={<DashboardInstructor />} />

        {/* Protegidas */}
        <Route
          path="/inscribir-equipo"
          element={
            <ProtectedRoute>
              <InscribirEquipo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/validar-competidores"
          element={
              <ValidarCompetidores />
          }
        />

        {/* Tatamis */}
        <Route
          path="/tatami"
          element={
          <ProtectedRoute> 
            <TatamiViewUnificado
              medicalTime={medicalTime}
              setMedicalTime={setMedicalTime}
            />
          </ProtectedRoute> 
          }
        />
        <Route
          path="/tatami-manager"
          element={
            <ProtectedRoute>    
              <TatamiManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute> 
              <TatamisDashboard />
            </ProtectedRoute> 
          }
        />
        <Route
          path="/tatami-sala"
          element={
            <ProtectedRoute> 
              <TatamiSala />
            </ProtectedRoute> 
          }
        />
        <Route
          path="/sala-controles"
          element={
            <ProtectedRoute> 
              <SalaControles />
            </ProtectedRoute> 
          }
        />

        {/* Llaves y paneles */}
        <Route
          path="/llaves"
          element={
              <LlavesGeneralView />
          }
        />
        <Route
          path="/player-panel"
          element={
            <ProtectedRoute> 
              <PlayerPanelPage
                medicalTime={medicalTime}
                setMedicalTime={setMedicalTime}
              />
            </ProtectedRoute> 
          }
        />

        {/* Otros */}
        <Route
          path="/visor-global"
          element={
            <ProtectedRoute>
              <VisorGlobal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipos"
          element={
            <ProtectedRoute> 
              <ListaEquipo />
            </ProtectedRoute> 
          }
        />
        <Route
          path="/excel"
          element={
            <ProtectedRoute>
              <ExcelExport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escanear"
          element={
            <ProtectedRoute>
              <EscanearQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-qr"
          element={
            <ProtectedRoute>
              <TestQR />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<button className="btn-accept">Página no encontrada</button>}
        />
      </Routes>
    </div>
  );
}

export default App;
