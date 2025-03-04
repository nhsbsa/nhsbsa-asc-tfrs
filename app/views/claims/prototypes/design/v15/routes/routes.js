const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { checkClaim, compareNINumbers, sortByCreatedDate, generateUniqueID, validateDate, checkDuplicateClaim, checkLearnerForm, checkBankDetailsForm, loadJSONFromFile, checkUserForm } = require('../helpers/helpers.js');
const { generateClaims } = require('../helpers/generate-claims.js');
const { generateLearners } = require('../helpers/generate-learners.js');

// v15 Prototype routes

router.post('/account-handler', function (req, res) {
  const accountAnswer = req.session.data.account
  const journey = req.session.data.journey

  if (accountAnswer == "yes") {
    if (journey == 'creation') {
      res.redirect('authentication/creation-link')
    } else {
      res.redirect('authentication/sign-in')
    }
  } else if (accountAnswer == "no") {
    res.redirect('register')
  } else if (accountAnswer == "dont-know") {
    res.redirect('register')
  }
});

router.post('/verify-details-handler', function (req, res) {
  const confirmationAnswer = req.session.data.confirmation
  delete req.session.data.confirmation
  delete req.session.data.submitError
  if (confirmationAnswer == "yes") {
    res.redirect('account-setup/job-title')
  } else if (confirmationAnswer == "no") {
    res.redirect('account-setup/account-issue')
  } else {
    res.redirect('account-setup/verify-details?submitError=true')
  }
  delete req.session.data['confirmation'];
});

router.post('/add-training', function (req, res) {
  const trainingCode = req.session.data.trainingSelection
  var trainingChoice = null
  for (const trainingGroup of req.session.data.training) {
    for (const t of trainingGroup.courses) {
      if (trainingCode == t.code) {
        trainingChoice = t
      }
    }
  }
  if (trainingChoice.fundingModel == "full") {
    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];
    const claimID = newTUClaim(req, trainingChoice, "100")
    res.redirect('claim/claim-details' + '?id=' + claimID)
  } else {
    res.redirect('claim/split-decision')
  }
});

router.post('/bank-details-handler', function (req, res) {
  const accountName = req.session.data.nameOnTheAccount
  const sortCode = req.session.data.sortCode
  const accountNumber = req.session.data.accountNumber
  const buildingSociety = req.session.data.rollNumber
  delete req.session.data.submitError
  const check = checkBankDetailsForm(accountName, sortCode, accountNumber, buildingSociety)

  if (check.bankDetailsValid) {
    const bankDetails = {
      nameOnAccount: accountName,
      sortCode: sortCode,
      accountNumber: accountNumber,
      rollNumber: buildingSociety
    }
    
    req.session.data.org.bankDetails = bankDetails

    delete req.session.data.nameOnTheAccount
    delete req.session.data.sortCode
    delete req.session.data.accountNumber
    delete req.session.data.rollNumber

    if (req.session.data.journey == 'signin') {
      res.redirect('org-admin/bank-details?tabLocation=bankDetails')
    } else {
      req.session.data.journey = 'signin'
      res.redirect('manage-claims-home?tabLocation=claims')
    }
    
  } else {
    req.session.data.submitError = check
    res.redirect('org-admin/change-bank-details')
  }
});

router.post('/search_id_result', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  delete req.session.data['fromSearchId'];
  delete req.session.data['fromSearchResults'];
  delete req.session.data['deleteSuccess'];

  var claimID = req.session.data.searchClaimId.replace(/[-\s]+/g, '');

  const emptyRegex = /\S/;
  if (!emptyRegex.test(claimID)) {
    return res.redirect('manage-claims-home?emptyError=true');
  }

  const letterORegex = /o/i;
  if (letterORegex.test(claimID)) {
    return res.redirect('manage-claims-home?invalidIDError=true');
  }

  const lengthRegex = /^[A-NP-Z0-9]{3}(-)?[A-NP-Z0-9]{4}(-)?[A-NP-Z0-9]{4}(-)?([ABC])?$/;
  if (!lengthRegex.test(claimID)) {
    return res.redirect('manage-claims-home?searchId='+claimID + '&invalidIDError=true');
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    var removeDash = c.claimID.replace(/-/g, '')
    if (removeDash.includes(claimID)) {
      foundClaim = c
    }
}

  // handle the claim id searched on won't be the one on a specific claim

  if (foundClaim == null) {
    return res.redirect('manage-claims-home?searchId='+claimID + '&notFound=true');
  } else {
    res.redirect('claim/claim-details?id=' + claimID +"&fromSearchId=true");
  }
});

