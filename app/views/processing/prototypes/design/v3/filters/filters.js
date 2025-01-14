//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck, getLearner } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag', function (statusID) {
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

addFilter('sectionCheck', function (state) {
    if (state != null) {
        return "Completed"
    } else if (state == null) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim', function (claims, id) {
    var foundClaim = null
    for (const claim of claims) {
        if (claim.claimID == id) {
            foundClaim = claim
        }
    }
    return foundClaim
})

addFilter('criteriaQuestions', function (criteria, type, claim, header) {
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

addFilter('reimbursementCPD', function (claim, learner) {
    if (learner.cpdBudget == 0) {
        return `<p class="govuk-body">The organisation will not receive reimbursement.</p>`
    } else if (claim.paymentAmount <= learner.cpdBudget) {
        return `<p class="govuk-body">The organisation will receive <span class="govuk-!-font-weight-bold">£${claim.paymentAmount}</span> in reimbursement.</p>
        </p>`
    } else {
        return `<p class="govuk-body">The organisation will receive <span class="govuk-!-font-weight-bold">£${learner.cpdBudget}</span> in reimbursement.</p>
        </p>`
    }
}, { renderAsHtml: true })

addFilter('formatLearnerBudget', function (learnerID, learners) {
    for (let learner of learners) {
        if (learner.id == learnerID) {
            if (learner.cpdBudget == 0) {
                return "None"
            } else {
                return "£" + learner.cpdBudget
            }
        }
    }
})

addFilter('reimbursement', function (claim, paymentReimbursementAmount) {
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

addFilter('findLearner', function (learnerID, learners) {
    for (let learner of learners) {
        if (learner.id == learnerID) {
            return learner
        }
    }
});

addFilter('reimbursementExplanation', function (claim, learner) {
    if (learner.cpdBudget > claim.paymentAmount) {
        return `<p class="govuk-body">The learner's remaining revalidation budget is £${learner.cpdBudget}.</p><p>So the organisation will get back the full cost of the activity: <strong>£${claim.paymentAmount}</strong>.</p>`
    } else if (learner.cpdBudget > 0) {
        return `<p class="govuk-body">The learner's remaining revalidation budget is £${learner.cpdBudget}. The activity cost £${claim.paymentAmount}.</p><p>So the organisation will get back some of the cost: <strong>£${learner.cpdBudget}</strong>.</p>`
    } else {
        return `<p class="govuk-body">The learner has no remaining revalidation budget.</p><p>So the organisation will not get back any reimbursement for this claim.</p>`
    }
}, { renderAsHtml: true });

addFilter('reimbursementApprovedExplanation', function (claim, learner) {
    if (claim.reimbursementAmount == 0) {
        return `<p class="govuk-body">The learner has no remaining revalidation budget.</p><p>So the organisation will not get back any reimbursement for this claim.</p>`
    } else if (claim.paymentAmount > claim.reimbursementAmount) {
        let originalBudget = learner.cpdBudget + claim.reimbursementAmount
        return `<p class="govuk-body">The learner's remaining revalidation budget when processing this claim was £${originalBudget}. The activity cost £${claim.paymentAmount}.</p><p>So the organisation will get back some of the cost: <strong>£${claim.reimbursementAmount}</strong>.</p>`
    } else {
        let originalBudget = learner.cpdBudget + claim.reimbursementAmount
        return `<p class="govuk-body">The learner's remaining revalidation budget when processing this claim was £${originalBudget}.</p><p>So the organisation will get back the full cost of the activity: <strong>£${claim.paymentAmount}</strong>.</p>`
    }
}, { renderAsHtml: true });

addFilter('original_reimbursement_amount', function (claim,paymentReimbursementAmount) {
    if ((claim.fundingType == "TU") && (claim.claimType == "40")) {
        paymentReimbursementAmount = claim.reimbursementAmount
    }
    if (paymentReimbursementAmount > claim.training.reimbursementAmount) {
        return claim.training.reimbursementAmount
    } else {
        return paymentReimbursementAmount
    }
});

addFilter('orgErrorMessage', function (error) {
    if (error == "invalid") {
        return "Enter a valid workplace ID"
    } else if ( error == "missing") {
        return "Enter a workplace ID"
    }
})

addFilter('signatoryErrorMessage', function (submitError) {
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

addFilter('qualificationCheck', function(claim, training, value) {
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

addFilter('matchPairClaim', function(claimID, claims) {
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

addFilter('removeClaimSuffix', function (claimID) {

    // Check if the string has at least two characters
    if (claimID.length < 2) {
        return ''; // Return an empty string if there are less than two characters
    }

    // Use the slice method to remove the last two characters
    return claimID.slice(0, -2);

})