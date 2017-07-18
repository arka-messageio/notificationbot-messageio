var twilio = require("twilio");

var strings = require("./strings");

var twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = function(options) {
  var module = {};
  
  function registerTwilio() {
    options.app.post("/twilio/sms", function(request, response) {
      var twiml = new twilio.twiml.MessagingResponse();
      console.log("User texted over Twilio:       " + request.body.Body);
      var reply;
      if (request.body.Body.includes("/unsubscribe")) {
        for (var i = 0; i < options.users.length; i++) {
          if ("twilio" in options.users[i]) {
            if (options.users[i].ciscospark.From === request.body.From) {
              options.users.splice(i, 1);
            }
          }
        }
        options.unsubscribedUsers.push({
          twilio: {
            From: request.body.From
          }
        });
        reply = strings.unsubscribeMessage;
      } else if (request.body.Body.includes("/subscribe")) {
        for (var i = 0; i < options.unsubscribedUsers.length; i++) {
          if ("twilio" in options.unsubscribedUsers[i]) {
            if (options.unsubscribedUsers[i].twilio.From === request.body.From) {
              options.unsubscribedUsers.splice(i, 1);
            }
          }
        }
        var newUser = {
          name: request.body.From,
          twilio: {
            From: request.body.From
          }
        };
        options.users.push(newUser);
        reply = strings.resubscribeMessage;
      } else {
        var found = false;
        for (var i = 0; i < options.users.length; i++) {
          if ("twilio" in options.users[i]) {
            if (options.users[i].twilio.From === request.body.From) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          var newUser = {
            name: request.body.From,
            twilio: {
              From: request.body.From
            }
          };
          options.users.push(newUser);
          reply = strings.welcomeMessage;
        } else {
          reply = strings.oneWayMessage;
        }
      }
      console.log("Reply:                         " + reply);
      twiml.message(reply);
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      response.end(twiml.toString());
    });
  }
  registerTwilio();
  
  module.send = function(user, message) {
    console.log("Sent to user over Twilio:      " + message);
    twilioClient.messages.create({
      to: user.From,
      from: process.env.TWILIO_NUMBER,
      body: message
    })
  }
  
  return module;
}