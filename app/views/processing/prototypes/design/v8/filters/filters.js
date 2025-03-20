//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { renderString } = require('nunjucks')
const { formatDate, isFullClaimCheck, getMostRelevantSubmission, findLearnerById, findCourseByCode, flattenUsers, sortSubmissionsByDate } = require('../helpers/helpers.js');
const fs = require('fs');

addFilter('processorstatusTag', function (statusID) {
    if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">Not yet processed</strong>'
    } else if (statusID == 'queried') {
        return '<strong class="govuk-tag govuk-tag--yellow">Queried</strong>' 
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">Approved</strong>' 
    }else if (statusID == 'rejected') {
        return '<strong class="govuk-tag govuk-tag--red">Rejected</strong>' 
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('sectionCheck', function (state) {
    if (state != null) {
        return "Completed"
    } else if (state == null) {
        return '<strong class="govuk-tag govuk-tag--blue">Incomplete</strong>'
    } else {
        return "Error"
    }
}, { renderAsHtml: true })

addFilter('findClaim', function (claimID, claims) {
    let claim = null;
    for (let c of claims) {
        if (c.claimID == claimID) {
            claim = c
        }
    }
    return claim;
})

addFilter('criteriaQuestions', function (criteria, type, claim, header) {
    if (type == "payment") {
        switch (criteria) {
            case "0":
                if (header == "true") {
                    return "Course or qualification name"
                } else {
                    return "Does the payment evidence show the training was " + claim.training.title + "?"
                }
            case "1":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the payment evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
            case "2":
                if (header == "true") {
                    return "How much was paid"
                } else {
                    return "Does the payment evidence show how much was paid?"
                }
            case "3":
                if (header == "true") {
                    return "When the payment was made"
                } else {
                    return "Does the payment evidence show the payment date of  " + formatDate(claim.costDate) + "?"
                }
        }
    } else if (type == "completion") {
        switch (criteria) {
            case "0":
                if (header == "true") {
                    return "Date the training took place or started"
                } else {
                    return "Does the completion evidence show the training start of " + formatDate(claim.startDate) + "?"
                }
            case "1":
                if (header == "true") {
                    return "Learner’s name"
                } else {
                    return "Does the completion evidence show the learner was " + claim.learner.givenName + " " + claim.learner.familyName + "?"
                }
            case "2":
                if (header == "true") {
                    return "Training provider or awarding body name"
                } else {
                    return "Does the completion evidence show the provider was " + claim.training.awardingOrganisation + "?"
                }
        }
    }
}, { renderAsHtml: true })

addFilter('criteriaAnswer', function (criteria, type, claim) {
    if (type == "payment") {
        if (claim.evidenceOfPaymentreview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfPaymentreview["criteria" + criteria].note
        }
    } else if (type == "completion") {
        if (claim.evidenceOfCompletionreview["criteria" + criteria].result) {
            return "Yes"
        } else {
            return "No<br>" + claim.evidenceOfCompletionreview["criteria" + criteria].note
        }
    }
}, { renderAsHtml: true })


addFilter('checkPDF', function (str) {
    return str.endsWith(".pdf");
})

addFilter('evidenceBackLink', function (criteriaNo, type) {
    if (criteriaNo == "1") {
        return "claim"
    } else {
        criteriaNo = String(Number(criteriaNo)+1)
        return "review-evidence?type=" + type + "&criteria=" + criteriaNo
    }
})


addFilter('dateSort', function (notes) {
    const sortedData = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedData
})

addFilter('reimbursement', function (claim, paymentReimbursementAmount) {
    if ((claim.claimType == "60")) {
        if (claim.training.reimbursementAmount > paymentReimbursementAmount) {
            return paymentReimbursementAmount * 0.6
        } else {
            return claim.training.reimbursementAmount * 0.6
        }
    } else if (claim.claimType == "40") {
        if (claim.training.reimbursementAmount > claim.reimbursementAmount) {
            return claim.reimbursementAmount * 0.4
        } else {
            return claim.training.reimbursementAmount * 0.4
        }
    } else if (claim.training.reimbursementAmount > paymentReimbursementAmount) {
        return paymentReimbursementAmount
    } else {
        return claim.training.reimbursementAmount
    }
});

addFilter('original_reimbursement_amount', function (claim,paymentReimbursementAmount) {
    if (claim.claimType == "40") {
        paymentReimbursementAmount = claim.reimbursementAmount
    }
    if (paymentReimbursementAmount > claim.training.reimbursementAmount) {
        return claim.training.reimbursementAmount
    } else {
        return paymentReimbursementAmount
    }
});

addFilter('orgErrorMessage', function (error) {
    if (error == "invalid") {
        return "Enter a valid workplace ID"
    } else if ( error == "missing") {
        return "Enter a workplace ID"
    }
})

addFilter('signatoryErrorMessage', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.email == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address</a></li>')
    } else if (submitError.email == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address in the correct format, like name@example.com</a></li>')
    }
    return errorSummaryStr
}, { renderAsHtml: true });

