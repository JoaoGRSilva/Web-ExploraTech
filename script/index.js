document.addEventListener("DOMContentLoaded", function() {
    const temaEscuro = document.getElementById("sistema_modoEscuro");

    // Funções do questionário
    async function calcularMediasPorCategoria() {
        const categorias = [
            { id: 'obras', nome: 'Satisfação com as obras' },
            { id: 'local', nome: 'Satisfação com o local' },
            { id: 'funcionarios', nome: 'Satisfação com os funcionários' },
            { id: 'organizacao', nome: 'Satisfação com a organização' },
            { id: 'satis', nome: 'Satisfação com a experiência' }
        ];

        // Obter avaliações atuais
        const avaliacoesAtuais = categorias.map(categoria => {
            const radio = document.querySelector(`input[name="${categoria.id}"]:checked`);
            return {
                categoria: categoria.nome,
                valor: radio ? parseInt(radio.value) : null
            };
        });

        try {
            // Buscar histórico de avaliações do banco de dados
            const response = await fetch('http://localhost:5062/api/visitante/avaliacoes');
            const historicoAvaliacoes = await response.json();

            // Calcular médias combinando dados históricos com avaliação atual
            const mediasFinais = calcularMediasComHistorico(avaliacoesAtuais, historicoAvaliacoes);
            mostrarModalMediasDetalhadas(mediasFinais);

        } catch (erro) {
            console.error('Erro ao buscar histórico:', erro);
            // Se houver erro, mostra apenas as médias atuais
            const mediasAtuais = avaliacoesAtuais
                .filter(av => av.valor !== null)
                .map(av => ({
                    categoria: av.categoria,
                    media: av.valor
                }));
            mostrarModalMediasDetalhadas(mediasAtuais);
        }
    }

    function calcularMediasComHistorico(avaliacoesAtuais, historicoAvaliacoes) {
        const mediasPorCategoria = new Map();

        // Inicializar contadores para cada categoria
        avaliacoesAtuais.forEach(({ categoria }) => {
            mediasPorCategoria.set(categoria, {
                soma: 0,
                quantidade: 0
            });
        });

        // Somar valores históricos
        historicoAvaliacoes.forEach(avaliacao => {
            mediasPorCategoria.get('Satisfação com as obras').soma += avaliacao.questao1;
            mediasPorCategoria.get('Satisfação com o local').soma += avaliacao.questao2;
            mediasPorCategoria.get('Satisfação com os funcionários').soma += avaliacao.questao3;
            mediasPorCategoria.get('Satisfação com a organização').soma += avaliacao.questao4;
            mediasPorCategoria.get('Satisfação com a experiência').soma += avaliacao.questao5;

            mediasPorCategoria.forEach(valor => valor.quantidade++);
        });

        // Adicionar avaliações atuais se existirem
        avaliacoesAtuais.forEach(({ categoria, valor }) => {
            if (valor !== null) {
                const dados = mediasPorCategoria.get(categoria);
                dados.soma += valor;
                dados.quantidade++;
            }
        });

        // Calcular médias finais
        return Array.from(mediasPorCategoria.entries()).map(([categoria, dados]) => ({
            categoria,
            media: dados.quantidade > 0 ? (dados.soma / dados.quantidade).toFixed(1) : 'N/A'
        }));
    }

    function mostrarModalMediasDetalhadas(medias) {
        const modalExistente = document.querySelector('.modal-avaliacao');
        if (modalExistente) {
            modalExistente.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-avaliacao';

        const mediasHTML = medias
            .map(({ categoria, media }) => 
                `<p>${categoria}: <strong>${media}</strong> / 5</p>`
            )
            .join('');

        const mediaGeral = medias
            .filter(m => m.media !== 'N/A')
            .reduce((acc, curr) => acc + parseFloat(curr.media), 0) / 
            medias.filter(m => m.media !== 'N/A').length;

        modal.innerHTML = `
            <div class="modal-content">
                <h3>Médias de Avaliações</h3>
                ${mediasHTML}
                <p class="media-geral">Média Geral: <strong>${mediaGeral.toFixed(1)}</strong> / 5</p>
                <button class="fechar-modal">Fechar</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.fechar-modal').addEventListener('click', () => {
            modal.remove();
            window.location.href = '../../index.html'
        });
    }

    function limparFormulario() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelector('textarea').value = '';
    }

    async function enviarFormulario(event) {
        event.preventDefault();

        const nome = localStorage.getItem('visitorName') || 'Anônimo';
        const email = localStorage.getItem('visitorEmail') || '';

        const questao1 = document.querySelector('input[name="obras"]:checked')?.value;
        const questao2 = document.querySelector('input[name="local"]:checked')?.value;
        const questao3 = document.querySelector('input[name="funcionarios"]:checked')?.value;
        const questao4 = document.querySelector('input[name="organizacao"]:checked')?.value;
        const questao5 = document.querySelector('input[name="satis"]:checked')?.value;
        
        const sugestao = document.querySelector('textarea').value;

        if (!questao1 || !questao2 || !questao3 || !questao4 || !questao5) {
            alert('Por favor, responda todas as questões.');
            return;
        }

        // Calcular e mostrar médias detalhadas antes de enviar
        await calcularMediasPorCategoria();

        const dados = {
            nome: nome,
            email: email,
            sugestao: sugestao,
            questao1: parseInt(questao1),
            questao2: parseInt(questao2),
            questao3: parseInt(questao3),
            questao4: parseInt(questao4),
            questao5: parseInt(questao5)
        };

        try {
            const response = await fetch('http://localhost:5062/api/visitante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                localStorage.removeItem('visitorName');
                localStorage.removeItem('visitorEmail');
                
                setTimeout(() => {
                    console.log('Questionário enviado com sucesso!');
                    limparFormulario();
                }, 1500);
            } else {
                throw new Error('Erro ao enviar questionário');
            }
        } catch (erro) {
            console.error('Erro:', erro);
            alert('Erro ao enviar o questionário. Por favor, tente novamente.');
        }
    }

    // Funções do modo escuro
    function aplicarModoEscuro(ativar) {
        document.body.classList.toggle("modoEscuro", ativar);
        document.querySelector("header")?.classList.toggle("modoEscuro_PxN", ativar);
        document.querySelector("footer")?.classList.toggle("modoEscuro_PxN", ativar);
        
        const elementos = [             
            ".body_obras",             
            ".body_sobree",             
            ".sobre_nos",             
            ".sessao_obras",             
            ".nossas_obras",             
            ".faq-informacoes",             
            ".horario_museu",             
            ".funcionamento_museu",             
            ".endereco_museu",             
            ".titulo_museu",             
            ".escrita_museu"         
        ];          
        
        elementos.forEach(selector => {             
            const elemento = document.querySelector(selector);             
            if (elemento) {                 
                elemento.classList.toggle("modoEscuro_PxN", ativar);             
            }         
        });

        localStorage.setItem("modoEscuro", ativar ? "ativado" : "desativado");
    }

    // Validação de email
    function isValidEmail(email) {
        if (!email) return true; // Email é opcional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Inicialização do modo escuro
    const modoEscuroSalvo = localStorage.getItem("modoEscuro");
    if (modoEscuroSalvo === "ativado") {
        aplicarModoEscuro(true);
        if (temaEscuro.type === "checkbox") {
            temaEscuro.checked = true;
        }
    }

    // Event Listeners
    temaEscuro.addEventListener("click", function() {
        const isAtivado = document.body.classList.contains("modoEscuro");
        aplicarModoEscuro(!isAtivado);
    });

    const botaoFormulario = document.querySelector('.Botao_Formulario');
    if (botaoFormulario) {
        botaoFormulario.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nomeInput = document.querySelector('input[type="text"]');
            const emailInput = document.querySelector('input[type="email"]');
            
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            
            if (!nome) {
                alert('Por favor, insira seu nome para continuar.');
                nomeInput.focus();
                return;
            }

            if (email && !isValidEmail(email)) {
                alert('Por favor, insira um email válido ou deixe o campo em branco.');
                emailInput.focus();
                return;
            }
            
            localStorage.setItem('visitorName', nome);
            if (email) {
                localStorage.setItem('visitorEmail', email);
            }
            
            window.location.href = 'Templates/Views/questionario.html';
        });
    }

    const botaoEnviar = document.querySelector('.Botao_Questionario');
    if (botaoEnviar) {
        botaoEnviar.addEventListener('click', enviarFormulario);
    }
});