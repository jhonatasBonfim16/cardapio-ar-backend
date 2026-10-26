import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



import listRouter from './src/routes/api.js';
import postRouterInput from './src/routes/postInputApi.js'
import postCriarPrato from './src/routes/postCriarPrato.js'
import postCadastro from './src/routes/cadastroRouter.js'
import postLogin from './src/routes/loginRouter.js'
import getChecarStatusPedido from './src/routes/checarStatusPedidoRouter.js'
import postEnviarPedido from './src/routes/EnviarPedidoRouter.js'

import rateLimit from 'express-rate-limit';

const app = express();

// Configuração do rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // Limite de até 100 requisições por IP dentro de `windowMs`
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
  origin: "*",//'https://cardapio-ar-frontend.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true 
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api', listRouter);
app.use('/api', postRouterInput)
app.use('/api', postCriarPrato)
app.use('/api', postCadastro)
app.use('/api', postLogin)
app.use('/api', postEnviarPedido)
app.use('/api', getChecarStatusPedido)

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR MVC PROFISSIONAL ATIVO!`);
  console.log(`Buscando dados em tempo real no PostgreSQL local.`);
  console.log(`👉 Link de acesso: http://192.168.100.77:3000`);
});

