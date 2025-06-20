const settingsStorageKey = "COHESION_SETTINGS_";

/**
 * Sets a new value to a setting
 * @param {string} key Setting name
 * @param {string} value Setting value
 */
function setSetting(key, value) {
    localStorage.setItem(settingsStorageKey + key, value);
}

/**
 * Gets the value of a setting
 * @param {string} key Setting name
 * @param {any} fallback Returned value in case of the setting not being found
 * @param {boolean} ignoreComments Ignore lines starting with '#'
 * @returns The setting value as string
 */
function getSetting(key, fallback = null, ignoreComments = false) {
    let value = localStorage.getItem(settingsStorageKey + key);
    if (!value) return fallback;

    if (ignoreComments) {
        value = value.replace(/(\/\/|#).*?(\r?\n|$)/g, "");
    }

    return value;
}

/**
 * Deletes the value of a setting
 * @param {string} key Setting name
 */
function removeSetting(key) {
    localStorage.removeItem(settingsStorageKey + key);
}

/**
 * Deletes all settings
 */
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