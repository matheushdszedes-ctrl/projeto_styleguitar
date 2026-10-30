/* ==========================================================
   CUSTOM (texte.html) – js/custom.js
   Monte a sua guitarra: troca modelo, madeira, cor e acabamento,
   atualiza a pré-visualização, o resumo e o total, e adiciona
   a guitarra montada ao carrinho (categoria "Customizados").

   Os preços vêm do texto "+ R$ 1.200" de cada botão do html,
   então para mudar um valor basta editar o html.
   ========================================================== */
(() => {
    'use strict';

    const SG = window.SG;

    /* imagem de cada modelo (nome igual ao do botão) */
    const IMAGENS = {
        'Warlock':  '../img/WarlockGuitar.png',
        'Les Paul': '../img/LesPaulSlash.png',
        'Flying V': '../img/FlynigVBlack.png'
    };

    const grupos = [...document.querySelectorAll('.opcao-grupo')];
    if (grupos.length < 4) return;

    const [gModelo, gMadeira, gCor, gAcabamento] = grupos;

    const previewImg = document.querySelector('.preview-img');
    const previewFoto = previewImg.querySelector('img');
    const previewNome = document.querySelector('.preview-nome');
    const previewCor = document.querySelector('.preview-cor');
    const linhasResumo = [...document.querySelectorAll('.resumo-custom .resumo-linha strong')];
    const totalEl = document.querySelector('.resumo-custom .total span:last-child');
    const btnAdd = document.querySelector('.resumo-custom .btn');

    /* ---------- leitura dos botões ---------- */
    const precoDe = btn => {
        const t = btn.querySelector('small');
        if (!t) return 0;
        // "+ R$ 15.000" -> 15000
        return Number(t.textContent.replace(/[^\d]/g, '')) || 0;
    };
    const nomeDe = btn => {
        if (btn.classList.contains('cor-btn')) return btn.getAttribute('title') || '';
        const clone = btn.cloneNode(true);
        clone.querySelectorAll('small').forEach(s => s.remove());
        return clone.textContent.trim();
    };
    const ativoDe = grupo => grupo.querySelector('.ativo');
    const slug = txt => txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    /* ---------- estado atual ---------- */
    function escolha() {
        const modelo = ativoDe(gModelo), madeira = ativoDe(gMadeira),
              cor = ativoDe(gCor), acab = ativoDe(gAcabamento);
        return {
            modelo: nomeDe(modelo),
            madeira: nomeDe(madeira),
            cor: nomeDe(cor),
            corHex: getComputedStyle(cor).getPropertyValue('--cor').trim() || cor.style.getPropertyValue('--cor'),
            acabamento: nomeDe(acab),
            total: precoDe(modelo) + precoDe(madeira) + precoDe(acab)
        };
    }

    /* ---------- atualizar a tela ---------- */
    function atualizar() {
        const e = escolha();

        previewNome.textContent = e.modelo;
        previewCor.textContent = `${e.cor} · ${e.madeira} · ${e.acabamento}`;
        previewImg.style.setProperty('--cor-escolhida', e.corHex);

        const foto = IMAGENS[e.modelo];
        if (foto && !previewFoto.src.endsWith(foto.replace('..', ''))) {
            previewFoto.style.opacity = '0';
            setTimeout(() => {
                previewFoto.src = foto;
                previewFoto.alt = `Guitarra ${e.modelo}`;
                previewFoto.style.opacity = '1';
            }, 150);
        }

        [e.modelo, e.madeira, e.cor, e.acabamento].forEach((txt, i) => {
            if (linhasResumo[i]) linhasResumo[i].textContent = txt;
        });
        totalEl.textContent = SG.moeda(e.total);
    }

    /* ---------- clique nas opções (um ativo por grupo) ---------- */
    grupos.forEach(grupo => {
        grupo.addEventListener('click', ev => {
            const btn = ev.target.closest('.opcao-btn, .cor-btn');
            if (!btn || !grupo.contains(btn)) return;
            grupo.querySelectorAll('.ativo').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            atualizar();
        });
    });

    /* ---------- adicionar ao carrinho ---------- */
    btnAdd.addEventListener('click', () => {
        const e = escolha();
        SG.carrinho.adicionar({
            id: `custom-${slug(e.modelo)}-${slug(e.madeira)}-${slug(e.cor)}-${slug(e.acabamento)}`,
            nome: `${e.modelo} · ${e.cor}`,
            categoria: 'Customizados',
            preco: e.total,
            img: IMAGENS[e.modelo] || IMAGENS['Warlock']
        });
        SG.aviso(`${e.modelo} customizada adicionada ao carrinho`);

        btnAdd.textContent = 'Adicionado ✓';
        btnAdd.classList.add('added');
        setTimeout(() => { btnAdd.textContent = 'Adicionar ao carrinho'; btnAdd.classList.remove('added'); }, 1400);
    });

    previewFoto.style.transition = 'opacity .15s, transform .35s';
    atualizar();
})();
