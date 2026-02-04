const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, checkWDSFormat, signatoryCheck, findOrg, isValidOrgSearch, getMostRelevantSubmission, checkClaimProcess, determineOutcome, isInternalOMMT, sortAlphabetically, checkProcessingState, findFirstLearnerWithoutOutcome, findCourseByCode} = require('../_helpers/helpers.js');

router.use('/processing/v14/backstop', require('../_backstop/backstop-routes.js'));
router.use('/processing/v14/backstop', require('../_backstop/backstop-routes.js'));

// v14 Prototype routes
// v14 Prototype routes

router.get('/load-data', function (req, res) {
  //Load data from JSON files
  loadData(req);
  res.redirect('sign-in.html')
})

router.post('/check-org', function (req, res) {
  const orgID = req.session.data.orgID
  delete req.session.data.confirmation
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.email

  var orgRegistered = false

  for (const org of req.session.data.organisations) {
    if (org.workplaceID == orgID) {
      orgRegistered = true
    }
  }

  if (orgID == "") {
    req.session.data.submitError = 'missing'
    res.redirect('register-organisation/organisation-details')
  } else if (orgID == "timeout") {
    req.session.data.submitError = 'timeout'
    res.redirect('register-organisation/org-issue')
  } else if (orgRegistered) {
    req.session.data.submitError = 'duplicate'
    res.redirect('register-organisation/org-issue')
  } else if (checkWDSFormat(orgID)) {
    delete req.session.data.submitError
    res.redirect('register-organisation/confirm-organisation-details')
  } else {
    req.session.data.submitError = 'invalid'
    res.redirect('register-organisation/organisation-details')
  }
});

router.post('/confirm-org-handler', function (req, res) {
  const confirmation = req.session.data.confirmation
  delete req.session.data.submitError
  delete req.session.data.confirmation

  if (confirmation == "yes") {
    req.session.data.newOrg = 'true'
    res.redirect('register-organisation/signatory-details')
  } else if (confirmation == "no") {
    req.session.data.submitError = 'incorrect'
    res.redirect('register-organisation/org-issue')
  } else if (confirmation == null) {
    req.session.data.submitError = 'missing'
    res.redirect('register-organisation/confirm-organisation-details')
  }
});

router.post('/signatory-handler', function (req, res) {
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const email = req.session.data.email
  const edited = req.session.data.edited
  const newOrg = req.session.data.newOrg

  const result = signatoryCheck(familyName, givenName, email)

  if (result.signatoryValid) {
    delete req.session.data.submitError
    if (newOrg == "true") {
      res.redirect('register-organisation/confirm-signatory-details')
    } else {
      res.redirect('register-organisation/updated-signatory-invitation')
    }
    
  } else {
    req.session.data.submitError = result
    res.redirect('register-organisation/signatory-details')
  }
});

router.post('/search-claim-id', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  delete req.session.data['id'];
  delete req.session.data.confirmation
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.email

  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountTooMuch
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess

  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete


  var claimID = req.session.data.claimID.replace(/[\s-]/g, '');
  var orgID = req.session.data.orgID


  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    if (orgID == null) {
      return res.redirect('process-claim/start-process?invalidIDError=true&emptyError=true')
    } else {
      return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + orgID + '&currentPage=1&invalidIDError=true&emptyError=true')
    }
  }

  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    if (orgID == null) {
      return res.redirect('process-claim/start-process?invalidIDError=true')
    } else {
      return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + orgID + '&currentPage=1&invalidIDError=true')
    }
  }

  const lengthRegex = /^[A-NP-Z0-9]{3}[A-NP-Z0-9]{4}[A-NP-Z0-9]{4}(?:A|B|C)?$/i;
  if (!lengthRegex.test(claimID)) {
    if (orgID == null) {
    return res.redirect('process-claim/start-process?invalidIDError=true')
    } else {
      return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + orgID + '&currentPage=1&invalidIDError=true')
    }
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    let searchedID = claimID.toLowerCase()
    let singleClaim = c.claimID.toLowerCase().replace(/[\s-]/g, '');

    // single searched full claim id
    if (singleClaim == searchedID && (orgID == null || c.workplaceID == orgID)) {
      foundClaim = c
    }
  }
  console.log(foundClaim + " " + orgID)
  if (foundClaim == null) {
    if (orgID == null) {
      return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
    } else {
      return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + orgID + '&notFound=true&currentPage=1')
    }
  } else if (foundClaim.status == "submitted" || foundClaim.status == "inProgress" || foundClaim.status == "approved" || foundClaim.status == "rejected" || foundClaim.status == "queried") {

    req.session.data.claimScreen = "claim"
    req.session.data.orgTab = "singleClaim"

    return res.redirect('organisation/org-view-main' + '?id=' + foundClaim.claimID + '&orgID=' + foundClaim.workplaceID)
  } else {
    if (orgID == null) {
      return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
    } else {
      return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + orgID + '&notFound=true&currentPage=1')
    }
  }
});

