const settingsStorageKey = "COHESION_SETTINGS_";

const Settings = {
    /**
     * Sets a new value to a setting
     * @param {string} key Setting name
     * @param {string} value Setting value
     */
    setSetting : function (key, value) {
        localStorage.setItem(settingsStorageKey + key, value);
    },

    /**
     * Gets the value of a setting
     * @param {string} key Setting name
     * @param {any} fallback Returned value in case of the setting not being found
     * @param {boolean} ignoreComments Ignore lines starting with '#'
     * @returns The setting value as string
     */
    getSetting: function (key, fallback = null, ignoreComments = false) {
        let value = localStorage.getItem(settingsStorageKey + key);
        if (!value) return fallback;

        if (ignoreComments) {
            value = value.replace(
                /(^|[^\\])\/\*[\s\S]*?\*\//g,
                "$1"
            );

            value = value.replace(
                /(^|[^\\])\/\/.*?(\r?\n|$)/g,
                "$1"
            );

            value = value.replace(/\\(\/\/|\/\*|\*\/)/g, "$1");
        }

        return value;
    },

    /**
     * Deletes the value of a setting
     * @param {string} key Setting name
     */
    removeSetting : function (key) {
        localStorage.removeItem(settingsStorageKey + key);
    },

    /**
     * Deletes all settings
     */
    clearAllSettings : function () {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(settingsStorageKey)) {
                localStorage.removeItem(key);
                i--;
            }
        }
        location.reload();
    }
}