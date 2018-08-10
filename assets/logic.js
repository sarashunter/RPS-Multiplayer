// Initialize Firebase
var config = {
    apiKey: "AIzaSyCuzvUqY6J85bI9k7wk7ZJ-e-TFIWuT2Uo",
    authDomain: "rpschat-644c9.firebaseapp.com",
    databaseURL: "https://rpschat-644c9.firebaseio.com",
    projectId: "rpschat-644c9",
    storageBucket: "",
    messagingSenderId: "21498261849"
};
firebase.initializeApp(config);

var database = firebase.database();

var chatsRef = database.ref("/chats");
var mainChatRef = database.ref("/chats/mainChat")
console.log(mainChatRef);
var usersRef = database.ref("/users");
var usersOnlineRef = database.ref("/usersOnline/")
var connectedRef = database.ref(".info/connected");
var currentUserKey;
var currentUserName;

// When the client's connection state changes...
connectedRef.on("value", function (snapshot) {

    // If they are connected..
    if (snapshot.val()) {

        // Add user to the connections list.
       var connected = usersOnlineRef.push({name: "unknown",
       location: "usa"});
       currentUserKey = connected.key;
       console.log(currentUserKey);
        // Remove user from the connection list when they disconnect.
        connected.onDisconnect().remove();
    }
});


mainChatRef.on("child_added", function (snapshot) {
    var $messageDiv = $("<div>").text(snapshot.val().sender + ": " + snapshot.val().message);
    $("#chatlog").append($messageDiv);
    console.log(snapshot.val().message);
})

$("#postMessage").on("click", function (event) {
    event.preventDefault();
    addMessage($("#messageText").val());
    $("#messageText").text("");

})
//function to add new chat message
function addMessage(messageString) {
    mainChatRef.push({
        sender:  currentUserName,
        message: messageString,
        time: "now"
    })
}

//function to choose your username
$("#userChoice").on("click", function (event) {
    event.preventDefault();

    currentUserName=$("#chooseUser").val();
    database.ref("usersOnline/" + currentUserKey + "/name").set(currentUserName);

})
