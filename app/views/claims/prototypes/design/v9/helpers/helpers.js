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

    if (claim.evidenceOfCompletion == null && ! claim.claimType == "60") {
        result.evidenceOfCompletion = "missing"
    } else {
        result.evidenceOfCompletion = "valid"
    }

    if (claim.completionDate == null && ! claim.claimType == "60") {
        result.completionDate = "missing"
    } else {
        result.completionDate = "valid"
    }

    result.claimValid = result.learner == "valid" && result.startDate == "valid" && result.paymentDate == "valid" && result.evidenceOfPayment == "valid" && result.evidenceOfCompletion == "valid" && result.completionDate == "valid";
        
    if (result.completionDate == "valid" && result.startDate == "valid" && ! claim.claimType == "60") {
        const startDate = new Date(claim.startDate)
        const completionDate = new Date(claim.completionDate)
        if (startDate.getTime() >= completionDate.getTime()) {
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
    let result = {}
    result.check = false
    result.learner = {}

    for (const l of learners) {
        if (removeSpacesAndLowerCase(ni_1) == removeSpacesAndLowerCase(l.id)) {
            result.check = true
            result.learner = l
            break;
        }
    }
    return result
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


function isValidDate(day, month, year) {
    // Month is 0-indexed in JavaScript Date object, so we need to subtract 1 from the month

    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === Number(year) &&
        date.getMonth() === Number(month) - 1 &&
        date.getDate() === Number(day)
    );
}

function validateDate(day, month, year, type) {
    const result = {};
    const policyDate = new Date("2024-04-01");
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
    } else if ((checkDate.getTime() < policyDate.getTime()) && (type=="start" || type=="payment")) {
        result.date = 'invalidPolicy'
    } else if (isValidDate(day, month, year)) {
        result.date = 'valid';
    } else {
        result.date = 'invalid';
    }

    // Determine overall validity
    result.dateValid = result.date === 'valid' && result.day === 'valid' && result.month === 'valid' && result.year === 'valid';

    return result;
}

function checkDuplicateClaim(learnerID, trainingID, claimList) {
    let result = {}
    result.check = false
    result.id = ''

    for (const c of claimList) {
        if (c.learner != null) {
            if (c.training.code == trainingID && c.learner.id == learnerID && (c.status == 'submitted' || c.status == 'approved')) {
                result.check = true;
                result.id = c.claimID
                break;
            }
        }
    }

    return result

}

function isNIFormat(input) {
    // Remove spaces from the input string
    const cleanedInput = input.replace(/\s/g, '');

    // Check if the cleaned input matches the specified format
    const regex = /^[A-Za-z]{2}\d{6}[A-D]$/;
    return regex.test(cleanedInput);
}

function checkLearnerForm(nationalInsuranceNumber, familyName, givenName, jobTitle) {
    const result = {};

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

    result.learnerValid = result.nationalInsuranceNumber == "valid" && result.familyName == "valid" && result.givenName == "valid" && result.jobTitle == "valid"

    return result

}


function checkBankDetailsForm(accountName, sortCode, accountNumber, buildingSociety) {
    const result = {};

    if (accountName == "" || accountName === undefined || accountName == null ) {
        result.accountName = "missing"
    } else {
        result.accountName = "valid"
    }

    if (sortCode == "" || sortCode === undefined || sortCode == null ) {
        result.sortCode = "missing"
    } else if (!(/^\d{6}$/.test(sortCode))) {
        result.sortCode = "invalid"
    } else {
        result.sortCode = "valid"
    }

    if (accountNumber == "" || accountNumber === undefined || accountNumber == null ) {
        result.accountNumber = "missing"
    } else if (!(/^\d+$/.test(accountNumber))) {
        result.accountNumber = "invalid"
    } else if (!(accountNumber.length >= 6 && accountNumber.length <= 8)) {
        result.accountNumber = "lengthIssue"
    } else {
        result.accountNumber = "valid"
    }

    if (!(/^[a-zA-Z0-9\-\/ .]+$/.test(buildingSociety)) && buildingSociety != "" ) {
        result.buildingSociety = "invalid"
    } else if (!(buildingSociety.length >= 1 && buildingSociety.length <= 18) && buildingSociety != "" ) {
        result.buildingSociety = "lengthIssue"
    } else {
        result.buildingSociety = "valid"
    }

    result.bankDetailsValid = result.accountName == "valid" && result.sortCode == "valid" && result.accountNumber == "valid" && result.buildingSociety == "valid"

    return result

}

module.exports = { checkClaim, compareNINumbers, removeSpacesAndLowerCase, sortByCreatedDate, generateUniqueID, validateDate, checkDuplicateClaim, checkLearnerForm, checkBankDetailsForm }
