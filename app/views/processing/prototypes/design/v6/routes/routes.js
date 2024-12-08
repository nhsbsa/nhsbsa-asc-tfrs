const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck, validNumberCheck, isFullClaimCheck, findOrg_V6 } = require('../helpers/helpers.js');

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
  } else if (orgID == "B02944934") {
    res.redirect('register-organisation/org-issue?submitError=resend')
  } else if (orgID == "D18946931") {
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
    return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=notStarted')
  } else {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
  }
});

router.get('/start-processing', function (req, res) {
  const claimID = req.session.data.id
  var claim = null
  
  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }

  if (claim.claimType == "100" || claim.claimType == "60") {
      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=checkPayment#tab-content')
  } else if (claim.claimType == "40")  {
      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=checkCompletion#tab-content')
  }
});

router.post('/payment-check-handler', function (req, res) {
  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment

  if (paymentResponse == null) {
    return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=checkPayment#tab-content')

  } else {
    if (paymentResponse == "yes") {
      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=costPerLearner#tab-content')
    } else if (paymentResponse =="no") {
      return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=paymentRejectionNote#tab-content')
    }
  }
});

router.post('/cost-per-learner-handler', function (req, res) {
  claimID = req.session.data.id
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  var claim = null

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }


  if (claim.claimType == "100") {
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=checkCompletion#tab-content')
  } else if (claim.claimType == "60") {
    switch(req.session.data.payment) {
      case "yes":
        req.session.data.result = "approve"
        break;
      case "no":
        req.session.data.result = "reject"
        break;
    }
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=confirmOutcome#tab-content')
  }

});

router.post('/payment-rejection-note-handler', function (req, res) {
  claimID = req.session.data.id
  const paymentNoNote = req.session.data.paymentNoNote
  var claim = null

  for (const c of req.session.data.claims) {
    if (c.claimID == claimID) {
      claim = c
      break;
    }
  }


  if (claim.claimType == "100") {
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=checkCompletion#tab-content')
  } else if (claim.claimType == "60") {
    switch(req.session.data.payment) {
      case "yes":
        req.session.data.result = "approve"
        break;
      case "no":
        req.session.data.result = "reject"
        break;
    }
    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=confirmOutcome#tab-content')
  }

});

router.post('/completion-check-handler', function (req, res) {
  claimID = req.session.data.id
  const completionResponse = req.session.data.completion


  if (completionResponse == "yes") {
    switch(req.session.data.payment, req.session.data.completion) {
      case "yes","yes":
        req.session.data.result = "approve"
        break;
      default:
        req.session.data.result = "reject"
        break;
    }
    return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=confirmOutcome#tab-content')
  } else if (completionResponse =="no") {
    return res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=completionRejectionNote#tab-content')
  }

});

router.post('/completion-rejection-note-handler', function (req, res) {
  claimID = req.session.data.id
  const completionNoNote = req.session.data.paymentNoNote


  switch(req.session.data.payment, req.session.data.completion) {
    case "yes","yes":
      req.session.data.result = "approve"
      break;
    default:
      req.session.data.result = "reject"
      break;
  }

    res.redirect('organisation/org-view-main' + '?orgTab=singleClaim&id=' + claimID + '&processClaimStep=confirmOutcome#tab-content')

});



router.get('/cancel-handler', function (req, res) {
  const claimID = req.session.data.id
  res.redirect('process-claim/start-process')
});

router.get('/cancel-outcome', function (req, res) {
  const claimID = req.session.data.id
  res.redirect('process-claim/claim?id=' + claimID)
});



router.post('/claim-process-handler', function (req, res) {
  delete req.session.data.paymentResponseIncomplete
  delete req.session.data.paymentReimbursementAmountIncomplete
  delete req.session.data.paymentReimbursementAmountInvalid
  delete req.session.data.paymentNoNoteIncomplete
  delete req.session.data.processSuccess
  delete req.session.data.completionResponseIncomplete
  delete req.session.data.completionNoNoteIncomplete

  claimID = req.session.data.id
  const paymentResponse = req.session.data.payment
  const paymentReimbursementAmount = req.session.data.paymentReimbursementAmount
  const paymentNoNote = req.session.data.paymentNoNote
  const completionResponse = req.session.data.completion
  const completionNoNote = req.session.data.completionNoNote

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
      res.redirect('process-claim/outcome?result=approve')
    } else {
      res.redirect('process-claim/outcome?result=reject')
    }
  } else {
    res.redirect("process-claim/claim?id=" + claimID + errorParamaters)
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

  res.redirect('process-claim/claim?processSuccess=true')
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
    res.redirect('process-claim/claim' + '?id=' + claimID + "&noteAddedSuccess")

  }
});

router.post('/search-org-id', function (req, res) {
  const orgSearch = req.session.data.orgSearchInput
  var foundOrg = null
  var viaClaim = false
  var viaSROEmail = false
  var viaSubmitterEmail = false
  var viaOrgId = false
  for (const org of req.session.data['organisations']) {
    if (org.workplaceId == orgSearch) {
      foundOrg = org
      viaOrgId = true
      break
    } else if (org.signatory.email == orgSearch) {
      foundOrg = org
      viaSROEmail = true
      break
    } else {
      for (const claim of req.session.data['claims']) {
        if (claim.claimID == orgSearch) {
          for (const org of req.session.data['organisations']) {
            if (org.workplaceId == claim.workplaceId) {
              foundOrg = org
              viaClaim = true
            }
          }
          break
        } else if (claim.submitter.email == orgSearch) {
          foundOrg = org
          viaSubmitterEmail = true
          break
        }
      }
      break
    } 
  }
  if (foundOrg == null) {
    res.redirect('organisation/find-organisation?error=notFound')
  }
  else {
    if (viaClaim) {
      res.redirect('organisation/org-view-main?orgTab=singleClaim&orgId=' + foundOrg.workplaceId + '&id=' + orgSearch + '&processClaimStep=notStarted')
    } else {
      res.redirect('organisation/org-view-main?orgTab=claims&orgId=' + foundOrg.workplaceId)
    } 
  }
});

module.exports = router