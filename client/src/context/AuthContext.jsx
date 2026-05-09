import { createContext, useContext, useEffect } from "react";
import useAuthStore from "../stores/useAuthStore";
import useLocationStore from "../stores/useLocationStore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const store = useAuthStore();

  // Hydrate auth + boot the unified location store once.
  useEffect(() => {
    store.fetchMe();
    useLocationStore.getState().init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When the server returns user.location, seed customPlace so the
  // manually-saved location is available even before live GPS resolves.
  useEffect(() => {
    if (store.user?.location) {
      useLocationStore.getState().syncFromUser(store.user.location);
    }
  }, [store.user?.location]);

  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
