import pool from "../model/db.js";

// Lista todos os pratos do banco de dados PostgreSQL
export const listarPratos = async (req, res) => {
  try {
    // Executa o comando SQL direto no banco de dados relacional
    const resultado = await pool.query('SELECT * FROM pratos ORDER BY id ASC');
    
    // .rows extrai exclusivamente as linhas da tabela de forma limpa
    res.json(resultado.rows); 
  } catch (error) {
    console.error("Erro no CardapioController ao ler o Postgres:", error);
    res.status(500).json({ error: "Falha interna no servidor ao ler o banco de dados." });
  }
};

// Cadastra um novo prato (Útil para o seu painel administrativo futuro)
export const criarPrato = async (req, res) => {
  try {
    const { nome, preco, descricao, foto, modelo3d } = req.body;
    const query = `
      INSERT INTO pratos (nome, preco, descricao, foto, modelo3d) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const valores = [nome, preco, descricao, foto, modelo3d];
    
    const resultado = await pool.query(query, valores);
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao criar prato:", error);
    res.status(400).json({ error: "Não foi possível cadastrar o prato." });
  }
};
