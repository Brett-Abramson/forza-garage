import os
import re
import time
import unicodedata
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Paths relative to the scraper-pipeline folder
INPUT_CSV = "../prisma/fh6-cars.csv"
OUTPUT_CSV = "../prisma/scraped_car_stats.csv"
FAILURE_CSV = "../prisma/failed_scrapes.csv" # <-- Your new checklist file!

def generate_slug(row):
    """Converts Year, Make, and Model into a URL slug, normalizing special accent characters."""
    full_name = f"{row['Year']} {row['Make']} {row['Model']}"
    
    # 1. Normalize unicode characters (e.g., converts 'Coupé' to 'Coupe')
    normalized_name = unicodedata.normalize('NFKD', full_name).encode('ASCII', 'ignore').decode('utf-8')
    
    # 2. Lowercase and swap spaces for hyphens
    slug = normalized_name.lower().strip().replace(" ", "-")
    
    # 3. Strip out remaining invalid URL special characters
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    
    # 4. Collapse double hyphens
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
        
        # 1. Extract ALL Technical Specs
        spec_targets = {
            'Drivetrain': 'Drivetrain',
            'Power': 'Power',
            'Torque': 'Torque',
            'Weight': 'Weight',
            'Displacement': 'Displacement',
            'Front %': 'Front'
        }
        
        for key, label_text in spec_targets.items():
            label_element = soup.find("span", class_="spec-label", string=lambda s: s and label_text in s)
            if label_element:
                val_element = label_element.find_next("span", class_="spec-value")
                if val_element:
                    car_data[key] = val_element.get_text().strip()
            if key not in car_data:
                car_data[key] = "N/A"
        
        # 2. Extract ALL Performance Ratings
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
        print(f"   ⚠️ Error parsing page data: {e}")
        return None

def main():
    if not os.path.exists(INPUT_CSV):
        print(f"❌ Error: Cannot find master car file at target path: {INPUT_CSV}")
        return

    # Load master dataframe
    df = pd.read_csv(INPUT_CSV)
    print(f"📋 Loaded {len(df)} cars from master list. Starting data harvest...\n")
    
    scraped_rows = []
    failed_rows = []  # List to track cars that hit a 404 or failed
    
    for index, row in df.iterrows():
        car_name = f"{row['Year']} {row['Make']} {row['Model']}"
        url = generate_slug(row)
        
        print(f"🚗 [{index + 1}/{len(df)}] Processing: {car_name}")
        
        stats = scrape_car(url)
        
        if stats:
            print(f"   ✅ All Data Captured -> Drivetrain: {stats['Drivetrain']} | HP: {stats['Power']}")
            stats['Year'] = row['Year']
            stats['Make'] = row['Make']
            stats['Model'] = row['Model']
            scraped_rows.append(stats)
        else:
            print(f"   ❌ Link skipped or not found: {url}")
            # Save the exact row info and the broken URL so you can inspect it later
            failed_rows.append({
                'Year': row['Year'],
                'Make': row['Make'],
                'Model': row['Model'],
                'Attempted_URL': url
            })
            
        time.sleep(1.5)
        
    # Save successful rows
    if scraped_rows:
        print("\nWriting collected data to isolated database file...")
        output_df = pd.DataFrame(scraped_rows)
        column_order = [
            'Year', 'Make', 'Model', 
            'Drivetrain', 'Power', 'Torque', 'Weight', 'Displacement', 'Front %', 
            'Speed', 'Handling', 'Acceleration', 'Launch', 'Braking', 'Offroad'
        ]
        output_df = output_df[column_order]
        output_df.to_csv(OUTPUT_CSV, index=False)
        print(f"🎉 Success! Stats saved to: {OUTPUT_CSV}")
    
    # Save failed rows to their own file
    if failed_rows:
        failed_df = pd.DataFrame(failed_rows)
        failed_df.to_csv(FAILURE_CSV, index=False)
        print(f"⚠️ {len(failed_rows)} cars failed or were missing on the site. Checklist saved to: {FAILURE_CSV}")
    else:
        print("\n✨ Amazing! 100% of the cars were successfully scraped with zero failures.")

if __name__ == "__main__":
    main()