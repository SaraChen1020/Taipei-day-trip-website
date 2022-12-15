import mysql.connector
from models.myconfig import configModel

def database_connection():
    data = configModel.db_connect()
    connectionpool = mysql.connector.pooling.MySQLConnectionPool(
                        **data
    )
    return connectionpool

dbConnect=database_connection()
