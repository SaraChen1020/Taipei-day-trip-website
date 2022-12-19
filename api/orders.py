import jwt
import requests
from models import db_Connect
from datetime import *
from flask import *
from flask_restful import Resource
from models.myconfig import configModel
from models.function import *

secret_key = configModel.jwt_key()
merchant_id = configModel.tap_pay()["merchant_id"]
partner_key = configModel.tap_pay()["partner_key"]

class Order_Schedule(Resource):
    def post(self):
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
        data = request.get_json()
        prime = data["prime"]
        order = data["order"]["trip"]
        contact_name = data["contact"]["name"]
        contact_email = data["contact"]["email"]
        contact_phone = data["contact"]["phone"]
        
        tz = timezone(timedelta(hours=+8))
        now = datetime.now(tz)
        order_number = now.strftime("%Y%m%d") + str(member_id) + now.strftime("%H%M%S")

        if not valid_name(contact_name) or not valid_email(contact_email) or not valid_phone(contact_phone):
            response = jsonify({
                "error": True,
                "message": "聯絡資訊格式有誤，請重新確認"
            })
            response.status_code = "400"
            return response

        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)            
            cursor.execute("CREATE TABLE IF NOT EXISTS order_list (id BIGINT PRIMARY KEY AUTO_INCREMENT, order_number VARCHAR(255) NOT NULL, status VARCHAR(20), member_id BIGINT NOT NULL, attraction_id BIGINT NOT NULL, order_date DATE NOT NULL, order_time VARCHAR(255) NOT NULL, order_price BIGINT NOT NULL, contact_name VARCHAR(255) NOT NULL, contact_email VARCHAR(255) NOT NULL, contact_phone VARCHAR(20) NOT NULL, FOREIGN KEY(member_id) REFERENCES members (id), FOREIGN KEY (attraction_id) REFERENCES attractions (id));")
            
            cursor.execute("SELECT price FROM booking WHERE member_id = %s", [member_id])
            results = cursor.fetchall()

            total_price = 0
            index = 0
            for i in order:
                attraction_id = i["attraction"]["id"]
                order_date = i["date"]
                order_time = i["time"]
                order_price = results[index]["price"]
                total_price += results[index]["price"]
                index += 1

                # 新增訂單至order_list資料表
                cursor.execute("INSERT INTO order_list (order_number, member_id, attraction_id, order_date, order_time, order_price, contact_name, contact_email, contact_phone) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", [order_number, member_id, attraction_id, order_date, order_time, order_price, contact_name, contact_email, contact_phone])
                connection.commit()       
            
            # 刪除booking購物車資料
            cursor.execute("DELETE FROM booking WHERE member_id = %s", [member_id])
            connection.commit()

            # TapPay金流
            url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
            headers = {
                "Content-Type": "application/json",
                "x-api-key":partner_key
            }
            data = {
                "prime": prime,
                "partner_key": partner_key,
                "merchant_id": merchant_id,
                "details": f"台北一日遊行程-訂單號碼:{order_number}",
                "amount": total_price,
                "cardholder": {
                    "phone_number": contact_phone,
                    "name": contact_name,
                    "email": contact_email,
                },
                "remember": False
            }
            tap_pay = requests.post(url, headers = headers, json = data).json()
            if tap_pay["status"] == 0:
                cursor.execute("UPDATE order_list SET status = %s WHERE order_number = %s", ["付款成功", order_number])
                connection.commit()
                response = jsonify({
                    "data": {
                        "number": order_number,
                        "payment": {"status": tap_pay["status"],
                                    "message": "付款成功"}
                    }
                })
                return response
            response = jsonify({
                "data": {
                    "number": order_number,
                    "payment": {"status": tap_pay["status"],
                                "message": "付款失敗"}
                }
            })
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