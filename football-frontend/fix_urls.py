import os
import re

for root, _, files in os.walk('d:/my project/gstu football auction/football-frontend/'):
    if 'node_modules' in root or '.next' in root: continue
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Pattern matches: \`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/\`some_path' 
            # We want it to be \`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/some_path\`
            
            # Fix single quotes
            pattern_single = r"`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'\}/`(.*?)'"
            content = re.sub(pattern_single, r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/\1`", content)
            
            # Fix double quotes if any
            pattern_double = r"`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'\}/`(.*?)\""
            content = re.sub(pattern_double, r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/\1`", content)
            
            # Fix trailing quotes with no path appended
            content = content.replace("`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`")
            content = content.replace("`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`\"", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`")
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Checked {path}')
