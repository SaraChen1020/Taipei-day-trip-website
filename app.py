from flask import *
from flask_restful import Api
from api.attractions import Attractions,Search_Attractions,Categories
from api.members import Members_Signup,Members_Auth
from api.booking import Booking_Schedule
from api.orders import Order_Schedule,Order_Get_Schedule
from flask_bcrypt import Bcrypt

app = Flask(__name__)
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
api.add_resource(Booking_Schedule, "/api/booking")
api.add_resource(Order_Schedule, "/api/orders")
api.add_resource(Order_Get_Schedule, "/api/order/<orderNumber>")


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