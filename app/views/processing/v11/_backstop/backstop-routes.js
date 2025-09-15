const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, findLearnerById, getMostRelevantSubmission, findUser, findCourseByCode } = require('../_helpers/helpers.js');


router.get('/landing-screen', function (req, res) {
    const scenario = req.session.data.scenario

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor"
    };

    switch (scenario) {
        case "1":
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.confirmation = "register"
        break;
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../home');
});

router.get('/org-details', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor"
    };

    if ( error == "missing") {
        req.session.data.submitError = "missing"
    } else if ( error == "invalid") {
        req.session.data.submitError = "invalid"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../register-organisation/organisation-details');
});

router.get('/org-issue', function (req, res) {
    const issue = req.session.data.issue

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor"
    };

    if ( issue == "timeout") {
        req.session.data.submitError = "timeout"
    } else if ( issue == "dupe") {
        req.session.data.orgID = "B02944934"
        req.session.data.submitError = "duplicate"
    } else if ( issue == "incorrect") {
        req.session.data.orgID = "G03944234"
        req.session.data.submitError = "incorrect"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../register-organisation/org-issue');
});

router.get('/confirm-org-details', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        orgID: "G03944234"
    };

    if ( error == "missing") {
        req.session.data.submitError = "missing"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../register-organisation/confirm-organisation-details');
});

router.get('/SRO-details', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        orgID: "G03944234",
        newOrg: "true"
    };

   if ( error == "missing") {
        req.session.data.submitError = {
            familyName: "missing",
            givenName: "missing",
            email: "missing",
            signatoryValid: false
            }
    } else if ( error == "invalid") {
        req.session.data.submitError = {
            familyName: "valid",
            givenName: "valid",
            email: "invalid",
            signatoryValid: false
            }
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.email = "john.smith"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../register-organisation/signatory-details');
});

router.get('/confirm-SRO-details', function (req, res) {

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        orgID: "G03944234",
        newOrg: "true",
        familyName: "Smith",
        givenName: "John",
        email: "john.smith@fakecarehome.com"
    };

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../register-organisation/confirm-signatory-details');
});

router.get('/find-claim', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor"
    };

    if ( error == "missing") {
        req.session.data.invalidIDError = "true"
        req.session.data.emptyError = "true"
    } else if ( error == "invalid") {
        req.session.data.claimID = "1234"
        req.session.data.invalidIDError = "true"
    }  else if ( error == "nomatch") {
        req.session.data.claimID = "ABC-ABCD-ABCD-A"
        req.session.data.notFound = "true"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../process-claim/start-process');
});

