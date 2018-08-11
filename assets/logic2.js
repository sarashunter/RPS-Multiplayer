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
var player1choice;

var player2wins;
var player2losses;
var player2name;
var player2key;
var player2choice;

var player1Exists = false;
var player2Exists = false;

player1Ref.set({
    losses: 0,
    wins: 0,
    name: "unknown",
    key: "nothing",
    choice: "nothing"

})

player2Ref.set({
    losses: 0,
    wins: 0,
    name: "unknown",
    key: "nothing",
    choice: "nothing"
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
        // if (snap.val().key === player1key) {
        //     console.log("player1 still here");
        //     player1Exists = true;
        // } else if (snap.val().key === player2key) {
        //     console.log("player1 still here");
        //     player2Exists = true;
        // }
        
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
            key: currentUserKey,
            choice: "nothing"
        })
    } else if (playerNumber === 2) {
        player2Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey,
            choice: "nothing"
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
    $("#1losses").text(player1losses);
    player1name = snapshot.val().name;
    player1wins = snapshot.val().wins;
    $("#1wins").text(player1wins);
    player1key = snapshot.val().key;
    player1choice = snapshot.val().choice;
})

player2Ref.on("value", function (snapshot) {
    player2losses = snapshot.val().losses;
    $("#2losses").text(player2losses);
    player2name = snapshot.val().name;
    player2wins = snapshot.val().wins;
    $("#2wins").text(player2wins);
    player2key = snapshot.val().key;
    player2choice = snapshot.val().choice;
})
///next turn, maybe you check if both users exist

turnCounterRef.on("value", function (snapshot) {
    if (snapshot.val() === 1) {
        playerTurn(1);
    } else if (snapshot.val() === 2) {
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

$("#options").on("click", ".option", function () {
    var choice = $(this).attr("data-name");
    console.log(choice);

    if (playerNumber === 1) {
        database.ref("/players/player1/choice").set(choice);
        player1choice = choice;
        $("#options").empty();
        turnCounterRef.set(2);
    } else if (playerNumber === 2) {
        player2choice = choice;
        compare(player1choice, player2choice);
        $("#options").empty();
        turnCounterRef.set(1);
    }
})

function compare(p1, p2) {
    if (p1 === p2) {
        console.log("It's a tie");
    } else if (p1 === "rock") {
        if (p2 === "paper") {
            playerWins(2);
        } else {
            console.log("p1 wins");
            playerWins(1);
        }
    } else if (p1 === "paper") {
        if (p2 === "rock") {
            console.log("p1 wins");
            playerWins(1);
        } else {
            console.log("p2 wins");
            playerWins(2);
        }
    } else {
        if (p2 === "rock") {
            console.log("p2 wins");
            playerWins(2);
        } else {
            console.log("p1 wins");
            playerWins(1);
        }
    }
}

function playerWins(winner){
    if (winner === 1){
        player1wins++;
        database.ref("/players/player1/wins").set(player1wins);

        player2losses++;
        database.ref("/players/player2/losses").set(player2losses);
    }else{
        player2wins++;
        database.ref("/players/player2/wins").set(player2wins);

        player1losses++;
        database.ref("/players/player1/losses").set(player1losses);
    }

}
