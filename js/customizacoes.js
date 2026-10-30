/* ==========================================================
   CUSTOMIZAÇÕES – js/customizacoes.js
   Filtro por categoria (chips) com contagem e mensagem de vazio.
   Cada .item-custom precisa de data-categoria="metal|rock|classica"
   ========================================================== */
(() => {
    'use strict';

    const chips = [...document.querySelectorAll('.chip')];
    const galeria = document.querySelector('.galeria');
    const itens = [...document.querySelectorAll('.item-custom')];

    if (!chips.length || !galeria) return;

    const aviso = document.createElement('div');
    aviso.className = 'galeria-vazia';
    aviso.textContent = 'Nenhuma customização nesta categoria ainda.';
    aviso.hidden = true;
    galeria.appendChild(aviso);

    function filtrar(categoria) {
        let visiveis = 0;

        itens.forEach((el, i) => {
            const mostrar = categoria === 'todas' || el.dataset.categoria === categoria;
            el.hidden = !mostrar;
            if (mostrar) {
                el.style.animation = 'none';
                void el.offsetWidth;                       // reinicia a animação
                el.style.animation = `entrar .4s ease ${visiveis * 60}ms both`;
                visiveis++;
            }
        });

        aviso.hidden = visiveis > 0;
        try { sessionStorage.setItem('filtroCustomizacoes', categoria); } catch {}
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.toggle('ativo', c === chip));
            filtrar(chip.dataset.filtro);
        });
    });

    // lembra o último filtro durante a visita
    let salvo = 'todas';
    try { salvo = sessionStorage.getItem('filtroCustomizacoes') || 'todas'; } catch {}
    const inicial = chips.find(c => c.dataset.filtro === salvo) || chips[0];
    chips.forEach(c => c.classList.toggle('ativo', c === inicial));
    filtrar(inicial.dataset.filtro);
})();
