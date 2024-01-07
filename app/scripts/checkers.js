function checkClaim(claim) {
    let check = false
            if ( claim.learners.length>0 && 
                claim.learners && 
                claim.startDate !== null && 
                claim.costPerLearner !== null && 
                claim.evidenceOfPayment !== null && 
                claim.learners.every(learner => learner.evidenceOfCompletion !== null) && 
                ( claim.learners.every(learner => learner.evidenceOfEnrollment !== null) || claim.training.fundingModel == "full") )
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
                    claim.status = 'ready-to-submit'
            }
            break;
        }
      }
  }


module.exports = { updateClaimStatus, checkClaim }