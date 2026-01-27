//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { formatDate, getMostRelevantSubmission, findLearnerById, findCourseByCode, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable, loadJSONFromFile, isInternalOMMT, getOverallStatus, sortAlphabetically, checkDone, buildSlotComparison, orderSubmissions } = require('../_helpers/helpers.js');
const fs = require('fs');
const dataPath = 'app/views/processing/v14/_data/'

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

addFilter('sortLearnerSlotsForTable', function (submissions) {
    let sorted = sortSubmissionsForTable(submissions)
    let newLearnerArray = buildSlotComparison(sorted)
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

addFilter('getPreviousLearnerID', function (slot) {
  if (!slot || !slot.history) return null;

  // history is [latest, older, ..., oldest]
  // slot is removed, so history[0] is null
  for (let i = 1; i < slot.history.length; i++) {
    if (slot.history[i]) {
      return slot.history[i].learnerID;
    }
  }
  return null;
});
addFilter('hasChanges', function (slots) {
  if (!slots || !Array.isArray(slots)) return false;

  let changed = slots.some(slot => {
    const flags = slot.changeFlags || {};
    return flags.completionDate || flags.evidenceOfCompletion || flags.status;
  });
  return changed
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
  if (!currentSubmission?.learners || !previousSubmission?.learners) {
    return 0
  }

  const currentBySlot = new Map(
    currentSubmission.learners.map(l => [l.slotID, l.learnerID])
  )

  const previousBySlot = new Map(
    previousSubmission.learners.map(l => [l.slotID, l.learnerID])
  )

  const allSlotIDs = new Set([
    ...currentBySlot.keys(),
    ...previousBySlot.keys()
  ])

  let learnerChangeCount = 0

  for (const slotID of allSlotIDs) {
    const currentLearner = currentBySlot.get(slotID)
    const previousLearner = previousBySlot.get(slotID)

    // Slot added or removed
    if (currentLearner === undefined || previousLearner === undefined) {
      learnerChangeCount++
      continue
    }

    // Same slot, different learner
    if (currentLearner !== previousLearner) {
      learnerChangeCount++
    }
  }

  return learnerChangeCount
})

addFilter('completionDateCountChanges', function (currentSubmission, previousSubmission) {
  if (!currentSubmission?.learners || !previousSubmission?.learners) {
    return 0
  }

  // Map completionDate by slotID
  const currentBySlot = new Map(
    currentSubmission.learners.map(l => [l.slotID, l.completionDate])
  )
  const previousBySlot = new Map(
    previousSubmission.learners.map(l => [l.slotID, l.completionDate])
  )

  let changeCount = 0

  // Compare only slots that exist in BOTH submissions
  for (const [slotID, currentDate] of currentBySlot.entries()) {
    const previousDate = previousBySlot.get(slotID)
    if (previousDate === undefined) continue // added slot → ignore
    if (currentDate !== previousDate) changeCount++ // only count actual date differences
  }

  return changeCount
})

addFilter('completionEvidenceCountChanges', function (currentSubmission, previousSubmission) {
  if (!currentSubmission?.learners || !previousSubmission?.learners) {
    return 0
  }

  // Map evidence by slotID
  const currentBySlot = new Map(
    currentSubmission.learners.map(l => [l.slotID, l.evidenceOfCompletion])
  )
  const previousBySlot = new Map(
    previousSubmission.learners.map(l => [l.slotID, l.evidenceOfCompletion])
  )

  // Get all slotIDs across both submissions
  const allSlotIDs = new Set([...currentBySlot.keys(), ...previousBySlot.keys()])

  let changeCount = 0

  for (const slotID of allSlotIDs) {
    const currentEvidence = currentBySlot.get(slotID)
    const previousEvidence = previousBySlot.get(slotID)

    if (currentEvidence === undefined || previousEvidence === undefined) {
      // Slot added or removed
      changeCount++
    } else if (currentEvidence !== previousEvidence) {
      // Evidence changed for existing slot
      changeCount++
    }
  }

  return changeCount
})

addFilter('checkWhatHasChanged', function (submissions) {
  const flags = {
    training: false,
    startDate: false,
    paymentDate: false,
    evidenceOfPayment: false,
    learners: false,
    completionDate: false,
    completionEvidence: false
  }

  if (submissions.length <= 1) return flags

  // Sort submissions chronologically (oldest → newest)
  const ordered = [...submissions].sort(
    (a, b) => new Date(a.submittedDate) - new Date(b.submittedDate)
  )

  for (let i = 0; i < ordered.length - 1; i++) {
    const prev = ordered[i]
    const next = ordered[i + 1]

    // --- Training ---
    if (prev.trainingCode !== next.trainingCode) flags.training = true

    // --- Start date ---
    if (prev.startDate !== next.startDate) flags.startDate = true

    // --- Payment date ---
    if (prev.costDate !== next.costDate) flags.paymentDate = true

    // --- Evidence of Payment ---
    const prevEOP = prev.evidenceOfPayment || []
    const nextEOP = next.evidenceOfPayment || []
    if (
      prevEOP.length !== nextEOP.length ||
      prevEOP.some(f => !nextEOP.includes(f))
    ) flags.evidenceOfPayment = true

    // --- Learners / Slots ---
    const prevSlots = prev.learners || []
    const nextSlots = next.learners || []

    const prevSlotMap = new Map(prevSlots.map(l => [l.slotID, l]))
    const nextSlotMap = new Map(nextSlots.map(l => [l.slotID, l]))

    const prevSlotIDs = new Set(prevSlotMap.keys())
    const nextSlotIDs = new Set(nextSlotMap.keys())

    const removedSlots = [...prevSlotIDs].filter(id => !nextSlotIDs.has(id))
    const addedSlots = [...nextSlotIDs].filter(id => !prevSlotIDs.has(id))

    // --- Learners flag ---
    if (removedSlots.length > 0 || addedSlots.length > 0) {
      flags.learners = true
    }

    for (const slotID of [...prevSlotIDs].filter(id => nextSlotIDs.has(id))) {
      const prevLearner = prevSlotMap.get(slotID)
      const nextLearner = nextSlotMap.get(slotID)
      if (prevLearner.learnerID !== nextLearner.learnerID) {
        flags.learners = true
      }
    }

    // --- Completion date ---
    for (const slotID of prevSlotIDs) {
      const prevLearner = prevSlotMap.get(slotID)
      const nextLearner = nextSlotMap.get(slotID)
      if (!nextLearner || prevLearner.completionDate !== nextLearner.completionDate) {
        flags.completionDate = true
      }
    }

    // --- Completion evidence ---
    if (removedSlots.length > 0 || addedSlots.length > 0) {
      flags.completionEvidence = true
    } else {
      for (const slotID of [...prevSlotIDs].filter(id => nextSlotIDs.has(id))) {
        const prevLearner = prevSlotMap.get(slotID)
        const nextLearner = nextSlotMap.get(slotID)
        if (prevLearner.evidenceOfCompletion !== nextLearner.evidenceOfCompletion) {
          flags.completionEvidence = true
        }
      }
    }
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
   const dataPath = 'app/views/processing/v14/_data/'
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

addFilter('checkDone', function (review, type, claim, trainingCode) {
        return checkDone(review, type, claim, trainingCode)
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

addFilter('checkIfChanged', (claim, field, slotID) => {

    if (claim.submissions != null && claim.submissions.length == 1) { return false }
    // filter to order submissions
    let orderedSub = orderSubmissions(claim)

    let latest = orderedSub[0]
    let previous = orderedSub[1]

    if (previous == null) {
        return false
    }

    if (field == "training") {
        if (latest.trainingCode == previous.trainingCode) {
            return false
        } else {
            return true
        }
    } else if (field == "learners") {
        const latestIds = new Set(latest.learners.map(l => l.learnerID));
        const previousIds = new Set(previous.learners.map(l => l.learnerID));
        // Check for added learners
        for (const id of previousIds) {
            if (!latestIds.has(id)) {
                return true; // A new learner was added
            }
        }

        // Check for removed learners
        for (const id of latestIds) {
            if (!previousIds.has(id)) {
                return true; // A learner was removed
            }
        }

        return false; // No changes

    } else if (field == "learner") {
        const previousSlot = previous.learners.find(item => item.slotID === slotID);
        const latestSlot = latest.learners.find(item => item.slotID === slotID);

        if (previousSlot != null && latestSlot != null && (previousSlot.learnerID == latestSlot.learnerID)) {
            return false
        } else {
            return true
        }

    } else if (field == "startDate") {
        if (latest.startDate == previous.startDate) {
            return false
        } else {
            return true
        }
    } else if (field == "costDate") {
        if (latest.costDate == previous.costDate) {
            return false
        } else {
            return true
        }
    } else if (field == "evidencePayment") {

        const previousSet = new Set(previous.evidenceOfPayment);
        const latestSet = new Set(latest.evidenceOfPayment);

        // Something added OR removed
        for (const item of previousSet) {
            if (!latestSet.has(item)) {
                return true;
            }
        }

        for (const item of latestSet) {
            if (!previousSet.has(item)) {
                return true;
            }
        }   
        return false; // Nothing new in draft

    } else if (field == "completionDate") {
        const previousSlot = previous.learners.find(item => item.slotID === slotID);
        const latestSlot = latest.learners.find(item => item.slotID === slotID);
        if (previousSlot != null && latestSlot != null && (previousSlot.completionDate == latestSlot.completionDate)) {
            return false
        } else {
            return true
        }

    } else if (field == "evidenceCompletion") {
        const previousSlot = previous.learners.find(item => item.slotID === slotID);
        const latestSlot = latest.learners.find(item => item.slotID === slotID);
        if (previousSlot != null && latestSlot != null && (previousSlot.evidenceOfCompletion == latestSlot.evidenceOfCompletion)) {
            return false
        } else {
            return true
        }

    } else {
        return false
    }
})

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

addFilter('findOrderedIndex', function(learners, slotID) {
    let order = sortAlphabetically(learners)
    const newSlot = order.findIndex(item => item.slotID === slotID);
    return newSlot + 1
});
