import React, { useState } from "react";
import { likeAPI } from "../api";

function LikeButton({ postId, initialLikes, userId }) {
  const [listeDesLikeurs, setListeDesLikeurs] = useState(initialLikes || []);
  const [loading, setLoading] = useState(false);

  const aiJeLike = listeDesLikeurs.includes(userId);

  const gererLeLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await likeAPI.toggle(postId);

      if (aiJeLike) {
        setListeDesLikeurs(listeDesLikeurs.filter((id) => id !== userId));
      } else {
        setListeDesLikeurs([...listeDesLikeurs, userId]);
      }
    } catch (error) {
      console.error("Erreur de like :", error.message);
      alert("Impossible de liker pour le moment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row justify-end items-center gap-2">
      <button
        onClick={gererLeLike}
        className={`cursor-pointer ${loading ? "opacity-50" : ""}`}
        disabled={loading}
      >
        <img
          src="src/assets/morelike.svg"
          alt="coeur"
          className={`w-6 transition-all ${
            aiJeLike ? "scale-110" : "opacity-40"
          }`}
          style={{
            filter: aiJeLike
              ? "hue-rotate(320deg) saturate(5)"
              : "grayscale(1)",
          }}
        />
      </button>

      <p className="text-sm font-semibold text-[#1e3a8a]">
        {listeDesLikeurs.length} Like{listeDesLikeurs.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default LikeButton;
