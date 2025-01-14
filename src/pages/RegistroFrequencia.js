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
  CircularProgress,
  AppBar,
  Toolbar,
  Alert,
} from "@mui/material";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RegistroFrequencia = () => {
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [frequencia, setFrequencia] = useState({});
  const [registrosExistentes, setRegistrosExistentes] = useState({});
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const carregarTurmas = async () => {
    const querySnapshot = await getDocs(collection(db, "turmas"));
    const turmasCarregadas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTurmas(turmasCarregadas);
  };

  const carregarAlunos = async (turmaId) => {
    if (!turmaId) return;
    const querySnapshot = await getDocs(collection(db, "alunos"));
    const alunosCarregados = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((aluno) => aluno.turmaId === turmaId);
    setAlunos(alunosCarregados);
    verificarRegistrosExistentes(turmaId, dataSelecionada);
  };

  const verificarRegistrosExistentes = async (turmaId, data) => {
    const querySnapshot = await getDocs(collection(db, "frequencia"));
    const registros = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((registro) => registro.turmaId === turmaId && registro.data === data);

    const registrosMap = {};
    registros.forEach((registro) => {
      registrosMap[registro.alunoId] = registro.status;
    });
    setRegistrosExistentes(registrosMap);
  };

  const salvarFrequencia = async () => {
    setLoading(true);
    try {
      for (const [alunoId, status] of Object.entries(frequencia)) {
        const registro = {
          turmaId: turmaSelecionada,
          alunoId,
          data: dataSelecionada,
          status,
        };
        const docRef = doc(db, "frequencia", `${alunoId}_${dataSelecionada}`);
        await setDoc(docRef, registro);
      }
      alert("Frequência salva com sucesso!");
      verificarRegistrosExistentes(turmaSelecionada, dataSelecionada);
    } catch (error) {
      console.error("Erro ao salvar frequência:", error);
      alert("Erro ao salvar frequência. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  useEffect(() => {
    carregarAlunos(turmaSelecionada);
  }, [turmaSelecionada, dataSelecionada]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      {/* Cabeçalho */}
      <AppBar position="static" sx={{ boxShadow: 1 }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Registro de Frequência
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          mt: 4,
          mx: "auto",
          maxWidth: "900px",
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            px: 4,
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Registro de Frequência
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <TextField
              select
              label="Selecione a Turma"
              fullWidth
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
            >
              {turmas.map((turma) => (
                <MenuItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Data"
              type="date"
              fullWidth
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Tabela de Alunos */}
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell align="center">Presente</TableCell>
                  <TableCell align="center">Ausente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant={
                          frequencia[aluno.id] === "Presente"
                            ? "contained"
                            : "outlined"
                        }
                        color="primary"
                        onClick={() =>
                          setFrequencia((prev) => ({ ...prev, [aluno.id]: "Presente" }))
                        }
                        disabled={!!registrosExistentes[aluno.id]}
                      >
                        Presente
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant={
                          frequencia[aluno.id] === "Ausente"
                            ? "contained"
                            : "outlined"
                        }
                        color="secondary"
                        onClick={() =>
                          setFrequencia((prev) => ({ ...prev, [aluno.id]: "Ausente" }))
                        }
                        disabled={!!registrosExistentes[aluno.id]}
                      >
                        Ausente
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Alerta de Registros Existentes */}
          {Object.keys(registrosExistentes).length > 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Alguns alunos já possuem frequência registrada para esta data.
            </Alert>
          )}

          {/* Botão de Salvar */}
          <Button
            variant="contained"
            color="primary"
            onClick={salvarFrequencia}
            disabled={loading}
            sx={{
              mt: 3,
              width: "100%",
              maxWidth: "400px",
              mx: "auto",
              display: "block",
              fontWeight: "bold",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Salvar Frequência"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistroFrequencia;
