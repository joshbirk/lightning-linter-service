console.log('LLC init');

var h0 = document.getElementsByTagName('head')[0];
var s0 = document.createElement('script');

var current_code = '';

window.addEventListener("message", function(event) {
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "LOCAL_VARS")) {
    if(event.data.title.indexOf('.js') > 0) {
    	console.log($('#tab-1175').hasClass('x-active-tab'));
    	if(event.data.source != current_code && $('#tab-1175').hasClass('x-tab-active')) {
    		current_code = event.data.source;
    		$.ajax({
			  url:'https://lightning-linter.herokuapp.com/lint-json',
			  type:"POST",
			  data:event.data.source,
			  contentType:"text/plain",
			  dataType:"text",
			  success: function(json) {
			  		messages = JSON.parse(json);
			  		console.log(messages);
			  		
			  		var previous_rows = $('#gridview-1168').find('.lint-row');
			  		previous_rows.remove();
			  		
					var previous_badge = $('#linter-badge');
			  		previous_badge.remove();
			  		
			  		if(messages.length > 0) {
			  			var badge = '<div id="linter-badge" class="problemCircle"><span> '+messages.length+'</span></div>';
			  			$('#tab-1175-btnInnerEl').append(badge);
			  			var problems = $('#gridview-1168').find('tbody');
				  		for(var i = 0; i < messages.length; i++) {
				  			problems.append('<tr class="lint-row"><td></td><td></td><td class="x-grid-cell"><div class="x-grid-cell-inner ">'+messages[i].message+'</div></td><td class="x-grid-cell"><div class="x-grid-cell-inner ">'+messages[i].line+'</div></td><td class="x-grid-cell"><div class="x-grid-cell-inner ">'+messages[i].source+'</div></td></tr>');
				  		}
				  	}
				}
		});
    	}
    }
    
  }
}, false);


s0.type = 'text/javascript';
var code = 'window.setInterval( function(){	if(Ext.getCmp("editors") != null) {		window.postMessage(			{ type: "LOCAL_VARS", title: Ext.getCmp("editors").getActiveTab().title, source: Ext.getCmp("editors").getActiveTab().cmEditor.getValue()}, "*");	}	},5000);';
s0.appendChild(document.createTextNode(code));
h0.appendChild(s0);

/*
window.setInterval( function(){
	if(Ext.getCmp("editors").getActiveTab()) {
		window.postMessage(
			{ type: "LOCAL_VARS", title: Ext.getCmp("editors").getActiveTab().title, source: Ext.getCmp("editors").getActiveTab().cmEditor.getValue()}  
			, "*");
	}
	},5000);
*/

