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
  List,
  ListItem,
  ListItemText,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const PlanoAulas = () => {
  const [turmas, setTurmas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [novaAula, setNovaAula] = useState({
    turmaId: "",
    data: "",
    conteudo: "",
    estrategias: "",
    observacoes: "",
    materia: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const materias = ["Matemática", "Português", "História", "Geografia", "Ciências", "Inglês", "Educação Física"];

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const carregarPlanos = async () => {
    const querySnapshot = await getDocs(collection(db, "planosAulas"));
    const planosCarregados = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPlanos(planosCarregados);
  };

  const handleSalvarPlano = async () => {
    const { turmaId, data, conteudo, estrategias, observacoes, materia } = novaAula;

    if (!turmaId || !data || !conteudo || !estrategias || !materia) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    try {
      await addDoc(collection(db, "planosAulas"), novaAula);
      carregarPlanos();
      setDialogOpen(false);
      setNovaAula({ turmaId: "", data: "", conteudo: "", estrategias: "", observacoes: "", materia: "" });
    } catch (error) {
      console.error("Erro ao salvar plano de aula:", error);
    }
  };

  const handleExcluirPlano = async (id) => {
    const confirmed = window.confirm("Tem certeza de que deseja excluir este plano de aula?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "planosAulas", id));
      carregarPlanos();
    } catch (error) {
      console.error("Erro ao excluir plano de aula:", error);
    }
  };

  const limparCampoEstrategias = () => {
    setNovaAula({ ...novaAula, estrategias: "" });
  };

  const solicitarEstrategia = async () => {
    alert("Funcionalidade para solicitar estratégia via API em desenvolvimento.");
  };

  useEffect(() => {
    carregarTurmas();
    carregarPlanos();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
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

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          <ListItem button onClick={() => navigate("/dashboard")}>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "start" }}>
          Planejamento de Aulas
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Adicionar Plano de Aula
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Turma</TableCell>
                <TableCell>Conteúdo</TableCell>
                <TableCell>Estratégias</TableCell>
                <TableCell>Matéria</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planos.map((plano) => (
                <TableRow key={plano.id}>
                  <TableCell>{plano.data}</TableCell>
                  <TableCell>{turmas.find((turma) => turma.id === plano.turmaId)?.nome || "N/A"}</TableCell>
                  <TableCell>{plano.conteudo}</TableCell>
                  <TableCell>{plano.estrategias}</TableCell>
                  <TableCell>{plano.materia}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleExcluirPlano(plano.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Adicionar Plano de Aula</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Turma"
              fullWidth
              margin="normal"
              value={novaAula.turmaId}
              onChange={(e) => setNovaAula({ ...novaAula, turmaId: e.target.value })}
            >
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
              margin="normal"
              value={novaAula.materia}
              onChange={(e) => setNovaAula({ ...novaAula, materia: e.target.value })}
            >
              {materias.map((materia) => (
                <MenuItem key={materia} value={materia}>
                  {materia}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Data"
              type="date"
              fullWidth
              margin="normal"
              value={novaAula.data}
              onChange={(e) => setNovaAula({ ...novaAula, data: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Conteúdo"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={novaAula.conteudo}
              onChange={(e) => setNovaAula({ ...novaAula, conteudo: e.target.value })}
            />
            <Box>
              <TextField
                label="Estratégias"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={novaAula.estrategias}
                onChange={(e) => setNovaAula({ ...novaAula, estrategias: e.target.value })}
              />
              <Button onClick={limparCampoEstrategias} color="secondary" sx={{ mr: 1 }}>
                Limpar
              </Button>
              <Button onClick={solicitarEstrategia} color="primary">
                Gerar Estratégia (ChatGPT)
              </Button>
            </Box>
            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={2}
              margin="normal"
              value={novaAula.observacoes}
              onChange={(e) => setNovaAula({ ...novaAula, observacoes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSalvarPlano} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PlanoAulas;
