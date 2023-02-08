// Check for compatible browser

const browser_error_msg = 'Unsupported Browser detected.  Please use chrome or firefox or latest version of edge';

const isSupportedBrowser = (req, res, next) => {
  const clientBrowserName = (req.useragent.browser || '').toLowerCase();
  // console.log('Name:', clientBrowserName, 'Ver:', req.useragent.version);
  switch (clientBrowserName) {
    case 'ie':
      res.send(browser_error_msg);
      break;
    case 'edge':
      if (parseInt(req.useragent.version) >= 79) {
        next();
      } else {
        res.send(browser_error_msg);
      }
      break;
    case 'chrome':
    case 'firefox':
    case 'postmanruntime':
      next();
      break;
    default:
      res.send(browser_error_msg);
  }
};

module.exports = isSupportedBrowser;
