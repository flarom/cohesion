const settingsStorageKey = "COHESION_SETTINGS_";

function setSetting(key, value) {
    localStorage.setItem(settingsStorageKey + key, value);
    console.log(`Saved ${key} as ${value}`);
}

function getSetting(key) {
    console.log(`Retrieved ${key} as ${localStorage.getItem(settingsStorageKey + key)}`);
    return localStorage.getItem(settingsStorageKey + key);
}