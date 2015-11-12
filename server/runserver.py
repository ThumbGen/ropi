"""
This script runs the server application using a development server.
"""

from os import environ
from server import app
import ptvsd

ptvsd.enable_attach(None)

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT)
