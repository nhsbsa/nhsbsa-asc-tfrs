//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('../../../../../../scripts/helpers/helpersV8.js');

const fs = require('fs');
addFilter('statusTag_V8', function (statusID, statuses) {
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
    } else if (statusID == 'rejected') {
        return '<strong class="govuk-tag govuk-tag--red">' + statusName + '</strong>'
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">' + statusName + '</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('claimCount_V8', function (statusID, claims, claimType) {
    let i = 0
    for (const c of claims) {
        if (c.status == statusID && c.type == claimType) {
            i++
        }
    }
    return i
})

addFilter('pageCount_V8', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('uniqueDates_V8', function (claims, dateType) {

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

addFilter('statusName_V8', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    return statusName
})

addFilter('statusDetails_V8', function (statusID, statuses) {
    let status = null
    for (const s of statuses) {
        if (s.id == statusID) {
            status = s
        }
    }
    return status
})

addFilter('variableDate_V8', function (statusID) {
    if (statusID == 'not-yet-submitted') {
        return 'Created'
    } else if (statusID == 'submitted') {
        return 'Submitted'
    } else if (statusID == 'rejected') {
        return 'Rejected'
    } else if (statusID == 'approved') {
        return 'Approved'
    } else {
        return 'Created'
    }
})

addFilter('removeSpacesAndLowerCase_V8', function (inputString) {

    // Convert the string to lowercase
    let outputString = removeSpacesAndLowerCase(inputString);

    return outputString;

})

addFilter('claimMatch_V8', function (claim, search, claimType) {
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
        if (claim.learner != null) {
            const formattedName = removeSpacesAndLowerCase(claim.learner.fullName);
            if (formattedName.includes(formattedSearch)) {
                check = true
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
        if (claim.learner != null) {
            const formattedName = removeSpacesAndLowerCase(claim.learner.fullName);
            if (formattedName.includes(formattedSearch)) {
                check = true
            }
        }
    }

    return check;
})

addFilter('potName_V8', function (type) {
    let name = "Pot Naming Error"
    if (type == "TU") {
        name = "Care skills funding"
    } else if (type == "CPD") {
        name = "Revalidation funding"
    }

    return name

})

addFilter('newClaimLink_V8', function (type) {
    let claimLink = "#"
    if (type == "TU") {
        claimLink = "claim/select-training"
    } else if (type == "CPD") {
        claimLink = "claim/select-activity-type"
    }

    return claimLink

})

addFilter('checkEligible_V8', function (learner, type, roleTypes) {
    let eligibleRoles = []
    if (type == "TU") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isTUeligible).map(role => role.rolename);
    } else if (type == "CPD") {
        eligibleRoles = roleTypes.filter(role => role.eligibility.isCPDeligible).map(role => role.rolename);
    }


    return eligibleRoles.includes(learner.roleType)

})

addFilter('errorSummary_V8', function (claim) {
    let errorSummaryStr = ''

    if (claim.type == "TU") {
        if (claim.startDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add training start date</a></li>')
        }
        if (claim.learner == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add a learner</a></li>')
        }
        if (claim.costDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add payment date</a></li>')
        }
        if (claim.evidenceOfPayment == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of payment</a></li>')
        }
        if (claim.evidenceOfCompletion == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of completion</a></li>')
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
        if (claim.learner == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add a learner</a></li>')
        }
        if (claim.costDate == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add payment date</a></li>')
        }
        if (claim.evidenceOfPayment == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of payment</a></li>')
        }
        if (claim.evidenceOfCompletion == null) {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#">Add evidence of completion</a></li>')
        }
    }
    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('findClaim_V8', function (claimID, claims) {
    let claim = null;

    for (let c of claims) {
        if (c.claimID == claimID) {
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

addFilter('listItemVariableDate_V8', function (statusID, claim) {
    if (statusID == 'not-yet-submitted') {
        return 'Created ' + formatDate(claim.createdDate)
    } else if (statusID == 'submitted') {
        return 'Submitted ' + formatDate(claim.submittedDate)
    } else if (statusID == 'rejected') {
        return 'Rejected ' + formatDate(claim.rejectedDate)
    } else if (statusID == 'approved') {
        return 'Approved ' + formatDate(claim.approvedDate)
    } else {
        return 'Created ' + formatDate(claim.createdDate)
    }
})

addFilter('listItemVariableSort_V8', function (statusID, claim) {
    if (statusID == 'not-yet-submitted') {
        return 'Recently created'
    } else if (statusID == 'submitted') {
        return 'Recently submitted'
    } else if (statusID == 'rejected') {
        return 'Recently rejected'
    } else if (statusID == 'approved') {
        return 'Recently approved'
    } else {
        return 'Recently created'
    }
})

function formatDate(dateStr) {
    // Convert the string to a Date object
    let dateObj = new Date(dateStr);
    // Define month names
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    // Extract day, month, and year
    let day = dateObj.getUTCDate();
    let monthIndex = dateObj.getUTCMonth();
    let year = dateObj.getUTCFullYear();
    // Format the date
    let formattedDate = day + ' ' + monthNames[monthIndex] + ' ' + year;
    return formattedDate;
}

addFilter('relativeDateFromDateToToday', function (dateStr) {
    // Convert the input date string to a Date object
    const inputDate = new Date(dateStr);
    
    // Get the current date
    const currentDate = new Date();
    
    // Calculate the difference in milliseconds between the input date and today
    const differenceInMs = currentDate - inputDate;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    // If difference is more than 7 days, calculate weeks
    if (differenceInDays > 14) {
        const differenceInWeeks = Math.floor(differenceInDays / 7);
        return differenceInWeeks + ' weeks ago';
    } else if (differenceInDays == 1) {
        return differenceInDays + ' day ago';
    } else {
        return differenceInDays + ' days ago';
    }
})