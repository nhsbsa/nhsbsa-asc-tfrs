//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck, getMostRelevantSubmission, findLearnerById, findCourseByCode, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable } = require('../_helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'queried') {
        return '<strong class="govuk-tag govuk-tag--yellow">Needs action</strong>' 
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
        if (claim.evidenceOfPaymentReview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfPaymentReview["criteria" + criteria].note
        }
    } else if (type == "completion") {
        if (claim.evidenceOfCompletionReview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfCompletionReview["criteria" + criteria].note
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

addFilter('reimbursement', function (claim, paymentReimbursementAmount, trainingCourses) {

    let submission = getMostRelevantSubmission(claim)
    let training = findCourseByCode(submission.trainingCode, trainingCourses )
    if ((claim.claimType == "60")) {
        if (training.reimbursementAmount > paymentReimbursementAmount) {
            return paymentReimbursementAmount * 0.6
        } else {
            return training.reimbursementAmount * 0.6
        }
    } else if (claim.claimType == "40") {
        if (training.reimbursementAmount > claim.reimbursementAmount) {
            return claim.reimbursementAmount * 0.4
        } else {
            return training.reimbursementAmount * 0.4
        }
    } else if (training.reimbursementAmount > paymentReimbursementAmount) {
        return paymentReimbursementAmount
    } else {
        return training.reimbursementAmount
    }
});

addFilter('original_reimbursement_amount', function (claim,paymentReimbursementAmount) {
    if (claim.claimType == "40") {
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

    if (submitError == "noChange") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#">You need to change at least one field before you can continue</a></li>')
    } else {
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
        }else if (submitError.email == "duplicate") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">This email address is already in use</a></li>')
        }

    }
    return errorSummaryStr
}, { renderAsHtml: true });

