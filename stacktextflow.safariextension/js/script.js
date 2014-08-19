stacktextflow = {
	
	create: function (){
		$("#sto-menu").on("click", "button", stacktextflow.menuButtonClicked);
		$("#sto-post").click(stacktextflow.post);
		$("#sto-discard").click(stacktextflow.discard);
		
		stacktextflow.editor = $("#sto-editor");
		stacktextflow.editor.on("input keyup paste", stacktextflow.edited);
		
		window.addEventListener("message", stacktextflow.receivedMessage, false);
	
		stacktextflow.postMessage({ 
			"command": "getSEEditorValue"
		});
	},
	
	saveSelection: function() {
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
	
	menuButtonClicked: function (e){
		var cmd = e.currentTarget.getAttribute('data-command');
		if(cmd == "createLink"){
			stacktextflow.saveSelection();
			
			bootbox.prompt("Please enter an URL", function(result) {
				if(!result) return;
				
				stacktextflow.restoreSelection();
				document.execCommand("createLink", false, result);	
			}); 
		}
		else {
			document.execCommand(cmd, false, e.currentTarget.getAttribute('data-value'));	
		}
	},
	
	edited: function (){
		stacktextflow.postMessage({ 
			"command": "edited",
			"value": stacktextflow.editor.html()
		});
	},
	
	discard: function (){
		stacktextflow.postMessage({ 
			"command": "discard",
		});
	},
	
	post: function (){
		stacktextflow.postMessage({ 
			"command": "post",
		});
	},
	
	postMessage: function (o){
		window.parent.postMessage(o, "*");
	},
	
	receivedMessage: function(event){
		if(event.data.command == "SEEditorValue"){
			stacktextflow.editor.html(event.data.value);
		}
	}
	
};

$(stacktextflow.create);
