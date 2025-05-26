const settingsStorageKey = "COHESION_SETTINGS_";

function setSetting(key, value) {
    localStorage.setItem(settingsStorageKey + key, value);
}

function getSetting(key, fallback = null) {
    let value = localStorage.getItem(settingsStorageKey + key);
    if (value) return value;
    return fallback
}

function removeSetting(key) {
    localStorage.removeItem(settingsStorageKey + key);
}