router.get('/save-progress', function (req, res) {
  const claimID = req.session.data.id
  delete req.session.data.learnerCount
  delete req.session.data.claimStep
  delete req.session.data.result
  delete req.session.data.checkListError
  delete req.session.data.navigateTo 

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }

  claim.status = "inProgress"
  req.session.data.claimScreen = "claim"
  req.session.data.progressSaved = true
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')
});

router.get('/back-all-claims', function (req, res) {
  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete

  delete req.session.data.payment
  delete req.session.data.paymentReimbursementAmount
  delete req.session.data.paymentRejectNote
  delete req.session.data.completion
  delete req.session.data.completionRejectNote
  delete req.session.data.completionResponses
  delete req.session.data.learnerCount
  delete req.session.data.claimStep
  delete req.session.data.progressSaved

  return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + req.session.data.orgID + '&currentPage=1#tab-content')

});

router.get('/process-step-handler', function (req, res) {
req.session.data.orgTab = "singleClaim"
req.session.data.claimScreen = "inProgress"
const stage = req.session.data.stage
const learnerNo = req.session.data.learnerNo

let location = null

delete req.session.data.progressSaved
delete req.session.data.checkListError

if (stage == "payment") {
  req.session.data.claimStep = "payment"
  delete req.session.data.learnerCount
  location = "tracker-payment"
} else if (stage == "completion") {
  req.session.data.learnerCount = parseInt(learnerNo)
  req.session.data.claimStep = "completion"
  location = "tracker-learner-" + learnerNo
}

delete req.session.data.stage
delete req.session.data.learnerNo

return res.redirect('organisation/org-view-main#' + location)

});

router.get('/claim-switch', function (req, res) {
const pairClaimID = req.session.data.pairID

delete req.session.data.pairID
delete req.session.data.claimStep
delete req.session.data.learnerCount
delete req.session.data.pairID

req.session.data.claimScreen = "claim"
req.session.data.id = pairClaimID
return res.redirect('organisation/org-view-main')
});

router.get('/claim-process-start-handler', function (req, res) {
req.session.data.orgTab = "singleClaim"
delete req.session.data.progressSaved
const claimID = req.session.data.id
let navigateTo = req.session.data.navigateTo
let fromProcessing = req.session.data.fromProcessing

let claim = null
let location = null

for (const c of req.session.data.claims) {
  if (c.claimID == claimID) {
    claim = c
    break;
  }
}

let submission = getMostRelevantSubmission(claim)    
if (claim.status == "inProgress" && (!navigateTo || !fromProcessing)) {
  req.session.data.claimScreen = "checkList"
} else if (navigateTo || fromProcessing) {

  req.session.data.claimScreen = "inProgress"

}
else {
  req.session.data.claimScreen = "inProgress"
  if ((claim.claimType == "100" && !isInternalOMMT(submission.trainingCode)) || claim.claimType == "60" || (claim.claimType == "40" && claim.isPaymentPlan) ) {
    req.session.data.claimStep = "payment"
    location = "tracker-payment"
  } else {
    req.session.data.learnerCount = 1
    req.session.data.claimStep = "completion"
    location = "tracker-learner-1"
  }
}

return res.redirect('organisation/org-view-main#' + location)


});

