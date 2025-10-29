const fs = require('fs');
const dataPath = 'app/views/processing/v12/_data/'


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    
    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'
    var organisationsFile = 'organisations.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, dataPath)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, dataPath)
    console.log('statuses file loaded')

    console.log('loading in organisations file')
    req.session.data['organisations'] = loadJSONFromFile(organisationsFile, dataPath)
    console.log('organisations file loaded')

    return console.log('data updated')
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function checkWDSFormat(id) {
    var pattern = /^[B-I]\d{5,8}$/;
    return pattern.test(id);
}

function signatoryCheck(familyName, givenName, email) {
    const result = {}

    if (familyName =="") {
        result.familyName = "missing"
    } else {
        result.familyName = "valid"
    }

    if (givenName =="") {
        result.givenName = "missing"
    } else {
        result.givenName = "valid"
    }

    if (email == "") {
        result.email = "missing"
    } else if (!(emailFormat(email))) {
        result.email = "invalid"
    } else if (email == "duplicate@duplicate.com") {
        result.email = "duplicate"
    } else {
        result.email = "valid"
    }
    
    result.signatoryValid = result.familyName == "valid" && result.givenName == "valid" && result.email == "valid"
    return result
}

function emailFormat(string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
}

function validNumberCheck(string) {
    var isValid = false
    if (!isNaN(Number(string))) {
        isValid = true
    }
    return isValid
}

function isValidOrgSearch(orgSearch) {
    // Regular expression for a valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Regular expression for a valid workplace ID
    const letterAndDigitsRegex = /^[A-NP-Z0-9]{9}$/i;

    // Regular expression for a valid claim reference number
    const claimReferenceRegex = /^[A-NP-Z0-9]{3}(-)?[A-NP-Z0-9]{4}(-)?[A-NP-Z0-9]{4}(-)?([ABC])?$/i;

    // Check against all three conditions
    if (emailRegex.test(orgSearch)) {
        return true;
    } else if (letterAndDigitsRegex.test(orgSearch)) {
        return true;
    } else if (claimReferenceRegex.test(orgSearch)) {
        return true;
    } else {
        return false;
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

function findCourseByCode(code) {
     const trainingCourses = loadJSONFromFile('training.json', dataPath)

    for (const group of trainingCourses) {
      const course = group.courses.find(course => course.code == code);
      if (course) {
        return course;
      }
    }
    return null;
  }

  function findLearnerById(id) {
    const learners = loadJSONFromFile('learners.json', dataPath)
    
      const learner = learners.find(learner => learner.id == id);
      if (learner) {
        return learner;
      } else {
        return null;
      }
  }

  function findUser(users, email) {
    let user = null;
    for (let u of users) {
        if (u.email == email) {
            user = u.givenName + " " + u.familyName
        }
    }
    return user;
  }

  function findOrg(organisations, orgID) {
    let organisation = null;
    for (const org of organisations) {
      if (org.workplaceID == orgID) {
        organisation = org
      }
    }
    return organisation;
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

function sortSubmissionsForTable(submissions) {
    return submissions.sort((a, b) => {
        return new Date(b.submittedDate) - new Date(a.submittedDate);
    });
}

function checkClaimProcess(claim, section, paymentResponse, paymentReimbursementAmount, paymentRejectNote, paymentQueriedNote, completionResponse, completionRejectNote, completionQueriedNote, paidInFullResponse) {

    let errorParamaters = ""
    const validAmount = validNumberCheck(paymentReimbursementAmount)

    if (section == "payment") {
      if (paymentResponse == null) {
        errorParamaters += "&paymentResponseIncomplete=true";
        } else if (paymentResponse == "approve") {
          if ((paymentReimbursementAmount == null || paymentReimbursementAmount == "") && claim.claimType != "40"){
            errorParamaters += "&paymentReimbursementAmountIncomplete=true";
          } else if (paymentResponse == "approve" && (!validAmount) && claim.claimType != "40") {
            errorParamaters += "&paymentReimbursementAmountInvalid=true";
          }
          if (claim.claimType == "60" && paidInFullResponse == null) {
            errorParamaters += "&paidInFullResponseIncomplete=true";
          }
        } else if (paymentResponse == "reject" && (paymentRejectNote == null || paymentRejectNote == "")) {
        errorParamaters += "&paymentRejectNoteIncomplete=true";
        } else if (paymentResponse == "queried" && (paymentQueriedNote == null || paymentQueriedNote == "")) {
        errorParamaters += "&paymentQueriedNoteIncomplete=true";
        }
    }

    if (section == "completion") {
        if (completionResponse == null) {
        errorParamaters += "&completionResponseIncomplete=true";
        } else if (completionResponse == "reject" && (completionRejectNote == null || completionRejectNote == "")) {
        errorParamaters += "&completionRejectNoteIncomplete=true";
        } else if (completionResponse == "queried" && (completionQueriedNote == null || completionQueriedNote == "")) {
        errorParamaters += "&completionQueriedNoteIncomplete=true";
        }
    }

    return errorParamaters
}

function getOverallStatus(data) {
  const outcomes = data.map(d => d.evidenceOfCompletionReview.outcome);
  const allPass = outcomes.every(o => o == "pass");
  const allFail = outcomes.every(o => o == "fail");
  const anyQueried = outcomes.includes("queried");

  if (anyQueried) return "queried";
  if (allPass) return "approve";
  if (allFail) return "reject";

  return "queried"; // mixed outcomes or incomplete
}


function determineOutcome(claim) {
    let result = null
    let submission = getMostRelevantSubmission(claim)
    const paymentResponse = submission.evidenceOfPaymentReview.outcome
    const learners = submission.learners
    
    if (claim.claimType == "100" && !(isInternalOMMT(submission.trainingCode))) {
      if (paymentResponse == "fail" || getOverallStatus(learners) == "reject") {
        result = "reject";
      } else if (paymentResponse == "queried" || getOverallStatus(learners) == "queried") {
        result = "queried";
      } else if (paymentResponse == "pass" && getOverallStatus(learners) == "approve") {
        result = "approve";
      }
    } else if (claim.claimType == "60") {
      if (paymentResponse == "fail") {
        result = "reject";
      } else if (paymentResponse == "queried") {
        result = "queried";
      } else if (paymentResponse == "pass") {
        result = "approve";
      }
    } else if (claim.claimType == "40" || (claim.claimType == "100" && (isInternalOMMT(submission.trainingCode)))) {
      if (getOverallStatus(learners) == "reject") {
        result = "reject";
      } else if (getOverallStatus(learners) == "queried") {
        result = "queried";
      } else if (getOverallStatus(learners) == "approve") {
        result = "approve";
      }
    }
    return result
}

function isInternalOMMT(courseCode) {
  const validValues = [
    "OMMT/T1/INT",
    "OMMT/T2/INT"
  ];

  return validValues.includes(courseCode);
}

function sortAlphabetically(learners) {
  let sorted = []

  return sorted;
}


module.exports = { loadJSONFromFile, loadData, formatDate, checkWDSFormat, signatoryCheck, validNumberCheck, isValidOrgSearch, getMostRelevantSubmission, findCourseByCode, findLearnerById, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable, checkClaimProcess, determineOutcome, isInternalOMMT, getOverallStatus }
