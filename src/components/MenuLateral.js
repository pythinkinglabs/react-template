import React from "react";
import { List, ListItem, ListItemText, Drawer, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MenuLateral = () => {
  const navigate = useNavigate();
  const pages = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alunos", path: "/alunos" },
    { name: "Turmas", path: "/turmas" },
    { name: "Avaliações", path: "/avaliacoes" },
    { name: "Resumo Final", path: "/resumo-final" },
    { name: "Estratégias Pedagógicas", path: "/estrategias-pedagogicas" },
    { name: "Relatórios", path: "/relatorios" },
    { name: "Notificações", path: "/notificacoes" },
  ];

  return (
    <Drawer variant="permanent" anchor="left" sx={{ width: 240 }}>
      <Box sx={{ p: 2, backgroundColor: "#1976d2", color: "#fff" }}>
        <Typography variant="h6" align="center">
          Gestão Escolar
        </Typography>
      </Box>
      <List>
        {pages.map((page) => (
          <ListItem button key={page.name} onClick={() => navigate(page.path)}>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default MenuLateral;
