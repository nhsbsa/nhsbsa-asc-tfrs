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
        req.session.data.orgID = "A02944934"
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
    const userType = req.session.data.userType
    const confirmation = req.session.data.confirmation
    const paymentPlan = req.session.data.paymentPlan
    const ommt = req.session.data.ommt

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType,
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "A02944934",
        claimScreen: "claim"
    };

    switch (status) {
        case "submitted":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "PSV-TY16-39ER-A";
            } else {
                id = "LE5-VQJS-FPSB-A";
            }
            
            break;

            case "60":
            id = "QZP-3H4J-AA4V-B";
            break;

            case "40":
            if (paymentPlan == "true") {
                id = "U83-6VEU-73L7-C";
            } else {
                id = "2VY-XHXI-RJX6-C";
            }
            break;
        }
        break;

        case "inprogress":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "DRE-M1X4-P9UL-A";
            } else {
                id = "8PF-8G5B-2MBN-A";
            }
            
            break;

            case "60":
            id = "BND-4Z57-JR5I-B";
            break;

            case "40":
            if (paymentPlan == "true") {
                id = "UX8-PXM5-B1SX-C";
            } else {
                id = "GT8-2R4R-MN7Y-C";
            }
            break;
        }
        break;

        case "queried":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "7AB-RBDV-RICD-A";
            } else {
                id = "S8U-ME8U-2A6D-A";
            }
            break;

            case "60":
            id = "A37-1YK1-CE1R-B";
            break;

            case "40":
            if (paymentPlan == "true") {
                id = "GH5-FGAE-TKRT-C";
            } else {
                id = "WVN-NHAU-TTES-C";
            }
            break;
        }
        break;

        case "approved":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "JKR-12X8-I4DV-A";
            } else {
                id = "TYB-PEUI-74YT-A";
            }
            break;

            case "60":
            id = "L91-4CCR-Q8HC-B";
            break;

            case "40":
            if (paymentPlan == "true") {
                id = "7NS-TE5B-BV3C-C";
            } else {
                id = "L91-4CCR-Q8HC-C";
            }
            break;
        }
        break;

        case "rejected":
        switch (type) {
            case "100":
            if (ommt == "true") {
                id = "U4D-RCMZ-83FB-A";
            } else {
                id = "L9S-FMIX-Z41P-A";
            }
            break;

            case "60":
            id = "3BV-5EQS-8ZPI-B";
            break;

            case "40":
            if (paymentPlan == "true") {
                id = "6ZG-2EVR-WWL3-C";
            } else {
                id = "T9B-786Q-WK62-C";
            }
            break;
        }
        break;

    }

    req.session.data.id = id

    loadData(req)

    if ( confirmation == "true") {
        req.session.data.processSuccess = "true"
    } 

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/processing', function (req, res) {
    let id = null
    const type = req.session.data.type
    const step = req.session.data.step
    const radio = req.session.data.radio
    const result = req.session.data.result
    const error = req.session.data.error

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "A02944934"
    };

    if (step == "payment") {
        req.session.data.claimScreen = "inProgress"
        req.session.data.claimStep = "payment"
        if (radio != null) {
            req.session.data.payment = radio
        }
    } else if (step == "completion") {
        req.session.data.claimScreen = "inProgress"
        req.session.data.claimStep = "completion"
        req.session.data.learnerCount = "1"
        if (radio != null) {
            req.session.data.completion = radio
        }
    } else if (step == "checkList") {
        req.session.data.claimScreen = "checkList"
    } else if (step == "confirmOutcome") {
        req.session.data.claimScreen = "confirmOutcome"
        req.session.data.result = result
    }  else if (step == "confirmation") {
        req.session.data.claimScreen = "claim"
        req.session.data.processSuccess = "true"
    }

    if (step == "checkList") {
        switch (type) {
            case "100Single":
                id = "R15-7PE8-YQAX-A";
                break;
            case "100Multi":
                id = "1VL-F4AI-31U6-A";
                break;
            case "100OMMTSingle":
                id = "TS3-31IE-6KSJ-A";
                break;
            case "100OMMTMulti":
                id = "FYR-3YLD-JQJV-A";
                break;
            case "60":
                id = "BND-4Z57-JR5I-B";
                break;
            case "40":
                id = "GT8-2R4R-MN7Y-C";
                break;
            case "40PP":
                id = "UX8-PXM5-B1SX-C";
                break;
        }
    } else if (step == "confirmOutcome" || step == "confirmation") {
        switch (type) {
            case "100Single":
                switch (result) {
                    case "approve":
                        id = "2RS-W66G-VEHS-A";
                        break;
                    case "queried":
                        id = "RKS-RP75-JB2P-A";
                        break;
                    case "reject":
                        id = "UJH-9C9P-2HJG-A";
                        break;
                }
                break;
            case "100Multi":
                switch (result) {
                    case "approve":
                        id = "FTU-IPU5-Y6D4-A";
                        break;
                    case "queried":
                        id = "337-TCSP-QEDR-A";
                        break;
                    case "reject":
                        id = "U5M-XHPU-JZYL-A";
                        break;
                }
                break;
            case "100OMMTSingle":
                switch (result) {
                    case "approve":
                        id = "4UX-X3GZ-2MUS-A";
                        break;
                    case "queried":
                        id = "NPY-UNL7-KWXY-A";
                        break;
                    case "reject":
                        id = "IV4-FURZ-4U9G-A";
                        break;
                }
                break;
            case "100OMMTMulti":
                switch (result) {
                    case "approve":
                        id = "4UX-X3GZ-2MUS-A";
                        break;
                    case "queried":
                        id = "NPY-UNL7-KWXY-A";
                        break;
                    case "reject":
                        id = "IV4-FURZ-4U9G-A";
                        break;
                }
                break;
            case "60":
                switch (result) {
                    case "approve":
                        id = "KNL-K98E-VSA8-B";
                        break;
                    case "queried":
                        id = "A37-1YK1-CE1R-B";
                        break;
                    case "reject":
                        id = "YX2-4IYA-EBUL-B";
                        break;
                }
                break;
            case "40":
                switch (result) {
                    case "approve":
                        id = "KNL-K98E-VSA8-C";
                        break;
                    case "queried":
                        id = "WVN-NHAU-TTES-C";
                        break;
                    case "reject":
                        id = "T5L-J5HX-SH61-C";
                        break;
                }
                break;
            case "40PP":
                switch (result) {
                    case "approve":
                        id = "7NS-TE5B-BV3C-C";
                        break;
                    case "queried":
                        id = "GH5-FGAE-TKRT-C";
                        break;
                    case "reject":
                        id = "6ZG-2EVR-WWL3-C";
                        break;
                }
                break;
        }
    } else {
        switch (type) {
            case "100Single":
                id = "K8T-2R2P-G6K9-A";
                break;
            case "100Multi":
                id = "LE5-VQJS-FPSB-A";
                break;
            case "100OMMTSingle":
                id = "ZIK-TZ5Q-ANEZ-A";
                break;
            case "100OMMTMulti":
                id = "PSV-TY16-39ER-A";
                break;
            case "60":
                id = "QZP-3H4J-AA4V-B";
                break;
            case "40":
                id = "2VY-XHXI-RJX6-C";
                break;
            case "40PP":
                id = "U83-6VEU-73L7-C";
                break;
        }
    }

    if (error == "missing-radio") {
        if (step == "payment") {
            req.session.data.paymentResponseIncomplete = "true"
        } else if (step == "completion") {
            req.session.data.completionResponseIncomplete = "true"
        }
    } else if (error == "missing-input") {
        if (step == "payment") {
            if (radio == "approve") {
                req.session.data.paymentReimbursementAmountIncomplete = "true"
                if (type == "60") {
                    req.session.data.paidInFullResponseIncomplete = "true"
                }
            } else if (radio == "queried") {
                req.session.data.paymentQueriedNoteIncomplete = "true"
            } else if (radio == "reject") {
                req.session.data.paymentRejectNoteIncomplete = "true"
            }
        } else if (step == "completion") {
            if (radio == "queried") {
                req.session.data.completionQueriedNoteIncomplete = "true"
            } else if (radio == "reject") {
                req.session.data.completionRejectNoteIncomplete = "true"
            }
        }
            
    } else if (error == "invalid-input") {
        req.session.data.paymentReimbursementAmountInvalid = "true"
        req.session.data.paymentReimbursementAmount = "abc"
        if (type == "60") {
            req.session.data.paidInFullResponseIncomplete = "true"
        }
    }  else if (error == "checkListError") {
        id = "LE5-VQJS-FPSB-A";
        req.session.data.checkListError = {
            check: false,
            missingList: [
                {
                id: "payment",
                position: null
                },
                {
                id: "GR 46 4F 92 C",
                position: 1
                },
                {
                id: "MD 20 2F 63 A",
                position: 2
                },
                {
                id: "HA 93 7F 69 Q",
                position: 3
                },
                {
                id: "FI 50 5F 30 D",
                position: 4
                },
                {
                id: "HM 27 9F 18 T",
                position: 5
                },
                {
                id: "BU 26 7F 00 Y",
                position: 6
                },
                {
                id: "PX 89 8F 98 Q",
                position: 7
                },
                {
                id: "UH 04 6F 47 V",
                position: 8
                },
                {
                id: "WB 34 5F 39 T",
                position: 9
                },
                {
                id: "UP 28 8F 89 E",
                position: 10
                },
                {
                id: "LM 89 7F 48 J",
                position: 11
                }
            ]
        }
    }

    req.session.data.id = id

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/outcome', function (req, res) {
    let id = null
    const status = req.session.data.status
    const type = req.session.data.type
    const ommt = req.session.data.ommt

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "B02944934",
        claimScreen: "confirmOutcome"
    };

    switch (type) {
        case "100":
        if (ommt == "true") {
            id = "SOM-MT33-JSK4-A";
        }else {
            id = "HMJ-74V3-T8V5-A";
        }
        
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
    const paymentPlan = req.session.data.paymentPlan
    const ommt = req.session.data.ommt
    const filter = req.session.data.filter
    const section = req.session.data.section

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "A02944934",
        claimScreen: "previousSubmissions",
        filter
    };

    switch (type) {
        case "100":
        if (ommt == "true") {
            req.session.data.id = "PSV-TY16-39ER-A";
        } else {
            req.session.data.id = "C1L-PCT8-BSS6-A";
        }
        
        req.session.data.view = "100"
        break;

        case "60":
        if (paymentPlan == "true") {
            req.session.data.id = "24G-5H6R-V2J1-B";
        } else {
            req.session.data.id = "QZP-3H4J-AA4V-B";
        }
        req.session.data.view = "60"
        break;

        case "40":
        if (paymentPlan == "true") {
            req.session.data.id = "24G-5H6R-V2J1-C";
        } else {
            req.session.data.id = "AF7-6T8A-DY54-C";
        }
        req.session.data.view = "40"
        break;
    }

    loadData(req)
    if (note == "needs-action") {
        req.session.data.id = "RKS-RP75-JB2P-A"
        req.session.data.showNote = "true"
        req.session.data.subCount = "1"
        req.session.data.count = "1"
        req.session.data.submittedDate = "2025-11-22T20:01:16.131Z"
        if (section == "completion") {
            req.session.data.type = "completion"
            req.session.data.slotID = "1"
            req.session.data.learnerID = "WS 54 2F 01 E"
        }
    } else if (note == "reject") {
        req.session.data.id = "UJH-9C9P-2HJG-A"
        req.session.data.showNote = "true"
        req.session.data.subCount = "3"
        req.session.data.count = "3"
        req.session.data.submittedDate = "2026-01-13T18:04:04.085Z"
        if (section == "completion") {
            req.session.data.slotID = "1"
            req.session.data.type = "completion"
            req.session.data.learnerID = "KZ 79 0F 13 Z"
        }
    }
    

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/submission-learners', function (req, res) {
    const note = req.session.data.note
    const filter = req.session.data.filter

  delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "processor",
        journey: "signin",
        tabLocation: "claims",
        orgTab: "singleClaim",
        orgID: "A02944934",
        claimScreen: "learnerPreviousSubmissions",
        filter,
        id: "C1L-PCT8-BSS6-A"
    };

    loadData(req)
    if (note == "needs-action") {
        req.session.data.showProcessorLearnerNote = "true"
        req.session.data.subCount = "1"
        req.session.data.count = "1"
        req.session.data.submittedDate = "2025-11-23T07:56:20.350Z"
        req.session.data.slotID = "3"
        req.session.data.learnerID = "FS 47 4F 68 U"
    } else if (note == "reject") {
        req.session.data.id = "DM4-AJBV-1F7Q-A"
        req.session.data.showProcessorLearnerNote = "true"
        req.session.data.subCount = "3"
        req.session.data.count = "3"
        req.session.data.submittedDate = "2025-10-15T03:05:23.879Z"
        req.session.data.slotID = "16"
        req.session.data.learnerID = "QX 32 6F 41 Q"
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
        req.session.data.orgID = "A02944934";
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
        req.session.data.orgID = "A02944934";
        break;

        case "2":
        req.session.data.orgID = "B13299931";
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

router.get('/view-bank-details', function (req, res) {
    const scenario = req.session.data.scenario
    const userType = req.session.data.userType

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: userType,
        orgTab: "bank-details"
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "E76904778";
        break;

        case "2":
        req.session.data.orgID = "D62749203";
        break;

        case "3":
        req.session.data.orgID = "B13299931";
        break;

        case "4":
        req.session.data.orgID = "G91371231";
        break;

        case "5":
        req.session.data.orgID = "A02944934";
        break;

    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../organisation/org-view-main');
});

router.get('/verify-bank-details', function (req, res) {
    const accessPayResult = req.session.data.accessPayResult

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "leadProcessor",
        orgTab: "bank-details",
        orgID: "D62749203",
        accessPayResult: accessPayResult
    };

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../verify-bank-details/accessPay-result');
});

