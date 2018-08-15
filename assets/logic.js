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

var player1Exists = false;

//Variables to hold player 2's current information.
var player2Ref = database.ref("/players/player2");
var player2wins;
var player2losses;
var player2name;
var player2key;
var player2choice;

var player2Exists = false;

var ties = 0;

var playerInstance;

var tieCounterRef = database.ref("/tieCounter");

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

});

tieCounterRef.on("value", function (snap) {
    ties = snap.val();
    $(".ties").text(ties);
})

//Choose a user name.  Put that into the players.
$("#userChoice").on("click", function (event) {
    event.preventDefault();

    //Store the value of the username chosen by user. 
    currentUserName = $("#chooseUser").val();

    //Set the name of the current user in user object to user's input.
    if (!player1Exists) {
        playerInstance = player1Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey,
            choice: "nothing"
        })
        playerNumber = 1;
        player1Exists = true;
        $("#options").html("<h3>Waiting for opponent</h3>");

        //If player 1 leaves, remove the players data.
        firebase.database().ref().child("players/player1")
            .onDisconnect()
            .remove();

        firebase.database().ref().child("turnCounter")
            .onDisconnect()
            .set(0);

        firebase.database().ref().child("tieCounter")
            .onDisconnect()
            .set(0);
    } else if (!player2Exists) {
        playerInstance = player2Ref.set({
            losses: 0,
            wins: 0,
            name: currentUserName,
            key: currentUserKey,
            choice: "nothing"
        })
        playerNumber = 2;
        player2Exists = true;
        //Change turn counter to start game once player 2 is set.
        turnCounterRef.set(1);
        tieCounterRef.set(0);

        console.log("You are player 2");
        firebase.database().ref().child("players/player2")
            .onDisconnect()
            .remove();

        firebase.database().ref().child("turnCounter")
            .onDisconnect()
            .set(0);

        firebase.database().ref().child("tieCounter")
            .onDisconnect()
            .set(0);

    } else {
        $("#options").text("Others are playing.  You can watch and chat.");
    }

    $("#submitChat").html('                            <input class="form-control" type="text" id="messageText" placeholder="Say something!"><br><button class="btn btn-primary" id="postMessage">Post</button>');
    //Remove username input box after username is chosen
    $("#enterUser").empty();

})

//Keep player1 information up to date.
player1Ref.on("value", function (snapshot) {
    if (snapshot.exists()) {
        player1Exists = true;
        player1losses = snapshot.val().losses;
        $("#1losses").text(player1losses);
        player1name = snapshot.val().name;
        $("#player1name").text(player1name);
        player1wins = snapshot.val().wins;
        $("#1wins").text(player1wins);
        player1key = snapshot.val().key;
        player1choice = snapshot.val().choice;
    } else {
        player1Exists = false;
    }
})

//Keep player2 information up to date.
player2Ref.on("value", function (snapshot) {
    if (snapshot.exists()) {
        player2Exists = true;
        player2losses = snapshot.val().losses;
        $("#2losses").text(player2losses);
        player2name = snapshot.val().name;
        $("#player2name").text(player2name);
        player2wins = snapshot.val().wins;
        $("#2wins").text(player2wins);
        player2key = snapshot.val().key;
        player2choice = snapshot.val().choice;
    } else {
        player2Exists = false;
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

            var optionsHTML = "<img src='assets/images/rock.jpg' id='rockBtn' class='option' data-name='rock'><img src='assets/images/paper.jpg' id='paperBtn' class='option' data-name='paper'><img src='assets/images/scissors.jpg' id='scissorsBtn' class='option' data-name='scissors'>";

            $("#options").html(optionsHTML);
        } else if (playerNumber !== 3) {
            $("#options").html("<h3>Wait while your opponent chooses their battle weapon.</h3>");
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
        ties++;
        tieCounterRef.set(ties);
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

        var winner = $("<div>").text("Player 1 won.");

        $("#player1").append.winner;
        console.log("in here");

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
$("#submitChat").on("click", "#postMessage", function (event) {

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

