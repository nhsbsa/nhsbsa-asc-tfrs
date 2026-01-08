const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, newClaim, checkClaim, compareNINumbers, sortByCreatedDate, validateDate, checkDuplicateClaim, checkDuplicateClaimSubmission, checkLearnerForm, checkBankDetailsForm, findLearnerById, loadLearners, checkUserForm, getMostRelevantSubmission, getDraftSubmission, findPair, findUser, findCourseByCode, replaceLearnerID } = require('../_helpers/helpers.js');
const { generateClaims, transformClaims } = require('../_helpers/generate-claims.js');
const { generateLearners } = require('../_helpers/generate-learners.js');


router.use('/claims/v21/backstop', require('../_backstop/backstop-routes.js'));

// v21 Prototype routes

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
  const newTrainingCode = req.session.data.trainingSelection
  const newTrainingChoice = findCourseByCode(newTrainingCode)

  var claim = null
  if (req.session.data.id) {
    claim = req.session.data.claims.find(c => c.claimID.replace(/[-\s]+/g, '') == req.session.data.id.replace(/[-\s]+/g, '')  && (c.workplaceID == req.session.data.org.workplaceID) && (c.status == "queried" || c.status == "not-yet-submitted"));
  }

  if (claim) {
    let submission = null
    if(claim.status =="queried") {
      submission = getDraftSubmission(claim)
    } else {
      submission = getMostRelevantSubmission(claim)
    }

    // add duplicate check here
    var currentLearner = findLearnerById(submission.learnerID,req.session.data.learners)
    let isDuplicateClaim = null
    if (submission.learnerID != null) {
      isDuplicateClaim = checkDuplicateClaim(currentLearner.id, newTrainingCode, req.session.data.claims);
    }
    
    if (isDuplicateClaim && isDuplicateClaim.check) {
        res.redirect('claim/duplication?dupeID=' + isDuplicateClaim.id + '&matchType=' + isDuplicateClaim.matchType)
    } else {
      if (!(["OMMT/T1/INT","OMMT/T2/INT"].includes(submission.trainingCode)) && (["OMMT/T1/INT","OMMT/T2/INT"].includes(newTrainingChoice.code)) ) {
        submission.evidenceOfPayment = null
        submission.costDate = null
      }
      submission.trainingCode = newTrainingChoice.code
      delete req.session.data['training-input'];
      delete req.session.data['trainingSelection'];
      res.redirect('claim/claim-details' + '?id=' + claim.claimID)
    }
  } else {

    if (newTrainingChoice.fundingModel == "full") {
      delete req.session.data['training-input'];
      delete req.session.data['trainingSelection'];
      const claimID = newClaim(req, newTrainingChoice, "100")
      res.redirect('claim/claim-details' + '?id=' + claimID)
    } else {
      res.redirect('claim/split-decision')
    }

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
      req.session.data.addbankdetailsSuccess = 'true'
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
    return res.redirect('manage-claims-home?invalidIDError=true');
  }

  var foundClaim = null
  for (const c of req.session.data['claims']) {
    var removeDash = c.claimID.replace(/-/g, '')
    if ((removeDash.includes(claimID) && (req.session.data.org.workplaceID == c.workplaceID)) ) {
      foundClaim = c
    }
}

  // handle the claim id searched on won't be the one on a specific claim

  if (foundClaim == null) {
    return res.redirect('manage-claims-home?notFound=true');
  } else {
    delete req.session.data.searchClaimId
    req.session.data.fromSearchId = 'true'
    res.redirect('claim/claim-details?id=' + foundClaim.claimID);
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

router.post('/split-decision-handler', function (req, res) {
  const trainingCode = req.session.data.trainingSelection
  const trainingChoice = findCourseByCode(trainingCode)
  const choice = req.session.data.splitDecision

  if (choice == "no") {
    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];
    delete req.session.data.splitDecision;
    const claimID = newClaim(req, trainingChoice, "100")
    res.redirect('claim/claim-details' + '?id=' + claimID)
  } else if (choice == "yes") {
    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];
    delete req.session.data.splitDecision;
    const claimID = newClaim(req, trainingChoice, "60")
    res.redirect('claim/claim-details' + '?id=' + claimID)

  } else {
    res.redirect('claim/split-decision?submitError=true')
  }
});

