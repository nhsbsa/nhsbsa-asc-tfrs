//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { formatDate } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'rejected' || statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">Processed</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('sectionCheck', function (state) {
    if (state != null) {
        return "Completed"
    } else if (state == null) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim', function (claimID, claims) {
    let claim = null;
    for (let c of claims) {
        if (c.claimID == claimID) {
            claim = c
        }
    }
    return claim;
})

addFilter('criteriaQuestions', function (criteria, type, claim, header) {
    if (type == "payment") {
        switch (criteria) {
            case "1":
                if (header == "true") {
                    return "Course or qualification name"
                } else {
                    return "Does the payment evidence show the training was " + claim.training.title + "?"
                }
            case "2":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the payment evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
            case "3":
                if (header == "true") {
                    return "How much was paid"
                } else {
                    return "Does the payment evidence show how much was paid?"
                }
            case "4":
                if (header == "true") {
                    return "When the payment was made"
                } else {
                    return "Does the payment evidence show the payment date of  " + formatDate(claim.costDate) + "?"
                }
        }
    } else if (type == "completion") {
        switch (criteria) {
            case "1":
                if (header == "true") {
                    return "Date the training took place or started"
                } else {
                    return "Does the completion evidence show the training start of " + formatDate(claim.startDate) + "?"
                }
            case "2":
                if (header == "true") {
                    return "Learner’s name"
                } else {
                    return "Does the completion evidence show the learner was " + claim.learner.givenName + " " + claim.learner.familyName + "?"
                }
            case "3":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the completion evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
        }
    }
}, { renderAsHtml: true })

addFilter('criteriaAnswer', function (criteria, type, claim) {
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


addFilter('checkPDF', function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink', function (criteriaNo, type) {
    if (criteriaNo == "1") {
        return "claim"
    } else {
        criteriaNo = String(Number(criteriaNo)+1)
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})


addFilter('dateSort', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('reimbursement', function (claim) {
    if (claim.training.reimbursementAmount > claim.reimbursementAmount) {
        return claim.reimbursementAmount
    } else {
        return claim.training.reimbursementAmount
    }

});


addFilter('rejectionNote', function (claim) {
    rejectionNote = "<div class='govuk-inset-text'><h3 class='govuk-heading-s'>Claim rejected</h3>"
    if (!claim.evidenceOfPaymentreview.criteria1.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show the training was " + claim.training.title + ".<br>" + claim.evidenceOfPaymentreview.criteria1.note + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria2.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show the provider was " + claim.training.awardingOrganisation + ".<br>" + claim.evidenceOfPaymentreview.criteria2.note + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria3.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show how much was paid."  + "<br>" + claim.evidenceOfPaymentreview.criteria3.note + "</p>"
    }
    if (!claim.evidenceOfPaymentreview.criteria4.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The payment evidence does not show the payment date of  " + formatDate(claim.costDate) + ".<br>" + claim.evidenceOfPaymentreview.criteria4.note + "</p>"
    }

    if (!claim.evidenceOfCompletionreview.criteria1.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the training start date of " + formatDate(claim.startDate) + ".<br>" + claim.evidenceOfCompletionreview.criteria1.note + "</p>"
    }
    if (!claim.evidenceOfCompletionreview.criteria2.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the learner was " + claim.learner.givenName + " " + claim.learner.familyName  + ".<br>" + claim.evidenceOfCompletionreview.criteria2.note + "</p>"
    }
    if (!claim.evidenceOfCompletionreview.criteria3.result) {
        rejectionNote = rejectionNote + "<p class='govuk-body'>The completion evidence does not show the provider was " + claim.training.awardingOrganisation  + ".<br>" + claim.evidenceOfCompletionreview.criteria3.note + "</p>"
    }

    rejectionNote = rejectionNote + "</div>"

    return rejectionNote

}, { renderAsHtml: true })