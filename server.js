var express = require("express");
var bodyParser = require("body-parser");

var strings = require("./strings");
var twilioChatbot = require("./twilio-chatbot");
var ciscosparkChatbot = require("./ciscospark-chatbot");

var users = [];
var unsubscribedUsers = [];

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up all Twilio webhooks to register/unregister users from the users and unsubscribedUsers arrays above.
var twilioChatbot = twilioChatbot({
  app: app,
  users: users,
  unsubscribedUsers: unsubscribedUsers
});

// Set up all Cisco Spark webhooks to register/unregister users from the users and unsubscribedUsers arrays above.
var ciscosparkChatbot = ciscosparkChatbot({
  app: app,
  users: users,
  unsubscribedUsers: unsubscribedUsers
});

function sendUserNotification(user, message) {
  if ("ciscospark" in user) {
    ciscosparkChatbot.send(user.ciscospark, message);
  } else if ("twilio" in user) {
    twilioChatbot.send(user.twilio, message);
  }
}

function sendNotification(message) {
  users.forEach(function(user) {
    sendUserNotification(user, message);
  });
}

// Admin sends a message.
app.post("/api/send", function(request, response) {
  sendNotification(request.body.text);
  response.status(200).end();
});

// Admin has deleted user.
app.delete("/api/users/:name", function(request, response) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].name === request.params.name) {
      sendUserNotification(users[i], strings.adminUnsubscribeMessage);
      users.splice(i, 1);
    }
  }
  response.status(200).end();
});

// Set up front-end web pages.
app.set("views", "./views");
app.use(express.static("public"));

app.get("/notify", function(request, response) {
  response.render("notify/index.ejs");
});

app.get("/users", function (request, response) {
  response.render("users/index.ejs", {
    users: users
  });
});

// Finally, add a route to the home page (which is not related to the actual in-built bug-tracker)
app.get("/", function (request, response) {
  response.render("index.ejs");
});

if (process.env.PUBLIC_DEMO === "true") {
  // Clear users every hour.
  setInterval(function() {
    users.splice(0, users.length);
    unsubscribedUsers.splice(0, unsubscribedUsers.length);
  }, 1000 * 60 * 60);
}

app.listen(process.env.PORT);
