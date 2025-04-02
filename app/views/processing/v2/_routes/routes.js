const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck } = require('../_helpers/helpers.js');

// v1 Prototype routes

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
  if (foundClaim.status == "submitted" || foundClaim.status == "approved" || foundClaim.status == "rejected"  || foundClaim.status == "partlyProcessed") {
    return res.redirect('process-claim/claim' + '?id=' + claimID)
  } else {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
  }

});

router.get('/cancel-handler', function (req, res) {
  delete req.session.data['noteAddedSuccess'];

  const claimID = req.session.data.id
  res.redirect('process-claim/claim' + '?id=' + claimID)
});

router.post('/add-note', function (req, res) {
  const claimID = req.session.data.id
  var notes = req.session.data.notes
  var foundClaim = null 
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }
  var newCategory = req.session.data.category
  var newNoteInput = req.session.data.noteInput
  var currentDate = new Date().toISOString();
  var newNote = {
    "author": "test participant",
    "date": currentDate,
    "category": newCategory,
    "note": newNoteInput
};
foundClaim.notes.push(newNote);
  res.redirect('process-claim/claim' + '?id=' + claimID + "&noteAddedSuccess")
});

router.post('/evidence-check-handler', function (req, res) {
  const response = req.session.data.criteriaCheck
  const note = req.session.data.note
  const type = req.session.data.type

  delete req.session.data.submitError;
  delete req.session.data.incompletePayment
  delete req.session.data.incompleteCompletion

  claimID = req.session.data.id

  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
        if (response == null) {
          res.redirect('process-claim/review-evidence?type=' + type + '&submitError=missing')
        } else if (response == "yes") {
          delete req.session.data.criteriaCheck
          delete req.session.data.note
          delete req.session.data.type
          updateClaim(claim, type, response, note)
          res.redirect('process-claim/claim')
        } else if (response == "no") {
            if (note == "") {
              res.redirect('process-claim/review-evidence?type=' + type + '&submitError=notemissing')
            } else {
              delete req.session.data.criteriaCheck
              delete req.session.data.note
              delete req.session.data.type
              updateClaim(claim, type, response, note)
              res.redirect('process-claim/claim')
            }
        }
      }
    }
});

router.post('/claim-process-handler', function (req, res) {
  delete req.session.data.incompletePayment
  delete req.session.data.incompleteCompletion
  claimID = req.session.data.id
  var errorURL = "process-claim/claim?"
  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      if (claim.evidenceOfPaymentreview.pass && claim.evidenceOfCompletionreview.pass) {
        res.redirect('process-claim/reimbursement-amount')
      } else if (claim.evidenceOfPaymentreview.pass == false || claim.evidenceOfCompletionreview.pass == false) {
        res.redirect('process-claim/outcome?result=reject')
      } else {
        if (claim.evidenceOfPaymentreview.pass == null) {
          errorURL += "incompletePayment=true"
        } 
        if (claim.evidenceOfCompletionreview.pass == null) {
          errorURL += "&incompleteCompletion=true"
        } 
        res.redirect(errorURL)
      }
    }
  }
});
router.get('/outcome-handler', function (req, res) {
  date = new Date();
  claimID = req.session.data.id
  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      if (req.session.data.result == "reject") {
        claim.status = "rejected"
        note = {
          "author": "John Smith",
          "date": date,
          "category": "System",
          "note": "Claim was rejected."
        }
        claim.notes.push(note)
      } else if (req.session.data.result == "approve") {
        claim.status = "approved"
        note = {
          "author": "John Smith",
          "date": date,
          "category": "System",
          "note": "Claim was approved."
        }
        claim.notes.push(note)
      }
    }
  }
  res.redirect('process-claim/claim?processSuccess=true')
});

router.post('/saveAndExit', function (req, res) {
  delete req.session.data.incompletePayment
  delete req.session.data.incompleteCompletion
  const claimID = req.session.data.id
  var foundClaim = null 
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }
  foundClaim.status = "partlyProcessed"
  res.redirect('process-claim/start-process?processSuccess')
});

router.post('/update-rejection-notes', function (req, res) {
  delete req.session.data.paymentEmptyInput
    delete req.session.data.completionEmptyInput
  const claimID = req.session.data.id
  var foundClaim = null 
  for (const c of req.session.data['claims']) {
    if (c.claimID == claimID) {
      foundClaim = c
    }
  }

  foundClaim.evidenceOfPaymentreview.note = req.session.data.paymentRejectionNote
  foundClaim.evidenceOfCompletionreview.note = req.session.data.completionRejectionNote

  var baseErrorURL = 'process-claim/edit-rejection-notes' + '?id=' + claimID
  if (foundClaim.evidenceOfPaymentreview.note == "") {
    baseErrorURL += "&paymentEmptyInput=true"
  }
  if (foundClaim.evidenceOfCompletionreview.note == "") {
    baseErrorURL += "&completionEmptyInput=true"
  }
  if (foundClaim.evidenceOfPaymentreview.note != null && foundClaim.evidenceOfPaymentreview.note != "" && foundClaim.evidenceOfCompletionreview.note != "" && foundClaim.evidenceOfCompletionreview.note != "") {
    res.redirect("process-claim/outcome")
    delete req.session.data.paymentEmptyInput
    delete req.session.data.completionEmptyInput
  } else {
    res.redirect(baseErrorURL)
  }
});

router.post('/calculate-reimbursement-amount', function (req, res) {
  claimID = req.session.data.id
  var reimbursementAmount = req.session.data.reimbursementAmount
  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      claim.reimbursementAmount = reimbursementAmount
      res.redirect('process-claim/outcome?result=approve')
    }
  }
});


module.exports = router