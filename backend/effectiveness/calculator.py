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
