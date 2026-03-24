document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = {
        dashboard: document.getElementById('dashboard-page'),
        governance: document.getElementById('governance-page'),
        reports: document.getElementById('reports-page'),
        settings: document.getElementById('settings-page')
    };

    function switchPage(pageId) {
        // Hide all pages
        Object.values(pages).forEach(page => {
            if(page) page.classList.add('hidden');
        });

        // Show target page
        if(pages[pageId]) {
            pages[pageId].classList.remove('hidden');
        }

        // Update active state in nav
        navLinks.forEach(link => {
            if(link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if(pages[pageId]) {
                switchPage(pageId);
            }
        });
    });

    // Vault Card Interaction
    const vaultCards = document.querySelectorAll('.vault-card');
    vaultCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log('Vault card clicked - Open detailed view logic here');
        });
    });
});
