import React, { useState } from "react";
import { postAPI } from "../api";

const AddPost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (text.trim() === "" && !file) return;

    setLoading(true);
    try {
      // ON ENVOIE UN OBJET SIMPLE (api.js fera le reste)
      const response = await postAPI.create({
        content: text,
        image: file,
      });

      const newPost = response.post || response;
      if (typeof onPostCreated === "function") {
        onPostCreated(newPost);
      }

      setText("");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Erreur API:", error);
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all">
      <textarea
        className="w-full h-32 p-6 resize-none outline-none text-[#1e3a8a] placeholder-gray-400 text-lg transition focus:ring-0"
        placeholder={loading ? "Publication en cours..." : "Quoi de neuf ?"}
        disabled={loading}
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {preview && (
        <div className="relative mb-4 flex justify-center">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white w-fit">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-auto object-contain mx-auto"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 md:right-4 bg-[#1e3a8a] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition shadow-lg z-10"
          >
            ✕
          </button>
        </div>
      )}

      <div className="px-6 py-4 flex flex-row justify-between items-center bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[#1e3a8a] text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Photo</span>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={loading}
          className={`bg-[#1e3a8a] text-white px-8 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#152a66] active:scale-95"
          }`}
        >
          {loading ? "..." : "Publier"}
        </button>
      </div>
    </div>
  );
};

export default AddPost;
