import express from "express";
import  { enviarPedido } from '../controllers/pedidoController.js'

const router = express.Router();

router.post('/usuario', enviarPedido)

export default router; 