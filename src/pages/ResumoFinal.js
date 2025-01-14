import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


const ResumoFinal = () => {
  const [dadosResumo, setDadosResumo] = useState([]);
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
    { name: "Intervenções", path: "/intervencoes" },
  ];

  // Carregar dados do Firestore
  const carregarDados = async () => {
    const querySnapshot = await getDocs(collection(db, "resumoFinal"));
    const dadosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDadosResumo(dadosCarregados);
  };

  // Exportar para Excel
  const exportarExcel = () => {
    const dadosParaExportar = dadosResumo.map((item) => ({
      Aluno: item.aluno,
      Frequência: `${item.frequencia}%`,
      "Carga Horária": `${item.cargaHoraria}h`,
      Nota: item.nota,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ResumoFinal");
    XLSX.writeFile(wb, "ResumoFinal.xlsx");
  };

  // Exportar para PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Resumo Final", 20, 10);
    doc.autoTable({
      head: [["Aluno", "Frequência", "Carga Horária", "Nota"]],
      body: dadosResumo.map((item) => [
        item.aluno,
        `${item.frequencia}%`,
        `${item.cargaHoraria}h`,
        item.nota,
      ]),
    });
    doc.save("ResumoFinal.pdf");
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      {/* Cabeçalho */}
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
        >
            Voltar
        </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Gestão Escolar
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menu Lateral */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 240 }}>
          {pages.map((page) => (
            <ListItem button key={page.name} onClick={() => navigate(page.path)}>
              <ListItemText primary={page.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resumo Final
        </Typography>

        {/* Botões de Exportação */}
        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
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
                <TableCell>Aluno</TableCell>
                <TableCell>Frequência</TableCell>
                <TableCell>Carga Horária</TableCell>
                <TableCell>Nota</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosResumo.map((resumo) => (
                <TableRow key={resumo.id}>
                  <TableCell>{resumo.aluno}</TableCell>
                  <TableCell>{`${resumo.frequencia}%`}</TableCell>
                  <TableCell>{`${resumo.cargaHoraria}h`}</TableCell>
                  <TableCell>{resumo.nota}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ResumoFinal;
