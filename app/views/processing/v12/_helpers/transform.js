const fs = require('fs');
const dataPath = 'app/views/processing/v12/_data/'

function getRandomLearners(learnerList, x) {
  const copyLearners = [...learnerList];

  if (x > copyLearners.length) {
    console.error(
      "Error: Number of learners to select is greater than the total number of available learners."
    );
    return [];
  }

  const selectedLearners = [];

  for (let i = 0; i < x; i++) {
    const randomIndex = Math.floor(Math.random() * copyLearners.length);
    const learner = JSON.parse(JSON.stringify(copyLearners[randomIndex]));
    selectedLearners.push(learner);
    copyLearners.splice(randomIndex, 1); // remove the selected learner to avoid duplicates
  }

  return selectedLearners;
}

function getRandomLearners(learners, num) {
  const shuffled = [...learners].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function transformClaims() {
  const learners = JSON.parse(fs.readFileSync('./app/views/processing/v12/_data/learners.json', 'utf8'));
  const claims = JSON.parse(fs.readFileSync('./app/views/processing/v12/_data/processing-claims.json', 'utf8'));

  const transformedClaims = [];
  const claimLearnerMap = {}; // Stores learners by base claimID

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const newClaim = { ...claim };
    newClaim.submissions = [];

    // Strip the final letter suffix (e.g., "GE2-UA5D-4K6C-A" -> "GE2-UA5D-4K6C")
    const baseClaimID = claim.claimID.slice(0, -2); // assumes "-X" at the end of ID
    let selectedLearners;

    // 1️⃣ Reuse learners if this claim shares a base ID with another claim
    if (claimLearnerMap[baseClaimID]) {
      selectedLearners = claimLearnerMap[baseClaimID];
    } else {
      // 2️⃣ Otherwise, create random learners for this claim
      const numLearners = Math.floor(Math.random() * 7) + 1;
      selectedLearners = getRandomLearners(learners, numLearners);

      // 3️⃣ Store them for other claims (40/60 pair) to reuse
      claimLearnerMap[baseClaimID] = selectedLearners;
    }

    // 4️⃣ Build all submissions with the SAME learners
    for (let j = 0; j < claim.submissions.length; j++) {
      const submission = claim.submissions[j];
      const newSubmission = { ...submission };

      const newLearners = [];
      for (let k = 0; k < selectedLearners.length; k++) {
        const learner = selectedLearners[k];

        newLearners.push({
          learnerID: learner.id || learner.learnerID,
          completionDate: submission.completionDate || null,
          evidenceOfCompletion: submission.evidenceOfCompletion || null,
          evidenceOfCompletionReview: {
            outcome: submission.evidenceOfCompletionReview?.outcome || null,
            note: submission.evidenceOfCompletionReview?.note || null
          }
        });
      }

      // Remove old single-learner fields
      delete newSubmission.learnerID;
      delete newSubmission.completionDate;
      delete newSubmission.evidenceOfCompletion;
      delete newSubmission.evidenceOfCompletionReview;

      // Add shared learners
      newSubmission.learners = newLearners;

      // Handle sharedCompletionDate flag
      newSubmission.sharedCompletionDate = claim.status !== "not-yet-submitted" ? false : null;

      newClaim.submissions.push(newSubmission);
    }

    transformedClaims.push(newClaim);
  }

  return transformedClaims;
}

module.exports = { transformClaims }