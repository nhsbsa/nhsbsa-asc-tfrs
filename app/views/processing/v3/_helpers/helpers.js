const fs = require('fs');


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/views/processing/v3/_data/'

    var learnersFile = 'learners.json'
    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'
    var trainingFile = 'training.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
    console.log('statuses file loaded')

    console.log('loading in training file')
    req.session.data['training'] = loadJSONFromFile(trainingFile, path)
    console.log('training file loaded')

    console.log('loading in learners file')
    req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
    console.log('learners file loaded')

    return console.log('data updated')
}

function updateClaim(foundClaim, learner, paymentResponse, paymentReimbursementNote, paymentNoNote, completionResponse, completionNoNote) {
        if (paymentResponse == "yes") {
            foundClaim.evidenceOfPaymentreview.pass = "Approved"
            if (foundClaim.fundingType == "TU") {
                foundClaim.reimbursementAmount = paymentReimbursementNote
            } else if (foundClaim.fundingType == "CPD"){
                if (foundClaim.paymentAmount <= learner.cpdBudget) {
                    learner.cpdBudget -= foundClaim.paymentAmount
                    foundClaim.reimbursementAmount = foundClaim.paymentAmount
                } else {
                    foundClaim.reimbursementAmount = learner.cpdBudget
                    learner.cpdBudget = 0
                }
            }
        } else if (paymentResponse == "no") {
            foundClaim.evidenceOfPaymentreview.pass = "Rejected"
            foundClaim.evidenceOfPaymentreview.note = paymentNoNote
        }
        if (completionResponse == "yes") {
            foundClaim.evidenceOfCompletionreview.pass = "Approved"
        } else if (completionResponse == "no") {
            foundClaim.evidenceOfCompletionreview.pass = "Rejected"
            foundClaim.evidenceOfCompletionreview.note = completionNoNote
        }
}

function getLearner(learners, learnerID) {
    for (let learner of learners) {
        if (learner.id == learnerID) {
            return learner
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

function validNumberCheck(string) {
    var isValid = false
    if (!isNaN(Number(string))) {
        isValid = true
    }
    return isValid
}

function isFullClaimCheck(claim) {
    if (claim.fundingType == "TU" && claim.training.fundingModel == "full" && claim.completionDate != null) {
        return true
    } else { 
        return false
    }
}

module.exports = { loadJSONFromFile, loadData, updateClaim, formatDate, checkWDSFormat, signatoryCheck, validNumberCheck, isFullClaimCheck, getLearner }
