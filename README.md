# BlackMamba Video Editor

Editor de video minimo, rapido y no destructivo para cortar clips sin cargar un editor gigante.

## Objetivo V0

Abrir un video, reproducirlo, marcar IN/OUT, crear cortes y exportar el resultado.

## Principios

- El archivo original nunca se modifica.
- La timeline es la fuente de verdad.
- Los cortes son instrucciones, no cambios destructivos.
- Exportacion con FFmpeg.
- Copia de streams cuando sea posible para evitar recomprimir.
- Estado de sesion serializable para autosave y recuperacion.

## Flujo

```text
Video fuente
    |
    v
Preview / Playback
    |
    v
Timeline
  |- Playhead
  |- IN / OUT
  |- Cuts
  `- Segments
    |
    v
Export plan
    |
    v
FFmpeg
    |
    v
Video final
```

## Atajos iniciales

| Tecla | Accion |
|---|---|
| Space | Play / Pause |
| I | Marcar IN |
| O | Marcar OUT |
| Cmd/Ctrl + K | Crear corte |
| Delete | Eliminar segmento seleccionado |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

## Modelo de sesion

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
- [ ] Abrir MP4/MOV
- [ ] Preview
- [ ] Timeline basica
- [ ] Playhead
- [ ] IN / OUT
- [ ] Cortes
- [ ] Undo / Redo
- [ ] Export FFmpeg

### V0.1
- [ ] Thumbnails en timeline
- [ ] Waveform de audio
- [ ] Zoom de timeline
- [ ] Autosave
- [ ] Recuperacion de sesion

### Futuro
- [ ] Snap a beats
- [ ] Integracion BlackMamba Deck
- [ ] Deteccion de silencios
- [ ] Marcadores y cues
- [ ] Automatizacion desde Grimorio

## Regla central

> Primero cortamos el pinche video. Luego dejamos que el editor crezca solo cuando el flujo real lo exija.
