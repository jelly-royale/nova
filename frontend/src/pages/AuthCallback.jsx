import React from "react";
import { Link } from "react-router-dom";
import { useGoogleCallback } from "@/components/GoogleAuth";

export default function AuthCallback() {
  const { status, error } = useGoogleCallback();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" data-testid="auth-callback-page">
      <div className="text-center max-w-md">
        {status === "processing" && (
          <>
            <p className="nova-eyebrow mb-4">CONNEXION SÉCURISÉE</p>
            <h1 className="nova-h1 text-3xl md:text-4xl mb-4">Authentification en cours…</h1>
            <p className="text-black/60">Merci de patienter quelques instants.</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="nova-eyebrow mb-4">ERREUR</p>
            <h1 className="nova-h1 text-3xl md:text-4xl mb-4">Connexion impossible</h1>
            <p className="text-black/60 mb-8">{error}</p>
            <Link to="/login" className="nova-btn">Retour</Link>
          </>
        )}
      </div>
    </div>
  );
}
