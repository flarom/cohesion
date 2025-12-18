// returns a string array with all google material symbols
// * paste this on console on https://fonts.google.com/icons
// * literally takes icon names from the page HTML, this thing will break if they change their front-end, this code sucks

(() => {
  const icons = new Set();

  document.querySelectorAll("gf-load-icon-font").forEach(el => {
    const name = el.textContent?.trim();
    if (!name) return;

    icons.add(
      name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
    );
  });

  const result = [...icons].sort();
  console.log(result);
  return result;
})();