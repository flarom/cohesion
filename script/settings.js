const settingsStorageKey = "COHESION_SETTINGS_";

function setSetting(key, value) {
    localStorage.setItem(settingsStorageKey + key, value);
}

function getSetting(key, fallback = null, ignoreComments = false) {
    let value = localStorage.getItem(settingsStorageKey + key);
    if (!value) return fallback;

    if (ignoreComments) {
        value = value.replace(/(\/\/|#).*?(\r?\n|$)/g, "");
    }

    return value;
}

function removeSetting(key) {
    localStorage.removeItem(settingsStorageKey + key);
}

function clearAllSettings() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(settingsStorageKey)) {
            localStorage.removeItem(key);
            i--;
        }
    }
    location.reload();
}