document.addEventListener("DOMContentLoaded", function() {     
    const temaEscuro = document.getElementById("sistema_modoEscuro");      
    
    temaEscuro.addEventListener("click", function() {         
        document.body.classList.toggle("modoEscuro");         
        document.querySelector("header").classList.toggle("modoEscuro_PxN");         
        document.querySelector("footer").classList.toggle("modoEscuro_PxN");                  
        
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
                elemento.classList.toggle("modoEscuro_PxN");             
            }         
        });     
    }); 

    // Função para validar email
    function isValidEmail(email) {
        if (!email) return true; // Email é opcional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Código para o formulário inicial
    const botaoFormulario = document.querySelector('.Botao_Formulario');
    if (botaoFormulario) {
        botaoFormulario.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nomeInput = document.querySelector('input[type="text"]');
            const emailInput = document.querySelector('input[type="email"]');
            
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            
            // Validação do nome (obrigatório)
            if (!nome) {
                alert('Por favor, insira seu nome para continuar.');
                nomeInput.focus();
                return;
            }

            // Validação do email (opcional, mas deve ser válido se preenchido)
            if (email && !isValidEmail(email)) {
                alert('Por favor, insira um email válido ou deixe o campo em branco.');
                emailInput.focus();
                return;
            }
            
            // Se chegou aqui, as validações passaram
            localStorage.setItem('visitorName', nome);
            if (email) {
                localStorage.setItem('visitorEmail', email);
            }
            
            // Redirecionar para a página do questionário
            window.location.href = 'Templates/Views/questionario.html';
        });
    }

    // Código para a página do questionário
    const botaoEnviar = document.querySelector('.Botao_Questionario');
    if (botaoEnviar) {
        botaoEnviar.addEventListener('click', enviarFormulario);
    }
});

// Funções do questionário (mantidas as mesmas)
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
            
            alert('Questionário enviado com sucesso!');
            limparFormulario();
        } else {
            throw new Error('Erro ao enviar questionário');
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao enviar o questionário. Por favor, tente novamente.');
    }
}

function limparFormulario() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    document.querySelector('textarea').value = '';
}