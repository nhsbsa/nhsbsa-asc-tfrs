const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim } = require('../helpers/helpers.js');

// v1 Prototype routes

router.get('/load-data', function (req, res) {
  //Load data from JSON files
  loadData(req);
  res.redirect('sign-in.html')
})

router.post('/check-org', function (req, res) {
  const orgID = req.session.data.orgID

  if (orgID == "123456") {
    res.redirect('register-organisation/confirm-organisation-details?state=valid')
  } else if (orgID == "timeout") {
    res.redirect('register-organisation/confirm-organisation-details?state=timeout')
  } else if (orgID == "dupe") {
    res.redirect('register-organisation/confirm-organisation-details?state=duplicate')
  } else {
    res.redirect('register-organisation/confirm-organisation-details?state=invalid')
  }

});

router.post('/confirm-org-handler', function (req, res) {
  const confirmation = req.session.data.confirmation

  if (confirmation == "yes") {
    res.redirect('register-organisation/signatory-details')
  } else if (confirmation == "no") {
    res.redirect('register-organisation/incorrect-org-details')
  }

});

router.post('/claim-process-handler', function (req, res) {
  const claimID = req.session.data.id
  delete req.session.data.error

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      if (c.evidenceOfPaymentreview.pass != null && c.evidenceOfCompletionreview.pass != null) {
        if (c.evidenceOfPaymentreview.pass && c.evidenceOfCompletionreview.pass) {
          res.redirect('process-claim/approve')
        } else {
          res.redirect('process-claim/reject')
        }
      } else {
        req.session.data.error = true
        res.redirect('process-claim/claim')
      }

    }
  }
});

router.post('/search-claim-id', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];

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
  var newCategory = req.session.data.category
  var newNoteInput = req.session.data.noteInput
  var currentDate = new Date().toISOString();
  var newNote = {
    "author": "test participant",
    "date": currentDate,
    "category": newCategory,
    "note": newNoteInput
};
  notes.push(newNote);
  res.redirect('process-claim/claim' + '?id=' + claimID + "&noteAddedSuccess")
});

router.post('/evidence-check-handler', function (req, res) {
  const evidenceCheck = req.session.data.evidenceCheck
  const criteria = req.session.data.criteria
  const type = req.session.data.type

  delete req.session.data.submitError;

  claimID = req.session.data.id

  if (evidenceCheck != null) {
    for (const claim of req.session.data.claims) {
      if (claim.claimID == claimID) {
        if (evidenceCheck == "yes") {
          if (type == "payment") {
            claim.evidenceOfPaymentreview["criteria" + criteria].result = true
          } else if (type == "completion") {
            claim.evidenceOfCompletionreview["criteria" + criteria].result = true
          }
        } else if (evidenceCheck == "no") {
          if (type == "payment") {
            claim.evidenceOfPaymentreview["criteria" + criteria].result = false
            claim.evidenceOfPaymentreview["criteria" + criteria].note = req.session.data.note
          } else if (type == "completion") {
            claim.evidenceOfCompletionreview["criteria" + criteria].result = false
            claim.evidenceOfCompletionreview["criteria" + criteria].note = req.session.data.note
          }
        }
        updateClaim(claim)
        if ((claim.evidenceOfPaymentreview.pass != null && type == "payment") || (claim.evidenceOfCompletionreview.pass != null && type == "completion")) {
          delete req.session.data.criteria;
          delete req.session.data.evidenceCheck;
          res.redirect('process-claim/check-evidence-answers')
        } else {
          delete req.session.data.evidenceCheck;
          const nextCriteria = String(Number(criteria) + 1)
          res.redirect('process-claim/review-evidence?type=' + type + '&criteria=' + nextCriteria)
        }
      }
    }
  } else {
    res.redirect('process-claim/review-evidence?type=' + type + '&criteria=' + criteria + '&submitError=true')
  }
});


router.get('/evidence-check-start-handler', function (req, res) {
  const type = req.session.data.type
  claimID = req.session.data.id

  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      if ((claim.evidenceOfPaymentreview.pass != null && type == "payment") || (claim.evidenceOfCompletionreview.pass != null && type == "completion")) {
        delete req.session.data.criteria;
        delete req.session.data.evidenceCheck;
        res.redirect('process-claim/check-evidence-answers')
      } else {
        delete req.session.data.evidenceCheck;
        res.redirect('process-claim/review-evidence?type=' + type + '&criteria=1')
      }
    }
  }
});


router.post('/claim-process-handler', function (req, res) {
  claimID = req.session.data.id
  for (const claim of req.session.data.claims) {
    if (claim.claimID == claimID) {
      if (claim.evidenceOfPaymentreview.pass && claim.evidenceOfCompletionreview.pass) {
        res.redirect('process-claim/approve')
      } else {
        res.redirect('process-claim/reject')
      }
    }
  }

});


module.exports = router