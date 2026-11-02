import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ADMIN_EMAIL = "federicomathias@gmail.com";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [perfilLoading, setPerfilLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setPerfil(null);
        setPerfilLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    setPerfilLoading(true);
    const ref = doc(db, "usuarios", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        const esAdmin = user.email === ADMIN_EMAIL;
        setDoc(ref, {
          email: user.email,
          role: esAdmin ? "admin" : "jugador",
          isPlayer: true,
          nombre: "",
          apellidos: "",
          posicionPrincipal: "",
          posicionesSecundarias: [],
          altura: null,
          peso: null,
          perfilCompleto: false,
        }).catch(() => {});
        return;
      }
      setPerfil({ id: snap.id, ...snap.data() });
      setPerfilLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const role = perfil?.role || null;
  const isPlayer = !!perfil?.isPlayer;
  const isStaff = role === "admin" || role === "entrenador" || role === "capitan";
  const perfilIncompleto = isPlayer && perfil && perfil.perfilCompleto === false;
  const loading = authLoading || (!!user && perfilLoading);

  return (
    <AuthContext.Provider
      value={{ user, perfil, role, isPlayer, isStaff, perfilIncompleto, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
