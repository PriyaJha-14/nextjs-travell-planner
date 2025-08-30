"use client";
import type { Selection, ChipProps, SortDescriptor } from "@heroui/react";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Link,
} from "@heroui/react";

import { FaChevronDown, FaSearch } from "react-icons/fa";

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "primary",
  failed: "danger",
  complete: "success",
};

const columns = [
  { name: "ID", uid: "id" },
  { name: "URL", uid: "url" },
  { name: "CREATED AT", uid: "createdAt" },
  { name: "JOB TYPE", uid: "jobType" },
  { name: "STATUS", uid: "status" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Failed", uid: "failed" },
  { name: "Complete", uid: "complete" },
];

interface JobType {
  id: string;
  url: string;
  createdAt: string;
  jobType: any;
  status: "active" | "failed" | "complete";
}

export default function CurrentlyScrapingTable({ jobs = [] }: { jobs: JobType[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = columns;

  const filteredItems = React.useMemo(() => {
    let filtered = jobs;

    if (hasSearchFilter) {
      filtered = filtered.filter((job) =>
        job.url.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      statusFilter instanceof Set &&
      statusFilter.size > 0
    ) {
      filtered = filtered.filter((job) => statusFilter.has(job.status));
    }

    return filtered;
  }, [jobs, hasSearchFilter, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = React.useCallback(
    (job: JobType, columnKey: React.Key) => {
      const cellValue = job[columnKey as keyof JobType];

      function formatDateAndTime(inputDate: string) {
        const date = new Date(inputDate);
        const options = {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short",
        } as Intl.DateTimeFormatOptions;
        return new Intl.DateTimeFormat("en-US", options).format(date);
      }

      switch (columnKey) {
        case "url":
          return (
            <Link className="text-blue-500" href={cellValue} target="_blank">
              {cellValue}
            </Link>
          );
        case "jobType":
          const jobTypeValue =
            typeof cellValue === "object" && cellValue !== null ? cellValue.type : cellValue;
          return <span>{jobTypeValue}</span>;
        case "createdAt":
          return <span>{formatDateAndTime(cellValue)}</span>;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[job.status]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback(
    (value?: string) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
      } else {
        setFilterValue("");
      }
    },
    []
  );

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-wrap justify-between gap-3 items-end">
        <Input
          isClearable
          className="flex-grow min-w-[200px] max-w-[44%]"
          placeholder="Search by name..."
          startContent={<FaSearch />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3 z-50 relative">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<FaChevronDown className="text-small" />}
                variant="flat"
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Status filter"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
              className="z-50"
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {status.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, statusFilter, onClear]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys instanceof Set ? selectedKeys.size : 0} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={page === pages || pages === 0}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative z-50">
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px] relative z-50",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No jobs found"} items={items}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
