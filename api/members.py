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
class Members_information(Resource):
    # 修改會員註冊姓名
    def patch(self):
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
        member_email = decoded_jwt["email"]

        name = request.json["name"]  

        if not valid_name(name):
            response = jsonify({
                "error": True,
                "message": "姓名限制需為2~20個英數字"
            })
            response.status_code = "400"
            return response

        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("UPDATE members SET name = %s WHERE email = %s AND id = %s" , [name, member_email, member_id])
            connection.commit()

            JWT_data = {
                "id": member_id,
                "name": name,
                "email": member_email
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

    # 修改會員註冊密碼
    def put(self):
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
        member_email = decoded_jwt["email"]

        password_old = request.json["password-old"]
        password_new = request.json["password-new"]

        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT password FROM members WHERE email = %s AND id = %s",[member_email, member_id])
            result = cursor.fetchone()
            
            hash_password_check = check_password_hash(result["password"], password_old)
            if hash_password_check == False:
                response = jsonify({
                    "error": True,
                    "message": "原密碼輸入錯誤"
                })
                response.status_code = "400"
                return response

            if not valid_password(password_new):
                response = jsonify({
                    "error": True,
                    "message": "密碼長度需為6-12個字元或數字"
                })
                response.status_code = "400"
                return response

            hash_password = generate_password_hash(password_new).decode('utf-8')
        
            cursor.execute("UPDATE members SET password = %s WHERE email = %s AND id = %s" , [hash_password, member_email, member_id])
            connection.commit()

            response = jsonify({
                 "ok": True
            })
            return response

        finally:
            cursor.close()
            connection.close()

    # 取得會員資料+歷史訂單編號
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
        member_email = decoded_jwt["email"]
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM members WHERE id = %s AND email = %s" , [member_id, member_email])
            member_data = cursor.fetchone()
        
            cursor.execute("SELECT DISTINCT(order_number) FROM order_list WHERE member_id = %s", [member_id])
            order_data = cursor.fetchall()
            order = []
            for i in order_data:
                order.append(i["order_number"])

            response = jsonify({
                    "data": {
                        "id": member_data["id"],
                        "name": member_data["name"],
                        "email": member_data["email"],
                        "order": order
                    }
            })
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