router.post('/new-claim', function (req, res) {
  delete req.session.data['emptyError'];
  delete req.session.data['invalidIDError'];
  delete req.session.data['notFound'];
  delete req.session.data['id'];
  delete req.session.data['statusID'];
  delete req.session.data['fromSearchId'];
  delete req.session.data['fromSearchResults'];
  delete req.session.data['confirmation'];
  delete req.session.data['type'];
  

  res.redirect('claim/select-training')
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
      if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
        let submission = null
        if (c.status == "queried") {
          submission = getDraftSubmission(c)
        } else {
          submission = getMostRelevantSubmission(c)
        }
        submission.startDate = startDate
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


  const { claims, org } = req.session.data
  const workplaceID = org.workplaceID
  let claim = null
  let sixtyClaim = null

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;
    if (claimID == c.claimID && isSameWorkplace) {
      claim = c
    }
    if (claimID[claimID.length - 1] === 'C') {
      let sixtyId = claimID.slice(0, -1) + 'B'
      if (sixtyId == c.claimID && isSameWorkplace) {
        sixtyClaim = c
      }
    }
  }
  delete req.session.data.submitError

  const error = validateDate(day, month, year, "payment", claim, sixtyClaim);

  if (error.dateValid == true) {
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
        let submission = null
        if (c.status == "queried") {
          submission = getDraftSubmission(c)
        } else {
          submission = getMostRelevantSubmission(c)
        }
        submission.costDate = costDate
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

router.get('/completion-date-handler', function (req, res) {
  let claimID = req.session.data.id

  if (claimID[claimID.length - 1] === 'B') {
    claimID =  claimID.slice(0, -1) + 'C';
  }
  // claim will always be 100 or 40

  const { claims, org } = req.session.data
  const workplaceID = org.workplaceID
  let claim = null
  let sixtyClaim = null

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;
    if (claimID == c.claimID && isSameWorkplace) {
      claim = c
    }
    if (claimID[claimID.length - 1] === 'C') {
      let sixtyId = claimID.slice(0, -1) + 'B'
      if (sixtyId == c.claimID && isSameWorkplace) {
        sixtyClaim = c
      }
    }
  }

  if (claim.status == "queried") {
    submission = getDraftSubmission(claim)
  } else {
    submission = getMostRelevantSubmission(claim)
  }

  if (submission.sharedCompletionDate == null) {
    res.redirect('claim/shared-completion-date')
  } else {
    res.redirect('claim/add-completion-date')
  }

});

router.get('/remove-learner', function (req, res) {
  const claimID = req.session.data.id
  const learnerID = req.session.data.learner
  delete req.session.data.learnerConfirmation

  const { claims, org } = req.session.data
  const workplaceID = org.workplaceID
  let claim = null
  let mainClaim = null;
  let cClaim = null;

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;

    if (!isSameWorkplace) continue;

    if (c.claimID === claimID) {
      mainClaim = c;
    }

    if (c.claimID === claimID.slice(0, -1) + "C" && 
        c.claimType === "60" && 
        c.status === "approved") {
      cClaim = c;
    }
  }

  // Prefer C-claim if available
  claim = cClaim || mainClaim;

  if (claim.status == "queried") {
    submission = getDraftSubmission(claim)
  } else {
    submission = getMostRelevantSubmission(claim)
  }


  // Ensure removedLearners array exists
  submission.removedLearners = submission.removedLearners || [];

  // Find the learner being removed
  const removedLearner = submission.learners.find(
    item => item.learnerID === learnerID
  );

  // Filter out the learner
  submission.learners = submission.learners.filter(
    item => item.learnerID !== learnerID
  );

  if (!((claim.claimType == "100" || claim.claimType == "60") && claim.status == "not-yet-submitted")) {
    // If a learner was actually removed, push it into removedLearners
    if (removedLearner) {
      submission.removedLearners.push(removedLearner);
    }
  }

  req.session.data.learnerConfirmation = {
      type: "removal",
      learner: learnerID,
    }

  if (submission.learners.length > 1 || submission.removedLearners.length > 1) {
    res.redirect('claim/claim-learners')
  } else {
    res.redirect('claim/claim-details')
  }
  


});

router.get('/claim-learner-back-handler', function (req, res) {
  delete req.session.data.learnerConfirmation
  res.redirect('claim/claim-details');
});

