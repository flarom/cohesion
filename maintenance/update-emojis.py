# Script to update the emoji list used in Cohesion.
# It fetches the latest official emoji list from the Unicode website
# and generates a filtered, snake_case dictionary of fully-qualified emojis.
# This helps keep the emoji list up-to-date when new emojis are added
# in future Unicode versions.

import re
import requests

# Converts a string to snake_case, replacing non-alphanumeric characters with underscores.
def to_snake_case(name):
    return re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')

# Checks if the emoji name represents a skin tone variant (ignores flags).
def is_skin_tone_variant(name):
    return ':' in name and 'flag:' not in name

# Removes Unicode version prefix (e.g., 'E13.0 ') from the emoji name.
def clean_name(raw_name):
    cleaned = re.sub(r'^E\d+\.\d+\s+', '', raw_name)
    return cleaned

# URL for the latest emoji-test.txt from Unicode
url = "https://unicode.org/Public/emoji/latest/emoji-test.txt"
print("Downloading emoji-test.txt...")
response = requests.get(url)
if response.status_code != 200:
    print("Failed downloading emoji-test.txt. Status:", response.status_code)
    exit(1)

# Split the file into lines for processing
lines = response.text.splitlines()
output_lines = []
current_subgroup = None
seen = set() # To avoid duplicate keys

for line in lines:
    line = line.strip()

    # Detect subgroup headers and add as comments in output

    if line.startswith("# subgroup:"):
        current_subgroup = line.split(":", 1)[1].strip()
        output_lines.append(f"\n/** {current_subgroup} */")
        print(current_subgroup)
        continue

    # Process only fully-qualified emoji lines
    if "; fully-qualified" in line:
        if "#" not in line:
            continue
        parts = line.split("#", 1)
        if len(parts) < 2 or not parts[1].strip():
            continue

        emoji_data = parts[1].strip().split(" ", 1)
        if len(emoji_data) < 2:
            continue

        emoji = emoji_data[0]       # The emoji character itself
        raw_name = emoji_data[1]    # The emoji name (may include Unicode version)

        # Skip skin tone variants (except flags)
        if is_skin_tone_variant(raw_name):
            continue

        name = clean_name(raw_name)

        # Special handling for flags: prefix with 'flag_'
        if name.startswith("flag:"):
            flag_name = name.replace("flag:", "").strip()
            key = to_snake_case("flag_" + flag_name)
        else:
            key = to_snake_case(name)

        # Avoid duplicate keys
        if key in seen:
            continue
        seen.add(key)

        # Add to output as a dictionary entry
        output_lines.append(f'"{key}": "{emoji}",')

# Write the result to output.txt
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("\nGenerated output.txt")
