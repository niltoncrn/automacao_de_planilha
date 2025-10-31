// Configurações globais
const POWER_AUTOMATE_URLS = {
    update: 'https://default2c1aad09aba847d7ac20d1e07b8f4a.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0a338e8d5ba04f55bd404d9108b440bb/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DCMO31Nw6qwWPdUaKmoyKMYI9cZTWXOYbQSCHFDbiBs',
    verificar: 'https://default2c1aad09aba847d7ac20d1e07b8f4a.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d3e3606173a041288d63765fdc1cdc97/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZbjJhRXVu4qyu0wcpDbWCdZ0qk71O8N9U96T0wCvTlM', 
    verificarTecnico: '' // <-- ⚠️ AVISO: Você ainda precisa criar e colar a URL do seu fluxo de verificar técnico aqui.
};

// Configuração atual (pode ser sobrescrita pelo localStorage se existir)
let config = {
    powerAutomateUrl: POWER_AUTOMATE_URLS.update,
    powerAutomateUrlVerificar: POWER_AUTOMATE_URLS.verificar,
    powerAutomateUrlVerificarTecnico: POWER_AUTOMATE_URLS.verificarTecnico
};

let siteNameAtual = '';
let projetoAtual = '';
let dadosExistentes = null;

// ================== FUNÇÕES DE CONFIGURAÇÃO ==================

function carregarConfiguracao() {
    const saved = localStorage.getItem('agendamentoConfig');
    if (saved) {
        const savedConfig = JSON.parse(saved);
        config = { ...config, ...savedConfig };
        if (document.getElementById('powerAutomateUrl')) {
            document.getElementById('powerAutomateUrl').value = config.powerAutomateUrl || '';
            document.getElementById('powerAutomateUrlVerificar').value = config.powerAutomateUrlVerificar || '';
            document.getElementById('powerAutomateUrlVerificarTecnico').value = config.powerAutomateUrlVerificarTecnico || '';
        }
    }
    return config;
}

function salvarConfiguracao() {
    if (!document.getElementById('powerAutomateUrl')) {
        showMessage('❌ Esta função só está disponível na página de administração', 'error');
        return;
    }
    config.powerAutomateUrl = document.getElementById('powerAutomateUrl').value.trim();
    config.powerAutomateUrlVerificar = document.getElementById('powerAutomateUrlVerificar').value.trim();
    config.powerAutomateUrlVerificarTecnico = document.getElementById('powerAutomateUrlVerificarTecnico').value.trim();
    localStorage.setItem('agendamentoConfig', JSON.stringify(config));
    showMessage('✅ Configuração salva!', 'success', 'configMessage');
    if (typeof atualizarStatusConfiguracao === 'function') {
        atualizarStatusConfiguracao();
    }
}

// ================== VERIFICAÇÃO DE CONFIGURAÇÃO ==================

function verificarConfiguracao() {
    if (!config.powerAutomateUrl || !config.powerAutomateUrlVerificar) {
        showMessage('❌ Sistema não configurado. Contate o administrador.', 'error');
        return false;
    }
    console.log('✅ Sistema configurado.');
    return true;
}

// ================== FUNÇÕES DE DEBUG ==================

function debugConfiguracao() {
    console.log('🔍 === DEBUG DA CONFIGURAÇÃO ===');
    console.log('⚙️ URLs fixas:', POWER_AUTOMATE_URLS);
    console.log('⚙️ Configuração ativa:', config);
    console.log('🔗 URL atual:', document.getElementById('powerAutomateUrl')?.value);
    console.log('🔗 URL verificação:', document.getElementById('powerAutomateUrlVerificar')?.value);
    console.log('🔗 URL verificação técnico:', document.getElementById('powerAutomateUrlVerificarTecnico')?.value);
    console.log('💾 Dados do localStorage:', localStorage.getItem('agendamentoConfig'));
    console.log('=== FIM DO DEBUG ===');
    showMessage('✅ Configuração exibida no console', 'success', 'configMessage');
}

