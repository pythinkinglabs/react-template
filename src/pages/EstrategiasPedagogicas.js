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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const EstrategiasPedagogicas = () => {
  const [estrategias, setEstrategias] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaEstrategia, setNovaEstrategia] = useState({ turmaId: "", alunoId: "", descricao: "", data: "" });
  const [editandoEstrategia, setEditandoEstrategia] = useState(null);
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

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const carregarAlunos = async (turmaId) => {
    if (!turmaId) {
      setAlunos([]);
      return;
    }

    const querySnapshot = await getDocs(collection(db, "alunos"));
    const alunosCarregados = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((aluno) => aluno.turmaId === turmaId);
    setAlunos(alunosCarregados);
  };

  const carregarEstrategias = async () => {
    const querySnapshot = await getDocs(collection(db, "estrategias"));
    const estrategiasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEstrategias(estrategiasCarregadas);
  };

  const handleSalvarEstrategia = async () => {
    if (!novaEstrategia.alunoId || !novaEstrategia.descricao) {
      alert("O aluno e a descrição são obrigatórios.");
      return;
    }

    try {
      if (editandoEstrategia) {
        const estrategiaRef = doc(db, "estrategias", editandoEstrategia.id);
        await updateDoc(estrategiaRef, novaEstrategia);
      } else {
        await addDoc(collection(db, "estrategias"), novaEstrategia);
      }

      carregarEstrategias();
      setDialogOpen(false);
      setNovaEstrategia({ turmaId: "", alunoId: "", descricao: "", data: "" });
      setEditandoEstrategia(null);
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
    }
  };

  const handleExcluirEstrategia = async (id) => {
    if (window.confirm("Tem certeza de que deseja excluir esta estratégia?")) {
      try {
        await deleteDoc(doc(db, "estrategias", id));
        carregarEstrategias();
      } catch (error) {
        console.error("Erro ao excluir estratégia:", error);
      }
    }
  };

  useEffect(() => {
    carregarEstrategias();
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
          Gerenciamento de Estratégias Pedagógicas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setDialogOpen(true);
            setNovaEstrategia({ turmaId: "", alunoId: "", descricao: "", data: "" });
            setEditandoEstrategia(null);
          }}
          sx={{ mb: 2 }}
        >
          Adicionar Estratégia
        </Button>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estrategias.map((estrategia) => (
                <TableRow key={estrategia.id}>
                  <TableCell>
                    {alunos.find((aluno) => aluno.id === estrategia.alunoId)?.nome || "N/A"}
                  </TableCell>
                  <TableCell>{estrategia.descricao}</TableCell>
                  <TableCell>{estrategia.data}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setNovaEstrategia(estrategia);
                        setEditandoEstrategia(estrategia);
                        carregarAlunos(estrategia.turmaId);
                        setDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleExcluirEstrategia(estrategia.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de Adicionar/Editar Estratégia */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {editandoEstrategia ? "Editar Estratégia" : "Adicionar Estratégia"}
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Turma"
              fullWidth
              margin="normal"
              value={novaEstrategia.turmaId}
              onChange={(e) => {
                const turmaId = e.target.value;
                setNovaEstrategia({ ...novaEstrategia, turmaId, alunoId: "" });
                carregarAlunos(turmaId);
              }}
            >
              {turmas.map((turma) => (
                <MenuItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Aluno"
              fullWidth
              margin="normal"
              value={novaEstrategia.alunoId}            onChange={(e) => setNovaEstrategia({ ...novaEstrategia, alunoId: e.target.value })}
              >
                {alunos.map((aluno) => (
                  <MenuItem key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={novaEstrategia.descricao}
                onChange={(e) => setNovaEstrategia({ ...novaEstrategia, descricao: e.target.value })}
              />
              <TextField
                label="Data"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={novaEstrategia.data}
                onChange={(e) => setNovaEstrategia({ ...novaEstrategia, data: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleSalvarEstrategia} color="primary">
                Salvar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    );
  };
  
  export default EstrategiasPedagogicas;
  
