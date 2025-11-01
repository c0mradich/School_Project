'use client'
import { useState, useRef, createContext } from 'react';
import { useRouter } from 'next/navigation';
import "../../css/styles.css"
import Link from 'next/link';
import { useUser } from "../context/UserContext";

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
    <form onSubmit={handleSubmit}>
      <label>Sign-Up</label>

      <div className='inputContainer'>
        <input
          placeholder=" "
          name='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="name">Name</label>
      </div>
      {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}

      <div className="inputContainer">
        <input
          name="password"
          type="password"
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">Password</label>
      </div>
      {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}

      <div className='inputContainer'>
        <input
          name='repeatPassword'
          type="password"
          placeholder=" "
          ref={rpassword}
        />
        <label htmlFor="repeatPassword">Repeat Password</label>
      </div>
      {errors.repeat && <span style={{ color: 'red' }}>{errors.repeat}</span>}

      {errors.server && <div style={{ color: 'red', marginTop: '5px' }}>{errors.server}</div>}

      <button type="submit">Sign Up</button>
      <Link href="/login">You have an account? <strong>Log In!</strong></Link>
    </form>
  );
}
