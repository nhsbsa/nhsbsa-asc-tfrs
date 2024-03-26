const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');

function getRandomLearners(learnerList, x, eligibleRoles) {
  const copyLearners = [...learnerList];

  const eligibleLearners = copyLearners.filter(learner => {
    return eligibleRoles.includes(learner.roleType);
  });

  if (x > eligibleLearners.length) {
    console.error("Error: Number of TU-eligible learners to select is greater than the total number of TU-eligible learners.");
    return;
  }
    const randomIndex = Math.floor(Math.random() * eligibleLearners.length);
    const learner = JSON.parse(JSON.stringify(eligibleLearners[randomIndex]));
    eligibleLearners.splice(randomIndex, 1);

    learner.evidence = {
      evidenceOfCompletion: null,
      completionDate: null
    }

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

// Function to generate a date before the specified date
function generateDateBefore(referenceDate) {
  // Generate a random number of days to subtract
  const daysToSubtract = faker.number.int({ min: 1, max: 365 }); // Adjust the range as needed

  // Subtract the random number of days from the reference date
  const newDate = new Date(referenceDate);
  newDate.setDate(referenceDate.getDate() - daysToSubtract);

  return newDate;
}

// Tu Claim Generator
function generateTUClaims(quantity, version) {
  let data = [];
  const creators = ['Flossie Gleason', 'Allan Connelly', 'Mara Monahan']

  // Load JSON files
  const learners = JSON.parse(fs.readFileSync('./app/data/' + version + '/learners.json', 'utf8'));
  const training = JSON.parse(fs.readFileSync('./app/data/' + version + '/training.json', 'utf8'));
  const statuses = JSON.parse(fs.readFileSync('./app/data/' + version + '/claim-item-statuses.json', 'utf8'));
  const roleTypes = JSON.parse(fs.readFileSync('./app/data/' + version + '/role-types.json', 'utf8'));

  const tuEligibleRoles = roleTypes.filter(role => role.eligibility.isTUeligible).map(role => role.rolename);


  const preSetClaims = JSON.parse(fs.readFileSync('./app/data/' + version + '/pre-set-claims.json', 'utf8'));
  data = data.concat(preSetClaims)

  for (let i = 1; i <= quantity; i++) {
    faker.seed(i);
    const claimID = faker.finance.accountNumber(6);
    const selectedLearner = getRandomLearners(learners, 1, tuEligibleRoles);
    const trainingGroup = faker.helpers.arrayElement(training);
    const trainingItem = faker.helpers.arrayElement(trainingGroup.courses);
    const startDate = faker.date.past();
    const status = getRandomStatus(statuses);
    const createdDate = faker.date.past();
    const createdBy = faker.helpers.arrayElement(creators);
    const costDate = generateDateBefore(createdDate);


    let submittedDate = null;
    let evidenceOfPayment = null;
    if (['submitted', 'rejected', 'approved'].includes(status)) {
      submittedDate = faker.date.between({ from: startDate, to: new Date() });
      evidenceOfPayment = 'invoice' + '00' + i.toString() + '.pdf';
      selectedLearner.evidence.evidenceOfCompletion = 'certficate' + '00' + i.toString() + '.pdf';
      selectedLearner.evidence.completionDate = faker.date.between({ from: startDate, to: submittedDate });
    }

    let approvedDate = null;
    if (['approved'].includes(status)) {
      approvedDate = faker.date.between({ from: submittedDate, to: new Date() });
    }

    let rejectedDate = null;
    let rejectedNote = null
    if (['rejected'].includes(status)) {
      rejectedDate = faker.date.between({ from: submittedDate, to: new Date() });
      rejectedNote = "The evidence of payment provided did not meet our requirements because it did not refer to the training that was paid for.";
    }

    const claim = {
      claimID,
      type: "TU",
      learner: selectedLearner,
      training: trainingItem,
      startDate,
      status,
      createdDate,
      createdBy,
      submittedDate,
      approvedDate,
      rejectedDate,
      rejectedNote,
      evidenceOfPayment,
      costDate,
    };

    data.push(claim);

  }

  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return data;

}
//CPD Claim Generator
function generateCPDClaims(quantity, version) {
  let data = [];
  const creators = ['Flossie Gleason', 'Allan Connelly', 'Mara Monahan']

  // Load JSON files
  const learners = JSON.parse(fs.readFileSync('./app/data/' + version + '/learners.json', 'utf8'));
  const activities = JSON.parse(fs.readFileSync('./app/data/' + version + '/cpd-activities.json', 'utf8'));
  const statuses = JSON.parse(fs.readFileSync('./app/data/' + version + '/claim-item-statuses.json', 'utf8'));
  const roleTypes = JSON.parse(fs.readFileSync('./app/data/' + version + '/role-types.json', 'utf8'));

  const CPDEligibleRoles = roleTypes.filter(role => role.eligibility.isCPDeligible).map(role => role.rolename);

  for (let i = 1; i <= quantity; i++) {
    faker.seed(i + 10000);
    const claimID = faker.finance.accountNumber(6);
    const selectedLearner = getRandomLearners(learners, 1, CPDEligibleRoles);
    const activityGroup = faker.helpers.arrayElement(activities);
    const category = faker.helpers.arrayElement(activityGroup.categories);
    const categoryName = category.name;
    const description = faker.helpers.arrayElement(category.examples);
    const claimAmount = faker.number.int({ min: 10, max: 100 });

    let startDate = null;
    if (categoryName == "Courses") {
      startDate = faker.date.past();
    }

    const status = getRandomStatus(statuses);
    const createdDate = faker.date.past();
    const createdBy = faker.helpers.arrayElement(creators);
    const costDate = generateDateBefore(createdDate);

    let submittedDate = null;
    if (['submitted', 'queried', 'paid', 'approved'].includes(status)) {
      submittedDate = faker.date.between({ from: createdDate, to: new Date() });
    }

    let approvedDate = null;
    if (['paid', 'approved'].includes(status)) {
      approvedDate = faker.date.between({ from: submittedDate, to: new Date() });
    }

    let queriedDate = null;
    if (['queried'].includes(status)) {
      queriedDate = faker.date.between({ from: submittedDate, to: new Date() });
    }

    let paidDate = null;
    if (status === 'paid') {
      paidDate = faker.date.between({ from: approvedDate, to: new Date() });
    }

    const evidenceOfPayment = ('invoice').concat('00', i.toString(), '.pdf');

    if (['submitted', 'queried', 'paid', 'approved'].includes(status)) {

      for (const l of selectedLearners) {
        l.evidence.evidenceOfCompletion = 'certficate' + '00' + i.toString() + '.pdf';
      }
    }

    const claim = {
      claimID,
      type: "CPD",
      learner: selectedLearner,
      categoryName,
      description,
      startDate,
      status,
      createdDate,
      createdBy,
      submittedDate,
      approvedDate,
      queriedDate,
      paidDate,
      claimAmount,
      evidenceOfPayment,
      costDate,
    };

    data.push(claim);

  }

  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return data;

}

function generateClaims(quantity, version) {
  let data = [];
  const TUClaims = generateTUClaims(Math.floor(quantity * 0.96), version);
  //const CPDClaims = generateCPDClaims(Math.floor(quantity * 0.04), version);
  const CPDClaims = []

  data = data.concat(TUClaims, CPDClaims);

  // Write data to learners.json
  const jsonFilePath = './app/data/' + version + '/claims.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));


}


module.exports = { generateClaims }

