const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');

// Load JSON files
const learners = JSON.parse(fs.readFileSync('./app/data/learners.json', 'utf8'));
const training = JSON.parse(fs.readFileSync('./app/data/training.json', 'utf8'));
const statuses = JSON.parse(fs.readFileSync('./app/data/claim-item-statuses.json', 'utf8'));

// Function to generate a random date in the past year
function getRandomPastDate() {
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  return faker.date.between(pastDate, new Date());
}

// Function to generate a random claim object
function generateClaims(quantity) {
const data = [];
const creators = ['Flossie Gleason', 'Allan Connelly', 'Mara Monahan']

for (let i = 1; i <= quantity; i++) {
  faker.seed(i);
  const claimID = faker.finance.accountNumber(6);
  const learner = faker.helpers.arrayElement(learners);
  const trainingItem = faker.helpers.arrayElement(training);
  const startDate = faker.date.past();
  const status = (faker.helpers.arrayElement(statuses)).id;
  const createdDate = faker.date.past();
  const createdBy = faker.helpers.arrayElement(creators);

  let submittedDate = null;
  if (['submitted', 'insufficient-evidence', 'paid'].includes(status)) {
    submittedDate = faker.date.between({from: createdDate,to:  new Date()});
  }
  let paidDate = null;

  if (status === 'paid') {
    paidDate = faker.date.between({from: submittedDate, to: new Date()});
  }

  let evidenceOfPayment = null;
  let evidenceOfEnrollment = null;
  let evidenceOfCompletion = null;

  if (['ready-to-submit', 'submitted', 'insufficient-evidence', 'paid'].includes(status)) {
    evidenceOfPayment = ('invoice').concat('00', i.toString(), '.pdf');
    evidenceOfCompletion = ('certficate').concat('00', i.toString(), '.pdf');
  }


  const claim = {
    claimID,
    learner,
    training: trainingItem,
    startDate,
    status,
    createdDate,
    createdBy,
    submittedDate,
    paidDate,
    evidenceOfPayment,
    evidenceOfEnrollment,
    evidenceOfCompletion,
  };

  data.push(claim);

}

 // Write data to learners.json
 const jsonFilePath = './app/data/claims.json';
 fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

 //reset seed
 faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));
 
 return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateClaims }
