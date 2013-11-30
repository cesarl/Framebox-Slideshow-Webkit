global.$ = $;

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var shell = require('nw.gui').Shell;
var chokidar = require('chokidar');
var win = require('nw.gui').Window.get();

$(document).ready(function() {
    var folder = new folder_view.Folder($('#files'));
    var addressbar = new abar.AddressBar($('#addressbar'));
    var watcher = null;
    var interval = null;
    var time = 3000;

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


    addEventListener("keydown", function(e){
	if (e.keyCode === 83)
	{
	    launchFileExplorer();
	}
	if (e.keyCode === 70)
	{
	    win.toggleKioskMode();
	}
    });

    var launchFileExplorer = function()
    {
	$(".folder-explorer").show();
	$('.image-viewer').empty();
	collection = [];
	index = 0;
	if (interval)
	{
	    clearInterval(interval);
	    interval = null;
	}
	if (watcher)
	{
	    watcher.close();
	    watcher = null;
	}
	
	folder.on('rightclick', function(dir, mime) {
	    interval = setInterval(function(){refresh()}, time);
	    
	    $(".folder-explorer").hide();
	    watcher = chokidar.watch(dir + "/", {persistent: true, usePolling: true});
	    watcher.on("add", function(path){
	    	var re = /(?:\.([^.]+))?$/;
	    	if (re.exec(path)[1] === "jpg")
	    	{
		    setTimeout(function(){
			    addToCollection(path);
			}, 250);
	    	}
	    });
	});	
    }

    var display = function()
    {
	var img = $('<img src="'+ collection[index] +'">').load(function() {
	    $('.image-viewer').empty();
	    $(this).appendTo('.image-viewer');
	    }).error(function(){console.log("ERROR LOADING IMAGE : DELAY IS TOO SHORT")});
    }


    var addToCollection = function(path)
    {
	if (path && collection.indexOf(path) < 0)
	{
	    collection.push(path);
	    index = collection.length - 1;
	    if (interval)
	    {
		clearInterval(interval);
		interval = null;
		display();
		interval = setInterval(function(){refresh()}, time);
	    }
	}
    }

    var refresh = function()
    {
	++index;
	if (index >= collection.length)
	    index = 0;
	if (collection.length <= 0)
	    return;
	display();
    }

    launchFileExplorer();

});
