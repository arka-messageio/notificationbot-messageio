var ciscospark = require("ciscospark");

var strings = require("./strings");

module.exports = function(options) {
  var module = {};
  
  // Register Cisco Spark.
  function registerCiscoSpark() {
    ciscospark = ciscospark.init({
      credentials: {
        authorization: {
          access_token: process.env.CISCOSPARK_ACCESS_TOKEN
        }
      }
    });
    // ciscospark.webhooks.list().then(function(list) {
    //   for (var i = 0; i < list.items.length; i++) {
    //     ciscospark.webhooks.remove(list.items[i])
    //   }
    // });
    function registerCiscosparkWebhook(hookOptions) {
      ciscospark.webhooks.list().then(function(list) {
        var hookId = null;

        for (var i = 0; i < list.items.length; i++) {
          if (list.items[i].name === hookOptions.name) {
            hookId = list.items[i].id;
            break;
          }
        }

        if (hookId) {
          hookOptions.id = hookId;
          ciscospark.webhooks.update(hookOptions);
        } else {
          ciscospark.webhooks.create(hookOptions);
        }
      });  
    }
    registerCiscosparkWebhook({
      resource: "rooms",
      event: "created",
      name: "rooms-created",
      targetUrl: process.env.PUBLIC_URL + "/ciscospark/rooms-created"
    });
    registerCiscosparkWebhook({
      resource: "messages",
      event: "created",
      name: "messages-created",
      targetUrl: process.env.PUBLIC_URL + "/ciscospark/messages-created"
    });

    ciscospark.people.get("me").then(function(person) {
      return person.id;
    }).then(function(me) {
      options.app.post("/ciscospark/rooms-created", function(request, response) {
        response.status(200).end();
        console.log("rooms-created");
        ciscospark.people.get(request.body.actorId).then(function(person) {
          var newUser = {
            name: person.displayName,
            ciscospark: {
              roomId: request.body.data.id
            }
          };
          options.users.push(newUser);
          return newUser;
        }).then(function(newUser) {
          ciscospark.messages.create({
            text: strings.welcomeMessage,
            roomId: newUser.ciscospark.roomId
          });
        });
      });
      options.app.post("/ciscospark/messages-created", function(request, response) {
        response.status(200).end();
        ciscospark.messages.get(request.body.data.id).then(function (message) {
          if (message.personId === me) {
            return;
          }
          console.log("User said over Cisco Spark:    " + message.text);
          if (message.text.includes("/unsubscribe")) {
            for (var i = 0; i < options.users.length; i++) {
              if ("ciscospark" in options.users[i]) {
                if (options.users[i].ciscospark.roomId === message.roomId) {
                  options.users.splice(i, 1);
                }
              }
            }
            options.unsubscribedUsers.push({
              ciscospark: {
                roomId: message.roomId
              }
            });
            console.log("Reply:                         " + strings.unsubscribeMessage);
            ciscospark.messages.create({
              text: strings.unsubscribeMessage,
              roomId: message.roomId
            });
          } else if (message.text.includes("/subscribe")) {
            for (var i = 0; i < options.unsubscribedUsers.length; i++) {
              if ("ciscospark" in options.unsubscribedUsers[i]) {
                if (options.unsubscribedUsers[i].ciscospark.roomId === message.roomId) {
                  options.unsubscribedUsers.splice(i, 1);
                }
              }
            }
            ciscospark.people.get(message.personId).then(function(person) {
              var newUser = {
                name: person.displayName,
                ciscospark: {
                  roomId: message.roomId
                }
              };
              options.users.push(newUser);
              return newUser;
            }).then(function(newUser) {
              console.log("Reply:                         " + strings.resubscribeMessage);
              ciscospark.messages.create({
                text: strings.resubscribeMessage,
                roomId: newUser.ciscospark.roomId
              });
            });
          } else if (message.text.includes("/reset")) {
            for (var i = 0; i < 50; i++) {
              ciscospark.messages.create({
                text: "\n",
                roomId: message.roomId
              });
            }
          } else {
            var found = false;
            for (var i = 0; i < options.users.length; i++) {
              if ("ciscospark" in options.users[i]) {
                if (options.users[i].ciscospark.roomId === message.roomId) {
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              ciscospark.people.get(message.personId).then(function(person) {
                var newUser = {
                  name: person.displayName,
                  ciscospark: {
                    roomId: message.roomId
                  }
                };
                options.users.push(newUser);
                return newUser;
              }).then(function(newUser) {
                console.log("Reply:                         " + strings.welcomeMessage);
                ciscospark.messages.create({
                  text: strings.welcomeMessage,
                  roomId: newUser.ciscospark.roomId
                });
              });
            } else {
              console.log("Reply:                         " + strings.oneWayMessage);
              ciscospark.messages.create({
                text: strings.oneWayMessage,
                roomId: message.roomId
              });
            }
          }
        });
      });
    });
  }
  registerCiscoSpark();
  
  module.send = function(user, message) {
    console.log("Sent to user over Cisco Spark: " + message);
    ciscospark.messages.create({
      text: message,
      roomId: user.roomId
    })
  }
  
  return module;
}