"use client";

import { useMemo, useState, Fragment } from "react";
import { MoreVertical } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicantDetailExpand } from "@/components/ApplicantDetailExpand";
import { ClaimControl } from "@/components/ClaimControl";
import { RequestDocumentsButton } from "@/components/RequestDocumentsButton";
import { useUser } from "@/context/UserContext";
import { isCaseManager } from "@/lib/users";
import { getMatchingVacancies } from "@/lib/matching";
import {
  isApplicantRecord,
  isInReview,
  isTenantRecord,
} from "@/lib/case-manager-dashboard";
import {
  ApplicantStatusFilter,
  DEFAULT_APPLICANT_STATUS_SELECTION,
} from "@/components/ApplicantStatusFilter";
import {
  formatDate,
  formatCurrency,
  formatInReviewBy,
  formatStatus,
} from "@/lib/utils";
import type { Applicant, Vacancy } from "@/types";

const columnHelper = createColumnHelper<Applicant>();

const APPLICANT_STATUS_OPTIONS = [
  "Pending",
  "Eligible",
  "Ineligible",
  "Notified",
  "MoveInScheduled",
  "Rejected",
] as const;

const IN_PROGRESS_STATUSES: Applicant["status"][] = [
  "Pending",
  "Eligible",
  "Notified",
  "MoveInScheduled",
];

const COMPLETED_STATUSES: Applicant["status"][] = [
  "MovedIn",
  "Stalled",
  "TenancyConfirmed",
  "Ineligible",
  "Rejected",
];

type RecordTypeFilter = "all" | "applicants" | "tenants";

interface ApplicantTableProps {
  tenantsOnly?: boolean;
  casesMode?: "in-progress" | "completed";
  managerCaseloadOnly?: boolean;
  showReview?: boolean;
  showAssignee?: boolean;
  showRecordTypeFilter?: boolean;
  inReviewOnly?: boolean;
}

