//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndCharactersAndLowerCase } = require('../_helpers/helpers.js');

const fs = require('fs');
addFilter('statusTag', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    if (statusID == 'not-yet-submitted') {
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

addFilter('claimCount', function (statusID, claims, claimType) {
    let i = 0
    for (const c of claims) {
        if (c.status == statusID && c.fundingType == claimType) {
            i++
        }
    }
    return i
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content / perPage)
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

addFilter('statusDetails', function (statusID, statuses) {
    let status = null
    for (const s of statuses) {
        if (s.id == statusID) {
            status = s
        }
    }
    return status
})

addFilter('variableDate', function (statusID) {
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

addFilter('removeSpacesAndCharactersAndLowerCase', function (inputString) {
    // Convert the string to lowercase
    let outputString = removeSpacesAndCharactersAndLowerCase(inputString);
    return outputString;
})

addFilter('potName', function (type) {
    let name = "Pot Naming Error"
    if (type == "TU") {
        name = "Care skills funding"
    }
    return name
})

addFilter('checkEligible', function (learner, type, roleTypes) {
    let eligibleRoles = []
    eligibleRoles = roleTypes.filter(role => role.eligibility.isTUeligible).map(role => role.rolename);
    return eligibleRoles.includes(learner.roleType)
})

addFilter('errorSummary', function (claim, submitError) {
    let errorSummaryStr = ''

    if (submitError.description == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#description-error">Add a description</a></li>')
    }
    if (submitError.claimAmount == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#claim-amount-error">Add a cost</a></li>')
    }
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
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Completion date must be on or after the start date</a></li>')
    }
    if (submitError.completionDate == "inFuture") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Completion date must be in the past</a></li>')
    }
    if (submitError.startDate == "inFuture") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#completion-date-error">Start date must be in the past</a></li>')
    }
    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('findClaim', function (claimID, claims) {
    let claim = null;
    var searchedClaimID = claimID.replace(/[-\s]+/g, '');
    for (let c of claims) {
        var removeSuffix = c.claimID.replace(/[-\s]+/g, '');
        if (removeSuffix.includes(searchedClaimID)) {
            claim = c
        }
    }
    return claim;
})

addFilter('findUser', function (email, users) {
    let user = null;
    for (let u of users) {
        if (u.email == email) {
            user = u
        }
    }
    return user;
})

addFilter('groupByTitle', function (training) {
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

addFilter('getUniqueCourseTitles', function (training) {
    const qualificationsObject = training.find(obj => obj.groupTitle == "Qualifications");
    const uniqueTitles = [];

    for (let course of qualificationsObject.courses) {
        if (!uniqueTitles.includes(course.title)) {
            uniqueTitles.push(course.title);
        }
    }
    return uniqueTitles
})

addFilter('getCount', function (items) {
    let count = 0;
    if (items != null) {
        for (const c of items) {
            count++
        }
    }
    return count;
})


addFilter('formatCount', function (courses) {
    let count = courses.length;
    let text = count + " provider";
    if (count > 1) {
        text += "s"
    };
    return text;
})

addFilter('dateErrorMessage', function (dateErrorObject, dateType, errorSection) {
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
            errorMessages.push('<li><a href="#input-error">' + dateType + ' must be on or after 1 April 2024</a></li>');
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
            errorMessages.push('<span class="govuk-visually-hidden">Error:</span>' + dateType + ' must be on or after 1 April 2024<br>');
        }
        errorMessages.push('</p>')
    }

    return errorMessages.join('');
}, { renderAsHtml: true })

addFilter('dateErrorFormat', function (dateErrorObject, type) {
    let state = false
    if (dateErrorObject) {
        if (type == "day") {
            if (dateErrorObject.day == 'missing' || (dateErrorObject.day == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.date == 'invalidPolicy') {
                state = true
            }
        } else if (type == "month") {
            if (dateErrorObject.month == 'missing' || (dateErrorObject.month == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.date == 'invalidPolicy') {
                state = true
            }
        } else if (type == "year") {
            if (dateErrorObject.year == 'missing' || (dateErrorObject.year == 'invalid' && dateErrorObject.date != 'partMissing') || dateErrorObject.date == 'invalid' || dateErrorObject.date == 'invalidPolicy') {
                state = true
            }
        }
    }
    return state;
})

addFilter('listItemVariableDate', function (statusID, claim) {
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

addFilter('listItemVariableSort', function (statusID, claim) {
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

addFilter('formatTrainingDate', function (date) {
    let isValidDate = false
    if (date != "Invalid DateTime") {
        isValidDate = true
    }
    return isValidDate
})

addFilter('learnerErrorMessage', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.nationalInsuranceNumber == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#nationalInsuranceNumber-error">Enter a National Insurance number</a></li>')
    } else if (submitError.nationalInsuranceNumber == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#nationalInsuranceNumber-error">Enter a National Insurance number in the correct format</a></li>')
    }
    if (submitError.jobTitle == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#jobTitle-error">Enter a job title</a></li>')
    }


    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('learnerMatch', function (newField, matchField, type) {
    let result = ''

    if (newField != matchField) {
        if (type == "new") {
            result = "<mark class='hods-highlight'><strong>" + newField + "</strong></mark>"
        } else if (type == "match") {
            result = "<mark class='hods-highlight'><strong>" + matchField + "</strong></mark>"
        }
    } else {
        result = newField
    }


    return result
}, { renderAsHtml: true })

addFilter('learnerSearch', function (search, learner) {
    let match = false
    const formattedgivenName = removeSpacesAndCharactersAndLowerCase(learner.givenName);
    const formattedfamilyName = removeSpacesAndCharactersAndLowerCase(learner.familyName);
    const formattedfullName = formattedgivenName + formattedfamilyName;
    const formattedSearch = removeSpacesAndCharactersAndLowerCase(search);
    const formattedID = removeSpacesAndCharactersAndLowerCase(learner.id);

    if (formattedgivenName.includes(formattedSearch) || formattedfamilyName.includes(formattedSearch) || formattedfullName.includes(formattedSearch) || formattedID.includes(formattedSearch)) {
        match = true
    }
    return match
})

addFilter('trainingSearch', function (search, training) {
    let match = false
    const formattedSearch = removeSpacesAndCharactersAndLowerCase(search);
    const formattedTrainingTitle = removeSpacesAndCharactersAndLowerCase(training.title);
    const formattedTrainingCode = removeSpacesAndCharactersAndLowerCase(training.code);

    if (formattedTrainingTitle.includes(formattedSearch) || formattedTrainingCode.includes(formattedSearch)) {
        match = true
    }

    return match
})


addFilter('bankErrorMessage', function (bankErrorObject) {
    const errorMessages = [];

    if (bankErrorObject.accountName === 'missing') {
        errorMessages.push('<li><a href="#accountName-error">Enter the name on the account</a></li>');
    } else if (bankErrorObject.accountName === 'tooLong') {
        errorMessages.push('<li><a href="#accountName-error">Name on the account must be no more than 18 characters</a></li>');
    }
    if (bankErrorObject.sortCode === 'missing') {
        errorMessages.push('<li><a href="#sortCode-error">Enter a sort code</a></li>');
    } else if (bankErrorObject.sortCode === 'invalid') {
        errorMessages.push('<li><a href="#sortCode-error">Enter a valid sort code like 309430</a></li>');
    }
    if (bankErrorObject.accountNumber === 'missing') {
        errorMessages.push('<li><a href="#accountNumber-error">Enter an account number</a></li>');
    } else if (bankErrorObject.accountNumber === 'invalid') {
        errorMessages.push('<li><a href="#accountNumber-error">Enter a valid account number like 00733445</a></li>');
    } else if (bankErrorObject.accountNumber === 'lengthIssue') {
        errorMessages.push('<li><a href="#accountNumber-error">Account number must be between 6 and 8 digits</a></li>');
    }
    if (bankErrorObject.buildingSociety === 'lengthIssue') {
        errorMessages.push('<li><a href="#buildingSociety-error">Building society roll number must be between 1 and 18 characters</a></li>');
    } else if (bankErrorObject.buildingSociety === 'invalid') {
        errorMessages.push('<li><a href="#buildingSociety-error">Building society roll number must only include letters a to z, numbers, hyphens, spaces, forward slashes and full stops</a></li>');
    }

    return errorMessages.join('');
}, { renderAsHtml: true })

addFilter('trainingTypeCheck', function (trainingCode, trainingList, matchType) {

    for (let trainingGroup of trainingList) {
        for (let training of trainingGroup.courses) {
            if (trainingCode == training.code) {
                return trainingGroup.groupTitle == matchType;
            }
        }
    }

})

addFilter('findPair', function (claimID, claims) {

    for (let claim of claims) {
        const id = claim.claimID;
        // Check if the ID is not the same as the existing ID and
        // if the first part of the ID (excluding the last 2 characters) matches the existing ID
        if (id !== claimID && id.slice(0, -2) === claimID.slice(0, -2)) {
            return claim;
        }
    }
    return null; // Return null if no match is found
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

addFilter('sortByDate', function (claims, statusID) {
    if (statusID == 'not-yet-submitted') {
        return claims.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (statusID == 'submitted') {
        return claims.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    } else if (statusID == 'rejected') {
        return claims.sort((a, b) => new Date(b.rejectedDate) - new Date(a.rejectedDate));
    } else if (statusID == 'approved') {
        return claims.sort((a, b) => new Date(b.approvedDate) - new Date(a.approvedDate));
    } else {
        return claims.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }
})

addFilter('userType', function (type) {
    switch(type) {
        case "signatory":
        return "Signatory"
        break;

        case "submitter":
        return "Submitter"
        break;

    }
})

addFilter('userStatusTag', function (status) {
    switch(status) {
        case "active":
        return '<strong class="govuk-tag govuk-tag--turquoise">Active</strong>'
        break;

        case "expired":
        return '<strong class="govuk-tag govuk-tag--orange">Invite expired</strong>'
        break;

        case "pending":
        return '<strong class="govuk-tag govuk-tag--pink">Invite sent</strong>'
        break;

    }
}, { renderAsHtml: true })

addFilter('userErrorMessage', function (submitError) {
    let errorSummaryStr = ''

    if (submitError.familyName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#familyName-error">Enter a last (family) name</a></li>')
    }
    if (submitError.givenName == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#givenName-error">Enter a first (given) name</a></li>')
    }
    if (submitError.email == "missing") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address</a></li>')
    } else if (submitError.email == "match") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">An invitation has already been sent to this email</a></li>')
    } else if (submitError.email == "invalid") {
        errorSummaryStr = errorSummaryStr.concat('<li><a href="#email-error">Enter an email address in the correct format, like name@example.com</a></li>')
    }


    return errorSummaryStr
}, { renderAsHtml: true })

addFilter('matchResend', function (resendList, email) {
    if (resendList != null && resendList != "") {
        for (const e of resendList) {
            if (e === email) {
                return true;
            }
        }
    }
    return false
})

addFilter('expireTime', function (isoDateTime) {
    const inputDateTime = new Date(isoDateTime);
    const currentDateTime = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000;

    // Check if the input date-time is within 24 hours of the current date-time
    if (Math.abs(inputDateTime - currentDateTime) > oneDayInMillis) {
        // If not, adjust it to the current date-time
        inputDateTime.setTime(currentDateTime.getTime());
    }

    // Calculate the date-time 24 hours after the (possibly adjusted) input date-time
    const futureDateTime = new Date(inputDateTime.getTime() + oneDayInMillis);

    // Format the future date-time
    const day = futureDateTime.getDate();
    const month = futureDateTime.toLocaleString('en-GB', { month: 'long' });
    const year = futureDateTime.getFullYear();
    const hours = futureDateTime.getHours();
    const minutes = futureDateTime.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedFutureDateTime = `${day} ${month} ${year} at ${formattedHours}:${formattedMinutes}${ampm}`;

    return formattedFutureDateTime;
})


addFilter('countMatchingStatus', function (objectsArray, statusString) {
    // Initialize a counter to keep track of the matching objects
    let count = 0;

    // Loop through each object in the array
    objectsArray.forEach((obj) => {
        // Check if the status attribute matches the provided string
        if (obj.status === statusString) {
            // Increment the counter if there is a match
            count++;
        }
    });

    // Return the final count
    return count;
})


addFilter('75CharacterCount', function (description) {

    let limit = 75
    if (description.length <= limit) {
        return description;
    }
    let words = description.split(' ');
    let truncated = words[0];

    for (let i = 1; i < words.length; i++) {
        if ((truncated + ' ' + words[i]).length > limit) {
            break;
        }
        truncated += ' ' + words[i];
    }
    return truncated + "...";
})


addFilter('removeClaimSuffix', function (claimID) {
    // Check if the string has at least two characters
    if (claimID.length < 2) {
        return ''; // Return an empty string if there are less than two characters
    }
    // Use the slice method to remove the last two characters
    return claimID.slice(0, -2);
})


addFilter('isCostMoreThanMax', function (amount) {
    if (amount > 500) {
        return true
    } else {
        return false
    }
})

addFilter('statusTag', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    if (statusID == 'not-yet-submitted') {
        return '<strong class="govuk-tag govuk-tag--blue">' + statusName + '</strong>'
    } else if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--pink">' + statusName + '</strong>'
    } else if (statusID == 'approved') {
        return '<strong class="govuk-tag govuk-tag--green">' + statusName + '</strong>'
    } else if (statusID == 'rejected') {
        return '<strong class="govuk-tag govuk-tag--red">' + statusName + '</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('uniqueDates', function (claims, dateType) {

    const uniqueMonthYears = new Set();

    claims.forEach(claim => {
        const startDate = new Date(claim[dateType]);
        const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;

        uniqueMonthYears.add(monthYear);
    });
    const sortedMonthYears = Array.from(uniqueMonthYears).sort();

    return sortedMonthYears
})

addFilter('formatDate', function (date) {
    const startDate = new Date(date);
    const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const [year, month] = monthYear.split('-');
    const formattedDate = new Date(year, month - 1); // Month is 0-indexed in JavaScript
    const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
    return formatter.format(formattedDate);
})

addFilter('availableStatus', function (claims) {
    const uniqueStatuses = new Set();
    claims.forEach(claim => {
        uniqueStatuses.add(claim.status);
    });
    return Array.from(uniqueStatuses);
})

addFilter('uniqueTypes', function (claims) {
    const uniqueTypes = new Set();
    claims.forEach(claim => {

        uniqueTypes.add(claim.claimType);
    });
    const sortedTypes = Array.from(uniqueTypes).sort();
    return sortedTypes
})

addFilter('formatStatus', function (status) {
    if (status === "not-yet-submitted") {
        return "Not yet submitted"
    } else if (status === "submitted") {
        return "Submitted"
    } else if (status === "approved") {
        return "Approved"
    } else if (status === "rejected") {
        return "Rejected"
    }
})

addFilter('claimsMatchAdvancedSearchA', function (claims, training, learner) {
    const formattedTraining = removeSpacesAndCharactersAndLowerCase(training);
    const formattedLearner = removeSpacesAndCharactersAndLowerCase(learner);

    if ((formattedTraining.length > 0 && formattedTraining.length < 3) || (formattedLearner.length > 0 && formattedLearner.length < 3)) {
        return []
    }

    var searched = claims.filter(claim => {
        let trainingCheck = false;
        if (claim.training != null) {
            const formattedTitle = removeSpacesAndCharactersAndLowerCase(claim.training.title);
            const code = claim.training.code;
            const codeRegex = /^(?:\d{3}\/?\d{4}\/?\d|[A-Za-z]{5})$/;
            if (formattedTraining != "") {
                if (formattedTitle.includes(formattedTraining)) {
                    trainingCheck = true;
                }
                if (codeRegex.test(training) && removeSpacesAndCharactersAndLowerCase(code) == formattedTraining) {
                    trainingCheck = true;
                }
            } 
        }
        let learnerCheck = false;
        if (learner == "") { 
                learnerCheck = true
        } else if (claim.learner != null) {
            const formattedgivenName = removeSpacesAndCharactersAndLowerCase(claim.learner.givenName);
            const formattedfamilyName = removeSpacesAndCharactersAndLowerCase(claim.learner.familyName);
            const formattedfullName = formattedgivenName + formattedfamilyName;
            const formattedLearner = removeSpacesAndCharactersAndLowerCase(learner);
            const formattedID = removeSpacesAndCharactersAndLowerCase(claim.learner.id);
            if (formattedfullName.includes(formattedLearner) || formattedID == formattedLearner) {
                learnerCheck = true;
            }
        }
        let check = false
        if ((training != "" && trainingCheck) && (learner != "" && learnerCheck)) {
            check = true
        }
        if ((training == "" && learnerCheck) || (learner == "" && trainingCheck)) {
            check = true
        }
        return check
    })
    return searched
})

addFilter('claimsMatchAdvancedSearchB', function (claims, training, learner, submitter, statuses, types, dateType, startMonth, startYear, endMonth, endYear) {
    const formattedTraining = removeSpacesAndCharactersAndLowerCase(training);
    const formattedSubmitter = removeSpacesAndCharactersAndLowerCase(submitter);

    if (training == null && learner == null && submitter == null && statuses == null && types == null && startMonth == null && startYear == null && endMonth == null && endYear == null) {
        return false
    } else {

        var searched = claims.filter(claim => {
            let trainingCheck = false;
            if (training == "") { 
                trainingCheck = true
            } else if (claim.training != null && formattedTraining != "") {
                const formattedActivity = removeSpacesAndCharactersAndLowerCase(claim.training.title);
                if (formattedTraining != "" &&  formattedActivity.includes(formattedTraining)) {
                    trainingCheck = true;
                }
            }
            let learnerCheck = false;
            if (learner == "") { 
                learnerCheck = true
            } else if (claim.learner != null) {
                const formattedgivenName = removeSpacesAndCharactersAndLowerCase(claim.learner.givenName);
                const formattedfamilyName = removeSpacesAndCharactersAndLowerCase(claim.learner.familyName);
                const formattedfullName = formattedgivenName + formattedfamilyName;
                const formattedLearner = removeSpacesAndCharactersAndLowerCase(learner);
                const formattedID = removeSpacesAndCharactersAndLowerCase(claim.learner.id);
                if (formattedgivenName.includes(formattedLearner) || formattedfamilyName.includes(formattedLearner) || formattedfullName.includes(formattedLearner) || formattedID.includes(formattedLearner)) {
                    learnerCheck = true;
                }
            }
            let submitterCheck = false;
            if (submitter == "") { 
                submitterCheck = true
            } else if (claim.createdBy != null && formattedSubmitter != "") {
                const formattedName = removeSpacesAndCharactersAndLowerCase(claim.createdBy);
                if (formattedSubmitter != "" && formattedName.includes(formattedSubmitter)) {
                    submitterCheck = true;
                }
            }
            let statusCheck = false;
            if (statuses == null) { 
                statusCheck = true
            } else if (claim.status != null) {
                if (statuses.includes(claim.status)) {
                    statusCheck = true;
                }
            }
            let typeCheck = false;
            if (types == null) { 
                typeCheck = true
            } else if (claim.status != null) {
                if (types.includes(claim.claimType)) {
                    typeCheck = true;
                }
            }
            let dateCheck = false;
            if (startMonth == "" && startYear == "" && endMonth == "" && endYear == "") { 
                dateCheck = true
            } else if (claim.status != null) {
                let dateToCheck = null
                if (dateType == "started") {
                    if (claim.startDate == null) {
                        dateCheck = false
                    } else {
                        dateToCheck = new Date(claim.startDate);
                    }
                }
                if (dateType == "created") {
                    if (claim.createdDate == null) {
                        dateCheck = false
                    } else {
                        dateToCheck = new Date(claim.createdDate);
                    }
                }
                if (dateType == "submitted") {
                    if (claim.submittedDate == null) {
                        dateCheck = false
                    } else {
                        dateToCheck = new Date(claim.submittedDate);
                    }
                }
                if (dateType == "approved") {
                    if (claim.approvedDate == null) {
                        dateCheck = false
                    } else {
                        dateToCheck = new Date(claim.approvedDate);
                    }
                }
                if (dateType == "rejected") {
                    if (claim.rejectedDate == null) {
                        dateCheck = false
                    } else {
                        dateToCheck = new Date(claim.rejectedDate);
                    }
                }
                const startDate = new Date(startYear, startMonth - 1, 1);
                const endDate = new Date(endYear, endMonth, 0);

                if (dateToCheck >= startDate && dateToCheck <= endDate) {
                    dateCheck = true;
                }
            }

            return trainingCheck && learnerCheck & submitterCheck & statusCheck & typeCheck & dateCheck
        })
        return searched
    }
})

addFilter('filteredClaims', function (claims, statuses, dates, types) {
    var filtered = claims.filter(claim => {
        let statusCheck = true;
        if (statuses != null && statuses != "") {
            if (statuses.includes(claim.status)) {
                statusCheck = true;
            } else {
                statusCheck = false
            }
        }
        let dateCheck = true;
        if (dates != null && dates != "") {
            const startDate = new Date(claim.startDate);
            const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (dates.includes(monthYear)) {
                dateCheck = true;
            } else {
                dateCheck = false
            }
        }

        let typeCheck = true;
        if (types != null && types != "") {
            if (types.includes(claim.claimType)) {
                typeCheck = true;
            } else {
                typeCheck = false
            }
        }

        return statusCheck && dateCheck && typeCheck;
    });

    return filtered;
});

addFilter('statusArray', function (statusString) { 
    let availableStatus = ["not-yet-submitted", "submitted", "rejected", "approved"]
    let returnedArray = []
    if (statusString != null && statusString != "") {
        for (const s of availableStatus) {
            if (statusString.includes(s)) {
                returnedArray.push(s)
            }
        }
    }
    return returnedArray
});

addFilter('startDateArray', function (startDateString) { 
    if (startDateString != null && startDateString != "") {
        return startDateString.split("+");
    }
});

addFilter('typeArray', function (typeString) { 
    let availableTypes = ["100", "60", "40"]
    let returnedArray = []
    if (typeString != null && typeString != "") {
        for (const t of availableTypes) {
            if (typeString.includes(t)) {
                returnedArray.push(t)
            }
        }
    }
    return returnedArray
});

addFilter('formatDateType', function (status) {
    if (status === "started") {
        return "Started from"
    } else if (status === "created") {
        return "Created from"
    } else if (status === "submitted") {
        return "Submitted from"
    } else if (status === "approved") {
        return "Approved from"
    } else if (status === "rejected") {
        return "Rejected from"
    }
})

addFilter('isSelected', function (valueArray, status) { 
    var selected = false 
    if (valueArray != null && valueArray != "") {
            if (valueArray.includes(status)) {
                selected = true
            }
    }
    return selected
});


addFilter('userCountNotExpired', function (users) { 
    var count = false 
    if (users != null && users != "") {
        for (const u of users) {
            if (u.status != "expired" && u.status != "deleted") {
                count += 1
            }
        }
    }
    return count.toString()
});

addFilter('parseInt', function(value, radix = 10) {
    return parseInt(value, radix);
});

addFilter('min', (value1, value2) => {
    return Math.min(value1, value2);
});