import os

def resolve_taking_head(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    out = []
    in_conflict = False
    keep = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            keep = True
            continue
        elif line.startswith('======='):
            keep = False
            continue
        elif line.startswith('>>>>>>>'):
            in_conflict = False
            keep = True
            continue
            
        if not in_conflict or keep:
            out.append(line)
            
    with open(filepath, 'w') as f:
        f.writelines(out)

files = [
    'frontend/src/index.css',
    'frontend/src/pages/TripsPage.css',
    'frontend/src/pages/MaintenancePage.css',
    'frontend/src/pages/ExpensesPage.css',
    'frontend/src/pages/LandingPage.css',
    'frontend/src/pages/ReportsPage.css',
    'frontend/src/components/Layout/Sidebar.css',
    'frontend/src/components/Layout/Topbar.css',
    'frontend/src/components/Layout/AppLayout.css',
    'frontend/package.json',
    'frontend/package-lock.json'
]

for f in files:
    if os.path.exists(f):
        resolve_taking_head(f)
        print(f"Resolved {f}")
