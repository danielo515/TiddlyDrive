/*\
title: $:/plugins/danielo515/GASuploader/lib/utils.js
type: application/javascript
module-type: library

Helper function useful for plugin global scope

\*/

function utils(){
var GAS_URL = "$:/plugins/danielo515/GASuploader/config/script_url";
var configs = {
	server_list: "$:/temp/GAS/list_from_server",
	tiddlers_to_import: "$:/Import"
};
/* @action the instruction to send to the server
   @options hasmap of options in the form of { name:value }*/
var getURL = function (action,options){
	if(action){ //action on url required
		var url = [$tw.wiki.getTiddlerText(GAS_URL),"?action=",action];
		if(options){ //if there are options push those options into the url
			$tw.utils.each(options,function(value,name){
				url.push("&");url.push(name);url.push("=");url.push(value);
			});
		}
			return url.join("");
	}

	return $tw.wiki.getTiddlerText(GAS_URL);
};

return { "getURL": getURL, "config":configs};

};

exports.utils = utils();