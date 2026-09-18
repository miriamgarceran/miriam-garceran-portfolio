# PARA MAÑANA — estado del portfolio al 18/09/2026 (noche)

## ✅ Hecho hoy

### Cover Flow → anillo 3D de 360° (estilo etienne.studio)
Se descartó el abanico de ayer. Se analizó el DOM real de `etienne.studio` y se replicó su
modelo exacto: los proyectos no van en fila, van repartidos en una **circunferencia completa**.

Parámetros reales de la referencia, ya aplicados:

```
stage:  perspective: 1400px; overflow: hidden; flex centrado
anillo: transform-style: preserve-3d; transform: rotateX(ax) rotateY(ay)
ítem i: transform: rotateY(i × 360/n deg) translateZ(R)
```

- **7 proyectos, uno cada 360/7 = 51,43°**, todos al mismo radio del eje central
- Girar el anillo hace que cada proyecto entre de canto, pase de frente y salga de canto;
  al completar los 360° vuelve a empezar (giro infinito, sin topes)
- **El cursor inclina el anillo entero** con `rotateX` / `rotateY`, hasta ±9° en cada eje,
  con suavizado. (Ojo: NO es un desplazamiento vertical, es una inclinación. Medido en su web.)
- Arrastrar y scroll giran el anillo; al soltar encaja en el proyecto más cercano
- Flechas del teclado y clic en una tarjeta → la traen al frente por el camino más corto
- El panel de detalle de abajo se sincroniza con el proyecto que está de frente
- Las tarjetas se desvanecen al pasar de canto, y su título se oculta en cuanto dan la espalda,
  para que nunca se lea texto invertido. Se ven unas 5 a la vez, como en la referencia.
- Tamaños y proporciones distintos por tarjeta → la fila no parece una tira uniforme.
  Salen de las listas `RATIOS` y `WIDTH_SCALE` de `js/coverflow.js`. **`content.js` sin tocar.**

### Ya estaba
- Cursor con ondas de agua + mano rock-on
- `index.html` (Work) + `about.html`
- Fondo blanco, About = Bratz
- Blackout Bad Santa + Mamaluna CON INTRO

### Cache actual: **`?v=30`**

---

## 📋 Estado Work

| Caso | Texto | Visuales | Portada |
|------|-------|----------|---------|
| Tuantojo | ✅ | ✅ | ✅ |
| Radikal World | ✅ | ✅ | ✅ |
| Mantra | ✅ | ⏳ | ⏳ tipográfica |
| Mamaluna | ✅ | ✅ vídeo | ✅ |
| Distrito 13 | ✅ | ✅ vídeo | ✅ |
| Dulce Vida | ✅ | ⏳ | ⏳ tipográfica |
| Blackout | ✅ | ✅ vídeo | ✅ |

---

## ⏳ Pendiente próximas sesiones

1. **Portadas + material de Mantra y Dulce Vida** (son las dos que salen con título en vez de foto)
2. Afinar el anillo si hace falta: radio, velocidad de giro, cuántas tarjetas se ven a la vez
   (constantes `CARD_FRAC`, `DRAG_GAIN`, `FADE_AT` en `js/coverflow.js`)
3. Ajustar intensidad del agua si se quiere más suave o más líquida
4. Backup online: git ya funciona (v2.50.1). Falta decidir repo y subirlo.
5. Deploy en Vercel cuando esté más completo
6. Revisar el anillo en móvil / pantalla pequeña

---

## 🖥 Arrancar mañana

```bash
ruby -run -e httpd /Users/miriamgarceran/miriam-garceran-portfolio -p 4173
```

- Work: **http://127.0.0.1:4173/index.html?v=30#work**
- About: **http://127.0.0.1:4173/about.html?v=30**

Si el servidor devuelve respuestas vacías o `sendfile: Operation not permitted`,
matarlo y volver a arrancarlo.

---

## 💾 Backup

Escritorio: `portfolio-backup-2026-09-18.zip` (111 MB)
