const fs = require('fs');

function checkClaim(claim) {

    const result = {};
    const submission = getMostRelevantSubmission(claim)
    
    if (submission.learnerID == null) {
        result.learner = "missing"
    } else {
        result.learner = "valid"
    }

    if (submission.startDate == null) {
        result.startDate = "missing"
    } else {
        result.startDate = "valid"
    }

    if (submission.costDate == null && ! claim.claimType != "40") {
        result.paymentDate = "missing"
    } else {
        result.paymentDate = "valid"
    }

    if (submission.evidenceOfPayment.length == 0 && claim.claimType != "40") {
        result.evidenceOfPayment = "missing"
    } else {
        result.evidenceOfPayment = "valid"
    }

    if (submission.evidenceOfCompletion == null && (claim.claimType == "40" || claim.claimType == "100") && submission.learnerID) {
        result.evidenceOfCompletion = "missing"
    } else {
        result.evidenceOfCompletion = "valid"
    }

    if (submission.completionDate == null && (claim.claimType == "40" || claim.claimType == "100") && submission.learnerID) {
        result.completionDate = "missing"
    } else {
        result.completionDate = "valid"
    }

    if (result.completionDate == "valid" && result.startDate == "valid") {
        const startDate = new Date(submission.startDate)
        const completionDate = new Date(submission.completionDate)
        const currentDate = new Date()
        if ((startDate.getTime() > completionDate.getTime()) && (claim.claimType == "100" || claim.claimType == "40")) {
            result.startDate = "invalid"
            result.completionDate = "invalid"
        } else if ((currentDate.getTime() < completionDate.getTime()) && (claim.claimType == "100" || claim.claimType == "40")) {
            result.completionDate = "inFuture"
        } else if ((currentDate.getTime() < startDate.getTime()) && (claim.claimType == "60")) {
            result.startDate = "inFuture"
        }
    }

    if (claim.status == "queried") {
        result.change = checkChange(claim)
    } else {
        result.change = true
    }

    result.claimValid = result.learner == "valid" && result.startDate == "valid" && result.paymentDate == "valid" && result.evidenceOfPayment == "valid" && result.evidenceOfCompletion == "valid" && result.completionDate == "valid" && result.change;
    return result
}

function removeSpacesAndCharactersAndLowerCase(input) {
    let inputString = String(input);
    // Remove spaces using regular expression
    let stringWithoutSpacesAndSlashes = inputString.replace(/[\s\/]/g, '');
    // Convert the string to lowercase
    let lowercaseString = stringWithoutSpacesAndSlashes.toLowerCase();
    return lowercaseString;
}
    
