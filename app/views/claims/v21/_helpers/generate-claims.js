const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { generatecreatedByList, findCourseByCode } = require('../_helpers/helpers.js');

function getRandomLearners(learnerList, count) {
  const copyLearners = [...learnerList];

  if (count > copyLearners.length) {
    console.error(
      "Error: Number of learners to select is greater than the total number of available learners."
    );
    return [];
  }

  const selectedLearners = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * copyLearners.length);
    const learner = JSON.parse(JSON.stringify(copyLearners[randomIndex]));
    selectedLearners.push(learner);
    copyLearners.splice(randomIndex, 1); // remove the selected learner to avoid duplicates
  }

  return selectedLearners;
}

function generateUniqueID(claimsArray = []) {
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  const sections = [3, 4, 4];
  let id;
  let isDuplicate;

  do {
    // 1. Generate the ID string
    id = '';
    for (let i = 0; i < sections.length; i++) {
      for (let j = 0; j < sections[i]; j++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters.charAt(randomIndex);
      }
      if (i < sections.length - 1) {
        id += '-';
      }
    }

    // 2. Check if the generated ID exists in the claimsArray
    isDuplicate = claimsArray.some(claim => claim.claimID === id);

  } while (isDuplicate); // 3. If it's a duplicate, go back to step 1

  return id;
}

function generateClaim(claimTypeInput, claimStatusInput, submissionsInput, learnersInput, compDate, matchingClaim) {
  const learnerList = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/learners.json', 'utf8'));
  const training = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/training.json', 'utf8'));
  const claims = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/claims.json', 'utf8'));
  const organisations = JSON.parse(fs.readFileSync('./app/views/claims/v20/_data/organisations.json', 'utf8'));

  const workplaceID = "A02944934"

  let organisation = null
  for (const org of organisations) {
    if (org.workplaceID == workplaceID) {
      organisation = org 
    }
  }

  const users = generatecreatedByList(organisation)
  const user = faker.helpers.arrayElement(users)
  const createdBy = user.email;
  let claimLearners = null
  let trainingCode = null
  if (matchingClaim == null) {
    claimLearners = getRandomLearners(learnerList, learnersInput)
    trainingCode = getRandomCourseCode(training, claimTypeInput)
  } else {
    claimLearners = getLearnersFromPairClaim(matchingClaim, learnerList)
    trainingCode = matchingClaim.submissions[0].trainingCode
  }
  console.log(trainingCode)
   //set date references
  const policyDate = new Date('2025-04-01 '); // April 1, 2025 not the real policy date but having claims from this year is more realistic

  const claimType = assignClaimType(claimTypeInput)
  const claimID  = assignClaimID(claimType, matchingClaim, claims)
  const status = assignClaimStatus(claimStatusInput)
  const isPaymentPlan = assignPaymentPlan(claimTypeInput, claimStatusInput)
  const createdDate = faker.date.between({ from: policyDate, to: new Date() });
  let submissions = []
  for (let i = 0; i < submissionsInput; i++) {
    submissions = generateSubmission(submissions, claimType, isPaymentPlan, claimStatusInput, compDate, trainingCode, claimLearners, createdDate, policyDate, users)
  }

  if (status == "queried") {
    submissions = generateDraftSubmission(submissions, claimType, learnerList)
  }

  const claim = {
      claimID,
      claimType,
      workplaceID,
      createdBy,
      status,
      isPaymentPlan,
      createdDate,
      submissions
    }

    return claim
}

