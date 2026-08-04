import os
import re

pattern1 = re.compile(r"`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'`\}/`(.*?)['`]")
pattern2 = re.compile(r"`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http://localhost:4000'`\}/(.*?)['`]")

for root, _, files in os.walk('d:/my project/gstu football auction/football-frontend/'):
    if 'node_modules' in root or '.next' in root: continue
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # First, fix cases with an extra backtick like }/`path' -> }/path`
            content = pattern1.sub(r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/\1`", content)
            # Then fix cases without the extra backtick
            content = pattern2.sub(r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/\1`", content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