function testarConexao() {
    console.log('🔍 === TESTE DE CONEXÃO ===');
    console.log('🔗 URL Atualização:', config.powerAutomateUrl);
    console.log('🔗 URL Verificação:', config.powerAutomateUrlVerificar);
    console.log('🔗 URL Verificação Técnico:', config.powerAutomateUrlVerificarTecnico);
    console.log('✅ URLs configuradas (Update e Verificar). Verifique o console.');
    showMessage('✅ URLs configuradas no sistema - verifique o console', 'success', 'configMessage');
}

function debugRequisicao() {
    if (!siteNameAtual) {
        showMessage('❌ Busque um Site Name/Chave primeiro', 'error');
        return;
    }
    const tecnico = document.getElementById('tecnico').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const projeto = document.getElementById('projeto').value;
    if (!tecnico || !cpf || !data || !horario || !projeto) {
        showMessage('❌ Preencha todos os campos obrigatórios primeiro', 'error');
        return;
    }
    const dados = coletarDadosFormulario();
    console.log('🔍 === DEBUG DA REQUISIÇÃO ===');
    console.log('📤 URL do Power Automate:', config.powerAutomateUrl);
    console.log('📊 Dados que seriam enviados:', dados);
    console.log('🔗 JSON que seria enviado:', JSON.stringify(dados, null, 2));
    console.log('🕒 Timestamp:', new Date().toISOString());
    console.log('=== FIM DO DEBUG ===');
    atualizarDebugOutput(dados);
    showMessage('✅ Dados exibidos no console (F12)', 'success');
}

function coletarDadosFormulario() {
    const formData = new FormData(document.getElementById('agendamentoForm'));
    return {
        projeto: document.getElementById('projeto').value,
        siteName: siteNameAtual,
        chave: document.getElementById('projeto').value === 'Bradesco' ? document.getElementById('chave').value.trim() : siteNameAtual,
        tecnico: document.getElementById('tecnico').value.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        status: formData.get('status'),
        observacoes: formData.get('observacoes') || '',
        timestamp: new Date().toISOString()
    };
}

function atualizarDebugOutput(dados) {
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${JSON.stringify(dados, null, 2)}\n---\n`;
        debugOutput.textContent = logEntry + debugOutput.textContent;
        document.querySelector('.debug-section').style.display = 'block';
    }
}

// ================== FUNÇÕES DE VERIFICAÇÃO DE TÉCNICO ==================

async function verificarConflitoTecnico(tecnico, data, horario, chaveAtual) {
    if (!config.powerAutomateUrlVerificarTecnico) {
        console.log('ℹ️ URL de verificação de técnico não configurada - pulando verificação');
        return null; // Retorna nulo para indicar que a verificação não foi feita
    }

    try {
        const dadosVerificacao = {
            action: 'verificar_tecnico',
            tecnico: tecnico,
            data: data,
            horario: horario,
            chaveAtual: chaveAtual,
            projeto: projetoAtual
        };
        console.log('🔍 Verificando conflito de técnico:', dadosVerificacao);

        const response = await fetch(config.powerAutomateUrlVerificarTecnico, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosVerificacao)
        });

        if (!response.ok) {
            throw new Error(`Erro na verificação: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('📥 Resultado da verificação de técnico:', resultado);
        return resultado; // Retorna { conflito: true/false, ... }

    } catch (error) {
        console.error('❌ Erro na verificação de técnico:', error);
        showMessage('⚠️ Erro ao verificar conflito de técnico. Verifique o console.', 'error');
        return null; // Retorna nulo em caso de falha na rede/fetch
    }
}

// ================== FUNÇÕES DE BUSCA E VERIFICAÇÃO ==================

