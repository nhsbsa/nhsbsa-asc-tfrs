const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const { loadData, loadUserData, loadScenarioData, getMostRelevantSubmission, getDraftSubmission } = require('../_helpers/helpers.js');


router.get('/before-you-start', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../claim-for-adult-social-care-learning-and-development');
});

router.get('/account-question', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Claims'
    };

    if (error== "true") {
        req.session.data.missingOption = true
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/what-do-you-want-to-do');
});

router.get('/account-details', function (req, res) {
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Claims'
    };

    if (error== "missing") {
        req.session.data.givenName = "",
        req.session.data.familyName= "",
        req.session.data.email= "",
        req.session.data.phone= "",
        req.session.data.submitError= {
            familyName: "missing",
            givenName: "missing",
            email: "missing",
            phone: "missing",
            userValid: false
        }
    } else if (error== "invalid") {
        req.session.data.givenName = "John",
        req.session.data.familyName= "Smith",
        req.session.data.email= "john.smithfakecarehome.com",
        req.session.data.phone= "7823598235905038",
        req.session.data.submitError= {
            familyName: "valid",
            givenName: "valid",
            email: "invalid",
            phone: "invalid",
            userValid: false
        }
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/account-details');
});

router.get('/existing-account', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims'
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/existing-account');
});

router.get('/sign-in', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/mfa-code');
});

router.get('/my-account', function (req, res) {
    const scenario = req.session.data.scenario
    const banner = req.session.data.banner
    let email = null
    
    delete req.session.data

    switch (scenario) {
        case "1":
            email = "mira.caldwell@caregroup.com";
            break;
        case "2":
            email = "valerie.altenwerth@caregroup.com";
            break;
        case "3":
            email = "john.prism@caregroup.com";
            break;
        case "4":
            email = "roy.hub@caregroup.co.uk";
            break;
        case "5":
            email = "hamish.settle@caregroup.com";
            break;
        case "6":
            email = "cynthia.bartoletti@caregroup.com";
            break;
        case "7":
            email = "mark.jacobs@caregroup.com";
            break;
    }

    req.session.data = {
        area: 'Claims'
    };

    if (banner == "saved") {
        req.session.data.banner = {
            action: "saveSuccess",
            orgName: "Kukri Care home",
            regRef: "R-8K0C-X5"
            }
    } else if (banner == "delete") {
        req.session.data.banner = {
            action: "deleteSuccess",
            orgName: "Juniper Care home",
            regRef: "R-175D-3H"
            }
    }

    loadScenarioData(req)
    loadUserData(req, email)

    // Redirect to the page you want to screenshot
    res.redirect('../manage-organisations');
});

router.get('/before-you-start-registration', function (req, res) {
    delete req.session.data
    req.session.data = {
        area: 'Claims'
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/before-you-start');
});

router.get('/org-name', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.orgNameEmptyError = true
    }
    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/org-name');
});

router.get('/sro-confirmation', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        orgName: "Kukri Care home"
    };

    if (error == "missing") {
        req.session.data.submitError = true
    }
    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/SRO-confirmation');
});

router.get('/not-sro', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        orgName: "Kukri Care home"
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/not-SRO');
});

router.get('/job-title', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.jobTitleEmptyError = true
    }
    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/job-title');
});

router.get('/org-address', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.submitError = {
            addressLine1: "missing",
            town: "missing",
            postcode: "missing",
            addressValid: false
        }
    } else if (error == "invalid") {
        req.session.data.addressLine1 = "4 Street"
        req.session.data.addressLine2 = ""
        req.session.data.addressLine3 = ""
        req.session.data.addressTown = "Town"
        req.session.data.addressCounty = ""
        req.session.data.addressPostcode = "Not a postcode"
        req.session.data.submitError = {
            addressLine1: "valid",
            town: "valid",
            postcode: "invalid",
            addressValid: false
        }
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/org-address');
});

