// Configurações globais
let config = { 
    powerAutomateUrl: '',
    powerAutomateUrlVerificar: '',
    powerAutomateUrlVerificarTecnico: ''
};
let siteNameAtual = '';
let projetoAtual = '';
let dadosExistentes = null;

// ================== FUNÇÕES DE CONFIGURAÇÃO ==================

function carregarConfiguracao() {
    const saved = localStorage.getItem('agendamentoConfig');
    if (saved) {
        config = JSON.parse(saved);
        document.getElementById('powerAutomateUrl').value = config.powerAutomateUrl || '';
        document.getElementById('powerAutomateUrlVerificar').value = config.powerAutomateUrlVerificar || '';
        document.getElementById('powerAutomateUrlVerificarTecnico').value = config.powerAutomateUrlVerificarTecnico || '';
    }
}

function salvarConfiguracao() {
    config.powerAutomateUrl = document.getElementById('powerAutomateUrl').value.trim();
    config.powerAutomateUrlVerificar = document.getElementById('powerAutomateUrlVerificar').value.trim();
    config.powerAutomateUrlVerificarTecnico = document.getElementById('powerAutomateUrlVerificarTecnico').value.trim();
    localStorage.setItem('agendamentoConfig', JSON.stringify(config));
    showMessage('✅ Configuração salva!', 'success', 'configMessage');
}

// ================== FUNÇÕES DE DEBUG ==================

function debugConfiguracao() {
    console.log('🔍 === DEBUG DA CONFIGURAÇÃO ===');
    console.log('⚙️ Configuração salva:', config);
    console.log('🔗 URL atual:', document.getElementById('powerAutomateUrl').value);
    console.log('🔗 URL verificação:', document.getElementById('powerAutomateUrlVerificar').value);
    console.log('🔗 URL verificação técnico:', document.getElementById('powerAutomateUrlVerificarTecnico').value);
    console.log('💾 Dados do localStorage:', localStorage.getItem('agendamentoConfig'));
    console.log('=== FIM DO DEBUG ===');
    
    showMessage('✅ Configuração exibida no console', 'success', 'configMessage');
}

function testarConexao() {
    const url = document.getElementById('powerAutomateUrl').value.trim();
    const urlVerificar = document.getElementById('powerAutomateUrlVerificar').value.trim();
    const urlVerificarTecnico = document.getElementById('powerAutomateUrlVerificarTecnico').value.trim();
    
    if (!url || !urlVerificar || !urlVerificarTecnico) {
        showMessage('❌ Configure todas as URLs primeiro', 'error', 'configMessage');
        return;
    }

    console.log('🔍 === TESTE DE CONEXÃO ===');
    console.log('🔗 URL Atualização:', url);
    console.log('🔗 URL Verificação:', urlVerificar);
    console.log('🔗 URL Verificação Técnico:', urlVerificarTecnico);
    
    showMessage('✅ URLs configuradas - verifique o console', 'success', 'configMessage');
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
        console.warn('⚠️ URL de verificação de técnico não configurada');
        return null;
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosVerificacao)
        });

        if (!response.ok) {
            throw new Error(`Erro na verificação: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('📥 Resultado da verificação de técnico:', resultado);

        return resultado;

    } catch (error) {
        console.error('❌ Erro na verificação de técnico:', error);
        return null;
    }
}

// ================== FUNÇÕES DE BUSCA E VERIFICAÇÃO ==================

async function buscarDados() {
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

    if (!config.powerAutomateUrlVerificar) {
        showMessage('❌ Configure a URL de verificação primeiro', 'error');
        return;
    }

    const btnBuscar = document.getElementById('btnBuscar');
    const btnBuscarText = document.getElementById('btnBuscarText');
    const btnBuscarLoader = document.getElementById('btnBuscarLoader');
    
    btnBuscarText.textContent = 'Verificando...';
    btnBuscarLoader.style.display = 'inline-block';
    btnBuscar.disabled = true;

    try {
        const dadosVerificacao = {
            projeto: projeto,
            chave: chaveBusca,
            action: 'verificar'
        };

        console.log('🔍 Verificando existência na planilha:', dadosVerificacao);

        const response = await fetch(config.powerAutomateUrlVerificar, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosVerificacao)
        });

        if (!response.ok) {
            throw new Error(`Erro na verificação: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('📥 Resultado da verificação:', resultado);

        if (resultado.existe) {
            projetoAtual = projeto;
            siteNameAtual = chaveBusca;
            dadosExistentes = resultado.dados;

            document.getElementById('projeto').value = projeto;
            document.getElementById('projeto').disabled = false;
            document.getElementById('submitBtn').disabled = false;
            
            const displayText = projeto === 'Atacadao' ? 
                `<strong>Site Name:</strong> ${chaveBusca}` : 
                `<strong>Chave Bradesco:</strong> ${chaveBusca}`;
            
            document.getElementById('siteNameDisplay').innerHTML = displayText;
            document.getElementById('chaveLabel').textContent = projeto === 'Atacadao' ? 
                'Site Name (Chave):' : 'Chave Bradesco:';

            preencherFormularioComDadosExistentes(resultado.dados);

            const tecnico = resultado.dados.Técnico || resultado.dados.tecnico;
            const data = resultado.dados.Data || resultado.dados.data;
            const horario = resultado.dados.Horario || resultado.dados.horario;
            
            if (tecnico && data && horario) {
                const conflitoTecnico = await verificarConflitoTecnico(tecnico, data, horario, chaveBusca);
                if (conflitoTecnico && conflitoTecnico.conflito) {
                    showMessage(`⚠️ ${conflitoTecnico.mensagem}`, 'warning');
                } else {
                    showMessage('✅ Dados encontrados na planilha! Formulário preenchido.', 'success');
                }
            } else {
                showMessage('✅ Dados encontrados na planilha! Formulário preenchido.', 'success');
            }
            
        } else {
            projetoAtual = projeto;
            siteNameAtual = chaveBusca;
            dadosExistentes = null;

            document.getElementById('projeto').value = projeto;
            document.getElementById('projeto').disabled = false;
            document.getElementById('submitBtn').disabled = false;
            
            const displayText = projeto === 'Atacadao' ? 
                `<strong>Site Name:</strong> ${chaveBusca}` : 
                `<strong>Chave Bradesco:</strong> ${chaveBusca}`;
            
            document.getElementById('siteNameDisplay').innerHTML = displayText;
            document.getElementById('chaveLabel').textContent = projeto === 'Atacadao' ? 
                'Site Name (Chave):' : 'Chave Bradesco:';

            limparCamposFormulario();
            showMessage('⚠️ Chave não encontrada. Preencha os dados para novo agendamento.', 'warning');
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error);
        showMessage(`❌ Erro ao verificar: ${error.message}`, 'error');
    } finally {
        btnBuscarText.textContent = '🔍 Buscar e Carregar Dados';
        btnBuscarLoader.style.display = 'none';
        btnBuscar.disabled = false;
    }
}

