import express from "express";
import cadastroUsuario from '../controllers/cadastroController.js'

const router = express.Router();

router.post('/usuario', cadastroUsuario)

export default router; 