import configparser
config = configparser.ConfigParser()
config.read("myconfig.ini")

class ConfigModel():
    def db_connect(self):
        data = {
            "pool_name" : config["database"]["pool_name"],
            "pool_reset_session" : config["database"]["pool_reset_session"],
            "pool_size" : int(config["database"]["pool_size"]),
            "host" : config["database"]["host"],
            "port" : config["database"]["port"],
            "user" : config["database"]["user"],
            "password" : config["database"]["password"],
            "database" : config["database"]["database"]
        }
        return data
        
    def jwt_key(self):
        secret_key=config["JWT_KEY"]["secret_key"]
        return secret_key

    def tap_pay(self):
        data={
            "merchant_id" : config["TapPay"]["merchant_id"],
            "partner_key" : config["TapPay"]["partner_key"],
            "app_id" : config["TapPay"]["app_id"],
            "app_key" : config["TapPay"]["app_key"]
        }
        return data

configModel=ConfigModel()
