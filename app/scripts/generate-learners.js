const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');
const fs = require('fs');

// Function to generate a random date of birth for individuals between 18 and 65 years old
function generateDOB() {
  
  // Get the current date
  const currentDate = new Date();

  // Subtract 65 years from the current date
  const sixtyFiveYearsAgo = new Date();
  sixtyFiveYearsAgo.setFullYear(currentDate.getFullYear() - 65);

   // Subtract 18 years from the current date
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);

  return faker.date.between({from: sixtyFiveYearsAgo, to: eighteenYearsAgo});
}

// Function to get a random role name based on distribution
function getRandomRole(rolesData) {
  // Generate a random number between 0 and 1
  const randomValue = Math.random();
  
  // Accumulate the distribution values to determine the range
  let cumulativeDistribution = 0;
  
  for (const role of rolesData) {
      cumulativeDistribution += role.distribution;

      // Check if the random value falls within the range of the current role
      if (randomValue <= cumulativeDistribution) {
          return role.rolename;
      }
  }

  // If no role is found (which should be rare), return the last role as a fallback
  return rolesData[rolesData.length - 1].rolename;
}

// Function to get a random role name based on distribution
function getRandomjobTitle(roleType, rolesData) {
  
  for (const role of rolesData) {

      // Check if the random value falls within the range of the current role
      if (role.rolename == roleType) {
          
        return faker.helpers.arrayElement(role.jobTitles);
      }
  }

  // If no role is found (which should be rare), return the last role as a fallback
  return rolesData[rolesData.length - 1].rolename;
}

// Function to generate a unique 9-digit code
function generateUniqueID(seed) {
  faker.seed(seed)
  const startLetters = faker.string.alpha({
    casing: 'upper',
    length: 2});
  const oneNumbers = faker.string.numeric(2);
  const twoNumbers = faker.string.numeric(1).concat("F");
  const threeNumbers = faker.string.numeric(2);
  const endLetter = faker.string.alpha({
    casing: 'upper',
    length: 1});
  const id = startLetters.concat(" ", oneNumbers," ",twoNumbers," ",threeNumbers," ",endLetter)
  return id;
}


function generateLearners (quantity, version) {
  // Generate data for JSON objects
  let data = [];
  //Load data from JSON file

  const rolesData = JSON.parse(fs.readFileSync('./app/data/claims/' + version + '/role-types.json', 'utf8'));

  const preSetLearners = JSON.parse(fs.readFileSync('./app/data/claims/' + version + '/pre-set-learners.json', 'utf8'));
  data = data.concat(preSetLearners);


  for (let i = 5; i <= quantity; i++) {
    const id = generateUniqueID(i);
    const givenName = fakerEN_GB.person.firstName();
    const familyName = fakerEN_GB.person.lastName();
    const roleType = getRandomRole(rolesData);
    const jobTitle = getRandomjobTitle(roleType, rolesData);

    const person = {
      id,
      familyName,
      givenName,
      jobTitle,
    };

    data.push(person);
  }

  // Write data to learners.json
  const jsonFilePath = './app/data/claims/'+ version+ '/learners.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateLearners }