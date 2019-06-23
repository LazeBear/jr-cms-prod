# jr-cms-prod

## For development
You need to add a `env.json` file to your root directory, with the following content
```
{
  "default": {
    "DB_HOST": "127.0.0.1",
    "DB_DATABASE": "jr-cms-prd",
    "DB_PORT": 27017,
    "JWT_KEY": "secret",
    "S3_ID": "your value",
    "S3_KEY": "your key"
  },
  "test": {
    "DB_DATABASE": "jr-cms_test",
    "PORT": 3333
  },
  "stg": {
    "DB_HOST": "your host",
    "DB_PASSWORD": "your password",
    "DB_USER": "your username"
  }
}
