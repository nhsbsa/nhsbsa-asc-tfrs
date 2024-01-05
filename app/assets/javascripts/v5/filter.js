function toggleFilter(id) {
    var filterDiv = document.getElementById('filter'+id);
    var toggleButton = document.getElementById('toggleFilterButton');

    if (filterDiv.classList.contains('govuk-!-display-none')) {
      // Show the filter
      filterDiv.classList.remove('govuk-!-display-none');
      toggleButton.innerText = 'Hide Filter';
    } else {
      // Hide the filter
      filterDiv.classList.add('govuk-!-display-none');
      toggleButton.innerText = 'Show Filter';
    }
  }

  function applyFilters(event,id) {
    
    event.preventDefault();
    // Get form data
    const formData = new FormData(document.getElementById('filterForm'));
    // Get the element with the ID "claimsTables"
    

    // Convert form data to object
    const filters= {};
    formData.forEach((value, key) => {
      filters[key] = value;
    });

    // Send a request to the server
    fetch('/v5/update-filters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({filters}),
    })
    .then(response => response.json())
    
    .catch(error => {
        console.error('Error applying filters:', error);
    });
    var jsonString = document.getElementById(id).getAttribute('data-variables');
    var myVariable = JSON.parse(jsonString);
    console.log('Result');
    console.log(myVariable);

    
}