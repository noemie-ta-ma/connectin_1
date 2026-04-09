import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import { userAPI } from "../api";

function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentPicture, setCurrentPicture] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteContent, setDeleteContent] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setCurrentPicture(data.profile_picture || null);
      } catch (err) {
        setInfoError(err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteProfilePicture = async () => {
  if (!window.confirm("Supprimer votre photo de profil actuelle ?")) return;
  setInfoLoading(true);
  try {
    const data = await userAPI.destroyPicture();
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentPicture(null);
    setPreviewUrl(null);
    setInfoSuccess("Photo de profil supprimée !");
  } catch (err) {
    setInfoError(err.message);
  } finally {
    setInfoLoading(false);
  }
};

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess("");
    setInfoLoading(true);
    try {
      // Mise à jour des infos texte
      await userAPI.updateProfile({ firstName, lastName, email, bio });

      // Upload photo séparé si une nouvelle photo est sélectionnée
      if (profilePicture) {
        const formData = new FormData();
        formData.append("profile_picture", profilePicture);
        const response = await fetch("http://localhost:8000/api/profile/picture", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "The profile picture failed to upload.");
        }
        const picData = await response.json();
        localStorage.setItem("user", JSON.stringify(picData.user));
        setCurrentPicture(picData.user.profile_picture);
      }

      setInfoSuccess("Informations mises à jour !");
      setProfilePicture(null);
      setPreviewUrl(null);
    } catch (err) {
      setInfoError(err.message);
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      await userAPI.updatePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordSuccess("Mot de passe mis à jour !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteContent === null) return;
    try {
      await userAPI.deleteAccount(deleteContent, deletePassword);
      navigate("/login");
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const getInitials = () => {
    return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex">

      <aside className="hidden md:flex w-64 bg-white border-r border-[#f8c193]/20 fixed h-full flex-col">
        <Sidebar />
      </aside>

      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-6">Paramètres du compte</h1>

          {/* Informations personnelles */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#f8c193]/20">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-6">Mes informations</h2>
            {infoSuccess && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">{infoSuccess}</div>}
            {infoError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">{infoError}</div>}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-2">
                {previewUrl ? (
                  <img src={previewUrl} alt="Aperçu" className="w-20 h-20 rounded-full object-cover border-4 border-[#f8c193]/30" />
                ) : currentPicture ? (
                  <img src={`http://localhost:8000/storage/${currentPicture}`} alt="Photo de profil" className="w-20 h-20 rounded-full object-cover border-4 border-[#f8c193]/30" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-2xl font-bold">{getInitials()}</div>
                )}
                <div className="text-center sm:text-left">
                  <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Photo de profil</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-[#1e3a8a] file:text-white hover:file:bg-[#152a66] cursor-pointer" />
                  {currentPicture && !previewUrl && (
                  <button type="button" onClick={handleDeleteProfilePicture} className="mt-2 text-red-600 text-xs font-bold hover:underline block mx-auto sm:mx-0" disabled={infoLoading} >
                   Supprimer ma photo actuelle
                  </button>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Prénom</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Nom</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Email professionnel</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} pattern=".+@connectin\.fr" title="L'email doit être au format prenom.nom@connectin.fr" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Parlez-nous de vous..." rows="4" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition resize-none" />
              </div>

              <button type="submit" disabled={infoLoading} className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl hover:bg-[#152a66] transition font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {infoLoading ? "Mise à jour..." : "Mettre à jour mes informations"}
              </button>
            </form>
          </div>

          {/* Changement de mot de passe */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#f8c193]/20">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-6">Changer mon mot de passe</h2>
            {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">{passwordSuccess}</div>}
            {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">{passwordError}</div>}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Mot de passe actuel</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-2">Confirmer le nouveau mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f8c193] transition" required />
              </div>
              <button type="submit" className="w-full bg-[#1e3a8a] text-white py-3 rounded-xl hover:bg-[#152a66] transition font-semibold shadow-md hover:shadow-lg">
                Changer mon mot de passe
              </button>
            </form>
          </div>

          {/* Zone dangereuse */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-red-200">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Zone dangereuse</h2>
            <p className="text-gray-600 mb-6 text-sm">
              La suppression de votre compte est irréversible. Votre compte sera définitivement supprimé ainsi que l'ensemble de vos likes.
            </p>
            <button
              onClick={() => { setDeleteContent(null); setDeletePassword(""); setDeleteError(""); setShowDeleteModal(true); }}
              className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold shadow-md hover:shadow-lg"
            >
              Supprimer mon compte
            </button>
          </div>

        </div>
      </main>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Supprimer mon compte</h2>
            <p className="text-gray-600 text-sm mb-6">Cette action est irréversible. Que souhaitez-vous faire avec vos publications et commentaires ?</p>

            <div className="space-y-3 mb-6">
              <button onClick={() => setDeleteContent(false)} className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition ${deleteContent === false ? "border-[#1e3a8a] bg-[#fff8f2]" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="font-semibold text-[#1e3a8a] text-sm">Conserver mes publications</p>
                <p className="text-gray-500 text-xs mt-1">Vos posts et commentaires resteront visibles sous le nom "Utilisateur supprimé"</p>
              </button>
              <button onClick={() => setDeleteContent(true)} className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition ${deleteContent === true ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="font-semibold text-red-600 text-sm">Supprimer toutes mes publications</p>
                <p className="text-gray-500 text-xs mt-1">Tous vos posts et commentaires seront définitivement supprimés</p>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmez votre mot de passe</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="••••••••" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-300 transition" />
            </div>

            {deleteError && <p className="text-red-500 text-sm text-center mb-4">{deleteError}</p>}

            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Annuler</button>
              <button onClick={handleConfirmDelete} disabled={deleteContent === null || !deletePassword} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed">Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

    </div>
  );
}

export default Settings;