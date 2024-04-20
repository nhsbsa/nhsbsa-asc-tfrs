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

addFilter('criteriaQuestions_V1', function (criteria, type, claim, header) {
    if (type == "payment") {
        switch (criteria) {
            case "1":
                if (header == "true") {
                    return "Criteria 1"
                } else {
                    return "This is the payment criteria for criteria 1 " + claim.training.title
                }
            case "2":
                if (header == "true") {
                    return "Criteria 2"
                } else {
                    return "This is the payment criteria for criteria 2 " + claim.training.title
                }
            case "3":
                if (header == "true") {
                    return "Criteria 3"
                } else {
                    return "This is the payment criteria for criteria 3 " + claim.training.title
                }
            case "4":
                if (header == "true") {
                    return "Criteria 4"
                } else {
                    return "This is the payment criteria for criteria 4 " + claim.training.title
                }
            case "5":
                if (header == "true") {
                    return "Criteria 5"
                } else {
                    return "This is the payment criteria for criteria 5 " + claim.training.title
                }
        }
    } else if (type == "completion") {
        switch (criteria) {
            case "1":
                if (header == "true") {
                    return "Criteria 1"
                } else {
                    return "This is the completion criteria for criteria 1 " + claim.training.title
                }
            case "2":
                if (header == "true") {
                    return "Criteria 2"
                } else {
                    return "This is the completion criteria for criteria 2 " + claim.training.title
                }
            case "3":
                if (header == "true") {
                    return "Criteria 3"
                } else {
                    return "This is the completion criteria for criteria 3 " + claim.training.title
                }
            case "4":
                if (header == "true") {
                    return "Criteria 4"
                } else {
                    return "This is the completion criteria for criteria 4 " + claim.training.title
                }
            case "5":
                if (header == "true") {
                    return "Criteria 5"
                } else {
                    return "This is the completion criteria for criteria 5 " + claim.training.title
                }
        }
    }
})


addFilter('checkPDF_V1',function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink_V1',function (criteriaNo, type) {
    if (criteriaNo=="1") {
        return "claim"
    } else {
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})
