import json

with open("C:/Users/WinX/Desktop/WeHelp/(C)second-stage/taipei-day-trip/data/taipei-attractions.json","r",encoding="utf-8") as data:
    data=json.load(data)
    results=data["result"]["results"]

for i in results:
    id=i["_id"]
    name=i["name"]
    category=i["CAT"]
    description=i["description"]
    address=i["address"].replace(" ", "")
    transport=i["direction"]
    MRT=i["MRT"]
    latitude=i["latitude"]
    longitude=i["longitude"]

    files=i["file"].lower().split("https")[1:-1]
    images=[]
    for file in files:
        if file[-3:] == "jpg" or file[-3:] == "png":
            file="https"+file
            images.append(file)
            