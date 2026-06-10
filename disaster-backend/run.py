# from app import create_app
# from app.extensions import socketio
# from apscheduler.schedulers.background import BackgroundScheduler
# from app.jobs.escalation_job import run_dispatch_escalation_job
# import atexit
# import os

# app = create_app()

# scheduler = BackgroundScheduler()

# if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
#     scheduler.add_job(
#         func=run_dispatch_escalation_job,
#         trigger="interval",
#         minutes=1,
#         id="dispatch_escalation_job",
#         replace_existing=True,
#     )
#     scheduler.start()
#     atexit.register(lambda: scheduler.shutdown())

# if __name__ == "__main__":
#     socketio.run(
#         app,
#         host="0.0.0.0",
#         port=5000,
#         debug=app.config.get("DEBUG", False),
#     )

import __main__
import atexit
import os

from xgboost import XGBClassifier


class WeightedXGBClassifier(XGBClassifier):
    pass


# Register the class in __main__ so old joblib/pickle files
# saved from notebook/main scope can be loaded correctly.
setattr(__main__, "WeightedXGBClassifier", WeightedXGBClassifier)

from app import create_app
from app.extensions import socketio
from apscheduler.schedulers.background import BackgroundScheduler
from app.jobs.escalation_job import run_dispatch_escalation_job

app = create_app()

scheduler = BackgroundScheduler()

if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
    scheduler.add_job(
        func=run_dispatch_escalation_job,
        trigger="interval",
        minutes=1,
        id="dispatch_escalation_job",
        replace_existing=True,
    )
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=app.config.get("DEBUG", False),
    )