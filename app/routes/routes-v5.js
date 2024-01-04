const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { loadJSONFromFile } = require('../scripts/JSONfileloaders.js');
const { faker } = require('@faker-js/faker');

// v5 Prototype routes

router.post('/v5/new-claim-reset', function (req, res) {
  
  const d = new Date();
  const dStr = d.toISOString();

  faker.seed(req.session.data.claims.length+1);
  const claim = {
    claimID: faker.finance.accountNumber(6),
    learners: [],
    training: null,
    startDate: null,
    status: "new",
    createdDate: dStr,
    createdBy: "Test Participant",
    submittedDate: null,
    paidDate: null,
    costPerLearner: null,
    evidenceOfPayment: null,
    notes: []
  };
  req.session.data.claims.push(claim)
  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
  delete req.session.data['training-input'];
  delete req.session.data['trainingSelection'];
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

  res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claim.claimID)
});

router.post('/v5/add-training', function (req, res) {
    var trainingCode = req.session.data.trainingSelection
    var claimID = req.session.data.id
    
    for (const t of req.session.data.training) {
        if (trainingCode == t.code) {
            var trainingChoice = t
        }
    }

    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
          c.training = trainingChoice
      }
    }

    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];

    res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)
});

router.post('/v5/create-date', function (req, res) {
  var day = req.session.data['activity-date-started-day']
  var month = req.session.data['activity-date-started-month']
  var year = req.session.data['activity-date-started-year']
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.startDate = year+"-"+month+"-"+day+"T00:00:00.000Z"
    }
  }

  delete req.session.data['activity-date-started-day'];
  delete req.session.data['activity-date-started-month'];
  delete req.session.data['activity-date-started-year'];
  
  res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)
});

router.post('/v5/add-learner', function (req, res) {
    var claimID = req.session.data.id
    console.log(req.session.data.learnerSelection);
    

    for (const l of req.session.data.learners) {
      if (req.session.data.learnerSelection == l.id) {
        var learner = l
        break;
    }
    }

    learner.evidence = {
      evidenceOfEnrollment: null,
      evidenceOfCompletion: null
    }

    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
          c.learners.push(learner)
          break;
      }
    }

    delete req.session.data.learnerInput;
    delete req.session.data.learnerSelection;
    
    res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)
});

router.post('/v5/add-cost', function (req, res) {
  var cost = req.session.data.cost
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.costPerLearner = cost
        break;
    }
  }

  delete req.session.data.cost;

  res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)
});

router.post('/v5/add-note', function (req, res) {
  var note = req.session.data.note
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.notes.push(note)
        break;
    }
  }

  delete req.session.data.note;

  res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)
});

router.post('/v5/add-evidence', function (req, res) {
  var evidence = req.session.data.evidenceFile
  var type = req.session.data.type
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        if (type=='payment') {
          c.evidenceOfPayment = evidence
        } else if (type=='enrollment') {
          for (const l of c.learners) {
            if (l.id==req.session.data.learnerID) {
              l.evidence.evidenceOfEnrollment = evidence
            }
          }
        } else if (type=='completion') {
          for (const l of c.learners) {
            if (l.id==req.session.data.learnerID) {
              l.evidence.evidenceOfCompletion = evidence
            }
          }
        }
        break;
    }
  }

  delete req.session.data.evidenceFile;
  delete req.session.data.type;
  delete req.session.data.learnerID;

  res.redirect('../claims/prototypes/v5/claim/claim-details'+'?id='+claimID)

})


router.post('/v5/role-type-choice', function (req, res) {
  
  for (const role of req.session.data.roleTypes) {
    if (req.session.data.roleType == role.rolename) {
      if (role.eligibility.isCPDeligible) {
        res.redirect('../claims/prototypes/v5/new-learner/registration')
      } else {
        res.redirect('../claims/prototypes/v5/new-learner/check-your-answers')
      }
    } 
}

});

router.post('/v5/create-learner', function (req, res) {
  
  const learner = {
    id: req.session.data.nationalInsuranceNumber,
    fullName: req.session.data.fullName,
    jobTitle: req.session.data.jobTitle,
    roleType: req.session.data.roleType,
  };

  req.session.data.learners.push(learner)

  if (req.session.data.learnersSelected){
    req.session.data['learnersSelected'].push(learner)
} else {
    req.session.data['learnersSelected'] = [learner]
}

});


router.post('/v5/new-learner-reset', function (req, res) {
  delete req.session.data.fullName;
  delete req.session.data.nationalInsuranceNumber;
  delete req.session.data.jobTitle;
  delete req.session.data.roleType;

  res.redirect('../claims/prototypes/v5/new-learner/full-name.html')
});

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/data/v5/'
  
    var learnersFile = 'learners.json'
    var trainingFile = 'training.json'
    var claimsFile = 'claims.json'
    var statusFile = 'claim-item-statuses.json'
    var roleTypes = 'role-types.json'
  
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

    if (req.session.data.roleTypes) {
      console.log('role types file already loaded')
    } else {
      console.log('loading in role types file')
      req.session.data['roleTypes'] = loadJSONFromFile(roleTypes, path)
      console.log('role types file loaded')
    }
  
    return console.log('data updated')
  }


router.get('/v5/load-data', function (req, res) {
    //Load data from JSON files
    loadData(req);
    res.redirect('../claims/prototypes/v5/before-you-start.html')
  })


module.exports = router