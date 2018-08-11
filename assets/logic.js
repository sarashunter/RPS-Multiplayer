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

var turnCounterRef = database.ref("/turnCounter");

var currentRoundRef = database.ref("/currentRound");

turnCounterRef.set(0);
//This will store the key to the user so other information about the user can be accessed later.
var currentUserKey;

//This is the current username.  This is for ease of use and gets valued when a username is chosen.
var currentUserName;

var playerCount;

var playerNumber;

var player2Guess;

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = usersOnlineRef.push(true);

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

// When first loaded or when the connections list changes...
usersOnlineRef.on("value", function (snap) {

    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    playerCount = snap.numChildren();
    console.log("playerCount " + playerCount);
});

//function that checks for new messages and runs when the page is loaded
mainChatRef.limitToLast(8).on("child_added", function (snapshot) {

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

    //Remove username input box after username is chosen
    $("#enterUser").empty();

    //Probably want to add our chat box at this point rather than from the start.

    if (playerCount === 1) {
        console.log("you are player 1");
        playerNumber = 1;
        displayGame();
    } else if (playerCount === 2) {
        console.log("you are player 2");
        playerNumber = 2;
        displayGame();
    } else {
        console.log("you can't play");
        playerNumber = 3;

    }
    turnCounterRef.set(1);


})

function displayGame(){
    $("#player1").text("Player 1 stats");
    $("#player2").text("Player 2 Stats");
}

turnCounterRef.on("value", function(snapshot) {
    console.log("snapshot val " + snapshot.val());
    if (snapshot.val() === playerNumber){
        console.log("It's your turn player " + playerNumber);
        playerPlay();
        
    }else{
        console.log("Not your turn");
    }
})

function playerPlay(){
    var optionsHTML = "<button id='rockBtn' class='option' data-name='rock'>Rock</button><button id='paperBtn' class='option' data-name='paper'>Paper</button><button id='scissorsBtn' class='option' data-name='scissors'>Scissors</button>";

    $("#options").html(optionsHTML);
    
}

$("#options").on("click", ".option", function(){
    var choice = $(this).attr("data-name");
    console.log(choice);

    player2Guess=choice;
    if(playerNumber === 1){
    currentRoundRef.set(choice);
    turnCounterRef.set(2);
    }
} )

currentRoundRef.on("value", function(snapshot){
    var player1Guess = snapshot.val();
    if (playerNumber === 2){
        playerPlay();

       if(player1Guess === "rock" && player2Guess === "scissors"){
           console.log("player 1 wins round");
       }else{
           console.log("player 2 wins");
       }
    }
})