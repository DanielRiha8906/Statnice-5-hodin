-- vytvoření raw tabulek. Kouknutí se do dat.
CREATE TABLE "DB1".raw_world_demographics (
    raw_demographics_id SERIAL PRIMARY KEY,
    country_or_area TEXT,
    year INT,
    area TEXT,
    sex TEXT,
    age INT,
    record_type TEXT,
    reliability TEXT,
    source_year INT,
    value NUMERIC,
    value_footnotes TEXT
);

CREATE TABLE "DB1".raw_world_demographics (
    raw_demographics_id SERIAL PRIMARY KEY,
    country_or_area TEXT,
    year INT,
    area TEXT,
    sex TEXT,
    age INT,
    record_type TEXT,
    reliability TEXT,
    source_year INT,
    value NUMERIC,
    value_footnotes TEXT
);

-----------------------------------------------------------------
-- kontrola dat 
SELECT COUNT(DISTINCT country_or_area) AS country_count
FROM "DB1".raw_world_demographics;
 
--179 circa

SELECT COUNT(DISTINCT country_or_area) AS country_count
FROM "DB1".raw_world_demographics;
 
-- 213 zemí

SELECT
    year,
    COUNT(DISTINCT entity) AS country_count
FROM "DB1".raw_gdp_per_capita
GROUP BY year
ORDER BY year;

-- 1990: 199 zemí ... 2020: 213 zemí

-- zjišténí společného roku:

SELECT DISTINCT year
FROM "DB1".raw_world_demographics
ORDER BY year;

-- 2007 až 2019


-- první pokus o propojení dat přes název země:

SELECT COUNT(DISTINCT d.country_or_area) AS matched_countries
FROM "DB1".raw_world_demographics d
JOIN "DB1".raw_gdp_per_capita g
    ON TRIM(d.country_or_area) = TRIM(g.entity)
   AND d.year = g.year
WHERE d.year = 2018;

-- spárovaných 52 

-- diagnostika nespárovaných zemí:
SELECT DISTINCT
    d.country_or_area AS demographics_country
FROM "DB1".raw_world_demographics d
LEFT JOIN "DB1".raw_gdp_per_capita g
    ON TRIM(d.country_or_area) = TRIM(g.entity)
   AND d.year = g.year
WHERE d.year = 2018
  AND g.entity IS NULL
ORDER BY d.country_or_area;

SELECT DISTINCT
    d.country_or_area AS demographics_country,
    g.entity AS possible_gdp_match,
    g.code AS gdp_code
FROM "DB1".raw_world_demographics d
LEFT JOIN "DB1".raw_gdp_per_capita exact_g
    ON TRIM(d.country_or_area) = TRIM(exact_g.entity)
   AND d.year = exact_g.year
LEFT JOIN "DB1".raw_gdp_per_capita g
    ON g.year = d.year
   AND (
        g.entity ILIKE '%' || SPLIT_PART(d.country_or_area, ' ', 1) || '%'
        OR d.country_or_area ILIKE '%' || SPLIT_PART(g.entity, ' ', 1) || '%'
   )
WHERE d.year = 2018
  AND exact_g.entity IS NULL
ORDER BY d.country_or_area, g.entity;

-- z tohohle byl udělaný list, kde jsem poté ručné spojil jednotlivé země, které se nespárovaly.


--------------------------------------------------------

DROP TABLE IF EXISTS "DB1".country_name_mapping;

CREATE TABLE "DB1".country_name_mapping (
    mapping_id SERIAL PRIMARY KEY,
    demographics_name TEXT NOT NULL UNIQUE,
    gdp_name TEXT NOT NULL
);

-- vytvoření mappingu
INSERT INTO "DB1".country_name_mapping (
    demographics_name,
    gdp_name
)
SELECT DISTINCT
    TRIM(d.country_or_area),
    TRIM(g.entity)
FROM "DB1".raw_world_demographics d
JOIN "DB1".raw_gdp_per_capita g
    ON TRIM(d.country_or_area) = TRIM(g.entity)
ON CONFLICT (demographics_name) DO NOTHING;

-- vytvoření přesných mappingů 



INSERT INTO "DB1".country_name_mapping (
    demographics_name,
    gdp_name
)
VALUES
    ('China, Hong Kong SAR', 'Hong Kong'),
    ('China, Macao SAR', 'Macao'),
    ('Republic of Korea', 'South Korea'),
    ('Republic of Moldova', 'Moldova'),
    ('United Kingdom of Great Britain and Northern Ireland', 'United Kingdom'),
    ('United States of America', 'United States')
ON CONFLICT (demographics_name) DO UPDATE
SET gdp_name = EXCLUDED.gdp_name;

-- ruční doplnění mappingů pro zbytek. 

/* Åland Islands
Faroe Islands
Guadeloupe
Guernsey
Jersey
Martinique
Mayotte
Réunion
Saint-Martin (French part)
země které neměly paring

*/

-- kontrola
SELECT COUNT(DISTINCT d.country_or_area) AS matched_countries
FROM "DB1".raw_world_demographics d
JOIN "DB1".country_name_mapping m
    ON TRIM(d.country_or_area) = TRIM(m.demographics_name)
JOIN "DB1".raw_gdp_per_capita g
    ON TRIM(m.gdp_name) = TRIM(g.entity)
   AND d.year = g.year
WHERE d.year = 2018;
-- 57


SELECT DISTINCT
    d.country_or_area AS demographics_country
FROM "DB1".raw_world_demographics d
LEFT JOIN "DB1".country_name_mapping m
    ON TRIM(d.country_or_area) = TRIM(m.demographics_name)
