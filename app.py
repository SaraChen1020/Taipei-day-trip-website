from flask import *
from flask_restful import Api
import sys
sys.path.append("modules")
from modules.attractions import Attractions,Search_Attractions

app=Flask(
    __name__,
    static_folder="static",
    static_url_path="/"
)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))

api=Api(app)
app.secret_key="123789secret"

api.add_resource(Attractions, "/api/attractions")
api.add_resource(Search_Attractions, "/api/attraction/<attractionId>" )

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

app.run(port=3000, debug=True)