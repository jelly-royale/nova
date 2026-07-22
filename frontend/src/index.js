import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import App from "@/App";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster position="top-center" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
