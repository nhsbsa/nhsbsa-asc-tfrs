const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');

function getRandomLearners(learnerList, x) {
  // Make a copy of the original array to avoid modifying it
  const copyLearners = [...learnerList];
  
  // Check if x is greater than the array length
  if (x > copyLearners.length) {
    console.error("Error: Number of learners to select is greater than the total number of learners.");
    return;
  }

  // Initialize the array to store the selected learners
  var selectedLearners = [];

  // Loop to select x unique random learners
  for (let i = 0; i < x; i++) {
    // Generate a random index within the remaining array length
    const randomIndex = Math.floor(Math.random() * copyLearners.length);

    var learner = copyLearners[randomIndex];
    // Remove the selected learner from the original array to ensure uniqueness
    copyLearners.splice(randomIndex, 1);

    learner.evidence = {
      evidenceOfEnrollment: null,
      evidenceOfCompletion: null
    }

    // Add the selected learner to the new array
    selectedLearners.push(learner);

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


// Function to generate a random claim object
function generateClaims(quantity, version) {
const data = [];
const creators = ['Flossie Gleason', 'Allan Connelly', 'Mara Monahan']

// Load JSON files
const learners = JSON.parse(fs.readFileSync('./app/data/' + version + '/learners.json', 'utf8'));
const training = JSON.parse(fs.readFileSync('./app/data/' + version + '/training.json', 'utf8'));
const statuses = JSON.parse(fs.readFileSync('./app/data/' + version + '/claim-item-statuses.json', 'utf8'));

for (let i = 1; i <= quantity; i++) {
  faker.seed(i);
  const nolearners = faker.number.int({ min: 1, max: 10 });
  const claimID = faker.finance.accountNumber(6);
  const selectedLearners = getRandomLearners(learners, nolearners);
  const trainingItem = faker.helpers.arrayElement(training);
  const startDate = faker.date.past();
  const status = getRandomStatus(statuses);
  const createdDate = faker.date.past();
  const createdBy = faker.helpers.arrayElement(creators);
  const costPerLearner = trainingItem.reimbursementAmount;

  let submittedDate = null;
  if (['submitted', 'insufficient-evidence', 'paid'].includes(status)) {
    submittedDate = faker.date.between({from: createdDate,to:  new Date()});
  }
  let paidDate = null;

  if (status === 'paid') {
    paidDate = faker.date.between({from: submittedDate, to: new Date()});
  }

  let evidenceOfPayment = null;
  if (['ready-to-submit', 'submitted', 'insufficient-evidence', 'paid'].includes(status)) {
    evidenceOfPayment = ('invoice').concat('00', i.toString(), '.pdf');

    let x = 1;
    
      for (const l of selectedLearners) {
        if (trainingItem.fundingModel == 'split'){
          l.evidence.evidenceOfEnrollment = 'registeration'+'00'+i.toString()+x.toString()+'.pdf';
        }
        l.evidence.evidenceOfCompletion = 'certficate'+'00'+i.toString()+x.toString()+'.pdf';
        x++
      }
  }


  const claim = {
    claimID,
    learners: selectedLearners,
    training: trainingItem,
    startDate,
    status,
    createdDate,
    createdBy,
    submittedDate,
    paidDate,
    costPerLearner,
    evidenceOfPayment,
    notes: []
  };

  data.push(claim);

}

 // Write data to learners.json
 const jsonFilePath = './app/data/'+version+'/claims.json';
 fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

 //reset seed
 faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
 
 return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateClaims }
