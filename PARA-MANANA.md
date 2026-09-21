# PARA MAÑANA — estado del portfolio al 21/09/2026 (noche)

## ✅ Hecho hoy

### Aspecto
- Fondo **negro** fijo. Quitado el botón «change the mood».
- Portadas del anillo: **todas horizontales 16:9 y del mismo tamaño**. El giro del anillo no se tocó.
- Hero sin foto. Quitado el texto «Siete piezas…».
- Al cargar, **no hay ficha de cliente** bajo el anillo.

### Clic en una tarjeta
- Pulsar una tarjeta la trae al frente y **abre debajo** texto + multimedia.
- Arrastrar sigue girando el anillo y no abre la ficha.
- Mantra y Dulce Vida abren el texto y el aviso de material pendiente (aún no tienen archivos).

### Cursor / vídeo
- Radio del efecto de agua: **95px** (antes 190px).
- Los **vídeos no llevan** el efecto de ondas. Si lo llevaban, al sacar el cursor el navegador pausaba la reproducción y con el cursor encima no se veía el vídeo.
- El cursor nativo vuelve sobre los controles del vídeo para poder pulsar play.

### Cache actual: **`?v=38`**

### Git
- Repo privado: https://github.com/miriamgarceran/miriam-garceran-portfolio
- Rama local de hoy (aún no subida): `cursor/project-cards-and-video-playback`
- `main` en GitHub sigue en el commit del fondo negro / sin mood / sin ficha.

---

## 📋 Estado Work

| Caso | Texto | Visuales | Portada |
|------|-------|----------|---------|
| Tuantojo | ✅ | ✅ vídeo + fotos + PDF | ✅ |
| Radikal World | ✅ | ✅ vídeo + fotos | ✅ |
| Mantra | ✅ | ⏳ pendiente | ⏳ tipográfica |
| Mamaluna | ✅ | ✅ vídeo | ✅ |
| Distrito 13 | ✅ | ✅ vídeo | ✅ |
| Dulce Vida | ✅ | ⏳ pendiente | ⏳ tipográfica |
| Blackout | ✅ | ✅ vídeo | ✅ |

---

## ⏳ Pendiente

1. Portadas + material de **Mantra** y **Dulce Vida**
2. Subir la rama de hoy a GitHub si Miriam quiere (`git push -u origin cursor/project-cards-and-video-playback`)
3. Revisar el anillo en móvil
4. Deploy en Vercel cuando esté más completo

---

## 🖥 Arrancar mañana

```bash
ruby -run -e httpd /Users/miriamgarceran/miriam-garceran-portfolio -p 4173
```

- Work: **http://127.0.0.1:4173/index.html?v=38#work**
- About: **http://127.0.0.1:4173/about.html?v=38**

Si el servidor no responde, matarlo y volver a arrancarlo.

---

## 💾 Backup

Escritorio: `portfolio-backup-2026-09-21.zip`
