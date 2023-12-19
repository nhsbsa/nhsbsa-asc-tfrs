const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { loadJSONFromFile } = require('../scripts/JSONfileloaders.js');
const { faker } = require('@faker-js/faker');

// v5 Prototype routes

router.post('/v5/add-training', function (req, res) {
    var trainingCode = req.session.data['training-selection']
    
    for (const t of req.session.data['training']) {
        if (trainingCode == t.code) {
            var training = t
        }
    }
    
    req.session.data['trainingChoice'] = training

    res.redirect('../claims/prototypes/v5/new-claim/activity-profile')
});

router.post('/v5/create-date', function (req, res) {
  var day = req.session.data['activity-date-started-day']
  var month = req.session.data['activity-date-started-month']
  var year = req.session.data['activity-date-started-year']
  
  req.session.data['date'] = year.concat("-",month,"-",day,"T00:00:00.000Z")
  
  res.redirect('../claims/prototypes/v5/new-claim/select-learner')
});

router.post('/v5/select-learner', function (req, res) {
    var learnerID = req.session.data['learner-selection']
    
    for (const l of req.session.data['learners']) {
        if (learnerID == l.id) {
            var learner = l
        }
    }

    req.session.data['learnerSelected'] = learner
    
    res.redirect('../claims/prototypes/v5/new-claim/learner-profile')
});

router.post('/v5/add-learner', function (req, res) {

    if (req.session.data.learnersSelected){
        req.session.data['learnersSelected'].push(req.session.data['learnerSelected'])
    } else {
        req.session.data['learnersSelected'] = [req.session.data['learnerSelected']]
    }

    res.redirect('../claims/prototypes/v5/new-claim/learner-summary')
});

router.post('/v5/evidence-for-claims', function (req, res) {
   

    res.redirect('../claims/prototypes/v5/evidence/check-your-evidence-claims')
});

router.post('/v5/add-more-learners-answer', function (req, res) {
    var addAnother = req.session.data['add-another']
    

    if (addAnother == "Yes"){
        // Send user to learner search page
        req.session.data['learner-input'] = ""
        res.redirect('../claims/prototypes/v5/new-claim/select-learner')
      } else if (addAnother == "No") {
        // Send user to check your answers
        res.redirect('../claims/prototypes/v5/new-claim/check-your-answers')
      }
    
});

router.post('/v5/evidence-in-claim-process', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = true

    res.redirect('../claims/prototypes/v5/evidence/evidence-type')


});

router.post('/v5/evidence-choice', function (req, res) {
    var evidenceType = req.session.data['evidenceType']
    

    if (evidenceType == "payment"){
        // Send user to actual amount page
        req.session.data['search-input'] = ""
        res.redirect('../claims/prototypes/v5/evidence/actual-amount')
      } else {
        // Send user to file upload page
        res.redirect('../claims/prototypes/v5/evidence/upload')
      }

});

router.post('/v5/update-session-data', (req, res) => {
    const selectedOptions = req.body.selectedOptions; 
    // Assuming selectedOptions is sent in the request body
    req.session.data['selectedOptions'] = selectedOptions;
    const log = {
        method: req.method,
        url: req.originalUrl,
        data: req.session.data
      }
      // you can enable this in your .env file
      console.log(JSON.stringify(log, null, 2))
  });

  router.post('/v5/create-claims', (req, res) => {
    const newClaims = [];

    for (const learner of req.session.data.learnersSelected) {
    let i = 10000;
    let selectedTraining = null;
    faker.seed(i);
    i++;

    for (const trainingItem of req.session.data.training){
        if ( trainingItem.code == req.session.data.trainingChoice.code) {
            selectedTraining = trainingItem
        }
    }

    const d = new Date();
    const dStr = d.toISOString();
    const claimID = faker.finance.accountNumber(6);
    newClaims.push(claimID);

    const claim = {
        claimID: claimID,
        learner: learner,
        training: selectedTraining,
        startDate: req.session.data.date,
        status: "incomplete",
        createdDate: dStr,
        createdBy: "Testing Participant",
        submittedDate: null,
        paidDate: null,
        evidenceOfPayment: null,
        evidenceOfEnrollment: null,
        evidenceOfCompletion: null,
      };

      req.session.data.claims.push(claim)
      

    }


    req.session.data['newClaims'] = newClaims;
    res.redirect('../claims/prototypes/v5/new-claim/confirmation')
    
  });

  
router.post('/v5/claims-choice', function (req, res) {
    let claims = []

    for (const claim of req.session.data.selectedClaims) { 
        for ( const claimItem of req.session.data.claims) {
            if (claim == claimItem.claimID) {
                claims.push(claimItem)
            }
        }
    }
    req.session.data.selectedClaimsConfirmed = claims
    res.redirect('../claims/prototypes/v5/evidence/check-your-evidence-claims')
});

router.post('/v5/new-claim-reset', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = false;
    delete req.session.data['training-input'];
    delete req.session.data['training-selection'];
    delete req.session.data['trainingChoice'];
    delete req.session.data['activity-date-started-day'];
    delete req.session.data['activity-date-started-month'];
    delete req.session.data['activity-date-started-year'];
    delete req.session.data['learner-input'];
    delete req.session.data['learner-selection'];
    delete req.session.data['learnerSelected'];
    delete req.session.data['learner-choice'];
    delete req.session.data['learnersSelected'];
    delete req.session.data['add-another'];
    delete req.session.data['answers-checked'];
    delete req.session.data['evidenceType'];
    delete req.session.data['search-input'];
    delete req.session.data['totalAmount'];
    delete req.session.data['EvidenceNoLearners'];
    delete req.session.data['evidenceFile'];
    delete req.session.data['selectedClaims'];
    delete req.session.data['selectedClaimsConfirmed'];

    res.redirect('../claims/prototypes/v5/new-claim/select-training.html')
});

router.post('/v5/new-evidence-reset', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = false;
    delete req.session.data['evidenceType'];
    delete req.session.data['search-input'];
    delete req.session.data['totalAmount'];
    delete req.session.data['EvidenceNoLearners'];
    delete req.session.data['evidenceFile'];
    delete req.session.data['claimSearch'];
    delete req.session.data['selectedClaims'];
    delete req.session.data['selectedClaimsConfirmed'];

    res.redirect('../claims/prototypes/v5/evidence/evidence-type')
});

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/data/v5/'
  
    var learnersFile = 'learners.json'
    var trainingFile = 'training.json'
    var claimsFile = 'claims.json'
    var statusFile = 'claim-item-statuses.json'
  
    if (req.session.data.training) {
      console.log('training file already loaded')
    } else {
      console.log('loading in training file')
      req.session.data['training'] = loadJSONFromFile(trainingFile, path)
      console.log('training file loaded')
    }
  
    if (req.session.data.claims) {
      console.log('claims file already loaded')
    } else {
      console.log('loading in claims file')
      req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
      console.log('claims file loaded')
    }
  
    if (req.session.data.learners) {
      console.log('learners file already loaded')
    } else {
      console.log('loading in learners file')
      req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
      console.log('learners file loaded')
    }

    if (req.session.data.statuses) {
      console.log('statuses file already loaded')
    } else {
      console.log('loading in statuses file')
      req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
      console.log('statuses file loaded')
    }
  
    return console.log('data updated')
  }


router.get('/v5/load-data', function (req, res) {
    //Load data from JSON files
    loadData(req);
    res.redirect('../claims/prototypes/v5/before-you-start.html')
  })


module.exports = router