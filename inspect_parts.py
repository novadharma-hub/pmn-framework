import json
import os

with open('data/parts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total parts: {len(data)}")
for i, part in enumerate(data):
    part_val = part.get('part', '')
    title = part.get('title', '')
    subs = part.get('subs', [])
    print(f"{i+1}. Part: {part_val} | Title: {title} | Sections: {len(subs)}")
