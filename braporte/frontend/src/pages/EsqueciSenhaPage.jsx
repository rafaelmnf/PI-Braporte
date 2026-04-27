import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { validarEmail } from "../utils/validation";
import { api } from "../services/api";
import "../styles/login.css";

const EsqueciSenhaPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validarEmail(email.trim())) {
      setErro("E-mail inválido.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setStep(2);
    } catch (err) {
      setErro(err.message || "Erro ao solicitar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      const focusIndex = digits.length < 6 ? digits.length : 5;
      otpRefs[focusIndex].current.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErro("Digite o código completo.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await api.verifyOtp(email.trim(), code);
      setStep(3);
    } catch (err) {
      setErro(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    setLoading(true);
    const code = otp.join("");
    try {
      await api.resetPassword(email.trim(), code, senha);
      alert("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (err) {
      setErro(err.message || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (loading) return;
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSucesso("Código reenviado com sucesso!");
      setTimeout(() => setSucesso(""), 5000);
    } catch (err) {
      setErro(err.message || "Erro ao reenviar código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-side" style={{ flex: 1, padding: '24px' }}>
        <div className="form-container" style={{ margin: '0 auto' }}>
          
          {step === 1 && (
            <div className="step-content animate-fade-in">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
              </div>
              
              <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Esqueci a Senha</h2>
              <p className="form-subtitle" style={{ textAlign: 'center' }}>
                Digite seu e-mail para receber um código de verificação.
              </p>

              <form onSubmit={handleEmailSubmit}>
                <div className="input-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 4l-10 8L2 4" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Digite seu email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                      className={erro ? "has-error" : ""}
                    />
                  </div>
                  {erro && <span className="input-error">{erro}</span>}
                </div>

                <button type="submit" className="btn-entrar" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </form>

              <Link to="/login" className="back-to-login">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Voltar para o login
              </Link>
            </div>
          )}

          {step === 2 && (
            <div className="step-content animate-fade-in">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                </div>
              </div>

              <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Verifique seu E-mail</h2>
              <p className="form-subtitle" style={{ textAlign: 'center' }}>
                Digite o código de verificação de 6 dígitos
              </p>

              <form onSubmit={handleOtpSubmit}>
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className={`otp-input ${erro ? "has-error" : ""}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      ref={otpRefs[index]}
                    />
                  ))}
                </div>
                {erro && <span className="input-error" style={{ textAlign: 'center', display: 'block', marginBottom: '16px' }}>{erro}</span>}
                {sucesso && <span className="input-success" style={{ color: '#10b981', textAlign: 'center', display: 'block', marginBottom: '16px', fontSize: '0.875rem' }}>{sucesso}</span>}

                <button type="submit" className="btn-entrar" disabled={loading}>
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </form>

              <div className="resend-link">
                Não recebeu o código? <span onClick={handleResendCode} style={{ cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}>Reenviar código</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content animate-fade-in">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                  </svg>
                </div>
              </div>

              <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Redefinir Senha</h2>
              <p className="form-subtitle" style={{ textAlign: 'center' }}>
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="input-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type="password"
                      placeholder="Nova senha"
                      required
                      value={senha}
                      onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                      className={erro ? "has-error" : ""}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      type="password"
                      placeholder="Confirmar senha"
                      required
                      value={confirmaSenha}
                      onChange={(e) => { setConfirmaSenha(e.target.value); setErro(""); }}
                      className={erro ? "has-error" : ""}
                    />
                  </div>
                  {erro && <span className="input-error">{erro}</span>}
                </div>

                <button type="submit" className="btn-entrar" style={{ marginBottom: '12px' }} disabled={loading}>
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
                
                <button type="button" onClick={() => navigate('/login')} className="btn-entrar btn-secondary">
                  Cancelar
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EsqueciSenhaPage;
