import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Favorite design ids for the current user plus an optimistic toggle.
// Signed-out users are sent to login and returned afterwards.
export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: ids = [] } = useQuery({
    queryKey: ["favorites", "ids"],
    queryFn: () => api("/favorites/ids"),
    enabled: Boolean(user),
  });

  const mutation = useMutation({
    mutationFn: ({ id, on }) => api(`/favorites/${id}`, { method: on ? "POST" : "DELETE" }),
    onMutate: async ({ id, on }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", "ids"] });
      const prev = queryClient.getQueryData(["favorites", "ids"]);
      queryClient.setQueryData(["favorites", "ids"], (old = []) =>
        on ? [...new Set([...old, id])] : old.filter((x) => x !== id)
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      queryClient.setQueryData(["favorites", "ids"], ctx?.prev);
      toast.error(err.message);
    },
    onSuccess: (_d, { on }) => toast.success(on ? "Saved to favorites" : "Removed from favorites"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const isFavorite = (id) => ids.includes(id);
  const toggle = (id) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    mutation.mutate({ id, on: !isFavorite(id) });
  };

  return { ids, isFavorite, toggle };
}
