from models import db_Connect
import jwt
from datetime import *
from flask import *
from flask_restful import Resource
from models.myconfig import configModel

secret_key=configModel.jwt_key()

connection = db_Connect.dbConnect.get_connection()
cursor = connection.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS booking(id BIGINT PRIMARY KEY AUTO_INCREMENT, attraction_id BIGINT NOT NULL, member_id BIGINT NOT NULL, date DATE NOT NULL, time VARCHAR(255) NOT NULL, price BIGINT NOT NULL, FOREIGN KEY (attraction_id) REFERENCES attractions (id), FOREIGN KEY (member_id) REFERENCES members (id));")
cursor.close()
connection.close()

class Booking_Schedule(Resource):
    # 建立新的預定行程
    def post(self):
        attraction_id = request.json["attractionId"]
        date = request.json["date"]
        time = request.json["time"]
        price = request.json["price"]

        JWT_cookies = request.cookies.get("token")
        if JWT_cookies == None:
            response = jsonify({
                "error": True,
                "message": "請登入系統"
            })
            response.status_code = "403"
            return response
        if date == "":
            response = jsonify({
                "error": True,
                "message": "請選擇預約日期"
            })
            response.status_code = "400"
            return response

        tz = timezone(timedelta(hours=+8))
        taiwan_now = datetime.now(tz)
        today = taiwan_now.year + taiwan_now.month + taiwan_now.day
        select_date=int(date[0:4])+int(date[5:7])+int(date[8:10])
        now_time = taiwan_now.hour
        select_time = 9
        if time == "afternoon":
            select_time = 14
            
        if select_date < today:
            response = jsonify({
                "error": True,
                "message": "無法預約過去的日期"
            })
            response.status_code = "400"
            return response
        
        elif select_date == today and now_time >= select_time:
            response = jsonify({
                "error": True,
                "message": "目前時間已超過該預約時段，請選擇其他時段或日期"
            })
            response.status_code = "400"
            return response
        
        decoded_jwt = jwt.decode(JWT_cookies, secret_key, algorithms="HS256")
        member_id = decoded_jwt["id"]
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM booking WHERE member_id = %s AND date = %s AND time = %s", [member_id, date, time])
            result = cursor.fetchone()
            if result != None:
                response = jsonify({
                    "error": True,
                    "message": "此日期時間已有待預定的行程尚未付款"
                })
                response.status_code = "400"
                return response

            cursor.execute("INSERT INTO booking (attraction_id, member_id, date, time, price) VALUES (%s, %s, %s, %s, %s)", [attraction_id, member_id, date, time, price])
            connection.commit()
            response = jsonify({"ok":True})
            return response
        except:
            response = jsonify({
                "error": True,
                "message":"server error"
            })
            response.status_code = "500"
            return response
        finally:
            cursor.close()
            connection.close()

    # 尚未確認下單的預定行程
    def get(self):
        JWT_cookies = request.cookies.get("token")
        if JWT_cookies == None:
            response = jsonify({
                "error": True,
                "message": "未登入系統，拒絕存取"
            })
            response.status_code = "403"
            return response

        decoded_jwt = jwt.decode(JWT_cookies, secret_key, algorithms="HS256")
        member_id = decoded_jwt["id"]
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT booking.attraction_id, booking.date, booking.time, booking.price, attractions.name, attractions.address, attractions.images FROM booking INNER JOIN attractions ON booking.attraction_id=attractions.id WHERE booking.member_id=%s", [member_id])
            result=cursor.fetchall()
            if result != []:
                data = []
                for i in result:
                    data_group = {
                            "attraction":{
                                "id": i["attraction_id"],
                                "name": i["name"],
                                "address": i["address"],
                                "image": json.loads(i["images"])[0]
                            },
                            "date": str(i["date"]),
                            "time": i["time"],
                            "price": i["price"]
                    }
                    data.append(data_group)    
                    
                response = jsonify({
                    "data": data
                })
                return response
            response = jsonify({"data": None})
            return response
        except:
            response = jsonify({"error": True,"message": "server error"})
            response.status_code = "500"
            return response
        finally:
            cursor.close()
            connection.close()
    
    # 刪除預定行程
    def delete(self):
        JWT_cookies = request.cookies.get("token")
        if JWT_cookies == None:
            response = jsonify({
                "error": True,
                "message": "未登入系統，拒絕存取"
            })
            response.status_code = "403"
            return response

        attraction_id = request.json["attractionId"]
        date = request.json["date"]
        time = request.json["time"]
        decoded_jwt = jwt.decode(JWT_cookies, secret_key, algorithms="HS256")
        member_id = decoded_jwt["id"]
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("DELETE FROM booking WHERE member_id = %s AND attraction_id = %s AND date = %s AND time = %s", [member_id, attraction_id, date, time])
            connection.commit()
            response = jsonify({"ok":True})
            return response
        except:
            response = jsonify({
                "error": True,
                "message":"server error"
            })
            response.status_code = "500"
            return response
        finally:
            cursor.close()
            connection.close()