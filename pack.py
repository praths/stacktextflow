import distutils.dir_util, os, re;

# Template MUST look like this
# %{ safari: '''code''' chrome: '''code''' default: '''code''' }%
 
class TemplateEngine:
	def __init__(self, browser):
		self.browser = browser
		
	def template(self, string, out):
		content = re.compile("%\\{.+?(?=\\}%)}\\%").sub(self.stringForBrowser, string)
		
		textFile = open(out, "w")
		textFile.write(content)
		textFile.close()
	
	def stringForBrowser(self, match):
		code = match.group()
		
		browserString = re.compile(self.browser + ": '''.+?(?=''')'''").search(code)
		if browserString:
			length = len(self.browser) + 5
			return browserString.group()[length:-3]
		else:
			default = re.compile("default: '''.+?(?=''')'''").search(code)
			if default:
				return default.group()[12:-3]
		return ""

def copyFor(rootDir, browserDir, browser):
	bDir = os.path.join(rootDir, browserDir)
	distutils.dir_util.copy_tree(src, bDir)
	TemplateEngine(browser).template(injectScript, os.path.join(bDir, "js", "injectScript.js"))



rootDir = os.path.dirname(__file__)
src = os.path.join(rootDir, "extension")

textfile = open(os.path.join(src, "js", "injectScript.js"), 'r')
injectScript = textfile.read()
textfile.close()

copyFor(rootDir, "stacktextflow.safariextension", "safari")
copyFor(rootDir, "chrome", "chrome")
