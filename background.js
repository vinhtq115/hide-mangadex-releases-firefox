var to_be_hidden_groups;
var to_be_hidden_uploaders;

function listener(details) {
	let getting = browser.storage.sync.get(["groups", "uploaders"]);
	getting.then(onGot, onError);

	let filter = browser.webRequest.filterResponseData(details.requestId);
	let decoder = new TextDecoder("utf-8");
	let encoder = new TextEncoder();

	let data = [];
	filter.ondata = event => {
		data.push(event.data);
	};
	
	filter.onstop = event => {
		let str = "";
		if (data.length == 1) {
			str = decoder.decode(data[0]);
		} else {
			for (let i = 0; i < data.length; i++) {
				let stream = (i == data.length - 1) ? false : true;
				str += decoder.decode(data[i], {stream});
			}
		}
		var json_data = JSON.parse(str);
		data_length = Object.keys(json_data.data).length;
		try {
			for (let i = 0; i < data_length; i++) {
				relationships = json_data.data[i].relationships;
				var group = "";
				var uploader = "";
				
				for (let j = 0; j < Object.keys(relationships).length; j++) {
					if (relationships[j].type == "scanlation_group" && "attributes" in relationships[j]) {
						group = relationships[j].attributes.name;
					} else if (relationships[j].type == "user" && "attributes" in relationships[j]) {
						uploader = relationships[j].attributes.username;
					}
				}
				
				var hidden = false;  // Flag if release needs to be hidden
				
				// Search if group is blacklisted
				if (group != "" && to_be_hidden_groups.length > 0) {
					for (let j = 0; j < to_be_hidden_groups.length; j++) {
						if (to_be_hidden_groups[j] === group) {
							hidden = true;
							break;
						}
					}
				}
				
				// Search if uploader is blacklisted
				if (uploader != "" && to_be_hidden_uploaders.length > 0 && !hidden) {
					for (let j = 0; j < to_be_hidden_uploaders.length; j++) {
						if (to_be_hidden_uploaders[j] === uploader) {
							hidden = true;
							break;
						}
					}
				}
				
				if (hidden) {
					// Remove release from JSON object
					json_data.data.splice(i, 1);
					i = i - 1;
					data_length = data_length - 1;
				}
			}
		} catch (err) {
			console.log(err);
		}

		filter.write(encoder.encode(JSON.stringify(json_data)));
		filter.disconnect();
	}
	return {};
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(item) {
	// Get groups and uploaders that need to be hidden
	try {
		to_be_hidden_groups = item.groups.split(/\r?\n/);
	} catch (err) {
		to_be_hidden_groups = [];
	}
	try {
		to_be_hidden_uploaders = item.uploaders.split(/\r?\n/);
	} catch (err) {
		to_be_hidden_uploaders = [];
	}
}

browser.webRequest.onBeforeRequest.addListener(
	listener,
	{urls: ["https://api.mangadex.org/manga/*/feed?*", "https://api.mangadex.org/chapter?*"], types: ["xmlhttprequest"]},
	["blocking"]
);
