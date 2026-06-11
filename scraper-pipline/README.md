🏎️ Forza Horizon 6 Data Scraper Environment
Why use this virtual environment?
This project requires third-party Python packages (requests for downloading web pages and beautifulsoup4 for reading the HTML data). Instead of installing these tools globally on your Mac—which can break your system's default Python setup or clash with other coding projects—the virtual environment (.venv) isolates them safely inside this specific folder.

When to use it?
You need to activate this environment every single time you open a new Terminal window to work on this car list project. If your terminal prompt does not show (.venv) at the beginning of the line, Python won't be able to find the tools needed to run your scraping scripts.

How to use it (Quick Commands)
Whenever you return to this project, open your terminal and run these commands in order:

1. Navigate to your project folder
Bash
cd ~/Documents/your-project-folder-path
2. Activate the environment
Bash
source .venv/bin/activate
(Your terminal prompt will now look like this: (.venv) user@macbook...)

3. Run your scripts
Bash
python test_scrape.py
4. Deactivate (When you are completely finished)
If you want to leave the environment and return your terminal to normal, just type:

Bash
deactivate
Troubleshooting & Maintenance
"ModuleNotFoundError: No module named 'requests'"

Fix: You forgot to activate the environment! Run source .venv/bin/activate first.

Accidentally deleted the .venv folder?

Fix: Just rebuild it by running:

Bash
python3 -m venv .venv
source .venv/bin/activate
pip install requests beautifulsoup4