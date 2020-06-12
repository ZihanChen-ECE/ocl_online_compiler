#### install the mysql
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```
config the sql with the following info
```
user: hc
password: hcpd
database: occlogin
table: accounts

# command to create the table:
CREATE TABLE accounts (username VARCHAR(100), password VARCHAR(100), email VARCHAR(100), PRIMARY KEY (username));
```


#### install the intel oneapi
follow the CLI installer


#### install nodejs and npm
sudo apt-get update
sudo apt install nodejs
sudo apt install npm

#### start the app
1. pull the git repo: 
2. node app.js
