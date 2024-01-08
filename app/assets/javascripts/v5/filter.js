

document.addEventListener("DOMContentLoaded", function() {
    /*var tabs = document.querySelectorAll('.govuk-tabs__panel')
    tabs.forEach(function(tab) {

      var tableRows = tab.querySelectorAll('.claim-row')
      let counter  = 0

      tableRows.forEach(function(row, index) {
        if (counter<=10 && !row.classList.contains('govuk-!-display-none')) {
          counter++
        } else if (!row.classList.contains('govuk-!-display-none')) {
          row.classList.add('govuk-!-display-none')
        }
      })
  })*/
})

function hideRows(data, filters, id) {

  const keywords = filters.keywords.toLowerCase()
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  var tableRows = document.querySelectorAll('#'+id+' .claim-row')

  let counter = 1

  tableRows.forEach(function(row, index) {
    let keywordsCheck = false
    let hasKeywords = false
    let startDateCheck = false
    let hasStartDate = false
    let variableDateCheck = false
    let hasvariableDate = false
    let claim = null

    for (const c of data.claims) {
      if (row.id == c.claimID){
        claim = c
      }
    }

    let title = ""
    if ( claim.training != null ) {
      title = claim.training.title.toLowerCase()
    }
    let startdate
    let startdateStr = "" 

    if ( claim.startDate != null ) {
      startdate = new Date(claim.startDate)
      startdateStr = month[startdate.getMonth()] + ' ' + startdate.getFullYear()
    }

    let variabledate
    let variabledateStr

    if (id == 'incomplete' || id == 'ready-to-submit') {
      variabledate = new Date(claim.createdDate)
      variabledateStr = month[variabledate.getMonth()] + ' ' + variabledate.getFullYear()
    } else if (id == 'submitted' || id == 'insufficient-evidence') {
      variabledate = new Date(claim.submittedDate)
      variabledateStr = month[variabledate.getMonth()] + ' ' + variabledate.getFullYear()
    } else if (id == 'paid') {
      variabledate = new Date(claim.paidDate)
      variabledateStr = month[variabledate.getMonth()] + ' ' + variabledate.getFullYear()
    }

    let learners = ""
    for (const learner of claim.learners) {
      learners = learners.concat(' ',learner.fullName.toLowerCase())
    }

    if (filters.keywords != "" && (title.includes(keywords) ||  learners.includes(keywords) || claim.claimID.includes(keywords))) {
      keywordsCheck = true
      hasKeywords = true
    } else if (filters.keywords != "") {
      hasKeywords = true
    }


    if (filters.startdate !== undefined && filters.startdate !== null) {
      hasStartDate = true
      if (Array.isArray(filters.startdate)) {
        // It's an array, loop through each value
        for (const d of filters.startdate) {
          if (startdateStr == d) {
            startDateCheck = true;
            break; // Exit the loop since we found a match
          }
        }
      } else {
        // It's not an array, check against the single value
        if (startdateStr == filters.startdate) {
          startDateCheck = true;
        }
      }
    }

    if (filters.variabledate !== undefined && filters.variabledate !== null) {
      hasvariableDate = true
      if (Array.isArray(filters.variabledate)) {
        // It's an array, loop through each value
        for (const d of filters.variabledate) {
          if (variabledateStr == d) {
            variableDateCheck = true;
            break; // Exit the loop since we found a match
          }
        }
      } else {
        // It's not an array, check against the single value
        if (variabledateStr == filters.variabledate) {
          variableDateCheck = true;
        }
      }
    }
  
    
    if (((keywordsCheck || !hasKeywords) && (startDateCheck || !hasStartDate) && (variableDateCheck || !hasvariableDate)) && counter<=10) {
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

}

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
    const formData = new FormData(document.getElementById('filterForm-'+id));
    // Get the element with the ID "claimsTables"
    
     
    // Convert form data to object
    const filters= {};
    formData.forEach((value, key) => {
      if (filters.hasOwnProperty(key)) {
        if (Array.isArray(filters[key]) && !(value=="_unchecked")) {
            filters[key].push(value);
        } else if (!(value=="_unchecked")) {
          filters[key] = [filters[key], value];
        }
      } else if (!(value=="_unchecked")) {
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
        hideRows(data, filters, id)
      })
      .catch(error => {
          console.error('Error getting data:', error);
      });
      
}