import { useRef, useState } from "react";
import { ConfirmationResult, RecaptchaVerifier, User } from "firebase/auth";
import { AuthService } from "../service/auth-sms-service";

export type AuthStatus = 'IDLE' | 'SENDING' | 'AWAITING_CODE' | 'VERIFYING' | 'SUCCESS' | 'ERROR';

export const useSmsAuth = () => {
    const [status, setStatus] = useState<AuthStatus>('IDLE');
    const [error, setError] = useState<string | null>(null);

    const confirmationResult = useRef<ConfirmationResult | null>(null);
    const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

    const startPhoneAuth = async (phoneNumber: string, containerId: string): Promise<void> => {
        setStatus('SENDING');
        setError(null);

        // Zera a ref sem chamar clear() — o verifier anterior pode estar em estado inválido
        recaptchaVerifier.current = null;

        // Substitui o elemento DOM de forma síncrona, ANTES de criar o novo verifier.
        // Isso garante que o reCAPTCHA anterior já terminou e o novo começa num elemento limpo.
        const container = document.getElementById(containerId);
        if (container?.parentElement) {
            const fresh = document.createElement('div');
            fresh.id = containerId;
            fresh.className = container.className;
            container.parentElement.replaceChild(fresh, container);
        }

        try {
            const verifier = await AuthService.createRecaptcha(containerId);
            if (!verifier) throw new Error("Falha ao inicializar o reCAPTCHA");

            recaptchaVerifier.current = verifier as RecaptchaVerifier;

            const confirmation = await AuthService.requestSmsCode(phoneNumber, verifier);
            confirmationResult.current = confirmation;
            setStatus('AWAITING_CODE');
        } catch (err: any) {
            console.error('[useSmsAuth] erro ao enviar código:', err);
            recaptchaVerifier.current = null;
            // Não mexe no DOM aqui — o reCAPTCHA pode ter callbacks ainda rodando
            setError(err.message || "Erro ao iniciar autenticação");
            setStatus('ERROR');
        }
    };

    const verifyCode = async (code: string): Promise<User | undefined> => {
        setStatus('VERIFYING');
        setError(null);

        try {
            if (!confirmationResult.current) {
                throw new Error("Nenhuma sessão de confirmação encontrada.");
            }

            const user = await AuthService.validateCode(confirmationResult.current, code);
            setStatus('SUCCESS');
            return user;
        } catch (err: any) {
            console.error('[useSmsAuth] erro ao verificar código:', err);
            setError(err.message || "Código inválido ou expirado");
            setStatus('ERROR');
            throw err;
        }
    };

    return {
        status,
        error,
        startPhoneAuth,
        verifyCode,
        isIdle: status === 'IDLE' || status === 'ERROR',
        isAwaitingCode: status === 'AWAITING_CODE',
        isLoading: status === 'SENDING' || status === 'VERIFYING'
    };
};