router.post('/claim-payment-handler', function (req, res) {
  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.paymentQueriedNoteIncomplete
  delete req.session.data.paidInFullResponseIncomplete
  delete req.session.data.checkListError
  delete req.session.data.navigateTo

  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  const paidInFullResponse = req.session.data.paidInFullResponse
  const paymentRejectNote = req.session.data.paymentRejectNote
  const paymentQueriedNote = req.session.data.paymentQueriedNote

  const actionType = req.session.data.actionType

  let claim = null
  let location = null

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }

  const errorParamaters = checkClaimProcess(claim, "payment", paymentResponse, paymentReimbursementAmount, paymentRejectNote, paymentQueriedNote, null, null, null, paidInFullResponse)

  if (errorParamaters == "" || actionType == "later") {

    let submission = getMostRelevantSubmission(claim) 
    if (paymentResponse == "approve") {
            submission.evidenceOfPaymentReview.outcome = "pass"
            if (claim.claimType == "100" || claim.claimType == "60") {
                submission.evidenceOfPaymentReview.costPerLearner = paymentReimbursementAmount
                if (paidInFullResponse == "yes") {
                    submission.evidenceOfPaymentReview.paymentPlan = "no"
                } else if (paidInFullResponse == "no") {
                    submission.evidenceOfPaymentReview.paymentPlan = "yes"
                }
            }
        } else if (paymentResponse == "reject") {
            submission.evidenceOfPaymentReview.outcome = "fail"
            submission.evidenceOfPaymentReview.note = paymentRejectNote
        } else if (paymentResponse == "queried") {
            submission.evidenceOfPaymentReview.outcome = "queried"
            submission.evidenceOfPaymentReview.note = paymentQueriedNote
    }
    if (paymentResponse != null) {
      claim.status = "inProgress"
    }

    delete req.session.data.payment
    delete req.session.data.paymentReimbursementAmount
    delete req.session.data.paidInFullResponse
    delete req.session.data.paymentRejectNote
    delete req.session.data.paymentQueriedNote

      if (actionType == "later") {
        const claimID = req.session.data.id
        delete req.session.data.learnerCount
        delete req.session.data.claimStep
        delete req.session.data.result


        req.session.data.claimScreen = "claim"
        req.session.data.progressSaved = true
        res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')

      } else if (claim.claimType == "100" || (claim.claimType == "40" && claim.isPaymentPlan) ) {
        req.session.data.claimStep = "completion"
        const index = findFirstLearnerWithoutOutcome(sortAlphabetically(submission.learners))
        if (index == -1) {
          req.session.data.claimScreen = "checkList"
          delete req.session.data.claimStep
          return res.redirect('organisation/org-view-main')
        } else {
          req.session.data.learnerCount = index + 1
          location = "tracker-learner-" + req.session.data.learnerCount
          return res.redirect('organisation/org-view-main#' + location)
        }

      } else {
        req.session.data.result = determineOutcome(claim, submission.evidenceOfPaymentReview.outcome, null)
        req.session.data.claimScreen = "checkList"
        delete req.session.data.claimStep
        return res.redirect('organisation/org-view-main')
      }

  } else {
      return res.redirect('organisation/org-view-main?' + errorParamaters + '#tracker-payment')
  }
});

router.post('/claim-completion-handler', function (req, res) {
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete
  delete req.session.data.completionQueriedNoteIncomplete
  delete req.session.data.checkListError

  claimID = req.session.data.id
  const completionResponse = req.session.data.completion
  const completionRejectNote = req.session.data.completionRejectNote
  const completionQueriedNote = req.session.data.completionQueriedNote
  const learnerCount = req.session.data.learnerCount

  const actionType = req.session.data.actionType

  let claim = null
  let location = null

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }
  const submission = getMostRelevantSubmission(claim)  

  const errorParamaters = checkClaimProcess(claim, "completion", null, null, null, null, completionResponse, completionRejectNote, completionQueriedNote, null)

  if (errorParamaters == "" || actionType == "later") {
    const sortedLearners = sortAlphabetically(submission.learners)
    const learner = sortedLearners[learnerCount-1]
    const learnerSubmission = submission.learners.find(u => u.learnerID === learner.learnerID)
    if (completionResponse == "approve") {
        learnerSubmission.evidenceOfCompletionReview.outcome = "pass"
    } else if (completionResponse == "reject") {
        learnerSubmission.evidenceOfCompletionReview.outcome = "fail"
        learnerSubmission.evidenceOfCompletionReview.note = completionRejectNote
    } else if (completionResponse == "queried") {
        learnerSubmission.evidenceOfCompletionReview.outcome = "queried"
        learnerSubmission.evidenceOfCompletionReview.note = completionQueriedNote
    }
    if (completionResponse != null) {
      claim.status = "inProgress"
    }
    delete req.session.data.completion
    delete req.session.data.completionRejectNote
    delete req.session.data.completionQueriedNote

      if (actionType == "later") {
        const claimID = req.session.data.id
        delete req.session.data.learnerCount
        delete req.session.data.claimStep
        delete req.session.data.result
        delete req.session.data.navigateTo 


        req.session.data.claimScreen = "claim"
        req.session.data.progressSaved = true
        res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')

        // TODO - else if a learner after doesn't have a outcome yet  
      } else if (findFirstLearnerWithoutOutcome(sortAlphabetically(submission.learners), learnerCount) != -1) {

        // TODO - cycle through learners after learner count, go to next learner without a outcome, 
        req.session.data.learnerCount = findFirstLearnerWithoutOutcome(sortAlphabetically(submission.learners), learnerCount) + 1
        location = "tracker-learner-" + req.session.data.learnerCount
        return res.redirect('organisation/org-view-main#' + location)

      // TODO - else last learner go to checklist 
      } else {
        delete req.session.data.learnerCount
        delete req.session.data.claimStep
        req.session.data.claimScreen = "checkList"
        return res.redirect('organisation/org-view-main')
      }

  } else {
      return res.redirect('organisation/org-view-main?' + errorParamaters + '#tab-content')
  }
});

