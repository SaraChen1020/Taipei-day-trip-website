from models import db_Connect
import jwt
from flask import *
from flask_restful import Resource
from flask_bcrypt import generate_password_hash, check_password_hash
from models.myconfig import configModel
from models.function import *

secret_key=configModel.jwt_key()

connection = db_Connect.dbConnect.get_connection()
cursor = connection.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS members(id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL);")
connection.commit()
cursor.close()
connection.close()

class Members_Signup(Resource):
    # 註冊會員
    def post(self):
        name=request.json["name"]
        email=request.json["email"]
        password=request.json["password"]

        name_check = valid_name(name)
        email_check = valid_email(email)
        password_check = valid_password(password)

        if name_check == None or email_check == None or password_check == None:
            response = jsonify({
                "error": True,
                "message": "註冊資料格式有誤"
            })
            response.status_code = "400"
            return response
        
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM members WHERE email = %s",[email])
            result=cursor.fetchone()

            if result == None:
                hash_password = generate_password_hash(password).decode('utf-8')
                cursor.execute("INSERT INTO members (name, email, password) VALUES (%s, %s, %s)", [name, email, hash_password])
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

        email_check = valid_email(email)
        password_check = valid_password(password)

        if  email_check == None or password_check == None:
            response = jsonify({
                "error": True,
                "message": "登入失敗，資料格式錯誤"
            })
            response.status_code = "400"
            return response
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, name, email, password FROM members WHERE email = %s",[email])
            result = cursor.fetchone()
            if result == None:
                response = jsonify({
                    "error": True,
                    "message": "登入失敗，信箱或密碼輸入錯誤"
                })
                response.status_code = "400"
                return response
            
            hash_password_check = check_password_hash(result["password"], password)
            if hash_password_check == False:
                response = jsonify({
                    "error": True,
                    "message": "登入失敗，信箱或密碼輸入錯誤"
                })
                response.status_code = "400"
                return response

            JWT_data = {
                "id": result["id"],
                "name": result["name"],
                "email": result["email"]
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