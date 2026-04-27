import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { validarEmail, validarCPF, maskCPF, maskTelefone, maskCEP } from "../utils/validation";
import "../styles/login.css";
import CountUp from "../components/effects/CountUp";
import SplitText from "../components/effects/SplitText";

const CadastroPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  
  // Endereco
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [erros, setErros] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCpfChange = (e) => {
    setCpf(maskCPF(e.target.value));
    if (erros.cpf) setErros((prev) => ({ ...prev, cpf: "" }));
  };

  const handleTelefoneChange = (e) => {
    setTelefone(maskTelefone(e.target.value));
    if (erros.telefone) setErros((prev) => ({ ...prev, telefone: "" }));
  };

  const buscarCep = async (cepBuscado) => {
    const cepNumeros = cepBuscado.replace(/\D/g, "");
    if (cepNumeros.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setRua(data.logradouro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
          if (erros.rua || erros.cidade || erros.estado) {
            setErros((prev) => ({ ...prev, rua: "", cidade: "", estado: "" }));
          }
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleCEPChange = (e) => {
    const novoCep = maskCEP(e.target.value);
    setCep(novoCep);
    if (erros.cep) setErros((prev) => ({ ...prev, cep: "" }));
    if (novoCep.replace(/\D/g, "").length === 8) {
      buscarCep(novoCep);
    }
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

    if (telefone.replace(/\D/g, "").length < 10) {
      newErros.telefone = "Telefone inválido.";
      valido = false;
    }

    if (cep.replace(/\D/g, "").length < 8) {
      newErros.cep = "CEP inválido.";
      valido = false;
    }
    if (!rua.trim()) { newErros.rua = "Rua é obrigatória."; valido = false; }
    if (!numero.trim()) { newErros.numero = "Número é obrigatório."; valido = false; }
    if (!cidade.trim()) { newErros.cidade = "Cidade é obrigatória."; valido = false; }
    if (!estado.trim()) { newErros.estado = "Estado é obrigatório."; valido = false; }

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

        await api.register(
            nome.trim(), 
            email.trim(), 
            cpf.trim(), 
            senha,
            telefone.trim(),
            cep.trim(),
            rua.trim(),
            numero.trim(),
            complemento.trim(),
            cidade.trim(),
            estado.trim()
        );

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
        <div className="form-container" style={{ maxWidth: "500px" }}>
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
            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                <label htmlFor="nome">Nome Completo</label>
                <div className="input-wrapper">
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

                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                <label htmlFor="cpf">CPF</label>
                <div className="input-wrapper">
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
            </div>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                <label htmlFor="email">E-mail</label>
                <div className="input-wrapper">
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

                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                <label htmlFor="telefone">Telefone</label>
                <div className="input-wrapper">
                    <input
                    type="text"
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    required
                    className={erros.telefone ? "has-error" : ""}
                    value={telefone}
                    onChange={handleTelefoneChange}
                    />
                </div>
                <span className="input-error">{erros.telefone}</span>
                </div>
            </div>

            <h4 style={{ margin: "10px 0", color: "#666" }}>Endereço</h4>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                    <label htmlFor="cep">CEP</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="cep"
                        placeholder="00000-000"
                        required
                        className={erros.cep ? "has-error" : ""}
                        value={cep}
                        onChange={handleCEPChange}
                        />
                    </div>
                    <span className="input-error">{erros.cep}</span>
                </div>
                <div className="input-group" style={{ marginBottom: "15px", flex: 2 }}>
                    <label htmlFor="rua">Rua</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="rua"
                        placeholder="Nome da rua"
                        required
                        className={erros.rua ? "has-error" : ""}
                        value={rua}
                        onChange={handleChange(setRua, "rua")}
                        />
                    </div>
                    <span className="input-error">{erros.rua}</span>
                </div>
            </div>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                    <label htmlFor="numero">Número</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="numero"
                        placeholder="123"
                        required
                        className={erros.numero ? "has-error" : ""}
                        value={numero}
                        onChange={handleChange(setNumero, "numero")}
                        />
                    </div>
                    <span className="input-error">{erros.numero}</span>
                </div>

                <div className="input-group" style={{ marginBottom: "15px", flex: 2 }}>
                    <label htmlFor="complemento">Complemento (Opcional)</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="complemento"
                        placeholder="Apto, Sala, etc."
                        value={complemento}
                        onChange={handleChange(setComplemento, "complemento")}
                        />
                    </div>
                </div>
            </div>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 2 }}>
                    <label htmlFor="cidade">Cidade</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="cidade"
                        placeholder="Sua cidade"
                        required
                        className={erros.cidade ? "has-error" : ""}
                        value={cidade}
                        onChange={handleChange(setCidade, "cidade")}
                        />
                    </div>
                    <span className="input-error">{erros.cidade}</span>
                </div>

                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                    <label htmlFor="estado">Estado</label>
                    <div className="input-wrapper">
                        <input
                        type="text"
                        id="estado"
                        placeholder="UF"
                        required
                        className={erros.estado ? "has-error" : ""}
                        value={estado}
                        onChange={handleChange(setEstado, "estado")}
                        />
                    </div>
                    <span className="input-error">{erros.estado}</span>
                </div>
            </div>

            <h4 style={{ margin: "10px 0", color: "#666" }}>Segurança</h4>

            <div className="form-row" style={{ display: "flex", gap: "15px" }}>
                <div className="input-group" style={{ marginBottom: "15px", flex: 1 }}>
                <label htmlFor="senha">Senha</label>
                <div className="input-wrapper">
                    <input
                    type="password"
                    id="senha"
                    placeholder="Mínimo 6"
                    required
                    className={erros.senha ? "has-error" : ""}
                    value={senha}
                    onChange={handleChange(setSenha, "senha")}
                    />
                </div>
                <span className="input-error">{erros.senha}</span>
                </div>

                <div className="input-group" style={{ marginBottom: "24px", flex: 1 }}>
                <label htmlFor="confirmaSenha">Confirmar</label>
                <div className="input-wrapper">
                    <input
                    type="password"
                    id="confirmaSenha"
                    placeholder="Repita a senha"
                    required
                    className={erros.confirmaSenha ? "has-error" : ""}
                    value={confirmaSenha}
                    onChange={handleChange(setConfirmaSenha, "confirmaSenha")}
                    />
                </div>
                <span className="input-error">{erros.confirmaSenha}</span>
                </div>
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
