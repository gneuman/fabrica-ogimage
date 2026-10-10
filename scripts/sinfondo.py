# Quita el fondo de una foto de persona (rembg, modelo isnet-general-use).
#   npm run sinfondo -- local/inbox/ana.png    → local/inbox/ana-sinfondo.png
# La primera vez: pip install "rembg[cpu]" (baja un modelo de ~180 MB).
import sys
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

for entrada in map(Path, sys.argv[1:]):
    salida = entrada.with_name(f'{entrada.stem}-sinfondo.png')
    remove(Image.open(entrada), session=new_session('isnet-general-use')).save(salida)
    print(salida)