router.post('/advanced-search-handler', function (req, res) {
  delete req.session.data['noInputs'];
  delete req.session.data['notFound'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['emptyError'];
  delete req.session.data['fromSearchId'];
  delete req.session.data['fromSearchResults'];
  delete req.session.data['trainingSearchLengthInsufficient'];
  delete req.session.data['learnerSearchLengthInsufficient'];

  const training = req.session.data.trainingName
  const learner = req.session.data.learner

  let errorQuery = ""
  if (training == "" && learner == "") {
    errorQuery += "noInputs=true&"
  }
  if ((training != "" && training.length < 3)) {
    errorQuery += "trainingSearchLengthInsufficient=true&"
  }
  if ((learner != "" && learner.length < 3)) {
    errorQuery += "learnerSearchLengthInsufficient=true&"
  } 
  if (errorQuery == "") {
    delete req.session.data['noInputs'];
    delete req.session.data['notFound'];
    delete req.session.data['invalidIDError'];
    delete req.session.data['emptyError'];
    delete req.session.data['fromSearchId'];
    delete req.session.data['fromSearchResults'];
    delete req.session.data['trainingSearchLengthInsufficient'];
    delete req.session.data['learnerSearchLengthInsufficient'];
    
    res.redirect('claim/advanced-search?fromSearchResults=true#searchResults');
  } else {
    res.redirect('claim/advanced-search?' + errorQuery)
  }
});

router.post('/apply-filters', function (req, res) {
  const statuses = req.session.data.filterStatus
  const startDates = req.session.data.filterStartDate
  const types = req.session.data.filterType
  const search = req.session.data.search

  delete req.session.data.filterStatus
  delete req.session.data.status
  delete req.session.data.filterStartDate
  delete req.session.data.filterType

  let query = '?search=' + search
  if (statuses != null && statuses != "") {
    query += "&status="
    const statusString = statuses.join("+");
    query += statusString;
  }
  if (startDates != null && startDates != "") {
    query += '&startDate='
    const startDatesString = startDates.join("+");
    query += startDatesString;
  }
  if (types != null && types != "") {
    query += '&type='
    const typesString = types.join("+");
    query += typesString;
  }

  res.redirect('claim/search-results' + query);
});


router.post('/split-decision-handler', function (req, res) {
  const trainingCode = req.session.data.trainingSelection
  const choice = req.session.data.splitDecision

  for (const trainingGroup of req.session.data.training) {
    for (const t of trainingGroup.courses) {
      if (trainingCode == t.code) {
        var trainingChoice = t
      }
    }
  }
  if (choice == "no") {
    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];
    delete req.session.data.splitDecision;
    const claimID = newTUClaim(req, trainingChoice, "100")
    res.redirect('claim/claim-details' + '?id=' + claimID)
  } else if (choice == "yes") {
    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];
    delete req.session.data.splitDecision;

    const claimID = newTUClaim(req, trainingChoice, "60")
    res.redirect('claim/claim-details' + '?id=' + claimID)

  } else {
    res.redirect('claim/split-decision?submitError=true')
  }
});

