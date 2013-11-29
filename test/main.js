global.$ = $;

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var shell = require('nw.gui').Shell;
var chokidar = require('chokidar');

$(document).ready(function() {
    var folder = new folder_view.Folder($('#files'));
    var addressbar = new abar.AddressBar($('#addressbar'));
    var watcher;

    var collection = [];
    var index = 0;

  folder.open(process.cwd());
  addressbar.set(process.cwd());

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      addressbar.enter(mime);
    } else {
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    folder.open(dir);
  });

    var display = function()
    {
	$('#main').empty();
	$('#main').append('<img src="' + collection[index] + '"/>');
    }


    var addToCollection = function(path)
    {
	if (path && collection.indexOf(path) < 0)
	{
	    console.log("lol", path);
	    collection.push(path);
	    index = collection.length - 1;
	    display();
	}
    }

    var refresh = function()
    {
	++index;
	if (index >= collection.length)
	    index = 0;
	if (collection.length < 0)
	    return;
	display();
    }

  folder.on('rightclick', function(dir, mime) {
      setInterval(function(){refresh()}, 1000);
    $('#main').empty();
    watcher = chokidar.watch(dir + "/", {ignored: /^\./, persistent: true});
      watcher.on("add", function(path){
	  var re = /(?:\.([^.]+))?$/;
	  if (re.exec(path)[1] === "jpg")
	  {
	      addToCollection(path);
	      console.log(re.exec(path)[1]);
	  }
      });
  });

});
