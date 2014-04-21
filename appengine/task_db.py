#import datetime

from google.appengine.ext import db

class Task(db.Model):
    """Models an individual task entry"""
    user = db.UserProperty(required=True)
    description = db.StringProperty(required=True, multiline=False)
    added = db.DateTimeProperty(auto_now_add=True)
    ends = db.DateTimeProperty(required=True)
    done = db.BooleanProperty(default=False)