export function ApplicantTable({
  tenantsOnly = false,
  casesMode,
  managerCaseloadOnly = false,
  showReview = false,
  showAssignee = false,
  showRecordTypeFilter = false,
  inReviewOnly = false,
}: ApplicantTableProps) {
  const { user } = useUser();
  const [cityFilter, setCityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusSelection, setStatusSelection] = useState<Set<Applicant["status"]>>(
    () => new Set(DEFAULT_APPLICANT_STATUS_SELECTION)
  );
  const [soloStatusFilter, setSoloStatusFilter] = useState<Applicant["status"] | null>(
    null
  );
  const [statusMultiselect, setStatusMultiselect] = useState(true);
  const [metroFilter, setMetroFilter] = useState<string>("all");
  const [petsFilter, setPetsFilter] = useState<string>("all");
  const [accessibilityFilter, setAccessibilityFilter] = useState(false);
  const [recordTypeFilter, setRecordTypeFilter] = useState<RecordTypeFilter>(
    tenantsOnly ? "tenants" : "applicants"
  );
  const [cityInput, setCityInput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: applicants = [], isLoading } = useQuery<Applicant[]>({
    queryKey: ["applicants"],
    queryFn: async () => {
      const res = await fetch("/api/applicants");
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return res.json();
    },
  });

  const { data: vacancies = [] } = useQuery<Vacancy[]>({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      if (!res.ok) throw new Error("Failed to fetch vacancies");
      return res.json();
    },
  });

  const allCities = useMemo(() => {
    const cities = new Set<string>();
    applicants.forEach((a) => a.preferredCities.forEach((c) => cities.add(c)));
    return Array.from(cities).sort();
  }, [applicants]);

  const useStatusPills =
    !casesMode && !tenantsOnly && !inReviewOnly;

  const allMetros = useMemo(() => {
    const metros = new Set<string>();
    vacancies.forEach((v) => metros.add(v.metroArea));
    return Array.from(metros).sort();
  }, [vacancies]);

  const filtered = useMemo(() => {
    let list = [...applicants];

    if (casesMode === "in-progress") {
      list = list.filter((a) => IN_PROGRESS_STATUSES.includes(a.status));
    } else if (casesMode === "completed") {
      list = list.filter((a) => COMPLETED_STATUSES.includes(a.status));
    } else if (tenantsOnly) {
      list = list.filter(
        (a) => a.status === "TenancyConfirmed" || a.status === "MovedIn"
      );
    } else {
      list = list.filter((a) => a.status !== "TenancyConfirmed");
    }

    if (managerCaseloadOnly && isCaseManager(user.id)) {
      list = list.filter((a) => a.assignedCaseManagerId === user.id);
    }

    list.sort(
      (a, b) =>
        new Date(a.applicationDate).getTime() -
        new Date(b.applicationDate).getTime()
    );

    if (cityFilter.length > 0) {
      list = list.filter((a) =>
        a.preferredCities.some((c) => cityFilter.includes(c))
      );
    }

    if (useStatusPills) {
      if (soloStatusFilter) {
        list = list.filter((a) => a.status === soloStatusFilter);
      } else {
        list = list.filter((a) => statusSelection.has(a.status));
      }
    } else if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (metroFilter !== "all") {
      const metroCities = vacancies
        .filter((v) => v.metroArea === metroFilter)
        .map((v) => v.city);
      list = list.filter((a) =>
        a.preferredCities.some((c) => metroCities.includes(c))
      );
    }

    if (petsFilter === "yes") list = list.filter((a) => a.hasPets);
    if (petsFilter === "no") list = list.filter((a) => !a.hasPets);

    if (accessibilityFilter) {
      list = list.filter((a) => a.accessibilityNeeds.length > 0);
    }

    if (showRecordTypeFilter || inReviewOnly) {
      if (recordTypeFilter === "applicants") {
        list = list.filter(isApplicantRecord);
      } else if (recordTypeFilter === "tenants") {
        list = list.filter(isTenantRecord);
      }
    }

    if (inReviewOnly) {
      list = list.filter(isInReview);
    }

    return list;
  }, [
    applicants,
    tenantsOnly,
    casesMode,
    managerCaseloadOnly,
    user.id,
    cityFilter,
    statusFilter,
    useStatusPills,
    statusSelection,
    soloStatusFilter,
    metroFilter,
    petsFilter,
    accessibilityFilter,
    recordTypeFilter,
    showRecordTypeFilter,
    inReviewOnly,
    vacancies,
  ]);

  const statusVariant = (status: Applicant["status"]) => {
    switch (status) {
      case "Eligible":
      case "TenancyConfirmed":
      case "MovedIn":
        return "default" as const;
      case "Pending":
      case "Notified":
      case "MoveInScheduled":
      case "Stalled":
        return "warning" as const;
      case "Ineligible":
      case "Rejected":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const getReviewLabel = (applicant: Applicant) => {
    const reviewer = applicant.inReviewBy ?? {
      name: user.reviewerName,
      title: user.reviewerTitle,
    };
    return formatInReviewBy(reviewer.name, reviewer.title);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("applicationDate", {
        header: "Applied",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("fullName", {
        header: "Name",
        cell: (info) => (
          <Link
            href={`/applications/${info.row.original.id}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      ...(showAssignee
        ? [
            columnHelper.display({
              id: "assignee",
              header: "Case manager",
              cell: ({ row }) => (
                <ClaimControl
                  type="applicant"
                  id={row.original.id}
                  assignedCaseManagerId={row.original.assignedCaseManagerId}
                />
              ),
            }),
          ]
        : []),
      ...(tenantsOnly || showReview
        ? [
            columnHelper.display({
              id: "review",
              header: "Review",
              cell: ({ row }) => (
                <span className="text-sm text-slate-600">
                  {row.original.status === "TenancyConfirmed" ||
                  row.original.status === "MovedIn"
                    ? getReviewLabel(row.original)
                    : "—"}
                </span>
              ),
            }),
          ]
        : []),
      columnHelper.accessor("preferredCities", {
        header: "Cities",
        cell: (info) => info.getValue().join(", "),
      }),
      columnHelper.accessor("householdSize", { header: "HH Size" }),
      columnHelper.accessor("income", {
        header: "Income",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const applicant = info.row.original;
          return (
            <div className="flex flex-col items-start gap-1.5">
              <Badge variant={statusVariant(info.getValue())}>
                {formatStatus(info.getValue())}
              </Badge>
              {casesMode === "completed" && applicant.status === "Stalled" && (
                <RequestDocumentsButton applicantId={applicant.id} />
              )}
            </div>
          );
        },
      }),
      ...(casesMode !== "completed"
        ? [
            columnHelper.display({
              id: "matches",
              header: "Matches",
              cell: ({ row }) => {
                const matches = getMatchingVacancies(row.original, vacancies);
                return (
                  <span className="text-sm">
                    {matches.length > 0 ? (
                      <span className="font-medium text-emerald-700">
                        {matches.length} unit{matches.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </span>
                );
              },
            }),
          ]
        : []),
      columnHelper.display({
        id: "expand",
        header: "",
        cell: ({ row }) => {
          const isExpanded = expandedId === row.original.id;
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              aria-expanded={isExpanded}
              onClick={() =>
                setExpandedId(isExpanded ? null : row.original.id)
              }
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          );
        },
      }),
    ],
    [vacancies, expandedId, tenantsOnly, showReview, showAssignee, casesMode, user]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const addCity = () => {
    const c = cityInput.trim();
    if (c && !cityFilter.includes(c)) {
      setCityFilter([...cityFilter, c]);
      setCityInput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {showRecordTypeFilter && (
          <div className="space-y-1">
            <Label>Record</Label>
            <Select
              value={recordTypeFilter}
              onValueChange={(v) => setRecordTypeFilter(v as RecordTypeFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="applicants">Applicants</SelectItem>
                <SelectItem value="tenants">Tenants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {useStatusPills ? (
          <ApplicantStatusFilter
            selected={statusSelection}
            soloStatus={soloStatusFilter}
            multiselect={statusMultiselect}
            onSelectedChange={setStatusSelection}
            onSoloStatusChange={setSoloStatusFilter}
            onMultiselectChange={setStatusMultiselect}
          />
        ) : (
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(casesMode === "completed" || tenantsOnly
                  ? COMPLETED_STATUSES
                  : casesMode === "in-progress"
                    ? IN_PROGRESS_STATUSES
                    : APPLICANT_STATUS_OPTIONS
                ).map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1">
          <Label>Metro Area</Label>
          <Select value={metroFilter} onValueChange={setMetroFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All metros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allMetros.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Pets</Label>
          <Select value={petsFilter} onValueChange={setPetsFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Has pets</SelectItem>
              <SelectItem value="no">No pets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="accessibility"
            checked={accessibilityFilter}
            onCheckedChange={(c) => setAccessibilityFilter(c === true)}
          />
          <Label htmlFor="accessibility">Accessibility needs</Label>
        </div>
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label>City filter</Label>
            <div className="flex gap-2">
              <Select
                value=""
                onValueChange={(v) => {
                  if (v && !cityFilter.includes(v)) {
                    setCityFilter([...cityFilter, v]);
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Add city" />
                </SelectTrigger>
                <SelectContent>
                  {allCities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type city"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCity()}
                className="w-[140px]"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCity}>
                Add
              </Button>
            </div>
          </div>
          {cityFilter.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cityFilter.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setCityFilter(cityFilter.filter((x) => x !== c))}
                >
                  {c} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading applicants…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-3 text-left font-medium text-slate-600"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No applicants found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-slate-100 hover:bg-slate-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {expandedId === row.original.id && (
                      <tr className="border-t border-slate-100">
                        <td colSpan={columns.length} className="p-0">
                          <ApplicantDetailExpand
                            applicant={row.original}
                            vacancies={vacancies}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {applicants.length} · sorted by application date
        (oldest first)
      </p>
    </div>
  );
}