addFilter('qualificationCheck', function(submission, training, value) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    let isQualification = false;

    for (let course of qualificationsObject.courses) {
        if (course.code == submission.trainingCode) {
            isQualification = true
        }
    }
    if (isQualification) {
        return value
    } else {
        return "Not applicable"
    }
})

addFilter('matchPairClaim', function(claimID, claims) {
    var pairID = null
    var pairClaim = null

    let lastChar = claimID.charAt(claimID.length - 1); // Get the last character of the string

    if (lastChar === 'B') {
      pairID = claimID.slice(0, -1) + 'C'; // Change 'B' to 'C'
    } else if (lastChar === 'C') {
      pairID =  claimID.slice(0, -1) + 'B'; // Change 'C' to 'B'
    } 

    for (const c of claims) {
        if (c.claimID == pairID) {
            pairClaim = c
            break;
        }
    }

    return pairClaim

})

addFilter('findOrg', function (organisations, id) {
    var foundOrg = null
    for (const org of organisations) {
        if (org.workplaceID == id) {
            foundOrg = org
        }
    }
    return foundOrg
})

addFilter('formatInformation', function (foundOrg, enteredInfo, isFromCheckEdited, isNewOrg) {
    var info = ""
    if (isNewOrg == "true" || isFromCheckEdited == "true" ) {
        if (enteredInfo != null) {
            info = enteredInfo
        } else {
            info = foundOrg
        }
    } else {
        if (foundOrg != null) {
            info = foundOrg
        }
    }
    return info
})

addFilter('orderByMostRecent', function (submissions) {
    let sorted = sortSubmissionsByDate(submissions, 'submittedDate')
    return sorted
})

addFilter('create100TimelineArray', function (claim) {
    // Extract the timestamps and their associated data
    const events = [];

    let sorted = sortSubmissionsByDate(claim.submissions, 'submittedDate')


    for (const submission of sorted) {
        if (submission.submittedDate) {

            if (submission.processedDate == null) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                    // Add completion date
                    if (submission.completionDate) {
                        events.push({
                            type: "trainingDate",
                            title: "Training completed",
                            date: submission.completionDate,
                            description: claim.completionNote || null,
                            author: null
                        });
                    }
                    // Add cost date
                    if (submission.costDate) {
                        events.push({
                            type: "trainingDate",
                            title: "Training paid for",
                            date: submission.costDate,
                            description: null,
                            author: null
                        });
                    }

                    // Add start date
                    if (submission.startDate) {
                        events.push({
                            type: "trainingDate",
                            title: "Training started",
                            date: submission.startDate,
                            description: null,
                            author: null
                        });
                    }

            } else if ((submission.evidenceOfPaymentReview.outcome == "queried" || submission.evidenceOfCompletionReview.outcome == "queried")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add queried date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim queried",
                        date: submission.processedDate,
                        description: null,
                        author: "Eren Yeager (Processor)"
                    });
                }

            } else if ((submission.evidenceOfPaymentReview.outcome == "pass" || submission.evidenceOfCompletionReview.outcome == "pass")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add approved date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim approved",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }

            } else if ((submission.evidenceOfPaymentReview.outcome == "fail" || submission.evidenceOfCompletionReview.outcome == "fail")) {


                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add rejected date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "Claim rejected",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }


            }
    
    
            
        }
    }

    // Add created date
    if (claim.createdDate) {
        events.push({
            type: "statusDate",
            title: "Claim created",
            date: claim.createdDate,
            description: null,
            author: claim.createdBy + " (Submitter)"
        });
    }

    // Sort the events by date in descending order
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events;
})


