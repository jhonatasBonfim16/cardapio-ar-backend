import {criarPrato} from '../controllers/criarPratoController.js'

import express from 'express';
const router = express.Router();

router.post('/cardapio', criarPrato);

export default router; // Exporta o roteador para ser engatado no servidor central
