"use client";
import React, { ReactNode, useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Selection,
  SortDescriptor,
  Link,
} from "@heroui/react";
import { FaSearch } from "react-icons/fa";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { TripType } from "@/types/trips";
import axios from "axios";

const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "CITIES", uid: "destinationItinerary" },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "SCRAPED ON", uid: "scrapedOn", sortable: true },
  { name: "STATUS", uid: "status" }, // Status column
];

export default function Trips() {
  const [trips, setTrips] = useState<TripType[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(USER_API_ROUTES.GET_ALL_TRIPS);
      setTrips(response.data.trips || []);
    };
    fetchData();
  }, []);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filtered = trips;
    if (hasSearchFilter) {
      filtered = filtered.filter((trip) =>
        trip.id.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [trips, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: TripType, b: TripType) => {
      const first = a[sortDescriptor.column as keyof TripType] as any;
      const second = b[sortDescriptor.column as keyof TripType] as any;
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (trip: TripType, columnKey: React.Key) => {
      const cellValue = trip[columnKey as keyof TripType];
      function formatDateTime(inputDate: string) {
        const date = new Date(inputDate);
        return date.toLocaleString();
      }
      switch (columnKey) {
        case "id":
          return <Link href={`/trip/${cellValue}`} target="_blank">{cellValue as string}</Link>;
        case "destinationItinerary":
          // Guard for missing or non-array data
          if (!Array.isArray(cellValue)) return null;
          return (
            <div className="flex gap-2">
              {(cellValue as { place: string }[])
                .slice(0, 4)
                .map((dest, idx) => (
                  <Chip
                    key={dest.place || idx}
                    color={["primary", "secondary", "success", "warning", "danger"][idx % 5] as any}
                  >
                    {dest.place}
                  </Chip>
                ))}
            </div>
          );
        case "scrapedOn":
          return typeof cellValue === "string" ? formatDateTime(cellValue) : "-";
        case "price":
          return `₹${cellValue}`;
        case "status":
          return trip.status ? (
            <Chip color={trip.status === "complete" ? "success" : "danger"}>{trip.status}</Chip>
          ) : "N/A";
        default:
          return cellValue;
      }
    },
    []
  );

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end bg-white p-2 rounded-2xl shadow-sm">
        <Input
          isClearable
          className="w-full"
          placeholder="Search by package id..."
          startContent={<FaSearch />}
          value={filterValue}
          onClear={() => { setFilterValue(""); setPage(1); }}
          onValueChange={(val) => { setFilterValue(val); setPage(1); }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">Total {trips.length} trips</span>
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>
    </div>
  );

  const bottomContent = (
    <div className="py-2 px-2 flex justify-between items-center ">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === "all"
          ? "All items selected"
          : `${selectedKeys.size} of ${filteredItems.length} selected`}
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
          isDisabled={pages === 1}
          size="sm"
          variant="flat"
          onPress={() => setPage(prev => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <Button
          isDisabled={pages === 1}
          size="sm"
          variant="flat"
          onPress={() => setPage(prev => Math.min(pages, prev + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="m-5">
      {trips.length > 0 && (
        <Table
          aria-label="Trips Table"
          isHeaderSticky
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{ wrapper: "max-h-[500px] h-[500px]" }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.uid} allowsSorting={column.sortable}>{column.name}</TableColumn>}
          </TableHeader>
          <TableBody emptyContent={"No trips found"} items={sortedItems}>
            {(item: TripType) => (
              <TableRow key={item.id}>
                {(columnKey) =>
                  <TableCell>
                    {renderCell(item, columnKey) as ReactNode}
                  </TableCell>
                }
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
