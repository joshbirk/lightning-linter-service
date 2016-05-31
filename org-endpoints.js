var jsforce = require('jsforce');


module.exports = {

	addOAuthRoutes : function(app) {


		// Salesforce OAuth2 client information
		var oauth2 = new jsforce.OAuth2({
		    clientId: '3MVG9sG9Z3Q1RlbdgwDkzM3OQ0gE0qynhV.wlup_p_F79BLSFE0mCznTvE.JFmi7kyRdK5bqSNkG5dINe.SWa',
		    clientSecret: '4351326343549344903',
		    redirectUri: 'http://localhost:8675/oauth/_callback'
		});

		/* SF OAuth request, redirect to SF login */
		app.get('/oauth/auth', function(req, res) {
		    res.redirect(oauth2.getAuthorizationUrl({scope: 'api id web'}));
		});

		/* OAuth callback from SF, pass received auth code and get access token */
		app.get('/oauth/_callback', function(req, res) {
		    var conn = new jsforce.Connection({oauth2: oauth2});
		    var code = req.query.code;
		    conn.authorize(code, function(err, userInfo) {
		        if (err) { return console.error(err); }

		        console.log('Access Token: ' + conn.accessToken);
		        console.log('Instance URL: ' + conn.instanceUrl);
		        console.log('User ID: ' + userInfo.id);
		        console.log('Org ID: ' + userInfo.organizationId);

		        req.session.accessToken = conn.accessToken;
		        req.session.instanceUrl = conn.instanceUrl;
		        res.redirect('/lint_org');
		    });
		});


	},

	getLightningComponentJS : function(req,res,handler) { //add errorHandler

			if(req.session == null || req.session.accessToken == null) {
				console.error('No Salesforce Session');
				res.render('pg_error',{
					error_title: 'No Salesforce Session',
					error_message: 'Please <a href="/oauth/auth">log into Salesforce</a> to use this feature.',
					login : true
				})
			} else {

				var conn = new jsforce.Connection({
			        accessToken: req.session.accessToken,
			        instanceUrl: req.session.instanceUrl
			    });

				var query0 = "SELECT Id, DefType, Source, AuraDefinitionBundle.DeveloperName from AuraDefinition WHERE FORMAT = 'JS' ORDER BY AuraDefinitionBundle.DeveloperName";
				conn.query(query0, function(err, result) {
						  if (err) { return console.error(err); handler(null); }
						  else {
						  	console.log('Found '+result.records.length+' components');
						  	handler(res,result.records);
						  }
						});
			}

		}
}

