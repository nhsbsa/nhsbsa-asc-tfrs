const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, getMostRelevantSubmission, getDraftSubmission } = require('../_helpers/helpers.js');


router.get('/before-you-start', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../before-you-start');
});

router.get('/sign-in', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/sign-in');
});

router.get('/account-creation-incomplete', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/account-creation-incomplete');
});

router.get('/mfa-code', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/mfa-code');
});

router.get('/sign-new-gdl', function (req, res) {

    const error = req.session.data.error

  delete req.session.data
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
    const userType = req.session.data.userType

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "signin",
        tabLocation: "orgDetails"
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/org-details');
});

router.get('/contact-us', function (req, res) {
  delete req.session.data
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
  delete req.session.data
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

  delete req.session.data
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

router.get('/email-expiry', function (req, res) {
  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "creation"
    };

    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/email-expiry');
});

router.get('/authentication-verify-details', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  delete req.session.data
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

router.get('/sign-in', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  delete req.session.data
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
    res.redirect('../authentication/sign-in');
});

router.get('/mfa', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  delete req.session.data
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
    res.redirect('../authentication/mfa');
});

router.get('/mfa-code', function (req, res) {
    let orgID = null
    let userType = null
    const scenario = req.session.data.scenario
    if (scenario == "5") {
        userType = "submitter"
    } else {
        userType = "signatory"
    }

  delete req.session.data
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
    res.redirect('../authentication/mfa-code');
});

router.get('/registration-verify-details', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario

    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
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
    }

    loadData(req, orgID)

    if ( error == "true") {
        req.session.data.submitError = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/verify-details');
});

router.get('/registration-account-issue', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "creation"
    };

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/account-issue');
});

router.get('/registration-job-title', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario

    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
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
    }

    loadData(req, orgID)

    if ( error == "jobTitleEmptyError") {
        req.session.data.jobTitleEmptyError = "true"
    } else if ( error == "jobTitleInvalid") {
        req.session.data.jobTitleInvalid = "true"
        req.session.data.jobTitle = "%%%"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/job-title');
});

router.get('/registration-sign-gdl', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario

    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
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
    }

    loadData(req, orgID)

    if ( error == "true") {
        req.session.data.declarationSubmitError = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/declaration');
});

router.get('/registration-bank-details-choice', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario

    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
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
    }

    loadData(req, orgID)

    if ( error == "true") {
        req.session.data.submitError = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../account-setup/bank-details-question');
});

router.get('/registration-bank-details', function (req, res) {
    let orgID = null
    let journey = null
    const scenario = req.session.data.scenario

    const error = req.session.data.error

    const registered = req.session.data.registered

    if (registered == "true") {
        journey = "signin"
    } else {
        journey = "creation"
    }

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey,
        tabLocation: "bankDetails"
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
    }

    loadData(req, orgID)

    if ( error == "missing") {
        req.session.data.submitError = {
            accountName: "missing",
            sortCode: "missing",
            accountNumber: "missing",
            buildingSociety: "valid",
            bankDetailsValid: false
        }
    } else if ( error == "invalid") {
        req.session.data.submitError = {
            accountName: "invalid",
            sortCode: "invalid",
            accountNumber: "invalid",
            buildingSociety: "invalid",
            bankDetailsValid: false
        }
        req.session.data.nameOnTheAccount = "John Smith",
        req.session.data.sortCode = "abc",
        req.session.data.accountNumber = "abc",
        req.session.data.rollNumber = "%%%"
    } else if ( error == "toolong") {
        req.session.data.submitError = {
            accountName: "valid",
            sortCode: "lengthIssue",
            accountNumber: "lengthIssue",
            buildingSociety: "lengthIssue",
            bankDetailsValid: false
        }
        req.session.data.nameOnTheAccount = "John Smith",
        req.session.data.sortCode = "1234567",
        req.session.data.accountNumber = "123456789",
        req.session.data.rollNumber = "12345678901234567890"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/change-bank-details');
});

