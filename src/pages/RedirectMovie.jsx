import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function RedirectMovie() {
  const { movieID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/id/${movieID}`)
      .then((res) => {
        const slug = (res.data.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        navigate(`/mov/${res.data._id || movieID}/${slug}`, {
          replace: true,
        });
      })
      .catch(() => {
        navigate("/");
      });
  }, [movieID, navigate]);

  return null;
}
