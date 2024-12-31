const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck, validNumberCheck, isFullClaimCheck, findOrg_V6, isValidOrgSearch } = require('../helpers/helpers.js');

// v6 Prototype routes

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

  if (orgID == "") {
    res.redirect('register-organisation/organisation-details?submitError=missing')
  } else if (orgID == "timeout") {
    res.redirect('register-organisation/org-issue?submitError=timeout')
  } else if (orgID == "D18946931" || orgID == "resend") {
    res.redirect('register-organisation/org-issue?submitError=resend')
  } else if (orgID == "B02944934" || orgID == "dupe") {
    res.redirect('register-organisation/org-issue?submitError=duplicate')
  } else if (checkWDSFormat(orgID)) {
    delete req.session.data.submitError
    res.redirect('register-organisation/confirm-organisation-details')
  } else {
    res.redirect('register-organisation/organisation-details?submitError=invalid')
  }
});

router.post('/confirm-org-handler', function (req, res) {
  const confirmation = req.session.data.confirmation
  delete req.session.data.submitError
  delete req.session.data.confirmation

  if (confirmation == "yes") {
    res.redirect('register-organisation/signatory-details?newOrg=true')
  } else if (confirmation == "no") {
    res.redirect('register-organisation/org-issue?submitError=incorrect')
  } else if (confirmation == null) {
    res.redirect('register-organisation/confirm-organisation-details?submitError=missing')
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
  delete req.session.data.confirmation
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.email

  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountTooMuch
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentNoNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess

  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionNoNoteIncomplete


  var claimID = req.session.data.claimID.replace(/\s/g, '');


  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    return res.redirect('process-claim/start-process?invalidIDError=true&emptyError=true')
  }

  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    return res.redirect('process-claim/start-process?invalidIDError=true')
  }

  const lengthRegex = /^[A-NP-Z0-9]{3}-[A-NP-Z0-9]{4}-[A-NP-Z0-9]{4}-(A|B|C)$/;
  if (!lengthRegex.test(claimID)) {
    return res.redirect('process-claim/start-process?invalidIDError=true')
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }
  if (foundClaim == null) {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
  }
  if (foundClaim.status == "submitted" || foundClaim.status == "approved" || foundClaim.status == "rejected") {
    req.session.data.processClaimStep = "inProgress"
    req.session.data.orgTab = "singleClaim"

    return res.redirect('organisation/org-view-main' + '?id=' + foundClaim.claimID + '&orgId=' + foundClaim.workplaceId)
  } else {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
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
  delete req.session.data.paymentNoNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionNoNoteIncomplete

  delete req.session.data.payment
  delete req.session.data.paymentReimbursementAmount
  delete req.session.data.paymentNoNote
  delete req.session.data.completion
  delete req.session.data.completionNoNote

  return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + req.session.data.orgId)

});




router.post('/claim-process-handler', function (req, res) {
  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentNoNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.noteSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionNoNoteIncomplete

  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  const paymentNoNote = req.session.data.paymentNoNote
  const completionResponse = req.session.data.completion
  const completionNoNote = req.session.data.completionNoNote

  const processJourneyType = req.session.data.processJourneyType

  var errorParamaters = ""
  var claim = null
  var isFullClaim = false

  var validAmount = validNumberCheck(paymentReimbursementAmount)

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }
  isFullClaim = isFullClaimCheck(claim)

  if (((claim.fundingType == "TU") && (claim.claimType == "60" || claim.claimType == "100"))) {
    if (paymentResponse == null) {
      errorParamaters += "&paymentResponseIncomplete=true";
    } else if (paymentResponse == "yes" && (paymentReimbursementAmount == null || paymentReimbursementAmount == "")) {
      errorParamaters += "&paymentReimbursementAmountIncomplete=true";
    } else if (paymentResponse == "yes" && (!validAmount)) {
      errorParamaters += "&paymentReimbursementAmountInvalid=true";
    } else if (paymentResponse == "no" && (paymentNoNote == null || paymentNoNote == "")) {
      errorParamaters += "&paymentNoNoteIncomplete=true";
    }
  }

  if ((claim.fundingType == "TU") && (claim.claimType == "40" || claim.claimType == "100")) {
    if (completionResponse == null) {
      errorParamaters += "&completionResponseIncomplete=true";
    } else if (completionResponse == "no" && (completionNoNote == null || completionNoNote == "")) {
      errorParamaters += "&completionNoNoteIncomplete=true";
    }
  }

  if (errorParamaters == "") {

    if ((paymentResponse == "yes" || ((claim.fundingType == "TU") && (claim.claimType == "40"))) && (completionResponse == "yes" || ((claim.fundingType == "TU") && (claim.claimType == "60")))) {
      req.session.data.result = "approve"
    } else {
      req.session.data.result = "reject"
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
  const paymentNoNote = req.session.data.paymentNoNote
  const completionResponse = req.session.data.completion
  const completionNoNote = req.session.data.completionNoNote

  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      updateClaim(claim, paymentResponse, paymentReimbursementAmount, paymentNoNote, completionResponse, completionNoNote)
      if (req.session.data.result == "reject") {
        claim.rejectedDate = new Date()
        claim.status = "rejected"
      } else if (req.session.data.result == "approve") {
        claim.approvedDate = new Date()
        claim.status = "approved"
      }
    }
  }

  delete req.session.data.payment
  delete req.session.data.paymentReimbursementAmount
  delete req.session.data.paymentNoNote
  delete req.session.data.completion
  delete req.session.data.completionNoNote
  delete req.session.data.processClaimStep 


  req.session.data.processSuccess = "true"

  req.session.data.processClaimStep = "claimProcessed"
  res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')
});

