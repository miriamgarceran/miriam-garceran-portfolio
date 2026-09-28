# PARA MAÑANA — estado del portfolio al 28/09/2026 (noche)

## ✅ Guardado

- Rama: `cursor/project-cards-and-video-playback`
- Último commit: `b4d3f76` — Unify every case with Cortijo-style AV…
- Subido a GitHub: sí (rama al día con `origin`)
- Repo: https://github.com/miriamgarceran/miriam-garceran-portfolio

### Cache actual: **`?v=69`**

---

## ✅ Hecho hoy (28/09)

### Estructura de casos (todos igual que Cortijo)
- Cabecera (lead + cliente / disciplina / año)
- **Pieza principal** a ancho completo (landscape full-bleed)
- **Tira audiovisual infinita** con el resto de archivos (fotos/vídeos)
- Textos descriptivos abajo en dos columnas + métricas en coral (si las hay)

### Tira (marquee)
- Bucle continuo sin salto al “volver al principio”
- Clona el set las veces que haga falta para cubrir el viewport
- Vídeos de la tira: muteados por defecto + botón de sonido
- Archivo: `js/marquee.js`

### Tipografía descriptiva
- Mayúsculas/minúsculas normales (sin ALL CAPS forzadas)
- Stack tipo Etienne: Neue Haas Grotesk / Helvetica Neue
- Métricas: mismos números, estructura y coral `#e8a88a`

### Cortijo
- Hero: `principal.mp4`
- Tira: `video.mp4`, `reel.mp4`, `carrusel.mp4` (H.264)
- Portada: `assets/work/covers/cortijo.jpg`
- Métricas 90 días en coral

### Piezas principales
- Landscape (Mamaluna, Tuantojo, Distrito, Blackout, Cortijo…): full-bleed como Cortijo
- Portrait (Radikal aftermovie): centrado, altura limitada (no torre negra)

### Servidor local con Range (vídeos)
- Preferir: `python3 serve.py` (puerto **4173**)
- El `ruby -run -e httpd` a veces rompe el seek de los MP4

---

## 📋 Estado Work

| Caso | Texto | Visuales | Portada |
|------|-------|----------|---------|
| Tuantojo | ✅ | ✅ spot full-bleed | ✅ |
| Radikal World | ✅ | ✅ aftermovie + tira fotos | ✅ |
| Mantra | ✅ | ⏳ pendiente | ⏳ tipográfica |
| Mamaluna | ✅ | ✅ con-intro full-bleed | ✅ |
| Distrito 13 | ✅ | ✅ scroll Instagram | ✅ |
| Dulce Vida | ✅ | ⏳ pendiente | ⏳ tipográfica |
| Blackout | ✅ | ✅ Bad Santa full-bleed | ✅ |
| El Cortijo | ✅ | ✅ principal + tira 3 vídeos + métricas | ✅ |

---

## ⏳ Pendiente

1. Portadas + material de **Mantra** y **Dulce Vida**
2. Revisar anillo / casos en **móvil**
3. Merge a `main` cuando Miriam lo diga
4. Deploy en Vercel cuando esté más completo
5. (Opcional) aftermovie landscape de Radikal si aparece una versión horizontal

---

## 🖥 Arrancar mañana

```bash
cd /Users/miriamgarceran/miriam-garceran-portfolio
python3 serve.py
```

- Work: **http://127.0.0.1:4173/index.html?v=69#work**
- About: **http://127.0.0.1:4173/about.html?v=69**

Si el puerto está ocupado:

```bash
lsof -tiTCP:4173 -sTCP:LISTEN | xargs kill
python3 serve.py
```

---

## 💬 Al reabrir el chat

Decir algo como: *“seguimos con el portfolio, lee PARA-MANANA.md”*  
o abrir la rama `cursor/project-cards-and-video-playback`.
