Contributing
==========
stacktextflow is a community project and wouldn't be what it is without contributions! Here's a quick guide:

Fork, then clone the repo:

	git clone git@github.com:your-username/factory_girl_rails.git

You need to have Python 3 installed. stacktextflow is using a small python script, `pack.py` which copies the files from the `extension` directory into the directories for each browser and it's the template engine for `injectScript.js` .  For instace this line will be parsed by the script:

	%{ safari: '''safari.extension.baseURI + "index.html"''' chrome: '''chrome.runtime.getURL("index.html")''' }%

When creating the Safari plugin it will insert `safari.extension.baseURI + "index.html"` and when creating the chrome version `chrome.runtime.getURL("index.html")` will be used.

It is important that you only edit the files inside the `extension` directory and not the files directly in `stacktextflow.safariextension` or `chrome`. After making your edits run

	python3 pack.py

Then you can reload the plugin in the browser (see also Installing in README.md) and test your changes.

When you're finsihed push to your fork and submit a pull request.

At this point you're waiting on us. We like to at least comment on pull requests within three business days. We may suggest some changes or improvements or alternatives.

Please try to follow [jQuery's JavaScript Style Guide](http://contribute.jquery.org/style-guide/js/) and [Wordpress HTML Coding Standards](http://make.wordpress.org/core/handbook/coding-standards/html/).

