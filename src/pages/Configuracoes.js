import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { collection, getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Configuracoes = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [endereco, setEndereco] = useState("");
  const [complemento, setComplemento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState(null);
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

  useEffect(() => {
    const carregarDadosUsuario = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setEndereco(data.endereco || "");
          setComplemento(data.complemento || "");
          setTelefone(data.telefone || "");
        }
      }
    };

    carregarDadosUsuario();
  }, [user]);

  const handleSalvar = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Atualizar senha
      if (novaSenha) {
        if (!senhaAtual) {
          throw new Error("Informe a senha atual para atualizar a senha.");
        }

        const credential = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, novaSenha);
      }

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        endereco,
        complemento,
        telefone,
      }, { merge: true });

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
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
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
        <Avatar
          src={foto ? URL.createObjectURL(foto) : user?.photoURL || ""}
          alt="Foto do usuário"
          sx={{ width: 120, height: 120, mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>{user?.displayName || "Usuário"}</Typography>
        <Box
          component="form"
          sx={{
            width: "100%",
            maxWidth: 600,
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
          <TextField
            label="Endereço"
            fullWidth
            margin="normal"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
          <TextField
            label="Complemento"
            fullWidth
            margin="normal"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
          />
          <TextField
            label="Telefone"
            fullWidth
            margin="normal"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Foto
            <input
              type="file"
              hidden
              onChange={(e) => setFoto(e.target.files[0])}
            />
          </Button>
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