router.get('/readd-learner', function (req, res) {
  const claimID = req.session.data.id;
  const learnerID = req.session.data.learner;
  delete req.session.data.learnerConfirmation

  const { claims, org } = req.session.data;
  const workplaceID = org.workplaceID;
  let claim = null;
  let mainClaim = null;
  let cClaim = null;

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;
    if (!isSameWorkplace) continue;

    if (c.claimID === claimID) {
      mainClaim = c;
    }

    if (
      c.claimID === claimID.slice(0, -1) + "C" &&
      c.claimType === "60" &&
      c.status === "approved"
    ) {
      cClaim = c;
    }
  }

  // Prefer C-claim if available
  claim = cClaim || mainClaim;

  let submission;
  if (claim.status == "queried") {
    submission = getDraftSubmission(claim);
  } else {
    submission = getMostRelevantSubmission(claim);
  }

  // Ensure removedLearners array exists
  submission.removedLearners = submission.removedLearners || [];

  // Find the learner being re-added
  const learnerToReadd = submission.removedLearners.find(
    item => item.learnerID === learnerID
  );

  if (learnerToReadd) {
    // Remove from removedLearners
    submission.removedLearners = submission.removedLearners.filter(
      item => item.learnerID !== learnerID
    );

    // Add back to learners
    submission.learners = submission.learners || [];
    submission.learners.push(learnerToReadd);
  }

  req.session.data.learnerConfirmation = {
    type: "readd",
    learner: learnerID,
  }

  res.redirect('claim/claim-learners');
});

router.post('/shared-completion-date', function (req, res) {
  let claimID = req.session.data.id
  let response = req.session.data.sharedDate
  let change = req.session.data.change
  delete req.session.data.submitError

  if (claimID[claimID.length - 1] === 'B') {
    claimID =  claimID.slice(0, -1) + 'C';
  }
  // claim will always be 100 or 40

  const { claims, org } = req.session.data
  const workplaceID = org.workplaceID
  let claim = null

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;
    if (claimID == c.claimID && isSameWorkplace) {
      claim = c
    }
  }

  if (claim.status == "queried") {
    submission = getDraftSubmission(claim)
  } else {
    submission = getMostRelevantSubmission(claim)
  }

  if (response != null) {
    switch(response) {
      case "yes":
        submission.sharedCompletionDate = true
        break;
      case "no":
        submission.sharedCompletionDate = false
        break;
    }
    

    if ((change == "true" && response != "yes")) {
      delete req.session.data.sharedDate
      delete req.session.data.change
      res.redirect('claim/claim-learners')
    } else {
      delete req.session.data.sharedDate
      delete req.session.data.change
      res.redirect('claim/add-completion-date')
    }

  } else {
    req.session.data.submitError = true
    res.redirect('claim/shared-completion-date')
  }

  

});

router.post('/completion-date', function (req, res) {
  const day = req.session.data['completion-date-started-day']
  const month = req.session.data['completion-date-started-month']
  const year = req.session.data['completion-date-started-year']
  const learnerID = req.session.data.learnerID
  let claimID = req.session.data.id
  const completionDate = new Date(year, month - 1, day)
  delete req.session.data.learnerConfirmation

  if (claimID[claimID.length - 1] === 'B') {
    claimID =  claimID.slice(0, -1) + 'C';
  }
  // claim will always be 100 or 40

  const { claims, org } = req.session.data
  const workplaceID = org.workplaceID
  let claim = null
  let sixtyClaim = null

  for (const c of claims) {
    const isSameWorkplace = c.workplaceID === workplaceID;
    if (claimID == c.claimID && isSameWorkplace) {
      claim = c
    }
    if (claimID[claimID.length - 1] === 'C') {
      let sixtyId = claimID.slice(0, -1) + 'B'
      if (sixtyId == c.claimID && isSameWorkplace) {
        sixtyClaim = c
      }
    }
  }
  delete req.session.data.submitError

  const error = validateDate(day, month, year, "completion", claim, sixtyClaim);

  if (error.dateValid == true) {
    if (claim.status == "queried") {
      submission = getDraftSubmission(claim)
    } else {
      submission = getMostRelevantSubmission(claim)
    }

    for (const learner of submission.learners) {
      if (submission.sharedCompletionDate || learner.learnerID == learnerID) {
          learner.completionDate = completionDate
      }
    }

    delete req.session.data['completion-date-started-day'];
    delete req.session.data['completion-date-started-month'];
    delete req.session.data['completion-date-started-year'];
    if (submission.sharedCompletionDate ) {
      delete req.session.data.learnerID
      req.session.data.learnerConfirmation = {
        type: "date",
        allLearners: true,
      }
      res.redirect('claim/claim-learners')
    } else {
      if (submission.learners.length > 1) {
          req.session.data.learnerConfirmation = {
            type: "date",
            learner: learnerID,
          }
        res.redirect('claim/claim-learners')
      } else {
        res.redirect('claim/claim-details#completion')
      }
    }
  } else {
    req.session.data.submitError = error
    res.redirect('claim/add-completion-date')
  }
});

