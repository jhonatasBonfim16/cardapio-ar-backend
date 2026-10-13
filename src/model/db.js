import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path'; // <--- Adicione a importação do path
import { fileURLToPath } from 'url'; // <--- Adicione a importação da url

const { Pool } = pg;

// Cria o equivalente ao __dirname clássico para ES Modules saber onde está a raiz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORREÇÃO CRÍTICA: Força o dotenv a buscar o arquivo .env subindo duas pastas até a raiz do backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
