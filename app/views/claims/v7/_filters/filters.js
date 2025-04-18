//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('../_helpers/helpers.js');

const fs = require('fs');
addFilter('statusTag', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    if (statusID == 'new') {
        return '<strong class="govuk-tag govuk-tag--turquoise">New</strong>'
    } else if (statusID == 'not-yet-submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">' + statusName + '</strong>'
    } else if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--pink">' + statusName + '</strong>'
    } else if (statusID == 'queried') {
        return '<strong class="govuk-tag govuk-tag--red">' + statusName + '</strong>'
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">' + statusName + '</strong>'
    } else if (statusID == 'paid') {
        return '<strong class="govuk-tag govuk-tag--purple">' + statusName + '</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('claimCount', function (statusID, claims, claimType) {
    let i = 0
    for (const c of claims) {
        if (c.status == statusID && c.type == claimType) {
            i++
        }
    }
    return i
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('uniqueDates', function (claims, dateType) {

    const uniqueMonthYears = new Set();

    claims.forEach(claim => {
        const startDate = new Date(claim[dateType]);
        const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;

        uniqueMonthYears.add(monthYear);
    });

    const sortedMonthYears = Array.from(uniqueMonthYears).sort();

    const formattedDates = sortedMonthYears.map((dateString) => {
        const [year, month] = dateString.split('-');
        const formattedDate = new Date(year, month - 1); // Month is 0-indexed in JavaScript
        const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
        return formatter.format(formattedDate);

    });


    return formattedDates;

})

addFilter('statusName', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    return statusName
})

addFilter('variableDate', function (statusID) {
    if (statusID == 'not-yet-submitted') {
        return 'Created'
    } else if (statusID == 'submitted') {
        return 'Submitted'
    } else if (statusID == 'queried') {
        return 'Queried'
    } else if (statusID == 'approved') {
        return 'Approved'
    } else if (statusID == 'paid') {
        return 'Paid'
    } else {
        return 'Created'
    }

})

addFilter('removeSpacesAndLowerCase', function (inputString) {

    // Convert the string to lowercase
    let outputString = removeSpacesAndLowerCase(inputString);

    return outputString;

})

addFilter('claimMatch', function (claim, search, claimType) {
    let check = false;

    const formattedSearch = removeSpacesAndLowerCase(search);

    if (claim.type == claimType) {
        if (claim.claimID != null) {
            const formattedClaimID = removeSpacesAndLowerCase(claim.claimID);
            if (formattedClaimID.includes(formattedSearch)) {
                check = true
            }
        }

        if (claim.training != null) {
            const formattedActivity = removeSpacesAndLowerCase(claim.training.title);
            if (formattedActivity.includes(formattedSearch)) {
                check = true
            }
        }
        if (claim.learners != null) {
            for (const l of claim.learners) {
                const formattedName = removeSpacesAndLowerCase(l.fullName);
                if (formattedName.includes(formattedSearch)) {
                    check = true
                }
            }
        }
    } else if (claim.type == claimType) {
        if (claim.claimID != null) {
            const formattedClaimID = removeSpacesAndLowerCase(claim.ClaimID);
            if (formattedClaimID.includes(formattedSearch)) {
                check = true
            }
        }

        if (claim.categoryName != null) {
            const formattedActivity = removeSpacesAndLowerCase(claim.categoryName);
            if (formattedActivity.includes(formattedSearch)) {
                check = true
            }
        }
        if (claim.learners != null) {
            for (const l of claim.learners) {
                const formattedName = removeSpacesAndLowerCase(l.fullName);
                if (formattedName.includes(formattedSearch)) {
                    check = true
                }
            }
        }

    }

    return check;
})

addFilter('potName', function (type) {
    let name = "Pot Naming Error"
    if (type == "TU") {
        name = "Care skills funding"
    } else if (type == "CPD") {
        name = "Revalidation funding"
    }

    return name

})

addFilter('newClaimLink', function (type) {
    let claimLink = "#"
    if (type == "TU") {
        claimLink = "claim/first-claim"
    } else if (type == "CPD") {
        claimLink = "claim/select-activity-type"
    }
    return claimLink
})

addFilter('checkEligible', function (learner, type, roleTypes) {
    let eligibleRoles = []
    if (type == "TU") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isTUeligible).map(role => role.rolename);
    } else if (type == "CPD") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isCPDeligible).map(role => role.rolename);
    }


    return eligibleRoles.includes(learner.roleType)

})

addFilter('errorSummary', function (claim) {
    let errorSummaryStr = ''

    if (claim.type == "TU") {
        if (claim.training == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Select training</a></li>')
        }
        if (claim.startDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add training start date</a></li>')
        }
        if (claim.learners.length < 1) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add at least one learner</a></li>')
        }
        if (claim.costDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add payment date</a></li>')
        }
        if (claim.evidenceOfPayment == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of payment</a></li>')
        }
        if (claim.learners.every(learner => learner.evidence.evidenceOfCompletion == null)) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of completion for all learners</a></li>')
        }
        if (claim.learners.every(learner => learner.evidence.evidenceOfEnrollment == null) || claim.training.fundingModel == "full") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of enrollment for all learners</a></li>')
        }
    } else if (claim.type == "CPD") {
        if (claim.description == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add a description</a></li>')
        }
        if (claim.startDate == null && claim.categoryName == "Courses") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add training start date</a></li>')
        }
        if (claim.claimAmount == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add cost</a></li>')
        }
        if (claim.learners.length < 1) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add a learner</a></li>')
        }
        if (claim.costDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add payment date</a></li>')
        }
        if (claim.evidenceOfPayment == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of payment</a></li>')
        }
        if (claim.learners.every(learner => learner.evidence.evidenceOfCompletion == null) && claim.categoryName == "Courses") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of completion for the learner</a></li>')
        }
    }
    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('findClaim', function (claimID, claims) {
    let claim  = null;

    for (let c of claims) {
        if (c.claimID==claimID) {
            claim = c
        }

    } 

    return claim;

})
