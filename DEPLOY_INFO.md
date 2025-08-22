# 🚀 Deploy Information - NFT Collection

## Status do Projeto
✅ **Contrato compilado com sucesso**  
✅ **Wallet configurada com saldo**  
⚠️ **API Rate Limited (Error 429)**

## Dados para Deploy Manual

### Wallet Information
- **Address**: `EQDus9eZQrryQnMmaUwYL0sRl8cmtlzHxyEYPa2foS_u2t54`
- **Saldo**: ~1.09 TON (testnet)
- **Mnemonic**: `mushroom fix fetch pottery job miss width save situate real layer rather ugly victory old advance real truth draft lend flower marriage venture wet`

### Contract Information
- **Collection Address**: `EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF`
- **Code (hex)**: `b5ee9c7241010201003e000114ff00f4a413f4bcf2c80b01005ed36c2120c7009130e0ed44d0d31f01f861fa4030f862d31f30c0018e11f841a4f861f841c8cb1ff842cf16c9ed54de952a6430`
- **Data (base64)**: `te6cckEBAQEAKAAASwAAAACAHdZ68yhXXkhOZM0pgwXpYjL45NbLmPjkIwe1s/Ql/dtQSyj9fw==`
- **Deploy Value**: 0.05 TON

## Como Fazer o Deploy

### Opção 1: Aguardar API
```bash
# Aguarde 5-10 minutos e tente:
npm run deploy
```

### Opção 2: Deploy via Tonkeeper/Wallet Mobile
1. Importe a mnemonic no Tonkeeper (testnet)
2. Envie 0.05 TON para: `EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF`
3. Anexe o code+data como init

### Opção 3: TON Minter
1. Vá para https://minter.ton.org/
2. Conecte wallet com a mnemonic
3. Deploy com os dados acima

### Opção 4: Repetir Script
```bash
# Aguarde 1-2 minutos entre tentativas
node scripts/manual-deploy.js
```

## Verificação
Após deploy, verifique em:
- https://testnet.tonscan.org/address/EQAyyW7FVsRLmMVsuTCD04CyKTgdHPDH-0NqrO5-FQS5i_jF

## Comandos Úteis
```bash
# Build
npm run build

# Verificar conexão
node scripts/simple-deploy.js

# Deploy
npm run deploy
```

## Arquivos Importantes
- `build/Collection.compiled.json` - Contrato compilado
- `contracts/collection.fc` - Código fonte FunC
- `wrappers/Collection.ts` - Wrapper TypeScript
- `scripts/deploy.ts` - Script Blueprint
- `.env` - Configurações (mnemonic)