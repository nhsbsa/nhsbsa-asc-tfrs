const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// V4 Prototype routes

router.post('/v4/add-learner', function (req, res) {
    var learner = req.session.data['learner-choice']
    

    if (req.session.data.learnersSelected){
        console.log(learner)
        req.session.data['learnersSelected'].push(learner)
    } else {
        req.session.data['learnersSelected'] = [learner]
    }

    res.redirect('../claims/prototypes/v4/new-claim/learner-summary')
})

router.post('/v4/add-more-learners-answer', function (req, res) {
    var addAnother = req.session.data['add-another']
    

    if (addAnother == "Yes"){
        // Send user to learner search page
        req.session.data['search-input'] = ""
        res.redirect('../claims/prototypes/v4/new-claim/select-learner')
      } else if (addAnother == "No") {
        // Send user to check your answers
        res.redirect('../claims/prototypes/v4/new-claim/check-your-answers')
      }
    
})

module.exports = router