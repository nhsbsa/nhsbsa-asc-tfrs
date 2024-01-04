//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const fs = require('fs');
const statuses = JSON.parse(fs.readFileSync('./app/data/claim-item-statuses.json', 'utf8'));

// Add your filters here

addFilter('statusTag', function (content) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == content) {
            statusName = s.name
        }
    }
    if (content == 'new') {
        return '<strong class="govuk-tag govuk-tag--green">New</strong>'
    } else if (content == 'incomplete') {
        return '<strong class="govuk-tag govuk-tag--blue">'+statusName+'</strong>'
    } else if (content == 'ready-to-submit') {
        return '<strong class="govuk-tag govuk-tag--light-blue">'+statusName+'</strong>'
    } else if (content == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--turquoise">'+statusName+'</strong>'
    } else if (content == 'insufficient-evidence') {
        return '<strong class="govuk-tag govuk-tag--red">'+statusName+'</strong>'
    } else if (content == 'paid') {
        return '<strong class="govuk-tag govuk-tag--purple">'+statusName+'</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
  }, { renderAsHtml: true })