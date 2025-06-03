const DB_NAME = "CohesionFS";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openFSDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "name" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getFSFiles() {
    const db = await openFSDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function setFSFile(file) {
    const db = await openFSDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(file);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteFSFile(index) {
    const files = await getFSFiles();
    if (!files[index]) return;
    const name = files[index].name;
    const db = await openFSDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteAllFS() {
    const db = await openFSDB();
    const tx = db.transaction("files", "readwrite");
    await tx.objectStore("files").clear();
    await tx.done;
}

async function renameFSFile(index, newName) {
    const files = await getFSFiles();
    const oldFile = files[index];
    if (!oldFile) throw new Error("File not found");

    const existingNames = files.map(f => f.name);
    if (existingNames.includes(newName)) {
        throw new Error("There's already a file with this name");
    }

    const db = await openFSDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
        const deleteRequest = store.delete(oldFile.name);
        deleteRequest.onsuccess = resolve;
        deleteRequest.onerror = () => reject(deleteRequest.error);
    });

    const renamedFile = {
        name: newName,
        content: oldFile.content
    };

    await new Promise((resolve, reject) => {
        const putRequest = store.put(renamedFile);
        putRequest.onsuccess = resolve;
        putRequest.onerror = () => reject(putRequest.error);
    });
}

async function uploadFSFile(accept = "*/*") {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.style.display = "none";

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return reject("No file selected");

            const reader = new FileReader();

            reader.onload = async () => {
                try {
                    const content = reader.result;
                    const files = await getFSFiles();
                    let name = file.name;

                    const baseName = name.replace(/\.[^/.]+$/, "");
                    const ext = name.split('.').pop();
                    let counter = 1;

                    while (files.find(f => f.name === name)) {
                        name = `${baseName}_${counter}.${ext}`;
                        counter++;
                    }

                    await setFSFile({ name, content });

                    resolve({ name, content });
                } catch (e) {
                    reject(e);
                }
            };

            reader.readAsDataURL(file);
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    });
}

async function downloadFSFile(index) {
    const files = await getFSFiles();
    const file = files[index];
    if (!file) return;

    const a = document.createElement("a");
    a.href = file.content;
    a.download = file.name;
    a.click();
}

async function resolveFSItem(name) {
    const db = await openFSDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(name);
        request.onsuccess = () => resolve(request.result?.content || null);
        request.onerror = () => reject(request.error);
    });
}

async function saveClipboardFile(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            try {
                const content = reader.result;
                const files = await getFSFiles();
                let name = file.name || `clipboard.${getDefaultExtension(file.type)}`;

                const baseName = name.replace(/\.[^/.]+$/, "");
                const ext = name.split('.').pop();
                let counter = 1;

                while (files.find(f => f.name === name)) {
                    name = `${baseName}_${counter}.${ext}`;
                    counter++;
                }

                await setFSFile({ name, content });
                resolve({ name, content });
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function getDefaultExtension(mimeType) {
    const map = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/ogg": "ogg"
    };
    return map[mimeType] || "bin";
}