router.post('/add-learner', function (req, res) {
  var claimID = req.session.data.id
  var newLearner = findLearnerById(req.session.data.learnerSelection, req.session.data.learners)
  var change = req.session.data.change
  var changeLearnerID = req.session.data.changeID

  delete req.session.data.change
  delete req.session.data.changeID
  delete req.session.data.existingLearner
  delete req.session.data.learnerInput;
  delete req.session.data.learnerSelection;
  delete req.session.data.submitError
  delete req.session.data.inClaim
  delete req.session.data.familyName
  delete req.session.data.givenName
  delete req.session.data.jobTitle
  delete req.session.data.nationalInsuranceNumber
  delete req.session.data.learnerConfirmation

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
      let currentSubmission = null
      let isDuplicateClaim = null

      if (c.status == "queried") {
        currentSubmission = getDraftSubmission(c)
      } else {
        currentSubmission = getMostRelevantSubmission(c)
      }

      isDuplicateClaim = checkDuplicateClaim(newLearner.id, currentSubmission.trainingCode, req.session.data.claims);

      if (isDuplicateClaim.check) {
        res.redirect('claim/duplication?dupeID=' + isDuplicateClaim.id + '&matchType=' + isDuplicateClaim.matchType)
      } else {
        const learner = {
            "learnerID": newLearner.id,
            "completionDate": null,
            "evidenceOfCompletion": null,
            "evidenceOfCompletionReview": {
              "outcome": null,
              "note": null
            }
          }
        if (currentSubmission.learners == null || currentSubmission.learners == []) {
          currentSubmission.learners = [learner]
          res.redirect('claim/add-another-learner')
        } else if (currentSubmission.learners != [] && change == "true") {
          currentSubmission.learners = replaceLearnerID(currentSubmission.learners, changeLearnerID, newLearner.id)
          if (currentSubmission.learners.length > 1) {
            req.session.data.learnerConfirmation = {
                type: "learner",
                learner: newLearner.id,
              }
              res.redirect('claim/claim-learners')
          } else {
              res.redirect('claim/add-another-learner')
          }
          
        } else {
            currentSubmission.learners.push(learner);
            if (currentSubmission.learners.length > 1) {
              req.session.data.learnerConfirmation = {
                type: "learner",
                learner: newLearner.id,
              }
                res.redirect('claim/claim-learners')
            } else {
                res.redirect('claim/add-another-learner')
            }
        }

      }

    }
  }
});

router.post('/add-another-learner', function (req, res) {
  const choice = req.session.data.anotherlearner

  if (choice == "no") {
    delete req.session.data.anotherlearner;
    res.redirect('claim/claim-details#learner')
  } else if (choice == "yes") {
    delete req.session.data.anotherlearner;
    res.redirect('claim/select-learner')
  } else {
    res.redirect('claim/add-another-learner?submitError=true')
  }
});

router.get('/mark-as-actioned', function (req, res) {
  const learnerID = req.session.data.learnerID
  const claimID = req.session.data.id 

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && (c.workplaceID == req.session.data.org.workplaceID)) {
      let submission = null
      if (c.status == "queried") {
        submission = getDraftSubmission(c)
      } else {
        submission = getMostRelevantSubmission(c)
      }
      for (const learner of submission.learners) {
        if (learner.learnerID == learnerID) {
            learner.actioned = true
          break;
        }
      }
      break;
    }
  }

  req.session.data.learnerConfirmation = {
    type: "actioned",
    learner: learnerID,
  }
    res.redirect('claim/claim-learners')
});

router.get('/mark-as-needs-action', function (req, res) {
  const learnerID = req.session.data.learnerID
  const claimID = req.session.data.id 

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && (c.workplaceID == req.session.data.org.workplaceID)) {
      let submission = null
      if (c.status == "queried") {
        submission = getDraftSubmission(c)
      } else {
        submission = getMostRelevantSubmission(c)
      }
      for (const learner of submission.learners) {
        if (learner.learnerID == learnerID) {
            delete learner.actioned
          break;
        }
      }
      break;
    }
  }

  req.session.data.learnerConfirmation = {
    type: "needsaction",
    learner: learnerID,
  }
    res.redirect('claim/claim-learners')
});