function generateSubmission(submissions, claimType, isPaymentPlan, claimStatusInput, compDate, trainingCode, claimLearners, createdDate, policyDate, users) {
  const backOfficeStaff = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/backOfficeStaff.json', 'utf8'));
  const learnerList = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/learners.json', 'utf8'));

  approvepaymentFiles = ["bank-statement-212.pdf", "invoice-212.pdf", "receipt-212.pdf", "bank-statement-212-1.pdf"]
  rejectedpaymentFiles = ["bank-statement-313.pdf", "invoice-313.pdf", "receipt-313.pdf", "bank-statement-313-1.pdf"]
  approvecompletionFile = "certificate-212.pdf"
  rejectedcompletionFile = "certificate-313.pdf"
  const training = findCourseByCode(trainingCode)

    if (claimStatusInput == "NYSE") {
      //if the claim is a Not-yet-submitted (empty) then leave the submission empty add it to the empty submission list and return it
      const submission = {
        submitter: null,
        submittedDate: null,
        processedBy: null,
        processedDate: null,
        trainingCode,
        startDate: null,
        costDate: null,
        evidenceOfPayment: [],
        evidenceOfPaymentReview: {
          outcome: null,
          note: null,
          paymentPlan: null,
          costPerLearner: null
        },
        sharedCompletionDate: null,
        learners: [],
        removedLearners: []
      }

      submissions.push(submission)
      return submissions
    } else {
      if (submissions.length === 0 ) {
        const submission = {
          submitter: null,
          submittedDate: null,
          processedBy: null,
          processedDate: null,
          trainingCode,
          startDate: null,
          costDate: null,
          evidenceOfPayment: [],
          evidenceOfPaymentReview: {
            outcome: null,
            note: null,
            paymentPlan: null,
            costPerLearner: null
          },
          sharedCompletionDate: null,
          learners: [],
          removedLearners: []
        }
        //if this is the first submission then create fresh data
        submission.startDate = faker.date.between({ from: policyDate, to: new Date() });
        const mostrecentCompletionDate = faker.date.between({ from: submission.startDate , to: new Date() });

        let slotCount = 1
        for (const l of claimLearners) {
          const learner = {
          slotID: slotCount,
          learnerID: l.id,
          learnerChanged: null,
          completionDate: null,
          evidenceOfCompletion: [],
          evidenceOfCompletionReview: {
            outcome: null,
            note: null
          }
        }
        submission.learners.push(learner)
        slotCount++
        }

        if ((claimType == "100" && !isInternalOMMT(trainingCode)) || claimType == "60" || (claimType == "40" && isPaymentPlan)) {
          submission.costDate = faker.date.between({ from: policyDate, to: new Date() });
          switch(claimStatusInput) {
            case "NYSP":
              submission.evidenceOfPayment = getRandomSubset(approvepaymentFiles)
              break;
            case "submitted":
              submission.evidenceOfPayment = getRandomSubset(approvepaymentFiles)
              break;
            case "queried":
              submission.evidenceOfPayment = getRandomSubset(rejectedpaymentFiles)
              submission.evidenceOfPaymentReview = {
                outcome: "queried",
                note: "The payment date on the evidence did not match the payment date on the claim details.",
                paymentPlan: null,
                costPerLearner: null
              }
              break;
            case "approved":
              submission.evidenceOfPayment = getRandomSubset(approvepaymentFiles)
              submission.evidenceOfPaymentReview = {
                outcome: "pass",
                note: null,
                paymentPlan: null,
                costPerLearner: (training.reimbursementAmount * 0.9)
              }
              if (isPaymentPlan === true) {
                submission.evidenceOfPaymentReview.paymentPlan = "yes"
              } else if (isPaymentPlan === false) {
                submission.evidenceOfPaymentReview.paymentPlan = "yes"
              }

              break;
            case "rejected":
              submission.evidenceOfPayment = getRandomSubset(rejectedpaymentFiles)
              submission.evidenceOfPaymentReview = {
                outcome: "fail",
                note: "The payment evidence shows that this was a part of an apprenticeship levy and therefore not eligible for funding.",
                paymentPlan: null,
                costPerLearner: null
              }
              break;
          }
        }

        if (claimType == "40" || claimType == "100") {
          submission.sharedCompletionDate = (compDate == "yes")
          for (const learner of submission.learners) {
            if (submission.sharedCompletionDate) {
              learner.completionDate = mostrecentCompletionDate
            } else {
              learner.completionDate = subtractRandomDays(mostrecentCompletionDate)
            }
            switch(claimStatusInput) {
              case "NYSP":
                learner.evidenceOfCompletion = approvecompletionFile
                break;
              case "submitted":
                learner.evidenceOfCompletion = approvecompletionFile
                break;
              case "queried":
                if (Math.random() < 0.3 && claimType != "40") {
                  learner.evidenceOfCompletion = rejectedcompletionFile
                  learner.evidenceOfCompletionReview.outcome = "queried"
                  if (submission.sharedCompletionDate) {
                    learner.evidenceOfCompletionReview.note = "The learner's name on the certificate does not match the learner's name on the claim details."
                  } else {
                    learner.evidenceOfCompletionReview.note = "The completion date on the certificate does not match the completion date on the claim details."
                  }              
                } else {
                  learner.evidenceOfCompletion = approvecompletionFile
                  learner.evidenceOfCompletionReview = {
                    outcome: "pass",
                    note: null
                  }
                }
                break;
              case "approved":
                learner.evidenceOfCompletion = approvecompletionFile
                learner.evidenceOfCompletionReview = {
                  outcome: "pass",
                  note: null
                }
                break;
              case "rejected":
                learner.evidenceOfCompletion = rejectedcompletionFile
                learner.evidenceOfCompletionReview = {
                  outcome: "fail",
                  note: "The certificate shows that this was part of an apprenticeship levy and therefore not eligible for reimbursement."
                }
                break;
            }
          }
        }

        if (claimStatusInput != "NYSP") {
          const user = faker.helpers.arrayElement(users)
          submission.submitter = user.email
          const laterDate = new Date(Math.max(
            new Date(mostrecentCompletionDate).getTime(),
            new Date(createdDate).getTime()
          ));
          submission.submittedDate = faker.date.between({ from: laterDate, to: new Date() });
        }

        if (claimStatusInput != "NYSP" && claimStatusInput != "submitted" && claimStatusInput != "queried") {
          submission.processedBy = faker.helpers.arrayElement(backOfficeStaff.processors)
          submission.processedDate = faker.date.between({ from: submission.submittedDate, to: new Date() });
        }

        submissions.push(submission)
      } else {
        const submission = structuredClone(submissions.at(-1))
        const mostrecentCompletionDate = getMostRecentCompletionDate(submission.learners)
        const laterDate = new Date(Math.max(
            new Date(mostrecentCompletionDate).getTime(),
            new Date(createdDate).getTime()
          ));
        submission.processedDate = faker.date.between({ from: laterDate, to: submission.submittedDate });
        submission.submittedDate = faker.date.between({ from: laterDate, to: submission.processedDate });
        const user = faker.helpers.arrayElement(users)
        submission.submitter = user.email
        
        if ((claimType == "100" && !isInternalOMMT(trainingCode)) || claimType == "60" || (claimType == "40" && isPaymentPlan)) {
          submission.evidenceOfPayment = getRandomSubset(rejectedpaymentFiles)
          submission.evidenceOfPaymentReview = {
            outcome: "queried",
            note: "The payment date on the evidence did not match the payment date on the claim details. The payment evidence does not show that the training was paid for.",
            paymentPlan: null,
            costPerLearner: null
          }
          submission.costDate = getOffsetDate(submission.costDate)
        }

        if (claimType == "40" || claimType == "100") {
          for (const learner of submission.learners) {
            if (learner.evidenceOfCompletionReview.outcome == "queried") {
              if (submission.sharedCompletionDate) {
                learner.learnerChanged = learner.learnerID
                learner.learnerID = getAvailableLearnerID(submission.learners, learnerList)
              } else {
                learner.completionDate = getOffsetDate(learner.completionDate)
              }
            } else if (learner.evidenceOfCompletionReview.outcome == "fail") {
                const num = Math.floor(Math.random() * 100) + 1
                learner.evidenceOfCompletion = "certificate" + String(num) + ".pdf"
                learner.evidenceOfCompletionReview = {
                    outcome: "queried",
                    note: "The learner's name on the certificate does not match the learner's name on the claim details."
                  }
            } else if (learner.evidenceOfCompletionReview.outcome == "pass" || learner.evidenceOfCompletionReview.outcome == null)  {
              if (Math.random() < 0.25 && claimType != "40") {
                  learner.evidenceOfCompletion = rejectedcompletionFile
                  learner.evidenceOfCompletionReview = {
                    outcome: "queried"
                  }
                  if (submission.sharedCompletionDate) {
                    learner.evidenceOfCompletionReview.note = "The learner's name on the certificate does not match the learner's name on the claim details."
                  } else {
                    learner.evidenceOfCompletionReview.note = "The completion date on the certificate does not match the completion date on the claim details."
                  }              
                } else {
                  learner.evidenceOfCompletion = approvecompletionFile
                  learner.evidenceOfCompletionReview = {
                    outcome: "pass",
                    note: null
                  }
                }
            }
          }
        }

        submissions.push(submission)
      }

      return submissions
    }
}

