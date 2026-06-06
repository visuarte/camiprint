<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deploy workflow

Después de cada cambio importante (feature, fix, refactor), cuando el build pase y los tests estén verdes, ofrecer al usuario el comando para commit + push + Vercel:

```powershell
Set-Location -LiteralPath "C:\camiprint"
git add -A
git commit -m "<tipo>: <descripción breve>"
git push
vercel --prod
```

No ejecutar el comando, solo mostrarlo. El usuario lo pega en su terminal.