function newTUClaim(req, input, type) {
  let claim = {};
  const d = new Date();
  const dStr = d.toISOString();
  faker.seed(req.session.data.claims.length + 1);
  if (type == "100") {
    claim = {
      claimID: generateUniqueID() + "-A",
      claimType: "100",
      fundingType: "TU",
      learner: null,
      training: input,
      startDate: null,
      status: "not-yet-submitted",
      createdDate: dStr,
      createdBy: "Test Participant",
      submittedDate: null,
      paidDate: null,
      costDate: null,
      evidenceOfPayment: [],
      evidenceOfCompletion: null,
      completionDate: null
    };
  } else if (type == "60") {
    claim = {
      claimID: generateUniqueID() + "-B",
      claimType: "60",
      fundingType: "TU",
      learner: null,
      training: input,
      startDate: null,
      status: "not-yet-submitted",
      createdDate: dStr,
      createdBy: "Test Participant",
      submittedDate: null,
      paidDate: null,
      costDate: null,
      evidenceOfPayment: [],
      evidenceOfCompletion: null,
      completionDate: null
    };
  } else if (type == "40") {
    let training = null
    let learner = null
    let startDate = null
    let costDate = null
    let evidenceOfPayment = null
    for (const c of req.session.data.claims) {
      if (input == c.claimID) {
        training = c.training
        learner = c.learner
        startDate = c.startDate
        costDate = c.costDate
        evidenceOfPayment = c.evidenceOfPayment
      }
    }
    claim = {
      claimID: input.slice(0, -1) + "C",
      claimType: "40",
      fundingType: "TU",
      learner,
      training,
      startDate,
      status: "not-yet-submitted",
      createdDate: dStr,
      createdBy: "Test Participant",
      submittedDate: null,
      paidDate: null,
      costDate,
      evidenceOfPayment,
      evidenceOfCompletion: null,
      completionDate: null
    };
  }

  req.session.data.claims.push(claim)
  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
  delete req.session.data['training-input'];
  delete req.session.data['trainingSelection'];
  delete req.session.data['activity-date-started-day'];
  delete req.session.data['activity-date-started-month'];
  delete req.session.data['activity-date-started-year'];
  delete req.session.data['payment-date-started-day'];
  delete req.session.data['payment-date-started-month'];
  delete req.session.data['payment-date-started-year'];
  delete req.session.data['completion-date-started-day'];
  delete req.session.data['completion-date-started-month'];
  delete req.session.data['completion-date-started-year'];
  delete req.session.data['learner-input'];
  delete req.session.data['learner-selection'];
  delete req.session.data['learnerSelected'];
  delete req.session.data['learner-choice'];
  delete req.session.data['add-another'];
  delete req.session.data['answers-checked'];
  delete req.session.data['evidenceType'];
  delete req.session.data['totalAmount'];
  delete req.session.data['EvidenceNoLearners'];
  delete req.session.data['evidenceFile'];
  delete req.session.data['selectedClaims'];
  delete req.session.data['selectedClaimsConfirmed'];
  delete req.session.data['activityType'];
  delete req.session.data['submitError'];
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  return claim.claimID
}

router.post('/new-claim', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  res.redirect('claim/select-training')
});

router.get('/start-40-claim', function (req, res) {
  claimID = req.session.data.id
  const newID = newTUClaim(req, claimID, "40")
  res.redirect('claim/claim-details' + '?id=' + newID)
});

router.post('/add-start-date', function (req, res) {
  const day = req.session.data['activity-date-started-day']
  const month = req.session.data['activity-date-started-month']
  const year = req.session.data['activity-date-started-year']
  const claimID = req.session.data.id

  const startDate = new Date(year, month - 1, day)
  delete req.session.data.submitError

  const error = validateDate(day, month, year, "start");
  if (error.dateValid == true) {
    delete req.session.data['activity-date-started-day'];
    delete req.session.data['activity-date-started-month'];
    delete req.session.data['activity-date-started-year'];
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
        c.startDate = startDate
      }
    }
    res.redirect('claim/claim-details' + '?id=' + claimID + '#training')

  } else {
    req.session.data.submitError = error
    res.redirect('claim/start-date')
  }
});

router.post('/cost-date', function (req, res) {
  const day = req.session.data['payment-date-started-day']
  const month = req.session.data['payment-date-started-month']
  const year = req.session.data['payment-date-started-year']
  const claimID = req.session.data.id
  const costDate = new Date(year, month - 1, day)

  delete req.session.data.submitError

  const error = validateDate(day, month, year, "payment");

  if (error.dateValid == true) {
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
        c.costDate = costDate
      }
    }
    delete req.session.data['payment-date-started-day'];
    delete req.session.data['payment-date-started-month'];
    delete req.session.data['payment-date-started-year'];
    res.redirect('claim/claim-details' + '?id=' + claimID + '#payment')
  } else {
    req.session.data.submitError = error
    res.redirect('claim/cost-date')
  }
});

