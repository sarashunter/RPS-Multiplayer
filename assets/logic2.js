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

//Holds the user information for current connections.  Users get deleted when they get disconnected.
var usersOnlineRef = database.ref("/usersOnline/");

//Built in Firebase feature that detects user connections.  Used to tell when users are on.
var connectedRef = database.ref(".info/connected");

var turnCounterRef = database.ref("/turnCounter");

var playersRef = database.ref("/players");

var player1Ref = database.ref("/players/player1");

var player2Ref = database.ref("/players/player2");
//This is the current username.  This is for ease of use and gets valued when a username is chosen.
var currentUserName;
var currentUserKey;

var playerCount;

var playerNumber;

var playerDecided = false;

var player1wins;
var player1losses;
var player1name;
var player1key;

var player2wins;
var player2losses;
var player2name;
var player2key;

var player1Exists = false;
var player2Exists = false;

player1Ref.set({
    losses: 0,
    wins: 0,
    name: "unknown"
})

player2Ref.set({
    losses: 0,
    wins: 0,
    name: "unknown"
})

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = usersOnlineRef.push(true);

        // Store the "key" to the current user
        currentUserKey = con.key;

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
    player1Exists = false;
    player2Exists = false;

    if (!playerDecided) {
        if (playerCount === 1) {
            playerNumber = 1;
            player1Exists = true;
            playerDecided = true;
            console.log("You are player 1");
        } else if (playerCount === 2) {
            playerNumber = 2;
            player2Exists = true;
            playerDecided = true;
            console.log("You are player 2");
        } else {
            console.log("Others are already playing");
        }
    } else {
        if (snap.val().key === player1key) {
            console.log("player1 still here");
            player1Exists = true;
        } else if (snap.val().key === player2key) {
            console.log("player1 still here");
            player2Exists = true;
        }
    }
});

$("#userChoice").on("click", function (event) {
    event.preventDefault();

    //Store the value of the username chosen by user. 
    currentUserName = $("#chooseUser").val();

    //Set the name of the current user in user object to user's input.

    if (playerNumber === 1) {
        player1Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey
        })
    } else if (playerNumber === 2) {
        player2Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey
        })

        turnCounterRef.set(1);
    } else {
        console.log("you can still chat");
    }

    //Remove username input box after username is chosen
    $("#enterUser").empty();

    //Probably want to add our chat box at this point rather than from the start.


})

player1Ref.on("value", function (snapshot) {
    player1losses = snapshot.val().losses;
    player1name = snapshot.val().name;
    player1wins = snapshot.val().wins;
    player1key = snapshot.val().key;
})

player2Ref.on("value", function (snapshot) {
    player2losses = snapshot.val().losses;
    player2name = snapshot.val().name;
    player2wins = snapshot.val().wins;
    player2key = snapshot.val().key;
})
///next turn, maybe you check if both users exist

turnCounterRef.on("value", function (snapshot) {
    if (snapshot.val() === 1) {
        playerTurn(1);
    } else {
        playerTurn(2);
    }
})

function playerTurn(turnNumber) {

    if (!player1Exists && !player2Exists) {
        console.log("A player left");
    } else {
        if (playerNumber === turnNumber) {

            var optionsHTML = "<button id='rockBtn' class='option' data-name='rock'>Rock</button><button id='paperBtn' class='option' data-name='paper'>Paper</button><button id='scissorsBtn' class='option' data-name='scissors'>Scissors</button>";

            $("#options").html(optionsHTML);
        }
    }
}
