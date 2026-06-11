import requests
from bs4 import BeautifulSoup

test_url = "https://forza.labsgg.com/cars/2016-abarth-695-biposto"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

print(f"Testing value extraction from: {test_url}...\n")

try:
    response = requests.get(test_url, headers=headers, timeout=10)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Target the Drivetrain value directly via the 'spec-item' container
        drivetrain_label = soup.find("span", class_="spec-label", string=lambda s: s and "Drivetrain" in s)
        if drivetrain_label:
            # Find the sibling span with class 'spec-value'
            drivetrain_value = drivetrain_label.find_next("span", class_="spec-value")
            if drivetrain_value:
                print(f"✅ Extracted Drivetrain: {drivetrain_value.get_text().strip()}")

        # 2. Target the Performance Stats (Speed, Handling, etc.)
        # We find the stat name, then go to its parent row container to fetch the number
        metrics = ['SPEED', 'HANDLING', 'ACCELERATION', 'LAUNCH', 'BRAKING', 'OFFROAD']
        print("\n--- Performance Metrics ---")
        
        for metric in metrics:
            stat_label = soup.find("span", class_="stat-name", string=lambda s: s and metric in s)
            if stat_label:
                # Find the parent container holding the whole row
                parent_row = stat_label.find_parent()
                # Find the text or class holding the number (e.g., 4.9) inside that row
                # Let's grab all text in the row to see if the number prints out next to it
                row_text = parent_row.get_text().strip()
                print(f"📊 Row context for {metric}: {row_text}")
                
except Exception as e:
    print(f"❌ An error occurred: {e}")