router.post('/completion-date', function (req, res) {
  const day = req.session.data['completion-date-started-day']
  const month = req.session.data['completion-date-started-month']
  const year = req.session.data['completion-date-started-year']
  let claimID = req.session.data.id
  const completionDate = new Date(year, month - 1, day)

  if (claimID[claimID.length - 1] === 'B') {
    claimID =  claimID.slice(0, -1) + 'C';
  }

  delete req.session.data.submitError

  const error = validateDate(day, month, year, "completion");

  if (error.dateValid == true) {
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
        c.completionDate = completionDate
      }
    }
    delete req.session.data['completion-date-started-day'];
    delete req.session.data['completion-date-started-month'];
    delete req.session.data['completion-date-started-year'];
    res.redirect('claim/claim-details' + '?id=' + claimID + '#completion')
  } else {
    req.session.data.submitError = error
    res.redirect('claim/add-completion-date')
  }
});

router.post('/add-learner', function (req, res) {
  var claimID = req.session.data.id
  for (const l of req.session.data.learners) {
    if (req.session.data.learnerSelection == l.id) {
      var learner = l
      break;
    }
  }
  delete req.session.data.existingLearner
  delete req.session.data.learnerInput;
  delete req.session.data.learnerSelection;
  delete req.session.data.submitError
  delete req.session.data.inClaim
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.jobTitle
  delete req.session.data.nationalInsuranceNumber

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        duplicateCheck = checkDuplicateClaim(learner.id, c.training.code, req.session.data.claims);
        if (duplicateCheck.check) {
          res.redirect('claim/duplication?dupeID=' + duplicateCheck.id + '&matchType=' + duplicateCheck.matchType)
        } else {
          c.learner = learner
          res.redirect('claim/claim-details?id=' + claimID + '#learner')
        }

    }
  }
});

router.post('/add-evidence', function (req, res) {
  delete req.session.data.deleteSuccess
  var radioButtonValue = req.session.data.another
  var type = req.session.data.type
  var claimID = req.session.data.id 

  if (claimID[claimID.length - 1] === 'B' && type == 'completion') {
    claimID =  claimID.slice(0, -1) + 'C';
  }

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      let numberOfEvidence = c.evidenceOfPayment.length + 1
      if (type == 'payment') {
        c.evidenceOfPayment.push('invoice' + (c.evidenceOfPayment.length + 1) + '.pdf')
      } else if (type == 'completion') {
        c.evidenceOfCompletion.push('certificate' + (c.evidenceOfCompletion.length + 1) + '.pdf')
      }
      break;
    }
  }
  delete req.session.data.type;
  delete req.session.data.learnerID;
  delete req.session.data.submitError

  if (type == 'payment') {
    res.redirect('claim/add-evidence-edit' + '?id=' + claimID + '&type=' + type)
  } else if (type == "completion") {
    res.redirect('claim/claim-details' + '?id=' + claimID + '#' + type)
  }
})

router.post('/radioButton', function (req, res) {
  delete req.session.data.deleteSuccess
  delete req.session.data.allDeleteSuccess
  delete req.session.data.missingOption
  var type = req.session.data.type
  var claimID = req.session.data.id

  if (req.session.data.another == 'yes') {
    delete req.session.data.another
    res.redirect('claim/add-evidence' + '?id=' + claimID + '&type=' + type)
  } else if (req.session.data.another == 'no') {
    delete req.session.data.another
    res.redirect('claim/claim-details' + '?id=' + claimID + '#' + type)
  } else {
    req.session.data.missingOption = true
    res.redirect('claim/add-evidence-edit' + '?id=' + claimID + '&type=' + type)
  }
})

