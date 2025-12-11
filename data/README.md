# Player Data Directory

Place your **players.xlsx** file in this directory.

## Expected Excel Format

The Excel file should have the following columns in the first sheet:

- `Player` - Player name (string)
- `Age` - Player age (integer)
- `Type` - Player role (e.g., "Batsman", "Bowler", "All-Rounder", "Wicket-Keeper")
- `Matches` - Number of matches played (integer)
- `Runs` - Total runs scored (integer)
- `50s` - Number of fifties (integer)
- `100s` - Number of hundreds (integer)
- `SR` - Strike rate (decimal)
- `Wickets` - Number of wickets taken (integer)
- `Economy` - Economy rate (decimal)
- `BasePrice` (optional) - Base auction price in crores (decimal, defaults to 1.0)

## Example

| Player | Age | Type | Matches | Runs | 50s | 100s | SR | Wickets | Economy | BasePrice |
|--------|-----|------|---------|------|-----|------|----|---------|---------|-----------|
| Virat Kohli | 35 | Batsman | 223 | 7263 | 50 | 7 | 130.41 | 4 | 8.67 | 2.0 |
| Jasprit Bumrah | 30 | Bowler | 133 | 56 | 0 | 0 | 112.00 | 165 | 7.39 | 2.0 |

The seed script will automatically read this file and import all players into the database.
