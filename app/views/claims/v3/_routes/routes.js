const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// V3 Prototype routes

// Run this code when a form is submitted to 'claim-item-start-point'
router.post('/claim-item-start-point', function (req, res) {

    // Make a variable and give it the value from 'startingpoint'
    var startingpoint = req.session.data['startingpoint']
  
    // Check whether the variable matches a condition
    if (startingpoint == "bylearner"){
      // Send user to learner page
      res.redirect('./new-claim-item/learner/select-learner.html')
    } else if (startingpoint == "byevent") {
      // Send user to event page
      res.redirect('./new-claim-item/event/select-event-type.html')
    }
  
  })

  router.post('/evidence-answer', function (req, res) {

    // Make a variable and give it the value from 'startingpoint'
    var evidence = req.session.data['evidence']
  
    // Check whether the variable matches a condition
    if (evidence == "learner-yes"){
      // Send user to learner page
      res.redirect('./new-claim-item/learner/tu/add-evidence.html')
    } else if (evidence == "learner-no") {
      // Send user to event page
      res.redirect('./new-claim-item/learner/tu/check-your-answers.html')
    } else if (evidence == "event-yes") {
      // Send user to event page
      res.redirect('./new-claim-item/event/tu/add-evidence.html')
    } else if (evidence == "event-no") {
      // Send user to event page
      res.redirect('./new-claim-item/event/tu/check-your-answers.html')
    }
  
  })

  router.post('/event-type-answer', function (req, res) {

    // Make a variable and give it the value from 'startingpoint'
    var eventtype = req.session.data['event-type']
  
    // Check whether the variable matches a condition
    if (eventtype == "cpd"){
      // Send user to learner page
      res.redirect('./new-claim-item/event/cpd/select-activity.html')
    } else if (eventtype == "tu") {
      // Send user to event page
      res.redirect('./new-claim-item/event/tu/select-course.html')
    }
  
  })

  module.exports = router