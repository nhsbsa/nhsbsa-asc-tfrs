const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');
const fs = require('fs');

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


function generateLearners (quantity) {
  // Generate data for JSON objects
  let data = [];

  //Load job titles data from JSON file
  const jobTitles = JSON.parse(fs.readFileSync('./app/views/claims/v20/_data/jobTitles.json', 'utf8'));

  //load pre set learners from JSOn file
  const preSetLearners = JSON.parse(fs.readFileSync('./app/views/claims/v20/_data/pre-set-learners.json', 'utf8'));

  //Start the date off with the present learners
  data = data.concat(preSetLearners);

  //generate [quanitity] number of learners
  for (let i = 5; i <= quantity; i++) {
    const id = generateUniqueID(i);
    const givenName = fakerEN_GB.person.firstName();
    const familyName = fakerEN_GB.person.lastName();
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

    const person = {
      id,
      familyName,
      givenName,
      jobTitle,
    };

    data.push(person);
  }

  // Write data to learners.json
  const jsonFilePath = './app/views/claims/v20/_data/learners.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateLearners }