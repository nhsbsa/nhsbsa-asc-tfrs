function findClaim(id, claims) {
    let index = 1
    for (const c of claims) {
        if (id == c.claimID) {
            break;
        }
        index++
      }

      return index

}




module.exports = { findClaim, findLearner, findTraining }