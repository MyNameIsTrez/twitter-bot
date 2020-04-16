const Twit = require('twit')
const config = require('./config')

const T = new Twit(config);

let IDs = [
	'1237157616951758848', // @schlatt
	'4694011844', // @jschlatt
	// '2405684716', // @welfje
]

const stream = T.stream('statuses/filter', {
	follow: IDs
});

function getTweetText(text) {
	const textReplaced = text.replace("'", "\\'");
	let inside;
	if (textReplaced.length > 280 - 9) {
		inside = textReplaced.substr(0, 280 - 9 - 3);
		inside += '...';
	} else {
		inside = textReplaced.substr(0, 280 - 9);
	}
	return 'write(\'' + inside + '\')';
}

let ignoreCount = 0;

function parseTweet(tweet) {
	// console.log(tweet)

	if (
		tweet.in_reply_to_user_id !== null ||
		!IDs.includes(tweet.user.id_str) ||
		(tweet.retweeted_status !== null && tweet.retweeted_status !== undefined)
	) {
		console.log('Ignore count: ' + ++ignoreCount);
		return;
	} else {
		ignoreCount = 0;
	}

	const tweetText = getTweetText(tweet.text);

	console.log('Original tweet: ' + tweet.text)
	console.log('LuaSchlatt\'s response: ' + tweetText)

	const nameID = tweet.id_str;
	const name = tweet.user.screen_name;

	T.post('statuses/update', { in_reply_to_status_id: nameID, status: '@' + name + " " + tweetText }, function (err, data, response) {
		if (err) {
			console.log('Error!')
			console.log(err)
		} else if (response) {
			console.log('Success!')
			// console.log(response)
		}
	})
}

stream.on('tweet', tweet => {
	parseTweet(tweet)
	return false;
});

stream.on('disconnect', function (disconn) {
	console.log('Disconnect')
})

stream.on('connect', function (conn) {
	console.log('Connecting')
})

stream.on('reconnect', function (reconn, res, interval) {
	console.log('Reconnecting. statusCode:', res.statusCode)
})

console.log("Running")