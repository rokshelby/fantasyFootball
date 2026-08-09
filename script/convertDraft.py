import json
import csv

input_file = "./archive/2025/draft2025.csv"
output_file = "./archive/2025/draft2025.json"

teams = {}  # dictionary keyed by manager name
picks = []  # flat list of all picks (to assign rounds/picks)

# Read lines and strip commas/whitespace
with open(input_file, "r", encoding="utf-8") as f:
    lines = [line.strip().strip(",") for line in f if line.strip()]

# Each pick = 5 lines
block_size = 5
num_teams = 12  # adjust if your league is different

for i in range(0, len(lines), block_size):
    block = lines[i:i+block_size]
    if len(block) < block_size:
        continue  # skip incomplete block

    player = block[1]   # line 2
    manager = block[3]  # line 4

    picks.append((player, manager))

# Assign round + pick numbers
structured = {}
for idx, (player, manager) in enumerate(picks, start=1):
    round_num = (idx - 1) // num_teams + 1
    pick_num = idx

    if manager not in structured:
        structured[manager] = {"name": manager, "picks": []}

    structured[manager]["picks"].append({
        "round": round_num,
        "pick": pick_num,
        "player": player
    })

# Convert to final JSON
output = {"teams": list(structured.values())}

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print(f"✅ Draft JSON written to {output_file}")
