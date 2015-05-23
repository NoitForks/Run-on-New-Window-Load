// Imports
const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://gre/modules/devtools/Console.jsm');
Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

// Globals
const core = {
	addon: {
		name: 'Run on New Window Load',
		id: 'Run-on-New-Window-Load@jetpack',
		path: {
			name: 'run-on-new-window-load',
			content: 'chrome://run-on-new-window-load/content/',
			locale: 'chrome://run-on-new-window-load/locale/',
			resources: 'chrome://run-on-new-window-load/content/resources/',
			images: 'chrome://run-on-new-window-load/content/resources/images/'
		}
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};

// Lazy Imports
const myServices = {};
XPCOMUtils.defineLazyGetter(myServices, 'sb', function () { return Services.strings.createBundle(core.addon.path.locale + 'global.properties?' + Math.random()); /* Randomize URI to work around bug 719376 */ });

// START - Addon Functionalities
function blah(xwin) {
	try {
		var script = Services.prefs.getCharPref('extensions.Run-on-New-Window-Load@jetpack.load_script');
	} catch (ex) {
		console.error(ex);
		// pref probably doesnt exist
		return;
	}
	if (script) {
		eval(script);
	}
}

function unblah(xwin) {
	try {
		var script = Services.prefs.getCharPref('extensions.Run-on-New-Window-Load@jetpack.unload_script');
	} catch (ex) {
		console.error(ex);
		// pref probably doesnt exist
		return;
	}
	if (script) {
		eval(script);
	}
}
// END - Addon Functionalities

/*start - windowlistener*/
var windowListener = {
	//DO NOT EDIT HERE
	onOpenWindow: function (aXULWindow) {
		// Wait for the window to finish loading
		var aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		aDOMWindow.addEventListener('load', function () {
			aDOMWindow.removeEventListener('load', arguments.callee, false);
			windowListener.loadIntoWindow(aDOMWindow);
		}, false);
	},
	onCloseWindow: function (aXULWindow) {},
	onWindowTitleChange: function (aXULWindow, aNewTitle) {},
	register: function () {
		
		// Load into any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			if (aDOMWindow.document.readyState == 'complete') { //on startup `aDOMWindow.document.readyState` is `uninitialized`
				windowListener.loadIntoWindow(aDOMWindow);
			} else {
				aDOMWindow.addEventListener('load', function () {
					aDOMWindow.removeEventListener('load', arguments.callee, false);
					windowListener.loadIntoWindow(aDOMWindow);
				}, false);
			}
		}
		// Listen to new windows
		Services.wm.addListener(windowListener);
	},
	unregister: function () {
		// Unload from any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			windowListener.unloadFromWindow(aDOMWindow);
		}
		/*
		for (var u in unloaders) {
			unloaders[u]();
		}
		*/
		//Stop listening so future added windows dont get this attached
		Services.wm.removeListener(windowListener);
	},
	//END - DO NOT EDIT HERE
	loadIntoWindow: function (aDOMWindow) {
		if (!aDOMWindow) { return }
		
		try {
			blah();
		} catch(ex) {
			console.error('probelm running user script:', ex);
		}
		
	},
	unloadFromWindow: function (aDOMWindow) {
		if (!aDOMWindow) { return }
		
		try {
			unblah();
		} catch(ex) {
			console.error('probelm running user script:', ex);
		}
		
	}
};
/*end - windowlistener*/

function install() {}
function uninstall(aData, aReason) {
	if (aReason == ADDON_UNINSTALL) {
		// delete prefs
		console.error('deleting prefs');
		Services.prefs.clearUserPref('extensions.Run-on-New-Window-Load@jetpack.load_script');
		Services.prefs.clearUserPref('extensions.Run-on-New-Window-Load@jetpack.unload_script');
	}
}

function startup(aData, aReason) {
	
	//windowlistener more
	windowListener.register();
	//end windowlistener more
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) { return }
	
	//windowlistener more
	windowListener.unregister();
	//end windowlistener more

}

// start - common helper functions

// end - common helper functions