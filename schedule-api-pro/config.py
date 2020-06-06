import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'this-really-needs-to-be-changed'
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    SECURITY_PASSWORD_HASH = 'pbkdf2_sha512'
    SECURITY_TRACKABLE = True
    SECURITY_PASSWORD_SALT = 'something_super_secret_change_in_production'
    ACCOUNT_SID = "AC049c04942475c14a74974841f62ae021" 
    AUTH_TOKEN = "43fb3b3e6dc3707d10ecbcc3c6ce5fdc"
    # SENDGRID_API_KEY="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"
    SENDGRID_API_KEY="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"
    API_KEY_ID = "euRRdsJwRF-WNUcUs_WVxg"
    S3_BUCKET = "dial-schedule-storage"
    AWS_ACCESS_KEY_ID="AKIAIYHDJTTNOHHZCAEA"
    AWS_SECRET_ACCESS_KEY= "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"


class ProductionConfig(Config):
    DEBUG = True
    DEVELOPMENT = True



class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class TestingConfig(Config):
    TESTING = True

