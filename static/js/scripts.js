document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".template-card");
    if(cards.length === 0) return; // Only execute on the templates dashboard

    const browserBody = document.querySelector(".browser-body");
    const previewTitle = document.getElementById("preview-title");
    const browserTitle = document.querySelector(".browser-url-bar span");
    const openNewTabBtn = document.getElementById("open-new-tab-btn");

    const themes = [
        {
            name: "Classic Scholar &mdash; Version 2.4.1",
            displayUrl: "preview.smartapp.io/scholar-template",
            src: "/portfolios/preview/light-1/"
        },
        {
            name: "Modern Dark &mdash; Version 1.2.0",
            displayUrl: "preview.smartapp.io/modern-dark-02",
            src: "/portfolios/preview/dark-1/"
        },
        {
            name: "Minimalist Lab &mdash; Version 3.1.2",
            displayUrl: "preview.smartapp.io/min-lab",
            src: "/portfolios/preview/light-2/"
        },
        {
            name: "Executive Academic &mdash; Version 1.0.5",
            displayUrl: "preview.smartapp.io/exec-academic",
            src: "/portfolios/preview/dark-2/"
        }
    ];

    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            // Update active state
            cards.forEach(c => {
                c.classList.remove("active");
                const badge = c.querySelector(".template-badge-primary");
                if(badge) badge.remove();
            });
            card.classList.add("active");
            
            // Add ACTIVE badge
            const titleDiv = card.querySelector(".d-flex.align-items-center");
            if(!titleDiv.querySelector(".template-badge-primary")) {
                const badge = document.createElement("span");
                badge.className = "template-badge-primary ms-2";
                badge.textContent = "ACTIVE";
                titleDiv.appendChild(badge);
            }

            // Update Preview Area
            previewTitle.innerHTML = themes[index].name;
            browserTitle.textContent = themes[index].displayUrl;
            if(openNewTabBtn) openNewTabBtn.href = themes[index].src;
            
            // Add fade animation
            browserBody.style.opacity = '0';
            
            fetch(themes[index].src)
                .then(response => response.text())
                .then(html => {
                    setTimeout(() => {
                        browserBody.innerHTML = html;
                        browserBody.style.opacity = '1';
                    }, 150);
                })
                .catch(err => {
                    console.error('Error loading template:', err);
                    browserBody.innerHTML = '<div class="p-4 text-danger">Failed to load template preview.</div>';
                    browserBody.style.opacity = '1';
                });
        });
    });
    
    // Initialize first theme with transition properties
    browserBody.style.transition = 'opacity 0.15s ease-in-out';
    if(openNewTabBtn) openNewTabBtn.href = themes[0].src;
    fetch(themes[0].src)
        .then(response => response.text())
        .then(html => {
            browserBody.innerHTML = html;
        });
});
