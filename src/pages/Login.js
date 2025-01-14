import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";

import backgroundImage from "../assets/imgs/background.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: "100%",
          maxWidth: 500, // Aumentado de 400px para 500px
          padding: 4, // Aumentado de 3 para 4 para mais espaço interno
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Bem-vindo ao Sistema de Gestão Escolar
        </Typography>
        <TextField
          label="E-mail"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ marginTop: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
        </Button>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Link
            onClick={() => navigate("/registro")}
            sx={{ cursor: "pointer", textDecoration: "none" }}
          >
            Novo aqui? Registre-se
          </Link>
          <Link
            onClick={() => navigate("/recuperar-senha")}
            sx={{ cursor: "pointer", textDecoration: "none" }}
          >
            Esqueceu a senha?
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
