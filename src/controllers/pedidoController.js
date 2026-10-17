function higienizarEntrada(texto) {
    if (!texto) return '';

    return texto
        .replace(/<[^>]*>/g, '') // Remove qualquer tag HTML/Script completamente (ex: <script> virará vazio)
        .replace(/&/g, "&amp;")  // Escapa caracteres especiais de HTML
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .trim();                 // Remove espaços extras nas pontas
}


export const enviarPedido = async (req, res) => {
    try {
        const {tipoPedido, inputVal, carrinho} = req.body;
        const numeroWhats = "5527998399687";
        const inputLimpo = higienizarEntrada(inputVal)

        // Monta o corpo da mensagem de texto limpa
        let textoMensagem = `*NOVO PEDIDO - Restaurante do João*\n\n`;
        carrinho.forEach(item => {
            textoMensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
        });

        const totalGeral = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
        textoMensagem += `\n*Total Geral:* R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`;

        if (tipoPedido === 'mesa') {
            textoMensagem += `📍 *Consumo local na Mesa:* ${inputLimpo}`;
        } else {
            textoMensagem += `🛵 *Entrega no Endereço:* ${inputLimpo}`;
        }
        res.status(200).json({numeroWhats:numeroWhats, textoMensagem:textoMensagem, message:"Sucesso!"})

    } catch (err) {
        res.status(500).json({message:"Erro no servidor de dados!"})
        console.log(err)
    }
}