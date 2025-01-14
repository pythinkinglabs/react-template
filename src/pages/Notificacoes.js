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
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Notificacoes = () => {
  const [grupos, setGrupos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: "",
    mensagem: "",
    grupoId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const carregarGrupos = async () => {
    const querySnapshot = await getDocs(collection(db, "grupos"));
    const gruposCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGrupos(gruposCarregados);
  };

  const carregarNotificacoes = async () => {
    const querySnapshot = await getDocs(collection(db, "notificacoes"));
    const notificacoesCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotificacoes(notificacoesCarregadas);
  };

  const handleEnviarNotificacao = async () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem || !novaNotificacao.grupoId) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "notificacoes"), novaNotificacao);
      setNovaNotificacao({ titulo: "", mensagem: "", grupoId: "" });
      setSuccess("Notificação enviada com sucesso!");
      carregarNotificacoes();
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      setError("Erro ao enviar notificação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarGrupos();
    carregarNotificacoes();
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
          Gerenciamento de Notificações
        </Typography>

        {/* Formulário de Envio de Notificações */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviarNotificacao();
          }}
          sx={{
            mb: 4,
            p: 3,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Enviar Nova Notificação
          </Typography>
          <TextField
            label="Título"
            fullWidth
            margin="normal"
            value={novaNotificacao.titulo}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, titulo: e.target.value })}
          />
          <TextField
            label="Mensagem"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={novaNotificacao.mensagem}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, mensagem: e.target.value })}
          />
          <TextField
            select
            label="Grupo"
            fullWidth
            margin="normal"
            value={novaNotificacao.grupoId}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, grupoId: e.target.value })}
          >
            <MenuItem value="">Selecione um grupo</MenuItem>
            {grupos.map((grupo) => (
              <MenuItem key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </MenuItem>
            ))}
          </TextField>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar"}
          </Button>
        </Box>

        {/* Listagem de Notificações */}
        <Typography variant="h6" gutterBottom>
          Notificações Enviadas
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Mensagem</TableCell>
                <TableCell>Grupo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notificacoes.map((notificacao) => (
                <TableRow key={notificacao.id}>
                  <TableCell>{notificacao.titulo}</TableCell>
                  <TableCell>{notificacao.mensagem}</TableCell>
                  <TableCell>
                    {grupos.find((grupo) => grupo.id === notificacao.grupoId)?.nome || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Notificacoes;
