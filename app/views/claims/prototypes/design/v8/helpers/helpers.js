function checkClaim(claim) {
    let check = false
    console.log(claim)
    if (claim.type == "TU" &&
        claim.learner != null &&
        claim.startDate != null &&
        claim.training != null &&
        claim.costDate != null &&
        claim.evidenceOfPayment.length >0 &&
        claim.evidenceOfCompletion != null /*&& 
        claim.completionDate != null*/
    ) {
        check = true
    } else if (
        claim.type == "CPD" &&
        claim.learners.length > 0 &&
        ((claim.startDate != null && claim.learners.every(learner => learner.evidence.evidenceOfCompletion != null)) || claim.categoryName != "Courses") &&
        claim.claimAmount != null &&
        claim.description != null &&
        claim.evidenceOfPayment.length >0 &&
        claim.costDate != null
    ) {
        check = true
    }
    return check
}


function removeSpacesAndLowerCase(input) {

    let inputString = String(input);
    // Remove spaces using regular expression

    let stringWithoutSpaces = inputString.replace(/\s/g, '');

    // Convert the string to lowercase
    let lowercaseString = stringWithoutSpaces.toLowerCase();

    return lowercaseString;
}

function compareNINumbers(ni_1, learners) {
    let check = false
    for (const l of learners) {
        if (removeSpacesAndLowerCase(ni_1) == removeSpacesAndLowerCase(l.id)) {
            check = true
            break;
        }
    }
    return check
}

function sortByCreatedDate(array) {
    // Use the sort method to reorder the array based on the createdDate property
    array.sort((a, b) => {
        const dateA = new Date(b.createdDate);
        const dateB = new Date(a.createdDate);
        return dateA - dateB;
    });

    return array;
}

function generateUniqueID() {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Excluding 'O'
    const sections = [3, 4, 4]; // Length of each section

    let id = '';

    for (let i = 0; i < sections.length; i++) {
        for (let j = 0; j < sections[i]; j++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            id += characters.charAt(randomIndex);
        }
        if (i < sections.length - 1) {
            id += '-';
        }
    }

    return id;
}

function isValidISODate(dateString) {
    // Create a new Date object from the given date string
    const date = new Date(dateString);
    
    // Check if the date object is valid
    // The date is considered valid if it's not 'Invalid Date'
    // and the input date string matches the parsed date
    return !isNaN(date.getTime()) && dateString === date.toISOString().slice(0, 10);
}

function validateDate(day, month, year, type) {
    const result = {};
    const policyDate = new Date("2024-04-10");
    const date = year + "-" + month + "-" + day;
    const checkDate = new Date(date);

    // Validate year
    if (year == "" || isNaN(year)) {
        result.year = 'missing';
    } else {
        result.year = 'valid'; // Set year to valid if it exists
    }

    // Validate month
    if (month == "" || isNaN(month)) {
        result.month = 'missing';
    } else if (month < 1 || month > 12) { 
        result.month = 'invalid';
    } else {
        result.month = 'valid';
    }

    // Validate day
    if (day == "" || isNaN(day)) {
        result.day = 'missing';
    } else {
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            result.day = 'invalid';
        } else {
            result.day = 'valid';
        }
    }

    // Validate whole date
    if (result.day == 'missing' && result.month == 'missing' && result.year == 'missing') {
        result.date = 'allMissing';
    } else if (result.day == 'missing' || result.month == 'missing' || result.year == 'missing') {
        result.date = 'partMissing';
    } else if (isValidISODate(date) && !((checkDate.getTime() < policyDate.getTime()) && (type=="start" || type=="payment"))) {
        result.date = 'valid';
    } else if ((checkDate.getTime() < policyDate.getTime()) && (type=="start" || type=="payment")) {
        result.date = 'invalidPolicy'
    } else {
        result.date = 'invalid';
    }

    // Determine overall validity
    result.valid = result.date === 'valid' && result.day === 'valid' && result.month === 'valid' && result.year === 'valid';

    return result;
}


module.exports = { checkClaim, compareNINumbers, removeSpacesAndLowerCase, sortByCreatedDate, generateUniqueID, isValidISODate, validateDate }
