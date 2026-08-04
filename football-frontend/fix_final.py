import os
import re

for root, _, files in os.walk('d:/my project/gstu football auction/football-frontend/'):
    if 'node_modules' in root or '.next' in root: continue
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Fix the messed up prefix
            bad_prefix1 = "`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`}/`"
            good_prefix = "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/"
            content = content.replace(bad_prefix1, good_prefix)
            
            # There's also some with just the single bad replace
            bad_prefix2 = "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/`"
            content = content.replace(bad_prefix2, good_prefix)

            # Now fix the trailing single or double quotes
            # Pattern: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/some/path' -> .../some/path`
            pattern = re.compile(r"(`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'\}/[^'\"\`]*?)['\"]")
            content = pattern.sub(r"\1`", content)
            
            # Let's also fix the ones with no path that ended up as `${...}`'
            content = content.replace("`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`'", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`")
            content = content.replace("`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`\"", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`")
            
            if content != original_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {path}")