router.post('/remove-evidence', function (req, res) {
  var type = req.session.data.type
  var claimID = req.session.data.id
  let paymentCount = 0
  let completionCount = 0

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      if (type == 'payment') {
        c.evidenceOfPayment.pop()
        paymentCount = c.evidenceOfPayment.length
      } else if (type == 'completion') {
        c.evidenceOfCompletion.pop()
        completionCount = c.evidenceOfCompletion.length
      }
      break;
    }
  }
  delete req.session.data.learnerID;
  delete req.session.data.submitError
  delete req.session.data.deleteSuccess
  if ((type == "payment" && paymentCount == 0) || (type == "completion" && completionCount == 0)) {
    res.redirect('claim/add-evidence' + '?id=' + claimID + '&type=' + type + '&allDeleteSuccess=true')
  } else {
    res.redirect('claim/add-evidence-edit' + '?id=' + claimID + '&type=' + type + '&deleteSuccess=true')
  }
})

router.post('/save-claim', function (req, res) {
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      c.status = 'not-yet-submitted'
      break;
    }
  }
  req.session.data.claims = sortByCreatedDate(req.session.data.claims);

  delete req.session.data.id
  delete req.session.data.submitError
  delete req.session.data['completion-date-started-day'];
  delete req.session.data['completion-date-started-month'];
  delete req.session.data['completion-date-started-year'];
  delete req.session.data['payment-date-started-day'];
  delete req.session.data['payment-date-started-month'];
  delete req.session.data['payment-date-started-year'];
  delete req.session.data['activity-date-started-day'];
  delete req.session.data['activity-date-started-month'];
  delete req.session.data['activity-date-started-year'];

  req.session.data.currentPage = "1"

  res.redirect('manage-claims?statusID=not-yet-submitted')

});

router.post('/ready-to-declare', function (req, res) {
  const claimID = req.session.data.id
  let claim = {}
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      claim = c
    }
  }
  const submitError = checkClaim(claim)
  if (submitError.claimValid) {
    delete req.session.data.submitError
    if (req.session.data.org.bankDetails == null) {
      res.redirect('claim/missing-bank-details')
    } else {
      res.redirect('claim/declaration')
    }
    
  } else {
    req.session.data.submitError = submitError
    res.redirect('claim/claim-details' + '?id=' + claimID)
  }
});

router.post('/submit-claim', function (req, res) {
  const claimID = req.session.data.id
  const d = new Date()
  const dStr = d.toISOString();

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      if (req.session.data.confirmation) {
        c.status = 'submitted'
        c.submittedDate = dStr
        delete req.session.data.submitError
        req.session.data.claims = sortByCreatedDate(req.session.data.claims);
        res.redirect('claim/confirmation')
      } else {
        res.redirect('claim/declaration?submitError=true')
      }
    }
  }
});

router.get('/cancel-handler', function (req, res) {
  const claimID = req.session.data.id

  delete req.session.data['training-input'];
  delete req.session.data['trainingSelection'];
  delete req.session.data['activity-date-started-day'];
  delete req.session.data['activity-date-started-month'];
  delete req.session.data['activity-date-started-year'];
  delete req.session.data['payment-date-started-day'];
  delete req.session.data['payment-date-started-month'];
  delete req.session.data['payment-date-started-year'];
  delete req.session.data['completion-date-started-day'];
  delete req.session.data['completion-date-started-month'];
  delete req.session.data['completion-date-started-year'];
  delete req.session.data['learner-input'];
  delete req.session.data['learner-selection'];
  delete req.session.data['learnerSelected'];
  delete req.session.data['learner-choice'];
  delete req.session.data['add-another'];
  delete req.session.data['answers-checked'];
  delete req.session.data['evidenceType'];
  delete req.session.data['totalAmount'];
  delete req.session.data['EvidenceNoLearners'];
  delete req.session.data['evidenceFile'];
  delete req.session.data['selectedClaims'];
  delete req.session.data['selectedClaimsConfirmed'];
  delete req.session.data['activityType'];
  delete req.session.data['submitError'];
  delete req.session.data['deleteSuccess'];
  delete req.session.data['allDeleteSuccess'];
  delete req.session.data['errorWrongFileFormat'];
  delete req.session.data['errorFileTooBig'];
  delete req.session.data['errorFileMissing'];
  delete req.session.data['deleteError'];
  delete req.session.data['jobTitleEmptyError'];
  delete req.session.data['jobTitle'];
  delete req.session.data['jobTitleInvalid'];
  delete req.session.data['declarationSubmitError'];

  res.redirect('claim/claim-details' + '?id=' + claimID)

});

