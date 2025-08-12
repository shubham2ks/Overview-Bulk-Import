

import json
from collections import OrderedDict
import os

def is_plain_object(obj):
    return isinstance(obj, dict)

def merge_values(val1, val2):
    if is_plain_object(val1) and is_plain_object(val2):
        return merge_jsons(val1, val2)
    
    if isinstance(val1, str) and isinstance(val2, str):
        if val1 == val2:
            return val1
    
    return f"{val1},{val2}"

def merge_jsons(source_json, target_json):
    merged = OrderedDict()

    # Step 1: Keep source keys in order
    for key in source_json.keys():
        if key in target_json:
            merged[key] = merge_values(source_json[key], target_json[key])
        else:
            merged[key] = source_json[key]

    # Step 2: Append keys unique to target_json
    for key in target_json.keys():
        if key not in source_json:
            merged[key] = target_json[key]

    return merged

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    spryker_file = os.path.join(base_dir, 'sprykerBO.json')
    requester_file = os.path.join(base_dir, 'RequesterRange.json')
    output_file = os.path.join(base_dir, 'merged.json')

    with open(spryker_file, 'r', encoding='utf-8') as f:
        spryker_data = json.load(f, object_pairs_hook=OrderedDict)

    with open(requester_file, 'r', encoding='utf-8') as f:
        requester_data = json.load(f, object_pairs_hook=OrderedDict)

    merged_json = merge_jsons(spryker_data, requester_data)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_json, f, indent=2)

    print(f"✅ Merged JSON written to {output_file}")

if __name__ == "__main__":
    main()
