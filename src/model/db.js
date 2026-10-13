import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// String de conexão mágica. Ajuste com o seu usuário e senha do PostgreSQL
// Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
// Usamos %22 (que representa aspas duplas na URL) em volta de CardapioAR para o Postgres aceitar as maiúsculas
const connectionString = process.env.DATABASE_URL; 



const pool = new Pool({
  connectionString: connectionString,
});

// Teste inicial silencioso para garantir que a conexão com o Postgres está funcionando
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro crítico ao conectar no PostgreSQL:', err.message);
  } else {
    console.log('✅ Ponte estável estabelecida com o PostgreSQL!');
  }
});

export default pool;
