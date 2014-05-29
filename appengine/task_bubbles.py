import Cookie
import os
import webapp2

LOCAL_PATH = os.path.dirname(__file__)

from google.appengine.api import users


class MainPage(webapp2.RequestHandler):
    def get(self):
        # First, see if the user is logged in
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
            return

        main_page_path = LOCAL_PATH + "/tasks.html"
        self.response.out.write(file(main_page_path, 'r').read())

class Logout(webapp2.RequestHandler):
    def get(self):
        dest_url = '/'
        # If on the dev appserver, just use the standard logout page.
        if os.environ.get('SERVER_SOFTWARE', '').startswith('Development/'):
            self.redirect(users.create_logout_url(dest_url))
            return

        # We're on the real site. Delete the ACSID and SACSID cookies
        cookie = Cookie.SimpleCookie()
        cookie['ACSID'] = ''
        cookie['ACSID']['expires'] = -86400  # In the past, a day ago.
        self.response.headers.add_header(*cookie.output().split(': ', 1))
        cookie = Cookie.SimpleCookie()
        cookie['SACSID'] = ''
        cookie['SACSID']['expires'] = -86400  # In the past, a day ago.
        self.response.headers.add_header(*cookie.output().split(': ', 1))
        self.redirect(dest_url)
        return

app = webapp2.WSGIApplication([('/', MainPage), ('/logout', Logout)],
                              debug=True)
