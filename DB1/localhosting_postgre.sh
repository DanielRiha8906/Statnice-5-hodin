sudo -iu postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
systemctl status postgresql
sudo -iu postgres psql
CREATE USER aerceas WITH PASSWORD 'your_password';
CREATE DATABASE mydb OWNER aerceas;
GRANT ALL PRIVILEGES ON DATABASE mydb TO aerceas;
\q
psql -h localhost -U aerceas -d mydb




-> pak už jenom Dbeaver setup
Host: localhost
Port: 5432
Database: mydb
Username: aerceas
Password: your_password
