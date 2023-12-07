//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

require("./scripts/generate-learners.js")(router)
router.use('/', require('./routes/routes-v3.js'))

// Add your routes here
router.use((req, res, next) => {
  const log = {
    method: req.method,
    url: req.originalUrl,
    data: req.session.data
  }
  // you can enable this in your .env file
  console.log(JSON.stringify(log, null, 2))
  next()
})

module.exports = router;