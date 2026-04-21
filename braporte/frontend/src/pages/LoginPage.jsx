import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { validarEmail } from "../utils/validation";
import "../styles/login.css";
import CountUp from '../components/effects/CountUp';
import SplitText from "../components/effects/SplitText";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({ email: "", senha: "" });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (erros.email)
      setErros((prev) => ({ ...prev, email: "" }));
  };

  const handleSenhaChange = (e) => {
    setSenha(e.target.value);
    if (erros.senha)
      setErros((prev) => ({ ...prev, senha: "" }));
  };

  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

  // Valida os campos antes de enviar o login
  const handleLogin = async (e) => {
    e.preventDefault();

    const newErros = { email: "", senha: "" };
    let valido = true;

    if (!validarEmail(email.trim())) {
      newErros.email = "E-mail inválido.";
      valido = false;
    }

    if (senha.trim().length < 6) {
      newErros.senha = "Senha deve ter no mínimo 6 caracteres.";
      valido = false;
    }



    setErros(newErros);

    if (valido) {
      try {
        const response = await api.login(email, senha);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.usuario) {
          localStorage.setItem('user', JSON.stringify(response.usuario));
        }
        navigate("/mapa");
      } catch (err) {
        console.error(err);
        alert("Erro ao realizar login");
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
            duration={1.50}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
          <p className="hero-tagline">Mapa de Segurança Urbana Colaborativo</p>

          <div className="hero-stats">
            <div className="stat">

              <CountUp
                from={0}
                to={8231}
                separator=","
                direction="up"
                duration={1}
                className="stat-number count-up-text"
                startCounting={false}
              />
              <span className="stat-label">Reportes</span>
            </div>

            <div className="stat-divider"></div>

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

            <div className="stat-divider"></div>

            <div className="stat">
              <CountUp
                from={0}
                to={89}
                separator=","
                direction="up"
                duration={1}
                className="stat-number count-up-text"
                startCounting={false}
              />
              <span className="stat-label">Cidades</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="form-container">
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

          <h2>Entrar</h2>
          <p className="form-subtitle">
            Acesse para reportar e monitorar sua cidade.
          </p>

          <form id="loginForm" noValidate onSubmit={handleLogin}>
            <div className="input-group">
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
                  autoComplete="username"
                  required
                  className={erros.email ? "has-error" : ""}
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>

              <span className="input-error" id="email-erro">
                {erros.email}
              </span>
            </div>

            <div className="input-group">
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={erros.senha ? "has-error" : ""}
                  value={senha}
                  onChange={handleSenhaChange}
                />
              </div>

              <span className="input-error" id="senha-erro">
                {erros.senha}
              </span>
            </div>



            <button type="submit" className="btn-entrar">
              Entrar
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
            </button>
          </form>

          <div className="form-footer">
            <span>Não tem conta?</span>
            <Link to="/cadastro" className="link-cadastro">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;