addFilter('create6040TimelineArray', function (claim, pairClaim) {
    // Extract the timestamps and their associated data
    const events = [];
    let sixtyClaim = null
    let fourtyClaim = null
    if (claim.claimType == "60") {
        sixtyClaim = claim
        fourtyClaim = pairClaim
    } else {
        sixtyClaim = pairClaim
        fourtyClaim = claim
    }

    for (const submission of sixtyClaim.submissions) {
        if (submission.submittedDate) {

            if (submission.processedDate == null) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add cost date
                if (submission.costDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training paid for",
                        date: submission.costDate,
                        description: null,
                        author: null
                    });
                }

                // Add start date
                if (submission.startDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training started",
                        date: submission.startDate,
                        description: null,
                        author: null
                    });
                }

            } else if ((submission.evidenceOfPaymentReview.outcome == "queried")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add queried date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim queried",
                        date: submission.processedDate,
                        description: null,
                        author: "Eren Yeager (Processor)"
                    });
                }

            } else if ((submission.evidenceOfPaymentReview.outcome == "pass")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add approved date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim approved",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }

                // Add cost date
                if (submission.costDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training paid for",
                        date: submission.costDate,
                        description: null,
                        author: null
                    });
                }

                // Add start date
                if (submission.startDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training started",
                        date: submission.startDate,
                        description: null,
                        author: null
                    });
                }

            } else if ((submission.evidenceOfPaymentReview.outcome == "fail")) {


                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add rejected date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "60 claim rejected",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }
                
                // Add cost date
                if (submission.costDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training paid for",
                        date: submission.costDate,
                        description: null,
                        author: null
                    });
                }

                // Add start date
                if (submission.startDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training started",
                        date: submission.startDate,
                        description: null,
                        author: null
                    });
                }
            }
        }
    }


    for (const submission of fourtyClaim.submissions) {
        if (submission.submittedDate) {

            if (submission.processedDate == null) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add completion date
                if (submission.completionDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training completed",
                        date: submission.completionDate,
                        description: claim.completionNote || null,
                        author: null
                    });
                }

            } else if ((submission.evidenceOfCompletionReview.outcome == "queried")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add queried date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim queried",
                        date: submission.processedDate,
                        description: null,
                        author: "Eren Yeager (Processor)"
                    });
                }

            } else if ((submission.evidenceOfCompletionReview.outcome == "pass")) {

                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add approved date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim approved",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }
                // Add completion date
                if (submission.completionDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training completed",
                        date: submission.completionDate,
                        description: claim.completionNote || null,
                        author: null
                    });
                }

            } else if ((submission.evidenceOfCompletionReview.outcome == "fail")) {


                // Add submitted date
                if (submission.submittedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim submitted",
                        date: submission.submittedDate,
                        description: null,
                        author: claim.createdBy + " (Submitter)"
                    });
                }

                // Add rejected date
                if (submission.processedDate) {
                    events.push({
                        type: "statusDate",
                        title: "40 claim rejected",
                        date: submission.processedDate,
                        description:  null,
                        author: "Eren Yeager (Processor)"
                    });
                }

                // Add completion date
                if (submission.completionDate) {
                    events.push({
                        type: "trainingDate",
                        title: "Training completed",
                        date: submission.completionDate,
                        description: claim.completionNote || null,
                        author: null
                    });
                }


            }

        }
    }
 
    // Add 60 created date
    if (sixtyClaim.createdDate) {
        events.push({
            type: "statusDate",
            title: "60 claim created",
            date: sixtyClaim.createdDate,
            description: null,
            author: sixtyClaim.createdBy + " (Submitter)"
        });
    }

        // Add 40 created date
        if (fourtyClaim.createdDate) {
            events.push({
                type: "statusDate",
                title: "40 claim created",
                date: fourtyClaim.createdDate,
                description: null,
                author: fourtyClaim.createdBy + " (Submitter)"
            });
        }

    // Sort the events by date in descending order
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events;
})


addFilter('countOccurrences', function (events,string) {
     // Validate input
    if (!Array.isArray(events)) {
        throw new Error("The first argument must be an array.");
    }
    if (typeof string !== "string") {
        throw new Error("The second argument must be a string.");
    }

    // Count the objects
    return events.reduce((count, obj) => {
        if (string === "all" || obj.type === string) {
            count++;
        }
        return count;
    }, 0);
})

