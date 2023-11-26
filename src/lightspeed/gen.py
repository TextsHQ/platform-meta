import json
import re

def extract_index(s):
    match = re.search(r'(\d+)', s)
    if match:
        return int(match.group(1))
    return None

t_name = "updateOrInsertReactionV2"
s = f"{t_name}: ["
type_str = f"export interface {t_name} " + '{'
rawjson = open("obj.txt").read().replace("{", "").replace("}", "").split("\n")

fields = []
for field in rawjson:
    field = field.strip().replace(",", "")
    fieldData = field.split(":")
    if len(fieldData) <= 1:
        continue

    name = fieldData[0]
    index = extract_index(fieldData[1].strip())
    fields.append((name, index))

skipped = 0
last_index = 0
names = []
sorted_fields = sorted(fields, key=lambda x: x[1])
for i, f in enumerate(sorted_fields):
    if f[1]-last_index > 1:
        for d in range(f[1]-last_index-1):
            s += "'skipped_{}', ".format(str(skipped))
            skipped += 1
    elif i == 0 and f[1] != 0:
        for d in range(f[1]):
            s += "'skipped_{}', ".format(str(skipped))
            skipped += 1
    s += "'" + f[0] + "'"
    type_str += f"\n    {f[0]}: any"
    if i >= len(sorted_fields)-1:
        s += ']'
        type_str += "\n}"
    else:
        s += ", "
    last_index = f[1]
print(type_str)
print(s)