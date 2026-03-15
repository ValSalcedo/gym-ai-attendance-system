from datetime import datetime, timedelta

LAST_SEEN = {}
COOLDOWN_SECONDS = 60

def can_log_attendance(member_id):
    now = datetime.now()

    if member_id not in LAST_SEEN:
        LAST_SEEN[member_id] = now
        return True

    if now - LAST_SEEN[member_id] >= timedelta(seconds=COOLDOWN_SECONDS):
        LAST_SEEN[member_id] = now
        return True

    return False