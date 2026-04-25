'use strict';
document.addEventListener('DOMContentLoaded', () => {

    /* ── LIGHTBOX with group navigation ──────────────────────── */
    const lightbox        = document.getElementById('lightbox');
    const lightboxImg     = document.getElementById('lightbox-img');
    const lightboxClose   = document.getElementById('lightbox-close');
    const lightboxPrev    = document.getElementById('lightbox-prev');
    const lightboxNext    = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');

    let currentGroup = [];
    let currentIndex = 0;

    /* ── Zoom ─────────────────────────────────────────────────── */
    let zoomScale = 1;
    function resetZoom() {
        zoomScale = 1;
        lightboxImg.style.transform = '';
        lightboxImg.style.cursor = 'zoom-in';
    }

    function showImage(index) {
        resetZoom();
        const el = currentGroup[index];
        const src = el.dataset.full || el.getAttribute('src') || '';
        lightboxImg.src = src;
        lightboxImg.alt = el.alt || '';

        const hasMultiple = currentGroup.length > 1;
        if (lightboxPrev) lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
        if (lightboxNext) lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
        if (lightboxCounter) {
            lightboxCounter.textContent = hasMultiple ? `${index + 1} / ${currentGroup.length}` : '';
        }
    }

    function openLightbox(imgs, index) {
        currentGroup = imgs;
        currentIndex = index;
        showImage(currentIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        resetZoom();
        setTimeout(() => { lightboxImg.src = ''; }, 250);
        currentGroup = [];
    }

    function navigate(dir) {
        if (!currentGroup.length) return;
        currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
        showImage(currentIndex);
    }

    if (lightbox && lightboxImg && lightboxClose) {
        document.querySelectorAll('.gallery-img').forEach(el => {
            el.style.cursor = 'pointer';
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');

            el.addEventListener('click', () => {
                const group = el.dataset.group;
                let imgs;
                if (group) {
                    imgs = Array.from(
                        document.querySelectorAll(`.gallery-img[data-group="${group}"]`)
                    ).filter(img => img.offsetParent !== null);
                } else {
                    imgs = [el];
                }
                const index = imgs.indexOf(el);
                openLightbox(imgs, index >= 0 ? index : 0);
            });

            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowLeft')   navigate(-1);
            if (e.key === 'ArrowRight')  navigate(1);
        });

        /* scroll-wheel zoom on lightbox image */
        lightboxImg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            const newScale = Math.min(4, Math.max(1, zoomScale + delta));
            if (newScale === 1) {
                resetZoom();
                return;
            }
            /* zoom towards cursor position */
            const rect = lightboxImg.getBoundingClientRect();
            const ox = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2);
            const oy = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2);
            lightboxImg.style.transformOrigin = `${ox}% ${oy}%`;
            zoomScale = newScale;
            lightboxImg.style.transform = `scale(${zoomScale})`;
            lightboxImg.style.cursor    = 'zoom-out';
        }, { passive: false });

        /* double-click resets zoom */
        lightboxImg.addEventListener('dblclick', resetZoom);
    }
});