router.post('/add-evidence', function (req, res) {
  delete req.session.data.deleteSuccess
  var type = req.session.data.type
  var claimID = req.session.data.id 
  const learnerID = req.session.data.learnerID

  if (claimID[claimID.length - 1] === 'B' && type == 'completion') {
    claimID =  claimID.slice(0, -1) + 'C';
  }

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && (c.workplaceID == req.session.data.org.workplaceID)) {
      let submission = null
      if (c.status == "queried") {
        submission = getDraftSubmission(c)
      } else {
        submission = getMostRelevantSubmission(c)
      }
      if (type == 'payment') {
        if (submission.evidenceOfPayment == null) {
            submission.evidenceOfPayment = ['invoice1.pdf']
        } else {
          submission.evidenceOfPayment.push('invoice' + (submission.evidenceOfPayment.length + 1) + '.pdf')
        }
      } else if (type == 'completion') {
        for (const learner of submission.learners) {
          if (learner.learnerID == learnerID) {
              learner.evidenceOfCompletion = ('certificate_training.pdf')
          }
        }
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
    if (submission.learners.length > 1) {
        req.session.data.learnerConfirmation = {
          type: "evidence",
          learner: learnerID,
        }
        res.redirect('claim/claim-learners')
      } else {
        res.redirect('claim/claim-details#completion')
      }
  }
})

router.post('/evidence-add-another-handler', function (req, res) {
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
      let submission = null
      if (c.status == "queried") {
          submission = getDraftSubmission(c)
      } else {
          submission = getMostRelevantSubmission(c)
      }
      if (type == 'payment') {
        submission.evidenceOfPayment.pop()
        paymentCount = submission.evidenceOfPayment.length
      } else if (type == 'completion') {
        submission.evidenceOfCompletion.pop()
        completionCount = submission.evidenceOfCompletion.length
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

router.get('/save-claim', function (req, res) {
  const claimID = req.session.data.id
  var status
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && (c.workplaceID == req.session.data.org.workplaceID) ) {
      status = c.status
      break;
    }
  }
  req.session.data.claims = sortByCreatedDate(req.session.data.claims);

  delete req.session.data.id
  delete req.session.data.submitError
  delete req.session.data.learnerConfirmation
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

  res.redirect('manage-claims?statusID=' + status)

});

router.get('/ready-to-declare', function (req, res) {
  let claimID = req.session.data.id
  let claim = {}

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
      claim = c
    }
  }

  if (claim.claimType == "60" && claim.status == "approved") {
    claimID =  claimID.slice(0, -1) + 'C';
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
        claim = c
      }
    }
  }

  let submission = null
    if (claim.status == "queried") {
        submission = getDraftSubmission(claim)
    } else {
        submission = getMostRelevantSubmission(claim)
    }

  let isDuplicateClaim = checkDuplicateClaimSubmission(submission.learnerID, submission.trainingCode, claim.claimID, req.session.data.claims);
  const FYdate = new Date('2024-03-03')

  if (isDuplicateClaim.check) {
    res.redirect('claim/duplication?dupeID=' + isDuplicateClaim.id + '&matchType=' + isDuplicateClaim.matchType)
  } else {
    const submitError = checkClaim(claim)
    if (submitError.claimValid) {
      delete req.session.data.submitError
      if (req.session.data.org.bankDetails == null) {
        res.redirect('claim/missing-bank-details')
      } else if (req.session.data.org.validGDL == false &&  new Date(submission.costDate) > FYdate) {
        res.redirect('claim/missing-gdl')
      } else{
        res.redirect('claim/declaration')
      }
      
    } else {
      req.session.data.submitError = submitError
      res.redirect('claim/claim-details' + '?id=' + claimID)
    }
  }


});

