import React, { useState, useEffect } from "react";
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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  Drawer,
  AppBar,
  Toolbar,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoAluno, setNovoAluno] = useState({ nome: "", turmaId: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const pages = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alunos", path: "/alunos" },
    { name: "Turmas", path: "/turmas" },
    { name: "Avaliações", path: "/avaliacoes" },
    { name: "Relatórios", path: "/relatorios" },
    { name: "Notificações", path: "/notificacoes" },
  ];

  // Carregar alunos do Firestore
  const carregarAlunos = async () => {
    const querySnapshot = await getDocs(collection(db, "alunos"));
    const alunosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAlunos(alunosCarregados);
  };

  // Carregar turmas do Firestore
  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  // Adicionar ou editar aluno
  const handleSalvarAluno = async () => {
    if (!novoAluno.nome || !novoAluno.turmaId) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      if (novoAluno.id) {
        // Atualizar aluno existente
        const alunoRef = doc(db, "alunos", novoAluno.id);
        await updateDoc(alunoRef, { nome: novoAluno.nome, turmaId: novoAluno.turmaId });
      } else {
        // Adicionar novo aluno
        await addDoc(collection(db, "alunos"), { nome: novoAluno.nome, turmaId: novoAluno.turmaId });
      }

      setDialogOpen(false);
      carregarAlunos();
      setNovoAluno({ nome: "", turmaId: "" });
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
    }
  };

  // Excluir aluno
  const handleExcluirAluno = async (id) => {
    try {
      await deleteDoc(doc(db, "alunos", id));
      carregarAlunos();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  useEffect(() => {
    carregarAlunos();
    carregarTurmas();
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

      {/* Conteúdo */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Alunos
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            select
            label="Filtrar por Turma"
            value={turmaSelecionada}
            onChange={(e) => setTurmaSelecionada(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Todas as Turmas</MenuItem>
            {turmas.map((turma) => (
              <MenuItem key={turma.id} value={turma.id}>
                {turma.nome}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            Adicionar Aluno
          </Button>
        </Box>

        {/* Tabela de Alunos */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alunos
                .filter((aluno) => !turmaSelecionada || aluno.turmaId === turmaSelecionada)
                .map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>
                      {turmas.find((turma) => turma.id === aluno.turmaId)?.nome || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setNovoAluno(aluno);
                          setDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleExcluirAluno(aluno.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal de Adicionar/Editar Aluno */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>{novoAluno.id ? "Editar Aluno" : "Adicionar Aluno"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              value={novoAluno.nome}
              onChange={(e) => setNovoAluno({ ...novoAluno, nome: e.target.value })}
            />
            <TextField
              select
              label="Turma"
              fullWidth
              margin="normal"
              value={novoAluno.turmaId}
              onChange={(e) => setNovoAluno({ ...novoAluno, turmaId: e.target.value })}
            >
              {turmas.map((turma) => (
                <MenuItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSalvarAluno} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Alunos;
