/**
 * Parser para informes de texto de la app Fitdays (báscula Healthkeep FG2001B-A).
 * Recibe el texto copiado del PDF/app y devuelve los campos que reconoce.
 * Los campos que no encuentra se omiten (undefined), no se sobreescriben.
 */
export function parseFitdays(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  const result = {};

  // ── Peso principal ──────────────────────────────────────────────────────────
  // "Peso 145.3 (62.6-84.7) 100.0 Alto"  — NO "Peso corporal sin grasa", "Peso objetivo"
  const wm = text.match(/(?:^|[\n\r])\s*Peso\s+([\d.]+)\s*\(/m);
  if (wm) result.weight_kg = wm[1];

  // ── IMC ─────────────────────────────────────────────────────────────────────
  // "IMC\n\n43.4" o "IMC 43.4" o en tabla "43.4" justo después de "IMC"
  const bmiM = text.match(/\bIMC\b[^0-9\n]{0,10}\n?[^0-9\n]{0,5}([\d.]+)/);
  if (bmiM) result.bmi = bmiM[1];

  // ── Grasa corporal ──────────────────────────────────────────────────────────
  // "Grasa corporal 55.5 (8.9-17.8) 38.2 Alto"
  // primer número = kg masa, segundo = % proporción de peso
  const bfM = text.match(/Grasa corporal\s+([\d.]+)\s*\([^)]+\)\s*([\d.]+)/);
  if (bfM) result.body_fat_pct = bfM[2];

  // "Tasa de grasa corporal 38.2" (refuerzo si la tabla anterior no aparece)
  if (!result.body_fat_pct) {
    const bfM2 = text.match(/Tasa de grasa corporal\s+([\d.]+)/);
    if (bfM2) result.body_fat_pct = bfM2[1];
  }

  // ── Grasa subcutánea ────────────────────────────────────────────────────────
  // "Grasa subcutánea 27.2%"
  const sfM = text.match(/Grasa\s+subcutánea\s+([\d.]+)/);
  if (sfM) result.subcutaneous_fat = sfM[1];

  // ── Grasa visceral ──────────────────────────────────────────────────────────
  // "Grado de grasa visceral 20"
  const vfM = text.match(/Grado de grasa visceral\s+([\d]+)/);
  if (vfM) result.visceral_fat = vfM[1];

  // ── Masa muscular (kg) ──────────────────────────────────────────────────────
  // "Masa muscular 84.0 (50.1-62.5) 57.7 Excelente"
  const mmM = text.match(/Masa muscular\s+([\d.]+)\s*\(/);
  if (mmM) result.muscle_mass = mmM[1];

  // ── Músculo esquelético % ───────────────────────────────────────────────────
  // "Músculo esquelético 52.3 (31.7-38.7) 36.0 Excelente"
  // primer número = kg, segundo = % proporción de peso
  const smM = text.match(/[Mm][úu]sculo\s+esquel[eé]tico\s+([\d.]+)\s*\([^)]+\)\s*([\d.]+)/);
  if (smM) result.skeletal_muscle_pct = smM[2];

  // ── Masa ósea (kg) ─────────────────────────────────────────────────────────
  // "Masa Esquelética 6.0 (3.6-4.5) 4.1 Excelente"
  const boneM = text.match(/Masa\s+Esquel[eé]tica\s+([\d.]+)\s*\(/);
  if (boneM) result.bone_mass = boneM[1];

  // ── Agua corporal % ─────────────────────────────────────────────────────────
  // "Contenido de agua 66.0 (39.4-49.1) 45.4 Excelente"
  const bwM = text.match(/Contenido de agua\s+([\d.]+)\s*\([^)]+\)\s*([\d.]+)/);
  if (bwM) result.body_water_pct = bwM[2];

  // ── Proteína % ──────────────────────────────────────────────────────────────
  // "Cantidad de proteína 18.0 (10.7-13.4) 12.4 Excelente"
  const prM = text.match(/Cantidad de prote[íi]na\s+([\d.]+)\s*\([^)]+\)\s*([\d.]+)/);
  if (prM) result.protein_pct = prM[2];

  // ── Tasa metabólica basal (kcal) ────────────────────────────────────────────
  // "Tasa metabólica basal 2331kcal"
  const bmrM = text.match(/Tasa\s+metab[oó]lica\s+basal\s+([\d]+)\s*kcal/);
  if (bmrM) result.bmr = bmrM[1];

  // ── Peso libre de grasa (kg) ────────────────────────────────────────────────
  // "Peso corporal sin grasa 90.0kg"
  const ffM = text.match(/Peso\s+corporal\s+sin\s+grasa\s+([\d.]+)\s*kg/);
  if (ffM) result.fat_free_weight = ffM[1];

  // ── Edad corporal ───────────────────────────────────────────────────────────
  // "Edad corporal 43"
  const baM = text.match(/Edad\s+corporal\s+([\d]+)/);
  if (baM) result.body_age = baM[1];

  return result;
}

export function countExtracted(parsed) {
  return Object.keys(parsed).filter(k => parsed[k] !== undefined && parsed[k] !== '').length;
}
