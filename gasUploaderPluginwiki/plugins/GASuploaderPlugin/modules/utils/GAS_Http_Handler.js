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
var STATE_UPLOADING = "$:/plugins/danielo515/GASuploader/temp/uploading",
    STATE_UPLOADED = "$:/plugins/danielo515/GASuploader/temp/uploaded"


var GAS_Http_Handler = function(wiki) {
	this.wiki = wiki;
	this.logger = new $tw.utils.Logger("GAS_Http_Handler");
};

GAS_Http_Handler.prototype.postTiddler = function(tiddlerName){
	var jsonTiddler = $tw.wiki.getTiddlerAsJson(tiddlerName),
	self = this;

	this.uploadingTiddler = tiddlerName;

	this.setUploadingState();
	
	$tw.utils.httpRequest({
		url: this.getURL("addTiddler"),
		type: "POST",
		data: jsonTiddler,
		callback: postTiddlerCallback
	});

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
			self.setUploadedState();
		}
	}

	self.removeUploadingState();
};	

};


GAS_Http_Handler.prototype.setUploadingState = function(){
	this.logger.log("Posting tiddler ",this.uploadingTiddler);
	this.wiki.addTiddler( new $tw.Tiddler({"title":STATE_UPLOADING,"text":this.uploadingTiddler}));
	$tw.notifier.display("$:/plugins/danielo515/GASuploader/language/Notifications/Save/Tiddler");
};

GAS_Http_Handler.prototype.setUploadedState = function(){
	this.wiki.addTiddler( new $tw.Tiddler({"title":STATE_UPLOADED,"text":this.uploadingTiddler}));
	$tw.notifier.display("$:/plugins/danielo515/GASuploader/language/Notifications/Saved/Tiddler");
};

GAS_Http_Handler.prototype.removeUploadingState = function(){
	this.wiki.addTiddler( new $tw.Tiddler({"title":STATE_UPLOADING,"text":""}));
	this.uploadingTiddler = "";
}


GAS_Http_Handler.prototype.getTiddler = function(query){
	var self = this;

	$tw.utils.httpRequest({
		url: this.getURL("getTiddler",query),
		type: "GET",
		callback: getTiddlerCallback
	});

	function getTiddlerCallback(err,data){
		if(err) {
		 self.logger.log("Something went wrong while gettingTiddler ",err);
		}else{
			self.logger.log("SUCCESS getting tiddler!");self.logger.log(data);
			var response = JSON.parse(data).response;
			if(response.tiddler){
				$tw.wiki.addTiddler(new $tw.Tiddler(response.tiddler));
			}
		}
	}
};


GAS_Http_Handler.prototype.getTiddlerbyID = function(tiddlerTitle){
	var tiddler = this.wiki.getTiddler(tiddlerTitle);
	if(tiddler){
		var fields=tiddler.fields;
		if(fields.gas_id){
			this.getTiddler({"id":fields.gas_id});
		}else{ 
			self.logger.log("The requested tiddler does not have a valid gas_id");
		}
	}
};


GAS_Http_Handler.prototype.getTiddlerbyTitle = function(tiddlerTitle){
	this.getTiddler({"title":tiddlerTitle});
};


GAS_Http_Handler.prototype.getURL = function (action,options){
	if(action){ //action on url required
		var url = [this.wiki.getTiddlerText(GAS_URL),"?action=",action];
		if(options){ //if there are options push those options into the url
			$tw.utils.each(options,function(value,name){
				url.push("&");url.push(name);url.push("=");url.push(value);
			});
		}
			return url.join("");
	}

	return this.wiki.getTiddlerText(GAS_URL);
};

exports.GAS_Http_Handler = GAS_Http_Handler;

})();