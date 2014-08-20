var stacktextflow = {
	
	/** This function is called to initialize the editor */
	init: function (){
		stacktextflow.editor = $("#sto-editor");
		
		/* Activating Bootstrap Tooltips */
		$('#sto-menu button').tooltip({
			"delay": { show: 650, hide: 50 },
			"placement": "bottom"
		});
		
		/* Always paste raw text */
		stacktextflow.editor.on('paste',function(e) {
		    e.preventDefault();
		    var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..');
		    document.execCommand('insertText', false, text);
		});
		
		/* Enabling messaging with the injectScript */
		window.addEventListener("message", stacktextflow.events.receivedMessage, false);
	
		/* Request the value of the stackexchange editor by messaging injectScript */
		stacktextflow.postMessage({ 
			"command": "getSEEditorValue"
		});
		
		/* Setting up the Ace code editor */
		ace.require("ace/ext/language_tools");
		
		stacktextflow.cEditor = ace.edit("code-editor");
	    stacktextflow.cEditor.setTheme("ace/theme/monokai");
	    stacktextflow.cEditor.getSession().setMode("ace/mode/javascript");
	    stacktextflow.cEditor.setOptions({
	        enableBasicAutocompletion: true,
	        enableLiveAutocompletion: true
	    });
	    
	    var codewSelect = $("#codew-modes");
	    var modes = require("ace/ext/modelist").modesByName;
		for (var key in modes) {
			if (modes.hasOwnProperty(key)) {
				codewSelect.append('<option value="' + key + '">' + modes[key].caption + '</option>');
			}
		}
		codewSelect.find("[value=javascript]").prop("selected",true);
		codewSelect.change(stacktextflow.events.changedCEditMode);
		
		stacktextflow.bindUI();
	},
	
	bindUI: function (){
		$("#sto-menu").on("click", "button", stacktextflow.menuButtonClicked);
		$("#sto-post").click(stacktextflow.post);
		$("#sto-discard").click(stacktextflow.discard);
		
		/* The "insert" button handler in the code modal */
		$("#code-insert").click(stacktextflow.events.insertCode);
		
		/* The "insert" button handler in the link modal */
		$("#link-insert").click(stacktextflow.events.insertLink);
		
		/* Detect shortcuts */
		$(document).keydown(stacktextflow.events.keydown);
		
		/* Binding editor events */
		stacktextflow.editor.on("input keyup paste", stacktextflow.events.edited);
		stacktextflow.editor.on("mousedown keydown focus", stacktextflow.events.changedCaretPosition);
	},
	
	/** Cotains all event handlers */
	events: {
	
		insertCode: function (){
			/* The "Insert" button in the "Write Code" modal was clicked */
			$("#codeWriteModal").modal("hide");
			
			stacktextflow.restoreSelection();
			document.execCommand("insertHTML", false, "<div><pre>" + stacktextflow.cEditor.getValue() + "</pre></div><br />");
		},
		
		insertLink: function (){
			stacktextflow.insertLink($("#linkField").val());
		},
		
		/** The main editor's content has changed, notify the injectScript which will update the stackexchange editor */
		edited: function (){
			stacktextflow.postMessage({ 
				"command": "edited",
				"value": stacktextflow.editor.html()
			});
		},
		
		/** The user clicked discard, notify the injectScript which will discard in the stackexchange editor */
		discard: function (){
			//
			stacktextflow.postMessage({ 
				"command": "discard",
			});
		},
		
		post: function (){
			//Post the answer thru the submit form
			stacktextflow.postMessage({ 
				"command": "post",
			});
		},
		
		keydown: function (e){
			//Detect shortcuts and click
			if(e.metaKey) return !$('#sto-menu > button[data-shortcut="' + String.fromCharCode(e.keyCode).toUpperCase() + '"]').click().length;
		},
		
		changedCEditMode: function (){
			//The value of the mode select above the code editor was changed, update the mode
			var mode = require("ace/ext/modelist").modesByName[$("#codew-modes").val()];
			stacktextflow.cEditor.getSession().setMode({
			   path: mode.mode,
			   v: Date.now() 
			});
		},
		
		receivedMessage: function(event){
			//Receiving messages from the inject script
			if(event.data.command == "SEEditorValue"){
				stacktextflow.editor.html(event.data.value);
			}
		},
		
		changedCaretPosition: function (){
			
		}
		
	},
	
	insertLink: function (link){
		$("#linkModal").modal("hide");
	
		stacktextflow.restoreSelection();
		document.execCommand("createLink", false, link);	
	},
	
	
	//Utilties for handling selection
	saveSelection: function() {
		//Store the the cursor postition/selection to restore it later
	    if (window.getSelection) {
	        sel = window.getSelection();
	        if (sel.getRangeAt && sel.rangeCount) {
	            stacktextflow.storedSelection = sel.getRangeAt(0);
	        }
	    } else if (document.selection && document.selection.createRange) {
	        stacktextflow.storedSelection = document.selection.createRange();
	    }
	},

	restoreSelection: function() {
		//Restore the the cursor postition/selection
	    if (stacktextflow.storedSelection) {
	    	stacktextflow.editor.focus();
	        if (window.getSelection) {
	            sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(stacktextflow.storedSelection);
	        } else if (document.selection && stacktextflow.storedSelection.select) {
	            stacktextflow.storedSelection.select();
	        }
	    }
	},
	
	getSelectionText: function() {
	    var text = "";
	    if (window.getSelection) {
	        text = window.getSelection().toString();
	    } else if (document.selection && document.selection.type != "Control") {
	        text = document.selection.createRange().text;
	    }
	    return text;
	},
		
	isSelectionInsideElement: function(tagName) {
	    var sel, containerNode;
	    tagName = tagName.toUpperCase();
	    if (window.getSelection) {
	        sel = window.getSelection();
	        if (sel.rangeCount > 0) {
	            containerNode = sel.getRangeAt(0).commonAncestorContainer;
	        }
	    } else if ( (sel = document.selection) && sel.type != "Control" ) {
	        containerNode = sel.createRange().parentElement();
	    }
	    while (containerNode) {
	        if (containerNode.nodeType == 1 && containerNode.tagName == tagName) {
	            return true;
	        }
	        containerNode = containerNode.parentNode;
	    }
	    return false;
	},
	
	menuButtonClicked: function (e){
		//One of the main editor buttons was clicked
		var cmd = e.currentTarget.getAttribute('data-command');
		if(cmd == "createLink"){
			//User wants to add an link
			stacktextflow.saveSelection();
			
			var selection = stacktextflow.getSelectionText()
			
			//Query DuckDuckGo
			var result = $("#linkAYLF .result");
			
			if(selection) {
				result.html('<div class="spinner"><div class="ball ball-1"></div><div class="ball ball-2"></div><div class="ball ball-3"></div><div class="ball ball-4"></div></div>');
			
				$.ajax({
					type: 'GET',
					url: 'https://api.duckduckgo.com/',
					data: { q: selection, format: 'json', pretty: 1 },
					jsonpCallback: 'jsonp',
					dataType: 'jsonp'
			    }).then(function (data) {
			    	if(!data.AbstractURL) {
				    	result.html('<h4 class="lead text-muted text-center">No results</h4>');
			    	} else {
			    		var url = data.AbstractURL;
				    	result.html('<div class="well"><h4>' + data.Heading + '</h4><p>' + data.Abstract + '</p><a href="' + url + '">' + url + '</a><button class="btn btn-primary">Use Link</button></div><div class="text-muted"><small>Quick Answers provided by DuckDuckGo</small></div>').find("button").one("click",function (){
					    	stacktextflow.insertLink(url);
				    	});
			    	}
			    });
			}
			else {
				result.html('<h4 class="lead text-muted text-center">Select text in the editor to see suggestions.</h4>');
			}
				
			$("#linkModal").modal("show").one("shown.bs.modal", function (){
				$("#linkField").focus();
			});
		}
		else if(cmd == "writeCode"){
			//Launching the write code modal
			stacktextflow.saveSelection();
			
			stacktextflow.cEditor.setValue(""); 
			$("#codeWriteModal").modal("show").one("shown.bs.modal", function (){
				stacktextflow.cEditor.focus();
			});
			
		}
		else {
			document.execCommand(cmd, false, e.currentTarget.getAttribute('data-value'));	
		}
	},
	
	postMessage: function (o){
		window.parent.postMessage(o, "*");
	},
	
};


$(stacktextflow.init);
