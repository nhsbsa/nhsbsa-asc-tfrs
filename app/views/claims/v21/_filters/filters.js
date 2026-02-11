//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndCharactersAndLowerCase, getMostRelevantSubmission, findCourseByCode, findLearnerById, loadLearners, getDraftSubmission, sortClaimsByStatusSubmission, sortSubmissionsByDate, sortSubmissionsForTable, findPair, findUser, findStatus, capitalizeFirstLetter, loadTraining, isInternalOMMT, sortAlphabetically, getLearnersNotInBoth, getLearnerFieldByID, getOverallCompletionOutcome, getLearnersFromDraft, buildSlotComparison } = require('../_helpers/helpers.js');

const fs = require('fs');
addFilter('statusTag', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    if (statusID == 'not-yet-submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">' + statusName + '</strong>'
    } else if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--pink">' + statusName + '</strong>'
    } else if (statusID == 'queried') {
        return '<strong class="govuk-tag govuk-tag--light-blue" style="max-width: 200px;">' + statusName + '</strong>'
    } else if (statusID == 'rejected') {
        return '<strong class="govuk-tag govuk-tag--red">' + statusName + '</strong>'
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">' + statusName + '</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('claimCount', function (statusID, claims, workplaceID) {
    let i = 0
    for (const c of claims) {
        if ((c.status == statusID && (c.workplaceID == workplaceID))) {
            i++
        }
    }
    return i
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('statusDetails', function (statusID, statuses) {
    return findStatus(statusID, statuses)
})

addFilter('variableDate', function (statusID) {
    if (statusID == 'not-yet-submitted') {
        return 'Created'
    } else if (statusID == 'queried') {
        return 'Action requested'
    } else if (statusID == 'submitted') {
        return 'Submitted'
    } else if (statusID == 'rejected') {
        return 'Rejected'
    } else if (statusID == 'approved') {
        return 'Approved'
    } else {
        return 'Created'
    }
})

addFilter('removeSpacesAndCharactersAndLowerCase', function (inputString) {
    // Convert the string to lowercase
    let outputString = removeSpacesAndCharactersAndLowerCase(inputString);
    return outputString;
})

addFilter('errorSummary', function (claim, submitError) {
    let errorSummaryStr = ''

    if (submitError.description == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#description-error">Add a description</a></li>')
    }
    if (submitError.claimAmount == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#claim-amount-error">Add a cost</a></li>')
    }
    if (submitError.startDate == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#start-date-error">Add a start date</a></li>')
    }
    if (submitError.startDate == "inFuture") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Start date must be in the past</a></li>')
    }
    if (submitError.learner == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#learner-error">Add a learner</a></li>')
    }
    if (submitError.paymentDate == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#payment-date-error">Add a payment date</a></li>')
    }
    if (submitError.paymentDate == "inFuture") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#payment-date-error">Payment date must be in the past</a></li>')
    }
    if (submitError.evidenceOfPayment == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#payment-evidence-error">Add evidence of payment</a></li>')
    }
    if (submitError.completionDate == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Add a completion date</a></li>')
    }
    if (submitError.evidenceOfCompletion == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-evidence-error">Add evidence of completion</a></li>')
    }
    if (submitError.completionDate == "invalid" || submitError.startDate == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Completion date must be on or after the start date</a></li>')
    }
    if (submitError.completionDate == "inFuture") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Completion date must be in the past</a></li>')
    }
    if (submitError.change == false ) {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#action-alert-box">You cannot resubmit a claim without making the requested edits</a></li>')
    }
    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('findClaim', function (claimID, claims, workplaceID) {
    let claim = null;
    if (claimID) {
        var searchedClaimID = claimID.replace(/[-\s]+/g, '');
        for (let c of claims) {
            var removeSuffix = c.claimID.replace(/[-\s]+/g, '');
            if (removeSuffix.includes(searchedClaimID) && c.workplaceID == workplaceID) {
                claim = c
            }
        }
        return claim;
    } else {
        return null
    }
})

addFilter('trunctateString', function (string) {
    return string.slice(0, 30);
})

