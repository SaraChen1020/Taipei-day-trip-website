import mysql.connector
from mysql.connector import pooling

def database_connection():
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
    return connectionpool

dbConnect=database_connection()