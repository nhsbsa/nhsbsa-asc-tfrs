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
require('../app/views/processing/prototypes/design/v1/filters/filters.js')

addFilter('default', function (value, defaultValue) {
    if (value != null) {
        return value
    } else {
        return defaultValue
    }
})

addFilter('toLowerCase', function (str) {
    if (!str || typeof str !== 'string') {
        return str;
    }
    return str.toLowerCase();
})