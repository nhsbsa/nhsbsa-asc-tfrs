function checkClaim(claim) {
    let check = false
            if ( claim.type == "TU" &&
                claim.learners.length>0 &&
                claim.startDate != null &&
                claim.training != null && 
                claim.costDate != null && 
                claim.evidenceOfPayment != null && 
                claim.learners.every(learner => learner.evidence.evidenceOfCompletion != null) && 
                ( claim.learners.every(learner => learner.evidence.evidenceOfEnrollment != null) || claim.training.fundingModel == "full") )
                {
                    check = true
            } else if (
                claim.type == "CPD" &&
                claim.learners.length>0 &&
                ((claim.startDate != null && claim.learners.every(learner => learner.evidence.evidenceOfCompletion != null)) || claim.categoryName != "Courses" ) && 
                claim.claimAmount != null && 
                claim.description != null && 
                claim.evidenceOfPayment != null && 
                claim.costDate != null
            )
            {
                check = true
            }
            return check
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

function sortByCreatedDate(array) {
    // Use the sort method to reorder the array based on the createdDate property
    array.sort((a, b) => {
      const dateA = new Date(b.createdDate);
      const dateB = new Date(a.createdDate);
      return dateA - dateB;
    });
  
    return array;
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

module.exports = { checkClaim, compareNINumbers, removeSpacesAndLowerCase, sortByCreatedDate, updateClaimStatus }
