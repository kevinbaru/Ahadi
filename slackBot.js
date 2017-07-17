var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
// var SLACK_API_TOKEN="I8bPfR2zFGg6U6pjxXKkJo3I";
// use env.sh
var token = process.env.SLACK_API_TOKEN || '';

var rtm = new RtmClient(token, { logLevel: 'debug' });
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});
