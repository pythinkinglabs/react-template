import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ClassIcon from "@mui/icons-material/Class";
import ReportIcon from "@mui/icons-material/Report";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";

// Componente Menu Lateral
const SidebarMenu = ({ open, onClose, navigate }) => {
  const pages = [
    { name: "Alunos", icon: <ClassIcon />, path: "/alunos" },
    { name: "Avaliações", icon: <AssessmentIcon />, path: "/avaliacoes" },
    { name: "Turmas", icon: <SchoolIcon />, path: "/turmas" },
    { name: "Plano de Aulas", icon: <TrackChangesIcon />, path: "/plano-aulas" },
    { name: "Relatórios", icon: <ReportIcon />, path: "/relatorios" },
    { name: "Notificações", icon: <NotificationsIcon />, path: "/notificacoes" },
    { name: "Configurações", icon: <SettingsIcon />, path: "/configuracoes" },
    { name: "Estratégias Pedagógicas", icon: <CheckCircleIcon />, path: "/estrategias-pedagogicas" },
    { name: "Intervenções", icon: <CheckCircleIcon />, path: "/intervencoes" },
    { name: "Resumo Final", icon: <CheckCircleIcon />, path: "/resumo-final" },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          width: 240,
        },
      }}
    >
      <List>
        {pages.map((page, index) => (
          <ListItem button key={index} onClick={() => navigate(page.path)}>
            <ListItemIcon sx={{ color: "#fff" }}>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState({
    totalTurmas: 5,
    totalAlunos: 100,
    totalAvaliacoes: 200,
    totalRelatorios: 50,

    desempenho: [
      { nome: "Aluno 1", nota: 8 },
      { nome: "Aluno 2", nota: 7.5 },
      { nome: "Aluno 3", nota: 9 },
    ],
    frequencia: [
      { mes: "Janeiro", frequencia: 95 },
      { mes: "Fevereiro", frequencia: 90 },
      { mes: "Março", frequencia: 92 },
    ],
    pieData: [
      { name: "Aprovados", value: 70 },
      { name: "Reprovados", value: 30 },
    ],
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const turmasSnapshot = await getDocs(collection(db, "turmas"));
        const alunosSnapshot = await getDocs(collection(db, "alunos"));
        const avaliacoesSnapshot = await getDocs(collection(db, "avaliacoes"));
        const relatoriosSnapshot = await getDocs(collection(db, "relatorios"));

        setData((prevData) => ({
          ...prevData,
          totalTurmas: turmasSnapshot.size || prevData.totalTurmas,
          totalAlunos: alunosSnapshot.size || prevData.totalAlunos,
          totalAvaliacoes: avaliacoesSnapshot.size || prevData.totalAvaliacoes,
          totalRelatorios: relatoriosSnapshot.size || prevData.totalRelatorios,
        }));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const pages = [
    { name: "Turmas", path: "/turmas" },
    { name: "Alunos", path: "/alunos" },
    { name: "Avaliações", path: "/avaliacoes" },
    
    { name: "Plano de Aulas", path: "/plano-aulas" },
    { name: "Relatórios", path: "/relatorios" },
    { name: "Notificações", path: "/notificacoes" },
    { name: "Configurações", path: "/configuracoes" },
    { name: "Estratégias Pedagógicas", path: "/estrategias-pedagogicas" },
    { name: "Intervenções", path: "/intervencoes" },
    { name: "Resumo Final", path: "/resumo-final" },
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Gestão Escolar
          </Typography>
        </Toolbar>
      </AppBar>

      <SidebarMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} navigate={navigate} />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard - Visão Geral
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {["Turmas", "Alunos", "Avaliações", "Relatórios"].map((key, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ backgroundColor: ["#1976d2", "#388e3c", "#d32f2f", "#f57c00"][index], color: "#fff" }}>
                    <CardContent>
                      <Typography variant="h6">Total de {key}</Typography>
                      <Typography variant="h3">{data[`total${key}`]}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Desempenho</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.desempenho}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="nota" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Frequência</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data.frequencia}>
                        <CartesianGrid strokeDasharray="3 3"                        />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="frequencia" stroke="#388e3c" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>                  
                </Grid>
              </Grid>

              <Grid item xs={12} md={4} sx={{ maxHeight: "400px", overflowY: "auto" }}>
                <List>
                  {pages.map((page, index) => (
                    <ListItem
                      button
                      key={index}
                      sx={{
                        margin: "5px 0",
                        backgroundColor: "#ffffff",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                      onClick={() => navigate(page.path)}
                    >
                      <ListItemText primary={page.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;

