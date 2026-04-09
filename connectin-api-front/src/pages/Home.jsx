import React, { useState, useEffect } from "react";
import Post from "../component/AddComments.jsx";
import Sidebar from "../component/Sidebar";
import Otherbar from "../component/Otherbar";
import AddPost from "../component/AddPost";
import BottomNav from "../component/BottomNav";
import { postAPI } from "../api";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [choixDuTri, setChoixDuTri] = useState("recents");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postAPI.getAll();
        setPosts(data);
      } catch (error) {
        console.error("Erreur de chargement", error);
      }
    };
    loadPosts();
  }, []);

  const handlePostCreated = (response) => {
    const newPostFromServer = response.post || response;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const postComplet = {
      ...newPostFromServer,
      user: currentUser,
      comments: [],
      likes: [],
    };
    setPosts((prevPosts) => [postComplet, ...prevPosts]);
  };

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
      const response = await postAPI.update(idAModifier, {
        content: nouveauContenu,
        image: nouvelleImage,
      });

      const updatedPost = response.post || response;

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === idAModifier
            ? { 
                ...p, 
                content: updatedPost.content, 
                image_path: updatedPost.image_path 
              }
            : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Impossible de modifier le post : " + error.message);
    }
  };

  const postsAffiches = posts
    .filter((unPost) => {
      if (!unPost || !unPost.content) return false;
      return unPost.content.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (choixDuTri === "populaires") {
        const nbLikesA = a.likes ? a.likes.length : 0;
        const nbLikesB = b.likes ? b.likes.length : 0;
        return nbLikesB - nbLikesA;
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  return (
    <div className="min-h-screen bg-[#fff8f2] flex overflow-x-hidden">
      <aside className="hidden md:flex w-64 bg-white border-r border-[#f8c193]/20 fixed h-full flex-col">
        <Sidebar />
      </aside>

      <main className="flex-1 md:ml-64 xl:mr-80 pb-24 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
              Fil d'actualité
            </h1>
            <p className="text-gray-500 font-medium">
              Partagez vos idées avec vos collègues
            </p>
          </div>

          <div className="w-full mb-8 bg-white rounded-3xl shadow-xl border border-[#f8c193]/10 overflow-hidden">
            <AddPost onPostCreated={handlePostCreated} />
          </div>

          <div className="flex flex-col gap-6">
            {postsAffiches.map((post) => (
              <Post
                key={post.id}
                data={post}
                onDelete={supprimerPost}
                onEdit={modifierPost}
              />
            ))}
          </div>
        </div>
      </main>

      <aside className="hidden xl:flex w-80 bg-white border-l border-[#f8c193]/20 fixed right-0 h-full overflow-y-auto">
        <Otherbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          changerLeTri={setChoixDuTri}
        />
      </aside>

      <BottomNav />
    </div>
  );
}

export default Home;
