import React, { useState } from 'react';
import styles from "./Login.module.scss"

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const correctPassword = 'danlu2401'; // Substitua pela senha correta

  const handleLogin = () => {
    if (password === correctPassword) {
      localStorage.setItem('authenticated', 'true');
      window.location.reload(); // Recarregar a página para exibir o conteúdo desbloqueado
    } else {
      alert('Senha incorreta. Tente novamente.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Impedir que o formulário seja submetido por padrão
      handleLogin();
    }
  };

  return (
    <div className={styles.bodyArea}>
      <div className={styles.passwordArea}>
        <h2>Insira a senha para desbloquear a página</h2>
        <input
          type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown} // Usar o evento onKeyDown
        />
        <button onClick={handleLogin}>Desbloquear</button>
      </div>
    </div>
  );
};

export default Login;