router.get('/view-bank-details', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario

    const confirmation = req.session.data.confirmation

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "bankDetails"
    };

    switch (scenario) {
        case "1":
        orgID = "A02944934";
        break;

        case "2":
        orgID = "G91774723";
        break;
    }

    loadData(req, orgID)

    if ( confirmation == "true") {
        req.session.data.addbankdetailsSuccess = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/bank-details');
});

router.get('/manage-submitters', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario
    const deleteType = req.session.data.deleteType
    const resend = req.session.data.resend

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "users"
    };

    switch (scenario) {
        case "1":
        orgID = "B13299931";
        break;

        case "2":
        orgID = "A02944934";
        break;

        case "3":
        orgID = "C63281491";
        break;
    }

    loadData(req, orgID)

    if ( resend == "success") {
        req.session.data.invite = "success"
        req.session.data.resendList = ["zane.montgomery@teatree.com"]
        req.session.data.matchResendUser = {
            givenName: "Zane",
            familyName: "Montgomery",
            email: "zane.montgomery@teatree.com",
            status: "invited"
        }
    } else if (resend == "fail") {
        req.session.data.invite = "failure"
        req.session.data.matchResendUser = {
            givenName: "Zane",
            familyName: "Montgomery",
            email: "zane.montgomery@teatree.com",
            status: "invited"
        }
    }
    
    if (deleteType == "invited") {
        req.session.data.deleteSuccess = "true"
        req.session.data.deletedUser = "invited"
        req.session.data.matchDeletedUser = {
            givenName: "John",
            familyName: "Smith",
            email: "john.smith@teatree.com",
            status: "inactive"
        }
    } else if (deleteType == "registered") {
        req.session.data.deleteSuccess = "true"
        req.session.data.deletedUser = "active"
        req.session.data.matchDeletedUser = {
            givenName: "John",
            familyName: "Smith",
            email: "john.smith@teatree.com",
            status: "inactive"
        }
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/manage-team');
});

router.get('/new-submitter-details', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "users"

    };

    loadData(req, "B13299931")

    if ( error == "missing") {
        req.session.data.submitError = {
            familyName: "missing",
            givenName: "missing",
            email: "missing",
            userValid: false
        }
    } else if ( error == "invalid") {
        req.session.data.submitError = {
            familyName: "valid",
            givenName: "valid",
            email: "invalid",
            userValid: false
        }
        req.session.data.familyName = "Smith",
        req.session.data.givenName = "John",
        req.session.data.email = "john.smith"
    } else if ( error == "invited") {
        req.session.data.submitError = {
            familyName: "valid",
            givenName: "valid",
            email: "match",
            userValid: false
        }
        req.session.data.familyName = "Montgomery",
        req.session.data.givenName = "Zane",
        req.session.data.email = "zane.montgomery@teatree.com"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/user-details');
});

router.get('/check-submitter-details', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "users",
        familyName: "Smith",
        givenName: "John",
        email: "john.smith@fakecarehome.com"

    };

    loadData(req, "B13299931")

    if ( error == "missing") {
        req.session.data.checkBoxSubmitError = "true"
    } else if (error == "fail") {
        req.session.data.invite = "failure"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/confirm-user-details');
});

router.get('/delete-submitters', function (req, res) {
    const error = req.session.data.error
    const scenario = req.session.data.scenario

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "users",
    };

    loadData(req, "B13299931")

    if (scenario == "registered") {
        req.session.data.deletedEmail = "oliver.grey@teatree.com"
    } else if (scenario == "invited") {
        req.session.data.deletedEmail = "zane.montgomery@teatree.com"
    }

    if (error == "fail") {
        req.session.data.deleteError = true
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/delete-user-confirmation');
});

router.get('/manage-claims', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario
    const userType = req.session.data.userType
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "signin",
        tabLocation: "claims",
    };

    switch (scenario) {
        case "1":
        orgID = "A02944934";
        break;

        case "2":
        orgID = "G91774723";
        break;

        case "3":
        orgID = "F87223491";
        break;

        case "4":
        orgID = "G91371231";
        break;
    }

    loadData(req, orgID)

    if (error == "missing") {
        req.session.data.emptyError = "true"
    } else if (error == "invalid") {
        req.session.data.invalidIDError = "true"
        req.session.data.searchClaimId = "u w"
    } else if (error == "noresult") {
        req.session.data.notFound = "true"
        req.session.data.searchClaimId = "ABC-ABCD-ABCD-A"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../manage-claims-home');
});

