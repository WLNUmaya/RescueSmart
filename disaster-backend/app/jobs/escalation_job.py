from app.services.escalation_service import process_dispatch_escalations

def run_dispatch_escalation_job():
    try:
        print("Running dispatch escalation job...")
        process_dispatch_escalations()
    except Exception as e:
        print("DISPATCH ESCALATION JOB ERROR:", e)