import json
import re

# For ESPN-exported draft CSVs (different layout than the old NFL Fantasy
# export that convertDraft.py handles). Produces the same {"teams": [...]}
# JSON shape as convertDraft.py, so draft.js/draft-analysis.js don't care
# which platform the draft came from.
input_file = "./archive/2026/draft2026.csv"
output_file = "./archive/2026/draft2026.json"

num_teams = 12  # adjust if your league is different


def parse_player_line(line):
    # "Jahmyr Gibbs DET, RB" -> "Jahmyr Gibbs"
    # "Texans D/ST HOU, D/ST" -> "Texans D/ST"
    name_and_team, _, _pos = line.rpartition(",")
    player, _, _team = name_and_team.strip().rpartition(" ")
    return player.strip()


with open(input_file, "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip()]

structured = {}
round_num = 0
i = 0
while i < len(lines):
    line = lines[i]

    round_match = re.match(r"^Round\s+(\d+)$", line)
    if round_match:
        round_num = int(round_match.group(1))
        i += 1
        if lines[i:i + 3] == ["NO.", "Player", "Team"]:
            i += 3
        continue

    # Otherwise this is a pick: NO. / Player line / Team(manager) name
    pick_in_round = int(line)
    player_line = lines[i + 1]
    manager = lines[i + 2]
    i += 3

    player = parse_player_line(player_line)
    overall_pick = (round_num - 1) * num_teams + pick_in_round

    if manager not in structured:
        structured[manager] = {"name": manager, "picks": []}

    structured[manager]["picks"].append({
        "round": round_num,
        "pick": overall_pick,
        "player": player
    })

output = {"teams": list(structured.values())}

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print(f"✅ Draft JSON written to {output_file}")
