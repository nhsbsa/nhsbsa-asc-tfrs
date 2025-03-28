//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');
const path = require('path');

// Include version-specific routes
// Read available versions dynamically from the claims directory
const claimsVersions = fs.readdirSync('./app/views/claims')
  .filter(dir => /^v\d+$/.test(dir)) // Match folders like "v1", "v2", "v3"
  .map(dir => dir.replace('v', '')); // Extract version number

// Load claims routes in
claimsVersions.forEach(version => {
  const routePath = path.join(__dirname, `./views/claims/v${version}/_routes/routes.js`);
  
  if (fs.existsSync(routePath)) {
    router.use(`/claims/v${version}`, require(routePath));
  } else {
    console.warn(`Warning: routes.js not found for v${version}, skipping...`);
  }
});

// Read available versions dynamically from the claims directory
const processingVersions = fs.readdirSync('./app/views/processing')
  .filter(dir => /^v\d+$/.test(dir)) // Match folders like "v1", "v2", "v3"
  .map(dir => dir.replace('v', '')); // Extract version number

// Load claims routes in
processingVersions.forEach(version => {
  const routePath = path.join(__dirname, `./views/processing/v${version}/_routes/routes.js`);
  
  if (fs.existsSync(routePath)) {
    router.use(`/processing/v${version}`, require(routePath));
  } else {
    console.warn(`Warning: routes.js not found for v${version}, skipping...`);
  }
});

// Add your routes here
router.use((req, res, next) => {

  //Load the correct version of the filters to use based on the version number
  // Use a regular expression to extract the section ("processing" or "claims") and the version number
  const match = req.path.match(/\/(processing|claims)\/v(\d+)\//);

  if (match) {
    const section = match[1]; // "processing" or "claims"
    const version = match[2]; // e.g., "7" for v7

    try {
      // Construct the path for the new filters file
      const filtersPath = '../app/views/' + section + '/v' + version + '/filters/filters.js';
      const resolvedFiltersPath = require.resolve(filtersPath);

      // Iterate through require.cache and remove only old 'filters.js' files, keeping the new one
      Object.keys(require.cache).forEach((key) => {
        if (
          key.match(/\/app\/views\/(processing|claims)\/v\d+\/filters\/filters\.js$/) &&
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
  const excludeKeys = ['training', 'claims', 'learners', 'statuses', 'roleTypes', 'CPDActivities', 'versionHistory', 'users', 'processingServiceName', 'organisations', 'org'];

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

module.exports = router;