addFilter('findOrganisation', function (orgID, organisations) {
    let organisation = null;
    for (const org of organisations) {
      if (org.workplaceID == orgID) {
        organisation = org
      }
    }
    return organisation;
})

addFilter('findOrgClaims', function (orgID, claims) {
    let orgClaims = [];
    for (const claim of claims) {
      if (claim.workplaceID == orgID) {
        orgClaims.push(claim)
      }
    }
    return orgClaims;
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('typeTag', function (type) {
    switch (type) {
        case null:
            return ""
        case "100":
            return '<strong class="govuk-tag govuk-tag--orange">100</strong>'
        case "60":
            return '<strong class="govuk-tag govuk-tag--yellow">60</strong>'
        case "40":
            return '<strong class="govuk-tag govuk-tag--purple">40</strong>'
    }
}, { renderAsHtml: true })

addFilter('orderClaims', function (claims) {
    
    return claims.sort((a, b) => {
        const statusOrder = { submitted: 1, queried: 2, rejected: 3, approved: 4};
        
        // Compare statuses based on order
        const statusComparison = statusOrder[a.status] - statusOrder[b.status];
        if (statusComparison !== 0) return statusComparison;
        
        // If statuses are the same, sort by corresponding date in descending order
        const dateField = a.status === "submitted" ? "submittedDate" : 
                          "processedDate";
        
        let aSubmission =  getMostRelevantSubmission(a)     
        let bSubmission =  getMostRelevantSubmission(b)     
        return new Date(bSubmission[dateField]) - new Date(aSubmission[dateField]);
    });
})

addFilter('getMostRelevantSubmission', (claim) => {
    let recentClaim = getMostRelevantSubmission(claim)
    return recentClaim
})

addFilter('userStatusTag', function (status) {

    if (status == 'active') {
        return '<strong class="govuk-tag govuk-tag--blue">Active</strong>'
    } else if (status == 'invited') {
        return '<strong class="govuk-tag govuk-tag--yellow">Invited</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Inactive</strong>'
    }
}, { renderAsHtml: true })

addFilter('matchResend', function (resendList, email) {
    if (resendList != null && resendList != "") {
        for (const e of resendList) {
            if (e == email) {
                return true
            }
        }
    }
    return false
})

addFilter('removeClaimSuffix', function (claimID) {
    // Check if the string has at least two characters
    if (claimID.length < 2) {
        return ''; // Return an empty string if there are less than two characters
    }
    // Use the slice method to remove the last two characters
    return claimID.slice(0, -2);
})

addFilter('typeTag', function (type) {
    switch (type) {
        case null:
            return ""
        case "100":
            return '<strong class="govuk-tag govuk-tag--orange">100</strong>'
        case "60":
            return '<strong class="govuk-tag govuk-tag--yellow">60</strong>'
        case "40":
            return '<strong class="govuk-tag govuk-tag--purple">40</strong>'
    }
}, { renderAsHtml: true })

addFilter('parseInt', function(value, radix = 10) {
    return parseInt(value, radix);
});

addFilter('min', (value1, value2) => {
    return Math.min(value1, value2);
});


addFilter('processedDate', function (claim) {
    let processedDate = null
    if (claim.approvedDate) {
        processedDate = claim.approvedDate
    } else if (claim.rejectedDate) {
        processedDate = claim.rejectedDate
    }
    return processedDate
})

addFilter('sortByFirstName', function (inactiveClaims) {
    return inactiveClaims.sort((a, b) => {
        return a.givenName.localeCompare(b.givenName);
      });
})

addFilter('findTraining', (trainingCode, trainingArray) => {
    return findCourseByCode(trainingCode, trainingArray)
})

addFilter('findLearner', (learnerID, learners) => {
    return findLearnerById(learnerID, learners)
})

addFilter('trainingTypeCheck', function (trainingCode, trainingList, matchType) {

    for (let trainingGroup of trainingList) {
        for (let training of trainingGroup.courses) {
            if (trainingCode == training.code) {
                return trainingGroup.groupTitle == matchType;
            }
        }
    }

})

addFilter('findUser', function (email, org) {
    users = flattenUsers(org)
    let user = null;
    for (let u of users) {
        if (u.email == email) {
            user = u
        }
    }
    return user;
})