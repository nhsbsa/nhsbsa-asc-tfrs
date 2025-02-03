const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const { loadData, updateClaim, checkWDSFormat, signatoryCheck, validNumberCheck, isFullClaimCheck, findOrg, isValidOrgSearch } = require('../helpers/helpers.js');

// v7 Prototype routes

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
    req.session.data.submitError = 'missing'
    res.redirect('register-organisation/organisation-details')
  } else if (orgID == "timeout") {
    req.session.data.submitError = 'timeout'
    res.redirect('register-organisation/org-issue')
  } else if (orgID == "D18946931" || orgID == "resend") {
    req.session.data.submitError = 'resend'
    res.redirect('register-organisation/org-issue')
  } else if (orgID == "B02944934" || orgID == "dupe") {
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
    req.session.data.orgTab = "claims"

    delete req.session.data.claimID;

    req.session.data.id = foundClaim.claimID
    req.session.data.orgId = foundClaim.workplaceId

    return res.redirect('organisation/org-view-main')
  } else {
    return res.redirect('process-claim/start-process' + '?id=' + claimID + '&notFound=true')
  }
});

router.get('/cancel-outcome', function (req, res) {
  const claimID = req.session.data.id
  req.session.data.processClaimStep = "inProgress"
  res.redirect('organisation/org-view-main#tab-content')
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

  delete req.session.data.id
  delete req.session.data.inProgress

  req.session.data.currentPage = '1'
  req.session.data.orgTab = 'claims'

  return res.redirect('organisation/org-view-main')

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
      return res.redirect('organisation/org-view-main#tab-content')


  } else {

      return res.redirect('organisation/org-view-main'+ errorParamaters + '#tab-content')

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
  res.redirect('organisation/org-view-main#tab-content')
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
    res.redirect('organisation/org-view-main#tab-content')

  }
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

  var foundOrg = null
  for (const org of req.session.data['organisations']) {
    let searchedOrg = orgSearch.toLowerCase()
    let singleOrg = org.workplaceId.toLowerCase()
    if (singleOrg == searchedOrg) {
      foundOrg = org
      break
    } else if (org.signatory.email == searchedOrg) {
      foundOrg = org
      break
    } else {
      for (const user of org.users.active) {
        if (user.email == searchedOrg) {
          foundOrg = org
          break
        }
      }
    }
  }
  if (foundOrg == null) {
    req.session.data.error = 'notFound'
    res.redirect('organisation/find-organisation')
  } else {
    delete req.session.data.orgSearchInput
    req.session.data.orgTab = 'users'
    req.session.data.orgId = foundOrg.workplaceId
    res.redirect('organisation/org-view-main')
  }
});

router.post('/search-claim-id-orgView', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  delete req.session.data['id'];

  var claimID = req.session.data.claimID.replace(/[\s-]/g, '');
  var foundOrg = req.session.data.orgId

  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    req.session.data.emptyError = 'true';
    return res.redirect('organisation/org-view-main')
  }

  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    req.session.data.invalidIDError = 'true';
    return res.redirect('organisation/org-view-main')
  }

  const lengthRegex = /^[A-NP-Z0-9]{3}[A-NP-Z0-9]{4}[A-NP-Z0-9]{4}(A|B|C)$/i;
  if (!lengthRegex.test(claimID)) {
    req.session.data.invalidIDError = 'true';
    return res.redirect('organisation/org-view-main')
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    let searchedID = claimID.toLowerCase()
    let singleClaim = c.claimID.toLowerCase().replace(/[\s-]/g, '');
    if (searchedID == singleClaim) {
      foundClaim = c
    }
  }
  if (foundClaim == null) {
    req.session.data.notFound = 'true';
    return res.redirect('organisation/org-view-main')
  }
  if (foundClaim.status == "submitted" || foundClaim.status == "approved" || foundClaim.status == "rejected") {

    delete req.session.data.claimID;
    delete req.session.data.currentPage;

    req.session.data.processClaimStep = "inProgress"
    req.session.data.orgTab = "claims"
    req.session.data.id = foundClaim.claimID

    return res.redirect('organisation/org-view-main')
  } else {
    req.session.data.notFound = 'true';
    return res.redirect('organisation/org-view-main')
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
    req.session.data.noteError = 'true'
    res.redirect('organisation/add-org-note')

  } else {
    var currentDate = new Date().toISOString();
    var newNote = {
      "author": "Test Participant",
      "jobRole": "Processor",
      "date": currentDate,
      "note": newNoteInput
    };

    delete req.session.data.noteInput
    delete req.session.data.noteError

    foundOrg.notes.push(newNote);
    req.session.data.noteSuccess = "true"
    req.session.data.orgTab = 'orgNotes'

    // Send a response that includes JavaScript to close the tab
    res.send(`
      <html>
      <body>
          <script>
              window.opener.location.reload(); // Refresh the parent tab if needed
              window.close(); // Close the current tab
          </script>
      </body>
      </html>
  `);

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
  res.redirect('organisation/org-view-main')
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

  
  delete req.session.data.edited
  delete req.session.data.goBack

  const orgID = req.session.data.orgId
  for (const org of req.session.data['organisations']) {
    if (org.workplaceId == orgID) {
      org.signatory.givenName = givenName
      org.signatory.familyName = familyName
      org.signatory.email = email
      org.signatory.status = "invited"
    } 
  }
  req.session.data.confirmation = 'invited'
  req.session.data.orgTab = 'users'

  res.redirect('organisation/org-view-main')
});

router.get('/org-tab-handler/:tab', function (req, res) {

  const orgTab = req.params.tab

  delete req.session.data.claimID
  delete req.session.data.emptyError
  delete req.session.data.invalidIDError
  delete req.session.data.notFound
  delete req.session.data.currentPage

  req.session.data.orgTab = orgTab

  if (orgTab == 'claims') {
    req.session.data.currentPage = '1'
  }

  res.redirect('../organisation/org-view-main')
});

router.get('/claim-view-handler/:claimID', function (req, res) {

  const claimID = req.params.claimID

  delete req.session.data.currentPage

  req.session.data.orgTab = 'claims'
  req.session.data.id = claimID
  req.session.data.processClaimStep = 'inProgress'

  res.redirect('../organisation/org-view-main')
});

router.get('/back-to-start-handler', function (req, res) {

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

  delete req.session.data.id
  delete req.session.data.processClaimStep
  delete req.session.data.currentPage
  delete req.session.data.orgTab
  delete req.session.data.orgId

  delete req.session.data.result

  delete req.session.data.confirmation
  delete req.session.data.invite


  res.redirect('./home')
});

router.get('/confirm-signatory-handler', function (req, res) {

  delete req.session.data.newOrg
  delete req.session.data.orgID
  delete req.session.data.email
  delete req.session.data['answers-checked']

  req.session.data.confirmation = 'register'

  res.redirect('./home')
});


module.exports = router