router.get('/outcome-step-handler', function (req, res) {
  claimID = req.session.data.id
  delete req.session.data.learnerCount
  delete req.session.data.claimStep
  delete req.session.data.checkListError
  let claim = null

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }

  checkState = checkProcessingState(claim)

  if (checkState.check) {
    req.session.data.result = determineOutcome(claim)
    req.session.data.claimScreen = "confirmOutcome"
    return res.redirect('organisation/org-view-main')
  } else {
    req.session.data.checkListError = checkState
    return res.redirect('organisation/org-view-main')
  }
});

router.get('/outcome-handler', function (req, res) {
  claimID = req.session.data.id
  delete req.session.data.checkListError

  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {

      let submission = getMostRelevantSubmission(claim)  
      if (isInternalOMMT(submission.trainingCode)){
        submission.evidenceOfPaymentReview.outcome = "pass"
        const training = findCourseByCode(submission.trainingCode)
        submission.evidenceOfPaymentReview.costPerLearner = training.reimbursementAmount
      }  

      if (submission.evidenceOfPaymentReview.paymentPlan == "no") {
        claim.isPaymentPlan = false
      } else if (submission.evidenceOfPaymentReview.paymentPlan == "yes") {
        claim.isPaymentPlan = true
      }

      submission.processedDate = new Date()
      submission.processedBy = "Test processor"

      if (req.session.data.result == "reject") {
        claim.status = "rejected"
      } else if (req.session.data.result == "approve") {
        claim.status = "approved"
      } else if (req.session.data.result == "queried") {
        claim.status = "queried"
      }
    }
  }

  delete req.session.data.result

  req.session.data.processSuccess = "true"
  req.session.data.claimScreen = "claim"

  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')
});

router.get('/view-previous-submissions-handler', function (req, res) {

  claimID = req.session.data.id
  var foundClaim = null
  for (const claim of req.session.data['claims']) {
    if (claim.claimID == claimID) {
      foundClaim = claim
    }
  }
  var navigateTo = "tab-content" 
  if (req.session.data.navigateTo) {
    var navigateTo = req.session.data.navigateTo 
  }
  req.session.data.claimScreen = "previousSubmissions"
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&view=' + foundClaim.claimType + "&filter=everything" + '#' + navigateTo)
});

router.get('/from-learners-submission', function (req, res) {

  claimID = req.session.data.id
  var foundClaim = null
  for (const claim of req.session.data['claims']) {
    if (claim.claimID == claimID) {
      foundClaim = claim
    }
  }
  req.session.data.claimScreen = "previousSubmissions"
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&view=' + foundClaim.claimType + '#tab-content')
});

router.get('/learner-previous-submissions-handler', function (req, res) {

  claimID = req.session.data.id
  var foundClaim = null
  for (const claim of req.session.data['claims']) {
    if (claim.claimID == claimID) {
      foundClaim = claim
    }
  }
  var listSlot = req.session.data.listSlot
  req.session.data.claimScreen = "learnerPreviousSubmissions"
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&view=' + foundClaim.claimType + '#' + listSlot)

});

