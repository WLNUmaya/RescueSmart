from flask import Flask

from . import victim_repository


def create_app():
    app = Flask(__name__)
   
    return app
