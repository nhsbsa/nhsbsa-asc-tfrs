const fs = require('fs');


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    // pull in the prototype data object and see if it contains a datafile reference
    let prototype = {} || req.session.data['prototype'] // set up if doesn't exist
    const path = 'app/views/processing/v9/_data/'

    var learnersFile = 'learners.json'
    var claimsFile = 'processing-claims.json'
    var statusFile = 'claim-item-statuses.json'
    var trainingFile = 'training.json'
    var organisationsFile = 'organisations.json'

    console.log('loading in claims file')
    req.session.data['claims'] = loadJSONFromFile(claimsFile, path)
    console.log('claims file loaded')

    console.log('loading in statuses file')
    req.session.data['statuses'] = loadJSONFromFile(statusFile, path)
    console.log('statuses file loaded')

    console.log('loading in training file')
    req.session.data['training'] = loadJSONFromFile(trainingFile, path)
    console.log('training file loaded')

    console.log('loading in learners file')
    req.session.data['learners'] = loadJSONFromFile(learnersFile, path)
    console.log('learners file loaded')

    console.log('loading in organisations file')
    req.session.data['organisations'] = loadJSONFromFile(organisationsFile, path)
    console.log('organisations file loaded')

    return console.log('data updated')
}

function updateClaim(foundClaim, paymentResponse, paymentReimbursementAmount, paymentQueryNote, paymentRejectNote, completionResponse, completionQueryNote, completionRejectNote) {
    let submission = getMostRelevantSubmission(foundClaim)    
    if (paymentResponse == "approve") {
            submission.evidenceOfPaymentReview.outcome = "pass"
            submission.evidenceOfPaymentReview.costPerLearner = paymentReimbursementAmount
        } else if (paymentResponse == "reject") {
            submission.evidenceOfPaymentReview.outcome = "fail"
            submission.evidenceOfPaymentReview.note = paymentRejectNote
        } else if (paymentResponse == "queried") {
            submission.evidenceOfPaymentReview.outcome = "queried"
            submission.evidenceOfPaymentReview.note = paymentQueryNote
        }

        if (completionResponse == "approve") {
            submission.evidenceOfCompletionReview.outcome = "pass"
        } else if (completionResponse == "reject") {
            submission.evidenceOfCompletionReview.outcome = "fail"
            submission.evidenceOfCompletionReview.note = completionRejectNote
        } else if (completionResponse == "queried") {
            submission.evidenceOfCompletionReview.outcome = "queried"
            submission.evidenceOfCompletionReview.note = completionQueryNote
        }
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


module.exports = { loadJSONFromFile, loadData, updateClaim, formatDate, checkWDSFormat, signatoryCheck, validNumberCheck, isValidOrgSearch, getMostRelevantSubmission, findCourseByCode, findLearnerById, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable }
