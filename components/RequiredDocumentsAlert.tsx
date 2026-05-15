import { FileWarning } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface RequiredDocumentsAlertProps {
  documents: readonly string[];
  documentsRequestedAt?: string;
  className?: string;
}

export function RequiredDocumentsAlert({
  documents,
  documentsRequestedAt,
  className,
}: RequiredDocumentsAlertProps) {
  if (documents.length === 0) return null;

  const outstanding = Boolean(documentsRequestedAt);

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4",
        outstanding
          ? "border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-200/60"
          : "border-amber-200 bg-amber-50/80",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <FileWarning
          className={cn(
            "h-4 w-4 shrink-0",
            outstanding ? "text-amber-700" : "text-amber-600"
          )}
          aria-hidden
        />
        <h3 className="text-sm font-semibold text-amber-950">
          Required documents
          {outstanding && (
            <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-900">
              Request sent
            </span>
          )}
        </h3>
      </div>
      {documentsRequestedAt && (
        <p className="mb-2 text-xs font-medium text-amber-800">
          Outstanding since {formatDate(documentsRequestedAt)} — follow up with
          applicant
        </p>
      )}
      <ul className="space-y-1.5">
        {documents.map((doc) => (
          <li
            key={doc}
            className={cn(
              "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm",
              outstanding
                ? "bg-white font-medium text-amber-950 shadow-sm"
                : "text-amber-900"
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                outstanding ? "bg-amber-500" : "bg-amber-400"
              )}
              aria-hidden
            />
            {doc}
          </li>
        ))}
      </ul>
    </div>
  );
}
