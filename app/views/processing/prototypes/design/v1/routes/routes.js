const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, checkCriteria } = require('../helpers/helpers.js');

// v1 Prototype routes

router.get('/load-data', function (req, res) {
  //Load data from JSON files
  loadData(req);
  res.redirect('sign-in.html')
})

router.post('/check-org', function (req, res) {
  const orgID = req.session.data.orgID

  if(orgID == "123456") {
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

  if(confirmation == "yes") {
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
      if(c.evidenceOfPaymentreview.complete && c.evidenceOfCompletionreview.complete) {
        if (checkCriteria(claim)) {
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



module.exports = router