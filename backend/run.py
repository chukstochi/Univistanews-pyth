import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    # debug=True (and Flask's built-in server generally) should never run in
    # production — gunicorn (see Procfile) serves this app on Elastic Beanstalk.
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
