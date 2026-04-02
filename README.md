# 📱 Autenticação por SMS com Firebase — Next.js

Sistema de autenticação via SMS com Firebase Phone Auth, construído com Next.js 16 e TypeScript. Conta com fluxo em etapas com barra de progresso, validação de código em tempo real, reCAPTCHA invisível e feedback visual de erros.

---

## Tecnologias

- [Next.js 16](https://nextjs.org/)
- [Firebase](https://firebase.google.com/) — Phone Authentication
- [React Icons](https://react-icons.github.io/react-icons/)
- [Zod](https://zod.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz da aplicação
│   ├── page.tsx                # Página inicial — renderiza o AuthSms
│   ├── globals.css             # Estilos globais (Tailwind)
│   └── favicon.ico             # Ícone da aba do navegador
│
├── component/
│   └── AuthSms.tsx             # Componente principal — fluxo em 3 etapas com barra de progresso
│                               # (telefone → código SMS → sucesso) e feedback visual de erros
│
├── hooks/
│   └── use-auth-sms.ts         # Hook que gerencia os estados do fluxo de autenticação
│                               # (IDLE, SENDING, AWAITING_CODE, VERIFYING, SUCCESS, ERROR)
│
├── service/
│   └── auth-sms-service.ts     # Camada de serviço: cria o reCAPTCHA invisível, envia o SMS
│                               # e valida o código. Inclui tradução dos erros do Firebase para pt-BR
│
├── lib/
│   └── firebase.js             # Inicialização do Firebase (garante instância única no Next.js)
```

---

## Fluxo de autenticação

1. Usuário informa o DDI + número de telefone
2. Firebase dispara um reCAPTCHA invisível — um desafio de segurança do Google que analisa o comportamento do usuário (movimento do mouse, tempo de interação, histórico do navegador) para distinguir humanos de bots, sem exibir nenhuma caixa de seleção ou imagem para o usuário resolver
3. SMS com código de 6 dígitos é enviado
4. Usuário digita o código
5. Firebase valida e retorna autenticação concluída

---

## Guia 1 — Criar o projeto do zero

### 1. Criar o projeto Next.js

```bash
npx create-next-app@latest authenticator-sms-firebase
```

Opções recomendadas no wizard:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**

### 2. Instalar as dependências

```bash
npm i firebase
npm i react-icons
npm i zod
```

### 3. Configurar o Firebase

#### 3.1 Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto**
3. Dê um nome ao projeto e finalize a criação
4. Na tela inicial do projeto, clique no ícone **`</>`** (Web) para registrar o app
5. Copie o objeto `firebaseConfig`

#### 3.2 Habilitar autenticação por telefone (SMS)

1. No console do Firebase, vá em **Authentication → Método de login**
2. Ative o provedor **Telefone**
3. Salve

#### 3.3 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

> As variáveis com prefixo `NEXT_PUBLIC_` ficam expostas no browser — são seguras para as chaves públicas do Firebase.

#### 3.4 Inicializar o Firebase no projeto

Crie `src/lib/firebase.js`:

```js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
```

---

## Como funciona o cadastro de celular no Firebase

O Firebase Phone Auth funciona em dois passos:

1. **Envio do código** — você chama `signInWithPhoneNumber(auth, phone, recaptchaVerifier)`. O Firebase dispara um reCAPTCHA invisível para evitar abusos e, em seguida, envia o SMS.
2. **Verificação do código** — com o retorno da primeira chamada (`confirmationResult`), você chama `confirmationResult.confirm(code)` com o código digitado pelo usuário. Se correto, o usuário fica autenticado.

```ts
// Passo 1 — enviar SMS
const confirmationResult = await signInWithPhoneNumber(auth, '+5511999990000', recaptchaVerifier);

// Passo 2 — verificar código
const userCredential = await confirmationResult.confirm('123456');
```

---

## Erro BILLING_NOT_ENABLED

O erro `BILLING_NOT_ENABLED` significa que o Firebase precisa de um plano pago para enviar SMS reais.

**Como resolver:**

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto
3. No canto inferior esquerdo clique em **Spark → Upgrade**
4. Mude para o plano **Blaze** (pay-as-you-go)

> O plano Blaze tem um free tier generoso (10 mil SMS/mês gratuitos dependendo do país), mas exige um cartão de crédito cadastrado.

**Alternativa para testar sem pagar:**

Use os números de teste do Firebase, que não enviam SMS real e não precisam de billing:

1. No console → **Authentication → Método de login → Telefone**
2. Role até **Números de telefone para teste**
3. Adicione um número fictício, ex: `+5511999990000` com código `123456`
4. Use esse número no app para testar o fluxo completo sem nenhum custo

---

## Guia 2 — Instalar o projeto do GitHub

### 1. Clonar o repositório

```bash
git clone https://github.com/laizaguedes/authenticator-sms-firebase.git
cd authenticator-sms-firebase
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie o arquivo `.env.local` na raiz com as credenciais do seu projeto Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

> Veja onde pegar essas credenciais na seção [Configurar o Firebase](#3-configurar-o-firebase) acima.

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Documentação oficial

- [Firebase Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com)
- [Next.js Docs](https://nextjs.org/docs)