router.post('/submit-claim', function (req, res) {
  const claimID = req.session.data.id
  const d = new Date()
  const dStr = d.toISOString();

  let hundredClaim = null

  let sixtyClaim = null
  let fourtyClaim = null

  if (req.session.data.confirmation == null) {
    res.redirect('claim/declaration?submitError=true')
  } else {
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID && (c.workplaceID == req.session.data.org.workplaceID)) {
        if (c.claimType == "100") {
          hundredClaim = c
        } else if (c.claimType == "60") {
          sixtyClaim = c
        } else if (c.claimType == "40") {
          fourtyClaim = c
        }
      }
    }

    if (sixtyClaim) {
      fourtyClaim = findPair(sixtyClaim.claimID, req.session.data.claims)
    } else if (fourtyClaim) {
      sixtyClaim = findPair(fourtyClaim.claimID, req.session.data.claims)
    }

    let submission = null

    if (hundredClaim && hundredClaim.status == "queried") {
      submission = getDraftSubmission(hundredClaim)
      hundredClaim.status = 'submitted'
    } else if (hundredClaim) {
      submission = getMostRelevantSubmission(hundredClaim)
      hundredClaim.status = 'submitted'
    }

    if (sixtyClaim && fourtyClaim == null) {
      if (sixtyClaim.status == "queried") {
        submission = getDraftSubmission(sixtyClaim)
        sixtyClaim.status = 'submitted'
      } else {
        submission = getMostRelevantSubmission(sixtyClaim)
        sixtyClaim.status = 'submitted'
      }
    }

    if (fourtyClaim) {
      if (fourtyClaim.status == "queried") {
        submission = getDraftSubmission(fourtyClaim)
        fourtyClaim.status = 'submitted'
      } else {
        submission = getMostRelevantSubmission(fourtyClaim)
        fourtyClaim.status = 'submitted'
      }
    }


    submission.submittedDate = dStr
    let org = req.session.data.org
    submission.submitter = org.signatory.active.email
    delete req.session.data.submitError
    delete req.session.data.confirmation
    res.redirect('claim/confirmation')


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
  delete req.session.data['declarationSubmitError']
  delete req.session.data['learnerID'];
  delete req.session.data['learnerConfirmation'];

  let claim = null
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
      claim = c
    }
  }

  if (claim.claimType == "60" && claim.status == "approved") {
    claimID =  claimID.slice(0, -1) + 'C';
    for (const c of req.session.data.claims) {
      if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
        claim = c
      }
    }
  }

  let submission = null
  if (claim.status == "queried") {
    submission = getDraftSubmission(claim)
  } else {
    submission = getMostRelevantSubmission(claim)
  }

  if (req.session.data.learner == "true" && submission.learners.length > 1) {
    delete req.session.data.learner
    res.redirect('claim/claim-learners')
  } else {
    res.redirect('claim/claim-details' + '?id=' + claimID)
  }
  

});

router.post('/create-learner', function (req, res) {
  var claimID = req.session.data.id
  delete req.session.data.existingLearner
  delete req.session.data.submitError
  const nationalInsuranceNumber = req.session.data.nationalInsuranceNumber
  const familyName = req.session.data.familyName
  const givenName = req.session.data.givenName
  const jobTitle = req.session.data.jobTitle

  var change = req.session.data.change
  var changeLearnerID = req.session.data.changeID

  delete req.session.data.change
  delete req.session.data.changeID

  const learners = loadLearners(req.session.data.learners)

  const submitError = checkLearnerForm(nationalInsuranceNumber, familyName, givenName, jobTitle)
  const dupeLearner = compareNINumbers(req.session.data.nationalInsuranceNumber, learners)

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
        if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
          let submission = null
          if (c.status == "queried") {
            submission = getDraftSubmission(c)
          } else {
            submission = getMostRelevantSubmission(c)
          }
          const submissionLearner = {
            "learnerID": learner.id,
            "completionDate": null,
            "evidenceOfCompletion": null,
            "evidenceOfCompletionReview": {
              "outcome": null,
              "note": null
            }
          }
          delete req.session.data.inClaim
          delete req.session.data.familyName
          delete req.session.data.givenName
          delete req.session.data.jobTitle
          delete req.session.data.nationalInsuranceNumber
          delete req.session.data.learnerInput
        if (submission.learners == null || submission.learners == []) {
          submission.learners = [submissionLearner]
          res.redirect('claim/claim-details?id=' + claimID + '#learner')
        } else if (submission.learners != [] && change == "true") {
          submission.learners = replaceLearnerID(submission.learners, changeLearnerID, learner.id)
          if (submission.learners.length > 1) {
            req.session.data.learnerConfirmation = {
                type: "learner",
                learner: learner.id,
              }
              res.redirect('claim/claim-learners')
          } else {
              res.redirect('claim/claim-details?id=' + claimID + '#learner')
          }
          
        } else {
            submission.learners.push(submissionLearner);
            if (submission.learners.length > 1) {
              req.session.data.learnerConfirmation = {
                type: "learner",
                learner: learner.id,
              }
                res.redirect('claim/claim-learners')
            } else {
                res.redirect('claim/claim-details?id=' + claimID + '#learner')
            }
        }
        }
      }

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
    req.session.data.org.validGDL = true
    if (req.session.data.org.bankDetails == null) {
      res.redirect('account-setup/bank-details-question')
    } else {
      res.redirect('manage-claims-home?tabLocation=claims')
    }
  } else {
    req.session.data.declarationSubmitError = 'true'
    res.redirect('account-setup/declaration?declarationSubmitError=true')
  }
});

