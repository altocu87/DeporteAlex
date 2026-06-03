CREATE TABLE IF NOT EXISTS exercise_catalog (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    muscle_group TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workouts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    date          TEXT NOT NULL,
    name          TEXT,
    duration_min  INTEGER,
    energy_level  INTEGER CHECK(energy_level BETWEEN 1 AND 5),
    sleep_quality INTEGER CHECK(sleep_quality BETWEEN 1 AND 5),
    notes         TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id          INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_catalog_id INTEGER REFERENCES exercise_catalog(id),
    exercise_name       TEXT NOT NULL,
    order_index         INTEGER DEFAULT 0,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sets (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number          INTEGER NOT NULL,
    reps                INTEGER,
    weight_kg           REAL,
    rpe                 REAL,
    created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cardio_sessions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    date           TEXT NOT NULL,
    type           TEXT NOT NULL,
    duration_min   INTEGER NOT NULL,
    distance_km    REAL,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    calories       INTEGER,
    energy_level   INTEGER CHECK(energy_level BETWEEN 1 AND 5),
    sleep_quality  INTEGER CHECK(sleep_quality BETWEEN 1 AND 5),
    notes          TEXT,
    created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS body_measurements (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT NOT NULL,
    weight_kg    REAL,
    waist_cm     REAL,
    chest_cm     REAL,
    arms_cm      REAL,
    legs_cm      REAL,
    hip_cm       REAL,
    body_fat_pct REAL,
    notes        TEXT,
    created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS body_composition (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    date                 TEXT NOT NULL,
    -- Peso y masa básica
    weight_kg            REAL,
    bmi                  REAL,
    fat_free_weight      REAL,
    -- Composición de grasa
    body_fat_pct         REAL,
    subcutaneous_fat     REAL,
    visceral_fat         INTEGER,
    -- Grasa segmentaria (%)
    seg_fat_left_arm     REAL,
    seg_fat_right_arm    REAL,
    seg_fat_left_leg     REAL,
    seg_fat_right_leg    REAL,
    seg_fat_trunk        REAL,
    -- Músculo y hueso
    muscle_mass          REAL,
    skeletal_muscle_pct  REAL,
    bone_mass            REAL,
    -- Músculo segmentario (%)
    seg_muscle_left_arm  REAL,
    seg_muscle_right_arm REAL,
    seg_muscle_left_leg  REAL,
    seg_muscle_right_leg REAL,
    seg_muscle_trunk     REAL,
    -- Fluidos y metabolismo
    body_water_pct       REAL,
    bmr                  INTEGER,
    protein_pct          REAL,
    -- Métricas estadísticas
    body_age             INTEGER,
    notes                TEXT,
    created_at           TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_cardio_date ON cardio_sessions(date);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON body_measurements(date);
CREATE INDEX IF NOT EXISTS idx_composition_date ON body_composition(date);
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
