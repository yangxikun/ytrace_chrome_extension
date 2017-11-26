function ytraceEnable (url, hostname) {
  var defaultName = {
    enable_trigger_name: 'YTRACE_TRIGGER',
    white_list_name: 'YTRACE_WHITE_LIST',
    black_list_name: 'YTRACE_BLACK_LIST',
    var_display_max_children_name: 'YTRACE_VAR_DISPLAY_MAX_CHILDREN',
    var_display_max_data_name: 'YTRACE_VAR_DISPLAY_MAX_DATA',
    var_display_max_depth_name: 'YTRACE_VAR_DISPLAY_MAX_DEPTH'
  };

  // xxx_name, xxx_value
  function setCookie(name, value) {
    // set cookie
    chrome.storage.sync.get(name, function (item) {
      if (item[name]) {
        name = item[name];
      } else {
        name = defaultName[name];
      }
      chrome.storage.sync.get(value, function (item) {

        if (item[value] !== undefined) {
          chrome.cookies.set({ url: url, name: name, value: item[value], path: '/' });
        }
      });
    });
  }

  // xxx_name
  function delCookie(name) {
    chrome.storage.sync.get(name, function (item) {
      if (item[name]) {
        chrome.cookies.remove({url: url, name: item[name]});
      } else {
        chrome.cookies.remove({url: url, name: defaultName[name]});
      }
    });
  }

  for (var name in defaultName) {
    var _ = function (name) {
      var check = hostname + '-' + name.replace('name', 'check');
      chrome.storage.sync.get(check, function (item) {
        var value = hostname + '-' + name.replace('name', 'value');
        if (item[check]) {
          setCookie(name, value);
        } else {
          delCookie(name);
        }
      });
    }(name)
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete" || tab.url.indexOf("http") !== 0) {
    return;
  }
  var _url = new URL(tab.url);
  var hostname = _url.hostname;
  var url = _url.origin;

  chrome.storage.sync.get(hostname+'-enabled', function (item) {
    if (item[hostname+'-enabled']) {
      chrome.browserAction.setIcon({
        tabId: tabId,
        path: 'img/ytrace_on.png'
      });
      ytraceEnable(url, hostname);
    }
  });
});