router.get('/advanced-search', function (req, res) {
    const results = req.session.data.results
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
    };

    loadData(req, "A02944934")

    if (results == "yes") {
        req.session.data.learner = "roy"
        req.session.data.trainingName = ""
        req.session.data.fromSearchResults = "true"
    } else if (results == "no") {
        req.session.data.learner = "roy"
        req.session.data.trainingName = "health"
        req.session.data.fromSearchResults = "true"
    }

    if (error == "missing") {
        req.session.data.noInputs = "true"
    } else if (error == "invalid1") {
        req.session.data.learner = "o"
        req.session.data.trainingName = "o"
        req.session.data.trainingSearchLengthInsufficient = "true"
        req.session.data.learnerSearchLengthInsufficient = "true"
    } else if (error == "invalid2") {
        req.session.data.learner = "o"
        req.session.data.trainingName = "manage"
        req.session.data.learnerSearchLengthInsufficient = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/advanced-search');
});

router.get('/manage-claims-status', function (req, res) {
    let orgID = null
    const scenario = req.session.data.scenario
    const statusID = req.session.data.status
    const deleteClaim = req.session.data.deleteClaim

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        statusID,
        currentPage: "1"
    };

    switch (scenario) {
        case "1":
        orgID = "A02944934";
        break;

        case "2":
        orgID = "D62749203";
        break;
    }

    loadData(req, orgID)

    if (deleteClaim == "true") {
        req.session.data.deletedID = "ABC-AC3E-L8UI-A"
        req.session.data.deleteSuccess = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../manage-claims');
});

