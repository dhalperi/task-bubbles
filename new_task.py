import webapp2

from google.appengine.api import users


import datetime
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

        description = self.request.get('description')
        ends = int(self.request.get('ends'))
        end_time = datetime.datetime.utcfromtimestamp(ends/1000.0);
        t = Task(user=user, description=description, ends=end_time)
        t.put()
        self.redirect('.')

app = webapp2.WSGIApplication([('/new', MainPage)], debug=True)
