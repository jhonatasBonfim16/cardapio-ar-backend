import express from "express";
import {checarStatusPedido} from '../controllers/pedidoController.js'

const router = express.Router();

router.get('/pedido/:id', checarStatusPedido)

export default router; 