router.get('/claim', function (req, res) {
    let id = null
    const status = req.session.data.status
    const type = req.session.data.type
    const paymentPlan = req.session.data.paymentPlan
    const error = req.session.data.error
    const ommt = req.session.data.ommt

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
    };

    switch (status) {
        case "not-yet-submitted":
        switch (type) {
            case "100":
            id = "GE2-UA5D-4K6C-A";
            break;

            case "60":
            id = "ZSK-23VE-MXS4-B";
            break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                    id = "P1J-EHVI-88A2-C";
                    break;
                    case "false":
                    id = "J2S-MKQ7-2F4Q-C";
                    break;
                }
            break;
        }
        break;

        case "queried":
        switch (type) {
            case "100":
            id = "CFD-EHS7-F43J-A";
            break;

            case "60":
            id = "VJH-8Y37-EZNM-B";
            break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                    id = "P8A-66ND-IBFM";
                    break;
                    case "false":
                    id = "SRX-A33U-BMUG-C";
                    break;
                }
            break;
        }
        break;

        case "submitted":
        switch (type) {
            case "100":
            id = "HMJ-74V3-T8V5-A";
            break;

            case "60":
            id = "1SC-WE58-MT7W-B";
            break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                    id = "26Q-GS9P-E91M-C";
                    break;
                    case "false":
                    id = "9JH-I94K-TPRB-C";
                    break;
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
                switch (paymentPlan) {
                    case "true":
                    id = "NP1-NNFN-E76Y-C";
                    break;
                    case "false":
                    id = "SND-EPRS-N3MZ-C";
                    break;
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
            switch (paymentPlan) {
                    case "true":
                    id = "ST7-LVRI-VPK5-B";
                    break;
                    case "false":
                    id = "A8T-TAGD-ETJE-C";
                    break;
                }
            break;
        }
        break;

        case "new":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "E3N-OMMT-GH27-A";
            } else {
                id = "ABC-UA5D-43BD-A";
            }
            
            break;

            case "60":
            id = "GDH-34ND-MXS4-B";
            break;
        }
        break;

    }

    req.session.data.id = id

    loadData(req, "B13299931")

    if (error == "missing1") {
        req.session.data.submitError = {
            learner: "missing",
            startDate: "missing",
            paymentDate: "missing",
            evidenceOfPayment: "missing",
            evidenceOfCompletion: "valid",
            completionDate: "valid",
            change: true,
            claimValid: false
            }
    } else if (error == "missing2") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "valid",
            paymentDate: "missing",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "missing",
            completionDate: "missing",
            change: true,
            claimValid: false
            }
    } else if (error == "missing3") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "valid",
            paymentDate: "valid",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "missing",
            completionDate: "missing",
            change: true,
            claimValid: false
            }
    } else if (error == "date1") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "invalid",
            paymentDate: "valid",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "valid",
            completionDate: "invalid",
            change: true,
            claimValid: false
            }

            for (const claim of req.session.data.claims) {
                if (claim.claimID == "GE2-UA5D-4K6C-A") {
                    const submission = getMostRelevantSubmission(claim)
                    submission.costDate = "2025-03-31T23:55:44.062Z"
                    submission.completionDate = "2025-02-25T23:55:44.062Z"
                    submission.evidenceOfCompletion = "certificate1.pdf"
                }
            }
    } else if (error == "date2") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "invalid",
            paymentDate: "valid",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "valid",
            completionDate: "invalid",
            change: true,
            claimValid: false
            }

            for (const claim of req.session.data.claims) {
                if (claim.claimID == "P1J-EHVI-88A2-C") {
                    const submission = getMostRelevantSubmission(claim)
                    submission.completionDate = "2024-06-15T23:55:44.062Z"
                    submission.evidenceOfCompletion = "certificate1.pdf"
                }
            }
    } else if (error == "date3") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "inFuture",
            paymentDate: "inFuture",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "valid",
            completionDate: "valid",
            change: true,
            claimValid: false
            }

            for (const claim of req.session.data.claims) {
                if (claim.claimID == "GE2-UA5D-4K6C-A") {
                    const submission = getMostRelevantSubmission(claim)
                    submission.costDate = "2025-03-31T23:55:44.062Z"
                    submission.completionDate = "2025-02-25T23:55:44.062Z"
                    submission.evidenceOfCompletion = "certificate1.pdf"
                }
            }
    } else if (error == "date4") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "valid",
            paymentDate: "valid",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "valid",
            completionDate: "inFuture",
            change: true,
            claimValid: false
            }

            for (const claim of req.session.data.claims) {
                if (claim.claimID == "P1J-EHVI-88A2-C") {
                    const submission = getMostRelevantSubmission(claim)
                    submission.completionDate = "2024-06-15T23:55:44.062Z"
                    submission.evidenceOfCompletion = "certificate1.pdf"
                }
            }
    } else if (error == "noedits") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "valid",
            paymentDate: "valid",
            evidenceOfPayment: "valid",
            evidenceOfCompletion: "valid",
            completionDate: "valid",
            change: false,
            claimValid: false
            }

            if (type =="60") {
                for (const claim of req.session.data.claims) {
                if (claim.claimID == "VJH-8Y37-EZNM-B") {
                    const submission = getDraftSubmission(claim)
                    submission.evidenceOfPayment = ["invoice1.pdf", "receipt1.pdf"]
                }
            }
            }
        }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/claim-details');
});

router.get('/delete-claim', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "users",
        id: "GE2-UA5D-4K6C-A"

    };

    loadData(req, "B13299931")

    if ( error == "fail") {
        req.session.data.deleteError = "true"
    } 

    // Redirect to the page you want to screenshot
    res.redirect('../claim/delete-claim-confirmation');
});

router.get('/select-training', function (req, res) {
    const results = req.session.data.results
    const error = req.session.data.error
    const change = req.session.data.change

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims"
    };

    loadData(req, "A02944934")

    if (results == "yes") {
        req.session.data["training-input"] = "mental"
    } else if (results == "no") {
        req.session.data["training-input"] = "caring"

    }

    if (error == "missing") {
        req.session.data["training-input"] = ""
    } else if (error == "invalid") {
        req.session.data["training-input"] = "o"
    }

    if (change == "true") {
        req.session.data.id = "VJH-8Y37-EZNM-B"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/select-training');
});

