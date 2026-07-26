# BlackMamba Video Editor

Editor de video mínimo, rápido y no destructivo para cortar clips sin cargar un editor gigante.

## Enfoque

**WebUI-first**: el editor corre primero en el navegador local con Vite. Tauri/Rust queda como wrapper de escritorio opcional para integrar FFmpeg, filesystem nativo y builds instalables.

```text
Browser WebUI (localhost)
        |
        v
Playback + Timeline + IN/OUT
        |
        v
Edit Decision List (EDL)
        |
        +--> Web preview
        |
        `--> Tauri/Rust bridge --> FFmpeg --> Video final
```

## Objetivo V0

Abrir un video, reproducirlo, marcar IN/OUT, crear cortes y exportar el resultado.

## Principios

- El archivo original nunca se modifica.
- La timeline es la fuente de verdad.
- Los cortes son instrucciones, no cambios destructivos.
- La UI debe funcionar en navegador local sin depender de Tauri.
- Exportación con FFmpeg cuando corre con backend local/Tauri.
- Copia de streams cuando sea posible para evitar recomprimir.
- Estado de sesión serializable para autosave y recuperación.

## Ejecutar WebUI

```bash
npm install
npm run dev
```

Abrir la URL que imprime Vite, normalmente `http://localhost:5173`.

## Ejecutar como app de escritorio

```bash
npm install
npm run tauri dev
```

## Atajos iniciales

| Tecla | Acción |
|---|---|
| Space | Play / Pause |
| I | Marcar IN |
| O | Marcar OUT |
| Cmd/Ctrl + K | Crear corte |
| Delete | Eliminar segmento seleccionado |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

## Modelo de sesión

```json
{
  "version": 1,
  "source": "video.mp4",
  "durationSeconds": 42.5,
  "inPoint": 3.2,
  "outPoint": 31.08,
  "cuts": [12.42, 18.2]
}
```

## Roadmap

### V0
- [x] WebUI local
- [x] Abrir video desde navegador
- [x] Preview
- [x] Timeline básica
- [x] Playhead
- [x] IN / OUT
- [ ] Cortes múltiples
- [ ] Undo / Redo
- [ ] Export FFmpeg

### V0.1
- [ ] Thumbnails en timeline
- [ ] Waveform de audio
- [ ] Zoom de timeline
- [ ] Autosave
- [ ] Recuperación de sesión

### Futuro
- [ ] Snap a beats
- [ ] Integración BlackMamba Deck
- [ ] Detección de silencios
- [ ] Marcadores y cues
- [ ] Automatización desde Grimorio

## Regla central

> Primero cortamos el pinche video. Luego dejamos que el editor crezca solo cuando el flujo real lo exija.
