from flask import *
from flask_restful import Api
from api.routes import api_routes
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config.update(RESTFUL_JSON=dict(ensure_ascii=False))
app.config["JSON_SORT_KEYS"]=False

api=Api(app)
bcrypt = Bcrypt(app)
api_routes(api)

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
@app.route("/order/<orderNumber>")
def order(orderNumber):
	return render_template("order.html")
@app.route("/member")
def member():
	return render_template("member.html")

app.run(host = "0.0.0.0", port = 3000, debug=True)