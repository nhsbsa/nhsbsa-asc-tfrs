const fs = require('fs');
const dataPath = 'app/views/processing/v14/_data/'


// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
    let jsonFile = fs.readFileSync(path + fileName)
    return JSON.parse(jsonFile) // Return JSON as object
}

function loadData(req) {
    
    var claimsFile = 'claims.json'
    var statusFile = 'claim-item-statuses.json'
    var organisationsFile = 'organisations.json'

    console.log('loading in claims file')
    const claims = loadJSONFromFile(claimsFile, dataPath)
    req.session.data['claims'] = claims.filter(claim => claim.status !== "not-yet-submitted");
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

function orderSubmissions(claim) {
      if (!claim || !Array.isArray(claim.submissions) || claim.submissions.length === 0) {
        return [];
    }

    return [...claim.submissions].sort((a, b) => {
        const dateA = a.processedDate || a.submittedDate;
        const dateB = b.processedDate || b.submittedDate;

        // Both have dates → newest first
        if (dateA && dateB) {
            return new Date(dateB) - new Date(dateA);
        }

        // One has a date → that one comes first
        if (dateA) return -1;
        if (dateB) return 1;

        // Neither has a date → keep original relative order
        return 0;
    });
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
  let processedClaims = submissions.filter(submission => submission.submittedDate);
    return processedClaims.sort((a, b) => {
        return new Date(b.submittedDate) - new Date(a.submittedDate);
    });
}

function buildSlotComparison(submissions) {
  const fileLearners = loadJSONFromFile('learners.json', dataPath);
  const learnerMap = new Map(fileLearners.map(l => [l.id, l]));

  // submissions is already sorted: [latest, older, ..., oldest]
  const latest = submissions[0];

  // Map slotID → history across submissions
  const allSlots = new Map();

  submissions.forEach((submission, submissionIndex) => {
    submission.learners.forEach(learner => {
      const slotKey = learner.slotID;

      if (!allSlots.has(slotKey)) {
        allSlots.set(slotKey, {
          slotID: learner.slotID,
          history: Array(submissions.length).fill(null)
        });
      }

      const entry = allSlots.get(slotKey);
      entry.history[submissionIndex] = { ...learner, processedDate: submission.processedDate };
    });
  });

  // Split active vs removed slots (based on latest submission)
  const latestSlotIDs = new Set(latest.learners.map(l => l.slotID));
  const active = [];
  const removed = [];

  for (const [slotID, slotData] of allSlots.entries()) {
    const latestLearnerID = slotData.history[0]?.learnerID;
    const info = latestLearnerID ? learnerMap.get(latestLearnerID) || {} : {};

    const record = {
      slotID,
      learnerID: latestLearnerID || null,
      status: latestSlotIDs.has(slotID) ? "active" : "removed",
      history: slotData.history,
      givenName: info.givenName || "",
      familyName: info.familyName || "",
      changeFlags: computeSlotChangeFlags(slotData.history)
    };

    if (record.status === "active") active.push(record);
    else removed.push(record);
  }

  const sortByName = (a, b) =>
    a.givenName.localeCompare(b.givenName) ||
    a.familyName.localeCompare(b.familyName) ||
    (a.learnerID || "").localeCompare(b.learnerID || "");

  active.sort(sortByName);
  removed.sort(sortByName);

  return [...active, ...removed];
}


function computeSlotChangeFlags(slotHistory) {
  const flags = {
    completionDate: false,
    evidenceOfCompletion: false,
    status: false // slot added/removed or learner replaced
  };

  const baselineIndex = slotHistory.findIndex(l => l);
  if (baselineIndex === -1) return flags;

  const baseline = slotHistory[baselineIndex];

  for (const l of slotHistory) {
    if (!l) {
      flags.status = true; // slot missing in this submission → added/removed
      continue;
    }

    // If learnerID changes within a slot → consider status changed
    if (l.learnerID !== baseline.learnerID) {
      flags.status = true;
    }

    // Completion date changes
    if (baseline.completionDate && l.completionDate && l.completionDate !== baseline.completionDate) {
      flags.completionDate = true;
    }

    // Evidence changes
    if (baseline.evidenceOfCompletion && l.evidenceOfCompletion && l.evidenceOfCompletion !== baseline.evidenceOfCompletion) {
      flags.evidenceOfCompletion = true;
    }
  }

  return flags;
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
  const allLearners = loadJSONFromFile('learners.json', dataPath)
    const mergedLearners = learners.map(learner => {
        const match = allLearners.find(a => a.id === learner.learnerID);
        return {
            ...learner,
            ...match // adds givenName and familyName if found
        };
    });
  const sortedLearners = mergedLearners.sort((a, b) =>
        a.givenName.localeCompare(b.givenName)
     );

  return sortedLearners;
}

function checkProcessingState(claim) {
    let result = {
      check: true,
      missingList: []
    }
    let submission = getMostRelevantSubmission(claim)
    const learners = sortAlphabetically(submission.learners)
    
    const paymentCheck = checkDone(submission.evidenceOfPaymentReview, "payment", claim, submission.trainingCode)
    if (!paymentCheck) {
      result.check = false
      const listItem = {
        id: "payment",
        position: null
      }
      result.missingList.push(listItem)
    }

    let count = 1
    for (const learner of learners) {
      const completionCheck = checkDone(learner.evidenceOfCompletionReview, "completion", claim, submission.trainingCode)
      if (!completionCheck) {
      result.check = false
      const listItem = {
        id: learner.learnerID,
        position: count
      }
      result.missingList.push(listItem)
    }
    count++
    }
    
    return result
}

function checkDone(review, type, claim, trainingCode) {
    let result = true
    console.log(claim.isPaymentPlan)
    console.log(review.outcome)
    if (type == "payment" && ((claim.claimType == "100" && !(isInternalOMMT(trainingCode))) || (claim.claimType == "60") || (claim.claimType == "40" && claim.isPaymentPlan) ) ) {

        if (review.outcome != null) {
            if ((review.outcome == "pass") && !(claim.claimType == "40" && claim.isPaymentPlan)) {
                if ((review.costPerLearner == null || review.costPerLearner == "") || (review.paymentPlan == null && claim.claimType == "60")) {
                  result = false
                }
            } else if ((review.outcome == "fail" || review.outcome == "queried") && (review.note == null || review.note == "")) {
                result = false
            }
        } else {
            result = false
        }

    } else if ( type == "completion" && (claim.claimType == "100" || claim.claimType == "40")) {
        if (review.outcome != null) {
            if ((review.outcome == "fail" || review.outcome == "queried") && (review.note == null || review.note == "" )) {
                result = false
            }
        } else {
            result = false
        }
    }

    return result
}

function findFirstLearnerWithoutOutcome(learners, startIndex = 0) {
  for (let i = startIndex; i < learners.length; i++) {
    const learner = learners[i];

    const outcome =
      learner &&
      learner.evidenceOfCompletionReview &&
      learner.evidenceOfCompletionReview.outcome;

    if (outcome === undefined || outcome === null || outcome === "") {
      return i; // index in array
    }
  }
  return -1;
}



module.exports = { loadJSONFromFile, loadData, formatDate, checkWDSFormat, signatoryCheck, validNumberCheck, isValidOrgSearch, getMostRelevantSubmission, findCourseByCode, findLearnerById, flattenUsers, sortSubmissionsByDate, findUser, findOrg, sortSubmissionsForTable, checkClaimProcess, determineOutcome, isInternalOMMT, getOverallStatus, sortAlphabetically, checkDone, checkProcessingState, buildSlotComparison, orderSubmissions, findFirstLearnerWithoutOutcome }
