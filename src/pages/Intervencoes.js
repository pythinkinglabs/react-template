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
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


const Intervencoes = () => {
  const [intervencoes, setIntervencoes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaIntervencao, setNovaIntervencao] = useState({
    turmaId: "",
    alunoId: "",
    descricao: "",
  });
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
    { name: "Estrategias", path: "/estrategias" },
  ];

  const carregarIntervencoes = async () => {
    const querySnapshot = await getDocs(collection(db, "intervencoes"));
    const intervencoesCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setIntervencoes(intervencoesCarregadas);
  };

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const carregarAlunos = async () => {
    const querySnapshot = await getDocs(collection(db, "alunos"));
    const alunosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAlunos(alunosCarregados);
  };

  const handleSalvarIntervencao = async () => {
    if (!novaIntervencao.turmaId || !novaIntervencao.alunoId || !novaIntervencao.descricao) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      await addDoc(collection(db, "intervencoes"), novaIntervencao);
      setDialogOpen(false);
      carregarIntervencoes();
      setNovaIntervencao({ turmaId: "", alunoId: "", descricao: "" });
    } catch (error) {
      console.error("Erro ao salvar intervenção:", error);
    }
  };

  useEffect(() => {
    carregarIntervencoes();
    carregarTurmas();
    carregarAlunos();
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
          Gerenciamento de Intervenções Pedagógicas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 3 }}
          onClick={() => setDialogOpen(true)}
        >
          Adicionar Intervenção
        </Button>

        {/* Tabela de Intervenções */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Turma</TableCell>
                <TableCell>Aluno</TableCell>
                <TableCell>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {intervencoes.map((intervencao) => (
                <TableRow key={intervencao.id}>
                  <TableCell>
                    {turmas.find((turma) => turma.id === intervencao.turmaId)?.nome || "N/A"}
                  </TableCell>
                  <TableCell>
                    {alunos.find((aluno) => aluno.id === intervencao.alunoId)?.nome || "N/A"}
                  </TableCell>
                  <TableCell>{intervencao.descricao}</TableCell>


                  <TableCell>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                        setNovaIntervencao(intervencao);
                        setDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                    >
                        Editar
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                        try {
                            await deleteDoc(doc(db, "intervencoes", intervencao.id));
                            carregarIntervencoes();
                        } catch (error) {
                            console.error("Erro ao excluir intervenção:", error);
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

        {/* Modal de Adicionar Intervenção */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Adicionar Intervenção</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Turma"
              fullWidth
              margin="normal"
              value={novaIntervencao.turmaId}
              onChange={(e) => setNovaIntervencao({ ...novaIntervencao, turmaId: e.target.value })}
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
              value={novaIntervencao.alunoId}
              onChange={(e) => setNovaIntervencao({ ...novaIntervencao, alunoId: e.target.value })}
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
              rows={3}
              margin="normal"
              value={novaIntervencao.descricao}
              onChange={(e) => setNovaIntervencao({ ...novaIntervencao, descricao: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSalvarIntervencao} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Intervencoes;
