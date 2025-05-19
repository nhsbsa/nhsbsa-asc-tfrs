const fs = require('fs');
const { faker } = require('@faker-js/faker');

function getRandomLearners(learnerList, x) {
  const copyLearners = [...learnerList];
  if (x > copyLearners.length) {
    console.error("Error: Number of TU-eligible learners to select is greater than the total number of TU-eligible learners.");
    return;
  }
    const randomIndex = Math.floor(Math.random() * copyLearners.length);
    const learner = JSON.parse(JSON.stringify(copyLearners[randomIndex]));
    copyLearners.splice(randomIndex, 1);
  return learner;
}

// Function to get a random role name based on distribution
function getRandomStatus(statuses) {
  // Generate a random number between 0 and 1
  const randomValue = Math.random();

  // Accumulate the distribution values to determine the range
  let cumulativeDistribution = 0;

  for (const status of statuses) {
    cumulativeDistribution += status.distribution;

    // Check if the random value falls within the range of the current role
    if (randomValue <= cumulativeDistribution) {
      return status.id;
    }
  }

  // If no role is found (which should be rare), return the last role as a fallback
  return statuses[statuses.length - 1].id;
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

function generatecreatedByList(organisation) {
  let names = [{name: organisation.signatory.active.givenName + " " + organisation.signatory.active.familyName, email: organisation.signatory.active.email}]

  for (const user of organisation.users.active) {
    names.push({name: user.givenName + " " + user.familyName, email: user.email})
  }
  return names

}

function generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, claimType, createdDate) {
  
  let submissions = null;

  const learners = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/learners.json', 'utf8'));

  const learnerID =  getRandomLearners(learners, 1).id;
  const startDate = faker.date.between({ from: createdDate, to: new Date() });
  const trainingCode = trainingItem.code


  if ( claimType == "full") {
    submissions = [];

    const submission =  {
      submitter: null,
      submittedDate: null,
  
      trainingCode,
      learnerID, 
      startDate, 
  
      costDate: null,
      evidenceOfPayment: [],
  
      completionDate: null, 
      evidenceOfCompletion: null,
  
      evidenceOfPaymentReview: {
        outcome: null,
        note: null,
        costPerLearner: null
      },
      evidenceOfCompletionReview: {
        outcome: null,
        note: null
      },
      processedDate: null,
      processedBy: null
    }
  
    if (['not-yet-submitted'].includes(status)) {
      submissions.push(submission)
    } else if (['submitted', 'rejected', 'approved', "queried"].includes(status)) {
      submission.submitter = faker.helpers.arrayElement(users).email;
      submission.submittedDate = faker.date.between({ from: startDate, to: new Date() });
  
      submission.costDate = faker.date.between({ from: policyDate, to: startDate });
      submission.evidenceOfPayment = ["bankStatement1.pdf", "invoice1.pdf", "receipt1.pdf"];
  
      submission.evidenceOfCompletion = "certificate1.pdf";
      submission.completionDate = faker.date.between({ from: startDate, to: submission.submittedDate });
  
      if (['rejected'].includes(status)) {
  
        submission.evidenceOfPaymentReview.outcome = "fail"
        submission.evidenceOfPaymentReview.note = "The evidence of payment show you paid for a course that is not eligible for funding through our service."
  
        submission.evidenceOfCompletionReview.outcome = "pass"
  
      } else if(['approved'].includes(status)) {
  
        submission.evidenceOfPaymentReview.outcome = "pass"
        submission.evidenceOfPaymentReview.note = "pass"
        submission.evidenceOfPaymentReview.costPerLearner = Math.floor(trainingItem.reimbursementAmount * 0.9)
  
        submission.evidenceOfCompletionReview.outcome = "pass"
  
  
      } else if(['queried'].includes(status)) {
        submission.evidenceOfPaymentReview.outcome = "queried"
        submission.evidenceOfPaymentReview.note = "The evidence of payment provided is not sufficient to prove you paid for the training."

        submission.evidenceOfCompletionReview.outcome = "pass"

        const submission2 =  {
          submitter: null,
          submittedDate: null,
      
          trainingCode,
          learnerID, 
          startDate, 
      
          costDate: submission.costDate,
          evidenceOfPayment: submission.evidenceOfPayment,
      
          completionDate: submission.completionDate, 
          evidenceOfCompletion: submission.evidenceOfCompletion,
      
          evidenceOfPaymentReview: {
            outcome: null,
            note: null,
            costPerLearner: null
          },
          evidenceOfCompletionReview: {
            outcome: null,
            note: null
          },
          processedDate: null,
          processedBy: null
        }

        submissions.push(submission2)
  
      }

      if (['rejected', 'approved', "queried"].includes(status)) {
        submission.processedBy = faker.helpers.arrayElement(backOfficeStaff.processors)
        submission.processedDate = faker.date.between({ from: submission.submittedDate, to: new Date() });
      }

      submissions.push(submission)

    }
  } else if (claimType == "split"){
    submissions = {
      submissionsA: [],
      submissionsB: []
    };

    const submissionDateA = faker.date.between({ from: startDate, to: new Date() })

    // 60 part
    const submissionA =  {
      submitter: faker.helpers.arrayElement(users).email,
      submittedDate: submissionDateA,
  
      trainingCode,
      learnerID, 
      startDate, 
  
      costDate: faker.date.between({ from: policyDate, to: startDate }),
      evidenceOfPayment: ["bankStatement1.pdf", "invoice1.pdf", "receipt1.pdf"],
  
      completionDate: null, 
      evidenceOfCompletion: null,
  
      evidenceOfPaymentReview: {
        outcome: "pass",
        note: null,
        costPerLearner: Math.floor(trainingItem.reimbursementAmount * 0.9)
      },
      evidenceOfCompletionReview: {
        outcome: null,
        note: null
      },
      processedDate: faker.date.between({ from: submissionDateA, to: new Date() }),
      processedBy: faker.helpers.arrayElement(backOfficeStaff.processors)
    }

    const submissionDateB = faker.date.between({ from: submissionA.processedDate, to: new Date() });

    //40 part
    const submissionB =  {
      submitter: null,
      submittedDate: null,
  
      trainingCode,
      learnerID, 
      startDate, 
  
      costDate: submissionA.costDate,
      evidenceOfPayment: submissionA.evidenceOfPayment,
  
      completionDate: null, 
      evidenceOfCompletion: null,
  
      evidenceOfPaymentReview: {
        outcome: submissionA.evidenceOfPaymentReview.outcome,
        note: submissionA.evidenceOfPaymentReview.note,
        costPerLearner: submissionA.evidenceOfPaymentReview.costPerLearner
      },
      evidenceOfCompletionReview: {
        outcome: null,
        note: null
      },
      processedDate: null,
      processedBy: null
    }

    if (['submitted', 'rejected', 'approved', "queried"].includes(status)) {
      submissionB.submitter = faker.helpers.arrayElement(users).email;
      submissionB.submittedDate = submissionDateB;
  
      submissionB.evidenceOfCompletion = "certificate1.pdf";
      submissionB.completionDate =  faker.date.between({ from: startDate, to: submissionDateB });
    }

    if (['rejected'].includes(status)) {

      submissionB.evidenceOfCompletionReview.outcome = "fail"
      submissionB.evidenceOfCompletionReview.note = "The evidence of payment show you paid for a course that is not eligible for funding through our service."

    } else if(['approved'].includes(status)) {

      submissionB.evidenceOfCompletionReview.outcome = "pass"

    } else if(['queried'].includes(status)) {
      submissionB.evidenceOfCompletionReview.outcome = "queried"
      submissionB.evidenceOfCompletionReview.note = "The completion date on the certificate does not match the completion date on the claim"

      //40 part draft
      const submissionB2 =  {
        submitter: null,
        submittedDate: null,
    
        trainingCode,
        learnerID, 
        startDate, 
    
        costDate: submissionB.costDate,
        evidenceOfPayment: submissionB.evidenceOfPayment,
    
        completionDate: submissionB.completionDate, 
        evidenceOfCompletion: submissionB.evidenceOfCompletion,
    
        evidenceOfPaymentReview: {
          outcome: submissionA.evidenceOfPaymentReview.outcome,
          note: submissionA.evidenceOfPaymentReview.note,
          costPerLearner: submissionA.evidenceOfPaymentReview.costPerLearner
        },
        evidenceOfCompletionReview: {
          outcome: submissionB.evidenceOfCompletionReview.outcome,
          note: submissionB.evidenceOfCompletionReview.note
        },
        processedDate: null,
        processedBy: null
      }

      submissions.submissionsB.push(submissionB2)

    }

    if (['rejected', 'approved', "queried"].includes(status)) {
      submissionB.processedBy = faker.helpers.arrayElement(backOfficeStaff.processors)
      submissionB.processedDate = faker.date.between({ from: submissionB.submittedDate, to: new Date() });
    }

    submissions.submissionsA.push(submissionA)
    submissions.submissionsB.push(submissionB)

  }

  return submissions
}

