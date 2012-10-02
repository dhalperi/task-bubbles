import webapp2

from google.appengine.api import users


import datetime
import jinja2
import os

from task_db import Task

#import parsedatetime # last

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainPage(webapp2.RequestHandler):
    def get(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return
        
        # Fill in the template values
        template_values = { }
        template = jinja_environment.get_template('new_task.html')
        self.response.out.write(template.render(template_values))
        
    def post(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return

        description = self.request.get('description')
        ends = self.request.get('ends')
        t = Task(user=user, description=description, ends=datetime.datetime.now()+datetime.timedelta(hours=24))
        t.put()
        self.redirect('.')

app = webapp2.WSGIApplication([('/new', MainPage)],
                              debug=True)
