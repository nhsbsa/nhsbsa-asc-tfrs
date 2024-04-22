//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { formatDate } = require('../helpers/helpers.js');
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
    if (state != null) {
        return "Completed"
    } else if (state == null) {
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
                    return "Course or qualification name"
                } else {
                    return "Does the evidence refer to " + claim.training.title + "?"
                }
            case "2":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the evidence show " + claim.training.awardingOrganisation + "?"
                }
            case "3":
                if (header == "true") {
                    return "How much was paid"
                } else {
                    return "Does the evidence shows how much was paid?"
                }
            case "4":
                if (header == "true") {
                    return "When the payment was made"
                } else {
                    return "Does the evidence show the payment date of  " + claim.costDate + "?"
                }
        }
    } else if (type == "completion") {
        switch (criteria) {
            case "1":
                if (header == "true") {
                    return "Date the training took place or started"
                } else {
                    return "Does the evidence show the training start of " + formatDate(claim.startDate) + "?"
                }
            case "2":
                if (header == "true") {
                    return "Learner’s name"
                } else {
                    return "Does the evidence show the learner was " + claim.learner.givenName + claim.learner.familyName + "?"
                }
            case "3":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the evidence show " + claim.training.awardingOrganisation + "?"
                }
        }
    }
}, { renderAsHtml: true })

addFilter('criteriaAnswer_V1', function (criteria, type, claim) {
    console.log(claim)
    if (type == "payment") {
        if (claim.evidenceOfPaymentreview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfPaymentreview["criteria" + criteria].note
        }
    } else if (type == "completion") {
        if (claim.evidenceOfCompletionreview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfCompletionreview["criteria" + criteria].note
        }
    }
}, { renderAsHtml: true })


addFilter('checkPDF_V1', function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink_V1', function (criteriaNo, type) {
    if (criteriaNo == "1") {
        return "claim"
    } else {
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})


addFilter('dateSort_V1', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('formatCategory_V1', function (category) {

    switch (category) {
        case "query":
            return "Query";
        case "addingContext":
            return "Adding Context";
    }
});


addFilter('reimbursement_V1', function (claim) {
    if (claim.training.reimbursementAmount > claim.reimbursementAmount) {
        return claim.reimbursementAmount
    } else {
        return claim.training.reimbursementAmount
    }

});
