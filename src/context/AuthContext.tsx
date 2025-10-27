import React, {
  createContext,
  useContext,
  useState,
  useEffect,

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
  attendanceRefresh: Boolean;
  setAttendanceRefresh: React.Dispatch<React.SetStateAction<Boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);

  const [attendanceRefresh, setAttendanceRefresh] = useState<Boolean>(false);


  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isClockedIn");
    localStorage.removeItem("clockInTime");
    localStorage.removeItem("clockedInDate");
    localStorage.removeItem("attendanceId");
    setUserState(null);
  };

  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // Removed resetTimeout() call on setUser
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("isClockedIn");
      localStorage.removeItem("clockInTime");
      localStorage.removeItem("clockedInDate");
      localStorage.removeItem("attendanceId");
    }
    setUserState(user);
  };

  // Effect to load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  console.log("from Auth", attendanceRefresh)

  // New Effect for 18-hour session limit check
  useEffect(() => {
    let intervalId: number | undefined;

    if (user) {
      const checkSessionDuration = () => {
        const clockInTimeStr = localStorage.getItem("clockInTime");

        if (clockInTimeStr) {
          const clockInTime = new Date(clockInTimeStr).getTime();
          const currentTime = new Date().getTime();
          // 18 hours in milliseconds
          const EIGHTEEN_HOURS_MS = 18 * 60 * 60 * 1000;

          if (currentTime - clockInTime > EIGHTEEN_HOURS_MS) {
            console.log("Session expired: over 18 hours since clock-in.");
            logout();
            // Clear the interval after logging out
            if (intervalId !== undefined) {
              clearInterval(intervalId);
            }
          }
        }
      };

      // Check immediately and then every minute (or less frequently if preferred, e.g., every 5 mins)
      checkSessionDuration();
      // Set up interval to check every minute (60,000 ms)
      intervalId = setInterval(checkSessionDuration, 60 * 1000) as unknown as number;
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [user]); // Re-run effect when user state changes

  // Removed the old useEffect for inactivity listeners

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, attendanceRefresh, setAttendanceRefresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};