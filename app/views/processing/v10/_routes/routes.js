const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck, validNumberCheck, findOrg, isValidOrgSearch, getMostRelevantSubmission } = require('../_helpers/helpers.js');

router.use('/processing/v10/backstop', require('../_backstop/backstop-routes.js'));

// v10 Prototype routes

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
  } else if (foundClaim.status == "submitted" || foundClaim.status == "approved" || foundClaim.status == "rejected" || foundClaim.status == "queried") {

    req.session.data.processClaimStep = "inProgress"
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

router.get('/cancel-outcome', function (req, res) {
  const claimID = req.session.data.id
  req.session.data.processClaimStep = "inProgress"
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

  return res.redirect('organisation/org-view-main?orgTab=claims&orgID=' + req.session.data.orgID + '&currentPage=1#tab-content')

});

router.post('/claim-process-handler', function (req, res) {
  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentRejectNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionRejectNoteIncomplete
  delete req.session.data.paymentQueriedNoteIncomplete
  delete req.session.data.completionQueriedNoteIncomplete

  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  const paymentRejectNote = req.session.data.paymentRejectNote
  const paymentQueriedNote = req.session.data.paymentQueriedNote
  const completionResponse = req.session.data.completion
  const completionRejectNote = req.session.data.completionRejectNote
  const completionQueriedNote = req.session.data.completionQueriedNote

  var errorParamaters = ""
  var claim = null

  var validAmount = validNumberCheck(paymentReimbursementAmount)

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }

  if (claim.claimType == "60" || claim.claimType == "100") {
    if (paymentResponse == null) {
      errorParamaters += "&paymentResponseIncomplete=true";
    } else if (paymentResponse == "approve" && (paymentReimbursementAmount == null || paymentReimbursementAmount == "")) {
      errorParamaters += "&paymentReimbursementAmountIncomplete=true";
    } else if (paymentResponse == "approve" && (!validAmount)) {
      errorParamaters += "&paymentReimbursementAmountInvalid=true";
    } else if (paymentResponse == "reject" && (paymentRejectNote == null || paymentRejectNote == "")) {
      errorParamaters += "&paymentRejectNoteIncomplete=true";
    } else if (paymentResponse == "queried" && (paymentQueriedNote == null || paymentQueriedNote == "")) {
      errorParamaters += "&paymentQueriedNoteIncomplete=true";
    }
  }

  if (claim.claimType == "40" || claim.claimType == "100") {
    if (completionResponse == null) {
      errorParamaters += "&completionResponseIncomplete=true";
    } else if (completionResponse == "reject" && (completionRejectNote == null || completionRejectNote == "")) {
      errorParamaters += "&completionRejectNoteIncomplete=true";
    } else if (completionResponse == "queried" && (completionQueriedNote == null || completionQueriedNote == "")) {
      errorParamaters += "&completionQueriedNoteIncomplete=true";
    }
  }

  if (errorParamaters == "") {

    if (claim.claimType == "100") {
      if (paymentResponse == "reject" || completionResponse == "reject") {
        req.session.data.result = "reject";
      } else if (paymentResponse == "queried" || completionResponse == "queried") {
        req.session.data.result = "queried";
      } else if (paymentResponse == "approve" && completionResponse == "approve") {
        req.session.data.result = "approve";
      }
    } else if (claim.claimType == "60") {
      if (paymentResponse == "reject") {
        req.session.data.result = "reject";
      } else if (paymentResponse == "queried") {
        req.session.data.result = "queried";
      } else if (paymentResponse == "approve") {
        req.session.data.result = "approve";
      }
    } else if (claim.claimType == "40") {
      if (completionResponse == "reject") {
        req.session.data.result = "reject";
      } else if (completionResponse == "queried") {
        req.session.data.result = "queried";
      } else if (completionResponse == "approve") {
        req.session.data.result = "approve";
      }
    }

      req.session.data.processClaimStep = "confirmOutcome"
      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')


  } else {

      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + errorParamaters + '#tab-content')

  }
});

router.get('/outcome-handler', function (req, res) {
  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  const paymentRejectNote = req.session.data.paymentRejectNote
  const paymentQueriedNote = req.session.data.paymentQueriedNote

  const completionResponse = req.session.data.completion
  const completionRejectNote = req.session.data.completionRejectNote
  const completionQueriedNote = req.session.data.completionQueriedNote

  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      updateClaim(claim, paymentResponse, paymentReimbursementAmount, paymentQueriedNote, paymentRejectNote, completionResponse, completionQueriedNote, completionRejectNote)
      
      let submission = getMostRelevantSubmission(claim)    
      submission.processedDate = new Date()
      submission.processedBy = "To add"

      if (req.session.data.result == "reject") {
        claim.status = "rejected"
      } else if (req.session.data.result == "approve") {
        claim.status = "approved"
      } else if (req.session.data.result == "queried") {
        claim.status = "queried"
      }
    }
  }

  delete req.session.data.payment
  delete req.session.data.paymentReimbursementAmount
  delete req.session.data.paymentRejectNote
  delete req.session.data.paymentQueriedNote

  delete req.session.data.completion
  delete req.session.data.completionRejectNote
  delete req.session.data.completionQueriedNote


  req.session.data.processSuccess = "true"
  req.session.data.processClaimStep = "claimProcessed"

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
  req.session.data.processClaimStep = "previousSubmissions"
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&view=' + foundClaim.claimType + '#tab-content')

});

router.get('/view-previous-submissions-back-handler', function (req, res) {
  
  claimID = req.session.data.id
  req.session.data.processClaimStep = "inProgress"
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
  delete req.session.data.processClaimStep
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

router.get('/showEditedNote', function (req, res) {
  req.session.data['showNote'] = true
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      res.redirect('processing/v10/organisation/org-view-main?subCount=' + subCount + '&orgTab=singleClaim' + '&id=' + claimID)
    }
  }
});

router.get('/hideEditedNote', function (req, res) {
  req.session.data['showNote'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      res.redirect('processing/v10/organisation/org-view-main?orgTab=singleClaim' + '&id=' + claimID)
    }
  }
});

module.exports = router