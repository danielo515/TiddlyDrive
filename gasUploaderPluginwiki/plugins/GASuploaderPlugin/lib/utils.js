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
	import_tiddler: "$:/Import",
	server_communication_error: "Something went wrong communicating with the server",
	folder_listed: "Succesfully list folder"
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


configs.import_manager = function (){
	var use_importer = $tw.wiki.getTiddlerText("$:/plugins/danielo515/GASuploader/config/useImporter");
	return use_importer ? use_importer.toLowerCase() === "yes" : false;
};

return { "getURL": getURL, "config":configs};

};

exports.utils = utils();