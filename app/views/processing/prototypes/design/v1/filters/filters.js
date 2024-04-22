//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag_V1', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'rejected' || statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">Processed</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('sectionCheck_V1', function (state) {
    if (state) {
        return "Completed"
    } else if (!state) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim_V1', function (claims, id) {
    var foundClaim = null
    for (const claim of claims) {
        if (claim.claimID == id) {
            foundClaim = claim
        }
    }
    return foundClaim
})

addFilter('dateSort_V1', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('formatCategory_V1', function (category) {

    switch (category) {
        case "rejectionReason":
            return "Rejection Reason";
        case "query":
            return "Query";
        case "addingContext":
            return "Adding Context";
    }
})
