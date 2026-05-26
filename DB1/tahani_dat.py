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

population = pd.read_csv("/home/aerceas/Documents/STATNICE/Příprava/db_data/world_demographics.csv")

population = population.rename(columns={
    "Country or area": "country_or_area",
    "Year": "year",
    "Area": "area",
    "Sex": "sex",
    "Age": "age",
    "Record Type": "record_type",
    "Reliability": "reliability",
    "Source Year": "source_year",
    "Value": "value",
    "Value Footnotes": "value_footnotes"
})

# Zahodíme původní Id z CSV
population = population.drop(columns=["Id"])

population.to_sql(
    "raw_world_demographics",
    engine,
    schema="DB1",
    if_exists="append",
    index=False
)

print("Population data imported successfully.")