var stacktextflow = {

	editor: $("#sto-editor"),
	
	/* This function is called to initialize the editor */
	init: function (){		
		document.execCommand( "styleWithCSS", false, false );

		/* Activating Bootstrap Tooltips */
		$('#sto-menu button').tooltip({
			"delay": { show: 650, hide: 50 },
			"placement": "bottom"
		});
		
		/* Enabling messaging with the injectScript */
		window.addEventListener( "message", stacktextflow.events.receivedMessage, false );
		
	    
		stacktextflow.setupAce();
		stacktextflow.bind();
	},
	
	/* Bind all events */
	bind: function (){
		$("#sto-menu").on( "click", "button", stacktextflow.events.menuButtonClicked );
		$("#sto-post").click( stacktextflow.events.post );
		$("#sto-discard").click( stacktextflow.events.discard );
		
		/* The "insert" button handler in the code modal */
		$("#code-insert").click( stacktextflow.events.insertCode );
		
		/* The "insert" button handler in the link modal */
		$("#link-insert").click( stacktextflow.events.insertLink );
		
		/* Detect shortcuts */
		$(document).keydown( stacktextflow.events.keydown );
		
		/* Binding editor events */
		stacktextflow.editor.on( "input keyup paste", stacktextflow.events.edited );
		stacktextflow.editor.on( "mouseup keyup focus", stacktextflow.events.changedCaretPosition );
		
		stacktextflow.editor.on( 'paste', stacktextflow.events.paste );
		
		stacktextflow.editor.keydown( stacktextflow.events.editorKeydown );
	},

	/* Setting up the Ace code editor */
	setupAce: function(){
		ace.require( "ace/ext/language_tools" );
		
		stacktextflow.cEditor = ace.edit( "code-editor" );
	    stacktextflow.cEditor.setTheme( "ace/theme/monokai" );
	    stacktextflow.cEditor.getSession().setMode( "ace/mode/javascript" );
	    stacktextflow.cEditor.setOptions({
	        enableBasicAutocompletion: true,
	        enableLiveAutocompletion: true
	    });

		var codewSelect = $("#codew-modes"),
			modes = require( "ace/ext/modelist" ).modesByName;
		for (var key in modes) {
			if (modes.hasOwnProperty(key)) {
				codewSelect.append( '<option value="' + key + '">' + modes[key].caption + '</option>' );
			}
		}
		codewSelect.find( "[value=javascript]" ).prop( "selected",true );
		codewSelect.change( stacktextflow.events.changedCEditMode );
	},
	
	/* Cotains all event handlers */
	events: {
	
		editorKeydown: function(e) {
			// trap the return key being pressed
			if (e.keyCode === 13) {
				document.execCommand('insertHTML', false, '<br><br>');
				return false;
			}
		},
	
		/* The "Insert" button in the "Write Code" modal was clicked */
		insertCode: function (){
			$("#codeWriteModal").modal( "hide" );
			
			stacktextflow.restoreSelection();
			document.execCommand( 'removeFormat', false );
			document.execCommand( "insertHTML", false, "<pre>" + stacktextflow.cEditor.getValue() + "</pre><br /><br />" );
			stacktextflow.events.changedCaretPosition();
		},
		
		insertLink: function (){
			stacktextflow.insertLink( $("#linkField").val() );
		},
		
		/* The main editor's content has changed, notify the injectScript which will update the stackexchange editor */
		edited: function (){
			stacktextflow.postMessage({ 
				"command": "edited",
				"value": toMarkdown( stacktextflow.editor.html() )
			});
		},
		
		/* The user clicked discard, notify the injectScript which will discard in the stackexchange editor */
		discard: function (){
			stacktextflow.postMessage({ 
				"command": "discard",
			});
		},
		
		/* Send the inject script that we want to submit the form */
		post: function (){
			stacktextflow.postMessage({ 
				"command": "post",
			});
		},
		
		/* Detect shortcuts and click */
		keydown: function (e){
			if(e.metaKey) return !$(' #sto-menu > button[data-shortcut="' + String.fromCharCode(e.keyCode).toUpperCase() + '"]' ).click().length;
		},
		
		/* The value of the mode select above the code editor was changed, update the mode */
		changedCEditMode: function (){
			var mode = require("ace/ext/modelist").modesByName[ $("#codew-modes").val() ];
			stacktextflow.cEditor.getSession().setMode({
			   path: mode.mode,
			   v: Date.now() 
			});
		},
		
		/* Receiving messages from the inject script */
		receivedMessage: function(event){
			if(event.data.command == "SEEditorValue"){
				stacktextflow.editor.html(event.data.value);
			}
		},
		
		changedCaretPosition: function (){
			if(stacktextflow.isSelectionInsideElement( "a" )){
				$("#menu-createLink").attr( "data-command","unlink" );
			} else {
				$("#menu-createLink").attr( "data-command","createLink" );
			}
		},
		
		/* Always paste raw text */
		paste: function(e) {
		    e.preventDefault();
		    var text = (e.originalEvent || e).clipboardData.getData( 'text/plain' ) || prompt( 'Paste something..' );
		    document.execCommand( 'insertText', false, text );
		},

		/* One of the main editor buttons was clicked */
		menuButtonClicked: function (e){
			var cmd = e.currentTarget.getAttribute('data-command');
			if(cmd == "createLink"){
				stacktextflow.createLink();
			}
			else if(cmd == "writeCode"){
				stacktextflow.writeCode();
			}
			else if(cmd == "heading"){
				stacktextflow.changeHeading();
			}
			else {
				console.log(cmd);
				document.execCommand( cmd, false, e.currentTarget.getAttribute('data-value') );	
			}
		},
		
	},
	
	insertLink: function (link){
		$("#linkModal").modal( "hide" );
	
		stacktextflow.restoreSelection();
		document.execCommand( "createLink", false, link );
		stacktextflow.events.changedCaretPosition();
	},
	
	/* Utilties for handling selection */
	saveSelection: function() {
		/* Store the the cursor postition/selection to restore it later */
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
		/* Restore the the cursor postition/selection */
	    if (stacktextflow.storedSelection) {
	    	stacktextflow.editor.focus();
	        if (window.getSelection) {
	            sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(stacktextflow.storedSelection);
	        } else if (document.selection && stacktextflow.storedSelection.select) {
	            stacktextflow.storedSelection.select();
	        }
	        stacktextflow.events.changedCaretPosition();
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

	createLink: function(){
		stacktextflow.saveSelection();
		
		var selection = stacktextflow.getSelectionText();
		
		/* Query DuckDuckGo */
		var result = $("#linkAYLF .result");
		
		if(selection) {
			result.html( '<div class="spinner"><div class="ball ball-1"></div><div class="ball ball-2"></div><div class="ball ball-3"></div><div class="ball ball-4"></div></div>' );
		
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
			    	result.html( '<div class="well"><h4>' + data.Heading + '</h4><p>' + data.Abstract + '</p><a href="' + url + '" target="_blank">' + url + '</a><button class="btn btn-primary">Use Link</button></div><div class="text-muted"><small>Quick Answers provided by DuckDuckGo</small></div>' )
				    		.find("button")
					    		.one("click",function (){
							    	stacktextflow.insertLink(url);
						    	});
		    	}
		    });
		}
		else {
			result.html( '<h4 class="lead text-muted text-center">Select text in the editor to see suggestions.</h4>' );
		}
			
		$("#linkModal").modal( "show" ).one( "shown.bs.modal", function (){
			$("#linkField").focus();
		});
	},

	writeCode: function(){
		stacktextflow.saveSelection();
				
		stacktextflow.cEditor.setValue(""); 
		$("#codeWriteModal").modal( "show" ).one( "shown.bs.modal", function (){
			stacktextflow.cEditor.focus();
		});
	},

	changeHeading: function(){
		if(stacktextflow.isSelectionInsideElement("h1")){
			document.execCommand( "formatBlock", false, "h2" )
		} else if(stacktextflow.isSelectionInsideElement("h2")) {
			document.execCommand( 'formatBlock', false, 'div' );  //TODO Not acceptable with tomarkdown, we need to remove the heading not just replace it with a div http://stackoverflow.com/questions/18337081/how-to-remove-h1-formatting-within-contenteditable-wysiwyg
		} else {
			document.execCommand( "formatBlock", false, "h1" );
		}
	},

	postMessage: function (o){
		window.parent.postMessage( o, "*" );
	},
	
	htmlToMarkdown: function (html){
		markdown
	}
	
};


$(stacktextflow.init);
