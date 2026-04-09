const BASE_URL = "http://localhost:8000/api";

// Fonctions utilitaires

const getToken = () => localStorage.getItem("token");

const getHeaders = (withAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (withAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Headers sans content-type pour les envois de fichiers (FormData)
const getFileHeaders = () => {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const firstError = data.errors
      ? Object.values(data.errors)[0][0]
      : data.message || "Une erreur est survenue";
    throw new Error(firstError);
  }
  return data;
};

// Authentification

export const authAPI = {
  register: async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: confirmPassword,
      }),
    });
    const data = await handleResponse(response);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  login: async ({ email, password }) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated: () => !!getToken(),
};

// Profil utilisateur

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  destroyPicture: async () => {
    const response = await fetch(`${BASE_URL}/profile/picture`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async ({ firstName, lastName, email, bio }) => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        bio,
      }),
    });
    const data = await handleResponse(response);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  // deleteContent: true = supprime posts/comments, false = anonymise avec "Utilisateur supprimé"
  deleteAccount: async (deleteContent = false, password) => {
    const response = await fetch(
      `${BASE_URL}/profile?delete_all=${deleteContent}`,
      {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ password }),
      }
    );
    const data = await handleResponse(response);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return data;
  },

  getMyPosts: async () => {
    const response = await fetch(`${BASE_URL}/profile/posts`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updatePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await fetch(`${BASE_URL}/profile/password`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    });
    return handleResponse(response);
  },
};

// Posts

export const postAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getOne: async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  create: async ({ content, image }) => {
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    const response = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: getFileHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  update: async (id, { content, image }) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("content", content);
    if (image) formData.append("image", image);

    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: "POST",
      headers: getFileHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  destroyImage: async (id) => {
    const response = await fetch(`${BASE_URL}/posts/${id}/image`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Commentaires

export const commentAPI = {
  create: async ({ post_id, content }) => {
    const response = await fetch(`${BASE_URL}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ post_id, content }),
    });
    return handleResponse(response);
  },

  // AJOUTE CETTE FONCTION :
  update: async (id, content) => {
    const response = await fetch(`${BASE_URL}/comments/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/comments/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Likes

export const likeAPI = {
  toggle: async (post_id) => {
    const response = await fetch(`${BASE_URL}/likes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ post_id }),
    });
    return handleResponse(response);
  },
};
