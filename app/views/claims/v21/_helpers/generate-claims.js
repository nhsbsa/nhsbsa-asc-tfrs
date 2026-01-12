const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { generatecreatedByList } = require('../_helpers/helpers.js');

function getRandomLearners(learnerList, x) {
  const copyLearners = [...learnerList];

  if (x == 0 ) {
    x = 1
  }

  if (x > copyLearners.length) {
    console.error(
      "Error: Number of learners to select is greater than the total number of available learners."
    );
    return [];
  }

  const selectedLearners = [];

  for (let i = 0; i < x; i++) {
    const randomIndex = Math.floor(Math.random() * copyLearners.length);
    const learner = JSON.parse(JSON.stringify(copyLearners[randomIndex]));
    selectedLearners.push(learner);
    copyLearners.splice(randomIndex, 1); // remove the selected learner to avoid duplicates
  }

  return selectedLearners;
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

function generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, claimType, createdDate, isPaymentPlan) {
  
  let submissions = null;

  const learners = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/learners.json', 'utf8'));

  const submissionLearners =  getRandomLearners(learners, (Math.floor(Math.random() * 30)));
  const startDate = faker.date.between({ from: createdDate, to: new Date() });
  const trainingCode = trainingItem.code


  if ( claimType == "full") {
    submissions = [];

    const submission =  {
      submitter: null,
      submittedDate: null,
  
      trainingCode,
      startDate, 
  
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
      processedDate: null,
      processedBy: null
    }

    for (const learner of submissionLearners) {
      const learnerItem = { learnerID: learner.id, 
        completionDate: null, 
        evidenceOfCompletion: null,
        evidenceOfCompletionReview: {
          outcome: null,
          note: null
        }
      }
      submission.learners.push(learnerItem)
    }
  
    if (['not-yet-submitted'].includes(status)) {
      submissions.push(submission)
    } else if (['submitted', 'rejected', 'approved', "queried"].includes(status)) {
      submission.submitter = faker.helpers.arrayElement(users).email;
      submission.submittedDate = faker.date.between({ from: startDate, to: new Date() });
  
      submission.costDate = faker.date.between({ from: policyDate, to: startDate });
      submission.evidenceOfPayment = ["bankStatement1.pdf", "invoice1.pdf", "receipt1.pdf"];

      for (const learner of submission.learners) {
        learner.evidenceOfCompletion = "certificate1.pdf";
        learner.completionDate = faker.date.between({ from: startDate, to: submission.submittedDate });
      }
      submission.sharedCompletionDate = false

      if (['rejected'].includes(status)) {
  
        submission.evidenceOfPaymentReview.outcome = "fail"
        submission.evidenceOfPaymentReview.note = "The evidence of payment show you paid for a course that is not eligible for funding through our service."
        
        for (const learner of submission.learners) {
          learner.evidenceOfCompletionReview.outcome = "pass"
        }
  
      } else if(['approved'].includes(status)) {
  
        submission.evidenceOfPaymentReview.outcome = "pass"
        submission.evidenceOfPaymentReview.costPerLearner = Math.floor(trainingItem.reimbursementAmount * 0.9)
        
        for (const learner of submission.learners) {
          learner.evidenceOfCompletionReview.outcome = "pass"
        }
  
  
      } else if(['queried'].includes(status)) {
        submission.evidenceOfPaymentReview.outcome = "queried"
        submission.evidenceOfPaymentReview.note = "The evidence of payment provided is not sufficient to prove you paid for the training."

        const submission2 =  {
          submitter: null,
          submittedDate: null,
      
          trainingCode,
          startDate, 
      
          costDate: submission.costDate,
          evidenceOfPayment: submission.evidenceOfPayment,
      
          evidenceOfPaymentReview: {
            outcome: null,
            note: null,
            paymentPlan: null,
            costPerLearner: null
          },

          sharedCompletionDate: false,
          learners: [],
          processedDate: null,
          processedBy: null
        }

        for (const learner of submission.learners) {

          submission2.learners.push(structuredClone(learner))

          const checkNumber = Math.random()
          if (checkNumber < 0.5 ) {
            learner.evidenceOfCompletionReview.outcome = "queried"
            learner.evidenceOfCompletionReview.note = "The completion date on the certificate does not match the completion date on the claim"
          } else if (checkNumber >=0.5 && checkNumber < 0.75) {
            learner.evidenceOfCompletionReview.outcome = "fail"
            learner.evidenceOfCompletionReview.note = "The evidence of completion shows that this learner is inelgible for reimbursement."
          } else if (checkNumber >= 0.75 && checkNumber < 1) {
            learner.evidenceOfCompletionReview.outcome = "pass"
            learner.evidenceOfCompletionReview.note = null
          }
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
    const processedDateA = faker.date.between({ from: submissionDateA, to: new Date() })

    // 60 part
    const submissionA =  {
      submitter: faker.helpers.arrayElement(users).email,
      submittedDate: submissionDateA,
  
      trainingCode,
      startDate, 
  
      costDate: faker.date.between({ from: policyDate, to: startDate }),
      evidenceOfPayment: ["bankStatement1.pdf", "invoice1.pdf", "receipt1.pdf"],
  
      evidenceOfPaymentReview: {
        outcome: "pass",
        note: null,
        paymentPlan: null,
        costPerLearner: Math.floor(trainingItem.reimbursementAmount * 0.9)
      },

      sharedCompletionDate: null,
      learners: [],
      processedDate: processedDateA,
      processedBy: faker.helpers.arrayElement(backOfficeStaff.processors)
    }

    for (const learner of submissionLearners) {
      const learnerItem = { learnerID: learner.id, 
        completionDate: null, 
        evidenceOfCompletion: null,
        evidenceOfCompletionReview: {
          outcome: null,
          note: null
        }
      }
      submissionA.learners.push(learnerItem)
    }

    if (isPaymentPlan == true) {
          submissionA.evidenceOfPaymentReview.paymentPlan = "yes"
    } else if (isPaymentPlan == false) {
          submissionA.evidenceOfPaymentReview.paymentPlan = "no"
    }

    const submissionDateB = faker.date.between({ from: processedDateA, to: new Date() });

    //40 part
    const submissionB =  {
      submitter: null,
      submittedDate: null,
  
      trainingCode,
      startDate, 
  
      costDate: null,
      evidenceOfPayment: null,
  
      evidenceOfPaymentReview: {
        outcome: null,
        note: null,
        paymentPlan: null,
        costPerLearner: null
      },

      sharedCompletionDate: null,
      learners: [],
      processedDate: null,
      processedBy: null
    }

    let learnerCopy = null
    for (const learner of submissionA.learners) {
      learnerCopy = structuredClone(learner)
      submissionB.learners.push(learnerCopy)
    }

    if (['submitted', 'rejected', 'approved', "queried"].includes(status)) {
      submissionB.submitter = faker.helpers.arrayElement(users).email;
      submissionB.submittedDate = submissionDateB;
      
      for (const learner of submissionB.learners) {
      learner.evidenceOfCompletion = "certificate1.pdf";
      const completionDateB =  faker.date.between({ from: processedDateA, to: submissionDateB });
      learner.completionDate = completionDateB
      }

      submissionB.sharedCompletionDate = false
      
      const latestDate = new Date(Math.max(...submissionB.learners.map(l => new Date(l.completionDate))));

      if (isPaymentPlan == true) {
        submissionB.costDate = faker.date.between({ from: processedDateA , to: latestDate })
        submissionB.evidenceOfPayment = ["bankStatement1.pdf", "invoice1.pdf", "receipt1.pdf"]

        submissionB.evidenceOfPaymentReview.outcome = "pass"
        submissionB.evidenceOfPaymentReview.costPerLearner = Math.floor(trainingItem.reimbursementAmount * 0.9)
        submissionB.evidenceOfPaymentReview.paymentPlan = "yes"
      }

    }

    if (['rejected'].includes(status)) {

      for (const learner of submissionB.learners) {
        learner.evidenceOfCompletionReview.outcome = "fail"
        learner.evidenceOfCompletionReview.note = "The evidence of payment show you paid for a course that is not eligible for funding through our service."
      }


    } else if(['approved'].includes(status)) {

      for (const learner of submissionB.learners) {
        learner.evidenceOfCompletionReview.outcome = "pass"
      }

    } else if(['queried'].includes(status)) {


      //40 part draft
      const submissionB2 =  {
        submitter: null,
        submittedDate: null,
    
        trainingCode,
        startDate, 
    
        costDate: null,
        evidenceOfPayment: null,

    
        evidenceOfPaymentReview: {
          outcome: null,
          note: null,
          paymentPlan: null,
          costPerLearner: null
        },

        sharedCompletionDate: false,
        learners: [],
        processedDate: null,
        processedBy: null
      }

      for (const learner of submissionB.learners) {

        submissionB2.learners.push(structuredClone(learner))

        const checkNumber = Math.random()
        if (checkNumber < 0.5 ) {
          learner.evidenceOfCompletionReview.outcome = "queried"
          learner.evidenceOfCompletionReview.note = "The completion date on the certificate does not match the completion date on the claim"
        } else if (checkNumber >=0.5 && checkNumber < 0.75) {
          learner.evidenceOfCompletionReview.outcome = "fail"
          learner.evidenceOfCompletionReview.note = "The evidence of completion shows that this learner is inelgible for reimbursement."
        } else if (checkNumber >= 0.75 && checkNumber < 1) {
          learner.evidenceOfCompletionReview.outcome = "pass"
          learner.evidenceOfCompletionReview.note = null
        }
      }


      if (isPaymentPlan == true) {
        submissionB2.evidenceOfPaymentReview.outcome = "pass"
        submissionB2.evidenceOfPaymentReview.costPerLearner = Math.floor(trainingItem.reimbursementAmount * 0.9)
        submissionB2.evidenceOfPaymentReview.paymentPlan = "yes"
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
  const training = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/training.json', 'utf8'));
  const statuses = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/claim-statuses.json', 'utf8'));
  const organisations = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/organisations.json', 'utf8'));
  const backOfficeStaff = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/backOfficeStaff.json', 'utf8'));

  let organisation = null
  for (const org of organisations) {
    if (org.workplaceID == workplaceID) {
      organisation = org 
    }
  }

  const users = generatecreatedByList(organisation);

  const data = [];

   //set date references
  const policyDate = new Date('2024-04-01 '); // April 2, 2025 not the real policy date but having claims from this year is more realistic



  for (let i = 1; i <= organisation.numberOfClaims; i++) {
    faker.seed(i);
    
    let claimID = generateUniqueID();
    let claimType = null
    let isPaymentPlan = null
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
        isPaymentPlan,
        status,
        createdDate,
        createdBy,
        notes: [],
        submissions: generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, "full", createdDate, isPaymentPlan),
      };

      data.push(claim);

    } else if (trainingItem.fundingModel == "split") {
      const claimIDA = claimID + "-B"
      const claimIDB = claimID + "-C"

      if (Math.random() < 0.5) {
        isPaymentPlan = true
      } else {
        isPaymentPlan = false
      }
      
      const generatedSubmissions = generateSubmissions(users, status, policyDate, trainingItem, backOfficeStaff, "split", createdDate, isPaymentPlan)
      const submissionsA = generatedSubmissions.submissionsA
      const submissionsB = generatedSubmissions.submissionsB

      const claimA = {
        claimID: claimIDA,
        workplaceID,
        claimType: "60",
        isPaymentPlan,
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
        isPaymentPlan,
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


function generateClaim(claimType, claimStatus, submissions, learners, compDate, learnerAction) {
  const learnerList = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/learners.json', 'utf8'));
  const training = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/learners.json', 'utf8'));
  const claims = JSON.parse(fs.readFileSync('./app/views/claims/v21/_data/claims.json', 'utf8'));

  const trainingCode = getRandomCourseCode(training, claimType)
  const claimLearners = getRandomLearners(learnerList, learners)
   //set date references
  const policyDate = new Date('2025-04-01 '); // April 1, 2025 not the real policy date but having claims from this year is more realistic


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

function getRandomLearners(learners, quantity) {
  let amount = 1
  if (quantity == 'multi') {
    const min = 5;
    const max = 20;
    amount = Math.floor(Math.random() * (max - min + 1)) + min;
  }  
  const shuffled = [...learners].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, amount);
}

module.exports = { generateClaim }