router.get('/org-address-proof', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.submitError = {
            first: {
                type: "missing",
                file: "errorFileMissing"
            },
            second: {
                type: "missing",
                file: "errorFileMissing"
            },
            evidenceValid: false
        }
    } else if (error == "errorFileTooBig") {
        req.session.data.firstType = "businessratesbill"
        req.session.data.secondType = "utilitybill"
        req.session.data.firstEvidenceFile = "file1.pdf",
        req.session.data.secondEvidenceFile = "file2.pdf",
        req.session.data.submitError = {
            first: {
                type: "valid",
                file: "errorFileTooBig"
            },
            second: {
                type: "valid",
                file: "errorFileTooBig"
            },
            evidenceValid: false
        }
    } else if (error == "errorWrongFileFormat") {
        req.session.data.firstType = "businessratesbill"
        req.session.data.secondType = "utilitybill"
        req.session.data.firstEvidenceFile = "file1.pdf",
        req.session.data.secondEvidenceFile = "file2.pdf",
        req.session.data.submitError = {
            first: {
                type: "valid",
                file: "errorWrongFileFormat"
            },
            second: {
                type: "valid",
                file: "errorWrongFileFormat"
            },
            evidenceValid: false
        }
    } else if (error == "sametype") {
        req.session.data.firstType = "businessratesbill"
        req.session.data.secondType = "businessratesbill"
        req.session.data.firstEvidenceFile = "file1.pdf",
        req.session.data.secondEvidenceFile = "file2.pdf",
        req.session.data.submitError = {
            first: {
                type: "valid",
                file: null
            },
            second: {
                type: "notDifferent",
                file: null
            },
            evidenceValid: false
        }
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/org-address-evidence');
});

router.get('/asc-wds-id', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.workplaceIDEmpty = true
    } else if (error == "invalid") {
        req.session.data.orgID = "£75F:F",
        req.session.data.workplaceIDInvalid = true
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/asc-wds-id');
});

router.get('/is-this-you', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        orgID: "G03944234",
        orgName: "Kukri Care home"
    };

    if (error == "missing") {
        req.session.data.detailCorrectRadioMissing = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/is-this-you');
});

router.get('/not-you', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        orgName: "Kukri Care home"
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/not-you');
});

router.get('/asc-wds-already-in-use', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        orgID: "A02944934"
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/workplace-id-already-onboarded');
});

router.get('/companies-house', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.chRadioMissing = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/companies-house');
});

router.get('/companies-house-number', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.companiesHouseRegNumberEmptyError = "true"
    } else if (error == "invalid") {
        req.session.data.companiesHouseRegNumber = "1235412351235"
        req.session.data.companiesHouseRegNumberInvalid = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/companies-house-registration-number');
});

router.get('/vat-registered', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.vatRadioMissing = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/vat-registered');
});

router.get('/vat-number', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.vatRegNumberEmptyError = "true"
    } else if (error == "invalid") {
        req.session.data.vatRegNumber = "24356457$%^"
        req.session.data.vatRegNumberInvalid = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/vat-registration-number');
});

router.get('/check-your-answers', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../load-registration?regRef=R-1C5V-7H');
});

router.get('/registration-declaration', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.declarationSubmitError = "true"
    }

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/declaration');
});

router.get('/registration-confirmation', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        regRef: "R-1C5V-7H"
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/registration-submitted-confirmation');
});

router.get('/view-registration', function (req, res) {
    const scenario = req.session.data.scenario
    delete req.session.data
    let regRef = null

    switch (scenario) {
        case "1":
            regRef = "R-2P9F-5Z";
            break;
        case "2":
            regRef = "R-6E8K-4J";
            break;
    }

    req.session.data = {
        area: 'Claims',
        regRef
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../registration/registration-details');
});

router.get('/delete-registration', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        regRef: 'R-1C5V-7H'
    };

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")

    // Redirect to the page you want to screenshot
    res.redirect('../manage-orgs/delete-registration-confirmation');
});

router.get('/add-phone-number', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims',
        phoneNumber: "sldhshg"
    };

    if (error == "missing") {
        req.session.data.submitError = "missing"
    } else if (error == "invalid") {
        req.session.data.submitError = "invalid"
    }

    loadScenarioData(req)
    loadUserData(req, "mark.jacobs@caregroup.com")

    // Redirect to the page you want to screenshot
    res.redirect('../manage-orgs/add-phone-number');
});

router.get('/verify-details-registration', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.submitError = true
    }

    loadScenarioData(req)
    loadUserData(req, "cynthia.bartoletti@caregroup.com")
    loadData(req, "D76397203")

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/verify-details');
});

router.get('/incorrect-details-registration', function (req, res) {
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    loadScenarioData(req)
    loadUserData(req, "cynthia.bartoletti@caregroup.com")
    loadData(req, "D76397203")

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/account-issue');
});

router.get('/job-title-complete-registration', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.jobTitleEmptyError = true
    }
    loadScenarioData(req)
    loadUserData(req, "cynthia.bartoletti@caregroup.com")

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/job-title');
});

