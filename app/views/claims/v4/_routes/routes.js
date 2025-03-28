const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { loadJSONFromFile } = require('../_helpers/JSONfileloaders.js');

// V4 Prototype routes

router.post('/add-training', function (req, res) {
    var trainingCode = req.session.data['training-selection']
    
    for (const t of req.session.data['training']) {
        if (trainingCode == t.code) {
            var training = t
        }
    }
    
    req.session.data['trainingChoice'] = training

    res.redirect('./new-claim/activity-profile')
});

router.post('/select-learner', function (req, res) {
    var learnerID = req.session.data['learner-selection']
    
    for (const l of req.session.data['learners']) {
        if (learnerID == l.id) {
            var learner = l
        }
    }

    req.session.data['learnerSelected'] = learner
    
    res.redirect('./new-claim/learner-profile')
});

router.post('/add-learner', function (req, res) {

    if (req.session.data.learnersSelected){
        req.session.data['learnersSelected'].push(req.session.data['learnerSelected'])
    } else {
        req.session.data['learnersSelected'] = [req.session.data['learnerSelected']]
    }

    res.redirect('./new-claim/learner-summary')
});

router.post('/evidence-for-claims', function (req, res) {
   

    res.redirect('./evidence/check-your-evidence-claims')
});

router.post('/add-more-learners-answer', function (req, res) {
    var addAnother = req.session.data['add-another']
    

    if (addAnother == "Yes"){
        // Send user to learner search page
        req.session.data['learner-input'] = ""
        res.redirect('./new-claim/select-learner')
      } else if (addAnother == "No") {
        // Send user to check your answers
        res.redirect('./new-claim/check-your-answers')
      }
    
});

router.post('/evidence-in-claim-process', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = true

    res.redirect('./evidence/evidence-type')


});

router.post('/evidence-choice', function (req, res) {
    var evidenceType = req.session.data['evidenceType']
    

    if (evidenceType == "payment"){
        // Send user to actual amount page
        req.session.data['search-input'] = ""
        res.redirect('./evidence/actual-amount')
      } else {
        // Send user to file upload page
        res.redirect('./evidence/upload')
      }

});

router.post('/update-session-data', (req, res) => {
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

  router.post('/create-claims', (req, res) => {

    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    for (const learner of req.session.data.learnersSelected) { 
    let selectedTraining = null

    for (const trainingItem of req.session.data.training){
        if ( trainingItem.code == req.session.data.trainingChoice.code) {
            selectedTraining = trainingItem
        }
    }

    const claim = {
        claimID: ("2").concat(learner.id),
        learner: learner,
        training: selectedTraining,
        startDate: null,
        startDateStr: (req.session.data['activity-date-started-day']).concat(" ", months[req.session.data['activity-date-started-month']-1] , " ", req.session.data['activity-date-started-year'] ),
        status: "incomplete",
        createdDate: null,
        createdDateStr: null,
        createdBy: null,
        submittedDate: null,
        submittedDateStr: null,
        paidDate: null,
        paidDateStr: null,
        evidenceOfPayment: null,
        evidenceOfEnrollment: null,
        evidenceOfCompletion: null,
      };

      req.session.data.claims.push(claim)

    }

    res.redirect('./new-claim/confirmation')
    
  });

  
router.post('/claims-choice', function (req, res) {
    let claims = []

    for (const claim of req.session.data.selectedClaims) { 
        for ( const claimItem of req.session.data.claims) {
            if (claim == claimItem.claimID) {
                claims.push(claimItem)
            }
        }
    }
    req.session.data.selectedClaimsConfirmed = claims
    res.redirect('./evidence/check-your-evidence-claims')
});

router.post('/new-claim-reset', function (req, res) {
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

    res.redirect('./new-claim/select-training.html')
});

router.post('/new-evidence-reset', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = false;
    delete req.session.data['evidenceType'];
    delete req.session.data['search-input'];
    delete req.session.data['totalAmount'];
    delete req.session.data['EvidenceNoLearners'];
    delete req.session.data['evidenceFile'];
    delete req.session.data['claimSearch'];
    delete req.session.data['selectedClaims'];
    delete req.session.data['selectedClaimsConfirmed'];

    res.redirect('./evidence/evidence-type')
});

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/views/claims/v4/_data/'
  
    var learnersFile = 'learners.json'
    var trainingFile = 'training.json'
    var claimsFile = 'claims.json'
  
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
  
    return console.log('data updated')
  }


router.get('/load-data', function (req, res) {
    //Load data from JSON files
    loadData(req);
    res.redirect('./before-you-start.html')
  })


module.exports = router