router.get('/funding-model-choice', function (req, res) {

    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims"
    };

    if ( error == "true") {
        req.session.data.submitError = "true"
    }

    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/split-decision');
});

router.get('/select-learner', function (req, res) {
    const results = req.session.data.results
    const error = req.session.data.error
    const change = req.session.data.change

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        id: "GE2-UA5D-4K6C-A"
    };

    loadData(req, "A02944934")

    if (results == "yes") {
        req.session.data.learnerInput = "aro"
    } else if (results == "no") {
        req.session.data.learnerInput = "tomas"

    }

    if (error == "missing") {
        req.session.data.learnerInput = ""
    } else if (error == "invalid") {
        req.session.data.learnerInput = "o"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/select-learner');
});

router.get('/add-new-learner', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        id: "ABC-UA5D-43BD-A",
        inClaim: "true"
    };

    loadData(req, "A02944934")

    if (error == "missing") {
        req.session.data.submitError = {
            nationalInsuranceNumber: "missing",
            familyName: "missing",
            givenName: "missing",
            jobTitle: "missing",
            learnerValid: false
        }
    } else if (error == "invalid") {
        req.session.data.submitError = {
            nationalInsuranceNumber: "invalid",
            familyName: "valid",
            givenName: "valid",
            jobTitle: "valid",
            learnerValid: false
        }
        req.session.data.familyName = "Smith"
        req.session.data.givenName = "John"
        req.session.data.nationalInsuranceNumber = "ZXCD"
        req.session.data.jobTitle = "Senior Caregiver"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../learner/add-learner');
});

router.get('/duplicate-learner', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        id: "ABC-UA5D-43BD-A",
        inClaim: "true",
        familyName: "Smith",
        givenName: "Braxton",
        nationalInsuranceNumber: "ZX 51 96 87 D",
        jobTitle: "Senior Caregiver"
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../learner/duplication');
});

router.get('/start-date', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: "ABC-UA5D-43BD-A"
    };

    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            dateValid: false
            }
    } else if (error == "policy") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "invalidPolicy",
            dateValid: false
            }
            req.session.data["activity-date-started-day"] = "02"
            req.session.data["activity-date-started-month"] = "04"
            req.session.data["activity-date-started-year"] = "2023"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/start-date');
});

router.get('/payment-date', function (req, res) {
    const error = req.session.data.error
    const paymentPlan  = req.session.data.paymentPlan
    const issue  = req.session.data.issue

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    if (paymentPlan == "true") {
        id = "IXD-E72Q-4KYG-C"
    } else {
        id = "GE2-UA5D-4K6C-A"
    }

    req.session.data.id = id

    loadData(req, "A02944934")

    if (error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            dateValid: false
            }
    } else if (error == "policy") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "invalidPolicy",
            dateValid: false
            }
            req.session.data["payment-date-started-day"] = "02"
            req.session.data["payment-date-started-month"] = "04"
            req.session.data["payment-date-started-year"] = "2023"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/cost-date');
});

router.get('/completion-date', function (req, res) {
    const error = req.session.data.error
    const type = req.session.data.type
    let id = null

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    if (type == "100") {
        id = "GE2-UA5D-4K6C-A"
    } else if (type == "40") {
        id = "IXD-E72Q-4KYG-C"
    }

    req.session.data.id = id
    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            dateValid: false
            }
    } else if (error == "policy") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "valid",
            policy: "invalidAfterStart",
            dateValid: false
        }
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/add-completion-date');
});

router.get('/evidence', function (req, res) {
    const error = req.session.data.error
    const type = req.session.data.type
    const deleteState = req.session.data.deleteState

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: "GE2-UA5D-4K6C-A",
        type
    };

    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.errorFileMissing = "true"
    } else if ( error == "toobig") {
        req.session.data.errorFileTooBig = "true"
    } else if ( error == "filetype") {
        req.session.data.errorWrongFileFormat = "true"
    }

    if ( deleteState == "true") {
        req.session.data.allDeleteSuccess = "true"
    } 

    // Redirect to the page you want to screenshot
    res.redirect('../claim/add-evidence');
});

