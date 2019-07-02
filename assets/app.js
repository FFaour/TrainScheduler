// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyAzt-_OcqV3uo0Uj3laeqnYwV45ryKUWWw",
  authDomain: "trainscheduler-b61d2.firebaseapp.com",
  databaseURL: "https://trainscheduler-b61d2.firebaseio.com",
  projectId: "trainscheduler-b61d2",
  storageBucket: "trainscheduler-b61d2.appspot.com",
  messagingSenderId: "52237664483",
  appId: "1:52237664483:web:1008ecad0185fd72"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create a variable to reference the database
var database = firebase.database();

//Function declarations
const clearInputs = () => {
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-input").val("");
  $("#frequency-input").val("");
}

function productDelete(ctl) {
  $(ctl).parents("tr").remove();
}

// Create an on click function that adds trains to the top table
$("#add-train-btn").on("click", function(event) {
  event.preventDefault();
  
  // create variables with the user input from form
  var trnName = $("#train-name-input").val().trim();
  var trnDest = $("#destination-input").val().trim();
  var firstTrnTime = $("#first-train-input").val().trim();
  var trnFreq = $("#frequency-input").val().trim();

  // create a temporary object for holding the new train data
  var newTrn = {
    name: trnName,
    destination: trnDest,
    firstTime: firstTrnTime,
    frequency: trnFreq
  };
  
  // upload the new train data to the database if complete else warning modal
  if (newTrn.name === "" || newTrn.destination === "" || newTrn.firstTime === "" || newTrn.frequency === "") {
    $("#closeModal").modal();
  } else {
    const newSchedule = database.ref().push(newTrn);
    console.log(newSchedule.key);
    // clear the form values after values have been stored
    clearInputs();
    // console log the object and values that were just pushed to the database
    console.log(newTrn);
  };

});

//removes the "active" class to .popup and .popup-content when the "Close" button is clicked 
$(".close").on("click", function() {
  console.log("Close was clicked!");
  $(".popup-overlay, .popup-content").removeClass("active");
});

// Delete the clicked row
$(".delete").on("click", function() {
  console.log("Delete was clicked!");
  //productDelete(this);
});

// create a firebase event for adding the data from the new trains and then populating them in the DOM.
database.ref().on("child_added", function(childSnapshot, prevChildKey) {
  
  // store snapshot changes in variables
  var trnName = childSnapshot.val().name;
  var trnDest = childSnapshot.val().destination;
  var firstTrnTime = childSnapshot.val().firstTime;
  var trnFreq = childSnapshot.val().frequency;

  // log the values
  console.log(trnName);
  console.log(trnDest);
  console.log(firstTrnTime);
  console.log(trnFreq);

  // process for calculating the Next Arrival and Minutes Away fields...
  // make sure the first train time is after the eventual current time
  var firstTrnTimeConv = moment(firstTrnTime, "hh:mm a").subtract(1, "years");
  // store variable for current time
  const currentTime = moment().format("HH:mm a");
  // store variable for difference of current time and first train time
  const trnTimeCurrentTimeDiff = moment().diff(moment(firstTrnTimeConv), "minutes");
  // store the time left
  const timeLeft = trnTimeCurrentTimeDiff % trnFreq;
  // calculate and store the minutes until next train arrives
  const minutesAway = trnFreq - timeLeft;
  // calculate the next arriving train
  const nextArrival = moment().add(minutesAway, "minutes").format("hh:mm a");
  // Add a delete button to each entry
  const deleteButton = `<button type="button" class="close delete" id="trainId" data-dismiss="modal">X</button>`
  // create the HTML to add the scheduled train
  const schedule = (
  "<tr><td>" + trnName
  + "</td><td>" + trnDest 
  + "</td><td>" + trnFreq 
  + "</td><td>" + nextArrival 
  + "</td><td>" + minutesAway 
  + "</td><td>" + deleteButton
  + "</td></tr>");
  // add the data into the DOM/html
  $("#train-table > tbody").append(schedule);
  // and append the id to the delete button
  $("#trainId").attr("value", childSnapshot.key);
  $("#trainId").attr("id", childSnapshot.key);
});