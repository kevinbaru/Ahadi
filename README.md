# Ahadi
Ahadi is an AI bot for scheduling team meetings and reminder on Google calendar using Slack's interface. The user uses natural language to request ask for a reminder or meeting scheduling. The request is process by google's AI as an intent and is interpreted into an action that is sent back to slack. Slack the iterperets the message received from AI and communicates to the back using its Real Time Messenger.
The bot will ask the requester for more inputs if the user doesn't provide the required inputs. For reminders. The requester has to input a date while for the meetings the user has to input the date, time, and duration. 
Initially, if slack will request for access to the requesters google calendar and will store the access tokens in the mongoDB database. On successfully confirmation of the meeting, Ahadi will schedule the meeting in the requester's google calendar. Ahadi will also request acces to the invitees calendar using google Auth and will let the requester know that a request has been sent. The application also uses the google calendar API-freebusy to check if there is any conflict with the scheduling and will inform the requester of the specific conflicst.

A cron job reminder is also implemented it heroku. Tt reminded the user of all the days engagements at 1am.

##### Technology
Slack API
API.AI
Google calendarAuth
Express Server
##### Installation
Install the bot in the group slack and run npm install & npm run