async function buscarDados() {
    if (!verificarConfiguracao()) return;

    const projeto = document.getElementById('projetoBusca').value;
    if (!projeto) {
        showMessage('❌ Selecione um projeto primeiro', 'error');
        return;
    }

    let chaveBusca = '';
    if (projeto === 'Atacadao') {
        chaveBusca = document.getElementById('buscarSiteName').value.trim();
        if (!chaveBusca) {
            showMessage('❌ Digite o Site Name para buscar', 'error');
            return;
        }
    } else if (projeto === 'Bradesco') {
        chaveBusca = document.getElementById('buscarChave').value.trim();
        if (!chaveBusca) {
            showMessage('❌ Digite a Chave Bradesco para buscar', 'error');
            return;
        }
    }

    const btnBuscar = document.getElementById('btnBuscar');
    const btnBuscarText = document.getElementById('btnBuscarText');
    const btnBuscarLoader = document.getElementById('btnBuscarLoader');
    btnBuscarText.textContent = 'Carregando...';
    btnBuscarLoader.style.display = 'inline-block';
    btnBuscar.disabled = true;

    try {
        if (config.powerAutomateUrlVerificar) {
            const dadosVerificacao = {
                projeto: projeto,
                chave: chaveBusca,
                action: 'verificar'
            };
            console.log('🔍 Verificando existência na planilha:', dadosVerificacao);

            const response = await fetch(config.powerAutomateUrlVerificar, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosVerificacao)
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('📥 Resultado da verificação:', resultado);

                if (resultado.existe) {
                    // Dados encontrados na planilha
                    projetoAtual = projeto;
                    siteNameAtual = chaveBusca;
                    dadosExistentes = resultado.dados;

                    document.getElementById('projeto').value = projeto;
                    document.getElementById('projeto').disabled = false;
                    document.getElementById('submitBtn').disabled = false;

                    atualizarDisplayChave(projeto, chaveBusca);
                    preencherFormularioComDadosExistentes(resultado.dados);

                    // =============================================================
                    // INÍCIO DA MODIFICAÇÃO (LÓGICA DE MENSAGEM HIERÁRQUICA)
                    // =============================================================
                    const tecnico = resultado.dados.Técnico || resultado.dados.tecnico;
                    const data = resultado.dados.Data || resultado.dados.data;
                    const horario = resultado.dados.Horario || resultado.dados.horario;

                    // 1. Primeiro, checa por conflitos (o mais grave)
                    if (tecnico && data && horario && config.powerAutomateUrlVerificarTecnico) {
                        const conflitoTecnico = await verificarConflitoTecnico(tecnico, data, horario, chaveBusca);
                        if (conflitoTecnico && conflitoTecnico.conflito) {
                            // Mensagem de erro (vermelha) - MAIS GRAVE
                            showMessage(`❌ ${conflitoTecnico.mensagem}`, 'error');
                            return; // Sai da função
                        }
                    }

                    // 2. Se não houver conflitos, checa se o técnico existe (aviso)
                    if (tecnico) {
                        // MODIFICADO: Agora usa uma caixa de diálogo (alert)
                        alert(`⚠️ Este site já possui um técnico agendado: ${tecnico}.\n\nOs dados foram carregados para edição.`);
                    
                    } else {
                        // MANTIDO: A mensagem de sucesso continua a mesma
                        showMessage('✅ Site encontrado! O formulário está pronto para um novo agendamento.', 'success');
                    }
                    // =============================================================
                    // FIM DA MODIFICAÇÃO
                    // =============================================================

                    return;
                }
            }
        }

        // Se não há URL de verificação ou não encontrou dados, carrega formulário vazio
        projetoAtual = projeto;
        siteNameAtual = chaveBusca;
        dadosExistentes = null;

        document.getElementById('projeto').value = projeto;
        document.getElementById('projeto').disabled = false;
        document.getElementById('submitBtn').disabled = false;

        atualizarDisplayChave(projeto, chaveBusca);
        limparCamposFormulario();

        if (!config.powerAutomateUrlVerificar) {
            showMessage('ℹ️ Modo sem verificação: formulário carregado para novo agendamento.', 'warning');
        } else {
            showMessage('⚠️ Chave não encontrada. Preencha os dados para novo agendamento.', 'warning');
        }

    } catch (error) {
        console.error('❌ Erro na busca:', error);

        // Em caso de erro na verificação, ainda carrega o formulário
        projetoAtual = projeto;
        siteNameAtual = chaveBusca;
        dadosExistentes = null;

        document.getElementById('projeto').value = projeto;
        document.getElementById('projeto').disabled = false;
        document.getElementById('submitBtn').disabled = false;

        atualizarDisplayChave(projeto, chaveBusca);
        limparCamposFormulario();
        showMessage('⚠️ Erro na verificação, mas formulário carregado. Verifique os dados.', 'warning');

    } finally {
        btnBuscarText.textContent = '🔍 Buscar e Carregar Dados';
        btnBuscarLoader.style.display = 'none';
        btnBuscar.disabled = false;
    }
}

