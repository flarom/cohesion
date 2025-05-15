const settingsStorageKey = "COHESION_SETTINGS_";

function setSetting(key, value) {
    console.log(`Saved ${key} as ${value}`);
}

function getSetting(key) {
    return localStorage.getItem(settingsStorageKey + key);
}