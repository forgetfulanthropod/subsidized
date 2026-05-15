"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function MarkAsReviewedButton({
  applicantId,
  onSuccess,
}: {
  applicantId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/applicants/${applicantId}/review`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark as reviewed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicantId] });
      onSuccess?.();
    },
  });

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={mutation.isPending || mutation.isSuccess}
      onClick={() => mutation.mutate()}
    >
      {mutation.isSuccess ? "Marked reviewed" : "Mark as reviewed"}
    </Button>
  );
}
