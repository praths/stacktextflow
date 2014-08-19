stacktextflow = {
	
	container: $('<div><div id="sto-container"><div id="sto-menu"><button data-command="italic" class="btn btn-default"><span class="glyphicon glyphicon-italic"></span></button><button data-command="bold" class="btn btn-default"><span class="glyphicon glyphicon-bold"></span></button><span class="sto-seperator"></span><button data-command="createLink" class="btn btn-default"><span class="glyphicon glyphicon-link"></span></button><button data-command="formatBlock" data-value="blockquote" class="btn btn-default">”</button><button data-command="formatBlock" data-value="code" class="btn btn-default">{}</button><button data-command="insertHTML" data-value="<img src=\'nix.jpg\'/>" class="btn btn-default"><span class="glyphicon glyphicon-picture"></span></button><span class="sto-seperator"></span><button data-command="formatBlock" data-value="h1" class="btn btn-default"><span class="glyphicon glyphicon-header"></span> 1</button><button data-command="formatBlock" data-value="h2" class="btn btn-default"><span class="glyphicon glyphicon-header"></span> 2</button><button data-command="formatBlock" data-value="h3" class="btn btn-default"><span class="glyphicon glyphicon-header"></span> 3</button><span class="sto-seperator"></span><button data-command="insertOrderedList" class="btn btn-default">1. <span class="glyphicon glyphicon-list"></span></button><button data-command="insertUnorderedList" class="btn btn-default"><span class="glyphicon glyphicon-stop"></span><span class="glyphicon glyphicon-list"></span></button></div><div id="sto-editor" class="form-control" contenteditable>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed ante at lorem adipiscing dictum et sit amet metus. Morbi sit amet lectus ut risus pharetra tristique. Nunc lobortis, odio ac imperdiet sollicitudin, nisl elit bibendum justo, eu pulvinar odio dui ut orci. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent interdum nulla tortor, eget iaculis augue euismod nec. Donec eget lorem turpis. Sed feugiat malesuada purus, in posuere augue congue quis. Etiam nec volutpat tortor. Fusce sit amet nulla tellus. Curabitur sapien nisi, placerat nec magna a, mattis bibendum odio. Fusce rutrum, justo luctus tempor rutrum, urna orci ornare felis, a cursus est libero at nulla.</div><div class="sto-bottom"><button class="btn btn-success" id="sto-post">Post Your Answer</button><button class="btn btn-danger btn-xs" id="sto-discard">Discard</button></div></div></div>'),
	
	create: function (){
		stacktextflow.container.insertAfter($("#post-form"));

		stacktextflow.container.find("#sto-menu").on("click", "button", stacktextflow.menuButtonClicked);
		stacktextflow.container.find("#sto-post").click(stacktextflow.post);
		stacktextflow.container.find("#sto-discard").click(stacktextflow.discard);
		
		stacktextflow.editor = $("#sto-container").find("#sto-editor");
		
		stacktextflow.editor.on("blur keyup paste input", stacktextflow.edited);
		
		stacktextflow.rti = $("#wmd-input");
		stacktextflow.editor.html(stacktextflow.rti.val());
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
		stacktextflow.rti.val(stacktextflow.editor.html());
	},
	
	discard: function (){
		$("#post-form").find(".discard-answer").click();
	},
	
	post: function (){
		$("#post-form").submit();	
	}
	
};

$(stacktextflow.create);
