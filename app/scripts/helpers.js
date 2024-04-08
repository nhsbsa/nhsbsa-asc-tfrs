function checkClaim(claim) {
    let check = false
            if ( claim.learners.length>0 &&
                claim.startDate != null && 
                claim.costPerLearner != null && 
                claim.evidenceOfPayment != null && 
                claim.learners.every(learner => learner.evidence.evidenceOfCompletion != null) && 
                ( claim.learners.every(learner => learner.evidence.evidenceOfEnrollment != null) || claim.training.fundingModel == "full") )
                {
                    check = true
            }
            return check
}

function updateClaimStatus(claimID, claims) {
    for (const claim of claims) {
        if (claimID == claim.claimID) {
            if (checkClaim(claim))
                {
                    console.log('update claim')
                    claim.status = 'ready-to-submit'
            }
            break;
        }
      }
}

function removeSpacesAndLowerCase(input) {

let inputString = String(input);
// Remove spaces using regular expression

let stringWithoutSpaces = inputString.replace(/\s/g, '');

// Convert the string to lowercase
let lowercaseString = stringWithoutSpaces.toLowerCase();

return lowercaseString;
}

function compareNINumbers(ni_1,learners) {
    let check = false
    for (const l of learners) {
        if (removeSpacesAndLowerCase(ni_1)==removeSpacesAndLowerCase(l.id)) {
            check = true 
            break;
        }
    }
    return check
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

module.exports = { updateClaimStatus, checkClaim, compareNINumbers, removeSpacesAndLowerCase, generateUniqueID }
