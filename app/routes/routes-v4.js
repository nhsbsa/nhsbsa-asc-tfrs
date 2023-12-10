const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// V4 Prototype routes

router.post('/v4/add-training', function (req, res) {
    var trainingCode = req.session.data['training-selection']
    
    for (const t of req.session.data['training']) {
        if (trainingCode == t.code) {
            var training = t
        }
    }
    
    req.session.data['trainingChoice'] = training

    res.redirect('../claims/prototypes/v4/new-claim/activity-profile')
})


router.post('/v4/add-learner', function (req, res) {
    var learnerID = req.session.data['learner-choice']
    
    for (const l of req.session.data['learners']) {
        if (learnerID == l.id) {
            var learner = l
        }
    }


    if (req.session.data.learnersSelected){
        req.session.data['learnersSelected'].push(learner)
    } else {
        req.session.data['learnersSelected'] = [learner]
    }

    res.redirect('../claims/prototypes/v4/new-claim/learner-summary')
})

router.post('/v4/evidence-for-claims', function (req, res) {
   

    res.redirect('../claims/prototypes/v4/evidence/check-your-evidence-claims')
})

router.post('/v4/add-more-learners-answer', function (req, res) {
    var addAnother = req.session.data['add-another']
    

    if (addAnother == "Yes"){
        // Send user to learner search page
        req.session.data['learner-input'] = ""
        res.redirect('../claims/prototypes/v4/new-claim/select-learner')
      } else if (addAnother == "No") {
        // Send user to check your answers
        res.redirect('../claims/prototypes/v4/new-claim/check-your-answers')
      }
    
})

router.post('/v4/evidence-in-claim-process', function (req, res) {
    req.session.data['addEvidenceInClaimProcess'] = true

    res.redirect('../claims/prototypes/v4/evidence/evidence-type')


})

router.post('/v4/evidence-choice', function (req, res) {
    var evidenceType = req.session.data['evidenceType']
    

    if (evidenceType == "payment"){
        // Send user to actual amount page
        req.session.data['search-input'] = ""
        res.redirect('../claims/prototypes/v4/evidence/actual-amount')
      } else {
        // Send user to file upload page
        res.redirect('../claims/prototypes/v4/evidence/upload')
      }

})

router.post('/v4/update-session-data', (req, res) => {
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

  router.post('/v4/create-claims', (req, res) => {

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

    res.redirect('../claims/prototypes/v4/new-claim/confirmation')
    
  });

  
router.post('/v4/claims-choice', function (req, res) {
    let claims = []

    for (const claim of req.session.data.selectedClaims) { 
        for ( const claimItem of req.session.data.claims) {
            if (claim == claimItem.claimID) {
                claims.push(claimItem)
            }
        }
    }
    req.session.data.selectedClaimsConfirmed = claims
    res.redirect('../claims/prototypes/v4/evidence/check-your-evidence-claims')
})

module.exports = router