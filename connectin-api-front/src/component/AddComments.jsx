import React, { useState, useEffect } from "react";
import LikeButton from "./LikeButton";
import { postAPI, commentAPI } from "../api";

const Post = ({ data, onDelete, onEdit }) => {
  // commentaire
  const [commentaires, setCommentaires] = useState(data.comments || []);
  const [nouveauCom, setNouveauCom] = useState("");
  const [idComEnEdition, setIdComEnEdition] = useState(null);
  const [texteComEdition, setTexteComEdition] = useState("");

  // etat
  const [modeEditionPost, setModeEditionPost] = useState(false);
  const [textePostEdite, setTextePostEdite] = useState(data.content);
  const [imagePostEdite, setImagePostEdite] = useState(data.image_path);
  const [loading, setLoading] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);

  useEffect(() => {
    setTextePostEdite(data.content);
    setImagePostEdite(data.image_path);
  }, [data]);

  // user
  const user = JSON.parse(localStorage.getItem("user"));
  const monId = user ? user.id : null;
  const monNomComplet = user ? `${user.first_name} ${user.last_name}` : "Moi";

  // POST
  const sauvegarderModifPost = async () => {
    setLoading(true);
    try {
      const imageAEnvoyer =
        typeof imagePostEdite === "object" ? imagePostEdite : null;

      await onEdit(data.id, textePostEdite, imageAEnvoyer);
      setModeEditionPost(false);
    } catch (error) {
      alert("Erreur lors de la modification du post");
    } finally {
      setLoading(false);
    }
  };

  const handleDestroyImage = async () => {
    if (!window.confirm("Supprimer l'image de ce post ?")) return;
    setLoading(true);
    try {
      await postAPI.destroyImage(data.id);
      setImagePostEdite(null);
      data.image_path = null;
      alert("Image supprimée");
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const annulerEdition = () => {
    setModeEditionPost(false);
    setTextePostEdite(data.content);
    setImagePostEdite(data.image_path);
  };

  const ajouterCommentaire = async () => {
    if (nouveauCom.trim() === "") return;
    try {
      const response = await commentAPI.create({
        post_id: data.id,
        content: nouveauCom,
      });

      const newCommentData = response.comment || response;

      const completeComment = {
        ...newCommentData,
        user: user,
        user_id: monId,
      };

      setCommentaires([...commentaires, completeComment]);
      setNouveauCom("");
    } catch (error) {
      alert("Impossible d'ajouter le commentaire");
    }
  };

  const supprimerCommentaire = async (id) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await commentAPI.delete(id);
      setCommentaires(commentaires.filter((c) => c.id !== id));
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const sauvegarderModifCom = async (id) => {
    if (texteComEdition.trim() === "") return;

    try {
      // 1. Appel au backend Laravel via la route PUT
      await commentAPI.update(id, texteComEdition);

      // 2. Mise à jour de l'affichage local (React)
      setCommentaires(
        commentaires.map((c) =>
          c.id === id ? { ...c, content: texteComEdition } : c
        )
      );

      // 3. Sortie du mode édition
      setIdComEnEdition(null);
      setTexteComEdition("");
    } catch (error) {
      alert("Erreur lors de la modification du commentaire : " + error.message);
    }
  };

  return (
    <div className="w-full h-auto rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-white mb-8 transition-all">
      <div className="flex flex-row justify-between items-center p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowUserCard(!showUserCard)}
            className="hover:opacity-80 transition flex-shrink-0"
          >
            {data.user?.profile_picture ? (
              <img
                src={`http://localhost:8000/storage/${data.user.profile_picture}`}
                alt="Profil"
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {data.user
                  ? `${data.user.first_name[0]}${data.user.last_name[0]}`.toUpperCase()
                  : "US"}
              </div>
            )}
          </button>

          <span className="font-bold text-[#1e3a8a]">
            {data.author_name ||
              (data.user
                ? `${data.user.first_name} ${data.user.last_name}`
                : "Utilisateur supprimé")}
          </span>

          {showUserCard && data.user && (
            <div className="absolute top-12 left-0 z-50 bg-white border border-[#f8c193]/30 rounded-2xl shadow-2xl p-4 w-64">
              <button
                onClick={() => setShowUserCard(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition text-xs font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-3">
                {data.user.profile_picture ? (
                  <img
                    src={`http://localhost:8000/storage/${data.user.profile_picture}`}
                    alt="Profil"
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {data.user
                      ? `${data.user.first_name[0]}${data.user.last_name[0]}`.toUpperCase()
                      : "US"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#1e3a8a] text-sm">
                    {data.author_name ||
                      `${data.user.first_name} ${data.user.last_name}`}
                  </p>
                  <p className="text-gray-400 text-xs">{data.user.email}</p>
                </div>
              </div>
              {data.user.bio ? (
                <p className="text-gray-600 text-xs leading-relaxed border-t border-gray-50 pt-3">
                  {data.user.bio}
                </p>
              ) : (
                <p className="text-gray-300 text-xs italic border-t border-gray-50 pt-3">
                  Aucune bio renseignée
                </p>
              )}
            </div>
          )}
        </div>

        {data.user_id === monId && (
          <div className="flex gap-4 text-xs font-semibold">
            <button
              onClick={
                modeEditionPost
                  ? annulerEdition
                  : () => setModeEditionPost(true)
              }
              className="text-gray-400 hover:text-[#1e3a8a] transition-colors"
            >
              {modeEditionPost ? "Annuler" : "Modifier"}
            </button>
            <button
              onClick={() => onDelete(data.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {modeEditionPost ? (
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full border-2 border-gray-100 p-4 rounded-2xl text-[#1e3a8a] outline-none focus:border-[#f8c193]/30 transition-all text-sm resize-none"
              value={textePostEdite}
              onChange={(e) => setTextePostEdite(e.target.value)}
              disabled={loading}
              rows="3"
            />

            {imagePostEdite && (
              <div className="relative w-full max-w-[200px] group">
                <img
                  src={
                    typeof imagePostEdite === "string"
                      ? `http://localhost:8000/storage/${imagePostEdite}`
                      : URL.createObjectURL(imagePostEdite)
                  }
                  className="w-full h-auto rounded-xl border border-gray-100 shadow-sm"
                  alt="Aperçu édition"
                />
                <button
                  type="button"
                  onClick={handleDestroyImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition-all"
                  disabled={loading}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagePostEdite(e.target.files[0])}
                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-[#1e3a8a] hover:file:bg-gray-200 cursor-pointer"
              />
            </div>

            <button
              onClick={sauvegarderModifPost}
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-xl text-xs self-end font-bold shadow-md hover:bg-[#152a66] transition-all"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[#1e3a8a] text-lg leading-relaxed whitespace-pre-wrap break-all">
              {data.content}
            </p>
            {data.image_path && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={`http://localhost:8000/storage/${data.image_path}`}
                  className="w-full h-auto object-cover"
                  alt="Post"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        <div className="pt-2 border-t border-gray-50">
          <LikeButton
            postId={data.id}
            initialLikes={data.likes ? data.likes.map((l) => l.user_id) : []}
            userId={monId}
          />
        </div>
      </div>

      <div className="bg-gray-50/30 p-6 text-sm border-t border-gray-50">
        <h4 className="font-bold text-[#1e3a8a] mb-4 flex items-center gap-2">
          Commentaires
        </h4>

        <div className="space-y-4 mb-6">
          {commentaires.map((com) => (
            <div
              key={com.id}
              className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"
            >
              <div className="flex gap-3 items-start">
                {com.user?.profile_picture ? (
                  <img
                    src={`http://localhost:8000/storage/${com.user.profile_picture}`}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm flex-shrink-0"
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                    {com.user
                      ? `${com.user.first_name[0]}${com.user.last_name[0]}`.toUpperCase()
                      : "US"}
                  </div>
                )}

                <div className="flex-1">
                  <span className="font-bold text-xs text-[#1e3a8a] block mb-1">
                    {com.author_name ||
                      (com.user
                        ? `${com.user.first_name} ${com.user.last_name}`
                        : "Utilisateur supprimé")}
                  </span>

                  {idComEnEdition === com.id ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <input
                        className="border border-gray-200 rounded-xl px-3 py-2 w-full text-xs outline-none focus:border-[#1e3a8a]"
                        value={texteComEdition}
                        onChange={(e) => setTexteComEdition(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setIdComEnEdition(null);
                            setTexteComEdition("");
                          }}
                          className="text-gray-400 text-[10px] font-bold uppercase hover:text-gray-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => sauvegarderModifCom(com.id)}
                          className="text-[#1e3a8a] text-[10px] font-bold uppercase hover:text-[#152a66]"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 leading-normal break-all">
                      {com.content || com.texte}
                    </p>
                  )}
                </div>

                {/* Les modif que le user peut faire */}
                {com.user_id === monId && idComEnEdition !== com.id && (
                  <div className="flex gap-2 ml-2">
                    {/* Bouton Modifier */}
                    <button
                      onClick={() => {
                        setIdComEnEdition(com.id);
                        setTexteComEdition(com.content || com.texte);
                      }}
                      className="text-gray-300 hover:text-[#1e3a8a] transition-colors"
                      title="Modifier"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => supprimerCommentaire(com.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input pour nouveau commentaire */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none text-xs focus:border-[#1e3a8a] bg-white transition-all shadow-sm"
            placeholder="Écrire un commentaire..."
            value={nouveauCom}
            onChange={(e) => setNouveauCom(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && ajouterCommentaire()}
          />
          <button
            onClick={ajouterCommentaire}
            className="bg-[#1e3a8a] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#152a66] transition-all"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
