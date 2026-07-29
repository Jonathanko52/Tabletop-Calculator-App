"""
Warhammer 40K 10th-edition damage calculator using PyTorch tensors.

For each weapon we compute expected damage against every target profile in a
single batched pass, then divide by the unit's points cost to get damage/pt.
"""

import math
import torch

# Standard target profiles: (label, toughness, save, fnp)
# fnp = feel-no-pain roll (0 = none)
TARGET_PROFILES = [
    ("T3 5+",     3, 5, 0),
    ("T4 3+",     4, 3, 0),
    ("T4 3+ FNP", 4, 3, 5),
    ("T5 3+",     5, 3, 0),
    ("T6 3+",     6, 3, 0),
    ("T8 2+",     8, 2, 0),
    ("T9 3+",     9, 3, 0),
    ("T12 2+",   12, 2, 0),
]


def _wound_roll_needed(strength: int, toughness: int) -> int:
    """Return the minimum d6 result needed to wound (2–6)."""
    if strength >= toughness * 2:
        return 2
    if strength > toughness:
        return 3
    if strength == toughness:
        return 4
    if strength * 2 <= toughness:
        return 6
    return 5


def _parse_dice(value: str) -> float:
    """Return expected value for strings like '3', 'D3', 'D6', '2D3'."""
    value = value.strip().upper()
    if value.isdigit():
        return float(value)
    if value == "D3":
        return 2.0
    if value == "D6":
        return 3.5
    if value == "2D3":
        return 4.0
    if value == "2D6":
        return 7.0
    # Fall back to 1 if unrecognised
    return 1.0


def _p_success(roll_needed: int) -> float:
    """Probability of rolling >= roll_needed on a d6 (clamped to [1/6, 5/6])."""
    return max(0.0, min(1.0, (7 - roll_needed) / 6))


def calculate_weapon_damage(
    attacks: str,
    bs_ws: int,
    strength: int,
    ap: int,
    damage: str,
    points_cost: int,
) -> list[dict]:
    """
    Return a list of dicts (one per target profile) with:
      - target_profile: str
      - expected_damage: float
      - damage_per_point: float
    """
    expected_attacks = _parse_dice(attacks)
    expected_damage = _parse_dice(damage)

    p_hit = _p_success(bs_ws)

    # Build tensors: shape (N_profiles,)
    toughnesses = torch.tensor([p[1] for p in TARGET_PROFILES], dtype=torch.float32)
    saves       = torch.tensor([p[2] for p in TARGET_PROFILES], dtype=torch.float32)
    fnps        = torch.tensor([p[3] for p in TARGET_PROFILES], dtype=torch.float32)

    # Wound probability for each profile
    wound_rolls_needed = torch.tensor(
        [_wound_roll_needed(strength, int(t.item())) for t in toughnesses],
        dtype=torch.float32,
    )
    p_wound = torch.clamp((7 - wound_rolls_needed) / 6, 0.0, 1.0)

    # Save probability (fail to save = damage goes through)
    effective_save = saves - ap
    p_fail_save = torch.clamp((effective_save - 1) / 6, 0.0, 1.0)

    # Feel-no-pain: blocks damage with probability (7 - fnp) / 6 when fnp > 0
    p_fnp_pass = torch.where(fnps > 0, (7 - fnps) / 6, torch.zeros_like(fnps))
    p_damage_through = 1.0 - p_fnp_pass

    # Expected damage per profile
    exp_dmg: torch.Tensor = (
        expected_attacks * p_hit * p_wound * p_fail_save * p_damage_through * expected_damage
    )

    results = []
    for i, (label, *_) in enumerate(TARGET_PROFILES):
        dmg = round(exp_dmg[i].item(), 3)
        dpp = round(dmg / points_cost, 4) if points_cost > 0 else 0.0
        results.append({
            "target_profile": label,
            "expected_damage": dmg,
            "damage_per_point": dpp,
        })

    return results


def calculate_weapon_matchup(
    attacks: str,
    bs_ws: int,
    strength: int,
    ap: int,
    damage: str,
    attacker_points: int,
    defender_toughness: int,
    defender_save: int,
    defender_wounds: int,
    invuln_save: int = 7,
    fnp: int = 0,
) -> dict:
    """
    Calculate expected damage for one weapon against one specific defender profile.
    Returns intermediate probabilities plus expected_damage, models_killed, damage_per_point.

    invuln_save: minimum roll needed to pass invuln (7 = no invuln).
    fnp: minimum roll needed to ignore a wound via Feel No Pain (0 = no FNP).
    """
    expected_attacks = _parse_dice(attacks)
    expected_damage  = _parse_dice(damage)

    p_hit   = _p_success(bs_ws)
    p_wound = _p_success(_wound_roll_needed(strength, defender_toughness))

    effective_save = defender_save - ap
    best_save = min(effective_save, invuln_save)
    p_fail_save = max(0.0, min(1.0, (best_save - 1) / 6))

    p_fnp_pass = _p_success(fnp) if fnp > 0 else 0.0
    p_damage_through = 1.0 - p_fnp_pass

    exp_dmg = expected_attacks * p_hit * p_wound * p_fail_save * p_damage_through * expected_damage

    models_killed = exp_dmg / defender_wounds if defender_wounds > 0 else 0.0
    dpp = exp_dmg / attacker_points if attacker_points > 0 else 0.0

    return {
        "p_hit": round(p_hit, 4),
        "p_wound": round(p_wound, 4),
        "p_fail_save": round(p_fail_save, 4),
        "p_damage_through": round(p_damage_through, 4),
        "expected_damage": round(exp_dmg, 3),
        "models_killed":   round(models_killed, 3),
        "damage_per_point": round(dpp, 4),
    }
