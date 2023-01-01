from .attractions import Attractions,Search_Attractions,Categories
from .members import Members_Signup,Members_Auth,Members_information
from .booking import Booking_Schedule
from .orders import Order_Schedule,Order_Get_Schedule

def api_routes(api):
    # 旅遊景點attractions
    api.add_resource(Attractions, "/api/attractions")
    api.add_resource(Search_Attractions, "/api/attraction/<attractionId>" )
    api.add_resource(Categories, "/api/categories")

    # 會員members
    api.add_resource(Members_Signup, "/api/user")
    api.add_resource(Members_Auth, "/api/user/auth")
    api.add_resource(Members_information, "/api/user/information")

    # 預定行程booking
    api.add_resource(Booking_Schedule, "/api/booking")

    # 訂單付款orders
    api.add_resource(Order_Schedule, "/api/orders")
    api.add_resource(Order_Get_Schedule, "/api/order/<orderNumber>")