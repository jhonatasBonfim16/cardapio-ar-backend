import pg from 'pg';
import 'dotenv/config'


const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Erro crítico: A variável DATABASE_URL não pôde ser lida. O arquivo .env está no lugar correto?");
}

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
