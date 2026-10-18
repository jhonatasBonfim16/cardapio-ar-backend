import pool from '../model/db.js'; // Ajuste o caminho para o seu arquivo do pool
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validação simples de campos
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
        }

        // 2. Buscar o usuário na tabela clientes pelo e-mail
        const queryBuscar = 'SELECT id, nome, email, senha FROM public.clientes WHERE email = $1;';
        const resultado = await pool.query(queryBuscar, [email]);

        // Se não encontrar nenhuma linha, o e-mail não existe
        if (resultado.rows.length === 0) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos!' });
        }

        const usuario = resultado.rows[0];

        // 3. Comparar a senha digitada com a senha criptografada do banco
        const senhaCorreta = await bcrypt.compare(password, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos!' });
        }

        // 4. Gerar o Token JWT de acesso (expira em 7 dias, por exemplo)
        // ... (Mantenha os passos 1, 2, 3 e 4 iguais para gerar o token JWT) ...
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Enviar o cookie na resposta HTTP e retornar os dados públicos do usuário
        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            token: token, // <--- Enviando o token explicitamente aqui
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor!' });
    }
};

export default loginUsuario;