router.get('/gdl-complete-registration', function (req, res) {
    const error = req.session.data.error
    delete req.session.data

    req.session.data = {
        area: 'Claims'
    };

    if (error == "missing") {
        req.session.data.declarationSubmitError = "true"
    }
    loadScenarioData(req)
    loadUserData(req, "cynthia.bartoletti@caregroup.com")

    // Redirect to the page you want to screenshot
    res.redirect('../change-sro/declaration');
});

router.get('/sign-new-gdl', function (req, res) {

    const scenario = req.session.data.scenario
    const error = req.session.data.error
    let org = null

    switch (scenario) {
        case "1":
            org = "F87223491";
            break;
        case "2":
            org = "D76397203";
            break;
    }

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, org)

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/sign-new-gdl');
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
    
    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../support-pages/contact');
});

router.get('/terms-of-use', function (req, res) {
  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../support-pages/terms-of-use');
});

router.get('/accessibility', function (req, res) {
  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../support-pages/accessibility-statement');
});

router.get('/email', function (req, res) {
    let email = null
    const scenario = req.session.data.scenario

  delete req.session.data
    req.session.data = {
        area: 'Claims'
    };

    switch (scenario) {
        case "1":
        email = "roy.hub@caregroup.co.uk";
        break;

        case "2":
        email = "craig.willowtree@caregroup.com";
        break;

        case "3":
        email = "calsey.huel@caregroup.com";
        break;

        case "4":
        email = "mark.jacobs@caregroup.com";
        break;

        case "5":
        email = "terri.jeffords@caregroup.com";
        break;
    }

    loadScenarioData(req)
    loadUserData(req, email)

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "B13299931")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/email-expiry');
});

router.get('/authentication-verify-details', function (req, res) {
    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation",
        orgID: "E76904778"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "E76904778")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/verify-details');
});

router.get('/sign-in', function (req, res) {

    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation",
        orgID: "E76904778"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "E76904778")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/sign-in');
});

router.get('/mfa', function (req, res) {

    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation",
        orgID: "E76904778"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "E76904778")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/mfa');
});

router.get('/mfa-code', function (req, res) {

    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: "creation",
        orgID: "E76904778"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "E76904778")

    // Redirect to the page you want to screenshot
    res.redirect('../authentication/mfa-code');
});

router.get('/registration-bank-details', function (req, res) {

    const error = req.session.data.error


  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: "creation",
        tabLocation: "bankDetails",
        orgID: "E76904778",
        user: {
            givenName: "Roy",
            familyName: "Hub",
            email: "roy.hub@caregroup.co.uk"
        }
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "E76904778")

    if ( error == "missing") {
        req.session.data.submitError = {
            accountName: "missing",
            sortCode: "missing",
            accountNumber: "missing",
            buildingSociety: "valid",
            api: "valid",
            bankDetailsValid: false
        }
    } else if ( error == "invalid") {
        req.session.data.submitError = {
            accountName: "invalid",
            sortCode: "invalid",
            accountNumber: "invalid",
            buildingSociety: "invalid",
            api: "valid",
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
            api: "valid",
            bankDetailsValid: false
        }
        req.session.data.nameOnTheAccount = "John Smith",
        req.session.data.sortCode = "1234567",
        req.session.data.accountNumber = "123456789",
        req.session.data.rollNumber = "12345678901234567890"
    } else if ( error == "api") {
        req.session.data.submitError = {
            accountName: "valid",
            sortCode: "valid",
            accountNumber: "valid",
            buildingSociety: "valid",
            api: "invalid",
            bankDetailsValid: false
        }
        req.session.data.nameOnTheAccount = "John Smith",
        req.session.data.sortCode = "123456",
        req.session.data.accountNumber = "12345678"
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
        tabLocation: "bankDetails",
        user: {
            givenName: "Roy",
            familyName: "Hub",
            email: "roy.hub@caregroup.co.uk"
        }
    };

    switch (scenario) {
        case "1":
        orgID = "E76904778";
        break;

        case "2":
        orgID = "C63281491";
        break;

        case "3":
        orgID = "F87223491";
        break;

        case "4":
        orgID = "G91371231";
        break;
    }

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, orgID)

    if ( resend == "success") {
        req.session.data.invite = "success"
        req.session.data.resendList = ["zane.montgomery@caregroup.com"]
        req.session.data.matchResendUser = {
            givenName: "Zane",
            familyName: "Montgomery",
            email: "zane.montgomery@caregroup.com",
            status: "invited"
        }
    } else if (resend == "fail") {
        req.session.data.invite = "failure"
        req.session.data.matchResendUser = {
            givenName: "Zane",
            familyName: "Montgomery",
            email: "zane.montgomery@caregroup.com",
            status: "invited"
        }
    }
    
    if (deleteType == "invited") {
        req.session.data.deleteSuccess = "true"
        req.session.data.deletedUser = "invited"
        req.session.data.matchDeletedUser = {
            givenName: "John",
            familyName: "Smith",
            email: "john.smith@caregroup.com",
            status: "inactive"
        }
    } else if (deleteType == "registered") {
        req.session.data.deleteSuccess = "true"
        req.session.data.deletedUser = "active"
        req.session.data.matchDeletedUser = {
            givenName: "John",
            familyName: "Smith",
            email: "john.smith@caregroup.com",
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        req.session.data.email = "zane.montgomery@caregroup.com"
    }

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
    loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "B13299931")

    if (scenario == "registered") {
        req.session.data.deletedEmail = "lionel.lowe@caregroup.co.uk"
    } else if (scenario == "invited") {
        req.session.data.deletedEmail = "zane.montgomery@caregroup.com"
    }

    if (error == "true") {
        req.session.data.deleteError = true
    }

    // Redirect to the page you want to screenshot
    res.redirect('../org-admin/delete-user-confirmation');
});

