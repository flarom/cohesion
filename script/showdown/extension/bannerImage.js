const bannerImage = () => {
  return [{
    type: 'output',
    filter: (text, converter, options) => {
      const metadata = converter.getMetadata ? converter.getMetadata() : {};
      const bannerPath = metadata.banner;

      if (bannerPath && bannerPath.length > 1) {
        const bannerHTML = `<img class="banner" src="${bannerPath}" alt="Banner">\n`;
        return bannerHTML + text;
      }

      return text;
    }
  }];
};
