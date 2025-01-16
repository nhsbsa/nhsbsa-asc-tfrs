//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

const fs = require('fs');

//Filter files for each version are loaded in dynamically in routes to avoid conflicts

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

addFilter('designstatusTag', function (statusID) {

    switch (statusID) {
        case "retired":
            return '<strong class="govuk-tag govuk-tag--red">Retired</strong>'
            break;
        case "design":
            return '<strong class="govuk-tag govuk-tag--yellow">Design</strong>'
            break;
        case "UR":
            return '<strong class="govuk-tag govuk-tag--pink">UR</strong>'
            break;
        case "dev":
            return '<strong class="govuk-tag govuk-tag--blue">Dev</strong>'
            break;
        case "live":
            return '<strong class="govuk-tag govuk-tag--green">Live</strong>'
            break;
    }

}, { renderAsHtml: true })