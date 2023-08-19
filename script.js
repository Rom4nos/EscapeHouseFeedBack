const feedbackForm = document.getElementById("feedback-submit-form");
const thankYouMessage = document.querySelector(".thank-you-message");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const feedbackText = document.getElementById("feedback-text-good");
const photoFilesInput = document.getElementById("feedback-photos");
const recommendContainer = document.querySelector(".recommend-container");
let rating; // Declare the rating variable outside event handlers

document.getElementById("feedback-form").addEventListener("submit", function(event) {
  event.preventDefault(); 
  
  const initialContainer = document.querySelector(".container");
  initialContainer.style.display = "none";
  
  const ratingContainer = document.querySelector(".rating-container");
  ratingContainer.style.display = "block";
});

document.getElementById("rating-button").addEventListener("click", function(event) {
  event.preventDefault();
  
  const selectedRating = document.querySelector('input[name="rating"]:checked');
  
  if (!selectedRating) {
    alert("Please select a rating option.");
    return;
  }
  
  rating = selectedRating.value; // Assign the value to the rating variable
  const ratingContainer = document.querySelector(".rating-container");
  ratingContainer.style.display = "none";
  console.log("Selected Rating:", rating);

  if (rating == "regular" || rating == "bad") {
    feedbackForm.style.display = "block";
  } else {
    recommendContainer.style.display = "block"; // Show recommend container directly
  }
});

document.getElementById("feedback-submit").addEventListener("click", function(event) {
  event.preventDefault();
  feedbackForm.style.display = "none";
  recommendContainer.style.display = "block";
  console.log("Feedback Text:", feedbackText.value);
  console.log("Photo Files:", photoFilesInput.files);
});

document.getElementById("recommend-button").addEventListener("click", function(event) {
  event.preventDefault();
  
  const selectedRecommendation = document.querySelector('input[name="recommend"]:checked');
  
  if (!selectedRecommendation) {
    alert("Please select a recommendation option.");
    return;
  }
  
  const recommendation = selectedRecommendation.value;
  recommendContainer.style.display = "none";
  
  console.log("Selected Recommendation:", recommendation);
  console.log("Feedback Data:", {
    name: nameInput.value,
    email: emailInput.value,
    rating: rating,
    feedbackText: feedbackText.value,
    photos: photoFilesInput.files,
    recommendation: recommendation,
  });
  

  thankYouMessage.style.display = "block";

  const feedbackTextValue = feedbackText.value;
  const photoFiles = photoFilesInput.files; 
  // Push the feedback to Firebase Realtime Database
  const storageRef = storage.ref(); // Initialize Firebase Storage reference
  
  // Upload each photo file to Firebase Storage and collect promises
  const uploadPromises = [];
  for (const photoFile of photoFiles) {
    const photoFileName = `${Date.now()}-${photoFile.name}`; // Add a timestamp to avoid duplicate names
    const photoRef = storageRef.child(photoFileName);
    const uploadTask = photoRef.put(photoFile);
    uploadPromises.push(uploadTask);
  }

  // Wait for all photo uploads to complete
  Promise.all(uploadPromises)
    .then(uploadSnapshots => {
      const photoURLs = [];
      for (const snapshot of uploadSnapshots) {
        photoURLs.push(snapshot.ref.getDownloadURL());
      }
      return Promise.all(photoURLs);
    })
    .then(photoURLs => {
      // All photos uploaded, now submit feedback data to Firebase Realtime Database
      const feedbackRef = firebase.database().ref("feedback");
      feedbackRef.push({
        name: nameInput.value,
        email: emailInput.value,
        rating: rating,
        feedbackText: feedbackTextValue,
        photos: photoURLs, // Use the array of photo URLs
        recommendation: recommendation,
      });
      console.log("Feedback data sent successfully!");
    })
    .catch(error => {
      console.error("Error sending feedback data:", error);
    });

});
