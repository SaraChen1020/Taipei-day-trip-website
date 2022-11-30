import json
import db_Connect
import re
import jwt
from flask import *
from flask_restful import Resource

secret_key="secret1657952"
# connection = db_Connect.dbConnect.get_connection()
# cursor = connection.cursor()
# cursor.execute("CREATE TABLE IF NOT EXISTS members(id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL);")
# cursor.execute("INSERT INTO members (name, email, password) VALUES ('sara', 'sara@test.com', 123456);")
# connection.commit()
# cursor.close()
# connection.close()

class Members_Signup(Resource):
    # 註冊會員
    def post(self):
        name=request.json["name"]
        email=request.json["email"]
        password=request.json["password"]

        name_check = re.match("^[\u4e00-\u9fa5_a-zA-Z0-9_]{2,20}$", name) #接受2-20中英數字及下底線
        email_check = re.match("^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$", email)
        password_check = re.match("^(?=.*[A-Z])[A-Za-z\d]{6,12}$", password) #接受6-12中英數字，必須含有1個大寫字母

        if name_check == None or email_check == None or password_check == None:
            response = jsonify({
                "error": True,
                "message": "資料格式有誤"
            })
            response.status_code = "400"
            return response
        
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM members WHERE email = %s",[email])
            result=cursor.fetchone()

            if result == None:
                cursor.execute("INSERT INTO members (name, email, password) VALUES (%s, %s, %s)", [name, email, password])
                connection.commit()
                response = jsonify({"ok":True})
                return response

            response = jsonify({
                "error": True,
                "message": "信箱已重覆註冊"
            })
            response.status_code = "400"
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

class Members_Auth(Resource):
    # 登入會員
    def put(self):
        email=request.json["email"]
        password=request.json["password"]

        email_check = re.match("^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$", email)
        password_check = re.match("^(?=.*[A-Z])[A-Za-z\d]{6,12}$", password) #接受6-12中英數字，必須含有1個大寫字母

        if  email_check == None or password_check == None:
            response = jsonify({
                "error": True,
                "message": "登入失敗，資料格式有誤"
            })
            response.status_code = "400"
            return response
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT id, name, email FROM members WHERE email = %s AND password = %s",[email, password])
            result = cursor.fetchone()
            
            if result == None:
                response = jsonify({
                    "error": True,
                    "message": "登入失敗，帳號或密碼錯誤"
                })
                response.status_code = "400"
                return response

            JWT_data = {
                "id": result[0],
                "name": result[1],
                "email": result[2]
            }
            encoded_jwt = jwt.encode(JWT_data, secret_key, algorithm="HS256")
            response = make_response(jsonify({
                 "ok": True
            }))
            response.set_cookie(key = "token", value = encoded_jwt, max_age = 604800)
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
            
    # 登出會員
    def delete(self):
        response = make_response(jsonify({"ok": True}))
        response.delete_cookie("token")
        return response

    # 會員狀態
    def get(self):
        JWT_cookies = request.cookies.get("token")
        if JWT_cookies == None:
            response = jsonify({
                "data": None
            })
            return response
            
        decoded_jwt = jwt.decode(JWT_cookies, secret_key, algorithms="HS256")
        response = jsonify({
            "data":decoded_jwt
        })
        return response