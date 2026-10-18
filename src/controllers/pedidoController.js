import pool from '../model/db.js'; // Seu pool de conexão do Postgres
import jwt from 'jsonwebtoken';

const numeroWhats = "5527998399687";

function higienizarEntrada(texto) {
    if (!texto) return '';
    return texto
        .replace(/<[^>]*>/g, '') 
        .replace(/&/g, "&amp;")  
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "'")
        .trim();                 
}

export const enviarPedido = async (req, res) => {
    try {
        // =========================================================================
        // 1. [REFEITO]: Leitura estável do Token através do cabeçalho Authorization
        // =========================================================================
        const authHeader = req.headers.authorization;
        // Pega apenas a string do token após a palavra "Bearer "
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ message: "Usuário não autenticado. Faça login para fazer pedidos!" });
        }

        // Descriptografa o token para pegar o ID do cliente cadastrado
        let usuarioLogado;
        try {
            usuarioLogado = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ message: "Sessão expirada. Por favor, faça login novamente." });
        }

        const clienteId = usuarioLogado.id; // Pegamos o ID do cliente vindo do banco decodificado

        // 2. Receber os dados do corpo da requisição (adicionando formaPagamento)
        const { tipoPedido, inputVal, carrinho, formaPagamento } = req.body;
        const numeroWhats = "5527998399687";
        const inputLimpo = higienizarEntrada(inputVal);

        if (!carrinho || carrinho.length === 0) {
            return res.status(400).json({ message: "Sua sacola está vazia!" });
        }

        if (!formaPagamento) {
            return res.status(400).json({ message: "Selecione uma forma de pagamento válida." });
        }

        // 3. Calcular o Total Geral do Pedido de forma segura no Servidor
        const totalGeral = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);

        // 4. Montar o texto base da mensagem (Igual ao seu original)
        let textoMensagem = `*NOVO PEDIDO - Restaurante do João*\n\n`;
        carrinho.forEach(item => {
            textoMensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
        });
        
        textoMensagem += `\n*Total Geral:* R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`;
        textoMensagem += `💳 *Forma de Pagamento:* ${formaPagamento.toUpperCase()}\n`;

        if (tipoPedido === 'mesa') {
            textoMensagem += `📍 *Consumo local na Mesa:* ${inputLimpo}\n`;
        } else {
            textoMensagem += `🛵 *Entrega no Endereço:* ${inputLimpo}\n`;
        }

        // 5. Salvar o Pedido no Banco de Dados (DBeaver) utilizando o seu pool
        const querySalvarPedido = `
            INSERT INTO public.pedidos (cliente_id, tipo_pedido, localizacao, forma_pagamento, total, status, itens_json)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `;

        // Se for PIX, começa como 'Aguardando Pagamento'. Se for Dinheiro/Cartão, começa como 'Pendente'.
        const statusInicial = formaPagamento === 'pix' ? 'Aguardando Pagamento' : 'Pendente';

        const resultadoBanco = await pool.query(querySalvarPedido, [
            clienteId,
            tipoPedido,
            inputLimpo,
            formaPagamento,
            totalGeral,
            statusInicial,
            JSON.stringify(carrinho)
        ]);

        // [CORRIGIDO]: Ajustado o acesso correto ao retorno do PostgreSQL do node-pg
        const pedidoId = resultadoBanco.rows[0].id; 
        textoMensagem += `🔢 *Pedido nº:* #${pedidoId}\n`;

        // 6. CONTROLAR A RESPOSTA BASEADO NA FORMA DE PAGAMENTO
        // 6. CONTROLAR A RESPOSTA BASEADO NA FORMA DE PAGAMENTO
        if (formaPagamento === 'pix') {
            textoMensagem += `\n✅ *STATUS:* AGUARDANDO PAGAMENTO VIA PIX`;

            const pixQrCodeBase64 = "https://wikimedia.org";
            const pixCopiaCola = `00020101021226870014br.gov.bcb.pix2565qrco-PEDIDO-${pedidoId}-MOCK`; 

            // [CORRIGIDO]: Retorna o numeroWhats e o textoMensagem também para o Pix!
            return res.status(200).json({
                pedidoId: pedidoId,
                formaPagamento: 'pix',
                pixQrCodeBase64: pixQrCodeBase64,
                pixCopiaCola: pixCopiaCola,
                numeroWhats: numeroWhats,     // Adicionado aqui
                textoMensagem: textoMensagem, // Adicionado aqui
                message: "Pix gerado com sucesso! Aguardando pagamento."
            });

        } else {

            // Se for DINHEIRO ou CARTÃO NA ENTREGA
            textoMensagem += `\n⏳ *STATUS:* Pagar na entrega/mesa`;

            // Mantém o comportamento original que você criou: devolve o texto para o front abrir o Zap
            return res.status(200).json({
                pedidoId: pedidoId,
                formaPagamento: formaPagamento,
                numeroWhats: numeroWhats,
                textoMensagem: textoMensagem,
                message: "Pedido registrado com sucesso!"
            });
        }

    } catch (err) {
        console.error("Erro ao processar pedido:", err);
        return res.status(500).json({ message: "Erro no servidor de dados!" });
    }
};










// Rota rápida para o Polling do Front-end checar se o Pix foi pago
export const checarStatusPedido = async (req, res) => {
    try {
        const { id } = req.params;

        // Busca o status e os dados do pedido necessários para o WhatsApp
        const queryStatus = "SELECT status, tipo_pedido, localizacao, total, itens_json FROM public.pedidos WHERE id = \$1;";
        const resultado = await pool.query(queryStatus, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ message: "Pedido não encontrado." });
        }

        const pedido = resultado.rows[0];

        // Se o pedido foi pago, monta o texto do WhatsApp para entregar ao front-end
        if (pedido.status === 'Pago') {
            let textoMensagem = `*✅ PEDIDO PAGO - Restaurante do João*\n\n`;
            textoMensagem += `🔢 *Pedido nº:* #${id}\n`;
            
            // Trata se o itens_json vier como string ou objeto
            const itens = typeof pedido.itens_json === 'string' ? JSON.parse(pedido.itens_json) : pedido.itens_json;
            itens.forEach(item => {
                textoMensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
            });

            textoMensagem += `\n*Total Geral:* R$ ${parseFloat(pedido.total).toFixed(2).replace('.', ',')}\n`;
            textoMensagem += `💳 *Forma de Pagamento:* PIX (CONFIRMADO)\n`;

            if (pedido.tipo_pedido === 'mesa') {
                textoMensagem += `📍 *Consumo local na Mesa:* ${pedido.localizacao}\n`;
            } else {
                textoMensagem += `🛵 *Entrega no Endereço:* ${pedido.localizacao}\n`;
            }

            return res.status(200).json({ 
                status: pedido.status,
                numeroWhats: numeroWhats,
                textoMensagem: textoMensagem
            });
        }

        // Se ainda não foi pago, devolve apenas o status normal
        return res.status(200).json({ status: pedido.status });

    } catch (err) {
        console.error("Erro ao checar status:", err);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
};



