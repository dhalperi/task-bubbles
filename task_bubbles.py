import webapp2

from google.appengine.ext import db

import datetime
import jinja2
import math
import os

from task_db import Task

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

from google.appengine.api import users

class MainPage(webapp2.RequestHandler):
    def get(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return
        
        # Get the tasks from the database
        tasks = db.GqlQuery("SELECT * "
                            "FROM Task "
                            "WHERE user = :1 "
                            "      AND done = FALSE "
                            "ORDER BY ends ASC",
                            user)
        first_task = tasks.get()
        
        # If there is no last task, create one
        if first_task is None:
            t1 = Task(user=user, description="Create tasks", ends=datetime.datetime.now())
            t1.put()
            tasks = db.GqlQuery("SELECT * "
                                "FROM Task "
                                "WHERE user = :1 "
                                "      AND done = FALSE "
                                "ORDER BY ends ASC LIMIT 1",
                                user)
            first_task = tasks.get()

        # Earliest ending time    
        first_time = first_task.ends
        now = datetime.datetime.now()
        one_hour = datetime.timedelta(hours=1)
        #one_minute = datetime.timedelta(minutes=1)
        first_delta = first_time - now
        if first_delta < one_hour:
            first_time = first_time - one_hour
            first_delta = one_hour
        else:
          first_time = first_time - one_hour
          first_delta = one_hour
        
        out_tasks = []
        for t in tasks:
            delta = t.ends - first_time
            value = math.log(delta.total_seconds() / first_delta.total_seconds())
            value = min(value, 20)
            value = 1.0 / (1.0 + value)
            text = t.description
            out_tasks.append((text, value, str(t.key())))

        # Fill in the template values
        template_values = { 'tasks' : out_tasks }
        template = jinja_environment.get_template('tasks.html')
        self.response.out.write(template.render(template_values))

app = webapp2.WSGIApplication([('/', MainPage)],
                              debug=True)
