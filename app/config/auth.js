'use strict';

module.exports = {
	'twitterAuth': {
		// 'clientID': process.env.FACEBOOK_KEY,
		// 'clientSecret': process.env.FACEBOOK_SECRET,
		// 'callbackURL': process.env.APP_URL + 'auth/facebook/callback',
		// 'requestTokenURL':	,
		// 'accessTokenURL':	,
		// 'userAuthorizationURL':		,
		// 'sessionKey':	 ,
		consumerKey:	process.env.API_KEY,
		consumerSecret:	process.env.TWITTER_SECRET,
		callbackURL:	process.env.APP_URL + 'auth/twitter/callback'
	}
};
