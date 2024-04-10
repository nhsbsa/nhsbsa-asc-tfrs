//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('../helpers/helpers.js');

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
        const monthYear = '${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, `0`)}';

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

addFilter('errorSummary_V8', function (claim, submitError) {
    let errorSummaryStr = ''

        if (submitError.startDate == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#start-date-error">Add a start date</a></li>')
        }
        if (submitError.learner == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#learner-error">Add a learner</a></li>')
        }
        if (submitError.paymentDate == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#payment-date-error">Add a payment date</a></li>')
        }
        if (submitError.evidenceOfPayment == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#payment-evidence-error">Add evidence of payment</a></li>')
        }
        if (submitError.completionDate == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Add a completion date</a></li>')
        }
        if (submitError.evidenceOfCompletion == "missing") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-evidence-error">Add evidence of completion</a></li>')
        }
        if (submitError.completionDate == "invalid" || submitError.startDate == "invalid") {
            errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Completion date must be after the start date</a></li>')
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


addFilter('groupByTitle_V7', function (training) {
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

addFilter('getUniqueCourseTitles_V7', function (training) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    const uniqueTitles = [];

    for (let course of qualificationsObject.courses) {
        if (!uniqueTitles.includes(course.title)) {
            uniqueTitles.push(course.title);
        }
    }
    return uniqueTitles
})

addFilter('coursesCount_V7', function (courses) {
    let count = 0;
    for (const c of courses) {
        count++
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


addFilter('dateErrorMessage_V8', function (dateErrorObject, dateType, errorSection) {
    const errorMessages = [];

    if (errorSection == 'summary') {
        if (dateErrorObject.day === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must include a day</a></li>');
        }
        if (dateErrorObject.month === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must include a month</a></li>');
        }
        if (dateErrorObject.year === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must include a year</a></li>');
        }
        if (dateErrorObject.date === 'invalid') {
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must be a real date</a></li>');
        }
        if (dateErrorObject.date === 'allMissing') {
            errorMessages.push('<li><a href="#input-error">Enter the ' + dateType.toLowerCase() + '</a></li>');
        } 
        if (dateErrorObject.date === 'invalidPolicy') {
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must be after 10 April 2024</a></li>');
        }
    } else if (errorSection == 'input') {
        errorMessages.push('<p id="input-error" class="govuk-error-message">')
        if (dateErrorObject.day === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must include a day<br>');
        }
        if (dateErrorObject.month === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must include a month<br>');
        }
        if (dateErrorObject.year === 'missing' && dateErrorObject.date !== 'allMissing') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must include a year<br>');
        }
        if (dateErrorObject.date === 'invalid') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must be a real date<br>');
        }
        if (dateErrorObject.date === 'allMissing') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>Enter the ' + dateType.toLowerCase() + '<br>');
        }
        if (dateErrorObject.date === 'invalidPolicy') {
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must be after 10 April 2024<br>');
        }
        errorMessages.push('</p>')
    }

    return errorMessages.join('');
}, { renderAsHtml: true })

addFilter('dateErrorFormat', function (dateErrorObject, type) {
    let state = false
    if (dateErrorObject) {
        if (type == "day") {
            if (dateErrorObject.day == 'missing' || (dateErrorObject.day == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid') {
                state = true
            }
        } else if (type == "month") {
            if (dateErrorObject.month == 'missing' || (dateErrorObject.month == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid') {
                state = true
            }
        } else if (type == "year") {
            if (dateErrorObject.year == 'missing' || (dateErrorObject.year == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid') {
                state = true
            }
        }
    }
    return state;
})

addFilter('policyDateCheck', function (date) {
    const policyDate = new Date("2024-04-10");
    const checkDate = new Date(date)

    return checkDate.getTime() < policyDate.getTime();
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
    let dateObj = new Date(dateStr);
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    let day = dateObj.getUTCDate();
    let monthIndex = dateObj.getUTCMonth();
    let year = dateObj.getUTCFullYear();
    let formattedDate = day + ' ' + monthNames[monthIndex] + ' ' + year;
    return formattedDate;
}

addFilter('relativeDateFromDateToToday', function (dateStr) {
    const inputDate = new Date(dateStr);
    const currentDate = new Date();
    const differenceInMs = currentDate - inputDate;
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    if (differenceInDays > 730) {
        const differenceInYears = Math.floor(differenceInDays / 365);
        return differenceInYears + (differenceInYears === 1 ? ' year' : ' years') + ' ago';
    } else if (differenceInDays > 70) {
        const differenceInMonths = Math.floor(differenceInDays / 30);
        return differenceInMonths + (differenceInMonths === 1 ? ' month' : ' months') + ' ago';
    } else if (differenceInDays > 14) {
        const differenceInWeeks = Math.floor(differenceInDays / 7);
        return differenceInWeeks + ' weeks ago';
    } else if (differenceInDays == 1) {
        return differenceInDays + ' day ago';
    } else {
        return differenceInDays + ' days ago';
    }
})

addFilter('findMatchingTraining', function (claim, training) {
    // Extracting titles from training array's Qualifications courses
    const qualificationTitles = training.reduce((acc, group) => {
        if (group.groupTitle == "Qualifications") {
            return acc.concat(group.courses.map(course => course.title));
        }
        return acc;
    }, []);
    // Iterating over claims to find matching titles
        if (qualificationTitles.includes(claim.training.title)) {
            return true;
    }
    return false;
})

addFilter('formatTrainingDates', function(start, end) {
    let startDate = "Not yet added"
    let endDate = "not yet added"
    if (start != "Invalid DateTime") {
        startDate = start
    }
    if (end != "Invalid DateTime") {
        endDate = end
    }
    return "Training dates: " + startDate + " to " + endDate
})

addFilter('formatTrainingDate', function(date) {
    let isValidDate = false
    if (date != "Invalid DateTime") {
        isValidDate = true
    }
    return isValidDate
})

