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

function generateGDSDate(date) {
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const GDSDate = date.getDate().toString().concat(" ", month[date.getMonth()], " ", date.getFullYear());
  return GDSDate
}


function generateLearners (quantity) {
  // Generate data for JSON objects
  const data = [];
  //Load data from JSON file

  //Define set people for usability testing
  const person1 = {
    id: "00001",
    fullName: "Aron Effertz-Stroman",
    dateOfBirth: "1969-03-18T05:58:19.627Z",
    dateOfBirthStr: "18 March 1969",
    roleType: "Local authority direct care"
  };
  data.push(person1);
  
  const person2 = {
    id: "00002",
    fullName: "Roy Kub",
    dateOfBirth: "1992-10-08T15:59:08.977Z",
    dateOfBirthStr: "8 October 1992",
    roleType: "Non-regulated direct care"
  };
  data.push(person2);

  const person3 = {
    id: "00003",
    fullName: "Malinda Mayer",
    dateOfBirth: "1988-05-16T10:24:37.451Z",
    dateOfBirthStr: "16 May 1988",
    roleType: "Local authority direct care"
  };
  data.push(person3);

  const person4 = {
    id: "00004",
    fullName: "Casey Simonis",
    dateOfBirth: "1970-12-01T00:32:51.465Z",
    dateOfBirthStr: "1 December 1970",
    roleType: "Non-regulated direct care"
  };
  data.push(person4);



  for (let i = 5; i <= quantity; i++) {
    const id = i.toString().padStart(5, '0');
    const fullName = fakerEN_GB.person.firstName() + ' ' + fakerEN_GB.person.lastName();
    const dateOfBirth = generateDOB();
    const dateOfBirthStr = generateGDSDate(dateOfBirth);
    const roleType = getRandomRole();
    //const workplace = fakerEN_GB.location.city();

    const person = {
      id,
      fullName,
      dateOfBirth,
      dateOfBirthStr,
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

module.exports = { generateLearners }