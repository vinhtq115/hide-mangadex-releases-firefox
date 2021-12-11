function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        groups: document.querySelector("#hidden-groups").value,
        uploaders: document.querySelector("#hidden-uploaders").value
    });
}

function restoreOptions() {

    function setCurrentChoiceGroups(result) {
        document.querySelector("#hidden-groups").value = result.groups || "";
    }

    function setCurrentChoiceUploaders(result) {
        document.querySelector("#hidden-uploaders").value = result.uploaders || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting_groups = browser.storage.sync.get("groups");
    getting_groups.then(setCurrentChoiceGroups, onError);

    let getting_uploaders = browser.storage.sync.get("uploaders");
    getting_uploaders.then(setCurrentChoiceUploaders, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);