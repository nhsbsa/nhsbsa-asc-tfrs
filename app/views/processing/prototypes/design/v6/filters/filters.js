//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag_V6', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">Approved</strong>' 
    }else if (statusID == 'rejected') {
        return '<strong class="govuk-tag govuk-tag--red">Rejected</strong>' 
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('sectionCheck_V6', function (state) {
    if (state != null) {
        return "Completed"
    } else if (state == null) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim_V6', function (claims, id) {
    var foundClaim = null
    for (const claim of claims) {
        if (claim.claimID == id) {
            foundClaim = claim
        }
    }
    return foundClaim
})

addFilter('criteriaQuestions_V6', function (criteria, type, claim, header) {
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

addFilter('criteriaAnswer_V6', function (criteria, type, claim) {
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


addFilter('checkPDF_V6', function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink_V6', function (criteriaNo, type) {
    if (criteriaNo == "1") {
        return "claim"
    } else {
        criteriaNo = String(Number(criteriaNo)+1)
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})


addFilter('dateSort_V6', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('reimbursement_V6', function (claim, paymentReimbursementAmount) {
    if ((claim.fundingType == "TU") && (claim.claimType == "60")) {
        if (claim.training.reimbursementAmount > paymentReimbursementAmount) {
            return paymentReimbursementAmount * 0.6
        } else {
            return claim.training.reimbursementAmount * 0.6
        }
    } else if ((claim.fundingType == "TU") && (claim.claimType == "40")) {
        if (claim.training.reimbursementAmount > claim.reimbursementAmount) {
            return claim.reimbursementAmount * 0.4
        } else {
            return claim.training.reimbursementAmount * 0.4
        }
    } else if (claim.training.reimbursementAmount > paymentReimbursementAmount) {
        return paymentReimbursementAmount
    } else {
        return claim.training.reimbursementAmount
    }
});

addFilter('original_reimbursement_amount_V6', function (claim,paymentReimbursementAmount) {
    if ((claim.fundingType == "TU") && (claim.claimType == "40")) {
        paymentReimbursementAmount = claim.reimbursementAmount
    }
    if (paymentReimbursementAmount > claim.training.reimbursementAmount) {
        return claim.training.reimbursementAmount
    } else {
        return paymentReimbursementAmount
    }
});

addFilter('orgErrorMessage_V6', function (error) {
    if (error == "invalid") {
        return "Enter a valid workplace ID"
    } else if ( error == "missing") {
        return "Enter a workplace ID"
    }
})

addFilter('signatoryErrorMessage_V9', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.email == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address</a></li>')
    } else if (submitError.email == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address in the correct format, like name@example.com</a></li>')
    }
    return errorSummaryStr
}, { renderAsHtml: true });

addFilter('qualificationCheck_V6', function(claim, training, value) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    let isQualification = false;

    for (let course of qualificationsObject.courses) {
        if (course.title == claim.training.title) {
            isQualification = true
        }
    }
    if (isQualification) {
        return value
    } else {
        return "Not applicable"
    }
})

addFilter('matchPairClaim_V6', function(claimID, claims) {
    var pairID = null
    var pairClaim = null

    let lastChar = claimID.charAt(claimID.length - 1); // Get the last character of the string

    if (lastChar === 'B') {
      pairID = claimID.slice(0, -1) + 'C'; // Change 'B' to 'C'
    } else if (lastChar === 'C') {
      pairID =  claimID.slice(0, -1) + 'B'; // Change 'C' to 'B'
    } 

    for (const c of claims) {
        if (c.claimID == pairID) {
            pairClaim = c
            break;
        }
    }

    return pairClaim

})

addFilter('findOrg_V6', function (organisations, id) {
    var foundOrg = null
    for (const org of organisations) {
        if (org.workplaceId == id) {
            foundOrg = org
        }
    }
    return foundOrg
})

addFilter('formatInformation_V6', function (foundOrg, enteredInfo, isFromCheckEdited, isNewOrg) {
    var info = ""
    if (isNewOrg == "true" || isFromCheckEdited == "true" ) {
        if (enteredInfo != null) {
            info = enteredInfo
        } else {
            info = foundOrg
        }
    } else {
        if (foundOrg != null) {
            info = foundOrg
        }
    }
    return info
})


