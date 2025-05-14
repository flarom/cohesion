function insertYTVideo(url){
    let prefix = `<!-- 📺 YouTube Video Player -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatYouTubeEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return(prefix + value + suffix);
}

function formatYouTubeEmbed(url) {
    let regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    let match = url.match(regex);
    
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    } else {
        return "Unknown";
    } 
}