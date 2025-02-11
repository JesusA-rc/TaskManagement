import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MoveProvider } from './context/MoveContext';
import { BrowserRouter , Routes, Route, Link, Scripts } from "react-router-dom";
import Board from "./Pages/Board/Board";
import TrackerTime from './Pages/TrackerTime_pag/TrackerTime';
import Analytics from './Pages/Analytics_pag/Analytics';
import SidebarNav from './components/SidebarNav/SidebarNav';
import SidebarHeader from './components/SidebarHeader/SidebarHeader';
import TimeDetails from './Pages/TrackerTime_pag/TimeDetails';
import RouteWatcher from './components/RouteWatcher';
import { API_BASE_URL } from '/src/config.js';

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/usuario/1`)
      .then((response) => {
        setUsuario(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener el usuario:', error);
      });
  }, []);

  return (
    <>
    <MoveProvider>
      <div className="app">
      <div className="sidebar">
          <SidebarHeader />
          <SidebarNav />
        </div>
        <div className="main-content">
        <RouteWatcher />
          <Routes>
            <Route path="/TrackerTime" element={<TrackerTime />} />
            <Route path="/board" element={<Board />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path='TimeDetails' element={<TimeDetails/>}></Route>
          </Routes>
        </div>
      </div>
      </MoveProvider>
    </>
  );


}

export default App;