router.get('/view-previous-submissions-back-handler', function (req, res) {
  
  claimID = req.session.data.id
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')

});

router.post('/search-org', function (req, res) {
  const orgSearch = req.session.data.orgSearchInput
  delete req.session.data.error

  if (orgSearch == "") {
    req.session.data.error = 'emptyInput'
    return res.redirect('organisation/find-organisation')
  } else if (isValidOrgSearch(orgSearch) == false) {
    req.session.data.error = 'notValid'
    return res.redirect('organisation/find-organisation')
  }

  var foundOrg = null;
  const searchedOrg = orgSearch.toLowerCase();

  for (const org of req.session.data['organisations']) {
    const singleOrg = org.workplaceID?.toLowerCase();
    
    if (singleOrg === searchedOrg) {
      foundOrg = org;
      break;
    }

    if (org.signatory?.active?.email?.toLowerCase() === searchedOrg) {
      foundOrg = org;
      break;
    }

    if (org.signatory?.inactive?.some(signatory => signatory.email?.toLowerCase() === searchedOrg)) {
      foundOrg = org;
      break;
    }

    if (org.users?.active?.some(user => user.email?.toLowerCase() === searchedOrg)) {
      foundOrg = org;
      break;
    }

    if (org.users?.invited?.some(user => user.email?.toLowerCase() === searchedOrg)) {
      foundOrg = org;
      break;
    }
  }

  if (foundOrg == null) {
    req.session.data.error = 'notFound'
    res.redirect('organisation/find-organisation')
  } else {
    delete req.session.data.orgSearchInput
    req.session.data.orgTab = 'users'
    req.session.data.orgID = foundOrg.workplaceID
    res.redirect('organisation/org-view-main')
  }
});

router.get('/reinvite-signatory', function (req, res) {
  req.session.data.invite = "success"
  if (req.session.data.resendList) {
    req.session.data.resendList.push(req.session.data.name)
  } else {
    req.session.data.resendList = [req.session.data.name]
  }
  req.session.data.orgTab = "users"
  res.redirect('organisation/org-view-main#tab-content')
});

router.post('/update-signatory-invite', function (req, res) {
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const email = req.session.data.email

  const SROChange  = req.session.data.SROChange

  
  const orgID = req.session.data.orgID

  for (const org of req.session.data['organisations']) {
    if (org.workplaceID == orgID) {
      if (SROChange == 'replace') {
        const previousSRO = {
          givenName: org.signatory.active.givenName,
          familyName: org.signatory.active.familyName,
          email: org.signatory.active.email,
          status: 'inactive'
        }
        org.signatory.inactive.push(previousSRO)
      }

      org.signatory.active.givenName = givenName
      org.signatory.active.familyName = familyName
      org.signatory.active.email = email
      org.signatory.active.status = "invited"
    } 
  }
  
  if (req.session.data.resendList) {
    req.session.data.resendList.push(email)
  } else {
    req.session.data.resendList = [email]
  }
  req.session.data.confirmation = 'invited'
  req.session.data.orgTab = 'users'
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.email
  delete req.session.data.SROChange

  res.redirect('organisation/org-view-main#tab-content')
});

router.get('/org-tab-handler/:tab', function (req, res) {

  const orgTab = req.params.tab

  delete req.session.data.claimID
  delete req.session.data.emptyError
  delete req.session.data.invalidIDError
  delete req.session.data.notFound
  delete req.session.data.currentPage
  delete req.session.data.confirmation
  delete req.session.data.processSuccess
  delete req.session.data.fromNoteNav

  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete

  req.session.data.orgTab = orgTab

  if (orgTab == 'claims') {
    req.session.data.currentPage = '1'
  }

  res.redirect('../organisation/org-view-main')
});

router.get('/back-to-start-handler', function (req, res) {

  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete
  delete req.session.data.fromNoteNav

  delete req.session.data.payment
  delete req.session.data.paymentReimbursementAmount
  delete req.session.data.paymentRejectNote
  delete req.session.data.completion
  delete req.session.data.completionRejectNote

  delete req.session.data.id
  delete req.session.data.claimScreen
  delete req.session.data.currentPage
  delete req.session.data.orgTab
  delete req.session.data.orgID

  delete req.session.data.result

  delete req.session.data.confirmation
  delete req.session.data.invite
  delete req.session.data.resendList

  if (req.session.data.userType == "processor" || req.session.data.userType == "leadProcessor") {
    res.redirect('./home')
  } else {
    res.redirect('./organisation/find-organisation')
  }
});

