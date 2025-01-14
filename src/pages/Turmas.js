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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaTurma, setNovaTurma] = useState({ nome: "", status: "Ativo", maxAlunos: 30 });
  const [editandoTurma, setEditandoTurma] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Carregar turmas do Firestore
  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  // Salvar turma
  const handleSalvarTurma = async () => {
    if (!novaTurma.nome) {
      alert("O nome da turma é obrigatório.");
      return;
    }

    if (novaTurma.maxAlunos > 30) {
      alert("O limite máximo de alunos é 30.");
      return;
    }

    try {
      if (editandoTurma) {
        const turmaRef = doc(db, "turmas", editandoTurma.id);
        await updateDoc(turmaRef, novaTurma);
      } else {
        await addDoc(collection(db, "turmas"), novaTurma);
      }

      carregarTurmas();
      setDialogOpen(false);
      setNovaTurma({ nome: "", status: "Ativo", maxAlunos: 30 });
      setEditandoTurma(null);
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
    }
  };

  // Excluir turma
  const handleExcluirTurma = async (id) => {
    try {
      await deleteDoc(doc(db, "turmas", id));
      carregarTurmas();
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
    }
  };

  useEffect(() => {
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
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Sistema de Gestão Escolar
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menu Lateral */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 240 }}>
          <ListItem button onClick={() => navigate("/alunos")}>
            <ListItemText primary="Alunos" />
          </ListItem>
          <ListItem button onClick={() => navigate("/turmas")}>
            <ListItemText primary="Turmas" />
          </ListItem>
          <ListItem button onClick={() => navigate("/avaliacoes")}>
            <ListItemText primary="Avaliações" />
          </ListItem>
          <ListItem button onClick={() => navigate("/relatorios")}>
            <ListItemText primary="Relatórios" />
          </ListItem>
          <ListItem button onClick={() => navigate("/notificacoes")}>
            <ListItemText primary="Notificações" />
          </ListItem>
        </List>
      </Drawer>

      {/* Conteúdo */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          Gerenciamento de Turmas
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setDialogOpen(true);
            setNovaTurma({ nome: "", status: "Ativo", maxAlunos: 30 });
            setEditandoTurma(null);
          }}
          sx={{ mb: 2 }}
        >
          Adicionar Turma
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome da Turma</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Máx. Alunos</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {turmas.map((turma) => (
                <TableRow key={turma.id}>
                  <TableCell>{turma.id}</TableCell>
                  <TableCell>{turma.nome}</TableCell>
                  <TableCell>{turma.status}</TableCell>
                  <TableCell>{turma.maxAlunos}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setNovaTurma(turma);
                        setEditandoTurma(turma);
                        setDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={async () => {
                            const confirmed = window.confirm(
                            "Tem certeza de que deseja excluir esta turma? Esta ação não pode ser desfeita."
                            );
                            if (confirmed) {
                            await handleExcluirTurma(turma.id);
                            }
                        }}
                        >
                        Excluir
                        </Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de Adicionar/Editar */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {editandoTurma ? "Editar Turma" : "Adicionar Turma"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nome da Turma"
              fullWidth
              margin="normal"
              value={novaTurma.nome}
              onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              margin="normal"
              value={novaTurma.status}
              onChange={(e) => setNovaTurma({ ...novaTurma, status: e.target.value })}
            >
              <MenuItem value="Ativo">Ativo</MenuItem>
              <MenuItem value="Inativo">Inativo</MenuItem>
            </TextField>
            <TextField
              label="Máx. Alunos"
              type="number"
              fullWidth
              margin="normal"
              value={novaTurma.maxAlunos}
              onChange={(e) => setNovaTurma({ ...novaTurma, maxAlunos: Math.min(Number(e.target.value), 30) })}
              helperText="Máximo permitido: 30"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSalvarTurma} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Turmas;
