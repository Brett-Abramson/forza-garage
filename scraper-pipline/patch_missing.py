import os
import re
import time
import unicodedata
import pandas as pd
import requests
from bs4 import BeautifulSoup

STATS_CSV = "../prisma/scraped_car_stats.csv"
CHECKLIST_CSV = "../prisma/actual_failed_or_missing_cars.csv"

def clean_and_generate_slug(year, make, model):
    """Normalizes accents (e.g. Coupé -> Coupe) and builds the website's URL pattern."""
    full_name = f"{year} {make} {model}"
    normalized = unicodedata.normalize('NFKD', full_name).encode('ASCII', 'ignore').decode('utf-8')
    slug = normalized.lower().strip().replace(" ", "-")
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    slug = re.sub(r'-+', '-', slug)
    return f"https://forza.labsgg.com/cars/{slug}"

def scrape_car(url):
    """Fetches a car page and extracts all technical specs and performance scores."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    car_data = {}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        spec_targets = {'Drivetrain': 'Drivetrain', 'Power': 'Power', 'Torque': 'Torque', 
                        'Weight': 'Weight', 'Displacement': 'Displacement', 'Front %': 'Front'}
        for key, label_text in spec_targets.items():
            label_element = soup.find("span", class_="spec-label", string=lambda s: s and label_text in s)
            if label_element:
                val_element = label_element.find_next("span", class_="spec-value")
                if val_element:
                    car_data[key] = val_element.get_text().strip()
            if key not in car_data:
                car_data[key] = "N/A"
        
        metrics = ['SPEED', 'HANDLING', 'ACCELERATION', 'LAUNCH', 'BRAKING', 'OFFROAD']
        for metric in metrics:
            stat_label = soup.find("span", class_="stat-name", string=lambda s: s and metric in s)
            if stat_label:
                parent_row = stat_label.find_parent()
                row_text = parent_row.get_text().strip()
                match = re.search(r'(\d+\.\d+|\d+)/10', row_text)
                if match:
                    car_data[metric.capitalize()] = match.group(1)
                else:
                    car_data[metric.capitalize()] = "N/A"
            else:
                car_data[metric.capitalize()] = "N/A"
        return car_data
    except Exception as e:
        print(f"   ⚠️ Error: {e}")
        return None

def main():
    if not os.path.exists(STATS_CSV) or not os.path.exists(CHECKLIST_CSV):
        print(f"❌ Error: Missing file components in prisma folder.\nMake sure both exist:\n - {STATS_CSV}\n - {CHECKLIST_CSV}")
        return

    stats_df = pd.read_csv(STATS_CSV)
    checklist_df = pd.read_csv(CHECKLIST_CSV)

    for col in stats_df.columns:
        if col not in ['Year', 'Make', 'Model']:
            stats_df[col] = stats_df[col].astype(object)

    print("🛠️ Starting targeted data patch & accent rescue loop...")
    patches_applied = 0
    
    # Keep track of rows we successfully patch so we can delete them from the checklist later
    successful_indices = []

    for index, row in checklist_df.iterrows():
        car_name = f"{row['Year']} {row['Make']} {row['Model']}"
        manual_url = row.get('Correct_URL')
        
        if pd.notna(manual_url) and str(manual_url).strip() != "" and str(manual_url).lower() != "nan":
            url = str(manual_url).strip()
            print(f"⚡ [Manual Link] Patching: {car_name}")
        else:
            url = clean_and_generate_slug(row['Year'], row['Make'], row['Model'])
            print(f"🔮 [Auto Rescue] Trying cleaned path for: {car_name}")
        
        fresh_stats = scrape_car(url)
        
        if fresh_stats:
            if fresh_stats['Power'] == "N/A" and fresh_stats['Drivetrain'] == "N/A":
                print(f"   ℹ️ Page loaded, but contains no actual data statistics on the server side.")
                continue

            match_condition = (
                (stats_df['Year'] == row['Year']) & 
                (stats_df['Make'] == row['Make']) & 
                (stats_df['Model'] == row['Model'])
            )
            
            if match_condition.any():
                for col, val in fresh_stats.items():
                    stats_df.loc[match_condition, col] = val
                print(f"   ✅ Merged seamlessly -> HP: {fresh_stats['Power']} | Torque: {fresh_stats['Torque']}")
                patches_applied += 1
                successful_indices.append(index) # Track this row index for deletion
            else:
                print("   ⚠️ Match mapping error: Car identity not found in main database.")
        else:
            print(f"   ❌ No match at URL endpoint: {url}")
            
        time.sleep(1.5)

    if patches_applied > 0:
        # Save updated car stats data
        stats_df.to_csv(STATS_CSV, index=False)
        print(f"\n🎉 Patching complete! Applied data fixes to {patches_applied} cars inside scraped_car_stats.csv.")
        
        # --- NEW CLEANUP LOGIC ---
        # Drop the indices we successfully patched, then rewrite the checklist file
        checklist_df = checklist_df.drop(successful_indices)
        checklist_df.to_csv(CHECKLIST_CSV, index=False)
        print(f"🧹 Cleaned up checklist! Removed fixed entries from actual_failed_or_missing_cars.csv.")
    else:
        print("\nℹ️ Complete. No new data merges were applied this run.")

if __name__ == "__main__":
    maintidal
    