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
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ResumoFinal = () => {
  const [dadosResumo, setDadosResumo] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [filtros, setFiltros] = useState({ turmaId: "", periodo: "", aluno: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarDados = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "resumoFinal"));
    const dadosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDadosResumo(dadosCarregados);
    setLoading(false);
  };

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  useEffect(() => {
    carregarDados();
    carregarTurmas();
  }, []);

  const aplicarFiltros = () => {
    return dadosResumo.filter((item) => {
      const matchTurma = !filtros.turmaId || item.turmaId === filtros.turmaId;
      const matchAluno =
        !filtros.aluno ||
        item.aluno.toLowerCase().includes(filtros.aluno.toLowerCase());
      const matchPeriodo = !filtros.periodo || item.periodo === filtros.periodo;
      return matchTurma && matchAluno && matchPeriodo;
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      {/* Cabeçalho */}
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

      {/* Conteúdo Principal */}
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
        {/* Filtros */}
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
            label="Período"
            type="date"
            fullWidth
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Filtrar por Aluno"
            fullWidth
            value={filtros.aluno}
            onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
          />
        </Box>

        {/* Gráficos */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Frequência por Turma
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosResumo}
                    dataKey="frequencia"
                    nameKey="aluno"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {dadosResumo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notas Médias
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosResumo}
                    dataKey="nota"
                    nameKey="aluno"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {dadosResumo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        )}

        {/* Tabela de Dados */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Frequência</TableCell>
                <TableCell>Nota</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aplicarFiltros().map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.aluno}</TableCell>
                  <TableCell>{`${item.frequencia}%`}</TableCell>
                  <TableCell>{item.nota}</TableCell>
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