router.post('/new-declaration-confirmation', function (req, res) {
  delete req.session.data.declarationSubmitError
  const declarationConfirmed = req.session.data.declaration

  if (declarationConfirmed != null) {
    delete req.session.data.declarationConfirmed
    req.session.data.org.validGDL = true
    res.redirect('manage-claims-home?tabLocation=claims')
  } else {
    req.session.data.declarationSubmitError = 'true'
    res.redirect('account-setup/sign-new-gdl')
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

  const submitError = checkUserForm(familyName, givenName, email, req.session.data.org)

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

  

  if (confirmationChecked != null) {
    const user = {
        familyName: familyName,
        givenName: givenName,
        email: email,
    };
    req.session.data.org.users.invited.push(user)
    delete req.session.data.familyName
    delete req.session.data.givenName
    delete req.session.data.email
    delete req.session.data.deleteSuccess
    delete req.session.data.deletedUser
    req.session.data.matchResendUser = findUser(email,req.session.data.org)
    req.session.data.invite = 'success'
    res.redirect('org-admin/manage-team?tabLocation=users')
  } else {
    req.session.data.checkBoxSubmitError = 'true'
    res.redirect('org-admin/confirm-user-details')
  }
});

router.get('/reinvite-user', function (req, res) {
  req.session.data.invite = "success"

  req.session.data.matchResendUser = findUser(req.session.data.email,req.session.data.org)

  if (req.session.data.resendList) {
    req.session.data.resendList.push(req.session.data.email)
  } else {
    req.session.data.resendList = [req.session.data.email]
  }

  delete req.session.data.email
  res.redirect('org-admin/manage-team?tabLocation=users')

});

router.get('/confirm-delete-user', function (req, res) {
  const deletedEmail = req.session.data.deletedEmail
  let query = null

  let index = req.session.data.org.users.invited.findIndex(obj => obj['email'] === deletedEmail);
  if (index !== -1) {
    req.session.data.org.users.inactive.push(req.session.data.org.users.invited[index]);
    req.session.data.org.users.invited.splice(index, 1);
    query = 'invited'
  }
  
  index = req.session.data.org.users.active.findIndex(obj => obj['email'] === deletedEmail);
  if (index !== -1) {
    req.session.data.org.users.inactive.push(req.session.data.org.users.active[index]);
    req.session.data.org.users.active.splice(index, 1);
    query = 'active'
  }

  delete req.session.data.invite
  delete req.session.data.deletedEmail

  req.session.data.matchDeletedUser = findUser(deletedEmail,req.session.data.org)
  req.session.data.deletedUser = query
  req.session.data.deleteSuccess = 'true'

  res.redirect('org-admin/manage-team?tabLocation=users')
});

router.get('/showComparisonNote', function (req, res) {
  req.session.data['showNote'] = req.session.data['noteType']
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.org.workplaceID)) {
      res.redirect('claim/previousSubmissionsTable?subCount=' + subCount + '&id=' + claimID)
    }
  }
});

router.get('/hideComparisonNote', function (req, res) {
  req.session.data['showNote'] = null
  req.session.data['noteType'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.org.workplaceID)) {
      res.redirect('claim/previousSubmissionsTable' + '?id=' + claimID)
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
          req.session.data.deleteSuccess = "true"
          req.session.data.deletedID = claimID
          req.session.data.currentPage = "1"
          res.redirect('manage-claims?statusID=not-yet-submitted')
        }
        
    }
  }
});

router.get('/signin-handler', function (req, res) {
  const journey = req.session.data.journey
  const userType = req.session.data.userType
  const org = req.session.data.org

  if (journey == 'creation' && userType == 'signatory') {
      res.redirect('account-setup/verify-details')
  } else {
    if (org.validGDL || userType == 'submitter') {
      res.redirect('manage-claims-home?tabLocation=claims')
    } else {
      res.redirect('account-setup/sign-new-gdl')
    }
  } 
});

router.get('/from-learners-submission', function (req, res) {
  claimID = req.session.data.id
  var foundClaim = null
  for (const claim of req.session.data['claims']) {
    if (claim.claimID == claimID) {
      foundClaim = claim
    }
  }
  var filter = req.session.data.sort
  res.redirect('claim/previousSubmissionsTable' + '?id=' + claimID + "&filter=" + filter)
});

