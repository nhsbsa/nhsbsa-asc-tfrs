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

function generateGDSDate(date) {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const GDSDate = date.getDate().toString().concat(" ", month[date.getMonth()-1], " ", date.getFullYear());
    return GDSDate
}

// Function to generate a random claim object
function generateClaims(quantity) {
const data = [];

for (let i = 1; i <= quantity; i++) {
  const claimID = i.toString().padStart(5, '0');
  const learner = faker.helpers.arrayElement(learners);
  const trainingItem = faker.helpers.arrayElement(training);
  const startDate = faker.date.past();
  const startDateStr = generateGDSDate(startDate);
  const status = faker.helpers.arrayElement(statuses);
  const createdDate = faker.date.past();
  const createdDateStr = generateGDSDate(createdDate);
  const createdBy = faker.person.fullName();

  let submittedDate = null;
  let submittedDateStr = null;
  if (['submitted', 'insufficient-evidence', 'paid'].includes(status)) {
    submittedDate = faker.date.between({from: createdDate,to:  new Date()});
    submittedDateStr = generateGDSDate(submittedDate);
  }
  let paidDate = null;
  let paidDateStr = null;

  if (status === 'paid') {
    paidDate = faker.date.between({from: submittedDate, to: new Date()});
    paidDateStr = generateGDSDate(paidDate);
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
    startDateStr,
    status,
    createdDate,
    createdDateStr,
    createdBy,
    submittedDate,
    submittedDateStr,
    paidDate,
    paidDateStr,
    evidenceOfPayment,
    evidenceOfEnrollment,
    evidenceOfCompletion,
  };

  data.push(claim);

}

 // Write data to learners.json
 const jsonFilePath = './app/data/claims.json';
 fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

 return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateClaims }
