"""
Persistent demo state for hackathon.
Stores which agent tasks have been "fixed" so the dashboard
always reflects the fixed state across restarts.
State is saved to a JSON file so it survives server restarts.
"""
import json
from pathlib import Path

STATE_FILE = Path(__file__).parent.parent / "data_files" / "agent_state.json"

DEFAULT_STATE = {
    "fixed_tasks": [],       # list of completed task_type strings
    "fixed_nodes": [],       # node IDs that were "fixed" by agent
    "fixed_risks": [],       # risk IDs that were "fixed" by agent
    "agent_log": [],         # log of all agent actions for dashboard
}


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return dict(DEFAULT_STATE)


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def mark_task_fixed(task_type: str, affected_resource: str, action_taken: str) -> None:
    state = load_state()
    if task_type not in state["fixed_tasks"]:
        state["fixed_tasks"].append(task_type)
    state["agent_log"].append({
        "task_type":        task_type,
        "affected_resource": affected_resource,
        "action_taken":     action_taken,
        "timestamp":        "just now",
    })
    # Apply specific fixes to nodes/risks
    if task_type == "restart_failing_service":
        state["fixed_nodes"].extend(["node-2", "node-8"])  # payment-service, ml-inference
    if task_type == "fix_public_bucket":
        state["fixed_risks"].extend(["sec-001", "sec-002"])
    if task_type == "stop_idle_instance":
        pass  # cost items handled separately
    save_state(state)


def reset_state() -> None:
    """Reset all fixes — useful for starting a fresh demo."""
    save_state(dict(DEFAULT_STATE))


def get_state() -> dict:
    return load_state()
