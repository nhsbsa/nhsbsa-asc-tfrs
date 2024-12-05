document.addEventListener('DOMContentLoaded', function () {
    const sideNav = document.querySelector('.moj-side-navigation');
    const claimTabs = document.querySelectorAll('.claim-tab');

    if (sideNav) {
        sideNav.addEventListener('click', function (event) {
            const clickedLink = event.target.closest('a');

            if (clickedLink) {
                event.preventDefault(); // Prevent default anchor behavior
                
                const targetId = clickedLink.getAttribute('href').substring(1); // Get ID from href
                const targetTab = document.getElementById(targetId);

                if (targetTab) {
                    // Remove active class from all navigation items
                    sideNav.querySelectorAll('.moj-side-navigation__item').forEach(item => {
                        item.classList.remove('moj-side-navigation__item--active');
                    });

                    // Add active class to the clicked navigation item's parent <li>
                    const parentItem = clickedLink.closest('.moj-side-navigation__item');
                    if (parentItem) {
                        parentItem.classList.add('moj-side-navigation__item--active');
                    }

                    // Hide all claim tabs
                    claimTabs.forEach(tab => tab.classList.add('claim-tab-hidden'));

                    // Show the target claim tab
                    targetTab.classList.remove('claim-tab-hidden');
                }
            }
        });
    }
});