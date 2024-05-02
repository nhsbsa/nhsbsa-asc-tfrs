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

function updateClaim(claim, type, response, note) {

    if (type == "payment") {
        if (response == "yes") {
            claim.evidenceOfPaymentreview.pass = true
        } else if (response == "no") {
            claim.evidenceOfPaymentreview.pass = false
            claim.evidenceOfPaymentreview.note = note
        }
    } else if (type == "completion") {
        if (response == "yes") {
            claim.evidenceOfCompletionreview.pass = true
        } else if (response == "no") {
            claim.evidenceOfCompletionreview.pass = false
            claim.evidenceOfCompletionreview.note = note
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

function checkWDSFormat(id) {

    var pattern = /^[B-I]\d{5,8}$/;
    return pattern.test(id);

}

function signatoryCheck(familyName, givenName, email) {
    const result = {}

    if (familyName =="") {
        result.familyName = "missing"
    } else {
        result.familyName = "valid"
    }

    if (givenName =="") {
        result.givenName = "missing"
    } else {
        result.givenName = "valid"
    }

    if (email =="") {
        result.email = "missing"
    } else if (!(emailFormat(email))) {
        result.email = "invalid"
    } else {
        result.email = "valid"
    }
    
    result.signatoryValid = result.familyName == "valid" && result.givenName == "valid" && result.email == "valid"

    return result
}

function emailFormat(string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
}

module.exports = { loadJSONFromFile, loadData, updateClaim, formatDate, checkWDSFormat, signatoryCheck }
