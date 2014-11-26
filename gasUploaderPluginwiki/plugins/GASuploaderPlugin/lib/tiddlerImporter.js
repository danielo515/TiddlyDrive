/*\
title: $:/plugins/danielo515/GASuploader/lib/tiddlerImporter.js
type: application/javascript
module-type: library

@tiddlers an array of tiddler fields

\*/

exports.GAS_importer  = function(IMPORT_TITLE,tiddlers,raise_importer,navigate)
{
	
if(raise_importer){
	// Get the current $:/Import tiddler
	var importTiddler = $tw.wiki.getTiddler(IMPORT_TITLE),
		importData = $tw.wiki.getTiddlerData(IMPORT_TITLE,{}),
		newFields = new Object({
			title: IMPORT_TITLE,
			type: "application/json",
		/*	"multitid-type": "vault",*/
			"plugin-type": "import"
		}),
		incomingTiddlers = [];
	// Process each tiddler
	importData.tiddlers = importData.tiddlers || {};
	console.log(tiddlers);
	$tw.utils.each(tiddlers,function(tiddlerFields) {
		var title = tiddlerFields.title;
		if(title) {
			incomingTiddlers.push(title);
			importData.tiddlers[title] = tiddlerFields;
		}
	});

	// Save the $:/Import tiddler
	newFields.text = JSON.stringify(importData,null,$tw.config.preferences.jsonSpaces);
	$tw.wiki.addTiddler(new $tw.Tiddler(importTiddler,newFields));
	if(navigate){
		addToStory(IMPORT_TITLE);
	}
	// Update the story and history details
} else {
	tiddlers.forEach(function(fields){
		$tw.wiki.addTiddler(new $tw.Tiddler(fields))
	});
}
	return "saved";

function addToStory (title,fromTitle) {
	var storyList = $tw.wiki.getTiddlerList("$:/StoryList")
	if(storyList) {
		// See if the tiddler is already there
		var slot = storyList.indexOf(title);
		// If not we need to add it
		if(slot === -1) {
			// First we try to find the position of the story element we navigated from
			slot = storyList.indexOf(fromTitle) + 1;
			// Add the tiddler
			storyList.splice(slot,0,title);
			// Save the story
			saveStoryList(storyList);
			$tw.wiki.addToHistory(title);
		}
	}
};

function saveStoryList (storyList) {
	var storyTiddler = $tw.wiki.getTiddler("$:/StoryList");
	$tw.wiki.addTiddler(new $tw.Tiddler(
		storyTiddler,
		{list: storyList}
	));
};


};