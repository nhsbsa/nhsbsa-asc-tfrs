//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('./scripts/helpers.js');

const fs = require('fs');

// Add your filters here
require('../app/views/claims/prototypes/v5/filters/filters.js')
require('../app/views/claims/prototypes/v6/filters/filters.js')
require('../app/views/claims/prototypes/v7/filters/filters.js')