const { faker } = require('@faker-js/faker');
const { fakerEN_GB } = require('@faker-js/faker');
const fs = require('fs');

module.exports = (router) => {
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

  return faker.date.between({from: sixtyFiveYearsAgo, to: eighteenYearsAgo}).toISOString().split('T')[0];
}
// funtion to load in data files
function loadJSONFromFile(fileName, path = 'app/data/') {
  let jsonFile = fs.readFileSync(path + fileName)
  return JSON.parse(jsonFile) // Return JSON as object
}


// Function to get a random role name based on distribution
function getRandomRole() {
  // Generate a random number between 0 and 1
  const randomValue = Math.random();
  const rolesData = loadJSONFromFile('role-types.json')
  
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


function generateLearners (quantity) {
  // Generate data for JSON objects
  const data = [];
  //Load data from JSON file

  for (let i = 1; i <= quantity; i++) {
    const id = i.toString().padStart(5, '0');
    const fullName = fakerEN_GB.person.firstName() + ' ' + fakerEN_GB.person.lastName();
    const dateOfBirth = generateDOB();
    const roleType = getRandomRole();
    //const workplace = fakerEN_GB.location.city();

    const person = {
      id,
      fullName,
      dateOfBirth,
      roleType,
      //workplace,
    };

    data.push(person);
  }

  // Write data to learners.json
  const jsonFilePath = './app/data/learners.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

  return console.log(`JSON data written to ${jsonFilePath}`);

}

router.get('/generate', function (req, res) {
  generateLearners(400);
  res.redirect('../')
})

}