router.get('/claim', function (req, res) {
    let id = null
    const status = req.session.data.status
    const type = req.session.data.type
    const error = req.session.data.error
    const userType = req.session.data.userType
    const radio = req.session.data.radio
    const confirmation = req.session.data.confirmation
    const paymentPlan = req.session.data.paymentPlan

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType,
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "B02944934",
        processClaimStep: "inProgress"
    };

    switch (status) {
        case "submitted":
        switch (type) {
            case "100":
            id = "HMJ-74V3-T8V5-A";
            break;

            case "60":
            id = "1SC-WE58-MT7W-B";
            break;

            case "40":
            if (paymentPlan == true) {
                id = "3SH-I94K-JSND-C";
            } else {
                id = "9JH-I94K-TPRB-C";
            }
            break;
        }
        break;

        case "queried":
        switch (type) {
            case "100":
            id = "CWH-E4C7-FBXJ-A";
            break;

            case "60":
            id = "VJH-8Y37-EZNM-B";
            break;

            case "40":
            if (paymentPlan == true) {
                id = "47D-748D-JSND-C";
            } else {
                id = "SRX-A33U-BMUG-C";
            }
            break;
        }
        break;

        case "approved":
        switch (type) {
            case "100":
            id = "CKX-ZZSG-BDCB-A";
            break;

            case "60":
            id = "P1J-EHVI-88A2-B";
            break;

            case "40":
            if (paymentPlan == true) {
                id = "3FD-JH62-JKMD-C";
            } else {
                id = "SND-EPRS-N3MZ-C";
            }
            break;
        }
        break;

        case "rejected":
        switch (type) {
            case "100":
            id = "ML8-K712-2N27-A";
            break;

            case "60":
            id = "UK9-JGAN-B4QP-B";
            break;

            case "40":
            if (paymentPlan == true) {
                id = "D6F-K8DF-S82H-C";
            } else {
                id = "A8T-TAGD-ETJE-C";
            }
            break;
        }
        break;

    }

    req.session.data.id = id

    loadData(req)

    if ( radio == "yes") {
        req.session.data.payment = "approve"
        req.session.data.completion = "approve"
    } else if ( radio == "reject") {
        req.session.data.payment = "reject"
        req.session.data.completion = "reject"
    } else if ( radio == "queried") {
        req.session.data.payment = "queried"
        req.session.data.completion = "queried"
    }


    if ( error == "radioMissing") {
        switch (type) {
            case "100":
            req.session.data.paymentResponseIncomplete = "true"
            req.session.data.completionResponseIncomplete = "true"
            break;

            case "60":
            req.session.data.paymentResponseIncomplete = "true"
            break;

            case "40":
            if (paymentPlan == true) {
                req.session.data.paymentResponseIncomplete = "true"
            }
            req.session.data.completionResponseIncomplete = "true"
            break;
        }
    } else if ( error == "costMissing") {
        req.session.data.paymentReimbursementAmountIncomplete = "true"
        req.session.data.paidInFullResponseIncomplete = "true"
    }  else if ( error == "costInvalid") {
        req.session.data.paymentReimbursementAmount = "abc"
        req.session.data.paymentReimbursementAmountInvalid = "true"
    } else if ( error == "rejectMissing") {
        switch (type) {
            case "100":
            req.session.data.paymentRejectNoteIncomplete = "true"
            req.session.data.completionRejectNoteIncomplete = "true"
            break;

            case "60":
            req.session.data.paymentRejectNoteIncomplete = "true"
            break;

            case "40":
            req.session.data.completionRejectNoteIncomplete = "true"
            break;
        }
    }else if ( error == "queriedMissing") {
        switch (type) {
            case "100":
            req.session.data.paymentQueriedNoteIncomplete = "true"
            req.session.data.completionQueriedNoteIncomplete = "true"
            break;

            case "60":
            req.session.data.paymentQueriedNoteIncomplete = "true"
            break;

            case "40":
            req.session.data.completionQueriedNoteIncomplete = "true"
            break;
        }
    }

    if ( confirmation == "true") {
        req.session.data.processSuccess = "true"
    } 

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/outcome', function (req, res) {
    let id = null
    const status = req.session.data.status
    const type = req.session.data.type

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "B02944934",
        processClaimStep: "confirmOutcome"
    };

    switch (type) {
        case "100":
        id = "HMJ-74V3-T8V5-A";
        if ( status == "approve") {
            req.session.data.payment = "approve"
            req.session.data.completion = "approve"
            req.session.data.paymentReimbursementAmount = "50"
            req.session.data.result = "approve"
        } else if ( status == "reject") {
            req.session.data.payment = "reject"
            req.session.data.completion = "reject"
            req.session.data.paymentRejectNote = "This is a test note."
            req.session.data.completionRejectNote = "This is a test note."
            req.session.data.result = "reject"
        } else if ( status == "queried") {
            req.session.data.payment = "queried"
            req.session.data.completion = "queried"
            req.session.data.paymentQueriedNote = "This is a test note."
            req.session.data.completionQueriedNote = "This is a test note."
            req.session.data.result = "queried"
        }
        break;

        case "60":
        id = "1SC-WE58-MT7W-B";
        if ( status == "approve") {
            req.session.data.payment = "approve"
            req.session.data.paymentReimbursementAmount = "50"
            req.session.data.result = "approve"
        } else if ( status == "reject") {
            req.session.data.payment = "reject"
            req.session.data.paymentRejectNote = "This is a test note."
            req.session.data.result = "reject"
        } else if ( status == "queried") {
            req.session.data.payment = "queried"
            req.session.data.paymentQueriedNote = "This is a test note."
            req.session.data.result = "queried"
        }
        break;

        case "40":
        id = "9JH-I94K-TPRB-C";
        if ( status == "approve") {
            req.session.data.completion = "approve"
            req.session.data.result = "approve"
        } else if ( status == "reject") {
            req.session.data.completion = "reject"
            req.session.data.completionRejectNote = "This is a test note."
            req.session.data.result = "reject"
        } else if ( status == "queried") {
            req.session.data.completion = "queried"
            req.session.data.completionQueriedNote = "This is a test note."
            req.session.data.result = "queried"
        }
        break;
    }

    req.session.data.id = id

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/submissions', function (req, res) {
    const type = req.session.data.type
    const note = req.session.data.note

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "B02944934",
        processClaimStep: "previousSubmissions"
    };

    switch (type) {
        case "100":
        req.session.data.id = "HMJ-74V3-T8V5-A";
        req.session.data.view = "100"
        break;

        case "60":
        req.session.data.id = "1SC-WE58-MT7W-B";
        req.session.data.view = "60"
        break;

        case "40":
        req.session.data.id = "9JH-I94K-TPRB-C";
        req.session.data.view = "40"
        break;
    }

    loadData(req)

    if ( note == "true") {
        req.session.data.submittedDate = "2025-02-02T11:52:30.850Z"
        req.session.data.showNote = "true"
        req.session.data.subCount = "1"
        req.session.data.count = "1"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/find-org', function (req, res) {
    const error = req.session.data.error
    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType
    };

    if ( error == "missing") {
        req.session.data.error = "emptyInput"
    } else if ( error == "invalid") {
        req.session.data.orgSearchInput = "abc"
        req.session.data.error = "notValid"
    }  else if ( error == "nomatch") {
        req.session.data.orgSearchInput = "A12345678"
        req.session.data.error = "notFound"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/find-organisation');
});

