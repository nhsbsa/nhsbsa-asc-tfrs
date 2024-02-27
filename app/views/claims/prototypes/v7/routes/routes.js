const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { loadJSONFromFile } = require('../../../../../scripts/JSONfileloaders.js');
const { faker } = require('@faker-js/faker');
const { checkClaim, compareNINumbers, sortByCreatedDate } = require('../../../../../scripts/helpers/helpersV7.js');

// v7 Prototype routes


router.post('/first-start', function (req, res) {

  // Make a variable and give it the value from 'startingpoint'
  var claimGuidance = req.session.data['claimGuidance']

  // Check whether the variable matches a condition
  if (claimGuidance == "yes"){

    res.redirect('../claims/prototypes/v7/guidance/help-start-claim')
  } else if (claimGuidance == "no") {
    newClaim(req, res)
  }

})

router.post('/new-claim-reset', function (req, res) {
  newClaim(req, res)
});


function newClaim(req, res) {
  const claimType = req.session.data.claimType
  const categoryName =  req.session.data.activityType
  let claim = {};
  const d = new Date();
  const dStr = d.toISOString();

  faker.seed(req.session.data.claims.length+1);

  if (claimType == "TU") {
    claim = {
      claimID: faker.finance.accountNumber(6),
      type: "TU",
      learners: [],
      training: null,
      startDate: null,
      status: "new",
      createdDate: dStr,
      createdBy: "Test Participant",
      submittedDate: null,
      paidDate: null,
      costDate: null,
      evidenceOfPayment: null,
      notes: []
    };
  } else if (claimType == "CPD") {
    claim = {
      claimID: faker.finance.accountNumber(6),
      type: "CPD",
      learners: [],
      categoryName,
      description: null,
      startDate: null,
      status: "new",
      createdDate: dStr,
      createdBy: "Test Participant",
      submittedDate: null,
      paidDate: null,
      costDate: null,
      claimAmount: null,
      evidenceOfPayment: null,
      notes: []
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
  delete req.session.data['activityType'];

  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claim.claimID)
}

router.post('/add-training', function (req, res) {
    var trainingCode = req.session.data.trainingSelection
    var claimID = req.session.data.id
    
    for (const trainingGroup of req.session.data.training) {
      for (const t of trainingGroup.courses) {
        if (trainingCode == t.code) {
          var trainingChoice = t
        }
      }
    }

    for (const c of req.session.data.claims) {
      if (claimID == c.claimID) {
          c.training = trainingChoice
          
      }
    }

    delete req.session.data['training-input'];
    delete req.session.data['trainingSelection'];

    res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#training')
});

router.post('/create-date', function (req, res) {
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
  
  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#training')
});

router.post('/add-description', function (req, res) {
  var description = req.session.data.description
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.description = description
        break;
    }
  }

  delete req.session.data.description;

  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#activity')
});

router.post('/add-cost', function (req, res) {
  var cost = req.session.data.cost
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.claimAmount = cost
        
        console.log(JSON.stringify(c, null, 2))
        break;
    }
  }
  delete req.session.data.cost;

  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#activity')
});

router.post('/cost-date', function (req, res) {
  var day = req.session.data['payment-date-started-day']
  var month = req.session.data['payment-date-started-month']
  var year = req.session.data['payment-date-started-year']
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.costDate = year+"-"+month+"-"+day+"T00:00:00.000Z"
        
    }
  }

  delete req.session.data['payment-date-started-day'];
  delete req.session.data['payment-date-started-month'];
  delete req.session.data['payment-date-started-year'];
  
  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#payment')
});

router.post('/add-learner', function (req, res) {
    var claimID = req.session.data.id
    

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
    
    delete req.session.data.existingLearner
    delete req.session.data.learnerInput;
    delete req.session.data.learnerSelection;
    
    res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#learners')
});

router.post('/remove-learner', function (req, res) {
  var claimID = req.session.data.id

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      let index=0
      for (const l of c.learners) {
        if (req.session.data.learnerID == l.id) {
          c.learners.splice(index,1)
          delete req.session.data.learnerID
          break;
        }
        index++
      }
        break;
    }
  }
  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#learners')
});

router.post('/add-note', function (req, res) {
  var note = req.session.data.note
  var claimID = req.session.data.id
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        c.notes.push(note)
        break;
    }
  }

  delete req.session.data.note;

  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#notes')
});

