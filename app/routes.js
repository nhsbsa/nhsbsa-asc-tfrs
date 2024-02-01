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
router.use('/', require('./routes/routes-v5.js'))
router.use('/', require('./routes/routes-v6.js'))
router.use('/', require('./routes/routes-v7.js'))

// Add your routes here

router.use((req, res, next) => {
  // Define keys to exclude from logging
  const excludeKeys = ['training', 'claims', 'learners', 'statuses', 'roleTypes', 'CPDActivities'];

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

router.get('/getLocalData', (req, res) => {
  res.send(req.session.data)
});

//generate data
router.get('/generate', function (req, res) {
  generateLearners(50, 'v7');
  generateClaims(200, 'v7');
  res.redirect('../')
})




module.exports = router;