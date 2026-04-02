import { ApplicationVerifier, ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber, User } from "firebase/auth";
import { auth } from "../lib/firebase";

// 1. Defina o objeto com as traduções
const FIREBASE_ERRORS: Record<string, string> = {
  'auth/container-not-found': 'Container não encontrado.',
  'auth/invalid-app-credential': 'Credencial do aplicativo inválida.',
  'auth/operation-not-allowed': 'Operação não permitida. Contate o suporte.',
  'auth/invalid-phone-number': 'Número de telefone inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/quota-exceeded': 'Cota de SMS excedida. Tente novamente mais tarde.',
  'auth/captcha-check-failed': 'Verificação falhou. Tente novamente.',
  'auth/invalid-verification-code': 'Código de verificação inválido.',
  'auth/code-expired': 'Código expirado. Solicite um novo.',
  'auth/session-expired': 'Sessão expirada. Solicite um novo código.',
  'auth/user-disabled': 'Usuário desabilitado. Contate o suporte.',
};

// 2. Crie a função que traduz o código vindo do Firebase
export const getAuthErrorMessage = (code: string): string => {
  return FIREBASE_ERRORS[code] || 'Ocorreu um erro inesperado. Tente novamente.';
};

export const AuthService = {
  // Cria o verificador e retorna para quem precisar
  async createRecaptcha(containerId: string): Promise<ApplicationVerifier | null> {
    if (typeof window === "undefined") return null;
    
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible'
    });
  },

  // Faz a ponte com o Firebase para enviar o SMS
  async requestSmsCode(phoneNumber: string, verifier: ApplicationVerifier): Promise<ConfirmationResult> {
    // Limpa o telefone
    phoneNumber = phoneNumber.replace(/\D/g, '');
    phoneNumber = `+${phoneNumber}`;

    try {
      return await signInWithPhoneNumber(auth, phoneNumber, verifier);
    } catch (error: any) {
      console.error('[AuthService] requestSmsCode erro:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Valida o código recebido
  async validateCode(confirmationResult: ConfirmationResult, code: string): Promise<User> {
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  }
};