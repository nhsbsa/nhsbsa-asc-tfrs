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

// Function to get a random role name based on distribution
function getRandomjobTitle(roleType) {
  const rolesData = loadJSONFromFile('role-types.json')
  
  for (const role of rolesData) {

      // Check if the random value falls within the range of the current role
      if (role.rolename == roleType) {
          
        return faker.helpers.arrayElement(role.jobTitles);
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
  const data = [];
  const idList = [];
  //Load data from JSON file

  //Define set people for usability testing
  const person1 = {
    id: "KZ 79 0F 13 Z",
    fullName: "Aron Effertz-Stroman",
    //dateOfBirth: "1969-03-18T05:58:19.627Z",
    jobTitle: "Council Care Assistant",
    roleType: "Local authority direct care"
  };
  data.push(person1);
  idList.push(person1.id);
  
  const person2 = {
    id: "LE 09 5F 94 M",
    fullName: "Roy Kub",
    //dateOfBirth: "1992-10-08T15:59:08.977Z",
    jobTitle: "Care Aide",
    roleType: "Non-regulated direct care"
  };
  data.push(person2);
  idList.push(person2.id)

  const person3 = {
    id: "OB 78 2F 15 O",
    fullName: "Malinda Mayer",
    //dateOfBirth: "1988-05-16T10:24:37.451Z",
    jobTitle: "Local Authority Care Worker",
    roleType: "Local authority direct care"
  };
  data.push(person3);
  idList.push(person3.id);

  const person4 = {
    id: "ZX 51 9F 87 P",
    fullName: "Casey Simonis",
    //dateOfBirth: "1970-12-01T00:32:51.465Z",
    jobTitle: "Support Worker",
    roleType: "Non-regulated direct care"
  };
  data.push(person4);
  idList.push(person4.id);



  for (let i = 5; i <= quantity; i++) {
    const id = generateUniqueID(i);
    const fullName = fakerEN_GB.person.firstName() + ' ' + fakerEN_GB.person.lastName();
    //const dateOfBirth = generateDOB();
    const roleType = getRandomRole();
    const jobTitle = getRandomjobTitle(roleType);
    //const workplace = fakerEN_GB.location.city();

    const person = {
      id,
      fullName,
      //dateOfBirth,
      jobTitle,
      roleType,
      //workplace,
    };

    data.push(person);
  }

  // Write data to learners.json
  const jsonFilePath = './app/data/learners.json';
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  //reset seed
  faker.seed(Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER));

  return console.log(`JSON data written to ${jsonFilePath}`);

}

module.exports = { generateLearners }