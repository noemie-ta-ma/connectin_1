import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo-connectin.svg";
import { authAPI } from "../api";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({ firstName, lastName, email, password, confirmPassword });
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl w-full max-w-md border border-[#f8c193]/20">
        
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Connect'In" className="h-28 sm:h-40" />
        </div>
        
        <p className="text-center text-gray-600 mb-8 text-sm">
          Créez votre compte
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Email professionnel</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@connectin.fr"
              pattern=".+@connectin\.fr"
              title="L'email doit être au format prenom.nom@connectin.fr"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl hover:bg-[#152a66] transition font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#1e3a8a] hover:underline font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;