addFilter ('replaceSuffix', function (claimID) {
    return claimID.slice(0, -1) + 'C';
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


addFilter('findSubmissionByDate', function (submissions, submittedDate) {
    const submission = submissions.find(s => s.submittedDate == submittedDate);
    return submission
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

addFilter('findUser', function (email, org) {
    return findUser(email, org);
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


addFilter('getCount', function (items) {
    let count = 0;
    if (items != null) {
        for (const c of items) {
            count++
        }
    }
    return count;
})

addFilter('dateErrorMessage', function (dateErrorObject, dateType, errorSection) {
    const errorMessages = [];
    if (errorSection == 'summary') {
        if (dateErrorObject.day === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must include a day</a></li>');
        }
        if (dateErrorObject.month === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must include a month</a></li>');
        }
        if (dateErrorObject.year === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must include a year</a></li>');
        }
        if (dateErrorObject.date === 'invalid') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must be a real date</a></li>');
        }
        if (dateErrorObject.date === 'allMissing') {
            errorMessages.push('<li><a href="#completion-date-error">Enter the ' + dateType.toLowerCase() + '</a></li>');
        }
        if (dateErrorObject.policy === 'invalidPolicy') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must fall within the eligible financial year for this course</a></li>');
        }
        if (dateErrorObject.policy === 'invalidAfterStart') {
            errorMessages.push('<li><a href="#completion-date-error">' + dateType + ' must be on or after the training start date</a></li>');
        }
        if (dateErrorObject.policy === 'invalidAfterPayment') {
            errorMessages.push('<li><a href="#completion-date-error">40% ' + dateType.toLowerCase() + ' must be after the 60% payment date</a></li>');
        }
    } else if (errorSection == 'input') {
        errorMessages.push('<p id="completion-date-error" class="govuk-error-message">' + '<span class="govuk-visually-hidden">Error:</span>');
        if (dateErrorObject.day === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push(dateType + ' must include a day<br>');
        }
        if (dateErrorObject.month === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push(dateType + ' must include a month<br>');
        }
        if (dateErrorObject.year === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push(dateType + ' must include a year<br>');
        }
        if (dateErrorObject.date === 'invalid') {
            errorMessages.push(dateType + ' must be a real date<br>');
        }
        if (dateErrorObject.date === 'allMissing') {
            errorMessages.push('Enter the ' + dateType.toLowerCase() + '<br>');
        }
        if (dateErrorObject.policy === 'invalidPolicy') {
            errorMessages.push(dateType + ' must fall within the eligible financial year for this course<br>');
        }
        if (dateErrorObject.policy === 'invalidAfterStart') {
            errorMessages.push(dateType + ' must be on or after the training start date<br>');
        }
        if (dateErrorObject.policy === 'invalidAfterPayment') {
            errorMessages.push('40% '+ dateType.toLowerCase() + ' must be after the 60% payment date<br>');
        }
        
        errorMessages.push('</p>')
    }

    return errorMessages.join('');
}, { renderAsHtml: true })

addFilter('dateErrorFormat', function (dateErrorObject, type) {
    let state = false
    if (dateErrorObject) {
        if (type == "day") {
            if (dateErrorObject.day == 'missing' || (dateErrorObject.day == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.policy == 'invalidPolicy' || dateErrorObject.policy == 'invalidAfterStart' || dateErrorObject.policy == 'invalidAfterPayment') {
                state = true
            }
        } else if (type == "month") {
            if (dateErrorObject.month == 'missing' || (dateErrorObject.month == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.policy == 'invalidPolicy' || dateErrorObject.policy == 'invalidAfterStart' || dateErrorObject.policy == 'invalidAfterPayment') {
                state = true
            }
        } else if (type == "year") {
            if (dateErrorObject.year == 'missing' || (dateErrorObject.year == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.policy == 'invalidPolicy' || dateErrorObject.policy == 'invalidAfterStart' || dateErrorObject.policy == 'invalidAfterPayment') {
                state = true
            }
        }
    }
    return state;
})

addFilter('statusDate', function (claim) {
    const submission = getMostRelevantSubmission(claim)
    const status = claim.status
    if (status == 'not-yet-submitted') {
        return claim.createdDate
    } else if (status == 'submitted') {
        return submission.submittedDate
    } else if (status == 'rejected' || status == 'approved' || status == 'queried') {
        return submission.processedDate
    }
})

addFilter('learnerErrorMessage', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.nationalInsuranceNumber == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#nationalInsuranceNumber-error">Enter a National Insurance number</a></li>')
    } else if (submitError.nationalInsuranceNumber == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#nationalInsuranceNumber-error">Enter a National Insurance number in the correct format</a></li>')
    }
    if (submitError.jobTitle == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#jobTitle-error">Enter a job title</a></li>')
    }


    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('learnerMatch', function (newField, matchField, type) {
    let result = ''

    if (newField != matchField) {
        if (type == "new") {
            result = "<mark class='hods-highlight'><strong>" + newField + "</strong></mark>"
        } else if (type == "match") {
            result = "<mark class='hods-highlight'><strong>" + matchField + "</strong></mark>"
        }
    } else {
        result = newField
    }


    return result
}, { renderAsHtml: true })

addFilter('learnerSearch', function (search, learner) {
    let match = false
    const formattedgivenName = removeSpacesAndCharactersAndLowerCase(learner.givenName);
    const formattedfamilyName = removeSpacesAndCharactersAndLowerCase(learner.familyName);
    const formattedfullName = formattedgivenName + formattedfamilyName;
    const formattedSearch = removeSpacesAndCharactersAndLowerCase(search);
    const formattedID = removeSpacesAndCharactersAndLowerCase(learner.id);

    if (formattedgivenName.includes(formattedSearch) || formattedfamilyName.includes(formattedSearch) || formattedfullName.includes(formattedSearch) || formattedID.includes(formattedSearch)) {
        match = true
    }
    return match
})

addFilter('loadLearners', function (localLearners) {
    return loadLearners(localLearners)

})

addFilter('loadTraining', function (emptyString) {
    return loadTraining()

})

addFilter('trainingSearch', function (search, training, claim, allTraining) {

    const formattedSearch = removeSpacesAndCharactersAndLowerCase(search);
    const formattedTrainingTitle = removeSpacesAndCharactersAndLowerCase(training.title);
    const formattedTrainingCode = removeSpacesAndCharactersAndLowerCase(training.code);

    if (formattedTrainingTitle.includes(formattedSearch) || formattedTrainingCode.includes(formattedSearch)) {
        return true
    }

    return false
})


addFilter('bankErrorMessage', function (bankErrorObject) {
    const errorMessages = [];

    if (bankErrorObject.accountName === 'missing') {
        errorMessages.push('<li><a href="#accountName-error">Enter the name on the account</a></li>');
    } else if (bankErrorObject.accountName === 'tooLong') {
        errorMessages.push('<li><a href="#accountName-error">Name on the account must be no more than 140 characters</a></li>');
    } else if (bankErrorObject.accountName === 'invalid') {
        errorMessages.push('<li><a href="#accountName-error">Account name must only include letters a to z, numbers, hyphens, spaces, ampersands, full stops and forward slashes</a></li>');
    }
    if (bankErrorObject.sortCode === 'missing') {
        errorMessages.push('<li><a href="#sortCode-error">Enter a sort code</a></li>');
    } else if (bankErrorObject.sortCode === 'invalid') {
        errorMessages.push('<li><a href="#sortCode-error">Enter a valid sort code like 309430</a></li>');
    }else if (bankErrorObject.sortCode === 'lengthIssue') {
        errorMessages.push('<li><a href="#sortCode-error">Sort code must be 6 digits long</a></li>');
    }
    if (bankErrorObject.accountNumber === 'missing') {
        errorMessages.push('<li><a href="#accountNumber-error">Enter an account number</a></li>');
    } else if (bankErrorObject.accountNumber === 'invalid') {
        errorMessages.push('<li><a href="#accountNumber-error">Enter a valid account number like 00733445</a></li>');
    } else if (bankErrorObject.accountNumber === 'lengthIssue') {
        errorMessages.push('<li><a href="#accountNumber-error">Account number must be between 6 and 8 digits</a></li>');
    }
    if (bankErrorObject.buildingSociety === 'lengthIssue') {
        errorMessages.push('<li><a href="#buildingSociety-error">Building society roll number must be between 1 and 18 characters</a></li>');
    } else if (bankErrorObject.buildingSociety === 'invalid') {
        errorMessages.push('<li><a href="#buildingSociety-error">Building society roll number must only include letters a to z, numbers, hyphens, spaces, forward slashes and full stops</a></li>');
    }

    return errorMessages.join('');
}, { renderAsHtml: true })

addFilter('trainingTypeCheck', function (trainingCode, matchType) {

    const trainingList = loadTraining()

    for (let trainingGroup of trainingList) {
        for (let training of trainingGroup.courses) {
            if (trainingCode == training.code) {
                return trainingGroup.groupTitle == matchType;
            }
        }
    }

})

addFilter('findPair', function (claimID, claims) {
    return findPair(claimID, claims)
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

addFilter('sortByDate', function (claims, statusID) {
    if (statusID == 'not-yet-submitted') {
        return claims.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (statusID == 'submitted') {
        return sortClaimsByStatusSubmission(claims, 'submittedDate')
    } else if (statusID == 'queried') {
        return sortClaimsByStatusSubmission(claims, 'processedDate')
    } else if (statusID == 'rejected') {
        return sortClaimsByStatusSubmission(claims, 'processedDate')
    } else if (statusID == 'approved') {
        return sortClaimsByStatusSubmission(claims, 'processedDate')
    } else {
        return claims.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }
})

addFilter('orderByMostRecent', function (submissions) {
    let filtered = submissions.filter(sub => sub.submittedDate);
    let sorted = sortSubmissionsByDate(filtered, 'submittedDate');
    return sorted;
});

addFilter('sortSubmissionsForTable', function (submissions) {
    let sorted = sortSubmissionsForTable(submissions)
    return sorted
})

addFilter('sortLearnerSlotsForTable', function (submissions) {
    let sorted = sortSubmissionsForTable(submissions)
    let newLearnerArray = buildSlotComparison(sorted)
    return newLearnerArray
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
    // let text = ["First submission", "Second submission", "Third submission", "Fourth submission", "Fifth submission"]
    // return text[count]
})


addFilter('userType', function (type) {
    switch(type) {
        case "signatory":
        return "Signatory"
        break;

        case "submitter":
        return "Submitter"
        break;
    }
})

addFilter('userStatusTag', function (status) {
    switch(status) {
        case "active":
        return '<strong class="govuk-tag govuk-tag--turquoise">Active</strong>'
        break;

        case "expired":
        return '<strong class="govuk-tag govuk-tag--orange">Invite expired</strong>'
        break;

        case "pending":
        return '<strong class="govuk-tag govuk-tag--pink">Invite sent</strong>'
        break;

    }
}, { renderAsHtml: true })

addFilter('userErrorMessage', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.email == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address</a></li>')
    } else if (submitError.email == "match") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">An invitation has already been sent to this email</a></li>')
    } else if (submitError.email == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address in the correct format, like name@example.com</a></li>')
    }


    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('matchResend', function (resendList, email) {
    if (resendList != null && resendList != "") {
        for (const e of resendList) {
            if (e === email) {
                return true;
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

addFilter('claimsMatchAdvancedSearch', function (claims, training, learner, localLearners, workplaceID) {
    const learners = loadLearners(localLearners)
    const formattedTraining = removeSpacesAndCharactersAndLowerCase(training);
    const formattedLearner = removeSpacesAndCharactersAndLowerCase(learner);

    if ((formattedTraining.length > 0 && formattedTraining.length < 3) || (formattedLearner.length > 0 && formattedLearner.length < 3)) {
        return []
    }

    var searched = claims.filter(claim => {
        let trainingCheck = false;
        let submission = getMostRelevantSubmission(claim)

        if (submission.trainingCode != null) {
            const claimTraining = findCourseByCode(submission.trainingCode)
            const formattedTitle = removeSpacesAndCharactersAndLowerCase(claimTraining.title);
            const code = submission.trainingCode;
            const codeRegex = /^(?:\d{3}\/?\d{4}\/?\d|[A-Za-z]{5})$/;
            if (formattedTraining != "") {
                if (formattedTitle.includes(formattedTraining)) {
                    trainingCheck = true;
                }
                if (codeRegex.test(training) && removeSpacesAndCharactersAndLowerCase(code) == formattedTraining) {
                    trainingCheck = true;
                }
            } 
        }
        let learnerCheck = false;
        if (learner == "") { 
                learnerCheck = true
        } else if (submission.learnerID != null) {
            learnerDetails = findLearnerById(submission.learnerID, learners)
            const formattedgivenName = removeSpacesAndCharactersAndLowerCase(learnerDetails.givenName);
            const formattedfamilyName = removeSpacesAndCharactersAndLowerCase(learnerDetails.familyName);
            const formattedfullName = formattedgivenName + formattedfamilyName;
            const formattedLearner = removeSpacesAndCharactersAndLowerCase(learner);
            const formattedID = removeSpacesAndCharactersAndLowerCase(learnerDetails.id);
            if (formattedfullName.includes(formattedLearner) || formattedID == formattedLearner) {
                learnerCheck = true;
            }
        }
        let check = false
        if ((training != "" && trainingCheck) && (learner != "" && learnerCheck) && (workplaceID == claim.workplaceID)) {
            check = true
        }
        if (((training == "" && learnerCheck) || (learner == "" && trainingCheck)) && (workplaceID == claim.workplaceID)) {
            check = true
        }

        return check
    })
    return searched
})

addFilter('filteredClaims', function (claims, statuses, dates, types) {
    var filtered = claims.filter(claim => {
        let statusCheck = true;
        if (statuses != null && statuses != "") {
            if (statuses.includes(claim.status)) {
                statusCheck = true;
            } else {
                statusCheck = false
            }
        }
        let dateCheck = true;
        if (dates != null && dates != "") {
            const startDate = new Date(claim.startDate);
            const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (dates.includes(monthYear)) {
                dateCheck = true;
            } else {
                dateCheck = false
            }
        }

        let typeCheck = true;
        if (types != null && types != "") {
            if (types.includes(claim.claimType)) {
                typeCheck = true;
            } else {
                typeCheck = false
            }
        }

        return statusCheck && dateCheck && typeCheck;
    });

    return filtered;
});


addFilter('userCountNotExpired', function (org) { 
    let count = 0;

    // Count active signatory
    if (org.signatory?.active) {
    count++;
    }

    // Count active users
    if (Array.isArray(org.users?.active)) {
    count += org.users.active.length;
    }

    // Count invited users
    if (Array.isArray(org.users?.invited)) {
    count += org.users.invited.length;
    }

    return count;
});

addFilter('parseInt', function(value, radix = 10) {
    return parseInt(value, radix);
});

addFilter('min', (value1, value2) => {
    return Math.min(value1, value2);
});

addFilter('getMostRelevantSubmission', (claim) => {
    let recentClaim = getMostRelevantSubmission(claim)
    return recentClaim
})

addFilter('getDraftSubmission', (claim) => {
    let recentClaim = getDraftSubmission(claim)
    return recentClaim
})

addFilter('findTraining', (trainingCode) => {
    return findCourseByCode(trainingCode)
})

addFilter('findLearner', (learnerID, learners) => {
    return findLearnerById(learnerID, learners)
})

addFilter('findLearnerNote', (learnerID, learners) => {
    let anser = findLearnerById(learnerID, learners)
    return anser
})

addFilter('checkIfUpdated', (claim, field, learnerID) => {
    let lastQueried = getMostRelevantSubmission(claim)
    let draftClaim = getDraftSubmission(claim)

    if (draftClaim == null) {
        return false
    }

    if (field == "training") {
        if (lastQueried.trainingCode == draftClaim.trainingCode) {
            return false
        } else {
            return true
        }
    } else if (field == "learners") {
        const lastIds = new Set(lastQueried.learners.map(l => l.learnerID));
        const draftIds = new Set(draftClaim.learners.map(l => l.learnerID));
        // Check for added learners
        for (const id of draftIds) {
            if (!lastIds.has(id)) {
                return true; // A new learner was added
            }
        }

        // Check for removed learners
        for (const id of lastIds) {
            if (!draftIds.has(id)) {
                return true; // A learner was removed
            }
        }

        return false; // No changes

    } else if (field == "startDate") {
        if (lastQueried.startDate == draftClaim.startDate) {
            return false
        } else {
            return true
        }
    } else if (field == "costDate") {
        if (lastQueried.costDate == draftClaim.costDate) {
            return false
        } else {
            return true
        }
    } else if (field == "evidencePayment") {

        const lastSet = new Set(lastQueried.evidenceOfPayment);
        for (const item of draftClaim.evidenceOfPayment) {
            if (!lastSet.has(item)) {
                return true; // Found something new in draft
            }
        }
        return false; // Nothing new in draft

    } else if (field == "completionDate") {
        const date1 = getLearnerFieldByID(draftClaim.learners, learnerID, "completionDate")
        const result = draftClaim.learners.find(item => item.learnerID === learnerID);
        if (result != null && result.learnerChanged != null) {
            learnerID = result.learnerChanged
        }
        const date2 = getLearnerFieldByID(lastQueried.learners, learnerID, "completionDate")
        
        // to do compare if same contents
        if (date1 === date2 || date1 == null || date2 == null) {
            return false
        } else {
            return true
        }

    } else if (field == "completionDates") {
        // Build lookup map for lastQueried
        const lastMap = new Map(
            lastQueried.learners.map(l => [l.learnerID, l.completionDate])
        );

        // Iterate over draftClaim learners
        for (const draftLearner of draftClaim.learners) {
            // Use learnerChanged if present
            const learnerID = draftLearner.learnerChanged || draftLearner.learnerID;

            const draftDate = draftLearner.completionDate;
            const lastDate = lastMap.get(learnerID);

            // Check if learner existed before and date has changed
            if (lastDate !== undefined && lastDate !== draftDate) {
                return true;
            }
        }

        return false;
    } else if (field == "evidenceCompletion") {
        const evidence2 = getLearnerFieldByID(draftClaim.learners, learnerID, "evidenceOfCompletion")
        const result = draftClaim.learners.find(item => item.learnerID === learnerID);
        if (result != null && result.learnerChanged != null) {
            learnerID = result.learnerChanged
        }
        const evidence1 = getLearnerFieldByID(lastQueried.learners, learnerID, "evidenceOfCompletion")
        if (evidence1 == evidence2 || evidence1 == null || evidence2 == null) {
            return false;
        } else {
            return true
        }

    } else if (field == "multipleEvidenceCompletion") {
        // Build lookup maps for lastQueried
        const lastMap = new Map(
            lastQueried.learners.map(l => [l.learnerID, l.evidenceOfCompletion])
        );

        // Iterate over draftClaim learners
        for (const draftLearner of draftClaim.learners) {
            // Use learnerChanged if present
            const learnerID = draftLearner.learnerChanged || draftLearner.learnerID;

            const draftEvidence = draftLearner.evidenceOfCompletion;
            const lastEvidence = lastMap.get(learnerID);

            // Check if learner existed before and evidence has changed
            if (lastEvidence !== undefined && lastEvidence !== draftEvidence) {
                return true;
            }
        }

        return false;
    } else if (field == "supportingNote") {
        if (lastQueried.supportingNote == draftClaim.supportingNote) {
            return false
        } else {
            return true
        }
    } else {
        return false
    }
})

addFilter('getRejectionNote', (submission) => {
    let rejectionNote = ''
    if (submission.evidenceOfPaymentReview.outcome != null && submission.evidenceOfPaymentReview.outcome == "fail") {
        rejectionNote +=  'Evidence of payment<br>' + submission.evidenceOfPaymentReview.note
    }
    if (submission.evidenceOfCompletionReview.outcome != null && submission.evidenceOfCompletionReview.outcome == "fail") {
        rejectionNote += "Evidence of completion" + '<br>' + submission.evidenceOfCompletionReview.note
    }
    return rejectionNote
})

addFilter('compareIfEvidenceChanged', (first, second) => {
    if (first.evidenceOfPayment.length !== second.evidenceOfPayment.length) {
        return true;
    }
    first.evidenceOfPayment.sort();
    second.evidenceOfPayment.sort();
    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) {
            return true;
        }
    }
    return false;
})

addFilter('getMultipleLearnersReimbursementAmount', (amount, learners) => {
    if (learners == null | (learners && learners.length == 0) | (learners && learners.length == 1)) {
        return amount
    } else {
        return amount * learners.length
    }
})

addFilter('getReimbursementAmount', (submission, training) => {
    return Math.min(submission.evidenceOfPaymentReview.costPerLearner, training.reimbursementAmount);
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

addFilter('formatSortCode', function(sortCode) {
    if (!/^\d{6}$/.test(sortCode)) {
      throw new Error("Input must be a string of exactly 6 digits.");
    }
    return sortCode.match(/.{1,2}/g).join("-");
})

addFilter('maskCharacters', function(str, num) {
    if (num <= 0) return str;
    if (num >= str.length) return '*'.repeat(str.length);
    
    const masked = '*'.repeat(num);
    const remainder = str.slice(num);
    return masked + remainder;
})

addFilter('generateTimelineData', function(submission, claimType, org, lastBoolean, statuses) {
    let timelineData = {
    submissionStep: null,
    processStep: null
    }

    const user = findUser(submission.submitter, org)
    let titlePrefix = ""
    if (claimType == "100") {
        titlePrefix = ""
    } else if (claimType == "60") {
        titlePrefix = "60 part "
    } else if (claimType == "40") {
        titlePrefix = "40 part "
    }

    let submissionTitle = null
    if (lastBoolean) {
        submissionTitle = titlePrefix + "submitted"
    } else {
        submissionTitle = titlePrefix + "resubmitted"
    }

    timelineData.submissionStep = {
        title: capitalizeFirstLetter(submissionTitle.toLowerCase()),
        author: "by " + user.givenName + " " + user.familyName,
        date: submission.submittedDate
    }

    if (submission.processedDate) {

    const completionOutcome = getOverallCompletionOutcome(submission.learners);
    const paymentOutcome = submission.evidenceOfPaymentReview?.outcome;

    if (
        (claimType == "40" && completionOutcome === "fail") ||
        (claimType == "100" && (paymentOutcome === "fail" || completionOutcome === "fail")) ||
        (claimType == "60" && paymentOutcome === "fail")
    ) {

        processStepTitle = titlePrefix + findStatus("rejected", statuses).historyName;


    } else if (
        (claimType == "40" && completionOutcome === "queried") ||
        (claimType == "100" && (paymentOutcome === "queried" || completionOutcome === "queried")) ||
        (claimType == "60" && paymentOutcome === "queried")
    ) {
        processStepTitle = titlePrefix + findStatus("queried", statuses).historyName;

    } else if (
        (claimType == "40" && completionOutcome === "pass") ||
        (claimType == "100" && (paymentOutcome === "pass" && completionOutcome === "pass")) ||
        (claimType == "60" && paymentOutcome === "pass")
    ) {
        processStepTitle = titlePrefix + findStatus("approved", statuses).historyName;
    }

    timelineData.processStep = {
        title: capitalizeFirstLetter(processStepTitle.toLowerCase()),
        author: "by Claim processor",
        date: submission.processedDate
    }

}


    return timelineData
})

addFilter('splitISODate', function(inputDate) {
    const outputDate = {
        day: '',
        month: '',
        year: ''
    }
    if (inputDate != null) {
        const ISODate = new Date(inputDate)
        

        outputDate.day = ISODate.getDate()
        outputDate.month = ISODate.getMonth() + 1
        outputDate.year = ISODate.getFullYear()

    }

    return outputDate
})

addFilter('formatCountToText', function (count) {
    if (count == 1) { return "First"} 
    if (count == 2) { return "Second"} 
    if (count == 3) { return "Third"} 
    if (count == 4) { return "Fourth"} 
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

addFilter('filterLearners', function (claim, pairClaim) {
    
    let submission = null
    let pairSubmission = null
    let draftSubmission = null
    let draftPairSubmission= null
    let setA = []
    let setB = []
    let filtered = {
        todo: {
            id: "todo",
            label: "To do",
            learners: []
        },
        needsaction: {
            id: "needsaction",
            label: "Needs action",
            learners: []
        },
        actioned: {
            id: "actioned",
            label: "Done",
            learners: []
        },
        done: {
            id: "done",
            label: "Done",
            learners: []
        },
        approved: {
            id: "approved",
            label: "Approved",
            learners: []
        },
        rejected: {
            id: "rejected",
            label: "Rejected",
            learners: []
        },
        removed: {
            id: "removed",
            label: "Removed from 40 part",
            learners: []
        }
    }

    if (claim.status == "not-yet-submitted" || claim.status == "submitted" || claim.status == "queried" || (pairClaim != null && (pairClaim.status == "not-yet-submitted" || pairClaim.status == "submitted" || pairClaim.status == "queried" )) ) {

        if (claim.status == "not-yet-submitted" || claim.status == "submitted" || claim.status == "queried") {
            submission = getMostRelevantSubmission(claim)
            switch(claim.status) {
                case "not-yet-submitted":
                    filtered.done.label = "Done"
                    break;
                case "submitted":
                    filtered.done.label = "Submitted"
                    break;
                case "queried":
                    filtered.done.label = "Approved"
                    break;
            }
        } else if (pairClaim.status == "not-yet-submitted" || pairClaim.status == "submitted" || pairClaim.status == "queried") {
            submission = getMostRelevantSubmission(pairClaim)
            switch(pairClaim.status) {
                case "not-yet-submitted":
                    filtered.done.label = "Done"
                    break;
                case "submitted":
                    filtered.done.label = "Submitted"
                    break;
                case "queried":
                    filtered.done.label = "Approved"
                    break;
            }
        }

        for (const learner of submission.learners) {
            if ((learner.completionDate == null || learner.evidenceOfCompletion == null) && ((claim.claimType != "60") || claim.status == "approved")) {
                filtered.todo.learners.push(learner)
            }
        }

        for (const learner of submission.learners) {
            if ((learner.completionDate != null && learner.evidenceOfCompletion != null && (learner.evidenceOfCompletionReview.outcome == null)) || (claim.claimType == "60" && claim.status != "approved")) {
                filtered.done.learners.push(learner)
            }
        }
    }
    

    submission = getMostRelevantSubmission(claim)
    if (claim.status == "queried") {
        draftSubmission = getDraftSubmission(claim)
    }
    if (pairClaim != null) {
        pairSubmission = getMostRelevantSubmission(pairClaim)
        if (pairClaim.status == "queried") {
            draftPairSubmission = getDraftSubmission(pairClaim)
        }
    }

    if (claim.claimType == "100" && claim.status == "queried") {
        filtered.needsaction.learners = getLearnersFromDraft(submission, draftSubmission);
        filtered.actioned.learners = draftSubmission.learners.filter(item => item.actioned === true);
        const actionedIds = new Set(filtered.actioned.learners.map(l => l.learnerID));
        filtered.needsaction.learners = filtered.needsaction.learners.filter( l => !actionedIds.has(l.learnerID));
    } else if (claim.claimType == "60" && pairClaim != null && pairClaim.status == "queried") {
        filtered.needsaction.learners = getLearnersFromDraft(pairSubmission, draftPairSubmission);
        filtered.actioned.learners = draftPairSubmission.learners.filter(item => item.actioned === true);
        const actionedIds = new Set(filtered.actioned.learners.map(l => l.learnerID));
        filtered.needsaction.learners = filtered.needsaction.learners.filter( l => !actionedIds.has(l.learnerID));
    }

    if (claim.status == "queried") {
        filtered.removed.label = "Removed"
        filtered.removed.learners = draftSubmission.removedLearners || []
    } else if (claim.claimType == "60" && claim.status == "approved") {
        filtered.removed.label = "Removed from 40 part"
        let removedList = []
        for (const s of pairClaim.submissions) {
            removedList.push(...(s.removedLearners || []))
        }
        filtered.removed.learners = removedList
    }

    if (claim.claimType == "100" && claim.status != "not-yet-submitted" && claim.status != "submitted") {
        filtered.approved.learners = submission.learners.filter( l => l.evidenceOfCompletionReview.outcome == "pass")
    } else if (claim.claimType == "60" && pairClaim != null && pairClaim.status != "not-yet-submitted" && pairClaim.status != "submitted") {
        filtered.approved.learners = pairSubmission.learners.filter( l => l.evidenceOfCompletionReview.outcome == "pass")
    }

    if (claim.claimType == "100" && claim.status == "rejected") {
        filtered.rejected.learners = submission.learners.filter( l => l.evidenceOfCompletionReview.outcome == "fail")
    } else if (claim.claimType == "60" && pairClaim != null && pairClaim.status == "rejected") {
        filtered.rejected.learners = pairSubmission.learners.filter( l => l.evidenceOfCompletionReview.outcome == "fail")
    }


    const doneLearners = filtered.done.learners;
    const approvedLearners = filtered.approved.learners;
    // 1. Create a Set of just the slotIDs from the removed list
    const removedIDs = new Set(filtered.removed.learners.map(l => l.slotID));

    // 2. Filter the done list by checking against that Set of IDs
    const updatedDoneLearners = doneLearners.filter(
        learner => !removedIDs.has(learner.slotID)
    );

    // 3. Filter the approved list by checking against that Set of IDs
    const updatedApprovedLearners = approvedLearners.filter(
        learner => !removedIDs.has(learner.slotID)
    );

    // 4. Update the original array
    filtered.done.learners = updatedDoneLearners;
    filtered.approved.learners = updatedApprovedLearners;


    const nonEmptyKeys = Object.entries(filtered)
        .filter(([_, item]) => Array.isArray(item.learners) && item.learners.length > 0)
        .map(([key]) => key);

    const count = nonEmptyKeys.length;

    filtered.multi = {
    check: count > 1,
    value: count > 0 ? nonEmptyKeys[0] : null
    };

    return filtered
})

addFilter('getRemovedLearners', function(submissions) {
    let removedList = []
    for (const s of submissions) {
        removedList.push(...(s.removedLearners || []))
    }
    return removedList 
});

addFilter('response', function(boolean) {
    if (boolean) {
        return "Yes"
    } else if (!boolean) {
        return "No"
    }
    
});

addFilter('findLearnerSubmissionByDate', function (submissions, submittedDate, slot) {
    const submission = submissions.find(s => s.submittedDate == submittedDate);
    const foundLearner = submission.learners.find(l => l.slotID == slot);
    return foundLearner
})

addFilter('sortLearners', function (learners, dataLearners) {
    
    return sortAlphabetically(learners, dataLearners)
})

addFilter('toLowerCase', function (string) {
    
    return (string.toLowerCase())
})

addFilter('getLearnerFieldByID', function (learners, learnerID, field) {
    
    return (getLearnerFieldByID(learners, learnerID, field))
})

addFilter('doesContainLearner', function (learners, learnerID) {
    let exists = false;

    for (const l of learners) {
        if (l.learnerID === learnerID) {
            exists = true;
            break;
        }
    }
    return exists
})

addFilter('addedCount', function (learners, type) {
    let added = 0
    if (type == "completionDate") {
        added = learners.filter(l => l.completionDate).length;
    } else if (type == "completionEvidence") {
        added = learners.filter(l => l.evidenceOfCompletion).length;
    }
    return added
})

addFilter('getLearnersByStatus', function (learners, outcome) {
    if (!Array.isArray(learners)) return [];
    let filtered =  learners.filter(l =>
        l.evidenceOfCompletionReview &&
        l.evidenceOfCompletionReview.outcome == outcome
    );
    return filtered
})

addFilter('getNote', function (learnerID, claim, pairClaim) {
    if (claim.claimType == "60" && claim.status == "approved") {
        submission = getMostRelevantSubmission(pairClaim)
    } else {
        submission = getMostRelevantSubmission(claim)
    }
    draftSubmission = getDraftSubmission(claim)
    if (draftSubmission != null) {
        const result = draftSubmission.learners.find(item => item.learnerID === learnerID);
        if (result != null && result.learnerChanged != null) {
            learnerID = result.learnerChanged
        }
    }
    

    const learner = submission.learners.find(l => l.learnerID === learnerID);
    
    return learner ? learner.evidenceOfCompletionReview.note : null;

})

addFilter('findtabID', function (learnerID, filteredLearners) {
    // Loop over each key in the object
    for (const key in filteredLearners) {
        const group = filteredLearners[key];
        
        // Check if this group has learners and if any learner matches the learnerID
        if (group.learners && group.learners.some(learner => learner.learnerID === learnerID)) {
        return group.id; // Return the id of the group
        }
    }
    
    // Return null if learnerID was not found in any group
    return null;
})
