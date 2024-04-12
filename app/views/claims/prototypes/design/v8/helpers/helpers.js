function checkClaim(claim) {

    const result = {};

    if (claim.learner == null) {
        result.learner = "missing"
    } else {
        result.learner = "valid"
    }

    if (claim.startDate == null) {
        result.startDate = "missing"
    } else {
        result.startDate = "valid"
    }

    if (claim.costDate == null) {
        result.paymentDate = "missing"
    } else {
        result.paymentDate = "valid"
    }

    if (claim.evidenceOfPayment.length == 0) {
        result.evidenceOfPayment = "missing"
    } else {
        result.evidenceOfPayment = "valid"
    }

    if (claim.evidenceOfCompletion == null) {
        result.evidenceOfCompletion = "missing"
    } else {
        result.evidenceOfCompletion = "valid"
    }

    if (claim.completionDate == null) {
        result.completionDate = "missing"
    } else {
        result.completionDate = "valid"
    }

    result.claimValid = result.learner == "valid" && result.startDate == "valid" && result.paymentDate == "valid" && result.evidenceOfPayment == "valid" && result.evidenceOfCompletion == "valid" && result.completionDate == "valid";
        
    if (result.completionDate == "valid" && result.startDate == "valid") {
        const startDate = new Date(claim.startDate)
        const completionDate = new Date(claim.completionDate)
        if (startDate.getTime() > completionDate.getTime()) {
            result.startDate = "invalid"
            result.completionDate = "invalid"
            result.claimValid = false
        }
    }

    return result
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
    result.dateValid = result.date === 'valid' && result.day === 'valid' && result.month === 'valid' && result.year === 'valid';

    return result;
}

function checkDuplicates(claim, claimList) {
    let check = false

    for (const c of claimList) {
        if (c.training.code == claim.training.code && c.learner.id == claim.learner.id) {
            check = true;
            break;
        }
    }

    return check

}

function isNIFormat(input) {
    // Remove spaces from the input string
    const cleanedInput = input.replace(/\s/g, '');

    // Check if the cleaned input matches the specified format
    const regex = /^[A-Za-z]{2}\d{6}[A-D]$/;
    return regex.test(cleanedInput);
}

function checkLearnerForm(nationalInsuranceNumber, familyName, givenName, jobTitle, roleType) {
    const result = {};
    console.log(nationalInsuranceNumber)

    if (nationalInsuranceNumber == "" || nationalInsuranceNumber === undefined || nationalInsuranceNumber == null ) {
        result.nationalInsuranceNumber = "missing"
    } else if (!(isNIFormat(nationalInsuranceNumber))) {
        result.nationalInsuranceNumber = "invalid"
    } else {
        result.nationalInsuranceNumber = "valid"
    }

    if (familyName == "" || familyName === undefined || familyName == null ) {
        result.familyName = "missing"
    } else {
        result.familyName = "valid"
    }

    if (givenName == "" || givenName === undefined || givenName == null ) {
        result.givenName = "missing"
    } else {
        result.givenName = "valid"
    }

    if (jobTitle == "" || jobTitle === undefined || jobTitle == null ) {
        result.jobTitle = "missing"
    } else {
        result.jobTitle = "valid"
    }

    if (roleType == "" || roleType === undefined || roleType == null ) {
        result.roleType = "missing"
    } else {
        result.roleType = "valid"
    }

    result.learnerValid = result.nationalInsuranceNumber == "valid" && result.familyName == "valid" && result.givenName == "valid" && result.jobTitle == "valid" && result.roleType == "valid"

    return result

}


module.exports = { checkClaim, compareNINumbers, removeSpacesAndLowerCase, sortByCreatedDate, generateUniqueID, isValidISODate, validateDate, checkDuplicates, checkLearnerForm }
