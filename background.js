chrome.action.onClicked.addListener(async (tab) => {

	//console.log(tab);

	// the original language
	let detecting = chrome.tabs.detectLanguage();
	detecting.then(function(lang) {

		// inject a script that translates and shows both
		// this is ran in the tab's VM and handles the translation
		var get_document = function(lang) {

			console.log('original language', lang);

			if (lang !== 'en') {
				alert('only translates from english, not ' + lang);
			}

			var translate_readlate_string = function(s, text_to_replace) {

				// use strings
				// if the strings are from element.innerHTML or element.innerText
				// use JSON.parse(JSON.stringify())

				// split by whitespace, add matching russian words

				// use sentence to sentence translation
				// then word to word for what's remaining
				// like this

				// this is the sentence
				// >w1  >w2  >w3  >w4
				return s.replace(text_to_replace, 'original_оригинальный');

			}

			var mod_contents_count = 0;

			// recursively modify every element
			var mod_contents = function(ele) {

				mod_contents_count++;
				//console.log('element #' + mod_contents_count);

				if (String(ele.innerText).length === 0) {
					// no reason to modify
					return 0;
				}

				if (ele.hasChildNodes()) {

					var c = 0;
					var all_children_text_length = 0;
					while (c < ele.children.length) {
						all_children_text_length += mod_contents(ele.children[c]);
						c++;
					}

					// remove any inner elements and get the text that should be translated
					var s = JSON.parse(JSON.stringify(String(ele.innerHTML)));

					// remove comments
					var re = /(?=<!--)([\s\S]*?)-->/gm;
					s = s.replaceAll(re, '');

					var carats = s.split('<');

					var n = 0;
					while (n < carats.length) {

						if (carats[n].indexOf('path') === 0 || carats[n].indexOf('svg') === 0) {
							// do not modify inside svg/path elements
							//console.log('svg/path');
							n++;
							continue;
						}

						// find the end carats
						var end_carats = carats[n].split('>');

						var text_to_replace = '';

						if (end_carats.length === 1) {
							// this is only a string
							//console.log('len1', carats[n], end_carats);
							text_to_replace = carats[n];
						} else if (end_carats.length === 2) {
							// this is a closing > and more text only
							//console.log('len2', carats[n], end_carats);
							text_to_replace = end_carats[1];
						} else {

							// invalid
							console.log('invalid <> parsing', carats[n]);

						}

						if (text_to_replace.indexOf('<svg') != -1 || text_to_replace.indexOf('<path') != -1) {
							// invalid, do not parse svg
						} else if (text_to_replace != '') {
							//console.log(text_to_replace);
							ele.innerHTML = translate_readlate_string(s, text_to_replace);
						}

						n++;
					}

				} else {

					// it is safe to modify
					// there are no elements inside
					//console.log('element with no children');
					ele.innerHTML = translate_readlate_string(JSON.parse(JSON.stringify(String(ele.innerText))), JSON.parse(JSON.stringify(String(ele.innerText))));

				}

				return String(ele.innerText).length;

			}

			mod_contents(document.body);

			return true;

		}

		chrome.scripting.executeScript({target: {tabId: tab.id, allFrames: true}, func: get_document, args: [lang]}, (res) => {

			// the original body HTML as a string
			var returned = res[0].result;

		});

	}, function(err) {
		console.log('error detecting language', err);
	});

});
