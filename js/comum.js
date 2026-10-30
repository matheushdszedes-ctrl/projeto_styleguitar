/* ==========================================================
   COMUM – js/comum.js (carregue em TODAS as páginas, antes do js da página)
   - contador do carrinho no menu
   - usuário logado: "Login" vira "Sair (Nome)" e "Cadastro" some
   - SG.aviso(): mensagem flutuante usada pelas outras páginas
   - SG.carrinho: ler/gravar o carrinho compartilhado
   ========================================================== */
(() => {
    'use strict';

    const CHAVE_CARRINHO = 'carrinhoStyleGuitar';
    const CHAVE_SESSAO = 'sessaoStyleGuitar';

    const SG = (window.SG = window.SG || {});

    /* ---------- utilitários ---------- */
    SG.moeda = v => v.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL',
        minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
        maximumFractionDigits: 2
    });

    const ler = (storage, chave) => {
        try { return JSON.parse(storage.getItem(chave)); } catch { return null; }
    };

    /* ---------- carrinho compartilhado ---------- */
    SG.carrinho = {
        ler() {
            const dados = ler(localStorage, CHAVE_CARRINHO);
            return Array.isArray(dados) ? dados : [];
        },
        salvar(itens) {
            try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens)); } catch {}
            atualizarContador();
        },
        adicionar(item) {
            const itens = this.ler();
            const existente = itens.find(i => i.id === item.id);
            if (existente) existente.qtd = Math.min(existente.qtd + 1, 10);
            else itens.push({ ...item, qtd: 1 });
            this.salvar(itens);
        },
        total() { return this.ler().reduce((s, i) => s + i.qtd, 0); }
    };

    function atualizarContador() {
        const n = SG.carrinho.total();
        document.querySelectorAll('#cart-badge, #cartCount').forEach(el => {
            el.textContent = n;
            el.classList.toggle('visivel', n > 0);
        });
    }

    /* ---------- sessão (login) ---------- */
    SG.sessao = {
        ler() { return ler(localStorage, CHAVE_SESSAO) || ler(sessionStorage, CHAVE_SESSAO); },
        salvar(usuario, lembrar) {
            const dados = JSON.stringify({ nome: usuario.nome, email: usuario.email });
            try {
                (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, dados);
            } catch {}
        },
        sair() {
            try { localStorage.removeItem(CHAVE_SESSAO); sessionStorage.removeItem(CHAVE_SESSAO); } catch {}
        }
    };

    function ajustarMenu() {
        const sessao = SG.sessao.ler();
        if (!sessao) return;

        const linkLogin = document.querySelector('.nav-links a[href$="login.html"]');
        const linkCadastro = document.querySelector('.nav-links a[href$="cadastro.html"]');

        if (linkCadastro) linkCadastro.closest('li').hidden = true;
        if (linkLogin) {
            const primeiro = String(sessao.nome || 'conta').split(' ')[0];
            linkLogin.textContent = `Sair (${primeiro})`;
            linkLogin.removeAttribute('href');
            linkLogin.style.cursor = 'pointer';
            linkLogin.addEventListener('click', e => {
                e.preventDefault();
                SG.sessao.sair();
                SG.aviso('Você saiu da sua conta');
                setTimeout(() => { location.href = 'login.html'; }, 700);
            });
        }
    }

    /* ---------- aviso (toast) ---------- */
    let toast, timer;
    SG.aviso = msg => {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        // força reflow para a animação rodar mesmo em avisos seguidos
        void toast.offsetWidth;
        toast.classList.add('visivel');
        clearTimeout(timer);
        timer = setTimeout(() => toast.classList.remove('visivel'), 2400);
    };

    /* ---------- iniciar ---------- */
    window.addEventListener('storage', e => { if (e.key === CHAVE_CARRINHO) atualizarContador(); });
    atualizarContador();
    ajustarMenu();
})();
