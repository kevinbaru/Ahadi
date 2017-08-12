# Ahadi
Ahadi is an AI bot for scheduling team meetings and reminders on Google calendar using Slack's interface. The user uses natural language to request schedule reminder or a meeting. The request goes to the server built on Express and then set to API.AI . This is where it is processed as an intent and is interpreted into an action that is sent back to our server as a JSON object. The message is parsed and sent to back to the user using Slack's RTM.

The bot will ask the requester for more inputs if the user hasn't provide the required inputs. For reminders. The requester has to input a date while for the meetings the user has to input the date, time, and duration. 

Initially,  the server will request for access to the requesters google calendar and will store the access tokens in the mongoDB database. On successfully confirmation of the meeting, Ahadi will schedule the meeting in the requester's google calendar. Ahadi will also request acces to the invitees calendar using google Auth and will let the requester know that a request has been sent. The application also uses the google calendar API-freebusy to check if there is any conflict with the scheduling and will inform the requester of the specific conflicts. Refreshing of the access tokens is handled by the server without any input from the user

A cron job reminder is also implemented it heroku. Tt reminded the user of all the days engagements at 1am.

##### Technology
Slack API, Real Time Messaging, Interactive messages
API.AI
Google calendarAuth
Express Server
##### Installation
Install the bot in the group slack and run npm install & npm run

https://cl.ly/0b0o3o1j0k3v

https://cl.ly/2T2n1l1V1L24
