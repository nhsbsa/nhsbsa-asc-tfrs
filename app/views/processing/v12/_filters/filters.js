//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck, getMostRelevantSubmission, findLearnerById, findCourseByCode, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable, loadJSONFromFile, isInternalOMMT } = require('../_helpers/helpers.js');
const fs = require('fs');
const dataPath = 'app/views/processing/v12/_data/'

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

addFilter('findClaim', function (claimID, claims) {
    let claim = null;
    for (let c of claims) {
        if (c.claimID == claimID) {
            claim = c
        }
    }
    return claim;
})

addFilter('dateSort', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('reimbursement', function (claim, paymentReimbursementAmount) {

    let submission = getMostRelevantSubmission(claim)
    let training = findCourseByCode(submission.trainingCode)
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

addFilter('parseInt', function(value, radix = 10) {
    return parseInt(value, radix);
});

addFilter('min', (value1, value2) => {
    return Math.min(value1, value2);
});

addFilter('sortByFirstName', function (inactiveClaims) {
    return inactiveClaims.sort((a, b) => {
        return a.givenName.localeCompare(b.givenName);
      });
})

addFilter('findTraining', (trainingCode) => {
    return findCourseByCode(trainingCode)
})

addFilter('findLearner', (learnerID) => {
    return findLearnerById(learnerID)
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
    if (submission.evidenceOfPaymentReview && submission.evidenceOfPaymentReview.note) {
        text = submission.evidenceOfPaymentReview.note + " "
    }
    if (submission.evidenceOfCompletionReview && submission.evidenceOfCompletionReview.note) {
        text += submission.evidenceOfCompletionReview.note
    }
    return text
})

addFilter('trunctateString', function (string) {
    return string.slice(0, 30);
})

addFilter('formatCountToText', function (count) {
    if (count == 1) { return "First"} 
    if (count == 2) { return "Second"} 
    if (count == 3) { return "Third"} 
    if (count == 4) { return "Fourth"} 
})
addFilter('returntrainingType', function (code) {
   const dataPath = 'app/views/processing/v12/_data/'
    const trainingCourses = loadJSONFromFile('training.json', dataPath)
    for (const group of trainingCourses) {
        const course = group.courses.find(course=>course.code ==code);
        if (course){
            if (group.groupTitle=="Courses"){
                return "Course code"
            } else if(group.groupTitle=="Qualifications") {
                return "Qualification number"
            }
        }
    }
    return null
})

addFilter('isInternalOMMT', function (courseCode) {
    return isInternalOMMT(courseCode)
})

addFilter('isAllInternalOMMT', function (submissions) {
    let check = true
    for (const submission of submissions) {
        if (!isInternalOMMT(submission.trainingCode)) {
            check = false
        }
    }
    return check
})

addFilter('qualificationCheck', function(trainingCode, value) {
    const training = loadJSONFromFile('training.json', dataPath)

    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    let isQualification = false;

    for (let course of qualificationsObject.courses) {
        if (course.code == trainingCode) {
            isQualification = true
        }
    }
    if (isQualification) {
        return value
    } else {
        return "Not applicable"
    }
})

addFilter('claimTypeText', function (claimType, submissionCheck) {
    switch(claimType) {
        case "100":
            if (submissionCheck) {
                return "claim"
            } else {
                return "100 claim"
            }
        case "60":
            return "60 part"
        case "40":
            return "40 part"
        }
})

addFilter('sortLearners', function (learners) {
    const allLearners = loadJSONFromFile('learners.json', dataPath)
    const mergedLearners = learners.map(learner => {
        const match = allLearners.find(a => a.id === learner.learnerID);
        return {
            ...learner,
            ...match // adds givenName and familyName if found
        };
    });
    const sortedLearners = mergedLearners.sort((a, b) =>
        a.givenName.localeCompare(b.givenName)
     );
    return sortedLearners
})

addFilter('dateRange', function (learners) {
    const dates = learners.map(l => new Date(l.completionDate));
    const firstDate = new Date(Math.min(...dates));
    const lastDate = new Date(Math.max(...dates));

    const formatDate = date =>
        date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const dateRange =
    firstDate.getTime() === lastDate.getTime()
    ? formatDate(firstDate)
    : `${formatDate(firstDate)} to ${formatDate(lastDate)}`;

    return dateRange
})

addFilter('learnerProcessedTag', function (outcome) {
    if (outcome == 'queried') {
        return '<strong class="govuk-tag govuk-tag--yellow">Needs action</strong>' 
    } else if (outcome == 'pass') {
        return '<strong class="govuk-tag govuk-tag--green">Approved</strong>' 
    } else if (outcome == 'fail') {
        return '<strong class="govuk-tag govuk-tag--red">Rejected</strong>' 
    }
}, { renderAsHtml: true })