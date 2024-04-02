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
    res.redirect('confirm-organisation-details?state=timeout')
  } else if (orgID == "dupe") {
    res.redirect('confirm-organisation-details?state=duplicate')
  } else {
    res.redirect('confirm-organisation-details?state=invalid')
  }

});

module.exports = router