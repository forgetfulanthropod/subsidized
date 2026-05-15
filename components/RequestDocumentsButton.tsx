"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function RequestDocumentsButton({ applicantId }: { applicantId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/applicants/${applicantId}/request-documents`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to request documents");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicantId] });
    },
  });

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={mutation.isPending || mutation.isSuccess}
      onClick={() => mutation.mutate()}
    >
      {mutation.isSuccess ? "Documents requested" : "Request documents"}
    </Button>
  );
}