router.get('/confirm-signatory-handler', function (req, res) {

  delete req.session.data.newOrg
  delete req.session.data.orgID
  delete req.session.data.email
  delete req.session.data['answers-checked']

  req.session.data.confirmation = 'register'

  res.redirect('./home')
});

router.post('/change-sro-handler', function (req, res) {

    res.redirect('./change-sro/signatory-details')

});

router.post('/signatory-change-handler', function (req, res) {
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const email = req.session.data.email

  const SROChange = req.session.data.SROChange

  const result = signatoryCheck(familyName, givenName, email)

  let noChange = false

  if (SROChange == 'edit') {
    const orgID = req.session.data.orgID
    const organisations = req.session.data.organisations
    for (const org of organisations) {
      if (org.workplaceID == orgID) {
        noChange = org.signatory.active.familyName == familyName && org.signatory.active.givenName == givenName && org.signatory.active.email == email
      }
    }
  }

  if (result.signatoryValid) {
    if (noChange) {
      req.session.data.submitError = "noChange"
      res.redirect('change-sro/signatory-details')
    } else {
      delete req.session.data.submitError
      res.redirect('change-sro/updated-signatory-invitation')
    }
  } else {  
    req.session.data.submitError = result
    res.redirect('change-sro/signatory-details')
  }
});

router.get('/showClaimPaymentNote', function (req, res) {
  req.session.data['showNote'] = true
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      res.redirect('processing/v14/organisation/org-view-main?subCount=' + subCount + '&orgTab=singleClaim' + '&id=' + claimID)
    }
  }
});

router.get('/hideClaimPaymentNote', function (req, res) {
  req.session.data['showNote'] = null
  req.session.data['type'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      res.redirect('processing/v14/organisation/org-view-main?orgTab=singleClaim' + '&id=' + claimID)
    }
  }
});

router.get('/showProcessorLearnerNote', function (req, res) {
  req.session.data['showProcessorLearnerNote'] = true
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      res.redirect('processing/v14/organisation/org-view-main?subCount=' + subCount + '&orgTab=singleClaim' + '&id=' + claimID)
    }
  }
});

router.get('/hideProcessorLearnerNote', function (req, res) {
  req.session.data['showProcessorLearnerNote'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  var foundClaim = null
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      foundClaim = c
    }
  }
  req.session.data.claimScreen = "learnerPreviousSubmissions"
  res.redirect('processing/v14/organisation/org-view-main?orgTab=singleClaim' + '&id=' + claimID)
});

router.get('/applySubmissionsFilterProcessorv14', function (req, res) {
  var claimID = req.session.data.id
  var filter = req.session.data.filter
  res.redirect('processing/v14/organisation/org-view-main?orgTab=singleClaim' + '&id=' + claimID + "&filter=" + filter)
})

//generate data
router.post('/generate-handler', function (req, res) {
  const jsonFilePath = './app/views/processing/v14/_data/claims.json';
  const claims = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  const claimType = req.session.data.claimType
  const claimStatus = req.session.data.claimStatus
  const submissions = parseInt(req.session.data.submissions, 10)
  const learners = parseInt(req.session.data.learners, 10)
  const compDate = req.session.data.compDate

  delete req.session.data.claimType
  delete req.session.data.claimStatus
  delete req.session.data.submissions
  delete req.session.data.learners
  delete req.session.data.compDate

  const claim = generateClaim(claimType, claimStatus, submissions, learners, compDate, null)
  claims.push(claim)

  if (claimType == "40" ) {
    const pairClaim = generateClaim("60", "approved", 1, learners, null, claim)
    claims.push(pairClaim)
  } else if (claimType == "40PP") {
    const pairClaim = generateClaim("60PP", "approved", 1, learners, null, claim)
    claims.push(pairClaim)
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(claims, null, 2));

  req.session.data.confirmationID = claim.claimID

  res.redirect('./_claim-generation/generate-confirmation')
})

module.exports = router