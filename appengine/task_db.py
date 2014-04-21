from google.appengine.ext import db


class User(db.Model):
    """Models a system user"""
    user = db.UserProperty(required=True)
    signup = db.DateTimeProperty(auto_now_add=True)


class Task2(db.Model):
    """Models an individual task entry"""
    description = db.StringProperty(required=True, multiline=False)
    added = db.DateTimeProperty(auto_now_add=True)
    ends = db.DateTimeProperty(required=True)
    done = db.BooleanProperty(default=False)
