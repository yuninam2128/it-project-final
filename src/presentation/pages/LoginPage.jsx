import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { useAuth } from "../hooks/useAuth";
import { sendPasswordReset, findEmailByUsername } from "../../services/auth";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  
  // 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // 이메일 찾기 상태
  const [findUsername, setFindUsername] = useState("");
  const [findUsernameError, setFindUsernameError] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [isFinding, setIsFinding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    if (!email || !password) {
      if (!email) setEmailError("이메일을 입력해주세요.");
      if (!password) setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await signIn(email, password, keepLoggedIn);
      navigate("/home");
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/invalid-email") {
        setEmailError("유효한 이메일을 입력해주세요.");
      } else if (code === "auth/user-disabled") {
        setEmailError("비활성화된 계정입니다. 관리자에게 문의하세요.");
      } else if (code === "auth/user-not-found") {
        setEmailError("등록되지 않은 이메일입니다.");
      } else if (code === "auth/wrong-password") {
        setPasswordError("비밀번호가 올바르지 않습니다.");
      } else {
        // Global error is handled by useAuth hook
        console.error("Login error:", err);
      }
    }
  };

  // 비밀번호 재설정 핸들러
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetEmailError("");
    setResetSuccess(false);

    if (!resetEmail) {
      setResetEmailError("이메일을 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetEmailError("유효한 이메일을 입력해주세요.");
      return;
    }

    try {
      setIsSending(true);
      await sendPasswordReset(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      const code = err?.message || "";
      if (code.includes("user-not-found")) {
        setResetEmailError("등록되지 않은 이메일입니다.");
      } else if (code.includes("invalid-email")) {
        setResetEmailError("유효한 이메일을 입력해주세요.");
      } else {
        setResetEmailError("이메일 전송 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSending(false);
    }
  };

  // 이메일 찾기 핸들러
  const handleFindEmail = async (e) => {
    e.preventDefault();
    setFindUsernameError("");
    setFoundEmail("");

    if (!findUsername) {
      setFindUsernameError("사용자명을 입력해주세요.");
      return;
    }

    try {
      setIsFinding(true);
      const email = await findEmailByUsername(findUsername);
      if (email) {
        setFoundEmail(email);
      } else {
        setFindUsernameError("해당 사용자명으로 등록된 이메일을 찾을 수 없습니다.");
      }
    } catch (err) {
      setFindUsernameError(err.message || "이메일 찾기 중 오류가 발생했습니다.");
    } finally {
      setIsFinding(false);
    }
  };

  return (
    <div className="leftbackground">
      <div className="login-container">
        <div className="teamName">CosMove</div>
        <div className="logtext">로그인</div>

        <form onSubmit={handleSubmit}>
          <div className="emailin">
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="inputfield"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            />
          </div>
          {emailError && (
            <div style={{ color: 'red', fontSize: 14 }}>{emailError}</div>
          )}

          <div className="numberin">
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="inputfield"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
            />
          </div>
          {passwordError && (
            <div style={{ color: 'red', fontSize: 14 }}>{passwordError}</div>
          )}

          <div className="login-options">
            <label className="keep-logged-in">
              <input 
                type="checkbox" 
                className="checkbox" 
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
              />
              <span>로그인 유지</span>
            </label>
            <button 
              type="button" 
              className="numberfind"
              onClick={() => setShowPasswordModal(true)}
            >
              비밀번호 찾기
            </button>
          </div>

          {error && (
            <div style={{ color: 'red', fontSize: 14, marginTop: 8 }}>{error}</div>
          )}

          <button type="submit" className="LoginButton" disabled={isLoading}>
            {isLoading ? "처리 중..." : "로그인"}
          </button>

          <div className="bottom-links">
            <span
              className="signupbutton"
              onClick={() => navigate("/signup")}
            >
              회원 가입
            </span>
            <span 
              className="emailfind"
              onClick={() => setShowEmailModal(true)}
            >
              이메일 찾기
            </span>
          </div>
        </form>
      </div>

      {/* 비밀번호 찾기 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>비밀번호 찾기</h2>
            {resetSuccess ? (
              <div className="success-message">
                <p>비밀번호 재설정 링크를 이메일로 전송했습니다.</p>
                <p>이메일을 확인해주세요.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset}>
                <label>
                  이메일 주소
                  <input
                    type="email"
                    placeholder="가입하신 이메일을 입력하세요"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetEmailError("");
                    }}
                    className={resetEmailError ? "error" : ""}
                  />
                </label>
                {resetEmailError && (
                  <div className="error-message">{resetEmailError}</div>
                )}
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setResetEmail("");
                      setResetEmailError("");
                    }}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSending}
                  >
                    {isSending ? "전송 중..." : "전송"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 이메일 찾기 모달 */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => {
          setShowEmailModal(false);
          setFindUsername("");
          setFindUsernameError("");
          setFoundEmail("");
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>이메일 찾기</h2>
            {foundEmail ? (
              <div className="success-message">
                <p>등록된 이메일 주소:</p>
                <p style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>{foundEmail}</p>
                <div className="modal-buttons" style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="submit-btn"
                    onClick={() => {
                      setShowEmailModal(false);
                      setFindUsername("");
                      setFindUsernameError("");
                      setFoundEmail("");
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="info-message">
                  <p>가입 시 사용한 사용자명을 입력해주세요.</p>
                  <p>사용자명으로 등록된 이메일을 찾아드립니다.</p>
                </div>
                <form onSubmit={handleFindEmail}>
                  <label>
                    사용자명
                    <input
                      type="text"
                      placeholder="사용자명을 입력하세요"
                      value={findUsername}
                      onChange={(e) => {
                        setFindUsername(e.target.value);
                        setFindUsernameError("");
                      }}
                      className={findUsernameError ? "error" : ""}
                    />
                  </label>
                  {findUsernameError && (
                    <div className="error-message">{findUsernameError}</div>
                  )}
                  <div className="modal-buttons">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowEmailModal(false);
                        setFindUsername("");
                        setFindUsernameError("");
                        setFoundEmail("");
                      }}
                    >
                      취소
                    </button>
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={isFinding}
                    >
                      {isFinding ? "찾는 중..." : "찾기"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;