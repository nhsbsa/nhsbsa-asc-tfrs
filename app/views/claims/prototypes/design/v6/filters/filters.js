//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const { removeSpacesAndLowerCase } = require('../helpers/helpers.js');

const fs = require('fs');

addFilter('statusTag_V6', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    if (statusID == 'new') {
        return '<strong class="govuk-tag govuk-tag--green">New</strong>'
    } else if (statusID == 'incomplete') {
        return '<strong class="govuk-tag govuk-tag--blue">' + statusName + '</strong>'
    } else if (statusID == 'ready-to-submit') {
        return '<strong class="govuk-tag govuk-tag--light-blue">' + statusName + '</strong>'
    } else if (statusID == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--turquoise">' + statusName + '</strong>'
    } else if (statusID == 'insufficient-evidence') {
        return '<strong class="govuk-tag govuk-tag--red">' + statusName + '</strong>'
    } else if (statusID == 'paid') {
        return '<strong class="govuk-tag govuk-tag--purple">' + statusName + '</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('claimCount_V6', function (statusID, claims) {
    let i = 0
    for (const c of claims) {
        if (c.status == statusID) {
            i++
        }
    }
    return i
})

addFilter('pageCount_V6', function (content, perPage) {
    return Math.ceil(content / perPage)
})

addFilter('uniqueDates_V6', function (claims, dateType) {

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

addFilter('statusName_V6', function (statusID, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == statusID) {
            statusName = s.name
        }
    }
    return statusName
})

addFilter('variableDate_V6', function (statusID) {
    if (statusID == 'incomplete') {
        return 'Created date'
    } else if (statusID == 'ready-to-submit') {
        return 'Created date'
    } else if (statusID == 'submitted') {
        return 'Submitted date'
    } else if (statusID == 'insufficient-evidence') {
        return 'Submitted date'
    } else if (statusID == 'paid') {
        return 'Paid date'
    } else {
        return 'Created date'
    }

})

addFilter('variableDateType_V6', function (statusID) {
    if (statusID == 'incomplete') {
        return 'createdDate'
    } else if (statusID == 'ready-to-submit') {
        return 'createdDate'
    } else if (statusID == 'submitted') {
        return 'submittedDate'
    } else if (statusID == 'insufficient-evidence') {
        return 'submittedDate'
    } else if (statusID == 'paid') {
        return 'paidDate'
    } else {
        return 'createdDate'
    }

})

addFilter('removeSpacesAndLowerCase_V6', function (inputString) {

    // Convert the string to lowercase
    let outputString = removeSpacesAndLowerCase(inputString);

    return outputString;

})
