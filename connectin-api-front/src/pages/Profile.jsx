import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import BottomNav from "../component/BottomNav";
import Post from "../component/AddComments";
import { userAPI, postAPI } from "../api";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getMyPosts(),
        ]);
        setUser(userData);
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const supprimerPost = async (idASupprimer) => {
    if (window.confirm("Supprimer ce post définitivement ?")) {
      try {
        await postAPI.delete(idASupprimer);
        setPosts(posts.filter((p) => p.id !== idASupprimer));
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const modifierPost = async (idAModifier, nouveauContenu, nouvelleImage) => {
    try {
      await postAPI.update(idAModifier, {
        content: nouveauContenu,
        image_path: nouvelleImage,
      });
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === idAModifier
            ? { ...p, content: nouveauContenu, image_path: nouvelleImage }
            : p
        )
      );
    } catch (error) {
      alert("Impossible de modifier le post : " + error.message);
    }
  };

  const getInitials = () => {
    if (!user) return "?";
    return ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center">
        <p className="text-[#1e3a8a] font-semibold">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f2] flex overflow-x-hidden">

      <aside className="hidden md:flex w-64 bg-white border-r border-[#f8c193]/20 fixed h-full flex-col">
        <Sidebar />
      </aside>

      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

          {/* Carte profil */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-[#f8c193]/20 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8">
              {user.profile_picture ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${user.profile_picture}`}
                  alt="Photo de profil"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#f8c193]/30"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {getInitials()}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a] mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
              </div>
            </div>

            {user.bio && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#1e3a8a] mb-3">À propos</h2>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            <Link
              to="/settings"
              className="inline-block bg-[#1e3a8a] text-white px-6 py-3 rounded-xl hover:bg-[#152a66] transition font-semibold shadow-md hover:shadow-lg"
            >
              Modifier mon profil
            </Link>
          </div>

          {/* Publications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#f8c193]/20">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">
              Mes publications
              {posts.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">({posts.length})</span>
              )}
            </h2>

            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune publication pour le moment</p>
            ) : (
              <div className="flex flex-col gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-[#f8c193]/10 overflow-hidden"
                  >
                    <Post
                      data={post}
                      onDelete={supprimerPost}
                      onEdit={modifierPost}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <BottomNav />

    </div>
  );
}

export default Profile;