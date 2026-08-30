# Efeitos sonoros das missões

O som está ativo (via `expo-audio`). Estes 4 arquivos são tocados pelo feedback:

| Arquivo        | Quando toca               | Som                                        |
|----------------|---------------------------|--------------------------------------------|
| `tap.wav`      | seleção de opção / botão  | tick curto (~50 ms), bem discreto          |
| `correct.wav`  | resposta certa            | arpejo maior C5–E5–G5, tipo carrilhão      |
| `wrong.wav`    | resposta errada           | terça menor descendente E4→C4, timbre oco  |
| `complete.wav` | missão / chefão concluído | fanfarra C5–E5–G5–C6 + acorde final        |

Os `.wav` são **sintetizados** por `scripts/gen-sounds.mjs` (16-bit PCM mono,
44.1 kHz, sem dependências): envelopes ADSR, timbres aditivos tipo sino,
varredura de tom, reverb curto e normalização.

## Regenerar / ajustar

```bash
npm run sounds
```

Edite os parâmetros no fim de `scripts/gen-sounds.mjs` (notas, durações,
harmônicos, `master({ peak })`) e rode de novo.

## Substituir por sons próprios

Basta trocar os 4 arquivos mantendo os nomes e a extensão `.wav`
(ou ajustar os `require` em `src/missions/sound.expo-audio.ts` para `.mp3`).
Fontes livres: freesound.org (CC0), kenney.nl/assets/interface-sounds,
mixkit.co/free-sound-effects.

## Desativar o som

Remova a linha `import '@/src/missions/sound.expo-audio';` de `app/_layout.tsx`.
A vibração/haptic continua funcionando.
