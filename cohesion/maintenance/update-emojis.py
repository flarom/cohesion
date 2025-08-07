# Script to update the emoji list used in Cohesion.
# It fetches the latest official emoji list from the Unicode website
# and generates a filtered, snake_case dictionary of fully-qualified emojis.
# This helps keep the emoji list up-to-date when new emojis are added
# in future Unicode versions.

# npm init -y
# npm install gemoji
# python3 update-emojis.py --compact

import re
import requests
import sys
import subprocess
import json

# snake_case helper
def to_snake_case(name):
    return re.sub(r'[^a-z0-9\+\-]+', '_', name.lower()).strip('_')

def is_skin_tone_variant(name):
    return ':' in name and 'flag:' not in name

def clean_name(raw_name):
    return re.sub(r'^E\d+\.\d+\s+', '', raw_name)

# compact flag
compact = '-c' in sys.argv or '--compact' in sys.argv

# fetch Unicode emoji list
url = "https://unicode.org/Public/emoji/latest/emoji-test.txt"
print("Downloading emoji-test.txt…")
res = requests.get(url)
if res.status_code != 200:
    print("Failed downloading:", res.status_code)
    sys.exit(1)
lines = res.text.splitlines()

print("Generating emoji shortcode map via gemoji…")
node_script = """
const { gemoji } = require('gemoji');
const map = {};
for (const e of gemoji) {
  if (e.emoji && e.names && e.names.length > 0) {
    map[e.emoji] = e.names[0];
  }
}
console.log(JSON.stringify(map));
"""
proc = subprocess.run(['node', '-e', node_script], capture_output=True, text=True)
if proc.returncode != 0:
    print("Node/gemoji error:", proc.stderr)
    sys.exit(1)

emoji_map = json.loads(proc.stdout)

output = []
obj = {}
seen = set()
current_sub = None

for line in lines:
    line = line.strip()
    if line.startswith("# subgroup:"):
        current_sub = line.split(":",1)[1].strip()
        if not compact:
            output.append(f"\n/** {current_sub} */")
        continue
    if "; fully-qualified" not in line or "#" not in line:
        continue
    parts = line.split("#",1)
    if len(parts)<2 or not parts[1].strip(): continue
    data = parts[1].strip().split(" ",1)
    if len(data)<2: continue

    raw_emoji, raw = data
    if is_skin_tone_variant(raw): continue
    name = clean_name(raw)

    # flags
    if name.startswith("flag:"):
        name = "flag_" + name.replace("flag:", "").strip()
    # use shortcode
    scode = emoji_map.get(raw_emoji)
    key = to_snake_case(scode) if scode else to_snake_case(name)

    if key in seen: continue
    seen.add(key)
    if compact:
        obj[key] = raw_emoji
    else:
        output.append(f'"{key}": "{raw_emoji}",')

with open("output.txt", "w", encoding="utf-8") as f:
    if compact:
        items = [f'"{k}":"{v}"' for k,v in obj.items()]
        f.write("{" + ",".join(items) + "}")
    else:
        f.write("\n".join(output))

print("Generated output.txt")