router.post('/create-learner', function (req, res) {
  var claimID = req.session.data.id
  delete req.session.data.existingLearner
  delete req.session.data.submitError
  const nationalInsuranceNumber = req.session.data.nationalInsuranceNumber
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const jobTitle = req.session.data.jobTitle

  const submitError = checkLearnerForm(nationalInsuranceNumber, familyName, givenName, jobTitle)
  const dupeLearner = compareNINumbers(req.session.data.nationalInsuranceNumber, req.session.data.learners)

  if (submitError.learnerValid) {
    if (req.session.data.inClaim == 'true' && !dupeLearner.check) {
      const learner = {
        id: nationalInsuranceNumber,
        familyName: familyName,
        givenName: givenName,
        jobTitle: jobTitle
      };
      req.session.data.learners.push(learner)

      for (const c of req.session.data.claims) {
        if (claimID == c.claimID) {
          c.learner = learner
          break;
        }
      }
      delete req.session.data.inClaim
      delete req.session.data.familyName
      delete req.session.data.givenName
      delete req.session.data.jobTitle
      delete req.session.data.nationalInsuranceNumber
      delete req.session.data.learnerInput
      
      res.redirect('claim/claim-details' + '?id=' + claimID)

    } else {
      req.session.data.learnerMatch = dupeLearner.learner
      res.redirect('learner/duplication')
    }
  } else {
    req.session.data.submitError = submitError
    res.redirect('learner/add-learner?inClaim=' + req.session.data.inClaim)
  }
});

router.post('/validate-job-title', function (req, res) {
  delete req.session.data.jobTitleEmptyError
  delete req.session.data.jobTitleInvalid
  delete req.session.data['declarationSubmitError'];
  const jobTitle = req.session.data.jobTitle
  var validCharactersRegex = /^[a-zA-Z0-9-\s]+$/;
  if (jobTitle == "") {
    res.redirect('account-setup/job-title?jobTitleEmptyError=true')
  } else if (validCharactersRegex.test(jobTitle) == true) {
    res.redirect('account-setup/declaration')
  } else {
    res.redirect('account-setup/job-title?jobTitleInvalid=true')
  }
});

router.post('/declaration-confirmation', function (req, res) {
  delete req.session.data.declarationSubmitError
  const declarationConfirmed = req.session.data.declaration
  if (declarationConfirmed != null) {
    res.redirect('account-setup/bank-details-question')
  } else {
    res.redirect('account-setup/declaration?declarationSubmitError=true')
  }
});


router.post('/bank-details-question-handler', function (req, res) {
  delete req.session.data.submitError

  const answer = req.session.data.bankDetailsQuestion

  if (answer != null) {
    if (answer == "yes") {
      res.redirect('org-admin/change-bank-details')
    } else if (answer == "no") {
      delete req.session.data.journey
      res.redirect('manage-claims-home?tabLocation=claims')
    }
  } else {
    res.redirect('account-setup/bank-details-question?submitError=true')
  }
});

router.post('/check-user', function (req, res) {
  delete req.session.data.submitError
  delete req.session.data.name
  delete req.session.data.invite
  const email = req.session.data.email
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName

  const submitError = checkUserForm(familyName, givenName, email, req.session.data.org.users)

  if (submitError.userValid) {
    res.redirect('org-admin/confirm-user-details')
  } else {
    req.session.data.submitError = submitError
    res.redirect('org-admin/user-details')
  }
});

router.post('/invite-user', function (req, res) {
  delete req.session.data.checkBoxSubmitError
  delete req.session.data.name
  delete req.session.data.invite
  
  const email = req.session.data.email
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName

  const confirmationChecked = req.session.data.confirmation

  req.session.data.resendEmail = email
  if (confirmationChecked != null) {
    const user = {
        familyName: familyName,
        givenName: givenName,
        email: email,
        type: "submitter",
        status: "pending",
        invited: new Date()
    };
    req.session.data.org.users.push(user)
    delete req.session.data.familyName
    delete req.session.data.givenName
    delete req.session.data.email
    delete req.session.data.deleteSuccess
    delete req.session.data.deletedUser
    res.redirect('org-admin/manage-team?tabLocation=users&invite=success')
  } else {
    res.redirect('org-admin/confirm-user-details?checkBoxSubmitError=true')
  }
});

