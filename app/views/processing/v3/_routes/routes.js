const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck, validNumberCheck, isFullClaimCheck, getLearner } = require('../_helpers/helpers.js');

// v3 Prototype routes

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
  } else if (checkWDSFormat(orgID)) {
    delete req.session.data.submitError
    res.redirect('register-organisation/confirm-organisation-details')
  } else if (orgID == "timeout") {
    res.redirect('register-organisation/org-issue?submitError=timeout')
  } else if (orgID == "resend") {
    res.redirect('register-organisation/org-issue?submitError=resend')
  } else if (orgID == "dupe") {
    res.redirect('register-organisation/org-issue?submitError=duplicate')
  } else {
    res.redirect('register-organisation/organisation-details?submitError=invalid')
  }
});

router.post('/confirm-org-handler', function (req, res) {
  const confirmation = req.session.data.confirmation
  delete req.session.data.submitError
  delete req.session.data.confirmation
  
  if (confirmation == "yes") {
    res.redirect('register-organisation/signatory-details')
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
  delete req.session.data.orgID

  const result = signatoryCheck(familyName, givenName, email)

  if (result.signatoryValid) {
    delete req.session.data.submitError
    res.redirect('register-organisation/confirm-signatory-details')
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

  const lengthRegex = /^[A-NP-Z0-9]{3}-[A-NP-Z0-9]{4}-[A-NP-Z0-9]{4}-(A|B|C|D)$/;
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
    return res.redirect('process-claim/claim' + '?id=' + claimID)
  } else {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
  }
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

      if (claim.fundingType == "CPD") {
        if (paymentResponse == null) {
          errorParamaters += "&paymentResponseIncomplete=true";
        } else if (paymentResponse == "no" && (paymentNoNote == null || paymentNoNote == "")) {
          errorParamaters += "&paymentNoNoteIncomplete=true";
        }
      }

      if ((claim.fundingType == "TU") && (claim.claimType == "40" || claim.claimType == "100")) {
        if (completionResponse == null) {
          errorParamaters += "&completionResponseIncomplete=true";
        } else if (completionResponse == "no" && (completionNoNote == null || completionNoNote == "" )) {
          errorParamaters += "&completionNoNoteIncomplete=true";
        } 
      }

      if (errorParamaters == "") {
        if (((claim.fundingType == "CPD") && (paymentResponse == "yes")) || (paymentResponse == "yes" || ((claim.fundingType == "TU") && (claim.claimType == "40"))) && (completionResponse == "yes" || ((claim.fundingType == "TU") && (claim.claimType == "60")))) {
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
      learner = getLearner(req.session.data.learners, claim.learner.id)
      updateClaim(claim, learner, paymentResponse, paymentReimbursementAmount, paymentNoNote, completionResponse, completionNoNote)
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

module.exports = router