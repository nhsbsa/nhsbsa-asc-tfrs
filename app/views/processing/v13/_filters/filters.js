//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { formatDate, getMostRelevantSubmission, findLearnerById, findCourseByCode, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable, loadJSONFromFile, isInternalOMMT, getOverallStatus, sortAlphabetically, checkDone, buildLearnerComparison } = require('../_helpers/helpers.js');
const fs = require('fs');
const dataPath = 'app/views/processing/v13/_data/'

addFilter('processorstatusTag', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'inProgress') {
        return '<strong class="govuk-tag govuk-tag--light-blue">In progress</strong>' 
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
        const statusOrder = { inProgress: 1, submitted: 2, queried: 3, rejected: 4, approved: 5};
        
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

addFilter('findLearnerSubmissionByDate', function (submissions, submittedDate, learner) {
    const submission = submissions.find(s => s.submittedDate == submittedDate);
    const foundLearner = submission.learners.find(l => l.learnerID == learner);
    return foundLearner
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

addFilter('sortLearnersForTable', function (submissions) {
    let sorted = sortSubmissionsForTable(submissions)
    let newLearnerArray = buildLearnerComparison(sorted)
    return newLearnerArray
})

addFilter('checkIfMultipleLearners', function (submissions) {
    let moreThanOne = false
        for (let sub of submissions) {
            if (sub.learners.length > 1) {
                moreThanOne = true
            }
        }
    return moreThanOne
})

addFilter('getFirstDate', function (learners) {
  if (!learners || learners.length === 0) return null;

  const dates = learners
    .map(l => l.completionDate)
    .filter(Boolean);

  if (dates.length === 0) return null;
  dates.sort((a, b) => new Date(a) - new Date(b));
  return dates[0]
})

addFilter('getLastDate', function (learners) {
  if (!learners || learners.length === 0) return null;

  const dates = learners
    .map(l => l.completionDate)
    .filter(Boolean);

  if (dates.length === 0) return null;
  dates.sort((a, b) => new Date(a) - new Date(b));
  return dates[dates.length - 1]
})

addFilter('learnerCountChanges', function (currentSubmission, previousSubmission) {
    let learnerChangeCount = 0
    if (!currentSubmission.learners || !previousSubmission?.learners) {
        learnerChangeCount = 0
        return
    }
    const currentIds = currentSubmission.learners.map(l => l.learnerID)
    const nextIds = previousSubmission.learners.map(l => l.learnerID)

    const removed = currentIds.filter(id => !nextIds.includes(id))
    const added = nextIds.filter(id => !currentIds.includes(id))

    learnerChangeCount = removed.length + added.length
    return learnerChangeCount
})

addFilter('completionDateCountChanges', function (currentSubmission, previousSubmission) {
    if (!currentSubmission?.learners || !previousSubmission?.learners) {
        return 0
    }
    // Map learnerID → completionDate for previous submission
    const previousMap = new Map(
        previousSubmission.learners.map(l => [
        l.learnerID,
        l.completionDate
        ])
    )
  let changeCount = 0
  for (const learner of currentSubmission.learners) {
    const previousDate = previousMap.get(learner.learnerID)
    // Only count if learner existed before
    if (!previousDate) continue
    if (learner.completionDate !== previousDate) {
      changeCount++
    }
  }
  return changeCount
})

addFilter('completionEvidenceCountChanges', function (currentSubmission, previousSubmission) {
    let changeCount = 0

    if (!currentSubmission.learners || !previousSubmission?.learners) {
        return 0
    }

    const currentLearners = currentSubmission.learners
    const previousLearners = previousSubmission.learners

    const currentIds = currentLearners.map(l => l.learnerID)
    const previousIds = previousLearners.map(l => l.learnerID)

    // learnerID → evidenceOfCompletion (previous submission)
    const previousEvidenceMap = new Map(
        previousLearners.map(l => [
            l.learnerID,
            l.evidenceOfCompletion
        ])
    )

    // Evidence removed (learner removed)
    previousIds.forEach(id => {
        if (!currentIds.includes(id)) {
            changeCount++
        }
    })

    // Evidence added (learner added)
    currentIds.forEach(id => {
        if (!previousIds.includes(id)) {
            changeCount++
        }
    })

    //  Evidence changed (same learner, different file)
    currentLearners.forEach(learner => {
        if (!previousEvidenceMap.has(learner.learnerID)) return

        const previousEvidence = previousEvidenceMap.get(learner.learnerID)

        if (learner.evidenceOfCompletion !== previousEvidence) {
            changeCount++
        }
    })

    return changeCount
})

addFilter('checkWhatHasChanged', function (submissions) {

  if (submissions.length <= 1) {
    // Only one submission → nothing has changed
    return {
      training: false,
      startDate: false,
      paymentDate: false,
      evidenceOfPayment: false,
      learners: false,
      completionDate: false,
      completionEvidence: false
    }
  }

  // Start with the first submission as “baseline”
  const baseline = submissions[0]

  const flags = {
    training: false,
    startDate: false,
    paymentDate: false,
    evidenceOfPayment: false,
    learners: false,
    completionDate: false,
    completionEvidence: false
  }

  for (let i = 1; i < submissions.length; i++) {
    const current = submissions[i]

    // Training
    if (current.trainingCode !== baseline.trainingCode) flags.training = true

    // Start date
    if (current.startDate !== baseline.startDate) flags.startDate = true

    // Payment date
    if (current.costDate !== baseline.costDate) flags.paymentDate = true

    // Evidence of payment
    const currEOP = current.evidenceOfPayment || []
    const baseEOP = baseline.evidenceOfPayment || []
    if (
      currEOP.length !== baseEOP.length ||
      currEOP.some(f => !baseEOP.includes(f))
    )
      flags.evidenceOfPayment = true

    // Learners added/removed
    const currLearners = current.learners || []
    const baseLearners = baseline.learners || []
    const currIds = currLearners.map(l => l.learnerID)
    const baseIds = baseLearners.map(l => l.learnerID)

    if (
      currIds.some(id => !baseIds.includes(id)) ||
      baseIds.some(id => !currIds.includes(id))
    )
      flags.learners = true

    // Completion date
    const baseDateMap = new Map(baseLearners.map(l => [l.learnerID, l.completionDate]))
    if (
      flags.learners ||
      currLearners.some(
        l => baseDateMap.has(l.learnerID) && l.completionDate !== baseDateMap.get(l.learnerID)
      )
    )
      flags.completionDate = true

    // Completion evidence
    const baseEvidenceMap = new Map(
      baseLearners.map(l => [l.learnerID, l.evidenceOfCompletion])
    )
    if (
      flags.learners ||
      currLearners.some(
        l =>
          baseEvidenceMap.has(l.learnerID) &&
          l.evidenceOfCompletion !== baseEvidenceMap.get(l.learnerID)
      )
    )
      flags.completionEvidence = true
  }

  return flags
})


addFilter('hasRemoved', function (learners) {
    let hasRemoved = false

    for (const l of learners) {
        if (l.status == "removed") {
            hasRemoved = true
        }

    }
    return hasRemoved
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
   const dataPath = 'app/views/processing/v13/_data/'
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

addFilter('checkCompletionOutcome', function (learners) {
    return getOverallStatus(learners)
})

addFilter('checkDone', function (review, type, claimType) {
        return checkDone(review, type, claimType)
})

addFilter('sortLearners', function (learners) {
    
    return sortAlphabetically(learners)
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
        return '<strong class="govuk-tag govuk-tag--green">Criteria met</strong>' 
    } else if (outcome == 'fail') {
        return '<strong class="govuk-tag govuk-tag--red">Rejected</strong>' 
    }
}, { renderAsHtml: true })

addFilter('filterLearners', function (learners, status) {
    let filtered = []
    filtered = learners.filter( l => l.evidenceOfCompletionReview.outcome == status)
    return filtered
})

addFilter('merge', function(obj1, obj2) {
    // Simple shallow merge: obj2 overrides obj1
    return Object.assign({}, obj1, obj2);
});

addFilter('outcomeText', function(outcome) {
    let text = null
    switch(outcome) {
        case "pass":
            text = "Criteria met"
            break;
        case "fail":
            text = "Rejected"
            break;
        case "queried":
            text = "Needs action"
            break;
        default:
            // code block
    }
    return text;
});

addFilter('checkIfMissing', function(targetId, checkList) {
    return checkList.some(item => item.id === targetId);
});