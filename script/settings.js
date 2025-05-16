const settingsStorageKey = "COHESION_SETTINGS_";

function setSetting(key, value) {
    localStorage.setItem(settingsStorageKey + key, value);
}

function getSetting(key) {
    return localStorage.getItem(settingsStorageKey + key);
}

function removeSetting(key) {
    localStorage.removeItem(settingsStorageKey + key);
}