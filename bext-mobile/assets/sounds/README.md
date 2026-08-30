# Efeitos sonoros das missões

O som **está ativo**. Estes 4 arquivos são tocados pelo feedback:

| Arquivo        | Quando toca               | Placeholder atual          |
|----------------|---------------------------|----------------------------|
| `tap.wav`      | seleção de opção / botão  | clique triangular ~35 ms   |
| `correct.wav`  | resposta certa            | blip 880→1320 Hz           |
| `wrong.wav`    | resposta errada           | buzz grave ~220 ms         |
| `complete.wav` | missão concluída          | arpejo 660/880/1175 Hz     |

Os `.wav` foram gerados sinteticamente (16-bit PCM mono, 44.1 kHz). Servem para
validar o fluxo — para produção, substitua por sons melhores **mantendo os
nomes e a extensão `.wav`** (ou ajuste os `require` em
`src/missions/sound.expo-audio.ts` para `.mp3`).

## Fontes livres (checar a licença de cada arquivo)

- https://freesound.org — filtrar por licença **CC0**.
- https://kenney.nl/assets/interface-sounds — pacote CC0 de UI.
- https://mixkit.co/free-sound-effects/ — uso livre.

## Desativar o som

Remova a linha `import '@/src/missions/sound.expo-audio';` de `app/_layout.tsx`.
O haptic/vibração continua funcionando normalmente.