function compareNINumbers(ni_1, learners) {
    let result = {}
    result.check = false
    result.learner = {}

    for (const l of learners) {
        if (removeSpacesAndCharactersAndLowerCase(ni_1) == removeSpacesAndCharactersAndLowerCase(l.id)) {
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
            let submission = getMostRelevantSubmission(c)
            if (c.learner != null && c.fundingType == "TU") {
                if (submission.trainingCode == trainingID && submission.learnerID == learnerID && (c.status == 'submitted' || c.status == 'approved')) {
                    result.matchType = c.claimType
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
    }  else if(accountName.length > 140 ) {
        result.accountName = "tooLong"
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

// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
  }

function emailExists(data, email) {
    // Check signatory active
    if (data.signatory?.active?.email === email) {
        return true;
    }
    
    // Check users active
    if (data.users?.active?.some(user => user.email === email)) {
        return true;
    }
    
    // Check users invited
    if (data.users?.invited?.some(user => user.email === email)) {
        return true;
    }
    
    return false;
}

function checkUserForm(familyName, givenName, email, org) {
    const result = {};

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

    const emailMatch = emailExists(org, email)


    if (email == "" || email === undefined || email == null ) {
        result.email = "missing"
    }  else if (!(emailFormat(email))) {
        result.email = "invalid"
    } else if(emailMatch) {
        result.email = "match"
    } else {
        result.email = "valid"
    }

    result.userValid = result.familyName == "valid" && result.givenName == "valid" && result.email == "valid"

    return result

}

function emailFormat(string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
}

function getDraftSubmission(claim) {
    if (claim.status == "queried") {
        return claim.submissions.find(s => s.submittedDate == null);
    }
}

function getMostRelevantSubmission(claim) {
    if (!claim || !claim.submissions || claim.submissions.length === 0) {
        return null; // Return null if claim or submissions are invalid
    }

    let mostRecentSubmission = null;
    let latestDate = null;

    claim.submissions.forEach(submission => {
        let submissionDate = submission.processedDate || submission.submittedDate;

        if (submissionDate) {
            let currentDate = new Date(submissionDate);
            if (!latestDate || currentDate > latestDate) {
                latestDate = currentDate;
                mostRecentSubmission = submission;
            }
        } else if (!mostRecentSubmission) {
            // If all dates are null, keep track of the first encountered submission
            mostRecentSubmission = submission;
        }
    });

    return mostRecentSubmission;
}

  function findCourseByCode(code, trainingCourses) {
    for (const group of trainingCourses) {
      const course = group.courses.find(course => course.code == code);
      if (course) {
        return course;
      }
    }
    return null;
  }

  function findLearnerById(id, learners) {
      const learner = learners.find(learner => learner.id == id);
      if (learner) {
        return learner;
      } else {
        return null;
      }
  }

  function flattenUsers(data) {
    let users = [];
  
    // Flatten signatory
    if (data.signatory) {
      if (data.signatory.active) {
        users.push({ ...data.signatory.active });
      }
      if (Array.isArray(data.signatory.inactive)) {
        users = users.concat(data.signatory.inactive);
      }
    }
  
    // Flatten users
    if (data.users) {
      Object.values(data.users).forEach(userGroup => {
        if (Array.isArray(userGroup)) {
          users = users.concat(userGroup);
        }
      });
    }
  
    return users;
}

function sortClaimsByStatusSubmission(claims, dateType) {
    // Sort the claims based on the most recent submission date
    claims.sort((a, b) => {
        // Ensure there is a submission array and the dateType exists
        const getLatestSubmission = (claim) => {
            // Ensure the submissions array is not empty
            if (!claim.submissions || claim.submissions.length === 0) {
                return null;
            }

            // Find the most recent submission for a claim based on the dateType
            return claim.submissions.reduce((latest, submission) => {
                const submissionDate = submission[dateType];
                // If dateType doesn't exist or submissionDate is invalid, skip this submission
                if (!submissionDate) {
                    return latest;
                }
                return new Date(submissionDate) > new Date(latest[dateType]) ? submission : latest;
            }, claim.submissions[0]);
        };

        // Get the most recent submission for both claims
        const latestA = getLatestSubmission(a);
        const latestB = getLatestSubmission(b);

        // If either claim has no valid submission, consider it as older
        if (!latestA) return 1; // treat `a` as older if no submission
        if (!latestB) return -1; // treat `b` as older if no submission

        // Compare the most recent submission dates
        return new Date(latestB[dateType]) - new Date(latestA[dateType]);
    });

    return claims;
}

function sortSubmissionsByDate(submissions, dateType) {
    // Ensure that the claim has a submissions array and it's not empty
    if (!submissions || submissions.length === 0) {
        return submissions; // Return the claim as is if no submissions exist
    }

    // Sort the submissions array based on the dateType
    submissions.sort((a, b) => {
        const dateA = new Date(a[dateType]);
        const dateB = new Date(b[dateType]);

        // Sort in descending order (most recent first)
        return dateB - dateA;
    });

    return submissions; // Return the claim with sorted submissions
}

function findPair(claimID, claims){
    for (let claim of claims) {
        const id = claim.claimID;
        // Check if the ID is not the same as the existing ID and
        // if the first part of the ID (excluding the last 2 characters) matches the existing ID
        if (id !== claimID && id.slice(0, -2) === claimID.slice(0, -2)) {
            return claim;
        }
    }
    return null; // Return null if no match is found
}

function checkChange(claim) {
    let lastQueried = getMostRelevantSubmission(claim)
    let draftClaim = getDraftSubmission(claim)

    let isChange = false
    if (
        (lastQueried.trainingCode !== draftClaim.trainingCode) ||
        (lastQueried.learnerID !== draftClaim.learnerID) ||
        (lastQueried.startDate !== draftClaim.startDate) ||
        (lastQueried.costDate !== draftClaim.costDate) ||
        (lastQueried.completionDate !== draftClaim.completionDate) ||
        (lastQueried.evidenceOfCompletion !== draftClaim.evidenceOfCompletion) ||
        (lastQueried.evidenceOfPayment.length !== draftClaim.evidenceOfPayment.length)
    ) {
        isChange = true
    } else {
        lastQueried.evidenceOfPayment.sort();
        draftClaim.evidenceOfPayment.sort();
        for (let i = 0; i < lastQueried.length; i++) {
            if (lastQueried[i] !== draftClaim[i]) {
                isChange  = true
                break;
            }
        }
    }

    return isChange
}


module.exports = { findPair, checkClaim, compareNINumbers, removeSpacesAndCharactersAndLowerCase, sortByCreatedDate, generateUniqueID, validateDate, checkDuplicateClaim, checkLearnerForm, checkBankDetailsForm, loadJSONFromFile, checkUserForm, getMostRelevantSubmission, findCourseByCode, findLearnerById, flattenUsers, getDraftSubmission, sortClaimsByStatusSubmission, sortSubmissionsByDate }
