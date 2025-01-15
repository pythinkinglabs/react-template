import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const Relatorios = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState("frequencia");
  const [dados, setDados] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turmaId: "", aluno: "", data: "" });
  const navigate = useNavigate();

  const tiposRelatorios = [
    { value: "frequencia", label: "Frequência" },
    { value: "turmas", label: "Turmas" },
    { value: "alunos", label: "Alunos" },
    { value: "planos", label: "Planos de Aula" },
  ];

  const carregarDados = async () => {
    let collectionName = tipoRelatorio;
    if (tipoRelatorio === "planos") collectionName = "planosAulas";

    const querySnapshot = await getDocs(collection(db, collectionName));
    const dadosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDados(dadosCarregados);
  };

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const aplicarFiltros = () => {
    return dados.filter((item) => {
      const matchTurma = !filtros.turmaId || item.turmaId === filtros.turmaId;
      const matchAluno =
        !filtros.aluno ||
        (item.aluno && item.aluno.toLowerCase().includes(filtros.aluno.toLowerCase()));
      const matchData = !filtros.data || item.data === filtros.data;
      return matchTurma && matchAluno && matchData;
    });
  };

  const exportarExcel = () => {
    const dadosParaExportar = aplicarFiltros().map((item) => ({
      Turma: turmas.find((turma) => turma.id === item.turmaId)?.nome || "N/A",
      Aluno: item.aluno || "N/A",
      Data: item.data || "N/A",
      Status: item.status || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, "relatorio.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório - Sistema de Gestão Escolar", 20, 10);
    doc.autoTable({
      head: [["Turma", "Aluno", "Data", "Status"]],
      body: aplicarFiltros().map((item) => [
        turmas.find((turma) => turma.id === item.turmaId)?.nome || "N/A",
        item.aluno || "N/A",
        item.data || "N/A",
        item.status || "N/A",
      ]),
    });
    doc.save("relatorio.pdf");
  };

  useEffect(() => {
    carregarDados();
    carregarTurmas();
  }, [tipoRelatorio]);

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
            Relatórios
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Relatórios
        </Typography>

        {/* Seleção de Tipo de Relatório */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            select
            label="Tipo de Relatório"
            value={tipoRelatorio}
            onChange={(e) => setTipoRelatorio(e.target.value)}
            fullWidth
          >
            {tiposRelatorios.map((tipo) => (
              <MenuItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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
          {tipoRelatorio === "frequencia" && (
            <TextField
              label="Filtrar por Aluno"
              value={filtros.aluno}
              onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
              fullWidth
            />
          )}
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
            Exportar para Excel
          </Button>
          <Button variant="contained" color="secondary" onClick={exportarPDF}>
            Exportar para PDF
          </Button>
        </Box>

        {/* Tabela de Dados */}
        <TableContainer component={Paper}>
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
              {aplicarFiltros().map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {turmas.find((turma) => turma.id === item.turmaId)?.nome || "N/A"}
                  </TableCell>
                  <TableCell>{item.aluno || "N/A"}</TableCell>
                  <TableCell>{item.data || "N/A"}</TableCell>
                  <TableCell>{item.status || "N/A"}</TableCell>
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
