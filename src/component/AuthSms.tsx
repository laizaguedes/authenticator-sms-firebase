'use client';

import { useState, useEffect } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiPhone } from 'react-icons/fi';
import { BiCheckCircle } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa6';
import { useSmsAuth } from '@/hooks/use-auth-sms';
import phoneIcon from '@/assets/phone-icon.svg';
import Image from 'next/image';
import { FaLock } from 'react-icons/fa';

type Step = 'phone' | 'code' | 'success';

export default function AuthSms() {
    const [step, setStep] = useState<Step>('phone');
    const [countryCode, setCountryCode] = useState('55');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false);

    const { status, error, startPhoneAuth, verifyCode, isLoading } = useSmsAuth();

    useEffect(() => {
        if (status === 'AWAITING_CODE') setStep('code');
        if (status === 'SUCCESS') setStep('success');
    }, [status]);

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${countryCode.replace(/\D/g, '')}${digitsOnly}`;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length <= 2) {
            value = value;
        } else if (value.length <= 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }

        setPhoneNumber(value);
    };

    const handleSendCode = async () => {
        await startPhoneAuth(fullPhone, 'recaptcha-container');
    };

    const handleVerifyCode = async () => {
        setCodeError(false);
        try {
            await verifyCode(code);
        } catch {
            setCodeError(true);
        }
    };

    const handleCodeChange = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 6);
        setCode(digits);
        if (codeError) setCodeError(false);
    };

    const stepIndex: Record<Step, number> = { phone: 0, code: 1, success: 2 };

    const codeInputClass = [
        'w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200',
        codeError
            ? 'border-red-500 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-300'
            : code.length === 6
                ? 'border-green-500 bg-green-50 text-green-700 focus:ring-2 focus:ring-green-300'
                : 'border-gray-300 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500',
    ].join(' ');

    return (
        <div className="flex items-center justify-center h-screen">
            {/* container necessário para o reCAPTCHA invisível do Firebase */}
            <div id="recaptcha-container" className="absolute opacity-0 pointer-events-none" />

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* ── Cabeçalho com barra de progresso ── */}
                <div className="bg-purple-900 px-8 py-6">
                    <h1 className="text-white text-xl font-bold text-center tracking-wide">
                        Autenticação por SMS
                    </h1>

                    <div className="flex items-center justify-center mt-5 gap-1">
                        {(['phone', 'code', 'success'] as Step[]).map((s, i) => {
                            const current = stepIndex[step];
                            const done = current > i;
                            const active = current === i;
                            return (
                                <div key={s} className="flex items-center">
                                    <div
                                        className={[
                                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                                            done
                                                ? 'bg-green-400 text-white'
                                                : active
                                                    ? 'bg-white text-indigo-600 shadow-lg scale-110'
                                                    : 'bg-indigo-400/50 text-indigo-100',
                                        ].join(' ')}
                                    >
                                        {done ? '✓' : i + 1}
                                    </div>
                                    {i < 2 && (
                                        <div
                                            className={[
                                                'w-12 h-0.5 mx-1 transition-all duration-300',
                                                done ? 'bg-green-400' : 'bg-indigo-400/40',
                                            ].join(' ')}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between mt-2 px-1">
                        <span className="text-indigo-200 text-xs">Telefone</span>
                        <span className="text-indigo-200 text-xs">Código</span>
                        <span className="text-indigo-200 text-xs">Concluído</span>
                    </div>
                </div>

                {/* ── Corpo ── */}
                <div className="px-8 py-8">

                    {/* ─── STEP 1: Telefone ─── */}
                    {step === 'phone' && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="text-5xl mb-3"> <Image className='h-15 w-full' src={phoneIcon} alt="Logo" /> </div>
                                <h2 className="text-xl font-semibold text-gray-800">Informe seu número</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Você receberá um código de verificação por SMS
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Contato:</label>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">+</span>
                                        <input
                                            type="text"
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ''))}
                                            maxLength={4}
                                            className="w-20 rounded-lg border border-slate-300 bg-slate-50 py-3 px-3 text-center text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            placeholder="(00) 00000-0000"
                                            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100"
                                        />
                                    </div>
                                    {digitsOnly.length >= 11 && (
                                        <div className="flex items-center justify-center rounded-lg bg-green-400 px-4">
                                            <span className="text-2xl text-white">✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {status === 'ERROR' && error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-start gap-2">
                                    <FiAlertTriangle className='text-amber-300' size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSendCode}
                                disabled={digitsOnly.length < 8 || isLoading}
                                className="cursor-pointer w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-700 hover:to-purple-700 disabled:from-purple-200 disabled:to-purple-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Enviando código...
                                    </span>
                                ) : (
                                    'Enviar Código →'
                                )}
                            </button>
                        </div>
                    )}

                    {/* ─── STEP 2: Código SMS ─── */}
                    {step === 'code' && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="flex flex-col items-center p-2">
                                <FaLock className="text-5xl mb-3 text-yellow-500" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Código de Verificação</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Enviamos um SMS para{' '}
                                    <strong className="text-gray-700">
                                        {countryCode} {phoneNumber}
                                    </strong>
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 text-center">
                                    Digite o código de 6 dígitos
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    className={codeInputClass}
                                    autoFocus
                                />

                                {/* feedback textual abaixo do input */}
                                <div className="h-5 text-center text-sm">
                                    {codeError && (
                                        <span className="text-red-500">
                                            ✕ Código incorreto. Verifique e tente novamente.
                                        </span>
                                    )}
                                    {!codeError && code.length === 6 && (
                                        <span className="text-green-600">
                                            ✓ Código pronto para verificar
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleVerifyCode}
                                disabled={code.length < 6 || isLoading || codeError}
                                className="cursor-pointer w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-700 hover:to-purple-700 disabled:from-purple-200 disabled:to-purple-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Verificando...
                                    </span>
                                ) : (
                                    'Finalizar'
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    setStep('phone');
                                    setCode('');
                                    setCodeError(false);
                                }}
                                className="cursor-pointer w-full py-3 rounded-xl font-semibold text-purple-600 bg-gray-100 hover:bg-purple-200 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                            >
                                <FaArrowLeft className="inline-block mr-2" /> Alterar número de telefone
                            </button>
                        </div>
                    )}

                    {/* ─── STEP 3: Sucesso ─── */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 py-4">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-30" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Autenticado com sucesso!
                                </h2>
                                <p className="text-gray-500 mt-2 text-sm">
                                    Sua identidade foi verificada via SMS.
                                </p>
                                <p className="text-purple-600 font-semibold mt-1">
                                    {countryCode} {phoneNumber}
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-left space-y-1">
                                <p className="text-green-700 font-semibold flex items-center gap-2">
                                    <BiCheckCircle className='text-green-300' /> Verificação concluída
                                </p>
                                <p className="text-green-600 text-sm">
                                    Você está autenticado e pode prosseguir normalmente.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}