addFilter('qualificationCheck', function(submission, training, value) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    let isQualification = false;

    for (let course of qualificationsObject.courses) {
        if (course.code == submission.trainingCode) {
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
        if (org.workplaceID == id) {
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

addFilter('orderByMostRecent', function (submissions) {
    let sorted = sortSubmissionsByDate(submissions, 'submittedDate')
    return sorted
})

addFilter('createTimelineArray', function (claim, organisations) {
    // Extract the timestamps and their associated data
    const events = [];
    let org = findOrg(organisations, claim.workplaceID)
    let users = flattenUsers(org)

    let latestSubmission = getMostRelevantSubmission(claim)

    if (claim.claimType == "100" || claim.claimType == "40" ) {
        // Add completion date
        events.push({
            type: "trainingDate",
            title: "Training completed",
            date: latestSubmission.completionDate,
            description: null,
            link: null,
            author: null
        });
    }

    if (claim.claimType == "100" || claim.claimType == "60" ) { 
        // Add cost date
        events.push({
            type: "trainingDate",
            title: "Training paid for",
            date: latestSubmission.costDate,
            description: null,
            link: null,
            author: null
        });

        // Add start date
        events.push({
            type: "trainingDate",
            title: "Training started",
            date: latestSubmission.startDate,
            description: null,
            link: null,
            author: null
        });
    }

    for (const submission of claim.submissions) {

        events.push({
            type: "statusDate",
            title: "Claim submitted",
            date: submission.submittedDate,
            description: "View claim",
            link: "/showClaimHistoryNote?noteType=claim&submittedDate=" + submission.submittedDate,
            author: findUser(users, submission.submitter) + " (Submitter)"
        });

        if (
            ((claim.claimType == "100" || claim.claimType == "60") && submission.evidenceOfPaymentReview.outcome == "fail")
            || ((claim.claimType == "100" || claim.claimType == "40") && submission.evidenceOfCompletionReview.outcome == "fail")
            || submission.otherCheck.outcome == "fail"
        ) {

            // Add rejected date
            if (submission.processedDate) {
                events.push({
                    type: "statusDate",
                    title: "Claim rejected",
                    date: submission.processedDate,
                    description:  "View rejection note",
                    link: "/showClaimHistoryNote?noteType=rejectionNote&submittedDate=" + submission.submittedDate,
                    author: "Eren Yeager (Processor)"
                });
            }
        } else if (
            ((claim.claimType == "100" || claim.claimType == "60") && submission.evidenceOfPaymentReview.outcome == "queried")
            || ((claim.claimType == "100" || claim.claimType == "40") && submission.evidenceOfCompletionReview.outcome == "queried")
            || submission.otherCheck.outcome == "queried"
        ) {

            // Add queried date
            if (submission.processedDate) {
                events.push({
                    type: "statusDate",
                    title: "Action needed",
                    date: submission.processedDate,
                    description: "View actions",
                    link: "/showClaimHistoryNote?noteType=queryNote&submittedDate=" + submission.submittedDate,
                    author: "Eren Yeager (Processor)"
                });
            }

        } else if (
            (claim.claimType == "100" && submission.evidenceOfPaymentReview.outcome == "pass" && submission.evidenceOfCompletionReview.outcome == "pass" && submission.otherCheck.outcome == "pass") 
            || (claim.claimType == "60" && submission.evidenceOfPaymentReview.outcome == "pass" && submission.otherCheck.outcome == "pass")
            || (claim.claimType == "40" && submission.evidenceOfCompletionReview.outcome == "pass" && submission.otherCheck.outcome == "pass")) {

            // Add approved date
            if (submission.processedDate) {
                events.push({
                    type: "statusDate",
                    title: "Claim approved",
                    date: submission.processedDate,
                    description:  null,
                    link: null,
                    author: "Eren Yeager (Processor)"
                });
            }

        } 
    }

    // Add created date
    if (claim.createdDate) {
        events.push({
            type: "statusDate",
            title: "Claim created",
            date: claim.createdDate,
            description: null,
            link: null,
            author: findUser(users, claim.createdBy) + " (Submitter)"
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

addFilter('findOrgClaims', function (orgID, claims) {
    let orgClaims = [];
    for (const claim of claims) {
      if (claim.workplaceID == orgID) {
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
    
    return claims.sort((a, b) => {
        const statusOrder = { submitted: 1, queried: 2, rejected: 3, approved: 4};
        
        // Compare statuses based on order
        const statusComparison = statusOrder[a.status] - statusOrder[b.status];
        if (statusComparison !== 0) return statusComparison;
        
        // If statuses are the same, sort by corresponding date in descending order
        const dateField = a.status === "submitted" ? "submittedDate" : 
                          "processedDate";
        
        let aSubmission =  getMostRelevantSubmission(a)     
        let bSubmission =  getMostRelevantSubmission(b)     
        return new Date(bSubmission[dateField]) - new Date(aSubmission[dateField]);
    });
})

addFilter('getMostRelevantSubmission', (claim) => {
    let recentClaim = getMostRelevantSubmission(claim)
    return recentClaim
})

addFilter('userStatusTag', function (status) {

    if (status == 'active') {
        return '<strong class="govuk-tag govuk-tag--blue">Active</strong>'
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

addFilter('sortByFirstName', function (inactiveClaims) {
    return inactiveClaims.sort((a, b) => {
        return a.givenName.localeCompare(b.givenName);
      });
})

addFilter('findTraining', (trainingCode, trainingArray) => {
    return findCourseByCode(trainingCode, trainingArray)
})

addFilter('findLearner', (learnerID, learners) => {
    return findLearnerById(learnerID, learners)
})

addFilter('trainingTypeCheck', function (trainingCode, trainingList, matchType) {

    for (let trainingGroup of trainingList) {
        for (let training of trainingGroup.courses) {
            if (trainingCode == training.code) {
                return trainingGroup.groupTitle == matchType;
            }
        }
    }

})

addFilter('findUser', function (email, org) {
    users = flattenUsers(org)
    let user = null;
    for (let u of users) {
        if (u.email == email) {
            user = u
        }
    }
    return user;
})


addFilter('findSubmissionByDate', function (submissions, submittedDate) {
    const submission = submissions.find(s => s.submittedDate == submittedDate);
    return submission
})

addFilter('comparePaymentDate', function(date) {
    const paymentDate = new Date(date);

    const policyDate = new Date('2025-04-01');

    if (paymentDate >= policyDate) {
        return true
    } else {
        return false
    }
})

addFilter('sortSubmissionsForTable', function (submissions) {
    let sorted = sortSubmissionsForTable(submissions)
    return sorted
})

addFilter('matchSubmissionToText', function (submissions) {
    const submissionLabels = submissions.map((submission, index, array) => {
        if (!submission.submittedDate) {
          return "Current draft";
        } else {
          // Count how many submissions (after this one) have a submittedDate
          const submittedAfter = array.slice(index + 1).filter(s => s.submittedDate).length;
      
          if (submittedAfter === 0) return "First submission";
          if (submittedAfter === 1) return "Second submission";
          if (submittedAfter === 2) return "Third submission";
          if (submittedAfter === 3) return "Fourth submission";
          if (submittedAfter === 4) return "Fifth submission";
          return `${submittedAfter + 1}th submission`; // fallback for 4th and beyond
        }
      });
      return submissionLabels
    // let text = ["First submission", "Second submission", "Third submission", "Fourth submission", "Fifth submission"]
    // return text[count]
})

addFilter('formatText', function (submission) {
    let text = ""
    if (submission.evidenceOfPaymentReview.note) {
        text = submission.evidenceOfPaymentReview.note + " "
    }
    if (submission.evidenceOfCompletionReview.note) {
        text += submission.evidenceOfCompletionReview.note
    }
    return text
})

addFilter('trunctateString', function (string) {
    return string.slice(0, 30);
})