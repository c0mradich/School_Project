'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import '../../css/styles.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL

interface LoginData {
  name: string;
  password: string;
}


function SignIn() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const {setUser, user} = useUser()
  const router = useRouter()
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);


  const validate = () => {
    const newErrors: { [ key: string ]: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async ({ name, password }: LoginData) => {
    try {
      const res = await fetch(`${apiURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!data) throw new Error('Server returned an ampty responce');

      return data;
    } catch (error) {
      console.error('Error by login:', error);
      return { success: false, message: 'Error: Failed to establish the connection with server' };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await handleLogin({ name, password });
    if (result.detail){
      setErrors({password: result.detail})
      return
    }
    if(result.id && result.name){
      setUser({id: result.id, name: result.name})
      sessionStorage.setItem("user_id",result.id)
      sessionStorage.setItem("user_name", result.name)
    }
    console.log("RESULT: ", result)
  };

  return (
    <form onSubmit={handleSubmit} method='POST'>
      <label>Login</label>
      <div className='inputContainer'>
        <input
          placeholder=" "
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="name"> Name </label>
      </div>

      {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
    <div className='inputContainer'>
      <input
        type="password"
        placeholder=" "
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label htmlFor="password"> Password </label>
    </div>
      {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}

      <button type="submit">Login</button>

      <Link href="/signUp">You don't have an account? <strong>Sign Up!</strong></Link>
    </form>
  );
}

export default SignIn;