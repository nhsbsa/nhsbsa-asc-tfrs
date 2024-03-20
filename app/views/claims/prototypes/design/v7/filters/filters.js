//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('../../../../../../scripts/helpers/helpersV7.js');

const fs = require('fs');

// can we group any of these filters into the sections they are used in?

// MARK: // Style helpers
addFilter('removeSpacesAndLowerCase_V7', function (inputString) {
    return removeSpacesAndLowerCase(inputString);
})

addFilter('statusTag_V7', function (statusID, statuses) { // is new status ever used?
    const status = statuses.find(s => s.id === statusID);
    const tagClasses = {
        'new': 'turquoise',
        'not-yet-submitted': 'blue',
        'submitted': 'pink',
        'queried': 'red',
        'approved': 'green',
        'paid': 'purple'
    };
    const tagColor = tagClasses[statusID] || 'grey';
    const tagText = status ? status.name : 'Invalid Status';
    return `<strong class="govuk-tag govuk-tag--${tagColor}">${tagText}</strong>`;
}, { renderAsHtml: true })

// MARK: // count filters
addFilter('claimCount_V7', function (statusID, claims, claimType) {
    let claimsCounted = 0
    for (const c of claims) {
        if (c.status == statusID && c.type == claimType) {
            claimsCounted++
        }
    }
    return claimsCounted
})

addFilter('pageCount_V7', function (content, perPage) {
    return Math.ceil(content / perPage)
})


addFilter('uniqueDates_V7', function (claims, dateType) {
    const uniqueMonthYears = new Set();
    claims.forEach(claim => {
        const startDate = new Date(claim[dateType]);
        const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
        uniqueMonthYears.add(monthYear);
    });
    return Array.from(uniqueMonthYears)
        .sort()
        .map(dateString => {
            const [year, month] = dateString.split('-');
            const formattedDate = new Date(year, month - 1); // Month is 0-indexed in JavaScript
            const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
            return formatter.format(formattedDate);
        });
})

// check this one is working
addFilter('statusName_V7', function (statusID, statuses) {
    const status = statuses.find(s => s.id === statusID);
    return status ? status.name : null;
})

// Manage claims
addFilter('variableDate_V7', function (statusID) {
    switch (statusID) {
        case 'not-yet-submitted':
            return 'Created';
        case 'submitted':
            return 'Submitted';
        case 'queried':
            return 'Queried';
        case 'approved':
            return 'Approved';
        case 'paid':
            return 'Paid';
        default:
            return 'Created';
    }
})

addFilter('claimMatch_V7', function (claim, search, claimType) {
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

addFilter('potName_V7', function (type) {
    switch (type) {
        case "TU":
            return "Care skills funding";
        case "CPD":
            return "Revalidation funding";
        default:
            return "Pot Naming Error";
    }
})

addFilter('newClaimLink_V7', function (type) {
    switch (type) {
        case "TU":
            return "claim/first-claim";
        case "CPD":
            return "claim/select-activity-type";
        default:
            return "#";
    }
})

addFilter('checkEligible_V7', function (learner, type, roleTypes) {
    let eligibleRoles = []
    if (type == "TU") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isTUeligible).map(role => role.rolename);
    } else if (type == "CPD") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isCPDeligible).map(role => role.rolename);
    }
    return eligibleRoles.includes(learner.roleType)
})

addFilter('errorSummary_V7', function (claim) {
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

addFilter('findClaim_V7', function (claimID, claims) {
    let claim  = null;
    for (let c of claims) {
        if (c.claimID==claimID) {
            claim = c
        }
    } 
    return claim;
})

addFilter('groupByTitle_V7', function(training) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    const organizedData = {};
    for (const course of qualificationsObject.courses) {
        const title = course.title;
        if (!organizedData[title]) {
            organizedData[title] = [];
        }
        organizedData[title].push(course);
    }
    return organizedData;
})

addFilter('getUniqueCourseTitles_V7', function(training) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    const uniqueTitles = [];

    for (let course of qualificationsObject.courses) {
        if (!uniqueTitles.includes(course.title)) {
            uniqueTitles.push(course.title);
        }
    }
    return uniqueTitles
})

addFilter('coursesCount_V7', function(courses) {
    let count  = 0;
    for (const c of courses) {
        count ++
    } 
    return count;
})

addFilter('formatCount_V7', function (courses) {
    let count = courses.length;
    let text = count + " provider";
    if (count > 1) {
        text += "s"
    };
    return text;
}) 

