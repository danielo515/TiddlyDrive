/*\
title: $:/plugins/danielo515/GASuploader/modules/utils/GAS_Http_Handler.js
type: application/javascript
module-type: utils

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var widget = require("$:/core/modules/widgets/widget.js");
var GAS_URL = "$:/plugins/danielo515/GASuploader/config/script_url";


var GAS_Http_Handler = function(wiki) {
	this.wiki = wiki;
	this.logger = new $tw.utils.Logger("GAS_Http_Handler");
};

GAS_Http_Handler.prototype.postTiddler = function(tiddlerName){
	var jsonTiddler = $tw.wiki.getTiddlerAsJson(tiddlerName),
	self = this;

	this.logger.log("Posting tiddler "+tiddlerName);
	
	$tw.utils.httpRequest({
		url: this.getURL("addTiddler"),
		type: "POST",
		data: jsonTiddler,
		callback: postTiddlerCallback
	});

	$tw.notifier.display("$:/plugins/danielo515/GASuploader/language/Notifications/Save/Tiddler");

function postTiddlerCallback(err,data){
	if(err) {
	 self.logger.log("Something went wrong while Posting ",err);
	}else{
		self.logger.log("SUCCESS!");
		self.logger.log(data);
		var response = JSON.parse(data).response;
		self.logger.log("Saving new tiddler id: ",response.id)
		if(response.id){
			var tiddler = JSON.parse(jsonTiddler);
			$tw.wiki.addTiddler(new $tw.Tiddler(tiddler,{"gas_id":response.id}));
		}
	}
};	

};

GAS_Http_Handler.prototype.getTiddler = function(tiddlerTitle){
	var tiddler = this.wiki.getTiddler(tiddlerTitle);


self.logger.log("The requested tiddler does not have a valid gas_id")
}


GAS_Http_Handler.prototype.getURL = function (action){
	if(action){
			return [this.wiki.getTiddlerText(GAS_URL),"?action=",action].join("");
	}

	return this.wiki.getTiddlerText(GAS_URL);
};

exports.GAS_Http_Handler = GAS_Http_Handler;

})();