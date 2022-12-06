from flask import *
from flask_restful import Api
import sys
sys.path.append("models")
from models.attractions import Attractions,Search_Attractions,Categories
from models.members import Members_Signup,Members_Auth
from flask_bcrypt import Bcrypt

app = Flask(
    __name__,
    static_folder="static",
    static_url_path="/"
)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
app.config["JSON_SORT_KEYS"]=False

api=Api(app)
bcrypt = Bcrypt(app)

api.add_resource(Attractions, "/api/attractions")
api.add_resource(Search_Attractions, "/api/attraction/<attractionId>" )
api.add_resource(Categories, "/api/categories")
api.add_resource(Members_Signup, "/api/user")
api.add_resource(Members_Auth, "/api/user/auth")

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(host = "0.0.0.0", port = 3000, debug = True)