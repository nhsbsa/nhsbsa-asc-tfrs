document.addEventListener("DOMContentLoaded", function() {


})

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
      if (filters.hasOwnProperty(key)) {
        if (Array.isArray(filters[key])) {
            filters[key].push(value);
        } else {
          filters[key] = [filters[key], value];
        }
      } else {
        filters[key] = value;
      }
    });

     fetch('/v5/update-filters', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters })
      })
      .then(response => response.json())
      .then(data => {
    

        const keywords = filters.keywords.toLowerCase()
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

        var tableRows = document.querySelectorAll('#'+id+' .claim-row')

        let counter = 1

        tableRows.forEach(function(row, index) {
          let keywordsCheck = false
          let startDateCheck = false
          let variableDateCheck = false
          let claim = null
    
          for (const c of data.claims) {
            if (row.id == c.claimID){
              claim = c
            }
          }
          
          
          const title = claim.training.title.toLowerCase()
          const date = new Date(claim.startDate)
          const dateStr = month[date.getMonth()] + ' ' + date.getFullYear()
          let learners = ""
          for (const learner of claim.learners) {
            learners = learners.concat(' ',learner.fullName.toLowerCase())
          }
          
          if (filters.keywords != "" && (title.includes(keywords) ||  learners.includes(keywords) || claim.claimID.includes(keywords))) {
            keywordsCheck = true
          }

    
          if (filters.startdate !== undefined && filters.startdate !== null) {
            if (Array.isArray(filters.startdate)) {
              // It's an array, loop through each value
              for (const d of filters.startdate) {
                if (dateStr == d) {
                  startDateCheck = true;
                  break; // Exit the loop since we found a match
                }
              }
            } else {
              // It's not an array, check against the single value
              if (dateStr == filters.startdate) {
                startDateCheck = true;
              }
            }
          }
          
          
          if ((keywordsCheck || startDateCheck || variableDateCheck) && counter<=10) {
            counter++
            console.log('match')
            if ((row.classList.contains('govuk-!-display-none'))) {
              row.classList.remove('govuk-!-display-none');
            }
          } else {
            if (!(row.classList.contains('govuk-!-display-none'))) {
              row.classList.add('govuk-!-display-none');
            }
          }
    
        });
        
      })
      .catch(error => {
          console.error('Error getting data:', error);
      });
      
}