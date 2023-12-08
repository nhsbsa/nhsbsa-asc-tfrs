document.addEventListener('DOMContentLoaded', function () {
    // Get reference to checkboxes
    const checkboxes = document.querySelectorAll('.govuk-checkboxes__input');
    
    // Initialize your data store (e.g., an array to store selected options)
    let selectedOptions = [];

    // Add event listener to each checkbox
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {

        // Check if the checkbox is checked
        if (checkbox.checked) {
          // Add the value to the selectedOptions array
          if(checkbox.value == 'on') {
            selectedOptions = [];
            checkboxes.forEach(function (checkbox) {
                if(checkbox.value != 'on') {selectedOptions.push(checkbox.value);}
            })
          } else {
            selectedOptions.push(checkbox.value);
          }
          
        } else {
          
            if(checkbox.value == 'on') {
                selectedOptions = [];
            } else {
                // Remove the value from the selectedOptions array
                selectedOptions = selectedOptions.filter(option => option !== checkbox.value);
            }          
        }
        // Update your data store as needed
        // Example: YourDataStore.update(selectedOptions);
        console.log('Selected Options:', selectedOptions);
        // Make a request to the server to update session data
      fetch('/v4/update-session-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedOptions }),
      })
      .then(response => response.text())
      .then(message => console.log(message))
      .catch(error => console.error('Error:', error));

      });
    });

  });
  