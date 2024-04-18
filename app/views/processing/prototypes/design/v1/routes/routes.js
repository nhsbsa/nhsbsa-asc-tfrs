const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadJSONFromFile, loadData } = require('../helpers/helpers.js');

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

router.post('/search-claim-id', function (req, res) {
  delete req.session.data['invalidIDError'];
  delete req.session.data['errorType'];

  var claimID = req.session.data.claimID
  const regex = /^[A-NP-Z0-9]{3}-[A-NP-Z0-9]{4}-[A-NP-Z0-9]{4}-(A|B|C)$/;
  var validClaimId = regex.test(claimID);

  // if claim id is valid, navigate to next screen
  if (validClaimId) {
    res.redirect('process-claim/found-claim' + '?id=' + claimID + '&validClaim=true')
  }
  
  // if claim id is invalid return why
  else if (validClaimId == false) {
    var whyInvalid = whyInvalidReason(claimID)
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&invalidIDError=true' + '&errorType=' + whyInvalid)
  }
})

function whyInvalidReason(claimID) {

  // if claim id is empty
  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    return "A";
  } 
  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    return "B";
  }

  const lastChar = claimID.charAt(claimID.length - 1);
  if (lastChar !== 'A' && lastChar !== 'B' && lastChar !== 'C') {
    return "C";
  }
  return "Z";
}

module.exports = router