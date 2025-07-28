import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import the Supabase client

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between sign-in and sign-up

  // Handles user sign-in or sign-up
  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let authResponse;
      if (isSignUp) {
        // Sign up a new user
        authResponse = await supabase.auth.signUp({
          email: email,
          password: password,
        });
      } else {
        // Sign in an existing user
        authResponse = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      }

      const { data, error } = authResponse;

      if (error) {
        alert(error.message); // Use a custom modal in a real app, not alert()
      } else if (data.user) {
        alert('Check your email for the confirmation link (if signing up) or you are logged in!');
        // For sign-up, Supabase sends a confirmation email.
        // For sign-in, the user is immediately logged in.
      } else {
        // This case might happen for sign-up if email confirmation is required but no error
        alert('Please check your email to confirm your account.');
      }
    } catch (error) {
      alert(error.message); // Use a custom modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleAuth} className="auth-form">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      <button className="toggle-auth-mode" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}

export default Auth;

/*
  Explanation:
  - This component handles user authentication (sign-up and sign-in).
  - It uses `useState` to manage input fields (email, password) and loading state.
  - `handleAuth` is an asynchronous function that calls `supabase.auth.signUp` or `supabase.auth.signInWithPassword`
    based on the `isSignUp` state.
  - It provides basic feedback using `alert()`. In a production application, you would replace
    `alert()` with a more user-friendly modal or notification system.
  - A button allows users to toggle between sign-in and sign-up modes.
*/
