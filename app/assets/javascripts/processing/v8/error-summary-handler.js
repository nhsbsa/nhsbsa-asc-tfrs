document.addEventListener('DOMContentLoaded', function () {
    const errorSummary = document.querySelector('.govuk-error-summary');
    const sideNav = document.querySelector('.moj-side-navigation');
    const claimTabs = document.querySelectorAll('.claim-tab');

    if (errorSummary) {
        errorSummary.addEventListener('click', function (event) {
            const clickedLink = event.target.closest('a');

            if (clickedLink) {
                event.preventDefault(); // Prevent default anchor behavior

                const targetTab = document.getElementById('process');

                if (targetTab) {
                    // Remove active class from all navigation items
                    sideNav.querySelectorAll('.moj-side-navigation__item').forEach(item => {
                        item.classList.remove('moj-side-navigation__item--active');
                    });

                     // Add active class to the <li> containing the <a> with href="#process"
                     const parentItem = sideNav.querySelector(
                        `.moj-side-navigation__item a[href="#process"]`
                    )?.closest('.moj-side-navigation__item');

                    if (parentItem) {
                        parentItem.classList.add('moj-side-navigation__item--active');
                    }

                    // Hide all claim tabs
                    claimTabs.forEach(tab => tab.classList.add('claim-tab-hidden'));

                    // Show the target claim tab
                    targetTab.classList.remove('claim-tab-hidden');

                    // Remove focus styling from the clicked link
                    //clickedLink.blur();
                }

                const targetId = clickedLink.getAttribute('href').substring(1); // Extract ID from href
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Perform desired actions when the target element is found
                    // For example, scrolling to the element and focusing on it:
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    targetElement.focus({ preventScroll: true });
                }
            }
        });
    }
});