router.post('/add-evidence', function (req, res) {
  var evidence = req.session.data.evidenceFile
  var type = req.session.data.type
  var claimID = req.session.data.id
  let i = 1

  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
        if (type=='payment') {
          c.evidenceOfPayment = 'invoice01.pdf'
        } else if (type=='enrollment') {
          
          for (const l of c.learners) {
            if (l.id==req.session.data.learnerID) {
              l.evidence.evidenceOfEnrollment = 'enrollment'+ i + '.pdf'
            }
            i++
          }
        } else if (type=='completion') {
          i = 1
          for (const l of c.learners) {
            if (l.id==req.session.data.learnerID) {
              l.evidence.evidenceOfCompletion = 'certficate' + i + '.pdf'
            }
            i++
          }
        }
        
        break;
    }
  }

  delete req.session.data.evidenceFile;
  delete req.session.data.type;
  delete req.session.data.learnerID;

  res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'#'+type)

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
  res.redirect('../claims/prototypes/v7/manage-claims')

});

router.post('/submit-claim', function (req, res) {
  const claimID = req.session.data.id
  const d = new Date()
  const dStr = d.toISOString();
  
  for (const c of req.session.data.claims) {
    if (claimID == c.claimID) {
      if (checkClaim(c)) {
        c.status = 'submitted'
        c.submittedDate = dStr
        delete req.session.data.submitError
        req.session.data.claims = sortByCreatedDate(req.session.data.claims);
        res.redirect('../claims/prototypes/v7/claim/confirmation')
      } else {
        res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID+'&submitError=true')
      }
    }
  }
});


router.post('/create-learner', function (req, res) {
  var claimID = req.session.data.id

  delete req.session.data.existingLearner

  if (req.session.data.inClaim=='true' && !compareNINumbers(req.session.data.nationalInsuranceNumber, req.session.data.learners)){
    
    const learner = {
      id: req.session.data.nationalInsuranceNumber,
      fullName: req.session.data.fullName,
      jobTitle: req.session.data.jobTitle,
      roleType: req.session.data.roleType,
    };
    req.session.data.learners.push(learner)

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
    delete req.session.data.inClaim
    delete req.session.data.fullName
    delete req.session.data.jobTitle
    delete req.session.data.nationalInsuranceNumber
    delete req.session.data.regOrg
    delete req.session.data.regID
    delete req.session.data.roleType
    delete req.session.data.learnerInput
    res.redirect('../claims/prototypes/v7/claim/claim-details'+'?id='+claimID)
  } else{
    console.log('match')
    delete req.session.data.fullName
    delete req.session.data.jobTitle
    delete req.session.data.regOrg
    delete req.session.data.regID
    delete req.session.data.roleType
    delete req.session.data.learnerInput
    res.redirect('../claims/prototypes/v7/learner/add-learner?inClaim='+req.session.data.inClaim+'&existingLearner=true')
  }

});

router.post('/update-filters', (req, res) => {
  const filters = req.body.filters; 
  // Assuming selectedOptions is sent in the request body
  req.session.data['filters'] = filters;

  // Define keys to exclude from logging
  const excludeKeys = ['training', 'claims', 'learners', 'statuses', 'roleTypes'];

  // Create a copy of req.session.data with excluded keys removed
  const filteredData = Object.keys(req.session.data)
    .filter(key => !excludeKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.session.data[key];
      return obj;
    }, {});
  
  const log = {
    method: req.method,
    url: req.originalUrl,
    data: filteredData
  }
  // you can enable this in your .env file
  console.log(JSON.stringify(log, null, 2))
  
  res.send(req.session.data)
});

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/data/v7/'
  
    var learnersFile = 'learners.json'
    var trainingFile = 'training.json'
    var claimsFile = 'claims.json'
    var statusFile = 'claim-item-statuses.json'
    var roleTypes = 'role-types.json'
    var CPDActivities = 'cpd-activities.json'
  
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

    if (req.session.data.CPDActivities) {
      console.log('CPDActivities file already loaded')
    } else {
      console.log('loading in CPDActivities file')
      req.session.data['CPDActivities'] = loadJSONFromFile(CPDActivities, path)
      console.log('CPDActivities file loaded')
    }
  
    return console.log('data updated')
  }


router.get('/load-data', function (req, res) {
    //Load data from JSON files
    loadData(req);
    res.redirect('../claims/prototypes/v7/before-you-start.html')
})


module.exports = router