router.get('/manage-claims', function (req, res) {
    let orgID = null
    let email = null
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
        email = "roy.hub@caregroup.co.uk";
        break;

        case "2":
        orgID = "G91774723";
        email = "roy.hub@caregroup.co.uk";
        break;

        case "3":
        orgID = "F87223491";
        email = "roy.hub@caregroup.co.uk";
        break;

        case "4":
        orgID = "G91371231";
        email = "roy.hub@caregroup.co.uk";
        break;

        case "5":
        orgID = "C63281491";
        email = "roy.hub@caregroup.co.uk";
        break;

        case "6":
        orgID = "H26749203";
        email = "hamish.settle@caregroup.com";
        break;

        case "7":
        orgID = "F84625987";
        email = "hamish.settle@caregroup.com";
        break;
    }

    loadScenarioData(req)
    loadUserData(req, email)
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
    const learnerCount = req.session.data.learnerCount
    const banner = req.session.data.banner

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
                if (learnerCount == "multi") {
                    id = "4RE-EHMM-1W4J-A";
                } else if (learnerCount == "single") {
                    id = "G5W-W3VK-BLA1-A";
                }
                break;

            case "100ommt":
                if (learnerCount == "multi") {
                    id = "HER-F7X2-W9E1-A";
                } else if (learnerCount == "single") {
                    id = "K1K-3PVG-CRET-A";
                }
                break;

            case "60":
                id = "VKA-JZM3-64J1-B";
                break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                        id = "R95-W1JE-Y784-C";
                        break;
                    case "false":
                        id = "U97-SJ15-4GZU-C";
                        break;
                }
                break;
        }
        break;

        case "queried":
        switch (type) {
            case "100":
                if (learnerCount == "multi") {
                    id = "HZE-PYRI-EN4T-A";
                } else if (learnerCount == "single") {
                    id = "HQQ-BWKI-MKJY-A";
                }
                break;
            
            case "100ommt":
                if (learnerCount == "multi") {
                    id = "1KF-1BHM-U4SU-A";
                } else if (learnerCount == "single") {
                    id = "9WI-4TMM-JXAF-A";
                }
                break;

            case "60":
                id = "A37-1YK1-CE1R-B";
                break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                        id = "GH5-FGAE-TKRT-C";
                        break;
                    case "false":
                        id = "WVN-NHAU-TTES-C";
                        break;
                }
                break;
        }
        break;

        case "submitted":
        switch (type) {
            case "100":
                if (learnerCount == "multi") {
                    id = "G4H-9D4M-N6IX-A";
                } else if (learnerCount == "single") {
                    id = "YWR-8RPJ-R4YF-A";
                }
                break;
            
            case "100ommt":
                if (learnerCount == "multi") {
                    id = "V82-MHDY-E2LJ-A";
                } else if (learnerCount == "single") {
                    id = "ZIK-TZ5Q-ANEZ-A";
                }
                break;

            case "60":
                id = "3Z2-Z2IB-6QIA-B";
                break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                        id = "U83-6VEU-73L7-C";
                        break;
                    case "false":
                        id = "2VY-XHXI-RJX6-C";
                        break;
                }
                break;
        }
        break;

        case "approved":
        switch (type) {
            case "100":
                if (learnerCount == "multi") {
                    id = "Y61-QY4U-2196-A";
                } else if (learnerCount == "single") {
                    id = "X56-8B8L-MG6E-A";
                }
                break;
            
            case "100ommt":
                if (learnerCount == "multi") {
                    id = "UDK-INCZ-9XN7-A";
                } else if (learnerCount == "single") {
                    id = "P78-G1Y8-GLFS-A";
                }
                break;

            case "60":
                id = "U97-SJ15-4GZU-B";
                break;

            case "40":
                switch (paymentPlan) {
                    case "true":
                        id = "7NS-TE5B-BV3C-C";
                        break;
                    case "false":
                        id = "L91-4CCR-Q8HC-C";
                        break;
                }
            break;
        }
        break;

        case "rejected":
        switch (type) {
            case "100":
                if (learnerCount == "multi") {
                    id = "F5P-S23L-94A2-A";
                } else if (learnerCount == "single") {
                    id = "VHL-EDE7-2EEC-A";
                }
                break;
            
            case "100ommt":
                if (learnerCount == "multi") {
                    id = "82M-AB5B-UL36-A";
                } else if (learnerCount == "single") {
                    id = "6GP-H2SS-UIYS-A";
                }
                break;

            case "60":
                id = "3BV-5EQS-8ZPI-B";
                break;

            case "40":
            switch (paymentPlan) {
                    case "true":
                        id = "6ZG-2EVR-WWL3-C";
                        break;
                    case "false":
                        id = "T9B-786Q-WK62-C";
                        break;
                }
            break;
        }
        break;

        case "new":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "QQP-L6TW-38BG-A";
            } else {
                id = "Z76-PS55-Q2K7-A";
            }
            
            break;

            case "60":
            id = "5S9-K4V3-KS56-B";
            break;
        }
        break;

    }

    req.session.data.id = id

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

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
        if (type == "100") {
            req.session.data.submitError.startDate = null
        }
    } else if (error == "missing2") {
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
        for (const claim of req.session.data.claims) {
                if (claim.claimID == id) {
                    const submission = getMostRelevantSubmission(claim)
                    for (const learner of submission.learners) {
                        learner.completionDate = null
                        learner.evidenceOfCompletion = null
                    }
                }
            }
    } else if (error == "missing3" && paymentPlan == "false") {
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
    } else if (error == "missing3" && paymentPlan == "true") {
        req.session.data.submitError = {
            learner: "valid",
            startDate: "valid",
            paymentDate: "missing",
            evidenceOfPayment: "missing",
            evidenceOfCompletion: "missing",
            completionDate: "missing",
            change: true,
            claimValid: false
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
            paymentDate: "inFuture",
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
                    submission.costDate = "2024-08-15T23:55:44.062Z"
                    submission.evidenceOfCompletion = "certificate1.pdf"
                }
            }
    } else if (error == "noedits") {
        switch (type) {
            case "100":
                if (learnerCount == "multi") {
                    id = "HZE-PYRI-EN4T-A";
                } else if (learnerCount == "single") {
                    id = "RKS-RP75-JB2P-A";
                    for (const claim of req.session.data.claims) {
                        if (claim.claimID == id) {
                            const submission = getMostRelevantSubmission(claim)
                            submission.learners[0].learnerID = "WS 54 2F 01 E"
                            submission.learners[0].learnerChanged = null
                        }
                    }
                }
                break;

            case "60":
                id = "VIM-5JSV-GQUS-B";
                break;

            case "40":
                id = "WVN-NHAU-TTES-C";
                break;
        }

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
        }
    
        if (banner == "remove") {
            req.session.data.learnerConfirmation = {
                type: "removal",
                learner: "AJ 54 4F 01 I"
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
        id: "4RE-EHMM-1W4J-A"

    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        req.session.data.id = "5S9-K4V3-KS56-B"
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
        tabLocation: "claims",
        trainingSelection: "601/7262/9",
        viewOnly: "false"
    };

    req.session.data["training-input"] = "manage"

    if ( error == "true") {
        req.session.data.submitError = "true"
    }

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: "Z76-PS55-Q2K7-A"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

router.get('/add-another-learner', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        id: "4RE-EHMM-1W4J-A"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if (error == "true") {
        req.session.data.submitError = "true"
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/add-another-learner');
});

router.get('/add-new-learner', function (req, res) {
    const error = req.session.data.error

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: "signatory",
        journey: "signin",
        tabLocation: "claims",
        id: "Z76-PS55-Q2K7-A",
        inClaim: "true"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: "Z76-PS55-Q2K7-A",
        inClaim: "true",
        familyName: "Smith",
        givenName: "Braxton",
        nationalInsuranceNumber: "ZX 51 96 87 D",
        jobTitle: "Senior Caregiver"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: "5S9-K4V3-KS56-B"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            policy: "valid",
            dateValid: false
            }
    } else if (error == "policy") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "valid",
            policy: "invalidPolicy",
            dateValid: false
            }
            req.session.data["activity-date-started-day"] = "02"
            req.session.data["activity-date-started-month"] = "04"
            req.session.data["activity-date-started-year"] = "2023"
    }  else if (error == "future") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "inFuture",
            policy: "valid",
            dateValid: false
            }
            req.session.data["activity-date-started-day"] = "02"
            req.session.data["activity-date-started-month"] = "04"
            req.session.data["activity-date-started-year"] = "2028"
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
        id = "R95-W1JE-Y784-C"
    } else {
        id = "Z76-PS55-Q2K7-A"
    }

    req.session.data.id = id

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if (error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            policy: "valid",
            dateValid: false
            }
    } else if (error == "policy") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "valid",
            policy: "invalidPolicy",
            dateValid: false
            }
            req.session.data["payment-date-started-day"] = "02"
            req.session.data["payment-date-started-month"] = "04"
            req.session.data["payment-date-started-year"] = "2023"
        } else if (error == "future") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "inFuture",
            policy: "valid",
            dateValid: false
            }
            req.session.data["payment-date-started-day"] = "02"
            req.session.data["payment-date-started-month"] = "04"
            req.session.data["payment-date-started-year"] = "2029"
    } else if (error == "startDate") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "valid",
            policy: "invalidAfterStart",
            dateValid: false
            }
            req.session.data["payment-date-started-day"] = "02"
            req.session.data["payment-date-started-month"] = "04"
            req.session.data["payment-date-started-year"] = "2023"
    } else if (error == "sixtyPaymentDate") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "valid",
            policy: "invalidAfterPayment",
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
        tabLocation: "claims",
        learnerID: "CM 61 1F 12 E"
    };

    if (type == "100") {
        id = "G5W-W3VK-BLA1-A"
    } else if (type == "40") {
        id = "U97-SJ15-4GZU-C"
    }

    req.session.data.id = id
    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if ( error == "missing") {
        req.session.data.submitError = {
            year: "missing",
            month: "missing",
            day: "missing",
            date: "allMissing",
            policy: "valid",
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
    } else if (error == "future") {
        req.session.data.submitError = {
            year: "valid",
            month: "valid",
            day: "valid",
            date: "inFuture",
            policy: "valid",
            dateValid: false
        }
        req.session.data["completion-date-started-day"] = "02"
        req.session.data["completion-date-started-month"] = "04"
        req.session.data["completion-date-started-year"] = "2029"
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
        id: "G5W-W3VK-BLA1-A",
        learnerID: "CM 61 1F 12 E",
        type
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id = "G5W-W3VK-BLA1-A"
    } else {
        id = "7JP-X9LK-1QXE-A"
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if (status == "not-yet-submitted") {
        id = "7JP-X9LK-1QXE-A"
    } else if (status == "queried") {
        id = "HQQ-BWKI-MKJY-A"
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
        id: "7JP-X9LK-1QXE-A"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: "JD3-HDT3-JDK2-A",
        matchingIDs: [
            {
                slotID: 1,
                learnerID: "KQ 01 7F 72 D",
                learnerChanged: null,
                completionDate: "2025-11-23T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            },
            {
                slotID: 2,
                learnerID: "GR 03 6F 10 P",
                learnerChanged: null,
                completionDate: "2025-11-16T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            },
            {
                slotID: 4,
                learnerID: "FI 50 5F 30 D",
                learnerChanged: null,
                completionDate: "2025-11-16T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            },
            {
                slotID: 6,
                learnerID: "QB 54 8F 21 X",
                learnerChanged: null,
                completionDate: "2025-11-20T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            },
            {
                slotID: 3,
                learnerID: "FS 47 4F 68 U",
                learnerChanged: null,
                completionDate: "2025-11-17T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            },
            {
                slotID: 5,
                learnerID: "WV 15 0F 13 V",
                learnerChanged: null,
                completionDate: "2025-11-16T07:19:31.596Z",
                evidenceOfCompletion: "certificate-212.pdf",
                evidenceOfCompletionReview: {
                outcome: null,
                note: null
                }
            }
        ]
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: '7JP-X9LK-1QXE-A'
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: 'G5W-W3VK-BLA1-A'
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
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
        id: 'G5W-W3VK-BLA1-A'
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/missing-bank-details');
});

router.get('/not-yet-verified-bank-details', function (req, res) {
    const userType = req.session.data.userType

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: 'signin',
        tabLocation: "claims",
        id: 'G5W-W3VK-BLA1-A'
    };
    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/unverified-bank-details');
});

router.get('/rejected-bank-details', function (req, res) {
    const userType = req.session.data.userType

  delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType,
        journey: 'signin',
        tabLocation: "claims",
        id: 'G5W-W3VK-BLA1-A'
    };
    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "F87223491")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/rejected-bank-details');
});

router.get('/claim-history', function (req, res) {
    let id = null
    const type = req.session.data.type
    const status = req.session.data.status

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    switch (type) {
        case "100":
            if (status == "not-yet-submitted") {
                id = "URC-YAE4-6BDV-A";
            } else if (status == "submitted") {
                id = "CEK-BMS6-7M5W-A";
            } else if (status == "queried") {
                id = "337-TCSP-QEDR-A";
            } else if (status == "resubmitted") {
                id = "LE5-VQJS-FPSB-A";
            } else if (status == "approved") {
                id = "TYB-PEUI-74YT-A";
            } else if (status == "rejected") {
                id = "L9S-FMIX-Z41P-A";
            } 
            break;
        case "60":
            if (status == "not-yet-submitted") {
                id = "VKA-JZM3-64J1-B";
            } else if (status == "submitted") {
                id = "3Z2-Z2IB-6QIA-B";
            } else if (status == "queried") {
                id = "VIM-5JSV-GQUS-B";
            } else if (status == "resubmitted") {
                id = "QZP-3H4J-AA4V-B";
            } else if (status == "approved") {
                id = "U97-SJ15-4GZU-B";
            } else if (status == "rejected") {
                id = "3BV-5EQS-8ZPI-B";
            } 
            break;
        case "40":
            if (status == "submitted") {
                id = "U83-6VEU-73L7-C";
            } else if (status == "queried") {
                id = "WVN-NHAU-TTES-C";
            } else if (status == "resubmitted") {
                id = "24G-5H6R-V2J1-C";
            } else if (status == "approved") {
                id = "7NS-TE5B-BV3C-C";
            } else if (status == "rejected") {
                id = "T5L-J5HX-SH61-C";
            } 
            break;
    }

    req.session.data.id = id

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/claim-history');
});


router.get('/claim-history-note', function (req, res) {
    const type = req.session.data.type
    const form = req.session.data.form

    delete req.session.data
    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    switch (type) {
        case "queried":
            req.session.data.reasonType = "queried"
            req.session.data.loopCount = "0"
            if (form == "payment") {
                req.session.data.type = "60",
                req.session.data.id = "VIM-5JSV-GQUS-B"
            } else if (form == "completion") {
                req.session.data.type = "40",
                req.session.data.id = "HTN-HNHV-73WD-C"
            } else if ( form == "both") {
                req.session.data.type = "100",
                req.session.data.id = "HZE-PYRI-EN4T-A"
            }
            break;
        case "rejected":
            req.session.data.reasonType = "rejected"
            req.session.data.loopCount = "0"
            if (form == "payment") {
                req.session.data.type = "60",
                req.session.data.id = "YX2-4IYA-EBUL-B"
            } else if (form == "completion") {
                req.session.data.type = "40",
                req.session.data.id = "T9B-786Q-WK62-C"
            } else if ( form == "both") {
                req.session.data.type = "100",
                req.session.data.id = "L9S-FMIX-Z41P-A"
            }
            break;
    }

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    // Redirect to the page you want to screenshot
    res.redirect('../claim/claim-history-note');
});

router.get('/manage-learners', function (req, res) {
    const status = req.session.data.status
    const tab = req.session.data.tab
    const learners = req.session.data.learners
    const sharedDate = req.session.data.sharedDate
    const banner = req.session.data.banner
    delete req.session.data

    let id = null

    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims"
    };

    switch (status) {
        case "not-yet-submitted":
            id = "7JP-X9LK-1QXE-A"
            break;
        case "queried":
            id = "1IT-6S33-FB36-A"
            break;
        case "submitted":
            id = "LE5-VQJS-FPSB-A"
            break;
        case "approved":
            id = "4I9-WCXV-WDSH-A"
            break;
        case "rejected":
            id = "L9S-FMIX-Z41P-A"
            break;
    }



    req.session.data.id = id
    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    if (status == "not-yet-submitted" && ((tab == "todo" && learners == "full") || (tab == "done" && learners == "empty"))) {
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getMostRelevantSubmission(claim)
                submission.sharedCompletionDate = null
                for (const learner of submission.learners) {
                    learner.evidenceOfCompletion = null
                    learner.completionDate = null
                }
            }
        } 
    }

    if (status == "not-yet-submitted" && tab == "done" && learners == "full" && sharedDate == "true") {
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getMostRelevantSubmission(claim)
                submission.sharedCompletionDate = true
                for (const learner of submission.learners) {
                    learner.completionDate = "2025-12-23T04:42:51.601Z"
                }
            }
        } 
    }

    if (status == "queried" && ((tab == "needsaction" && learners == "empty") || (tab == "actioned" && learners == "full"))) {
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const draftSubmission = getDraftSubmission(claim)
                const submission = getMostRelevantSubmission(claim)
                for (const learner of draftSubmission.learners) {
                    const matchedLearner = submission.learners.find(item => item.slotID === learner.slotID);
                    if (matchedLearner.evidenceOfCompletionReview.outcome == "queried" || matchedLearner.evidenceOfCompletionReview.outcome == "rejected") {
                        learner.evidenceOfCompletion = "certificate2141.pdf"
                        learner.actioned = true
                    }
                }
            }
        } 
    }

    if (status == "queried" && tab == "removed" && learners == "full") {
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getDraftSubmission(claim)
                submission.removedLearners = submission.learners[0]
                submission.learners.shift()
            }
        } 
    }

    if (banner == "singleComp") {
        req.session.data.learnerConfirmation = {
            type: "date",
            learner: "WV 15 0F 13 V"
        };
    } else if (banner == "sharedComp") {
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getMostRelevantSubmission(claim)
                submission.sharedCompletionDate = true
                for (const learner of submission.learners) {
                    learner.completionDate = "2025-12-23T04:42:51.601Z"
                }
            }
        }
        req.session.data.learnerConfirmation = {
            type: "date",
            allLearners: true
        };
    } else if (banner == "evidence") {
        req.session.data.learnerConfirmation = {
            type: "evidence",
            learner: "WV 15 0F 13 V"
        };
    } else if (banner == "movedToDone") {
        req.session.data.learnerConfirmation = {
            type: "actioned",
            learner: "KZ 79 0F 13 Z"
        };
    } else if (banner == "movedToEdits") {
        req.session.data.learnerConfirmation = {
            type: "needsaction",
            learner: "KZ 79 0F 13 Z"
        };
    } else if (banner == "removed1") {
        req.session.data.learnerConfirmation = {
            type: "removal",
            learner: "AJ 54 4F 01 I"
        };
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getMostRelevantSubmission(claim)
                submission.removedLearners = submission.learners[0]
                submission.learners.shift()
            }
        } 
    } else if (banner == "removed2") {
        req.session.data.learnerConfirmation = {
            type: "removal",
            learner: "SE 52 1F 13 K"
        };
        for (const claim of req.session.data.claims) {
            if (claim.claimID == id) {
                const submission = getDraftSubmission(claim)
                for (const learner of submission.learners){
                    if (learner.learnerID == req.session.data.learnerConfirmation.learner) {
                        submission.removedLearners = learner
                    }
                }
                submission.learners - submission.learners.filter(item => item.learnerID !== req.session.data.learnerConfirmation.learner);
            }
        } 
    }

    // Redirect to the page you want to screenshot
    res.redirect('../claim/claim-learners#' + tab);
});

router.get('/remove-learner-confirmation', function (req, res) {

    req.session.data = {
        area: 'Claims',
        userType: 'signatory',
        journey: 'signin',
        tabLocation: "claims",
        id: "7JP-X9LK-1QXE-A",
        learner: "AJ 54 4F 01 I"
    };

    loadScenarioData(req)
loadUserData(req, "roy.hub@caregroup.co.uk")
    loadData(req, "A02944934")

    res.redirect('../claim/remove-learner-confirmation');
});

module.exports = router