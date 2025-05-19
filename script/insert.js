function insertYouTubeVideo(url) {
    let prefix = `<!-- YouTube Video Player -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatYouTubeEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return (prefix + value + suffix);

    function formatYouTubeEmbed(url) {
        let regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        let match = url.match(regex);

        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        } else {
            return "Unknown";
        }
    }
}

async function handleInsertImage() {
    try {
        const text = await insertFile('![ALT TEXT](', '")', '.apng, .gif, .ico, .cur, .jpg, .jpeg, .jfif, .pjpeg, .pjp, .png, .svg, .webp');
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertAudio() {
    try {
        const text = await insertFile('<audio controls src="', '"></audio>', '.mp4, .wav, .ogg');
        insertAt(text, 0, 0);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertVideo() {
    try {
        const text = await insertFile('<video controls src="', '"></video>', '.mp4, .webm, .ogg');
        insertAt(text, 0, 0);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function insertFile(prefix, suffix, accept = '*/*') {
    const file = await uploadFSFile(accept);
    if (!file || !file.name) throw new Error("No file returned");

    const filePath = `pocket/${file.name}`;
    return prefix + filePath + suffix;
}