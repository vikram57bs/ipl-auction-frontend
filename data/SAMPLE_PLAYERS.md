# Sample Player Data Format

This document shows the exact format your Excel file (`players.xlsx`) should follow.

## Excel Structure

**File Name**: `players.xlsx`
**Sheet**: First sheet (Sheet1)
**Header Row**: Row 1 must contain column names

## Required Columns

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| Player | Text | Player's full name | Virat Kohli |
| Age | Number | Age in years | 35 |
| Type | Text | Player role | Batsman |
| Matches | Number | Total matches played | 223 |
| Runs | Number | Total runs scored | 7263 |
| 50s | Number | Number of half-centuries | 50 |
| 100s | Number | Number of centuries | 7 |
| SR | Number | Strike rate (decimal) | 130.41 |
| Wickets | Number | Total wickets taken | 4 |
| Economy | Number | Economy rate (decimal) | 8.67 |
| BasePrice | Number (optional) | Base price in crores | 2.0 |

## Player Role Types

Use one of these exact values for the `Type` column:
- `Batsman`
- `Bowler`
- `All-Rounder`
- `Wicket-Keeper`

## Sample Data Rows

Here are 10 sample players you can use:

### Sample Excel Data

| Player | Age | Type | Matches | Runs | 50s | 100s | SR | Wickets | Economy | BasePrice |
|--------|-----|------|---------|------|-----|------|----|---------|---------|-----------|
| Virat Kohli | 35 | Batsman | 223 | 7263 | 50 | 7 | 130.41 | 4 | 8.67 | 2.0 |
| Rohit Sharma | 36 | Batsman | 243 | 6628 | 42 | 5 | 140.35 | 15 | 8.90 | 2.0 |
| Jasprit Bumrah | 30 | Bowler | 133 | 56 | 0 | 0 | 112.00 | 165 | 7.39 | 2.0 |
| Hardik Pandya | 30 | All-Rounder | 113 | 2525 | 16 | 0 | 143.55 | 69 | 9.04 | 1.8 |
| MS Dhoni | 42 | Wicket-Keeper | 264 | 5082 | 24 | 0 | 135.92 | 0 | 0.00 | 1.5 |
| Ravindra Jadeja | 35 | All-Rounder | 240 | 2756 | 13 | 0 | 127.46 | 156 | 7.68 | 1.5 |
| Yuzvendra Chahal | 34 | Bowler | 159 | 110 | 0 | 0 | 105.77 | 205 | 8.24 | 1.2 |
| Shikhar Dhawan | 38 | Batsman | 222 | 6769 | 51 | 2 | 127.71 | 3 | 10.50 | 1.0 |
| Suryakumar Yadav | 33 | Batsman | 143 | 3473 | 22 | 2 | 144.71 | 0 | 0.00 | 1.5 |
| Rashid Khan | 26 | Bowler | 119 | 403 | 0 | 0 | 126.33 | 159 | 6.98 | 1.8 |

## Important Notes

1. **Header Row**: First row MUST contain column names exactly as shown
2. **Case Sensitive**: Column names are case-sensitive (use exact capitalization)
3. **No Empty Cells**: Fill all cells with data (use 0 for zero values)
4. **Decimal Numbers**: Use decimal point (.) not comma (,) for decimals
5. **BasePrice**: Optional column; defaults to 1.0 if not provided
6. **Player Names**: Can include spaces and special characters
7. **No Duplicates**: Each player name should be unique

## Creating Your Excel File

### Option 1: Copy Sample Data
1. Copy the table above
2. Paste into Excel
3. Save as `players.xlsx`
4. Place in `data/` directory

### Option 2: Manual Entry
1. Create new Excel file
2. Add column headers in Row 1
3. Fill in player data starting from Row 2
4. Save as `players.xlsx`
5. Place in `data/` directory

### Option 3: Export from Existing Data
1. Export your player database to CSV
2. Open in Excel
3. Ensure columns match the format
4. Rename columns if needed
5. Save as `players.xlsx`
6. Place in `data/` directory

## Validation Tips

Before running the seed script, verify:

- [ ] File is named exactly `players.xlsx`
- [ ] File is in `data/` directory
- [ ] First row contains column headers
- [ ] Column names match exactly (case-sensitive)
- [ ] All numeric columns contain numbers
- [ ] Type column uses valid role types
- [ ] No empty cells (use 0 for missing numbers)
- [ ] BasePrice column exists (or will default to 1.0)

## Common Errors

### "Excel file not found"
- **Cause**: File not in `data/` directory or wrong name
- **Fix**: Ensure file is named `players.xlsx` and in correct location

### "Error importing player X"
- **Cause**: Missing or invalid data in row
- **Fix**: Check all columns have valid values for that player

### "Column not found"
- **Cause**: Column name mismatch
- **Fix**: Verify column names match exactly (including spaces, case)

### "Invalid number"
- **Cause**: Non-numeric value in numeric column
- **Fix**: Ensure all numeric columns contain only numbers

## After Import

After running `npm run seed`, you should see:
```
✓ Imported N players from Excel
```

Where N is the number of players in your Excel file.

## Updating Player Data

To update players after initial import:
1. Modify your Excel file
2. Delete the database: `rm backend/prisma/dev.db`
3. Run migrations: `npm run migrate`
4. Re-run seed: `npm run seed`

**Warning**: This will reset all auction data!

## Need More Help?

See the main README.md for complete setup instructions.