function generateDraftSubmission(submissions, claimType, learnerList) {
    const draftSubmission = structuredClone(submissions[0])
    draftSubmission.submitter = null
    draftSubmission.submittedDate = null
    draftSubmission.processedBy = null
    draftSubmission.processedDate = null
    draftSubmission.evidenceOfPaymentReview = {
      outcome: null,
      note: null,
      paymentPlan: null,
      costPerLearner: null
    }
    let changeCount = 0
    let removedCount = 0
    const maxChanges = Math.ceil((draftSubmission.learners.length / 2) * 0.5);
    for (let i = draftSubmission.learners.length - 1; i >= 0; i--) {
      const learner = draftSubmission.learners[i];
      learner.evidenceOfCompletionReview = {
          outcome: null,
          note: null
        }
      if (changeCount <= removedCount && changeCount < maxChanges && claimType != "40") {
        learner.learnerChanged = learner.learnerID
        learner.learnerID = getAvailableLearnerID(draftSubmission.learners, learnerList)
        changeCount++
      } else if (removedCount <= changeCount && removedCount < maxChanges && draftSubmission.learners.length > 1) {
        const [removedLearner] = draftSubmission.learners.splice(i, 1);
        draftSubmission.removedLearners.push(removedLearner);
        removedCount++
      }
    }
    submissions.unshift(draftSubmission)

    return submissions
}