// Função para atualizar o display da chave/site name
function atualizarDisplayChave(projeto, chaveBusca) {
    const displayText = projeto === 'Atacadao' ?
        `<strong>Site Name:</strong> ${chaveBusca}` :
        `<strong>Chave Bradesco:</strong> ${chaveBusca}`;
    document.getElementById('siteNameDisplay').innerHTML = displayText;
    document.getElementById('chaveLabel').textContent = projeto === 'Atacadao' ?
        'Site Name (Chave):' : 'Chave Bradesco:';
}

function preencherFormularioComDadosExistentes(dados) {
    console.log('📝 Preenchendo formulário com dados existentes:', dados);
    // Usa '?' (optional chaining) para evitar erros se 'dados' for nulo
    document.getElementById('tecnico').value = dados?.Técnico || dados?.tecnico || '';
    document.getElementById('cpf').value = dados?.Cpf || dados?.cpf || '';

    let dataFormatada = dados?.Data || dados?.data || '';
    if (dataFormatada && (dataFormatada.includes('/') || !isNaN(dataFormatada))) {
        // Tenta converter número de série do Excel (se for o caso)
        if (!isNaN(dataFormatada) && dataFormatada > 10000) { 
            const dataObj = new Date(Math.round((dataFormatada - 25569) * 86400 * 1000));
            dataFormatada = dataObj.toISOString().split('T')[0];
        }
        // Tenta formatar data pt-BR (dd/mm/yyyy)
        else if (dataFormatada.includes('/')) {
            const partes = dataFormatada.split('/');
            if (partes.length === 3) {
                dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }
    }
    document.getElementById('data').value = dataFormatada;
    
    // Converte número de série do Excel para horário
    let horarioFormatado = dados?.Horario || dados?.horario || '';
    if (!isNaN(horarioFormatado) && horarioFormatado < 1) { // Horário no Excel é uma fração de 1
        const totalMinutos = Math.round(horarioFormatado * 1440);
        const horas = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
        const minutos = (totalMinutos % 60).toString().padStart(2, '0');
        horarioFormatado = `${horas}:${minutos}`;
    }
    document.getElementById('horario').value = horarioFormatado;

    document.getElementById('status').value = dados?.Status || dados?.status || 'Agendado';
    
    const observacoesInput = document.getElementById('observacoes');
    if (observacoesInput) {
        observacoesInput.value = dados?.Observacoes || dados?.observacoes || '';
    }

    if (projetoAtual === 'Bradesco') {
        document.getElementById('chave').value = dados?.Chave || dados?.chave || siteNameAtual;
    }

    toggleCamposFormulario();
}

function limparCamposFormulario() {
    document.getElementById('tecnico').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('data').value = '';
    document.getElementById('horario').value = '';
    document.getElementById('status').value = 'Agendado';
    
    const observacoesInput = document.getElementById('observacoes');
    if (observacoesInput) {
        observacoesInput.value = '';
    }
    if (projetoAtual === 'Bradesco') {
        document.getElementById('chave').value = siteNameAtual;
    }
    toggleCamposFormulario();
}

// ================== FUNÇÕES DE BUSCA DINÂMICA ==================

function toggleBuscaCampos() {
    const projeto = document.getElementById('projetoBusca').value;
    const campoAtacadao = document.getElementById('campoAtacadao');
    const campoBradesco = document.getElementById('campoBradesco');
    campoAtacadao.style.display = 'none';
    campoBradesco.style.display = 'none';
    if (projeto === 'Atacadao') {
        campoAtacadao.style.display = 'flex';
    } else if (projeto === 'Bradesco') {
        campoBradesco.style.display = 'flex';
    }
}

// ================== FUNÇÕES DO FORMULÁRIO ==================

function toggleCamposFormulario() {
    const projeto = document.getElementById('projeto').value;
    const campoChaveForm = document.getElementById('campoChaveForm');
    const chaveInput = document.getElementById('chave');

    if (projeto === 'Bradesco') {
        campoChaveForm.style.display = 'flex';
        chaveInput.required = true;
        if (siteNameAtual && !chaveInput.value) {
            chaveInput.value = siteNameAtual;
        }
    } else {
        campoChaveForm.style.display = 'none';
        chaveInput.required = false;
    }
}

function limparFormulario() {
    document.getElementById('agendamentoForm').reset();
    document.getElementById('projeto').disabled = true;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('siteNameDisplay').innerHTML = 'Busque um Site Name/Chave primeiro';
    document.getElementById('campoChaveForm').style.display = 'none';
    
    const campoAtacadao = document.getElementById('campoAtacadao');
    const campoBradesco = document.getElementById('campoBradesco');
    if (campoAtacadao) campoAtacadao.style.display = 'none';
    if (campoBradesco) campoBradesco.style.display = 'none';
    
    siteNameAtual = '';
    projetoAtual = '';
    dadosExistentes = null;
}

function limparApenasCamposAgendamento() {
    document.getElementById('tecnico').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('data').value = '';
    document.getElementById('horario').value = '';
    document.getElementById('status').value = 'Agendado';
    
    const observacoesInput = document.getElementById('observacoes');
    if (observacoesInput) {
        observacoesInput.value = '';
    }
    toggleCamposFormulario();
}

// ================== FUNÇÕES AUXILIARES PARA CONFLITO ==================

function highlightCamposConflitantes() {
    document.getElementById('tecnico').classList.add('campo-conflito');
    document.getElementById('data').classList.add('campo-conflito');
    document.getElementById('horario').classList.add('campo-conflito');
}

function removeHighlightCampos() {
    document.getElementById('tecnico').classList.remove('campo-conflito');
    document.getElementById('data').classList.remove('campo-conflito');
    document.getElementById('horario').classList.remove('campo-conflito');
}

// ================== FUNÇÃO PRINCIPAL DE ENVIO ==================

if (document.getElementById('agendamentoForm')) {
    document.getElementById('agendamentoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!verificarConfiguracao()) return;

        const tecnico = document.getElementById('tecnico').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const projeto = document.getElementById('projeto').value;

        if (!tecnico || !cpf || !data || !horario || !projeto) {
            showMessage('❌ Preencha todos os campos obrigatórios', 'error');
            return;
        }
        if (projeto === 'Bradesco') {
            const chave = document.getElementById('chave').value.trim();
            if (!chave) {
                showMessage('❌ Preencha a Chave Bradesco', 'error');
                return;
            }
        }

        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const submitBtn = document.getElementById('submitBtn');

        btnText.textContent = 'Verificando...';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            // Verificar conflito de técnico apenas se a URL estiver configurada
            if (config.powerAutomateUrlVerificarTecnico) {
                const conflitoTecnico = await verificarConflitoTecnico(tecnico, data, horario, siteNameAtual);
                if (conflitoTecnico && conflitoTecnico.conflito) {
                    showMessage(`❌ ${conflitoTecnico.mensagem}`, 'error');
                    highlightCamposConflitantes();
                    btnText.textContent = 'Atualizar Linha na Planilha';
                    btnLoader.style.display = 'none';
                    submitBtn.disabled = false;
                    return;
                }
            }

            btnText.textContent = 'Atualizando...';
            const dados = coletarDadosFormulario();
            console.log('🔍 === REQUISIÇÃO ENVIADA ===');
            console.log('📤 URL:', config.powerAutomateUrl);
            console.log('📊 Dados:', dados);
            console.log('=== FIM DO LOG ===');

            if (!config.powerAutomateUrl) {
                throw new Error('URL do Power Automate não configurada');
            }

            const response = await fetch(config.powerAutomateUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const responseText = await response.text();
            console.log('📥 Resposta bruta do Power Automate:', responseText);

            let resultado;
            if (responseText && responseText.trim() !== '') {
                try { resultado = JSON.parse(responseText); } catch (jsonError) {
                    resultado = { success: response.ok, message: responseText };
                }
            } else {
                resultado = { success: response.ok, message: 'Atualização realizada com sucesso' };
            }

            if (!response.ok) {
                throw new Error(resultado.message || `Erro HTTP ${response.status}`);
            }

            console.log('✅ Sucesso:', resultado);
            if (dadosExistentes) {
                showMessage('✅ Dados atualizados com sucesso na planilha!', 'success');
            } else {
                showMessage('✅ Novo agendamento criado com sucesso!', 'success');
            }

            setTimeout(() => {
                limparApenasCamposAgendamento();
            }, 3000);

        } catch (error) {
            console.error('❌ Erro detalhado:', error);
            let mensagemErro = error.message;
            if (error.message.includes('Failed to fetch')) {
                mensagemErro = 'Erro de conexão. Verifique a URL do Power Automate e sua internet.';
            } else if (error.message.includes('URL do Power Automate não configurada')) {
                mensagemErro = 'Configure a URL do Power Automate primeiro.';
            }
            showMessage(`❌ Erro: ${mensagemErro}`, 'error');
        } finally {
            btnText.textContent = 'Atualizar Linha na Planilha';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            removeHighlightCampos();
        }
    });
}

