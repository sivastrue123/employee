import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

type User = {
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const timeoutRef = useRef<number | null>(null);


  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const newTimeoutId = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
    timeoutRef.current = newTimeoutId as unknown as number;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUserState(null);
  };

  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      
      resetTimeout();
    } else {
      localStorage.removeItem("user");
    }
    setUserState(user);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
    
      resetTimeout();
      const events = ["mousemove", "mousedown", "keypress", "scroll"];
      events.forEach((event) => {
        window.addEventListener(event, resetTimeout);
      });


      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        events.forEach((event) => {
          window.removeEventListener(event, resetTimeout);
        });
      };
    }
  }, [user]); 

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
