$(function () {
	var defaultName = {
		enable_trigger_name: 'YTRACE_TRIGGER',
		white_list_name: 'YTRACE_WHITE_LIST',
		black_list_name: 'YTRACE_BLACK_LIST',
		var_display_max_children_name: 'YTRACE_VAR_DISPLAY_MAX_CHILDREN',
		var_display_max_data_name: 'YTRACE_VAR_DISPLAY_MAX_DATA',
		var_display_max_depth_name: 'YTRACE_VAR_DISPLAY_MAX_DEPTH'
	};
	var url, hostname, tabId;

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

  function checkboxEnable(setCk) {
    $('form input[type=checkbox]').each(function (index, element) {
      var check = hostname + '-' + element.name;
      chrome.storage.sync.get(check, function (item) {
        var name = element.name.replace('check', 'name');
        var value = element.name.replace('check', 'value');
        if (item[check]) {
          $(element).prop('checked', true);
          if (setCk) {
            setCookie(name, hostname + '-' + value);
          }
        }
      });
    });
  }

  function checkboxDisable(delCk) {
    $('form input[type=checkbox]').each(function (index, element) {
      var check = hostname + '-' + element.name;
      chrome.storage.sync.get(check, function (item) {
        var name = element.name.replace('check', 'name');
        if (item[check]) {
          $(element).prop('checked', true);
          if (delCk) {
            delCookie(name);
          }
        }
      });
    });
  }

	chrome.tabs.getSelected(null, function (tab) {
		var _url = new URL(tab.url);
		hostname = _url.hostname;
		url = _url.origin;
		tabId = tab.id;

    chrome.storage.sync.get(hostname+'-enabled', function (item) {
      if (item[hostname+'-enabled']) {
        checkboxEnable(false);
        $('#ytrace-toggle').prop('checked', true);
      } else {
        checkboxDisable(false);
        $('form input').each(function (index, element) {
          $(element).prop('disabled', true);
        });
        $('#submit').prop('disabled', true);
      }
    });

    $('input.form-control').each(function (index, element) {
      var name = hostname + '-' + element.name;
      chrome.storage.sync.get(name, function (item) {
        if (item[name] !== undefined) {
          $(element).val(item[name]);
        }
      });
    });
	});

	$('.ytrace-name').each(function (index, element) {
		var name = $(element).attr('name');
		chrome.storage.sync.get(name, function (item) {
			if (item[name] !== '') {
				$(element).text(item[name]);
			}
		});
	});
	$('#ytrace-toggle').change(function () {
		var checked = $(this).is(':checked');
		var setObj = {};
		setObj[hostname+'-enabled'] = checked;
		chrome.storage.sync.set(setObj, function () {
			if (chrome.runtime.error) {
	    		console.log('Runtime error: ', chrome.runtime.error);
	    	}
		});
		if (checked) {
			$('form input').each(function (index, element) {
        $(element).prop('disabled', false);
      });
      $('#submit').prop('disabled', false);
      chrome.browserAction.setIcon({
        tabId: tabId,
        path: 'img/ytrace_on.png'
      });
      checkboxEnable(true);
		} else {
			$('form input').each(function (index, element) {
        $(element).prop('disabled', true);
      });
      $('#submit').prop('disabled', true);
      chrome.browserAction.setIcon({
        tabId: tabId,
        path: 'img/ytrace.png'
      });
      checkboxDisable(true);
		}
	});
	
	$('form').on('submit', function(event) {
		event.preventDefault();
		var formData = $(this).serializeArray();
		var setObj = {};
		var check = [
      'enable_trigger_check',
      'white_list_check',
      'black_list_check',
      'var_display_max_children_check',
      'var_display_max_data_check',
      'var_display_max_depth_check'
		];
		for (var i in check) {
      setObj[hostname + '-' + check[i]] = false;
    }
		for (var i in formData) {
			setObj[hostname + '-' + formData[i].name] = formData[i].value;
		}
		chrome.storage.sync.set(setObj, function () {
			if (chrome.runtime.error) {
	    		console.log('Runtime error: ', chrome.runtime.error);
	    	} else {
	    		for (var check in setObj) {
			    	if (check.indexOf('check') >= 0) {
			    	  var cookieName = check.replace(hostname + '-', '').replace('check', 'name');
			    	  if (setObj[check]) {
                setCookie(cookieName, check.replace('check', 'value'));
							} else {
                delCookie(cookieName);
              }
						}
			    }
          $('#alert-success').css('display', 'inline-block');
          setTimeout(function () {
            $('#alert-success').css('display', 'none');
          }, 1000);
        }
	    });
	});
});