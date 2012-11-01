import webapp2

import os

LOCAL_PATH = os.path.dirname(__file__)

from google.appengine.api import users

class MainPage(webapp2.RequestHandler):
    def get(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        main_page_path = LOCAL_PATH + "/tasks.html"
        self.response.out.write(file(main_page_path, 'r').read())

app = webapp2.WSGIApplication([('/', MainPage)],
                              debug=True)
