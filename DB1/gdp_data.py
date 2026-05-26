import pandas as pd
from sqlalchemy import create_engine

DB_USER = "aerceas"
DB_PASSWORD = "toor"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "mydb"


engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

gdp = pd.read_csv("/home/aerceas/Documents/STATNICE/Příprava/db_data/gdp-per-capita-worldbank.csv")

print(gdp.columns)
print(gdp.head())

gdp = gdp.rename(columns={
    "Entity": "entity",
    "Code": "code",
    "Year": "year",
    "GDP per capita, PPP (constant 2021 international $)": "gdp_per_capita_ppp"
})

gdp.to_sql(
    "raw_gdp_per_capita",
    engine,
    schema="DB1",
    if_exists="append",
    index=False
)

print("GDP data imported successfully.")