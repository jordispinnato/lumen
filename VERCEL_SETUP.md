# Vercel setup

## Variables de entorno

En Vercel, dentro de Project Settings > Environment Variables, cargar:

```text
NEXT_PUBLIC_SITE_URL=https://TU-PROYECTO.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://gutxxtoqwcuawcfungux.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGAR_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
NEXT_PUBLIC_BANK_ALIAS=lumen.pagos
NEXT_PUBLIC_BANK_CBU=0000000000000000000000
```

Por ahora Mercado Pago puede quedar vacio.

## Supabase Auth

Cuando Vercel entregue la URL, actualizar en Supabase:

- Authentication > URL Configuration > Site URL:
  `https://TU-PROYECTO.vercel.app`
- Redirect URLs:
  `https://TU-PROYECTO.vercel.app/**`

Mantener tambien para desarrollo local:

```text
http://localhost:3001/**
http://127.0.0.1:3001/**
```
