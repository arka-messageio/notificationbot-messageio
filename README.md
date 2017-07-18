# 🔔🤖 NotificationBot
*(from [Message.io](https://message.io/home))*

Do you need to notify lots of people about updates fast? Do you need to reach them on completely separate chat platforms? Use NotificationBot and seamlessly keep users on different platform up-to-date.

## Usage
Head over to the [front-end webpage](https://notificationbot-messageio.glitch.me/), click on the "Connect over" buttons and follow the intstructions.

You can send notifications to users as the administrator from the [Notification console](https://notificationbot-messageio.glitch.me/notify) and view/remove users from the [Users console](https://notificationbot-messageio.glitch.me/notify).

## Set it up for yourself
1. Remix this project on Glitch by clicking here: 
  [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/notificationbot-messageio)
1. Make an app on [developer.ciscospark.com](https://developer.ciscospark.com/).
   1. Login to [developer.ciscospark.com/add-bot.html](https://developer.ciscospark.com/add-bot.html).
   1. Fill out the display name, user name, and icon of the bot.
1. Set up an account on [Twilio](https://www.twilio.com/).
   1. Add a number to your account's [Phone Numbers](https://www.twilio.com/console/phone-numbers/incoming). This will be the number your bot can be reached at (over SMS).
   1. Click on the number to configure it.
   1. Scroll down to the "Messaging" section.
      1. Set "Configure with" to "Webhooks, or TwiML Bins or Functions"
      1. Set "A message comes in" to "Webhook", set the URL to be `<URL OF YOUR REMIXED GLITCH PROJECT>/twilio/sms` and set the method to "HTTP POST"
   1. *(Note: If you have a trial Twilio account, only you and people you have added to your [Verified Caller IDs](https://www.twilio.com/console/phone-numbers/verified) will be able to talk to your bot).*
1. Set up your `.env` file.
   1. You should probably set `PUBLIC_DEMO` to `false`, unless you want your users lists to be cleared every 1 hour (which is what currently happens in this public demo).
   1. Set `PUBLIC_URL` to the URL of this remixed Glitch project.
   1. Copy the Access Token from your Cisco Spark bot into `CISCOSPARK_ACCESS_TOKEN`
   1. Generate a random string of characters for `CISCOSPARK_SECRET`. This field is only used to authenticate responses from Cisco Spark and can be set to anything you want, as long as it is secret.
   1. Set `TWILIO_ACCOUNT_SID` to your Twilio Account SID.
   1. Set `TWILIO_AUTH_TOKEN` to your Twilio Auth Token.
   1. Set `TWILIO_NUMBER` to the Twilio number for the bot you set up earlier.
1. You're all set! Go ahead and start messaging your newly created bot and watch the magic.
### Note about security
NotificationBot is a demo bot, so no security is added by default. You will likely want to add some form of authentication to your remix so that only an authorized administrator can access the Questions console located at `<URL OF YOUR REMIXED GLITCH PROJECT>/notify` and `<URL OF YOUR REMIXED GLITCH PROJECT>/users`.

## The code
Feel free to look through the code and the comments and adapt it to your own needs or build your own bot with it. The inline comments in the files can help you understand how the chatbot works and how to adapt it.
* `twilio-chatbot.js`
  
  Set up all Twilio webhooks to register/unregister users from the `users` and `unsubscribedUsers` arrays.
* `ciscospark-chatbot.js`
  
  Set up all Cisco Spark webhooks to register/unregister users from the `users` and `unsubscribedUsers` arrays.
* `server.js`
  
  This is the entry point of the application.
  It requires all other modules and ties together everything.
* `strings.json`

  Strings sent by the bot to the user. Kept in a separate JSON file to ease editing and translation in the future.
* `public`
  
  CSS for styling the Bootstrap web view for the bug tracker.
* `views`
  
  Templated HTML pages for the homepage and web views of BugBot. Intended for use with the [EJS template engine](http://www.embeddedjs.com/).

## Tech stack
The following is a list of great tools we used to rapidly develop this chatbot in under a week:
 * [Bootstrap](http://getbootstrap.com/)
 * [Glitch](https://glitch.com/)
