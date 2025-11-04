'use client'
import { useState, useRef, createContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from "../context/UserContext";
import styles from "../../css/styles.module.css"

const apiURL = process.env.NEXT_PUBLIC_API_URL

export default function SignUp() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const rpassword = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setUser, user } = useUser();
  const router = useRouter();

  if (user!==null){
    router.push("/dashboard")
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Name required";
    if (!password.trim()) newErrors.password = "Password required";

    const repeat = rpassword.current?.value?.trim();
    if (!repeat) newErrors.repeat = "Repeat password required";
    if (password.trim() && repeat && password.trim() !== repeat) {
      newErrors.repeat = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({}); // сброс локальных ошибок

    try {
      const formData = { name, password };
      const response = await fetch(`${apiURL}/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail) {
          setErrors({ name: data.detail });
        }
      } else {
        // Сохраняем пользователя в context/state
        setUser({ id: data.id, name: data.name });
        sessionStorage.setItem("user_id", data.id)
        sessionStorage.setItem("user_name", data.name)

        // Очистка полей
        setName('');
        setPassword('');
        if (rpassword.current) rpassword.current.value = '';

        // Редирект на dashboard
        router.push("/dashboard");
      }

    } catch (error) {
      console.error('Network error:', error);
      setErrors({ server: "Network error. Please try again." });
    }
  };

  return (
  <form className={styles.form} onSubmit={handleSubmit}>
    <label className={styles.title}>Sign-Up</label>

    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        placeholder=" "
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className={styles.label} htmlFor="name">Name</label>
    </div>
    {errors.name && <span className={styles.error}>{errors.name}</span>}

    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        name="password"
        type="password"
        placeholder=" "
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className={styles.label} htmlFor="password">Password</label>
    </div>
    {errors.password && <span className={styles.error}>{errors.password}</span>}

    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        name="repeatPassword"
        type="password"
        placeholder=" "
        ref={rpassword}
      />
      <label className={styles.label} htmlFor="repeatPassword">Repeat Password</label>
    </div>
    {errors.repeat && <span className={styles.error}>{errors.repeat}</span>}

    {errors.server && (
      <div className={styles.errorServer}>{errors.server}</div>
    )}

    <button className={styles.button} type="submit">Sign Up</button>

    <Link className={styles.link} href="/login">
      You have an account? <strong>Log In!</strong>
    </Link>
  </form>
  );
}
