//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const fs = require('fs');

// Add your filters here

addFilter('statusTag', function (content, statuses) {
    var statusName = null
    for (const s of statuses) {
        if (s.id == content) {
            statusName = s.name
        }
    }
    if (content == 'new') {
        return '<strong class="govuk-tag govuk-tag--green">New</strong>'
    } else if (content == 'incomplete') {
        return '<strong class="govuk-tag govuk-tag--blue">'+statusName+'</strong>'
    } else if (content == 'ready-to-submit') {
        return '<strong class="govuk-tag govuk-tag--light-blue">'+statusName+'</strong>'
    } else if (content == 'submitted') {
        return '<strong class="govuk-tag govuk-tag--turquoise">'+statusName+'</strong>'
    } else if (content == 'insufficient-evidence') {
        return '<strong class="govuk-tag govuk-tag--red">'+statusName+'</strong>'
    } else if (content == 'paid') {
        return '<strong class="govuk-tag govuk-tag--purple">'+statusName+'</strong>'
    } else {
        return '<strong class="govuk-tag govuk-tag--grey">Invalid Status</strong>'
    }
}, { renderAsHtml: true })

addFilter('claimCount', function (content, claims) {
    let i = 0
    for (const c of claims) {
        if (c.status == content) {
            i++
        }
    }
    return i
})

addFilter('pageCount', function (content, perPage) {
    return Math.ceil(content/perPage)
})

addFilter('uniqueDates', function (content,dateType) {
    
    const uniqueMonthYears = new Set();

    content.forEach(claim => {
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