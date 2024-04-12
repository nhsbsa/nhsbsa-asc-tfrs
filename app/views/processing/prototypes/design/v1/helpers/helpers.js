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

    var learnersFile = 'learners.json'
    var trainingFile = 'training.json'
    var claimsFile = 'claims.json'
    var statusFile = 'claim-item-statuses.json'
    var roleTypes = 'role-types.json'
    var CPDActivities = 'cpd-activities.json'

    if (req.session.data.training) {
        console.log('training file already loaded')
    } else {
        console.log('loading in training file')
        req.session.data['training'] = loadJSONFromFile(trainingFile, path)
        console.log('training file loaded')
    }

    if (req.session.data.claims) {
        console.log('claims file already loaded')
    } else {
        console.log('loading in claims file')
        req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
        console.log('claims file loaded')
    }

    if (req.session.data.learners) {
        console.log('learners file already loaded')
    } else {
        console.log('loading in learners file')
        req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
        console.log('learners file loaded')
    }

    if (req.session.data.statuses) {
        console.log('statuses file already loaded')
    } else {
        console.log('loading in statuses file')
        req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
        console.log('statuses file loaded')
    }

    if (req.session.data.roleTypes) {
        console.log('role types file already loaded')
    } else {
        console.log('loading in role types file')
        req.session.data['roleTypes'] = loadJSONFromFile(roleTypes, path)
        console.log('role types file loaded')
    }

    if (req.session.data.CPDActivities) {
        console.log('CPDActivities file already loaded')
    } else {
        console.log('loading in CPDActivities file')
        req.session.data['CPDActivities'] = loadJSONFromFile(CPDActivities, path)
        console.log('CPDActivities file loaded')
    }

    return console.log('data updated')
}

module.exports = { loadJSONFromFile, loadData }
