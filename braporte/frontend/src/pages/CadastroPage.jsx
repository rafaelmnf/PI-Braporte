import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { validarEmail, validarCPF, maskCPF } from "../utils/validation";
import "../styles/login.css";
import CountUp from "../components/effects/CountUp";
import SplitText from "../components/effects/SplitText";

const CadastroPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erros, setErros] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCpfChange = (e) => {
    setCpf(maskCPF(e.target.value));
    if (erros.cpf) setErros((prev) => ({ ...prev, cpf: "" }));
  };

  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (erros[field]) setErros((prev) => ({ ...prev, [field]: "" }));
    if (apiError) setApiError("");
  };

  const handleAnimationComplete = () => {};

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErros = {};
    let valido = true;

    if (!nome.trim()) {
      newErros.nome = "Nome é obrigatório.";
      valido = false;
    }

    if (!validarEmail(email.trim())) {
      newErros.email = "E-mail inválido.";
      valido = false;
    }

    if (!validarCPF(cpf.trim())) {
      newErros.cpf = "CPF inválido.";
      valido = false;
    }

    if (senha.trim().length < 6) {
      newErros.senha = "Senha deve ter no mínimo 6 caracteres.";
      valido = false;
    }

    if (senha !== confirmaSenha) {
      newErros.confirmaSenha = "As senhas não coincidem.";
      valido = false;
    }

    setErros(newErros);

    if (valido) {
      try {
        setIsLoading(true);
        setApiError("");
        setSuccessMsg("");

        await api.register(nome.trim(), email.trim(), cpf.trim(), senha);

        setSuccessMsg("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        console.error(err);
        setApiError(err.message || "Erro ao realizar cadastro.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-hero">
        <div className="hero-overlay"></div>
        <div className="hero-grid"></div>

        <div className="hero-content">
          <div className="hero-icon">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>

          <SplitText
            text="BRAPORTE"
            className="hero-title"
            delay={50}
            duration={1.5}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
          <p className="hero-tagline">Junte-se a nós para uma cidade melhor.</p>

          <div className="hero-stats">
            <div className="stat">
              <CountUp
                from={0}
                to={967}
                separator=","
                direction="up"
                duration={1}
                className="stat-number count-up-text"
                startCounting={false}
              />
              <span className="stat-label">Usuários</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="form-container" style={{ maxWidth: "400px" }}>
          <div className="mobile-logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#33d17a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>Braporte</span>
          </div>

          <h2>Criar Conta</h2>
          <p className="form-subtitle">
            Preencha seus dados para se cadastrar.
          </p>

          {apiError && (
            <div
              className="input-error"
              style={{
                marginBottom: "15px",
                padding: "10px",
                background: "#fff5f5",
                borderRadius: "8px",
                border: "1px solid var(--danger)",
              }}
            >
              {apiError}
            </div>
          )}
          
          {successMsg && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                background: "var(--green-glow)",
                color: "var(--green-dark)",
                borderRadius: "8px",
                border: "1px solid var(--green-primary)",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {successMsg}
            </div>
          )}

          <form id="registerForm" noValidate onSubmit={handleRegister}>
            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label htmlFor="nome">Nome Completo</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  id="nome"
                  placeholder="Seu nome"
                  required
                  className={erros.nome ? "has-error" : ""}
                  value={nome}
                  onChange={handleChange(setNome, "nome")}
                />
              </div>
              <span className="input-error">{erros.nome}</span>
            </div>

            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label htmlFor="email">E-mail</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <input
                  type="email"
                  id="email"
                  placeholder="seu@email.com"
                  required
                  className={erros.email ? "has-error" : ""}
                  value={email}
                  onChange={handleChange(setEmail, "email")}
                />
              </div>
              <span className="input-error">{erros.email}</span>
            </div>

            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label htmlFor="cpf">CPF</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M7 8h10M7 12h10M7 16h10" />
                </svg>
                <input
                  type="text"
                  id="cpf"
                  placeholder="000.000.000-00"
                  required
                  className={erros.cpf ? "has-error" : ""}
                  value={cpf}
                  onChange={handleCpfChange}
                />
              </div>
              <span className="input-error">{erros.cpf}</span>
            </div>

            <div className="input-group" style={{ marginBottom: "15px" }}>
              <label htmlFor="senha">Senha</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type="password"
                  id="senha"
                  placeholder="Mínimo 6 caracteres"
                  required
                  className={erros.senha ? "has-error" : ""}
                  value={senha}
                  onChange={handleChange(setSenha, "senha")}
                />
              </div>
              <span className="input-error">{erros.senha}</span>
            </div>

            <div className="input-group" style={{ marginBottom: "24px" }}>
              <label htmlFor="confirmaSenha">Confirmar Senha</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="password"
                  id="confirmaSenha"
                  placeholder="Repita sua senha"
                  required
                  className={erros.confirmaSenha ? "has-error" : ""}
                  value={confirmaSenha}
                  onChange={handleChange(setConfirmaSenha, "confirmaSenha")}
                />
              </div>
              <span className="input-error">{erros.confirmaSenha}</span>
            </div>

            <button
              type="submit"
              className="btn-entrar"
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
              {!isLoading && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </form>

          <div className="form-footer">
            <span>Já tem conta?</span>
            <Link to="/login" className="link-cadastro">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPage;
