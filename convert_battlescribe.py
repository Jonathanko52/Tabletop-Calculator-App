#!/usr/bin/env python3
"""
Convert a Battlescribe .cat catalogue file to unit_templates.json.

Usage:
    python convert_battlescribe.py imports/MyFaction.cat
    python convert_battlescribe.py imports/MyFaction.cat --out examples/my_faction.json

Limitations:
  - Weapons referenced only via <infoLink> (pointing to sharedProfiles) are not
    followed and will be absent from output.
  - Points cost is the base value before conditional squad-size modifiers.
"""

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = "http://www.battlescribe.net/schema/catalogueSchema"


def tag(local: str) -> str:
    return f"{{{NS}}}{local}"


def parse_int(value: str, default: int = 0) -> int:
    cleaned = re.sub(r'["+""]', "", value.strip()).strip()
    try:
        return int(float(cleaned))
    except ValueError:
        return default


def chars_dict(profile_el: ET.Element) -> dict[str, str]:
    return {
        c.get("name", ""): (c.text or "").strip()
        for c in profile_el.findall(f".//{tag('characteristic')}")
    }


def collect_weapons(entry_el: ET.Element) -> list[dict]:
    seen: set[tuple[str, str]] = set()
    weapons: list[dict] = []

    for profile in entry_el.iter(tag("profile")):
        type_name = profile.get("typeName", "")
        if type_name not in ("Melee Weapons", "Ranged Weapons"):
            continue

        name = profile.get("name", "Unknown")
        weapon_type = "melee" if type_name == "Melee Weapons" else "ranged"
        key = (name, weapon_type)
        if key in seen:
            continue
        seen.add(key)

        chars = chars_dict(profile)
        ap_str = chars.get("AP", "0")
        ap_val = parse_int(ap_str) if ap_str not in ("-", "") else 0

        if weapon_type == "ranged":
            range_str = chars.get("Range", "0")
            range_val = 0 if range_str.lower() == "melee" else parse_int(range_str)
            bs_ws = parse_int(chars.get("BS", "4"))
        else:
            range_val = 0
            bs_ws = parse_int(chars.get("WS", "4"))

        weapons.append({
            "weapon_type": weapon_type,
            "name": name,
            "range": range_val,
            "attacks": chars.get("A", "1"),
            "bs_ws": bs_ws,
            "strength": parse_int(chars.get("S", "4")),
            "ap": ap_val,
            "damage": chars.get("D", "1"),
            "special": chars.get("Keywords", ""),
        })

    return weapons


def parse_unit(entry_el: ET.Element) -> dict | None:
    # Must have a Unit stat profile to be considered a unit
    unit_profile = next(
        (p for p in entry_el.iter(tag("profile")) if p.get("typeName") == "Unit"),
        None,
    )
    if unit_profile is None:
        return None

    chars = chars_dict(unit_profile)

    pts = 0
    costs_el = entry_el.find(tag("costs"))
    if costs_el is not None:
        for cost in costs_el.findall(tag("cost")):
            if cost.get("name") == "pts":
                try:
                    pts = int(float(cost.get("value", "0")))
                except ValueError:
                    pass

    return {
        "name": entry_el.get("name", "Unknown"),
        "points_cost": pts,
        "movement": parse_int(chars.get("M", "6")),
        "toughness": parse_int(chars.get("T", "4")),
        "save": parse_int(chars.get("SV", "4")),
        "wounds": parse_int(chars.get("W", "1")),
        "leadership": parse_int(chars.get("LD", "7")),
        "oc": parse_int(chars.get("OC", "1")),
        "weapons": collect_weapons(entry_el),
    }


def convert(cat_path: Path) -> list[dict]:
    tree = ET.parse(cat_path)
    root = tree.getroot()

    shared = root.find(tag("sharedSelectionEntries"))
    if shared is None:
        print("No sharedSelectionEntries found in file.", file=sys.stderr)
        return []

    units: list[dict] = []
    seen_names: set[str] = set()

    for entry in shared.findall(tag("selectionEntry")):
        unit = parse_unit(entry)
        if unit is None or unit["name"] in seen_names:
            continue
        seen_names.add(unit["name"])
        units.append(unit)

    return units


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert a Battlescribe .cat file to unit_templates.json"
    )
    parser.add_argument("input", help="Path to the .cat file")
    parser.add_argument("--out", help="Output JSON path (default: print to stdout)")
    args = parser.parse_args()

    cat_path = Path(args.input)
    if not cat_path.exists():
        print(f"File not found: {cat_path}", file=sys.stderr)
        sys.exit(1)

    units = convert(cat_path)

    if not units:
        print("No units extracted — check the file is a catalogue (.cat), not a roster (.ros/.rosz).", file=sys.stderr)
        sys.exit(1)

    output = json.dumps(units, indent=2)

    if args.out:
        Path(args.out).write_text(output)
        print(f"Wrote {len(units)} units to {args.out}")
    else:
        print(output)


if __name__ == "__main__":
    main()