router.get('/evidence-edit', function (req, res) {
    let id = null
    const error = req.session.data.error
    const type = req.session.data.type
    const max = req.session.data.max
    const deleteState = req.session.data.deleteState

    if (max == "true") {
        id = "ZSK-23VE-MXS4-B"
    } else {
        id = "GE2-UA5D-4K6C-A"
    }

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id,
        type
    };

    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.missingOption = "true"
    } else if ( error == "fail") {
        req.session.data.deleteError = "true"
    }

    if ( deleteState == "true") {
        req.session.data.deleteSuccess = "true"
    } 

    // Redirect to the page you want to screenshot
    res.redirect('../claim/add-evidence-edit');
});

router.get('/declaration', function (req, res) {
    let id = null
    const error = req.session.data.error
    const status = req.session.data.status

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        
    };

    loadData(req, "A02944934")

    if (status == "not-yet-submitted") {
        id = "GE2-UA5D-4K6C-A"
    } else if (status == "queried") {
        id = "CFD-EHS7-F43J-A"
    }

    req.session.data.id = id

    if ( error == "missing") {
        req.session.data.submitError = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/declaration');
});

router.get('/confirmation', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: "GE2-UA5D-4K6C-A"
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/confirmation');
});

router.get('/help-new-claim', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../guidance/help-start-tu-claim');
});

router.get('/help-evidence', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../guidance/tu-evidence-requirements');
});

router.get('/help-reimbursement-amounts', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../guidance/reimburse-amounts');
});

router.get('/duplicate-claim', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: 'GE2-UA5D-4K6C-A',
        dupeID: 'HMJ-74V3-T8V5-A',
        matchType: '100'
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/duplication');
});

router.get('/asc-wds-check', function (req, res) {

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: 'GE2-UA5D-4K6C-A'
    };

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/asc-wds-check');
});

router.get('/missing-GDL', function (req, res) {
    const userType = req.session.data.userType

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: 'signin',
        tabLocation: "claims",
        id: 'GE2-UA5D-4K6C-A'
    };

    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/missing-gdl');
});

router.get('/help-ommt', function (req, res) {
    const loggedIn = req.session.data.loggedIn

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
    };

    if (loggedIn == "true") {
        req.session.data.tabLocation = "claims"
    }

    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../guidance/ommt');
});

router.get('/missing-bank-details', function (req, res) {
    const userType = req.session.data.userType

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: 'signin',
        tabLocation: "claims",
        id: 'GE2-UA5D-4K6C-A'
    };

    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/missing-bank-details');
});

router.get('/previous-submissions', function (req, res) {
    let id = null
    const type = req.session.data.type
    const status = req.session.data.status
    const showNote = req.session.data.showNote
    const ommt  = req.session.data.ommt
    const paymentPlan  = req.session.data.paymentPlan

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        view: type
    };

    if (status == "queried") {
        if (type == "100") {
            id = "CWH-E4C7-FBXJ-A";
        } else if (type == "60") {
            id = "VJH-8Y37-EZNM-B";
        } else if (type == "40") {
            if (paymentPlan == "true") {
                id = "2NB-ISY7-86JH-C";
            } else {
                id = "SRX-A33U-BMUG-C";
            }
        }
    } else if (status == "submitted") {
        if (type == "100") {
            if (ommt == "1") {
                id = "SOM-MT33-JSK4-A";
            } else if (ommt == "2") {
                id = "FOM-MT12-JSK4-A";
            } else {
                id = "HMJ-74V3-T8V5-A";
            }
        } else if (type == "60") {
            id = "1SC-WE58-MT7W-B";
        } else if (type == "40") {
            id = "9JH-I94K-TPRB-C";
            if (paymentPlan == "true") {
                id = "NPU-H9DG-6L1T-C";
            } else {
                id = "9JH-I94K-TPRB-C";
            }
        }
    }

    req.session.data.id = id

    loadData(req, "A02944934")

    if (showNote == "true") {
        req.session.data.count = "1"
        req.session.data.submittedDate = "2025-02-02T11:52:30.850Z"
        req.session.data.showNote = "sixtyQuery"
        req.session.data.subCount = "1"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/previousSubmissionsTable');
});

module.exports = router