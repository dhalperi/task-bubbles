import webapp2

from google.appengine.api import users
from google.appengine.ext import db

import jinja2
import os

from task_db import Task

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.redirect("/")

    def post(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return

        task_id = self.request.get('id')
        task_key = db.Key(encoded=task_id)
        t = Task.get(task_key)
        if t != None:
          t.done = True
          t.put()

        self.redirect("/")

app = webapp2.WSGIApplication([('/del', MainPage)], debug=True)
