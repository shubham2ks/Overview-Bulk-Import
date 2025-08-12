import json
import os
from collections import OrderedDict

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
    db_folder = os.path.join(base_dir, 'DB')
    output_folder = os.path.join(base_dir, 'ModDB')
    requester_file = os.path.join(base_dir, 'RequesterRange.json')

    os.makedirs(output_folder, exist_ok=True)

    # Load RequesterRange.json once (this is the target to merge into each file)
    with open(requester_file, 'r', encoding='utf-8') as f:
        requester_data = json.load(f, object_pairs_hook=OrderedDict)

    # For every file in DB folder
    for filename in os.listdir(db_folder):
        if filename.lower().endswith('.json'):
            file_path = os.path.join(db_folder, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                db_file_data = json.load(f, object_pairs_hook=OrderedDict)

            # Merge: source = db_file_data, target = requester_data
            merged_json = merge_jsons(db_file_data, requester_data)

            # Output file name
            output_filename = filename.replace('.json', '_mod.json')
            output_path = os.path.join(output_folder, output_filename)

            with open(output_path, 'w', encoding='utf-8') as out_file:
                json.dump(merged_json, out_file, indent=2)

            print(f"✅ Merged: {filename} → {output_filename}")

if __name__ == "__main__":
    main()
