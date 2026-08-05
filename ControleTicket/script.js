document.addEventListener('DOMContentLoaded', () => {
            
    // Referências dos elementos
    const widgetPhone = document.querySelector('.widget-phone');
    const widgetHeader = document.querySelector('.widget-header');
    const campoData = document.getElementById('campoData');
    const campoTicket = document.getElementById('campoTicket');
    const campoContato = document.getElementById('campoContato');
    const campoOperacao = document.getElementById('campoOperacao');
    const campoAnalista = document.getElementById('campoAnalista');
    const campoDescricao = document.getElementById('campoDescricao');
    const campoStatus = document.getElementById('campoStatus');
    const campoQueda = document.getElementById('campoQueda');
    
    const btnCopiar = document.getElementById('btnCopiar');
    const btnLimpar = document.getElementById('btnLimpar');
    const toastMessage = document.getElementById('toastMessage');

    // ==========================================
    // MÁSCARA CORRIGIDA E SIMPLIFICADA
    // ==========================================
    const formatarDataHora = (valor) => {
        if (!valor) return '';
        
        // Remove tudo que não for número
        let v = valor.replace(/\D/g, ''); 
        
        // Limita a 12 dígitos no máximo (DDMMYYYYHHMM)
        if (v.length > 12) v = v.substring(0, 12); 

        // Constrói a formatação passo a passo (seguro e sem bugs)
        let formatted = '';
        if (v.length > 0) formatted += v.substring(0, 2);
        if (v.length > 2) formatted += '/' + v.substring(2, 4);
        if (v.length > 4) formatted += '/' + v.substring(4, 8);
        if (v.length > 8) formatted += ' ' + v.substring(8, 10);
        if (v.length > 10) formatted += ':' + v.substring(10, 12);
        
        return formatted;
    };

    // Aplica a formatação enquanto digita
    campoData.addEventListener('input', (e) => {
        e.target.value = formatarDataHora(e.target.value);
        salvarRascunho();
    });

    // ==========================================
    // LÓGICA DE ARRASTAR A JANELA (Drag & Drop)
    // ==========================================
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    if (widgetHeader && widgetPhone) {
        widgetHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = widgetPhone.getBoundingClientRect();
            
            widgetPhone.style.bottom = 'auto';
            widgetPhone.style.right = 'auto';
            
            widgetPhone.style.left = rect.left + 'px';
            widgetPhone.style.top = rect.top + 'px';

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;

            const maxLeft = window.innerWidth - widgetPhone.offsetWidth;
            const maxTop = window.innerHeight - widgetPhone.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            widgetPhone.style.left = `${newLeft}px`;
            widgetPhone.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });
    }

    // ==========================================
    // RECUPERAR RASCUNHO E LIMPAR
    // ==========================================
    const carregarRascunho = () => {
        const rascunho = JSON.parse(localStorage.getItem('rascunhoChamadoPM'));
        if (rascunho) {
            // AQUI ESTÁ A CORREÇÃO PRINCIPAL DO BUG AO ABRIR: 
            // Ele força a máscara no dado que veio salvo na memória
            if (rascunho.data) campoData.value = formatarDataHora(rascunho.data);
            
            campoTicket.value = rascunho.ticket || '';
            if (rascunho.contato) campoContato.value = rascunho.contato;
            if (rascunho.operacao) campoOperacao.value = rascunho.operacao;
            campoDescricao.value = rascunho.descricao || '';
            if (rascunho.status) campoStatus.value = rascunho.status;
            if (rascunho.queda) campoQueda.value = rascunho.queda;
        }
    };

    const salvarRascunho = () => {
        const dados = {
            data: campoData.value,
            ticket: campoTicket.value,
            contato: campoContato.value,
            operacao: campoOperacao.value,
            descricao: campoDescricao.value,
            status: campoStatus.value,
            queda: campoQueda.value
        };
        localStorage.setItem('rascunhoChamadoPM', JSON.stringify(dados));
    };

    const inputs = [campoTicket, campoContato, campoOperacao, campoDescricao, campoStatus, campoQueda];
    inputs.forEach(input => {
        input.addEventListener('input', salvarRascunho);
        input.addEventListener('change', salvarRascunho);
    });

    carregarRascunho();

    const mostrarToast = (mensagem) => {
        toastMessage.innerHTML = `<i class="mdi mdi-check-circle"></i> ${mensagem}`;
        toastMessage.classList.add('show');
        setTimeout(() => {
            toastMessage.classList.remove('show');
        }, 3000);
    };

    btnCopiar.addEventListener('click', async () => {
        const textoGerado = 
`Data: ${campoData.value || 'N/A'}
Ticket: ${campoTicket.value.trim() || 'N/A'}
Contato: ${campoContato.value}
Operação: ${campoOperacao.value}
Analista: ${campoAnalista.value}
Descrição: ${campoDescricao.value.trim() || 'Sem descrição.'}
Status: ${campoStatus.value}
Queda: ${campoQueda.value}`;

        try {
            await navigator.clipboard.writeText(textoGerado);
            mostrarToast("Copiado e pronto pro Teams!");
        } catch (err) {
            const textArea = document.createElement("textarea");
            textArea.value = textoGerado;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            mostrarToast("Copiado e pronto pro Teams!");
        }
    });

    btnLimpar.addEventListener('click', () => {
        campoData.value = '';
        campoTicket.value = '';
        campoContato.selectedIndex = 0;
        campoDescricao.value = '';
        campoStatus.selectedIndex = 0;
        campoQueda.selectedIndex = 0;
        
        salvarRascunho();
    });
});