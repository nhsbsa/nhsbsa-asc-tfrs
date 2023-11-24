//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// V3 Prototype routes

// Run this code when a form is submitted to 'claim-item-start-point'
router.post('/v3/claim-item-start-point', function (req, res) {

    // Make a variable and give it the value from 'startingpoint'
    var startingpoint = req.session.data['startingpoint']
  
    // Check whether the variable matches a condition
    if (startingpoint == "bylearner"){
      // Send user to learner page
      res.redirect('../claims/prototypes/v3/new-claim-item/learner/select-learner.html')
    } else if (startingpoint == "byevent") {
      // Send user to event page
      res.redirect('../claims/prototypes/v3/new-claim-item/event/select-event.html')
    }
  
  })

module.exports = router;