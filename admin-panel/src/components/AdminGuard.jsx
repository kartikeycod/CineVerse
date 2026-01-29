import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/auth";
import { isAdminUser } from "../firebase/firestore";
import { Navigate } from "react-router-dom";

function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const ok = await isAdminUser(user.uid);

      if (!ok) {
        await signOut(auth);
        setAllowed(false);
      } else {
        setAllowed(true);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Checking access...</div>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}

export default AdminGuard;
