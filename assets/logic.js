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
        var gameRef = database.ref("/game");

        mainChatRef.push({
            sender:"user",
            message: "message",
            time: "timestamp"
        })

        mainChatRef.on("child_added", function(snapshot) {
            var $messageDiv = $("<div>").text(snapshot.val().message);
            $("#chatlog").append($messageDiv);
            console.log(snapshot.val().message);})

        $("#postMessage").on("click",  function(event){
            event.preventDefault();
            addMessage($("#messageText").val(), "george");
            $("#messageText").text("");

        })

        function addMessage(messageString, currentUser){
            mainChatRef.push({
                sender: currentUser,
                message: messageString,
                time: "now"
            })
        }
