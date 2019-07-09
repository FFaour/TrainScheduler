// Initialize Firebase
const firebaseConfig = {
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
const database = firebase.database();

//Function declarations
const clearInputs = () => {
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-input").val("");
  $("#frequency-input").val("");
}

// Create an on click function that adds trains to the top table
$("#add-train-btn").on("click", function(event) {
  event.preventDefault();

  // create variables with the user input from form
  const trnName = $("#train-name-input").val().trim();
  const trnDest = $("#destination-input").val().trim();
  const firstTrnTime = $("#first-train-input").val().trim();
  const trnFreq = $("#frequency-input").val().trim();

  // create a temporary object for holding the new train data
  const newTrn = {
    name: trnName,
    destination: trnDest,
    firstTime: firstTrnTime,
    frequency: trnFreq
  };
  
  // upload the new train data to the database if complete else warning modal
  if (newTrn.name === "" || newTrn.destination === "" || newTrn.firstTime === "" || newTrn.frequency === "") {
    $(".modal").modal('show');
  } else {
    const newSchedule = database.ref().push(newTrn);
    console.log(newSchedule.key);
    // clear the form values after values have been stored
    clearInputs();
    // console log the object and values that were just pushed to the database
    console.log(newTrn);
  };
});

// Delete the clicked row
$(".delete").on("click", function() {
  console.log("Delete was clicked!");
  let key = $(".delete").val();
  console.log("Deleting the following key: " + key);
  ref.child(key).remove();
  $(this).parents("tr").remove();
});

// create a firebase event for adding the data from the new trains and then populating them in the DOM.
database.ref().on("child_added", function(childSnapshot, prevChildKey) {
  
  // store snapshot changes in variables
  const trnName = childSnapshot.val().name;
  const trnDest = childSnapshot.val().destination;
  const firstTrnTime = childSnapshot.val().firstTime;
  const trnFreq = childSnapshot.val().frequency;

  // log the values
  console.log(trnName);
  console.log(trnDest);
  console.log(firstTrnTime);
  console.log(trnFreq);

  // process for calculating the Next Arrival and Minutes Away fields...
  // make sure the first train time is after the eventual current time
  const firstTrnTimeConv = moment(firstTrnTime, "hh:mm a").subtract(1, "years");
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
  const deleteButton = `<button type="button" class="delete" id="trainId" data-dismiss="modal">X</button>`
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
});