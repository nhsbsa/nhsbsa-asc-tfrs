const fs = require('fs');


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/data/processing/v2/'

    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'
    var notesFile = 'processing-notes.json'
    var criteria = 'criteria.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
    console.log('statuses file loaded')

    console.log('loading in criteria file')
    req.session.data['criteria'] = loadJSONFromFile(criteria, path)
    console.log(req.session.data['criteria'])
    console.log('criteria file loaded')

    console.log('loading in notes file')
    req.session.data['notes'] = [];
    console.log('notes file loaded')

    return console.log('data updated')
}

function updateClaim(claim, results) {

    if (results.type == "payment") {
        claim.evidenceOfPaymentreview.pass = true
        claim.paymentNote = results.notes
        for (let i = 0; i < (results.quantity-1); i++) {
            claim.evidenceOfPaymentreview["criteria"+i].result = results["criteria"+i]
            if (!(results["criteria"+i])) {
                claim.evidenceOfPaymentreview.pass = false
            }
        }
    } else if (results.type == "completion") {
        claim.evidenceOfCompletionreview.pass = true
        claim.completionNote = results.notes
        for (let i = 0; i < (results.quantity-1); i++) {
            claim.evidenceOfCompletionreview["criteria"+i].result = results["criteria"+i]
            if (!(results["criteria"+i])) {
                claim.evidenceOfCompletionreview.pass = false
            }
        }
    }
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function checkEvidenceAnswers(data) {
    let results = {}
    let criteriaGroup = null

    for (const group of data.criteria) {
        if (group.type == data.type) {
            criteriaGroup = group
        }
    }

    results.type = data.type
    results.quantity = criteriaGroup.quantity
    results.evidenceCheckValid = true
    results.notes = data.notes

    for (let i = 0; i < (criteriaGroup.quantity-1); i++) {
        if (data['criteria'+i]== "") {
            results['criteria'+i] = "invalid"
            results.evidenceCheckValid = false
        } else if (data['criteria'+i]== "yes") {
            results['criteria'+i] = true
        } else if (data['criteria'+i]== "no") {
            results['criteria'+i] = false
        }
    }

    return results

}





module.exports = { loadJSONFromFile, loadData, updateClaim, formatDate, checkEvidenceAnswers }
