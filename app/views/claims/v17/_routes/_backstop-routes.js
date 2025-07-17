const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, newClaim, checkClaim, compareNINumbers, sortByCreatedDate, validateDate, checkDuplicateClaim, checkLearnerForm, checkBankDetailsForm, findLearnerById, loadLearners, checkUserForm, getMostRelevantSubmission, getDraftSubmission, findPair, findUser, findCourseByCode } = require('../_helpers/helpers.js');


router.get('/before-you-start', function (req, res) {
    // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../before-you-start');
});

router.get('/sign-in', function (req, res) {
    // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/sign-in');
});

router.get('/mfa-code', function (req, res) {
    // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/mfa-code');
});

router.get('/manage-claims', function (req, res) {
  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../manage-claims-home');
});

router.get('/sign-new-gdl', function (req, res) {

    const error = req.session.data.error

  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims"
    };

    if ( error == "true") {
        req.session.data.declarationSubmitError = "true"
    }

    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/sign-new-gdl');
});

router.get('/org-details', function (req, res) {
  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "orgDetails"
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/org-details');
});

router.get('/contact-us', function (req, res) {
  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../contact');
});

router.get('/terms-of-use', function (req, res) {
  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../terms-of-use');
});

router.get('/email', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation"
    };

    switch (scenario) {
        case "1":
        orgID = "E76904778";
        break;

        case "2":
        orgID = "F15904728";
        break;

        case "3":
        orgID = "F84625987";
        break;

        case "4":
        orgID = "B52698456";
        break;

        case "5":
        orgID = "B52698456";
        break;
    }

    loadData(req, orgID)

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/creation-link');
});

router.get('/verify-details', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  // Add data to the session
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation"
    };

    switch (scenario) {
        case "1":
        orgID = "E76904778";
        break;

        case "2":
        orgID = "F15904728";
        break;

        case "3":
        orgID = "F84625987";
        break;

        case "4":
        orgID = "B52698456";
        break;

        case "5":
        orgID = "B52698456";
        break;
    }

    loadData(req, orgID)

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/verify-details');
});

module.exports = router