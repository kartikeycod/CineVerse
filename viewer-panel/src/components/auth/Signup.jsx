import "./auth.css";
import { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Added for redirection

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    try {
      // 1. Create the user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Send the verification link
      await sendEmailVerification(res.user);

      // 3. Create the user document in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        role: "viewer",
        provider: "email",
        createdAt: new Date()
      });

      alert("Verification email sent! Please check your inbox.");
      
      // 4. Redirect to login so they can sign in after verifying
      navigate("/login"); 

    } catch (error) {
      console.error("Signup Error:", error.message);
      alert(error.message); // This will tell you if the email is invalid or password is too short
    }
  };

  return (
    <div className="auth">
      <h2>Sign Up</h2>
      <input 
        placeholder="Email" 
        type="email" 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        onChange={e => setPassword(e.target.value)} 
      />
      <button onClick={signup}>Create Account</button>
      
      <p onClick={() => navigate("/login")} style={{cursor: 'pointer', marginTop: '10px'}}>
        Already have an account? Login
      </p>
    </div>
  );
};

export default Signup;