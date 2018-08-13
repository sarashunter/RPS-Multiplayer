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


//Holds the user information for current connections.  Users get deleted when they get disconnected.
var usersOnlineRef = database.ref("/usersOnline/");

//Built in Firebase feature that detects user connections.  Used to tell when users are on.
var connectedRef = database.ref(".info/connected");

//Keeps track of whose turn it is.
var turnCounterRef = database.ref("/turnCounter");

//Holds players' information.  Detects when a player leaves.
var playersRef = database.ref("/players");

//This is the current username.  This is for ease of use and gets valued when a username is chosen.
var currentUserName;
var currentUserKey;

var playerCount;

//Keeps track of what player (1 or 2) the current user is.  3 means not playing.
var playerNumber = 3;

//Boolean that determines if the user has been chosen to be a player yet.
var playerDecided = false;

//Variables to hold player 1's current information.
var player1Ref = database.ref("/players/player1");
var player1wins;
var player1losses;
var player1name;
var player1key;
var player1choice;

//Variables to hold player 2's current information.
var player2Ref = database.ref("/players/player2");
var player2wins;
var player2losses;
var player2name;
var player2key;
var player2choice;

var playerInstance;

//Function detects when player has been removed.  Displays warning.
playersRef.on("child_removed", function (snapshot) {
    console.log("All hope is lost");
    $("#options").text("A player left.  Refresh to restart.");
})

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the users Online
        var con = usersOnlineRef.push(true);

        // Store the "key" to the current user
        currentUserKey = con.key;

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
});

// When first loaded or when the connections list changes...
usersOnlineRef.on("value", function (snap) {

    // The number of online users is the number of children in the users online list.
    playerCount = snap.numChildren();

    if (!playerDecided) {

        //Set user to player 1 if only player.
        if (playerCount === 1) {
            playerNumber = 1;
            playerDecided = true;
            console.log("You are player 1");

            player1Ref.set({
                losses: 0,
                wins: 0,
                name: "Player 1",
                key: "nothing",
                choice: "nothing"

            })

            player2Ref.set({
                losses: 0,
                wins: 0,
                name: "Player 2",
                key: "nothing",
                choice: "nothing"
            })

            //If player 1 leaves, remove the players data.
            firebase.database().ref().child("players")
                .onDisconnect()
                .remove();

            firebase.database().ref().child("turnCounter")
                .onDisconnect()
                .set(0);

            //else if there are 2, set them to player 2.
        } else if (playerCount === 2) {
            playerNumber = 2;
            playerDecided = true;
            console.log("You are player 2");
            firebase.database().ref().child("players")
                .onDisconnect()
                .remove();

            firebase.database().ref().child("turnCounter")
                .onDisconnect()
                .set(0);
        }
        //else leave them as player 3.
    }
});

//Choose a user name.  Put that into the players.
$("#userChoice").on("click", function (event) {
    event.preventDefault();

    //Store the value of the username chosen by user. 
    currentUserName = $("#chooseUser").val();

    //Set the name of the current user in user object to user's input.
    if (playerNumber === 1) {
        playerInstance = player1Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey,
            choice: "nothing"
        })
    } else if (playerNumber === 2) {
        playerInstance = player2Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey,
            choice: "nothing"
        })

        //Change turn counter to start game once player 2 is set.
        turnCounterRef.set(1);

    } else {
        $("#options").text("Others are playing.  You can watch and chat.");
    }

    //Remove username input box after username is chosen
    $("#enterUser").empty();

})

//Keep player1 information up to date.
player1Ref.on("value", function (snapshot) {
    if (snapshot.exists()) {
        player1losses = snapshot.val().losses;
        $("#1losses").text(player1losses);
        player1name = snapshot.val().name;
        $("#player1name").text(player1name);
        player1wins = snapshot.val().wins;
        $("#1wins").text(player1wins);
        player1key = snapshot.val().key;
        player1choice = snapshot.val().choice;
    }
})

//Keep player2 information up to date.
player2Ref.on("value", function (snapshot) {
    if (snapshot.exists()) {
        player2losses = snapshot.val().losses;
        $("#2losses").text(player2losses);
        player2name = snapshot.val().name;
        $("#player2name").text(player2name);
        player2wins = snapshot.val().wins;
        $("#2wins").text(player2wins);
        player2key = snapshot.val().key;
        player2choice = snapshot.val().choice;
    }
})

//Determine whose turn it is.
turnCounterRef.on("value", function (snapshot) {
    if (snapshot.val() === 0) {
        console.log("can't play yet");
    }
    else if (snapshot.val() === 1) {
        playerTurn(1);
    } else if (snapshot.val() === 2) {
        playerTurn(2);
    }

})

//Called each turn.  Displays the options.
function playerTurn(turnNumber) {

    {
        if (playerNumber === turnNumber) {

            var optionsHTML = "<button id='rockBtn' class='option' data-name='rock'>Rock</button><button id='paperBtn' class='option' data-name='paper'>Paper</button><button id='scissorsBtn' class='option' data-name='scissors'>Scissors</button>";

            $("#options").html(optionsHTML);
        }
    }
}

//Options class on click function.  Locks in players choice and switches turn.
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

//Compare the users guesses to determine a winner.
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

function playerWins(winner) {
    if (winner === 1) {
        player1wins++;
        database.ref("/players/player1/wins").set(player1wins);

        player2losses++;
        database.ref("/players/player2/losses").set(player2losses);
    } else {
        player2wins++;
        database.ref("/players/player2/wins").set(player2wins);

        player1losses++;
        database.ref("/players/player1/losses").set(player1losses);
    }

}



////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
/////////Chat Javascript////////////


var chatsRef = database.ref("/chats");

//Only chat for now.
var mainChatRef = database.ref("/chats/mainChat");

//function that checks for new messages and runs when the page is loaded.  Only shows 8.
mainChatRef.limitToLast(8).on("child_added", function (snapshot) {

    //create a div to show the message
    var $messageDiv = $("<div>").text(snapshot.val().sender + ": " + snapshot.val().message);

    //Append the single message to the chat log
    $("#chatlog").append($messageDiv);

})

//Function called when post message button is clicked.
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

