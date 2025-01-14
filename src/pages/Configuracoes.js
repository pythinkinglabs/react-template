import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


const Configuracoes = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [nome, setNome] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
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

  const handleSalvar = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Atualizar nome do usuário
      if (user.displayName !== nome) {
        await updateProfile(user, { displayName: nome });
      }

      // Atualizar email
      if (user.email !== email) {
        await updateEmail(user, email);
      }

      // Atualizar senha
      if (novaSenha) {
        if (!senhaAtual) {
          throw new Error("Informe a senha atual para atualizar a senha.");
        }
        await auth.currentUser.updatePassword(novaSenha);
      }

      setSuccess("As configurações foram salvas com sucesso!");
    } catch (err) {
      setError(err.message || "Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Conteúdo */}
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>
        <Box
          component="form"
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 3,
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSalvar();
          }}
        >
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha Atual"
            type="password"
            fullWidth
            margin="normal"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            helperText="Necessária para atualizar a senha"
          />
          <TextField
            label="Nova Senha"
            type="password"
            fullWidth
            margin="normal"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Configuracoes;
