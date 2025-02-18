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
router.use('/claims/prototypes/design/v11/', require('./views/claims/prototypes/design/v11/routes/routes.js'))
router.use('/claims/prototypes/design/v12/', require('./views/claims/prototypes/design/v12/routes/routes.js'))
router.use('/claims/prototypes/design/v13/', require('./views/claims/prototypes/design/v13/routes/routes.js'))
router.use('/claims/prototypes/design/v14/', require('./views/claims/prototypes/design/v14/routes/routes.js'))


// Add your processing routes here
router.use('/processing/prototypes/design/v1/', require('./views/processing/prototypes/design/v1/routes/routes.js'))
router.use('/processing/prototypes/design/v2/', require('./views/processing/prototypes/design/v2/routes/routes.js'))
router.use('/processing/prototypes/design/v3/', require('./views/processing/prototypes/design/v3/routes/routes.js'))
router.use('/processing/prototypes/design/v4/', require('./views/processing/prototypes/design/v4/routes/routes.js'))
router.use('/processing/prototypes/design/v5/', require('./views/processing/prototypes/design/v5/routes/routes.js'))
router.use('/processing/prototypes/design/v6/', require('./views/processing/prototypes/design/v6/routes/routes.js'))
router.use('/processing/prototypes/design/v7/', require('./views/processing/prototypes/design/v7/routes/routes.js'))
router.use('/processing/prototypes/design/v8/', require('./views/processing/prototypes/design/v8/routes/routes.js'))


// Add your routes here
router.use((req, res, next) => {

  //Load the correct version of the filters to use based on the version number
  // Use a regular expression to extract the section ("processing" or "claims") and the version number
  const match = req.path.match(/\/(processing|claims)\/.*\/v(\d+)\//);

  if (match) {
    const section = match[1]; // "processing" or "claims"
    const version = match[2]; // e.g., "7" for v7

    try {
      // Construct the path for the new filters file
      const filtersPath = '../app/views/' + section + '/prototypes/design/v' + version + '/filters/filters.js';
      const resolvedFiltersPath = require.resolve(filtersPath);

      // Iterate through require.cache and remove only old 'filters.js' files, keeping the new one
      Object.keys(require.cache).forEach((key) => {
        if (
          key.match(/\/app\/views\/(processing|claims)\/.*\/v\d+\/filters\/filters\.js$/) &&
          key !== resolvedFiltersPath // Only delete if it's not the current filters file
        ) {
          delete require.cache[key];
          console.log(`Unloaded cached filters: ${key}`);
        }
      });

      // Check if the new filters file is already in the cache
      if (!require.cache[resolvedFiltersPath]) {
        require(filtersPath);
        console.log('Filters applied for ' + section + ' v' + version);
      } else {
        console.log('Filters already loaded for ' + section + ' v' + version);
      }

    } catch (error) {
      console.log('No filters file for this version');
    }
  }

  // Define keys to exclude from logging
  const excludeKeys = ['training', 'claims', 'learners', 'statuses', 'roleTypes', 'CPDActivities', 'versionHistory', 'users', 'processingServiceName', 'organisations'];

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
  generateLearners(50, 'v11');
  generateClaims(100, 'v11');
  res.redirect('../')
})

module.exports = router;