router.post('/add-note', function (req, res) {
  const claimID = req.session.data.id
  var foundClaim = null
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }
  var newNoteInput = req.session.data.notes

  if (newNoteInput == null || newNoteInput == "") {
    req.session.data.noteError = true  
    res.redirect('process-claim/add-note?id=' + claimID)

  } else {
    var currentDate = new Date().toISOString();
    var newNote = {
      "author": "Test Participant (Processor)",
      "date": currentDate,
      "note": newNoteInput
    };

    delete req.session.data.noteInput
    delete req.session.data.noteError

    foundClaim.notes.push(newNote);
    req.session.data.noteSuccess = "true"
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')

  }
});

router.post('/search-org-id', function (req, res) {
  const orgSearch = req.session.data.orgSearchInput

  if (orgSearch == "") {
    return res.redirect('organisation/find-organisation?error=emptyInput')
  } else if (isValidOrgSearch(orgSearch) == false) {
    return res.redirect('organisation/find-organisation?error=notValid')
  }

  var foundOrg = null
  for (const org of req.session.data['organisations']) {
    if (org.workplaceId == orgSearch) {
      foundOrg = org
      break
    }
  }
  if (foundOrg == null) {
    res.redirect('organisation/find-organisation?error=notFound')
  } else {
    res.redirect('organisation/org-view-main?orgTab=users&orgId=' + foundOrg.workplaceId + '&currentPage=1')
    delete req.session.data.orgSearchInput
  }
});

router.post('/search-claim-id-orgView', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  delete req.session.data['id'];

  var claimID = req.session.data.claimID.replace(/\s/g, '');
  var foundOrg = req.session.data.orgId

  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg + '&emptyError=true')
  }

  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg + '&invalidIDError=true')
  }

  const lengthRegex = /^[A-NP-Z0-9]{3}-[A-NP-Z0-9]{4}-[A-NP-Z0-9]{4}-(A|B|C)$/;
  if (!lengthRegex.test(claimID)) {
    return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg + '&invalidIDError=true')
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }
  if (foundClaim == null) {
    return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg + '&notFound=true')
  }
  if (foundClaim.status == "submitted" || foundClaim.status == "approved" || foundClaim.status == "rejected") {
    
    req.session.data.processClaimStep = "inProgress"

    req.session.data.orgTab = "singleClaim"
    return res.redirect('organisation/org-view-main' + '?id=' + foundClaim.claimID + '&orgId=' + foundOrg)
  } else {
    return res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg + '&notFound=true')
  }
});

router.post('/add-org-note', function (req, res) {
  const orgID = req.session.data.orgId
  var foundOrg = null
  for (const org of req.session.data['organisations']) {
    if (org.workplaceId == orgID) {
      foundOrg = org
    }
  }
  var newNoteInput = req.session.data.notes

  if (newNoteInput == null || newNoteInput == "") {
    req.session.data.noteError = true  
    res.redirect('process-claim/add-note?id=' + claimID)

  } else {
    var currentDate = new Date().toISOString();
    var newNote = {
      "author": "Test Participant (Processor)",
      "date": currentDate,
      "note": newNoteInput
    };

    delete req.session.data.noteInput
    delete req.session.data.noteError

    foundClaim.notes.push(newNote);
    req.session.data.noteSuccess = "true"
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '#tab-content')

  }
});

router.get('/reinvite-signatory', function (req, res) {
  req.session.data.invite = "success"
  if (req.session.data.resendList) {
    req.session.data.resendList.push(req.session.data.name)
  } else {
    req.session.data.resendList = [req.session.data.name]
  }
  res.redirect('organisation/org-view-main?orgTab=users&orgId=' + req.session.data.orgId + '&currentPage=1')
});

router.post('/org-signatory-handler', function (req, res) {
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const email = req.session.data.email
  const edited = req.session.data.edited
  const newOrg = req.session.data.newOrg

  const result = signatoryCheck(familyName, givenName, email)

  if (result.signatoryValid) {
    delete req.session.data.submitError
      res.redirect('organisation/updated-signatory-invitation')
  } else {
    req.session.data.submitError = result
    res.redirect('organisation/signatory-details')
  }
});

router.post('/update-signatory-invite', function (req, res) {
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const email = req.session.data.email

  const orgID = req.session.data.orgId
  for (const org of req.session.data['organisations']) {
    if (org.workplaceId == orgID) {
      org.signatory.givenName = givenName
      org.signatory.familyName = familyName
      org.signatory.email = email
      org.signatory.status = "invited"
    } 
  }
  res.redirect('organisation/org-view-main?orgTab=users&confirmation=invited&edited=&goBack=')
});

module.exports = router