router.get('/reinvite-user', function (req, res) {
  req.session.data.invite = "success"


  if (req.session.data.resendList) {
    req.session.data.resendList.push(req.session.data.name)
  } else {
    req.session.data.resendList = [req.session.data.name]
  }

  res.redirect('org-admin/manage-team?tabLocation=users')

});


router.get('/confirm-delete-user', function (req, res) {
  var query = "registered"
  for (const user of req.session.data.users) {
    if (req.session.data.deletedEmail == user.email) {
      query = user.status
      user.status = "deleted"
    }
  }
  delete req.session.data.invite
  res.redirect('org-admin/manage-team?tabLocation=users&deleteSuccess=true&deletedUser=' + query)
});

router.get('/clear-learner', function (req, res) {
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      c.learner = null
      res.redirect('claim/claim-details' + '?id=' + claimID)
    }
  }
});

router.get('/confirm-delete-claim', function (req, res) {
  var claimID = req.session.data.id
  var claims = req.session.data.claims
  var fromSearchId = req.session.data.fromSearchId
  var fromSearchResults = req.session.data.fromSearchResults

  for (let i = 0; i < claims.length; i++) {
    if (claims[i].claimID === claimID) {
        claims.splice(i, 1);
        if (fromSearchId || fromSearchResults) {
          res.redirect('manage-claims-home?&deleteSuccess=true&fromSearchId&deletedID='+ claimID)
        } else {
          res.redirect('manage-claims?deleteSuccess=true&deletedID=' + claimID)
        }
        
    }
  }
});

function loadData(req) {
  // pull in the prototype data object and see if it contains a datafile reference
  let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
  const path = 'app/views/claims/prototypes/design/v15/data/'

  var learnersFile = 'learners.json'
  var trainingFile = 'training.json'
  var claimsFile = 'claims.json'
  var statusFile = 'claim-statuses.json'

  console.log('loading in training file')
  req.session.data['training'] = loadJSONFromFile(trainingFile, path)
  console.log('training file loaded')

  console.log('loading in claims file')
  req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
  console.log('claims file loaded')

  console.log('loading in learners file')
  req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
  console.log('learners file loaded')

  console.log('loading in statuses file')
  req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
  console.log('statuses file loaded')

  return console.log('data updated')
}

router.post('/load-data', function (req, res) {

  //Load data from JSON files
  const organisations = loadJSONFromFile('organisations.json', 'app/views/claims/prototypes/design/v15/data/')
  const orgID = req.session.data['orgID']

  for (const organisation of organisations) {
    if (organisation.workplaceID == orgID) {
      
      req.session.data.org = organisation
      break;
    }
  }

  delete req.session.data['orgID']
  
  loadData(req);
  res.redirect('before-you-start.html')
})

router.get('/load-data-account-test', function (req, res) {
  //Load data from JSON files

  const organisations = loadJSONFromFile('organisations.json', 'app/views/claims/prototypes/design/v15/data/')

  for (const organisation of organisations) {
    if (organisation.workplaceID == "G76904778") {
      req.session.data.org = organisation
      break;
    }
  }

  loadData(req);
  res.redirect('./authentication/creation-link?journey=creation')
})

//generate data
router.get('/generate', function (req, res) {
  generateLearners(50);
  let claims = []
  const organisations = JSON.parse(fs.readFileSync('./app/views/claims/prototypes/design/v15/data/organisations.json', 'utf8'));
  for (const org of organisations) {
    claims = claims.concat(generateClaims(org.workplaceID));
  }
  // Write data to claims.json
  const jsonFilePath = './app/views/claims/prototypes/design/v15/data/claims.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(claims, null, 2));

  res.redirect('../')
})

module.exports = router