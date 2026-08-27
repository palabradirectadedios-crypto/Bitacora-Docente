# Security Specification: Bitácora Psicóloga Milena

## 1. Data Invariants
1. Students (`/estudiantes/{estudianteId}`) must contain valid `id`, `nombre`, `grado`, and `createdAt`.
2. Student progress reports (`/informes_estudiantes/{informeId}`) must contain valid `id`, `estudianteId`, `fecha`, `avance`, `estado`, and `createdAt`.
3. Extra situation reports (`/informes_extra/{extraId}`) must contain valid `id`, `titulo`, `fecha`, `descripcion`, `categoria`, `participantesIds`, and `createdAt`.
4. String fields must have reasonable length constraints to prevent resource exhaustion attacks.

## 2. Dirty Dozen Payloads & Mitigation
- Oversized payload injections -> Prevented by `size()` checks on strings and lists.
- Invalid ID characters / path traversal -> Prevented by `isValidId()` regex.
- Missing required fields -> Prevented by required key checks.
- Ghost/unknown fields -> Controlled via explicit schema checks.
- Test connection probe -> Controlled read on `/test/connection`.
