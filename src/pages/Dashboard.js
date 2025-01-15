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
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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

import GroupIcon from "@mui/icons-material/Group";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GavelIcon from "@mui/icons-material/Gavel";
import SummarizeIcon from "@mui/icons-material/Summarize";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SidebarMenu = ({ open, onClose, navigate }) => {
  const pages = [
    { name: "Turmas", icon: <SchoolIcon />, path: "/turmas" },
    { name: "Alunos", icon: <GroupIcon />, path: "/alunos" },    
    { name: "Plano de Aulas", icon: <LibraryBooksIcon />, path: "/plano-aulas" },
    { name: "Registro de Frequência", icon: <CalendarTodayIcon />, path: "/registro-frequencia" },
    { name: "Estratégias Pedagógicas", icon: <PsychologyIcon />, path: "/estrategias-pedagogicas" },
    { name: "Avaliações", icon: <AssessmentIcon />, path: "/avaliacoes" },    
    { name: "Intervenções", icon: <GavelIcon />, path: "/intervencoes" },
    { name: "Relatórios", icon: <ReportIcon />, path: "/relatorios" },
    { name: "Resumo Final", icon: <SummarizeIcon />, path: "/resumo-final" },
    { name: "Notificações", icon: <NotificationsIcon />, path: "/notificacoes" },
    { name: "Configurações", icon: <SettingsIcon />, path: "/configuracoes" },
    
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
  const [chartType, setChartType] = useState("pie");
  const [data, setData] = useState({
    totalTurmas: 0,
    totalAlunos: 0,
    totalPlanoDeAulas: 0,
    totalEstrategias: 0,
    desempenho: [],
    frequencia: [],
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const turmasSnapshot = await getDocs(collection(db, "turmas"));
        const alunosSnapshot = await getDocs(collection(db, "alunos"));
        const planosAulasSnapshot = await getDocs(collection(db, "planosAulas"));
        const estrategiasSnapshot = await getDocs(collection(db, "estrategias"));

       
      setData({
          totalTurmas: turmasSnapshot.size || 0,
          totalAlunos: alunosSnapshot.size || 0,
          totalPlanoDeAulas: planosAulasSnapshot.size || 0,
          totalEstrategias: estrategiasSnapshot.size || 0,
          desempenho: [
            { name: "Aluno 1", value: 8 },
            { name: "Aluno 2", value: 7.5 },
            { name: "Aluno 3", value: 9 },
          ],
          frequencia: [
            { name: "Janeiro", value: 95 },
            { name: "Fevereiro", value: 90 },
            { name: "Março", value: 92 },
          ],
          estrategias: [
            { name: "Aluno 1", value: 5 },
            { name: "Aluno 2", value: 7 },
            { name: "Aluno 3", value: 4 },
          ],
          planosAulas: [
            { name: "Turma A", value: 10 },
            { name: "Turma B", value: 15 },
            { name: "Turma C", value: 8 },
          ],
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const pages = [
    { name: "Turmas", icon: <SchoolIcon />, path: "/turmas" },
    { name: "Alunos", icon: <GroupIcon />, path: "/alunos" },    
    { name: "Plano de Aulas", icon: <LibraryBooksIcon />, path: "/plano-aulas" },
    { name: "Registro de Frequência", icon: <CalendarTodayIcon />, path: "/registro-frequencia" },
    { name: "Estratégias Pedagógicas", icon: <PsychologyIcon />, path: "/estrategias-pedagogicas" },
    { name: "Avaliações", icon: <AssessmentIcon />, path: "/avaliacoes" },    
    { name: "Intervenções", icon: <GavelIcon />, path: "/intervencoes" },
    { name: "Relatórios", icon: <ReportIcon />, path: "/relatorios" },
    { name: "Notificações", icon: <NotificationsIcon />, path: "/notificacoes" },    
    { name: "Resumo Final", icon: <SummarizeIcon />, path: "/resumo-final" },
    { name: "Configurações", icon: <SettingsIcon />, path: "/configuracoes" },
  ];


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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Contadores */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              {[
                { key: "Turmas", value: data.totalTurmas, color: "#1976d2" },
                { key: "Alunos", value: data.totalAlunos, color: "#388e3c" },
                { key: "Plano de Aulas", value: data.totalPlanoDeAulas, color: "#d32f2f" },
                { key: "Estratégias", value: data.totalEstrategias, color: "#f57c00" },
                
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ backgroundColor: item.color, color: "#fff" }}>
                    <CardContent>
                      <Typography variant="h6">Total de {item.key}</Typography>
                      <Typography variant="h3">{item.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Listagem de Páginas */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={3}>
                <List>
                  {pages.map((page, index) => (
                    <ListItem
                      button
                      key={index}
                      sx={{
                        mb: 1,
                        backgroundColor: "#ffffff",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                      onClick={() => navigate(page.path)}
                    >
                      <ListItemIcon>{page.icon}</ListItemIcon>
                      <ListItemText primary={page.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Gráficos */}
              <Grid item xs={12} md={9}>
                
            <Grid container spacing={4}>
              <Grid item xs={12} md={9}>
                
                  <Grid container spacing={4}>
                    {[
                      { title: "Desempenho", data: data.desempenho },
                      { title: "Frequência", data: data.frequencia },
                      { title: "Estratégias por Aluno", data: data.estrategias },
                      { title: "Plano de Aulas por Turma", data: data.planosAulas },
                    ].map((chart, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Typography variant="h6" align="center" gutterBottom>
                          {chart.title}
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                          {chartType === "pie" ? (
                            <PieChart>
                              <Pie
                                data={chart.data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                              >
                                {chart.data.map((_, idx) => (
                                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                ))}
                              </Pie>
                            </PieChart>
                          ) : (
                            <BarChart data={chart.data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#1976d2" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
