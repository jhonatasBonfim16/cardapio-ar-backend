import pool from '../model/db.js'; // Ajustado para a sua pasta 'model/db.js'
import bcrypt from 'bcrypt';

const cadastroUsuario = async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        // 1. Validação de campos obrigatórios
        if (!nome || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
        }

        // 2. Verificar se o e-mail já existe na tabela clientes
        const queryVerificarEmail = 'SELECT id FROM public.clientes WHERE email = \$1;';
        const resultadoBusca = await pool.query(queryVerificarEmail, [email]);

        if (resultadoBusca.rows.length > 0) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado!' });
        }

        // 3. Criptografar a senha com o bcrypt antes de salvar
        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(password, saltos);

        // 4. Inserir o novo cliente na tabela do banco de dados
        const queryInserir = `
            INSERT INTO public.clientes (nome, email, senha) 
            VALUES ($1, $2, $3) 
            RETURNING id, nome, email;
        `;
        
        const resultadoInsercao = await pool.query(queryInserir, [nome, email, senhaCriptografada]);
        const novoUsuario = resultadoInsercao.rows[0];

        // 5. Retornar resposta de sucesso 201 (Created) com os dados públicos do cliente
        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            usuario: novoUsuario
        });

    } catch (error) {
        console.error('❌ ERRO DETALHADO NO CADASTRO:', error);
        return res.status(500).json({ message: 'Erro interno no servidor ao realizar cadastro!' });
    }
};

export default cadastroUsuario;