function getRandomCourseCode(data, value) {
  // Helper to get a random item from an array
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (value === '60' || value === '40' || value === '40PP') {
    const group = data.find(g => g.groupTitle === 'Qualifications');
    if (!group) return null;
    
    const randomCourse = getRandom(group.courses);
    return randomCourse ? randomCourse.code : null;
  }

  if (value === '100') {
    const group = data.find(g => g.groupTitle === 'Courses');
    if (!group) return null;

    // Filter out any courses where the code starts with 'OMMT'
    const nonOmmtCourses = group.courses.filter(c => !c.code.startsWith('OMMT'));
    
    const randomCourse = getRandom(nonOmmtCourses);
    return randomCourse ? randomCourse.code : null;
  }

  if (value === '100OMMT') {
    const group = data.find(g => g.groupTitle === 'Courses');
    if (!group) return null;

    // Filter specifically for OMMT courses that contain 'INT' in the code
    const ommtIntCourses = group.courses.filter(c => 
      c.code.startsWith('OMMT') && c.code.includes('INT')
    );
    
    const randomCourse = getRandom(ommtIntCourses);
    return randomCourse ? randomCourse.code : null;
  }

  return "Invalid value provided";
}

function updateClaimID(claimID, claimType) {
  // 1. Determine the correct suffix letter based on claimType
  let suffixLetter = '';
  if (claimType === "100") {
    suffixLetter = 'A';
  } else if (claimType === "60") {
    suffixLetter = 'B';
  } else if (claimType === "40") {
    suffixLetter = 'C';
  } else {
    // Optional: handle unexpected claimTypes (defaults to A or keeps as is)
    suffixLetter = 'A'; 
  }

  // 2. Define the regex to look for a trailing "-[Letter]"
  // The "$" ensures we only look at the very end of the string
  const suffixRegex = /-[A-Z]$/;

  if (suffixRegex.test(claimID)) {
    // If it exists, replace the last letter with our new one
    return claimID.replace(suffixRegex, `-${suffixLetter}`);
  } else {
    // If it doesn't exist, append the hyphen and the letter
    return `${claimID}-${suffixLetter}`;
  }
}

function assignClaimType(claimTypeInput) {
  let claimType = null
  switch(claimTypeInput) {
    case "100":
      claimType = "100"
      break;
    case "100OMMT":
      claimType = "100"
      break;
    case "60":
      claimType = "60"
      break;
    case "60PP":
      claimType = "60"
      break;
    case "40":
      claimType = "40"
      break;
    case "40PP":
      claimType = "40"
      break;
    default:
      claimType = "100"
  }

  return claimType

}

