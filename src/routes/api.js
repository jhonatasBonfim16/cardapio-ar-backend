import { listarPratos } from '../controllers/cardapioController.js'; // Importa a função do controller

import express from 'express';
const router = express.Router();

// Quando o frontend der um fetch nesta rota, o controller 'listarPratos' é acionado
router.get('/cardapio', listarPratos);

export default router; // Exporta o roteador para ser engatado no servidor central
