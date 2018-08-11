  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCuzvUqY6J85bI9k7wk7ZJ-e-TFIWuT2Uo",
    authDomain: "rpschat-644c9.firebaseapp.com",
    databaseURL: "https://rpschat-644c9.firebaseio.com",
    projectId: "rpschat-644c9",
    storageBucket: "rpschat-644c9.appspot.com",
    messagingSenderId: "21498261849"
  };
  firebase.initializeApp(config);

var database = firebase.database();

//This could potentially hold more than one chat in the future.
var chatsRef = database.ref("/chats");

//Only chat for now.
var mainChatRef = database.ref("/chats/mainChat");

//Holds the user information for current connections.  Users get deleted when they get disconnected.
var usersOnlineRef = database.ref("/usersOnline/");

//Built in Firebase feature that detects user connections.  Used to tell when users are on.
var connectedRef = database.ref(".info/connected");

//This will store the key to the user so other information about the user can be accessed later.
var currentUserKey;  

//This is the current username.  This is for ease of use and gets valued when a username is chosen.
var currentUserName;

// This checks when the number of connections changes.
connectedRef.on("value", function (snapshot) {

    // When they are connected
    if (snapshot.val()) {

        // User gets added to online users
        var connected = usersOnlineRef.push({
            name: "unknown", //starts as unknown
            location: "usa"  //placeholder for later features
        });

        // Store the "key" to the current user
        currentUserKey = connected.key;

        // Remove user and their data from the onlineUsers when disconnected

        connected.onDisconnect().remove();
    }
});

//function that checks for new messages and runs when the page is loaded
mainChatRef.on("child_added", function (snapshot) {

    //create a div to show the message
    var $messageDiv = $("<div>").text(snapshot.val().sender + ": " + snapshot.val().message);

    //Append the single message to the chat log
    $("#chatlog").append($messageDiv);

})

//Function called when post message button is cliced.
$("#postMessage").on("click", function (event) {

    event.preventDefault();

    //Calls function that creates the message
    addMessage($("#messageText").val());

    //Clears input field for next message.
    $("#messageText").val("");

})

//function to add new chat message
function addMessage(messageString) {

    mainChatRef.push({
        sender: currentUserName,
        message: messageString,
        time: "now"
    })

}

//function to choose your username
$("#userChoice").on("click", function (event) {
    event.preventDefault();

    //Store the value of the username chosen by user.  Probably want to validate this against other users.
    currentUserName = $("#chooseUser").val(); 

    //Set the name of the current user in user object to user's input.
    database.ref("usersOnline/" + currentUserKey + "/name").set(currentUserName);

    //Remove username input box after username is chosen
    $("#enterUser").empty();

    //Probably want to add our chat box at this point rather than from the start.

})