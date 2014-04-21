import webapp2

from google.appengine.api import users
from google.appengine.ext import db

import datetime
import json

from task_db import Task

class TaskHandler(webapp2.RequestHandler):
    def get(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.error(401)
            return

        # Get the tasks from the database
        tasks = db.GqlQuery("SELECT ends, description "
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
            tasks = db.GqlQuery("SELECT ends, description "
                                "FROM Task "
                                "WHERE user = :1 "
                                "      AND done = FALSE "
                                "ORDER BY ends ASC LIMIT 1",
                                user)
            first_task = tasks.get()

        # Earliest ending time
        now = datetime.datetime.now()
        one_hour = datetime.timedelta(hours=1)
        first_time = now
        first_delta = first_task.ends - first_time
        if first_delta.total_seconds() <= one_hour.total_seconds():
            first_delta = one_hour

        out_tasks = []
        for t in tasks:
            seconds = (t.ends - now).total_seconds()
            delta = t.ends - first_time
            if delta.total_seconds() <= first_delta.total_seconds():
                value = 1
            else:
                value = (first_delta.total_seconds() / delta.total_seconds()) ** 0.75
            text = t.description
            out_tasks.append({"name" : text, "size" : value, "seconds" : seconds, "task_id" : t.key().id()})

        self.response.out.write(json.dumps({"name" : "tasks", "children" : out_tasks}))

    def post(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.error(401)
            return

        description = self.request.get('description')
        if description is None:
            self.error(400)
            return
        ends = int(self.request.get('ends'))
        if ends is None:
            self.error(400)
            return
        end_time = datetime.datetime.utcfromtimestamp(ends / 1000.0);
        t = Task(user=user, description=description, ends=end_time)
        t.put()
        self.response.set_status(200)

    def delete(self, taskid=None):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.error(401)
            return

        # If no arguments, do something
        if taskid is None:
            self.error(404)
            return

        # If one argument, see if the task exists
        try:
            task_key = db.Key.from_path('Task', int(taskid))
        except db.BadKeyError:
            self.error(404)
            return
        t = Task.get(task_key)
        if t == None:
            self.error(404)
            return
        elif t.user != user:
            self.error(401)
            return
        else:
            if not t.done:
                t.done = True
                t.put()
            self.response.set_status(200)

app = webapp2.WSGIApplication([(r'/task/(.*)', TaskHandler), ('/task', TaskHandler)], debug=False)
