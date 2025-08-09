import os
import json
import mysql.connector

connectionpool = mysql.connector.pooling.MySQLConnectionPool(
  pool_name = "mysqlpool",
  pool_reset_session = True,
  pool_size = 10,
  host = "localhost",
  port = "3306",
  user = "root",
  password = "159753",
  database = "taipei_day_trip"
)

connection = connectionpool.get_connection()
cursor = connection.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS attractions(id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, category VARCHAR(20) NOT NULL, description VARCHAR(3000) NOT NULL, address VARCHAR(255) NOT NULL , transport VARCHAR(500) NOT NULL, MRT VARCHAR(20), latitude VARCHAR(50) NOT NULL, longitude VARCHAR(50) NOT NULL, images VARCHAR(2500) NOT NULL);")
cursor.close()
connection.close()

# 取得目前檔案 data.py 的資料夾路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 拼接 data 資料夾下的 taipei-attractions.json 路徑
json_path = os.path.join(BASE_DIR, "taipei-attractions.json")

with open(json_path, "r", encoding="utf-8") as data_file:
    data = json.load(data_file)
    results = data["result"]["results"]
n=1
for i in results:
    name = i["name"]
    category = i["CAT"]
    
    description = i["description"]
    address = i["address"].replace(" ", "")
    transport = i["direction"]
    mrt = i["MRT"]
    latitude = i["latitude"]
    longitude = i["longitude"]
    files = i["file"].lower().split("https")[1:-1]
    images = []
    for file in files:
        if file[-3:] == "jpg" or file[-3:] == "png":
            file="https"+file
            images.append(file)
    images_json = json.dumps(images)

    try:
        connection = connectionpool.get_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO attractions (name, category, description, address, transport, MRT, latitude, longitude, images) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", [name, category, description, address, transport, mrt, latitude, longitude, images_json])
        connection.commit()
    except:
        print("Unexpected Error: ", n )
    finally:
        cursor.close()
        connection.close()
    n+=1