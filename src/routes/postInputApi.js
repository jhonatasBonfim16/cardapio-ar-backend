import {enviarPedido} from '../controllers/pedidoController.js'

import express from 'express';
const router = express.Router();

router.post('/pedido', enviarPedido);

export default router; // Exporta o roteador para ser engatado no servidor central