// Claim Generator
function generateClaims(workplaceID) {

  // Load JSON files
  const training = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/training.json', 'utf8'));
  const statuses = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/claim-statuses.json', 'utf8'));
  const organisations = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/organisations.json', 'utf8'));
  const backOfficeStaff = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/backOfficeStaff.json', 'utf8'));

  let organisation = null
  for (const org of organisations) {
    if (org.workplaceID == workplaceID) {
      organisation = org 
    }
  }

  const users = generatecreatedByList(organisation);

  // Load pre-set claims
  const preSetClaims = JSON.parse(fs.readFileSync('./app/views/claims/v16/_data/pre-set-claims.json', 'utf8'));
  for (const claim of preSetClaims) {

    for (const submission of claim.submissions) {
      if (submission.submitter != null) {
        submission.submitter = faker.helpers.arrayElement(users).email
      }
    }

    claim.createdBy = faker.helpers.arrayElement(users).email
    claim.workplaceID = workplaceID
  }

  let data = preSetClaims
  /* let data = [] */

   //set date references
  const policyDate = new Date('2024-04-01 '); // April 2, 2024



  for (let i = 1; i <= organisation.numberOfClaims; i++) {
    faker.seed(i);
    
    let claimID = generateUniqueID();
    let claimType = null
    const status = getRandomStatus(statuses);

    const user = faker.helpers.arrayElement(users)
    const createdBy = user.email;
    const createdDate = faker.date.between({ from: policyDate, to: new Date() }); 

    const trainingGroup = faker.helpers.arrayElement(training)
    const trainingItem = faker.helpers.arrayElement(trainingGroup.courses);

    //if it is a 60/40 eligible training and not yet submitted claim, randomly decide whether the 60 or 40 part is not yet submitted or queried.
    let randomBoolean = false
    if ((['not-yet-submitted', 'queried', 'rejected', 'submitted'].includes(status) && trainingItem.fundingModel == "split" )) {
      randomBoolean = Math.random() < 0.5
    }

    if (trainingItem.fundingModel == "full" || randomBoolean) {

      if (trainingItem.fundingModel == "full") {
        claimID = claimID + "-A"
        claimType = "100"
      } else if (trainingItem.fundingModel == "split") {
        claimID = claimID + "-B"
        claimType = "60"
      }
      
      const claim = {
        claimID,
        workplaceID,
        claimType,
        status,
        createdDate,
        createdBy,
        notes: [],
        submissions: generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, "full", createdDate),
      };

      data.push(claim);

    } else if (trainingItem.fundingModel == "split") {
      const claimIDA = claimID + "-B"
      const claimIDB = claimID + "-C"
      const generatedSubmissions = generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, "split", createdDate)
      const submissionsA = generatedSubmissions.submissionsA
      const submissionsB = generatedSubmissions.submissionsB

      const claimA = {
        claimID: claimIDA,
        workplaceID,
        claimType: "60",
        status: "approved",
        createdDate,
        createdBy,
        notes: [],
        submissions: submissionsA,
      };

      const claimB = {
        claimID: claimIDB,
        workplaceID,
        claimType: "40",
        status,
        createdDate,
        createdBy,
        notes: [],
        submissions: submissionsB,
      };
      data.push(claimA);
      data.push(claimB);
    }
  }

  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return data

}


module.exports = { generateClaims }

