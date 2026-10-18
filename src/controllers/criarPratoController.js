import pool from "../model/db.js";
// Cadastra um novo prato
export const criarPrato = async (req, res) => {
  try {
    const { nome, preco, descricao, foto, modelo3d, modelo3d_ios, categoria } = req.body;
    const query = `
      INSERT INTO pratos (nome, preco, descricao, foto, modelo3d, modelo3d_ios, categoria) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const valores = [nome, preco, descricao, foto, modelo3d, modelo3d_ios, categoria || 'Sem categoria'];

    const resultado = await pool.query(query, valores);
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao criar prato:", error);
    res.status(400).json({ error: "Não foi possível cadastrar o prato." });
  }
};

export default criarPrato; 
