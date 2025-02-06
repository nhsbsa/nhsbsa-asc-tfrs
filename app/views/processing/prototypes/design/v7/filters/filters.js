//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck } = require('../helpers/helpers.js');
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

addFilter('findOrg', function (organisations, id) {
    var foundOrg = null
    for (const org of organisations) {
        if (org.workplaceId == id) {
            foundOrg = org
        }
    }
    return foundOrg
})

addFilter('formatInformation', function (foundOrg, enteredInfo, isFromCheckEdited, isNewOrg) {
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


addFilter('createTimelineArray', function (claim) {
    // Extract the timestamps and their associated data
    const events = [];

    // Add created date
    if (claim.createdDate) {
        events.push({
            type: "statusDate",
            title: "Claim created",
            date: claim.createdDate,
            description: null,
            author: claim.createdBy + " (Submitter)"
        });
    }

    // Add submitted date
    if (claim.submittedDate) {
        events.push({
            type: "statusDate",
            title: "Claim submitted",
            date: claim.submittedDate,
            description: null,
            author: claim.createdBy + " (Submitter)"
        });
    }

    // Add completion date
    if (claim.completionDate) {
        events.push({
            type: "trainingDate",
            title: "Training completed",
            date: claim.completionDate,
            description: claim.completionNote || null,
            author: null
        });
    }

    // Add rejected date
    if (claim.approvedDate) {
        events.push({
            type: "statusDate",
            title: "Claim approved",
            date: claim.approvedDate,
            description:  null,
            author: "Eren Yeager (Processor)"
        });
    }

    // Add rejected date
    if (claim.rejectedDate) {
        events.push({
            type: "statusDate",
            title: "Claim rejected",
            date: claim.rejectedDate,
            description: claim.rejectedNote || null,
            author: "Eren Yeager (Processor)"
        });
    }

    // Add cost date
    if (claim.costDate) {
        events.push({
            type: "trainingDate",
            title: "Training paid for",
            date: claim.costDate,
            description: null,
            author: null
        });
    }

    // Add cost date
    if (claim.startDate) {
        events.push({
            type: "trainingDate",
            title: "Training started",
            date: claim.startDate,
            description: null,
            author: null
        });
    }


    // Add notes
    if (claim.notes && Array.isArray(claim.notes)) {
        claim.notes.forEach(note => {
            events.push({
                type: "note",
                title: "Note added",
                date: note.date,
                description: note.note,
                author: note.author
            });
        });
    }

    // Sort the events by date in descending order
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events;
})


addFilter('countOccurrences', function (events,string) {
     // Validate input
    if (!Array.isArray(events)) {
        throw new Error("The first argument must be an array.");
    }
    if (typeof string !== "string") {
        throw new Error("The second argument must be a string.");
    }

    // Count the objects
    return events.reduce((count, obj) => {
        if (string === "all" || obj.type === string) {
            count++;
        }
        return count;
    }, 0);
})

addFilter('findOrganisation', function (orgID, organisations) {
    let organisation = null;
    for (const org of organisations) {
      if (org.workplaceId == orgID) {
        organisation = org
      }
    }
    return organisation;
})

addFilter('findOrgClaims', function (orgID, claims) {
    let orgClaims = [];
    for (const claim of claims) {
      if (claim.workplaceId == orgID) {
        orgClaims.push(claim)
      }
    }
    return orgClaims;
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('typeTag', function (type) {
    switch (type) {
        case null:
            return ""
        case "100":
            return '<strong class="govuk-tag govuk-tag--orange">100</strong>'
        case "60":
            return '<strong class="govuk-tag govuk-tag--yellow">60</strong>'
        case "40":
            return '<strong class="govuk-tag govuk-tag--purple">40</strong>'
    }
}, { renderAsHtml: true })

addFilter('orderClaims', function (claims) {
    // Desired order of statuses
    const statusOrder = ["submitted", "rejected", "approved"];

    // Sort function
    claims.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
    
    return claims
})

addFilter('userStatusTag', function (status) {

    if (status == 'active') {
        return '<strong class="govuk-tag govuk-tag--blue">Active</strong>'
    } else if (status == 'registered') {
        return '<strong class="govuk-tag govuk-tag--green">Registered</strong>'
    } else if (status == 'invited') {
        return '<strong class="govuk-tag govuk-tag--yellow">Invited</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Inactive</strong>'
    }
}, { renderAsHtml: true })

addFilter('matchResend', function (resendList, email) {
    if (resendList != null && resendList != "") {
        for (const e of resendList) {
            if (e == email) {
                return true
            }
        }
    }
    return false
})

addFilter('removeClaimSuffix', function (claimID) {
    // Check if the string has at least two characters
    if (claimID.length < 2) {
        return ''; // Return an empty string if there are less than two characters
    }
    // Use the slice method to remove the last two characters
    return claimID.slice(0, -2);
})

addFilter('typeTag', function (type) {
    switch (type) {
        case null:
            return ""
        case "100":
            return '<strong class="govuk-tag govuk-tag--orange">100</strong>'
        case "60":
            return '<strong class="govuk-tag govuk-tag--yellow">60</strong>'
        case "40":
            return '<strong class="govuk-tag govuk-tag--purple">40</strong>'
    }
}, { renderAsHtml: true })

addFilter('parseInt', function(value, radix = 10) {
    return parseInt(value, radix);
});

addFilter('min', (value1, value2) => {
    return Math.min(value1, value2);
});


addFilter('processedDate', function (claim) {
    let processedDate = null
    if (claim.approvedDate) {
        processedDate = claim.approvedDate
    } else if (claim.rejectedDate) {
        processedDate = claim.rejectedDate
    }
    return processedDate
})