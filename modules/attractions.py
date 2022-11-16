import json
import db_Connect
from flask import *
from flask_restful import Resource

# 取得景點列表資料/頁數/關鍵字
class Attractions(Resource):
    def get(self):
        try:
            keyword = request.args.get("keyword", "")
            page = int(request.args.get("page", 0))
        except:
            response = jsonify({"error": True, "message": "type error"})
            response.status_code = "500"
            response.headers["Content-Type"] = "application/json"
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response

        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(id) FROM attractions WHERE category = %s OR name LIKE %s",[keyword, f"%{keyword}%"])
            totalID = cursor.fetchone()
            cursor.execute("SELECT * FROM attractions WHERE category = %s OR name LIKE %s LIMIT %s, 12",[keyword, f"%{keyword}%", page*12])
            results = cursor.fetchall()

            data = []
            for result in results:
                data_group = {"id": result[0],
                        "name": result[1],
                        "category": result[2],
                        "description": result[3],
                        "address": result[4],
                        "transport": result[5],
                        "mrt": result[6],
                        "lat": result[7],
                        "lng": result[8],
                        "images": json.loads(result[9])
                    }
                data.append(data_group)

            if page < totalID[0]/12-1: 
                response = jsonify({
                "nextPage": page+1,
                "data": data
                })
                response.headers["Content-Type"] = "application/json"
                response.headers["Access-Control-Allow-Origin"] = "*"
                return response
            elif page >= totalID[0]//12:
                response = jsonify({
                "nextPage": None,
                "data": data
                })
                response.headers["Content-Type"] = "application/json"
                response.headers["Access-Control-Allow-Origin"] = "*"
                return response
        except:
            response = jsonify({"error": True,"message": "server error"})
            response.status_code = "500"
            response.headers["Content-Type"] = "application/json"
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
        finally:
            cursor.close()
            connection.close()

# 根據景點編號取得景點資料
class Search_Attractions(Resource):
    def get(self, attractionId):
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM attractions WHERE id = %s", [attractionId])
            result=cursor.fetchone()
            if result != None:
                response = jsonify({
                    "data": {
                        "id": result[0],
                        "name": result[1],
                        "category": result[2],
                        "description": result[3],
                        "address": result[4],
                        "transport": result[5],
                        "mrt": result[6],
                        "lat": result[7],
                        "lng": result[8],
                        "images": json.loads(result[9])
                    }
                })
                response.status_code = "200"
                response.headers["Content-Type"] = "application/json"
                response.headers["Access-Control-Allow-Origin"] = "*"
                return response
            else:
                response = jsonify({"error": True, "message": "無此景點編號"})
                response.status_code = "400"
                response.headers["Content-Type"] = "application/json"
                response.headers["Access-Control-Allow-Origin"] = "*"
                return response
        except:
            response = jsonify({"error": True,"message": "server error"})
            response.status_code = "500"
            response.headers["Content-Type"] = "application/json"
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
        finally:
            cursor.close()
            connection.close()
                
# 取得景點分類名稱列表
class Categories(Resource):
    def get(self):
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT distinct(category) FROM attractions")
            results=cursor.fetchall()

            data = []
            for result in results:
                data.append(result[0])
            
            response = jsonify({
                "data": data
            })
            response.status_code = "200"
            response.headers["Content-Type"] = "application/json"
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
        except:
            response = jsonify({"error": True, "message": "server error"})
            response.status_code = "500"
            response.headers["Content-Type"] = "application/json"
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
        finally:
            cursor.close()
            connection.close()