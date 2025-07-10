# Script to update the emoji list used in Cohesion.
# It fetches the latest official emoji list from the Unicode website
# and generates a filtered, snake_case dictionary of fully-qualified emojis.
# This helps keep the emoji list up-to-date when new emojis are added
# in future Unicode versions.

import re
import requests

def to_snake_case(name):
    return re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')

def is_skin_tone_variant(name):
    return ':' in name and 'flag:' not in name

def clean_name(raw_name):
    cleaned = re.sub(r'^E\d+\.\d+\s+', '', raw_name)
    return cleaned

url = "https://unicode.org/Public/emoji/latest/emoji-test.txt"
print("Downloading emoji-test.txt...")
response = requests.get(url)
if response.status_code != 200:
    print("Failed downloading emoji-test.txt. Status:", response.status_code)
    exit(1)

lines = response.text.splitlines()
output_lines = []
current_subgroup = None
seen = set()

for line in lines:
    line = line.strip()

    if line.startswith("# subgroup:"):
        current_subgroup = line.split(":", 1)[1].strip()
        output_lines.append(f"\n/** {current_subgroup} */")
        print(f"\nSubgroup: {current_subgroup}")
        continue

    if "; fully-qualified" in line:
        if "#" not in line:
            continue
        parts = line.split("#", 1)
        if len(parts) < 2 or not parts[1].strip():
            continue

        emoji_data = parts[1].strip().split(" ", 1)
        if len(emoji_data) < 2:
            continue

        emoji = emoji_data[0]
        raw_name = emoji_data[1]

        if is_skin_tone_variant(raw_name):
            continue

        name = clean_name(raw_name)

        if name.startswith("flag:"):
            flag_name = name.replace("flag:", "").strip()
            key = to_snake_case("flag_" + flag_name)
        else:
            key = to_snake_case(name)

        if key in seen:
            continue
        seen.add(key)

        output_lines.append(f'"{key}": "{emoji}",')
        print(f"\"{key}\":\"{emoji}\"")

with open("output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("\nGenerated output.txt")
