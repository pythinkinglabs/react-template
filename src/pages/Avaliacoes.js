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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [materias, setMaterias] = useState(["Matemática", "Português", "História", "Geografia", "Ciências"]);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaAvaliacao, setNovaAvaliacao] = useState({ aluno: "", nota: "", descricao: "", materia: "", turmaId: "" });
  const [editandoAvaliacao, setEditandoAvaliacao] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

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

  const carregarAvaliacoes = async () => {
    const querySnapshot = await getDocs(collection(db, "avaliacoes"));
    const avaliacoesCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAvaliacoes(avaliacoesCarregadas);
  };

  const handleSalvarAvaliacao = async () => {
    if (!novaAvaliacao.aluno || !novaAvaliacao.nota || !novaAvaliacao.materia || !novaAvaliacao.turmaId) {
      alert("Aluno, nota, matéria e turma são obrigatórios.");
      return;
    }

    try {
      if (editandoAvaliacao) {
        const avaliacaoRef = doc(db, "avaliacoes", editandoAvaliacao.id);
        await updateDoc(avaliacaoRef, novaAvaliacao);
      } else {
        await addDoc(collection(db, "avaliacoes"), novaAvaliacao);
      }

      carregarAvaliacoes();
      setDialogOpen(false);
      setNovaAvaliacao({ aluno: "", nota: "", descricao: "", materia: "", turmaId: "" });
      setEditandoAvaliacao(null);
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    }
  };

  useEffect(() => {
    carregarTurmas();
    carregarAlunos();
    carregarAvaliacoes();
  }, []);

  const alunosFiltrados = alunos.filter((aluno) => aluno.turmaId === turmaSelecionada);

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
        <List>
          <ListItem button onClick={() => navigate("/dashboard")}>
            <ListItemText primary="Dashboard" />
          </ListItem>
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
        </List>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Avaliações
        </Typography>

        {/* Filtro de Turma e Matéria */}
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <TextField
            select
            label="Turma"
            fullWidth
            value={turmaSelecionada}
            onChange={(e) => setTurmaSelecionada(e.target.value)}
          >
            <MenuItem value="">Todas as Turmas</MenuItem>
            {turmas.map((turma) => (
              <MenuItem key={turma.id} value={turma.id}>
                {turma.nome}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Matéria"
            fullWidth
            value={materiaSelecionada}
            onChange={(e) => setMateriaSelecionada(e.target.value)}
          >
            <MenuItem value="">Todas as Matérias</MenuItem>
            {materias.map((materia) => (
              <MenuItem key={materia} value={materia}>
                {materia}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setDialogOpen(true);
            setNovaAvaliacao({ aluno: "", nota: "", descricao: "", materia: "", turmaId: "" });
            setEditandoAvaliacao(null);
          }}
          sx={{ mb: 2 }}
        >
          Adicionar Avaliação
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell>Matéria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avaliacoes
                .filter((avaliacao) =>
                  (!turmaSelecionada || alunosFiltrados.find((a) => a.id === avaliacao.aluno)) &&
                  (!materiaSelecionada || avaliacao.materia === materiaSelecionada)
                )
                .map((avaliacao) => (
                  <TableRow key={avaliacao.id}>
                    <TableCell>
                      {alunos.find((aluno) => aluno.id === avaliacao.aluno)?.nome || "N/A"}
                    </TableCell>
                    <TableCell>{avaliacao.nota}</TableCell>
                    <TableCell>{avaliacao.materia}</TableCell>
                    <TableCell>{avaliacao.descricao}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setNovaAvaliacao(avaliacao);
                          setEditandoAvaliacao(avaliacao);
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
                          await deleteDoc(doc(db, "avaliacoes", avaliacao.id));
                          carregarAvaliacoes();
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

        {/* Modal de Adicionar Avaliação */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editandoAvaliacao ? "Editar Avaliação" : "Adicionar Avaliação"}</DialogTitle>
        <DialogContent>
            <TextField
            select
            label="Turma"
            fullWidth
            margin="normal"
            value={novaAvaliacao.turmaId}
            onChange={(e) => {
                const turmaId = e.target.value;
                setNovaAvaliacao({ ...novaAvaliacao, turmaId, aluno: "" }); // Limpa aluno ao mudar turma
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
            value={novaAvaliacao.aluno}
            onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, aluno: e.target.value })}
            >
            {alunos
                .filter((aluno) => aluno.turmaId === novaAvaliacao.turmaId)
                .map((aluno) => (
                <MenuItem key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                </MenuItem>
                ))}
            </TextField>
            <TextField
            label="Nota"
            type="number"
            fullWidth
            margin="normal"
            value={novaAvaliacao.nota}
            onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, nota: e.target.value })}
            />
            <TextField
            select
            label="Matéria"
            fullWidth
            margin="normal"
            value={novaAvaliacao.materia}
            onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, materia: e.target.value })}
            >
            {materias.map((materia) => (
                <MenuItem key={materia} value={materia}>
                {materia}
                </MenuItem>
            ))}
            </TextField>
            <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={novaAvaliacao.descricao}
            onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, descricao: e.target.value })}
            />
        </DialogContent>

        <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancelar
            </Button>
            <Button onClick={handleSalvarAvaliacao} color="primary">
            Salvar
            </Button>
        </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default Avaliacoes;
