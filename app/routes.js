//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');
const { generateClaims } = require('./scripts/generate-claims.js');
const { generateLearners } = require('./scripts/generate-learners.js');

router.use('/', require('./routes/routes-v3.js'))
router.use('/', require('./routes/routes-v4.js'))

// Add your routes here

router.use((req, res, next) => {
  // Define keys to exclude from logging
  const excludeKeys = ['training', 'claims', 'learners'];

  // Create a copy of req.session.data with excluded keys removed
  const filteredData = Object.keys(req.session.data)
    .filter(key => !excludeKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.session.data[key];
      return obj;
    }, {});
  
  const log = {
    method: req.method,
    url: req.originalUrl,
    data: filteredData
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
  var claimsFile = 'claims.json'

  if (req.session.data.training) {
    console.log('training file already loaded')
  } else {
    console.log('loading in training file')
    let path = 'app/data/'
    req.session.data['training'] = loadJSONFromFile(trainingFile, path)
    console.log('training file loaded')
  }

  if (req.session.data.claims) {
    console.log('claims file already loaded')
  } else {
    console.log('loading in claims file')
    let path = 'app/data/'
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')
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

//generate data
router.get('/generate', function (req, res) {
  generateLearners(200);
  generateClaims(1000);
  loadData(req);
  resetVariables(req);
  res.redirect('../')
})



router.get('/', function (req, res) {
  //Load data from JSON files
  loadData(req);
  resetVariables(req);
  res.render('index')
})

router.get('/v4/load-data', function (req, res) {
  //Load data from JSON files
  loadData(req);
  resetVariables(req);
  res.redirect('../claims/prototypes/v4/index')
})

module.exports = router;