function assignClaimStatus(claimStatusVariation) {
  let claimStatus = null
  switch(claimStatusVariation) {
    case "NYSE":
      claimStatus = "not-yet-submitted"
      break;
    case "NYSP":
      claimStatus = "not-yet-submitted"
      break;
    case "queried":
      claimStatus = "queried"
      break;
    case "submitted":
      claimStatus = "submitted"
      break;
    case "approved":
      claimStatus = "approved"
      break;
    case "rejected":
      claimStatus = "rejected"
      break;
    default:
      claimStatus = "not-yet-submitted"
  }

  return claimStatus

}

function assignClaimID(claimType, matchingClaim, claims) {
  let claimID = null

  if (matchingClaim != null) {
    claimID = updateClaimID(matchingClaim.claimID, claimType)
  } else {
    const baseClaimID = generateUniqueID(claims)
    claimID = updateClaimID(baseClaimID, claimType)
  }

  return claimID
}

function assignPaymentPlan(claimTypeInput, claimStatusInput) {
  let isPaymentPlan = null

  if (claimTypeInput == "60PP" || claimTypeInput == "40PP") {
    isPaymentPlan = true
  } else if ((claimTypeInput == "60" && claimStatusInput == "approved") || claimTypeInput == "40") {
    isPaymentPlan = false
  }

  return isPaymentPlan
}

function getRandomSubset(arr) {
  // 1. Determine a random size between 1 and 4
  const randomSize = Math.floor(Math.random() * 4) + 1;

  // 2. Shuffle a copy of the array and take the first N elements
  // We use [...arr] to avoid changing the original array
  return [...arr]
    .sort(() => 0.5 - Math.random())
    .slice(0, randomSize);
}

function subtractRandomDays(isoDateString) {
  // 1. Convert the ISO string to a Date object
  const date = new Date(isoDateString);

  // 2. Generate a random number of days between 0 and 10
  const randomDays = Math.floor(Math.random() * 11); // 11 ensures 10 is inclusive

  // 3. Subtract the days
  // .getDate() gets the day of the month, .setDate() updates it
  date.setDate(date.getDate() - randomDays);

  // 4. Convert back to ISO format
  return date.toISOString();
}

function getOffsetDate(isoDateString) {
  const date = new Date(isoDateString);
  
  // 1. Get random days (1-10)
  const days = Math.floor(Math.random() * 10) + 1;

  // 2. Randomly pick direction: 1 for add, -1 for subtract
  const direction = Math.random() < 0.5 ? 1 : -1;

  // 3. Apply and return
  date.setDate(date.getDate() + (days * direction));
  
  return date.toISOString();
}

function getAvailableLearnerID(slots, learners) {
  // 1. Collect all IDs currently in use (learnerID and learnerChanged)
  // We use a Set because looking up a value in a Set is much faster than an array
  const usedIDs = new Set();

  slots.forEach(slot => {
    if (slot.learnerID) usedIDs.add(slot.learnerID);
    if (slot.learnerChanged) usedIDs.add(slot.learnerChanged);
  });

  // 2. Filter the learners array for those whose ID is NOT in the usedIDs set
  const availableLearners = learners.filter(learner => !usedIDs.has(learner.id));

  // 3. Return a random available ID, or null if none are left
  if (availableLearners.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableLearners.length);
  return availableLearners[randomIndex].id;
}

function getMostRecentCompletionDate(learners) {
  // 1. Filter out any learners that don't have a completionDate yet
  const learnersWithDates = learners.filter(l => l.completionDate);

  // 2. If no dates exist, return null
  if (learnersWithDates.length === 0) return null;

  // 3. Compare dates to find the maximum
  const mostRecent = learnersWithDates.reduce((latest, current) => {
    return new Date(current.completionDate) > new Date(latest.completionDate) 
      ? current 
      : latest;
  });

  return mostRecent.completionDate;
}

function getLearnersFromPairClaim(matchingClaim, learnerList) {
  let learners = []
  const firstSubmission = matchingClaim.submissions.at(-1)
  for (const learner of firstSubmission.learners) {
    const foundLearner = learnerList.find(l => l.id === learner.learnerID);
    learners.push(foundLearner)
  }
  return learners
}

function isInternalOMMT(courseCode) {
  const validValues = [
    "OMMT/T1/INT",
    "OMMT/T2/INT"
  ];

  return validValues.includes(courseCode);
}

module.exports = { generateClaim }

