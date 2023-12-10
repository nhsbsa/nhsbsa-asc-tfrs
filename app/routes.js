//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');

require("./scripts/generate-learners.js")(router)
router.use('/', require('./routes/routes-v3.js'))
router.use('/', require('./routes/routes-v4.js'))

// Add your routes here
router.use((req, res, next) => {
  const log = {
    method: req.method,
    url: req.originalUrl,
    data: req.session.data
  }
  // you can enable this in your .env file
  console.log(JSON.stringify(log, null, 2))
  next()
})

// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
  let jsonFile = fs.readFileSync(path + fileName)
  return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
  // pull in the prototype data object and see if it contains a datafile reference
  let prototype = {} || req.session.data['prototype'] // set up if doesn't exist

  var learnersFile = 'learners.json'
  var trainingFile = 'training.json'

  if (req.session.data.training) {
    console.log('training file already loaded')
  } else {
    console.log('loading in training file')
    let path = 'app/data/'
    req.session.data['training'] = loadJSONFromFile(trainingFile, path)
    console.log('training file loaded')
  }

  if (req.session.data.learners) {
    console.log('learners file already loaded')
  } else {
    console.log('loading in learners file')
    let path = 'app/data/'
    req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
    console.log('learners file loaded')
  }

  return console.log('data updated')
}

function resetVariables(req) {
  req.session.data['addEvidenceInClaimProcess'] = false
  
  return console.log('variables reset')
}



router.get('/', function (req, res) {
  //Load data from JSON files
  loadData(req);
  resetVariables(req);
  res.render('index')
})

module.exports = router;