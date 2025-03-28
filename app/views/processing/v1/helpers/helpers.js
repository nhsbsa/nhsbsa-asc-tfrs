const fs = require('fs');


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/views/processing/v1/data/'

    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'
    var notesFile = 'processing-notes.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
    console.log('statuses file loaded')

    console.log('loading in notes file')
    req.session.data['notes'] = [];
    console.log('notes file loaded')

    return console.log('data updated')
}

function updateClaim(claim) {

    if (
        claim.evidenceOfPaymentreview.criteria1.result != null &&
        claim.evidenceOfPaymentreview.criteria2.result != null &&
        claim.evidenceOfPaymentreview.criteria3.result != null &&
        claim.evidenceOfPaymentreview.criteria4.result != null
    ) {
        if (claim.evidenceOfPaymentreview.criteria1.result &&
            claim.evidenceOfPaymentreview.criteria2.result &&
            claim.evidenceOfPaymentreview.criteria3.result &&
            claim.evidenceOfPaymentreview.criteria4.result) {
            claim.evidenceOfPaymentreview.pass = true
        } else {
            claim.evidenceOfPaymentreview.pass = false
        }
    } 
    
    if (
        claim.evidenceOfCompletionreview.criteria1.result != null &&
        claim.evidenceOfCompletionreview.criteria2.result != null &&
        claim.evidenceOfCompletionreview.criteria3.result != null
    ) {
        if (claim.evidenceOfCompletionreview.criteria1.result &&
            claim.evidenceOfCompletionreview.criteria2.result &&
            claim.evidenceOfCompletionreview.criteria3.result) {
            claim.evidenceOfCompletionreview.pass = true
        } else {
            claim.evidenceOfCompletionreview.pass = false
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



module.exports = { loadJSONFromFile, loadData, updateClaim, formatDate }