router.get('/confirm-outcome-bank-details', function (req, res) {
    const accessPayResult = req.session.data.accessPayResult

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: "leadProcessor",
        orgTab: "bank-details",
        orgID: "D62749203",
        accessPayResult: accessPayResult
    };

        switch (accessPayResult) {
        case "partialMatch":
        req.session.data.detailsPartialMatchNote = "partial match note";
        break;

        case "noMatch":
        req.session.data.detailsNoMatchNote = "no match note";
        break;
    }

    loadData(req)

    // Redirect to the page you want to screenshot
    res.redirect('../verify-bank-details/outcome-bank-details');
});

router.get('/confirmed-bank-details', function (req, res) {
    const scenario = req.session.data.scenario
    const userType = req.session.data.userType
    const bankDetailsVerified = req.session.data.bankDetailsVerified
    const bankDetailsRejected = req.session.data.bankDetailsRejected

    delete req.session.data
    req.session.data = {
        area: 'Processing',
        userType: userType,
        orgTab: "bank-details",
        bankDetailsRejected: bankDetailsRejected,
        bankDetailsVerified: bankDetailsVerified
    };

    switch (scenario) {
        case "1":
        req.session.data.orgID = "C63281491";
        break;

        case "2":
        req.session.data.orgID = "B13299931";
        break;

        case "3":
        req.session.data.orgID = "G91371231";
        break;

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
        req.session.data.orgID = "A02944934";
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