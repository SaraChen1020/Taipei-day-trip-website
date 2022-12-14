import re

def valid_name(name):
    name_check = re.match("^[\u4e00-\u9fa5_a-zA-Z0-9_]{2,20}$", name) #接受2-20中英數字及下底線
    return name_check

def valid_email(email):
    email_check = re.match("^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$", email)
    return email_check

def valid_password(password):
    password_check = re.match("^[A-Za-z\d]{6,12}$", password) #接受6-12中英數字
    return password_check

def valid_phone(phone_number):
    phone_check = re.match("^09\d{8}$", phone_number) #09開頭，共10位數字
    return phone_check