LEFT JOIN "DB1".raw_gdp_per_capita g
    ON TRIM(m.gdp_name) = TRIM(g.entity)
   AND d.year = g.year
WHERE d.year = 2018
  AND g.entity IS NULL
ORDER BY d.country_or_area;

-- 11 nespárovaných


---------------------------------------------------------
-- Viečka

-- Populace a HDP podle země
CREATE OR REPLACE VIEW "DB1".v_country_population_gdp AS
SELECT
    c.demographics_name AS demographics_country,
    c.gdp_name AS gdp_country,
    c.country_code,
    p.year,
    SUM(p.population_count) * 1000 AS total_population_estimated,
    g.gdp_per_capita_ppp
FROM "DB1".population_demographics p
JOIN "DB1".country c
    ON p.country_id = c.country_id
JOIN "DB1".gdp_per_capita g
    ON p.country_id = g.country_id
   AND p.year = g.year
WHERE p.year = 2018
GROUP BY
    c.demographics_name,
    c.gdp_name,
    c.country_code,
    p.year,
    g.gdp_per_capita_ppp;

-- Populace podle kategorie HDP

CREATE OR REPLACE VIEW "DB1".v_population_by_gdp_category AS
SELECT
    CASE
        WHEN g.gdp_per_capita_ppp < 5000 THEN 'Low GDP'
        WHEN g.gdp_per_capita_ppp < 20000 THEN 'Medium GDP'
        WHEN g.gdp_per_capita_ppp < 50000 THEN 'High GDP'
        ELSE 'Very high GDP'
    END AS gdp_category,
    p.year,
    COUNT(DISTINCT c.country_id) AS country_count,
    SUM(p.population_count) * 1000 AS total_population_estimated,
    AVG(g.gdp_per_capita_ppp) AS avg_gdp_per_capita_ppp
FROM "DB1".population_demographics p
JOIN "DB1".country c
    ON p.country_id = c.country_id
JOIN "DB1".gdp_per_capita g
    ON p.country_id = g.country_id
   AND p.year = g.year
WHERE p.year = 2018
GROUP BY
    gdp_category,
    p.year;


-- Věkové skupiny podle HDP

CREATE OR REPLACE VIEW "DB1".v_age_group_by_gdp_category AS
SELECT
    CASE
        WHEN g.gdp_per_capita_ppp < 5000 THEN 'Low GDP'
        WHEN g.gdp_per_capita_ppp < 20000 THEN 'Medium GDP'
        WHEN g.gdp_per_capita_ppp < 50000 THEN 'High GDP'
        ELSE 'Very high GDP'
    END AS gdp_category,
    CASE
        WHEN p.age BETWEEN 0 AND 14 THEN '0-14'
        WHEN p.age BETWEEN 15 AND 64 THEN '15-64'
        ELSE '65+'
    END AS age_group,
    p.year,
    COUNT(DISTINCT c.country_id) AS country_count,
    SUM(p.population_count) * 1000 AS total_population_estimated
FROM "DB1".population_demographics p
JOIN "DB1".country c
    ON p.country_id = c.country_id
JOIN "DB1".gdp_per_capita g
    ON p.country_id = g.country_id
   AND p.year = g.year
WHERE p.year = 2018
GROUP BY
    gdp_category,
    age_group,
    p.year;

-- Podíl seniorů dle země

CREATE OR REPLACE VIEW "DB1".v_senior_share_by_country AS
SELECT
    c.demographics_name AS demographics_country,
    c.gdp_name AS gdp_country,
    c.country_code,
    p.year,
    SUM(p.population_count) * 1000 AS total_population_estimated,
    SUM(CASE WHEN p.age >= 65 THEN p.population_count ELSE 0 END) * 1000 AS senior_population_estimated,
    ROUND(
        (
            SUM(CASE WHEN p.age >= 65 THEN p.population_count ELSE 0 END)
            / NULLIF(SUM(p.population_count), 0)
        ) * 100,
        2
    ) AS senior_share_percent,
    g.gdp_per_capita_ppp
FROM "DB1".population_demographics p
JOIN "DB1".country c
    ON p.country_id = c.country_id
JOIN "DB1".gdp_per_capita g
    ON p.country_id = g.country_id
   AND p.year = g.year
WHERE p.year = 2018
GROUP BY
    c.demographics_name,
    c.gdp_name,
    c.country_code,
    p.year,
    g.gdp_per_capita_ppp;

-- detailní věková struktura dle země

CREATE OR REPLACE VIEW "DB1".v_country_age_distribution AS
SELECT
    c.demographics_name AS demographics_country,
    c.gdp_name AS gdp_country,
    c.country_code,
    p.year,
    p.age,
    p.sex,
    p.population_count * 1000 AS population_estimated,
    g.gdp_per_capita_ppp
FROM "DB1".population_demographics p
JOIN "DB1".country c
    ON p.country_id = c.country_id
JOIN "DB1".gdp_per_capita g
    ON p.country_id = g.country_id
   AND p.year = g.year
WHERE p.year = 2018;


-- kontrola view

SELECT COUNT(*) FROM "DB1".v_country_population_gdp;
SELECT COUNT(*) FROM "DB1".v_population_by_gdp_category;
SELECT COUNT(*) FROM "DB1".v_age_group_by_gdp_category;
SELECT COUNT(*) FROM "DB1".v_senior_share_by_country;
SELECT COUNT(*) FROM "DB1".v_country_age_distribution;

