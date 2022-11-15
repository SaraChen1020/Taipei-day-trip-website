import json
import db_Connect
from flask import *
from flask_restful import Resource

class Attractions(Resource):
    # 景點列表資料
    def get(self):
        page = int(request.args.get("page",0))
        keyword = request.args.get("keyword","")
        
        try:
            connection = db_Connect.dbConnect.get_connection()
            cursor = connection.cursor(buffered=True)

            cursor.execute("SELECT COUNT(id) FROM attractions")
            totalID=cursor.fetchone()
            
            cursor.execute("SELECT * FROM attractions LIMIT %s, 12", [page*12])
            results=cursor.fetchall()

            data=[]
            for result in results:
                data12 = {"id": result[0],
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
                data.append(data12)

            response = {
            "nextPage": page+1,
            "data": data
            }
            return response
        except:
            print("Unexpected Error")
        finally:
            cursor.close()
            connection.close()
