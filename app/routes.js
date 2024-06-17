//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');
const { generateClaims } = require('./scripts/generate-claims.js');
const { generateLearners } = require('./scripts/generate-learners.js');

// Add your claims routes here
router.use('/v3/', require('./views/claims/prototypes/design/v3/routes/routes.js'))
router.use('/v4/', require('./views/claims/prototypes/design/v4/routes/routes.js'))
router.use('/v5/', require('./views/claims/prototypes/design/v5/routes/routes.js'))
router.use('/v6/', require('./views/claims/prototypes/design/v6/routes/routes.js'))
router.use('/claims/prototypes/design/v7/', require('./views/claims/prototypes/design/v7/routes/routes.js'))
router.use('/claims/prototypes/design/v8/', require('./views/claims/prototypes/design/v8/routes/routes.js'))
router.use('/claims/prototypes/design/v9/', require('./views/claims/prototypes/design/v9/routes/routes.js'))
router.use('/claims/prototypes/design/v10/', require('./views/claims/prototypes/design/v10/routes/routes.js'))

// Add your processing routes here
router.use('/processing/prototypes/design/v1/', require('./views/processing/prototypes/design/v1/routes/routes.js'))
router.use('/processing/prototypes/design/v2/', require('./views/processing/prototypes/design/v2/routes/routes.js'))
router.use('/processing/prototypes/design/v3/', require('./views/processing/prototypes/design/v3/routes/routes.js'))


// Add your routes here
router.use((req, res, next) => {
  // Define keys to exclude from logging
  const excludeKeys = ['training', 'claims', 'learners', 'statuses', 'roleTypes', 'CPDActivities', 'versionHistory'];

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
  generateLearners(50, 'v10');
  generateClaims(100, 'v10');
  res.redirect('../')
})

module.exports = router;