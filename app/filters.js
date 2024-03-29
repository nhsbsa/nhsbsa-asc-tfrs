//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

const fs = require('fs');

// Add your filters here
require('../app/views/claims/prototypes/design/v5/filters/filters.js')
require('../app/views/claims/prototypes/design/v6/filters/filters.js')
require('../app/views/claims/prototypes/design/v7/filters/filters.js')
require('../app/views/claims/prototypes/design/v8/filters/filters.js')