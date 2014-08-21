import shutil, os, re;

# Template MUST look like this
# %{ safari: '''code''' chrome: '''code''' default: '''code''' }%
 
class TemplateEngine:
	def __init__(self, browser):
		self.browser = browser
		
	def template(self, string, out):
		content = re.compile("%\\{(?!\\}%)+\\}%").sub(self.stringForBrowser, string)
		
		textFile = open(out, "w")
		textFile.write(content)
		textFile.close()
	
	def stringForBrowser(self, match):
		code = match.group()
		
		browserString = re.compile(self.browser + ": '''(?!''')'''").search(code)
		if browserString:
			length = len(self.browser) + 2
			return browserString.group()[length:-3]
		else:
			default = re.compile("default: '''(?!''')'''").search(code)
			if default:
				return default.group()[12:-3]
		return ""


try:
	rootDir = os.path.realpath(__file__);
	src = (os.path.join(rootDir + "extension")
	
	textfile = open(os.path.join(src, filename, 'r')
	injectscript = textfile.read()
	textfile.close()

	safari = os.path.join(rootDir + "stacktextflow.safariextension")
    shutil.copytree(src, safari)
    
    chrome = os.path.join(rootDir + "chrome")
    shutil.copytree(src, chrome)
    
# Directories are the same
except shutil.Error as e:
    print('Directory not copied. Error: %s' % e)
# Any error saying that the directory doesn't exist
except OSError as e:
    print('Directory not copied. Error: %s' % e)