function preencherFormularioComDadosExistentes(dados) {
    console.log('📝 Preenchendo formulário com dados existentes:', dados);
    
    document.getElementById('tecnico').value = dados.Técnico || dados.tecnico || '';
    document.getElementById('cpf').value = dados.Cpf || dados.cpf || '';
    
    let dataFormatada = dados.Data || dados.data || '';
    if (dataFormatada && dataFormatada.includes('/')) {
        const partes = dataFormatada.split('/');
        if (partes.length === 3) {
            dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        }
    }
    document.getElementById('data').value = dataFormatada;
    
    document.getElementById('horario').value = dados.Horario || dados.horario || '';
    document.getElementById('status').value = dados.Status || dados.status || 'Agendado';
    document.getElementById('observacoes').value = dados.Observacoes || dados.observacoes || '';

    if (projetoAtual === 'Bradesco') {
        document.getElementById('chave').value = dados.Chave || dados.chave || siteNameAtual;
    }

    toggleCamposFormulario();
}

function limparCamposFormulario() {
    document.getElementById('tecnico').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('data').value = '';
    document.getElementById('horario').value = '';
    document.getElementById('status').value = 'Agendado';
    document.getElementById('observacoes').value = '';

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
    document.getElementById('campoAtacadao').style.display = 'none';
    document.getElementById('campoBradesco').style.display = 'none';
    siteNameAtual = '';
    projetoAtual = '';
    dadosExistentes = null;
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

document.getElementById('agendamentoForm').addEventListener('submit', async function (e) {
    e.preventDefault();

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
        const conflitoTecnico = await verificarConflitoTecnico(tecnico, data, horario, siteNameAtual);
        
        if (conflitoTecnico && conflitoTecnico.conflito) {
            showMessage(`❌ ${conflitoTecnico.mensagem}`, 'error');
            highlightCamposConflitantes();
            
            btnText.textContent = 'Atualizar Linha na Planilha';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const responseText = await response.text();
        console.log('📥 Resposta bruta do Power Automate:', responseText);

        let resultado;
        if (responseText && responseText.trim() !== '') {
            try {
                resultado = JSON.parse(responseText);
            } catch (jsonError) {
                resultado = {
                    success: response.ok,
                    message: responseText
                };
            }
        } else {
            resultado = {
                success: response.ok,
                message: 'Atualização realizada com sucesso'
            };
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
            limparFormulario();
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

// ================== FUNÇÕES UTILITÁRIAS ==================

function showMessage(text, type, elementId = 'message') {
    const message = document.getElementById(elementId);
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    setTimeout(() => message.style.display = 'none', 5000);
}

function aplicarMascaraCPF(cpf) {
    let value = cpf.replace(/\D/g, '');
    if (value.length > 3) value = value.substring(0, 3) + '.' + value.substring(3);
    if (value.length > 7) value = value.substring(0, 7) + '.' + value.substring(7);
    if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11, 13);
    return value;
}

// ================== INICIALIZAÇÃO ==================

window.onload = function () {
    carregarConfiguracao();
    
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').min = hoje;

    document.getElementById('cpf').addEventListener('input', function (e) {
        e.target.value = aplicarMascaraCPF(e.target.value);
    });

    document.getElementById('powerAutomateUrl').addEventListener('blur', function() {
        if (this.value.trim()) {
            salvarConfiguracao();
        }
    });
    
    document.getElementById('powerAutomateUrlVerificar').addEventListener('blur', function() {
        if (this.value.trim()) {
            salvarConfiguracao();
        }
    });

    document.getElementById('powerAutomateUrlVerificarTecnico').addEventListener('blur', function() {
        if (this.value.trim()) {
            salvarConfiguracao();
        }
    });
};