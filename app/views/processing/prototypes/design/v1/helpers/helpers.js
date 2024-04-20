const fs = require('fs');


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/data/v8/'

    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
    console.log('statuses file loaded')

    return console.log('data updated')
}

function checkCriteria(claim) {
    let result = false

    if (
        claim.evidenceOfPaymentreview.criteria1 &&
        claim.evidenceOfPaymentreview.criteria2 &&
        claim.evidenceOfPaymentreview.criteria3 &&
        claim.evidenceOfPaymentreview.criteria4 &&
        claim.evidenceOfPaymentreview.criteria5 &&
        claim.evidenceOfPaymentreview.criteria6 &&
        claim.evidenceOfPaymentreview.criteria7 &&
        claim.evidenceOfPaymentreview.criteria8 &&
        claim.evidenceOfPaymentreview.criteria9 &&
        claim.evidenceOfPaymentreview.criteria10 &&
        claim.evidenceOfCompletionreview.criteria1 &&
        claim.evidenceOfCompletionreview.criteria2 &&
        claim.evidenceOfCompletionreview.criteria3 &&
        claim.evidenceOfCompletionreview.criteria4 &&
        claim.evidenceOfCompletionreview.criteria5 &&
        claim.evidenceOfCompletionreview.criteria6 &&
        claim.evidenceOfCompletionreview.criteria7 &&
        claim.evidenceOfCompletionreview.criteria8 &&
        claim.evidenceOfCompletionreview.criteria9 &&
        claim.evidenceOfCompletionreview.criteria10
    ) {
        result = true
    }

    return result
}

module.exports = { loadJSONFromFile, loadData, checkCriteria }
