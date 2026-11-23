# EcliPsi

Plataforma PWA de descoberta, comparação e agendamento em saúde mental desenvolvida como Projeto Integrador III do curso de Análise e Desenvolvimento de Sistemas da Faculdade Senac PE.

- Site oficial: https://eclipsi.dev
- Stack: Expo, React Native, React Native Web, Expo Router, PostgreSQL/Supabase
- Hospedagem: Vercel, Render e Cloudflare

## Segurança

- WAF e Rate Limiting do Cloudflare
- CORS restrito a origens autorizadas
- JWT Bearer no backend
- RBAC por perfil (`paciente`, `medico`, `profissional`, `admin`)
- RLS e constraints no PostgreSQL/Supabase

## Execução local

```bash
cd eclipsi
npm install
cp .env.example .env
npm run web
```

Configure `EXPO_PUBLIC_API_URL` no `.env`.
