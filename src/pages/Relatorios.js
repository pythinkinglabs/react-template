import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const Relatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [frequencias, setFrequencias] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turmaId: "", aluno: "", data: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const pages = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alunos", path: "/alunos" },
    { name: "Turmas", path: "/turmas" },
    { name: "Plano de Aulas", path: "/plano-aulas" },
    { name: "Avaliações", path: "/avaliacoes" },
    { name: "Relatórios", path: "/relatorios" },
    { name: "Notificações", path: "/notificacoes" },
  ];

  // Carregar dados de relatórios, frequências e turmas do Firestore
  const carregarRelatorios = async () => {
    const querySnapshot = await getDocs(collection(db, "relatorios"));
    const dadosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRelatorios(dadosCarregados);
  };

  const carregarFrequencias = async () => {
    const querySnapshot = await getDocs(collection(db, "frequencias"));
    const frequenciasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFrequencias(frequenciasCarregadas);
  };

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const aplicarFiltros = (dados) => {
    return dados.filter((item) => {
      const matchTurma = !filtros.turmaId || item.turmaId === filtros.turmaId;
      const matchAluno =
        !filtros.aluno ||
        item.aluno.toLowerCase().includes(filtros.aluno.toLowerCase());
      const matchData =
        !filtros.data || item.data.includes(filtros.data);
      return matchTurma && matchAluno && matchData;
    });
  };

  const exportarExcel = () => {
    const dadosParaExportar = aplicarFiltros(frequencias).map((item) => ({
      Turma: turmas.find((turma) => turma.id === item.turmaId)?.nome || "N/A",
      Aluno: item.aluno,
      Data: item.data,
      Status: item.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Frequências");
    XLSX.writeFile(wb, "frequencias.xlsx");
  };

  useEffect(() => {
    carregarRelatorios();
    carregarFrequencias();
    carregarTurmas();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Sistema de Gestão Escolar
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 240 }}>
          {pages.map((page) => (
            <ListItem button key={page.name} onClick={() => navigate(page.path)}>
              <ListItemText primary={page.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Relatórios e Frequências
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            select
            label="Filtrar por Turma"
            value={filtros.turmaId}
            onChange={(e) => setFiltros({ ...filtros, turmaId: e.target.value })}
            fullWidth
          >
            <MenuItem value="">Todas as Turmas</MenuItem>
            {turmas.map((turma) => (
              <MenuItem key={turma.id} value={turma.id}>
                {turma.nome}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Filtrar por Aluno"
            value={filtros.aluno}
            onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
            fullWidth
          />
          <TextField
            label="Filtrar por Data"
            type="date"
            value={filtros.data}
            onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Botões de Exportação */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={exportarExcel}>
            Exportar Frequências para Excel
          </Button>
        </Box>

        {/* Tabela de Frequências */}
        <Typography variant="h6" gutterBottom>
          Frequências
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Turma</TableCell>
                <TableCell>Aluno</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aplicarFiltros(frequencias).map((frequencia) => (
                <TableRow key={frequencia.id}>
                  <TableCell>
                    {turmas.find((turma) => turma.id === frequencia.turmaId)?.nome || "N/A"}
                  </TableCell>
                  <TableCell>{frequencia.aluno}</TableCell>
                  <TableCell>{frequencia.data}</TableCell>
                  <TableCell>{frequencia.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Relatorios;
