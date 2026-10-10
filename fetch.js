const fs = require('fs');

const CHANNEL_ID = 'UCpo0yY3oZpj925OuuUMuLwg';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

async function run() {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const xml = await res.text();

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const idRegex = /<yt:videoId>([^<]+)<\/yt:videoId>/;
    const titleRegex = /<title>([^<]+)<\/title>/;

    const items = [];
    let match;

    while ((match = entryRegex.exec(xml)) !== null && items.length < 20) {
      const entry = match[1];
      const id = (entry.match(idRegex) || [])[1];
      const title = (entry.match(titleRegex) || [])[1];

      if (id && title) {
        items.push({
          id,
          title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
          thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        });
      }
    }

    const output = {
      updated_at: new Date().toISOString(),
      items
    };

    fs.writeFileSync('stories.json', JSON.stringify(output, null, 2), 'utf8');
    console.log(`Success! Created stories.json with ${items.length} videos.`);
  } catch (err) {
    console.error('Fetch error:', err);
    process.exit(1);
  }
}

run();
