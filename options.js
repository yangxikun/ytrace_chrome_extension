$(function () {
	$('#reset-btn').click(function () {
		var setObj = {};
		$('form input').each(function (index, element) {
			element.value = '';
			setObj[element.name] = '';
		});
		chrome.storage.sync.set(setObj, function () {
			if (chrome.runtime.error) {
				console.log('Runtime error: ', chrome.runtime.error);
			}
		});
	});
	$('form input').each(function (index, element) {
		chrome.storage.sync.get(element.name, function (item) {
			if (item[element.name] && item[element.name] !== '') {
				element.value = item[element.name];
			}
		});
	});
	$('form').on('submit', function(event) {
	 	event.preventDefault();
		var formData = $(this).serializeArray();
		var setObj = {};
		for (var i in formData) {
			setObj[formData[i].name] = formData[i].value;
		}
		chrome.storage.sync.set(setObj, function () {
			if (chrome.runtime.error) {
	    		console.log('Runtime error: ', chrome.runtime.error);
	    	} else {
	        	$('#alert-success').css('display', 'block');
	        	setTimeout(function () {
	        		$('#alert-success').css('display', 'none');
	        	}, 1000);
	        }
	    });
	});
});