router.get('/showPaymentNote', function (req, res) {
  req.session.data['showNote'] = true
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.org.workplaceID)) {
      res.redirect('claims/v21/claim/previousSubmissionsTable?subCount=' + subCount + '&id=' + claimID + "#claimDetails")
    }
  }
});

router.get('/hidePaymentNote', function (req, res) {
  req.session.data['showNote'] = null
  req.session.data['noteType'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.org.workplaceID)) {
      res.redirect('claims/v21/claim/previousSubmissionsTable' + '?id=' + claimID + "#claimDetails")
    }
  }
});


router.get('/showLearnerNote', function (req, res) {
  req.session.data['showLearnerNote'] = true
  let subCount = req.session.data['count']
  var claimID = req.session.data.id
  for (const c of req.session.data.claims ) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.org.workplaceID)) {
      res.redirect('claims/v21/claim/learnerSubmissionsTable?subCount=' + subCount + '&id=' + claimID + "#" + req.session.data.slotID)
    }
  }
});

router.get('/hideLearnerNote', function (req, res) {
  req.session.data['showLearnerNote'] = null
  req.session.data['submissionDate'] = null
  req.session.data['submittedDate'] = null
  var claimID = req.session.data.id
  var foundClaim = null
  for (const c of req.session.data.claims) {
    if (claimID.replace(/[-\s]+/g, '') == c.claimID.replace(/[-\s]+/g, '') && (c.workplaceID == req.session.data.orgID)) {
      foundClaim = c
    }
  }
  req.session.data.claimScreen = "learnerPreviousSubmissions"
  res.redirect('claims/v21/claim/learnerSubmissionsTable' + '?id=' + claimID + "#" + req.session.data.slotID)
});

router.post('/add-supporting-note', function (req, res) {
  var note = req.session.data.supportingNote
  var claimID = req.session.data.id

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID && c.workplaceID == req.session.data.org.workplaceID) {
      let submission = null
      if (c.status == "queried") {
        submission = getDraftSubmission(c)
      } else {
        submission = getMostRelevantSubmission(c)
      }
      submission.supportingNote = note
      break;
    }
  }
  delete req.session.data.supportingNote
  res.redirect('claim/claim-details'+'?id='+claimID+'#notes')
});

router.get('/applySubmissionsSort', function (req, res) {
  var claimID = req.session.data.id
  var filter = req.session.data.sort
  res.redirect('claims/v21/claim/previousSubmissionsTable' + '?id=' + claimID + "&filter=" + filter)
});

router.get('/applyLearnerSort', function (req, res) {
  var claimID = req.session.data.id
  var filter = req.session.data.sort
  res.redirect('claims/v21/claim/learnerSubmissionsTable' + '?id=' + claimID + "&filter=" + filter)
});

router.get('/learner-previous-submissions-handler', function (req, res) {

  claimID = req.session.data.id
  var foundClaim = null
  for (const claim of req.session.data['claims']) {
    if (claim.claimID == claimID) {
      foundClaim = claim
    }
  }
  res.redirect('claim/learnerSubmissionsTable' + '?id=' + claimID )
});

router.get('/view-previous-submissions-back-handler', function (req, res) {
  
  claimID = req.session.data.id
  res.redirect('claim/previousSubmissionsTable' + '?id=' + claimID )

});

router.post('/load-data', function (req, res) {
  const orgID = req.session.data['orgID']
  loadData(req, orgID);
  delete req.session.data['orgID']

  res.redirect('before-you-start.html')
})

router.get('/load-data-account-test', function (req, res) {
  const orgID = req.session.data['orgID']
  loadData(req, orgID);
  delete req.session.data['orgID']

  req.session.data.journey = "creation"
  res.redirect('./authentication/creation-link')
})

//generate data
router.get('/generate', function (req, res) {
  //generate learners to be used in claims, some claims require pre-set leaners that always exist so overwrite learners with caution
  //generateLearners(50);
  let claims = []
  const organisations = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/organisations.json', 'utf8'));
  for (const org of organisations) {
    if (org.numberOfClaims >0) {
      claims = claims.concat(generateClaims(org.workplaceID));
    }
  }
  // Write data to claims.json
  const jsonFilePath = './app/views/claims/v21/_data/claims.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(claims, null, 2));

  // transform pre-set claims
  // this was only needed to transform non multi learner claims to multi leaner claims
  //const presetClaims = transformClaims()
  //const presetjsonFilePath = './app/views/claims/v21/_data/pre-set-claims.json';
  //fs.writeFileSync(presetjsonFilePath, JSON.stringify(presetClaims, null, 2));

  res.redirect('../../')
})

module.exports = router