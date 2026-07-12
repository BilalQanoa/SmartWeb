// Onboarding step 3: template preview activation
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('template-selection-form');
    if (!form) return; // only run on onboarding step 3

    const cards = document.querySelectorAll(".template-card");
    const previewTitle = document.getElementById("preview-title");
    const openNewTabBtn = document.getElementById("open-new-tab-btn");
    const selectedInput = document.getElementById("selected-template-input");
    const urlText = document.getElementById("preview-url-text");
    const frame = document.getElementById('preview-frame');

    function activate(card) {
        const slug = card.dataset.template;
        if (!slug) return;

        cards.forEach(c => {
            c.classList.remove("active");
            c.querySelector(".template-badge-primary")?.remove();
        });
        card.classList.add("active");

        const titleDiv = card.querySelector(".d-flex.align-items-center");
        if (titleDiv) {
            const badge = document.createElement("span");
            badge.className = "template-badge-primary ms-2";
            badge.textContent = "ACTIVE";
            titleDiv.appendChild(badge);
        }

        if (selectedInput) selectedInput.value = slug;

        const previewUrl = `/portfolios/preview/${slug}/`;
        const label = card.querySelector('h6')?.textContent || slug;

        if (previewTitle) previewTitle.textContent = label;
        if (openNewTabBtn) openNewTabBtn.href = previewUrl;
        if (urlText) urlText.textContent = `preview.smartweb.io/${slug}`;

        if (frame) {
            frame.style.display = 'block';
            frame.src = previewUrl;
        }
    }

    cards.forEach(card => card.addEventListener("click", () => activate(card)));

    const initial = document.querySelector('.template-card.active') || cards[0];
    if (initial) activate(initial);
});
