import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  TextField,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ResumoFinal = () => {
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turmaId: "", periodo: "", aluno: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar dados das coleções
      const turmasSnapshot = await getDocs(collection(db, "turmas"));
      const alunosSnapshot = await getDocs(collection(db, "alunos"));
      const frequenciasSnapshot = await getDocs(collection(db, "frequencias"));
      const avaliacoesSnapshot = await getDocs(collection(db, "avaliacoes"));
      const estrategiasSnapshot = await getDocs(collection(db, "estrategias"));

      // Mapear dados
      const turmasData = turmasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const alunosData = alunosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const frequenciasData = frequenciasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const avaliacoesData = avaliacoesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const estrategiasData = estrategiasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Consolidar os dados
      const consolidated = alunosData.map((aluno) => {
        const turma = turmasData.find((turma) => turma.id === aluno.turmaId) || {};
        const alunoFrequencias = frequenciasData.filter((f) => f.alunoId === aluno.id);
        const alunoAvaliacoes = avaliacoesData.filter((a) => a.alunoId === aluno.id);
        const alunoEstrategias = estrategiasData.filter((e) => e.alunoId === aluno.id);

        const frequenciaMedia = alunoFrequencias.length
          ? (alunoFrequencias.filter((f) => f.status === "Presente").length / alunoFrequencias.length) * 100
          : 0;
        const notaMedia = alunoAvaliacoes.length
          ? alunoAvaliacoes.reduce((sum, a) => sum + a.nota, 0) / alunoAvaliacoes.length
          : 0;

        return {
          aluno: aluno.nome,
          turma: turma.nome || "N/A",
          frequencia: frequenciaMedia.toFixed(2),
          nota: notaMedia.toFixed(2),
          estrategias: alunoEstrategias.length,
        };
      });

      setTurmas(turmasData);
      setConsolidatedData(consolidated);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const aplicarFiltros = () => {
    return consolidatedData.filter((item) => {
      const matchTurma = !filtros.turmaId || item.turma === turmas.find((t) => t.id === filtros.turmaId)?.nome;
      const matchAluno = !filtros.aluno || item.aluno.toLowerCase().includes(filtros.aluno.toLowerCase());
      const matchPeriodo = !filtros.periodo || true; // Período não está sendo usado diretamente
      return matchTurma && matchAluno && matchPeriodo;
    });
  };

  const exportarExcel = () => {
    const dadosParaExportar = aplicarFiltros().map((item) => ({
      Aluno: item.aluno,
      Turma: item.turma,
      Frequência: `${item.frequencia}%`,
      Nota: item.nota,
      "Estratégias Aplicadas": item.estrategias,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumo Final");
    XLSX.writeFile(wb, "ResumoFinal.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Resumo Final", 20, 10);
    doc.autoTable({
      head: [["Aluno", "Turma", "Frequência", "Nota", "Estratégias Aplicadas"]],
      body: aplicarFiltros().map((item) => [
        item.aluno,
        item.turma,
        `${item.frequencia}%`,
        item.nota,
        item.estrategias,
      ]),
    });
    doc.save("ResumoFinal.pdf");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      <AppBar position="static" sx={{ boxShadow: 1 }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Resumo Final
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          mt: 4,
          mx: "auto",
          maxWidth: "1200px",
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            select
            label="Selecione a Turma"
            fullWidth
            value={filtros.turmaId}
            onChange={(e) => setFiltros({ ...filtros, turmaId: e.target.value })}
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
            fullWidth
            value={filtros.aluno}
            onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 4, justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={exportarExcel}>
            Exportar para Excel
          </Button>
          <Button variant="contained" color="secondary" onClick={exportarPDF}>
            Exportar para PDF
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Frequência por Turma
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={aplicarFiltros()}
                      dataKey="frequencia"
                      nameKey="aluno"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                    >
                      {aplicarFiltros().map((entry, index) => (
                        <Cell key={`${entry.aluno}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Turma</TableCell>
                    <TableCell>Frequência</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell>Estratégias Aplicadas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aplicarFiltros().map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.aluno}</TableCell>
                      <TableCell>{item.turma}</TableCell>
                      <TableCell>{`${item.frequencia}%`}</TableCell>
                      <TableCell>{item.nota}</TableCell>
                      <TableCell>{item.estrategias}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResumoFinal;
