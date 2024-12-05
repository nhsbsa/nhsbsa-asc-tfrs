document.addEventListener("DOMContentLoaded", () => {
    // Get all filter buttons
    const filterButtons = document.querySelectorAll(".filter-button");

    // Add click event listeners to each button
    filterButtons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault(); // Prevent the default link behavior

            // Remove 'selected' class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove("selected"));

            // Add 'selected' class to the clicked button
            button.classList.add("selected");

            // Get the target ID from the href of the clicked button
            const targetId = button.getAttribute("href").substring(1);

            // Get all timeline items
            const timelineItems = document.querySelectorAll(".moj-timeline__item");

            // Show/hide timeline items based on the target ID
            timelineItems.forEach(item => {
                if (targetId === "all" || item.id === targetId) {
                    item.classList.remove("moj-timeline__item-hidden");
                } else {
                    item.classList.add("moj-timeline__item-hidden");
                }
            });
        });
    });
});