router.get('/view-org-users', function (req, res) {
    const userType = req.session.data.userType
    const resend = req.session.data.resend
    const scenario = req.session.data.scenario

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType,
        orgTab: "users"
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "E76904778";
        if ( resend == "true") {
            req.session.data.name = "mira.caldwell@brighthorizons.com"
            req.session.data.invite = "success"
            req.session.data.resendList = ["mira.caldwell@brighthorizons.com"]
        } else if ( resend == "fail") {
            req.session.data.invite = "failure"
        }
        break;

        case "2":
        req.session.data.orgID = "G91774723";
        if ( resend == "true") {
            req.session.data.name = "hadyn-lacey@pinetreecare.co.uk"
            req.session.data.invite = "success"
            req.session.data.resendList = ["hadyn-lacey@pinetreecare.co.uk"]
        } else if ( resend == "fail") {
            req.session.data.invite = "failure"
        }
        break;

        case "3":
        req.session.data.orgID = "F15904728";
        if ( resend == "true") {
            req.session.data.name = "craig.helliwell@purplestonecare.com"
            req.session.data.invite = "success"
            req.session.data.resendList = ["craig.helliwell@purplestonecare.com"]
        } else if ( resend == "fail") {
            req.session.data.invite = "failure"
        }
        break;

        case "4":
        req.session.data.orgID = "B52698456";
        if ( resend == "true") {
            req.session.data.name = "jane.crow@fandly.com"
            req.session.data.invite = "success"
            req.session.data.resendList = ["jane.crow@fandly.com"]
        } else if ( resend == "fail") {
            req.session.data.invite = "failure"
        }
        break;

        case "5":
        req.session.data.orgID = "B02944934";
        if ( resend == "true") {
            req.session.data.name = "lionel-lowel@evergreencare.co.uk"
            req.session.data.invite = "success"
            req.session.data.resendList = ["lionel-lowel@evergreencare.co.uk"]
        } else if ( resend == "fail") {
            req.session.data.invite = "failure"
        }
        break;
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/view-org-claims', function (req, res) {
    const scenario = req.session.data.scenario
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: 'processor',
        orgTab: "claims",
        currentPage: "1"
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "B02944934";
        break;

        case "2":
        req.session.data.orgID = "C63281491";
        break;
    }

    if ( error == "missing") {
        req.session.data.invalidIDError = "true"
        req.session.data.emptyError = "true"
    } else if ( error == "invalid") {
        req.session.data.claimID = "1234"
        req.session.data.invalidIDError = "true"
    }  else if ( error == "nomatch") {
        req.session.data.claimID = "ABC-ABCD-ABCD-A"
        req.session.data.notFound = "true"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/change-SRO', function (req, res) {
    const error = req.session.data.error
    const scenario = req.session.data.error
    const SROChange = req.session.data.type

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        newOrg: "true",
        SROChange
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "E76904778";
        break;

        case "2":
        req.session.data.orgID = "G91774723";
        break;

        case "3":
        req.session.data.orgID = "F15904728";
        break;

        case "4":
        req.session.data.orgID = "B52698456";
        break;

        case "5":
        req.session.data.orgID = "B02944934";
        break;
    }

   if ( error == "missing") {
        req.session.data.submitError = {
            familyName: "missing",
            givenName: "missing",
            email: "missing",
            signatoryValid: false
            }
    } else if ( error == "invalid") {
        req.session.data.submitError = {
            familyName: "valid",
            givenName: "valid",
            email: "invalid",
            signatoryValid: false
            }
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.email = "john.smith"
    } else if ( error == "nochange") {
        req.session.data.submitError = "noChange"
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.email = "john.smith&fakecarehome.com"
    }  else if ( error == "duplicate") {
        req.session.data.submitError = {
            familyName: "valid",
            givenName: "valid",
            email: "duplicate",
            signatoryValid: false
            }
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.email = "john.smith&fakecarehome.com"
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/signatory-details');
});

router.get('/confirm-SRO-details-change', function (req, res) {
    const error = req.session.data.error
    const scenario = req.session.data.scenario
    const SROChange = req.session.data.type

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        newOrg: "true",
        familyName: "Smith",
        givenName: "John",
        email: "john.smith@fakecarehome.com",
        SROChange
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "E76904778";
        break;

        case "2":
        req.session.data.orgID = "G91774723";
        break;

        case "3":
        req.session.data.orgID = "F15904728";
        break;

        case "4":
        req.session.data.orgID = "B52698456";
        break;

        case "5":
        req.session.data.orgID = "B02944934";
        break;
    }

    loadData(req)

    if ( error == "fail") {
        req.session.data.invite = "failure"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/updated-signatory-invitation');
});


module.exports = router