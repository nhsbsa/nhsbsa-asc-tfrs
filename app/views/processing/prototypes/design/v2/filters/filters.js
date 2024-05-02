//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag_V2', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'rejected' || statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">Processed</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('sectionCheck_V2', function (state) {
    if (state != null) {
        return "Completed"
    } else if (state == null) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim_V2', function (claims, id) {
    var foundClaim = null
    for (const claim of claims) {
        if (claim.claimID == id) {
            foundClaim = claim
        }
    }
    return foundClaim
})

addFilter('criteriaQuestions_V2', function (criteria, type, claim, header) {
    if (type == "payment") {
        switch (criteria) {
            case "0":
                if (header == "true") {
                    return "Course or qualification name"
                } else {
                    return "Does the payment evidence show the training was " + claim.training.title + "?"
                }
            case "1":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the payment evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
            case "2":
                if (header == "true") {
                    return "How much was paid"
                } else {
                    return "Does the payment evidence show how much was paid?"
                }
            case "3":
                if (header == "true") {
                    return "When the payment was made"
                } else {
                    return "Does the payment evidence show the payment date of  " + formatDate(claim.costDate) + "?"
                }
        }
    } else if (type == "completion") {
        switch (criteria) {
            case "0":
                if (header == "true") {
                    return "Date the training took place or started"
                } else {
                    return "Does the completion evidence show the training start of " + formatDate(claim.startDate) + "?"
                }
            case "1":
                if (header == "true") {
                    return "Learner’s name"
                } else {
                    return "Does the completion evidence show the learner was " + claim.learner.givenName + " " + claim.learner.familyName + "?"
                }
            case "2":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the completion evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
        }
    }
}, { renderAsHtml: true })

addFilter('criteriaAnswer_V2', function (criteria, type, claim) {
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


addFilter('checkPDF_V2', function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink_V2', function (criteriaNo, type) {
    if (criteriaNo == "1") {
        return "claim"
    } else {
        criteriaNo = String(Number(criteriaNo)+1)
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})


addFilter('dateSort_V2', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('reimbursement_V2', function (claim) {
    if (claim.training.reimbursementAmount > claim.reimbursementAmount) {
        return claim.reimbursementAmount
    } else {
        return claim.training.reimbursementAmount
    }

});


addFilter('rejectionNote_V2', function (claim, criteria) {
    rejectionNote = "<div class='govuk-inset-text'><h3 class='govuk-heading-s'>Claim rejected</h3>"

    if (!claim.evidenceOfPaymentreview.criteria0.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>' + The payment evidence does not show the training was " + claim.training.title + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria1.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show the provider was " + claim.training.awardingOrganisation + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria2.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show how much was paid."  + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria3.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show the payment date of  " + formatDate(claim.costDate) + "</p>"
    }

    if (!claim.evidenceOfCompletionreview.criteria0.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the training start date of " + formatDate(claim.startDate) + "</p>"
    }
    if (!claim.evidenceOfCompletionreview.criteria1.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the learner was " + claim.learner.givenName + " " + claim.learner.familyName  + "</p>"
    }
    if (!claim.evidenceOfCompletionreview.criteria2.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the provider was " + claim.training.awardingOrganisation  + "</p>"
    }

    rejectionNote = rejectionNote + "</div>"

    return rejectionNote

}, { renderAsHtml: true })


addFilter('returnCriteria_V2', function (type, criteria) {
    for (const group of criteria) {
        if (group.type == type) {
            return group.criteriaList
        }
    }
});

addFilter('returnaAsHTML_V2', function (string, claim) {
    const returnString = renderString(string, {claim})
    return returnString
}, { renderAsHtml: true });