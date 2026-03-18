# Profile Persistence Test Report

**Test Date:** 2026-03-18T03:40:57.014Z

**Test User:** persistence.test@example.com

---

## Summary

| Metric | Value |
|--------|-------|
| Total Fields Tested | 55 |
| Fields with Discrepancies | 5 |
| Success Rate | 90.91% |

❌ **DISCREPANCIES DETECTED**

## Detailed Discrepancy List

### 1. email

- **DB Field:** email
- **Type:** string
- **Input Value:** `"persistence.test@example.com"`
- **Saved Value:** `undefined`
- **Reloaded Value:** `"persistence.test@example.com"`
- ⚠️ **INPUT → SAVE ISSUE:** Expected "persistence.test@example.com", got "undefined"
- ⚠️ **SAVE → RELOAD ISSUE:** Saved "undefined", reloaded "persistence.test@example.com"

### 2. date_of_birth

- **DB Field:** date_of_birth
- **Type:** string
- **Input Value:** `"1995-03-15"`
- **Saved Value:** `"1995-03-15T05:00:00.000Z"`
- **Reloaded Value:** `"1995-03-15T05:00:00.000Z"`
- ⚠️ **INPUT → SAVE ISSUE:** Expected "1995-03-15", got "1995-03-15T05:00:00.000Z"

### 3. bust

- **DB Field:** bust_cm
- **Type:** number
- **Input Value:** `91`
- **Saved Value:** `null`
- **Reloaded Value:** `null`
- ⚠️ **INPUT → SAVE ISSUE:** Expected 91, got null

### 4. waist

- **DB Field:** waist_cm
- **Type:** number
- **Input Value:** `71`
- **Saved Value:** `null`
- **Reloaded Value:** `null`
- ⚠️ **INPUT → SAVE ISSUE:** Expected 71, got null

### 5. hips

- **DB Field:** hips_cm
- **Type:** number
- **Input Value:** `96`
- **Saved Value:** `null`
- **Reloaded Value:** `null`
- ⚠️ **INPUT → SAVE ISSUE:** Expected 96, got null

