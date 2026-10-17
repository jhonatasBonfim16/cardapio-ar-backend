import express from 'express';
import cors from 'cors';

import listRouter from './src/routes/api.js';
import postRouterInput from './src/routes/postInputApi.js'

import rateLimit from 'express-rate-limit';

const app = express();

// Configuração do rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutos
  max: 20, // Limite de até 100 requisições por IP dentro de `windowMs`
  standardHeaders: true, // Retorna os headers `RateLimit-*` na resposta
  legacyHeaders: false, // Desativa os headers `X-RateLimit-*` antigos
  message: {
    error: 'Muitas requisições feitas a partir deste IP, tente novamente mais tarde.'
  }
});

// Aplica o limitador em todas as rotas
app.use(limiter);
// Usa a porta que o servidor de nuvem nos der, ou 3000 se estiver testando local
const PORT = process.env.PORT; 

// Configurações de CORS globais (Blindadas contra travamento do model-viewer)
app.use(cors({
  origin: 'http://127.0.0.1:5500' /*'https://cardapio-ar-frontend-git-main-devs-be44.vercel.app'*/,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use('/api', listRouter);
app.use('/api', postRouterInput)

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MVC PROFISSIONAL ATIVO!`);
  console.log(`Buscando dados em tempo real no PostgreSQL local.`);
  console.log(`👉 Link de acesso: http://192.168.100.77:3000`);
});

