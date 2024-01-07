function generateTable() {
    fetch('/getLocalData', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then(response => response.json())
        .then(data => {
            console.log(JSON.stringify(data.claims.length))

    var tableHTML = '<table class="govuk-table" data-module="moj-sortable-table">' +
                        '<thead class="govuk-table__head">' +
                            '<tr class="govuk-table__row">' +
                                '<th class="govuk-table__header" scope="col" aria-sort="none">ID</th>' +
                                '<th class="govuk-table__header govuk-!-width-one-third" scope="col" aria-sort="none">Activity name</th>' +
                                '<th class="govuk-table__header" scope="col" aria-sort="none">Start date</th>' +
                                '<th class="govuk-table__header" scope="col" aria-sort="none">Learners</th>' +
                                '<th class="govuk-table__header" scope="col" aria-sort="descending">Created date</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody class="govuk-table__body">';

    // Loop through the claims data and append rows to the tableHTML
    for (var i = 0; i < data.claims.length; i++) {
        var claim = data.claims[i];

        // Append a row for each claim
        tableHTML += '<tr class="govuk-table__row claim-row" id="' + claim.claimID + '">' +
                        '<td class="govuk-table__header" scope="row"><a class="govuk-link" href="claim/claim-details?id=' + claim.claimID + '">' + claim.claimID + '</a> </td>' +
                        '<td class="govuk-table__cell">' + claim.training.title + '</td>' +
                        '<td class="govuk-table__cell" data-sort-value="' + claim.startDate + '">' + claim.startDate + '</td>' +
                        '<td class="govuk-table__cell" data-sort-value="' + claim.learners.length + '">' +
                            '<details class="govuk-details">' +
                                '<summary class="govuk-details__summary">' +
                                    '<span class="govuk-details__summary-text">' + claim.learners.length + ' learners</span>' +
                                '</summary>' +
                                '<div class="govuk-details__text">';

        // Loop through the learners for this claim
        for (var j = 0; j < claim.learners.length; j++) {
            tableHTML += claim.learners[j].fullName + '<br>';
        }

        // Close the details and table cell tags
        tableHTML += '</div>' +
                            '</details>' +
                        '</td>' +
                        '<td class="govuk-table__cell" data-sort-value="' + claim.createdDate + '">' + claim.createdDate + '</td>' +
                    '</tr>';
    }

    // Close the table body and table tags
    tableHTML += '</tbody>' +
                '</table>';

    // Return the generated table HTML
    return tableHTML;

})
.catch(error => {
    console.error('Error getting data:', error);
}); 
}

document.addEventListener("DOMContentLoaded", function () {

// Get the table container element
var tableContainer = document.getElementById("table-container-incomplete");

// Generate the table HTML and insert it into the table container
tableContainer.innerHTML = generateTable();

});