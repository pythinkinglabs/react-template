import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import Intervencoes from "./pages/Intervencoes";
import Configuracoes from "./pages/Configuracoes";
import Turmas from "./pages/Turmas";
import Alunos from "./pages/Alunos";
import Notificacoes from "./pages/Notificacoes";
import Registro from "./pages/Registro";
import ResumoFinal from "./pages/ResumoFinal";
import Avaliacoes from "./pages/Avaliacoes";
import EstrategiasPedagogicas from "./pages/EstrategiasPedagogicas";
import PlanoAulas from "./pages/PlanoAulas";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/alunos" element={<Alunos />} />
        <Route path="/avaliacoes" element={<Avaliacoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estrategias-pedagogicas" element={<EstrategiasPedagogicas />} />
        <Route path="/intervencoes" element={<Intervencoes />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/plano-aulas" element={<PlanoAulas />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/relatorios" element={<Relatorios />} />        
        <Route path="/resumo-final" element={<ResumoFinal />} />
        <Route path="/turmas" element={<Turmas />} />                                                        
      </Routes>
    </Router>
  );
};

export default AppRouter;
