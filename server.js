import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORTAÇÃO DO SEU SISTEMA DE ROTAS ISOLADO
import apiRoutes from './src/routes/api.js';

const app = express();
// Usa a porta que o servidor de nuvem nos der, ou 3000 se estiver testando local
const PORT = process.env.PORT || 3000; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações de CORS globais (Blindadas contra travamento do model-viewer)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Range'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());


// 2. CONEXÃO DA ROTA: Vincula todas as URLs criadas no api.js sob o prefixo '/api'
// Isso faz o seu endpoint web se tornar oficialmente: http://192.168.100
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MVC PROFISSIONAL ATIVO!`);
  console.log(`Buscando dados em tempo real no PostgreSQL local.`);
  console.log(`👉 Link de acesso: http://192.168.100.77:3000`);
});

