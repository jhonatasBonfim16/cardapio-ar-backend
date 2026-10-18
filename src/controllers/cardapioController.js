import pool from "../model/db.js";

// Lista todos os pratos (com suporte opcional a filtro por categoria)
export const listarPratos = async (req, res) => {
  try {
    const { categoria } = req.query;
    let resultado;

    // No seu controller do Back-end:
    if (categoria) {
      // O TRIM remove espaços em branco que possam estar guardados no banco ou vindo do front
      const query = 'SELECT * FROM pratos WHERE TRIM(LOWER(categoria)) = TRIM(LOWER($1)) ORDER BY id ASC';
      resultado = await pool.query(query, [categoria.trim()]);
    }else {
      // Busca geral padrão
      resultado = await pool.query('SELECT * FROM pratos ORDER BY id ASC');
    }

    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro no CardapioController ao ler o Postgres:", error);
    res.status(500).json({ error: "Falha interna no servidor." });
  }
};

export default listarPratos; 