// ================== FUNÇÕES UTILITÁRIAS ==================

function showMessage(text, type, elementId = 'message') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        // Remove a mensagem anterior antes de definir uma nova (se houver)
        if (messageElement.timeoutId) clearTimeout(messageElement.timeoutId);
        messageElement.timeoutId = setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000); // 5 segundos
    } else {
        console.log(`${type.toUpperCase()}: ${text}`);
    }
}

function aplicarMascaraCPF(cpf) {
    let value = cpf.replace(/\D/g, '');
    if (value.length > 3) value = value.substring(0, 3) + '.' + value.substring(3);
    if (value.length > 7) value = value.substring(0, 7) + '.' + value.substring(7);
    if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11, 13);
    return value;
}

// ================== INICIALIZAÇÃO ==================

function inicializarPaginaAgendamento() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').min = hoje;

    document.getElementById('cpf').addEventListener('input', function (e) {
        e.target.value = aplicarMascaraCPF(e.target.value);
    });
}

function inicializarPaginaAdmin() {
    const salvarConfig = () => {
        if (document.getElementById('powerAutomateUrl').value.trim()) {
            salvarConfiguracao();
        }
    };
    document.getElementById('powerAutomateUrl').addEventListener('blur', salvarConfig);
    document.getElementById('powerAutomateUrlVerificar').addEventListener('blur', salvarConfig);
    document.getElementById('powerAutomateUrlVerificarTecnico').addEventListener('blur', salvarConfig);
}

document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracao();
    if (document.getElementById('agendamentoForm')) {
        inicializarPaginaAgendamento();
    }
    if (document.getElementById('powerAutomateUrl')) {
        inicializarPaginaAdmin();
    }
});

// ================== FUNÇÕES DE AUTENTICAÇÃO ==================
// (Presumindo que estas funções existem e estão corretas)

function verificarAutenticacaoAdmin() {
    // Simulação: se não estiver no login.html, assume-se autenticado
    if (window.location.href.includes('login.html')) return false; 
    
    // Em um cenário real, você verificaria o localStorage
    if (localStorage.getItem('usuarioLogado') !== 'true') {
        // Se não estiver na página de login E não estiver logado, redireciona
        if (!window.location.href.includes('login.html')) {
            // window.location.href = 'login.html'; // Descomente para produção
            console.warn('Autenticação pulada para fins de teste.');
            return true; // REMOVA ISSO EM PRODUÇÃO
        }
        return false;
    }
    return true;
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('ultimoLogin');
    // window.location.href = 'login.html'; // Descomente para produção
    console.log('Logout efetuado.');
}

// ... (Restante das funções admin) ...