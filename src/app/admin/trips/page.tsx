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
  Image,
} from "@heroui/react";
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaCalendar, FaRoute, FaTags } from "react-icons/fa";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { TripType } from "@/types/trips";
import axios from "axios";

const columns = [
  { name: "TRIP", uid: "trip", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "DESTINATIONS", uid: "destinationItinerary" },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "SCRAPED ON", uid: "scrapedOn", sortable: true },
];

// Helper function to ensure valid ReactNode
const ensureReactNode = (value: any): ReactNode => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (React.isValidElement(value)) {
    return value;
  }
  
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  
  if (Array.isArray(value)) {
    return <span className="text-gray-400">Array data</span>;
  }
  
  if (typeof value === "object") {
    return <span className="text-gray-400">Object data</span>;
  }
  
  return String(value);
};

export default function Trips() {
  const [trips, setTrips] = useState<TripType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(USER_API_ROUTES.GET_ALL_TRIPS);
        setTrips(response.data.trips || []);
      } catch (err) {
        setError("Failed to fetch trips data");
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "scrapedOn",
    direction: "descending",
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filtered = trips;
    if (hasSearchFilter) {
      filtered = filtered.filter((trip) =>
        trip.id.toLowerCase().includes(filterValue.toLowerCase()) ||
        trip.name.toLowerCase().includes(filterValue.toLowerCase())
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const renderCell = useCallback((trip: TripType, columnKey: React.Key): ReactNode => {
    const cellValue = trip[columnKey as keyof TripType];

    switch (columnKey) {
      case "trip":
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {trip.images && Array.isArray(trip.images) && trip.images.length > 0 ? (
                <Image
                  src={trip.images[0]}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder-trip.jpg"
                />
              ) : (
                <FaRoute className="text-gray-400 text-xl" />
              )}
            </div>
            <div className="flex flex-col">
              <Link
                href={`/trip/${trip.id}`}
                target="_blank"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                {trip.id}
              </Link>
              <span className="text-xs text-gray-400">
                {trip.nights}N/{trip.days}D
              </span>
            </div>
          </div>
        );

      case "name":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white capitalize">
              {trip.name}
            </span>
            <span className="text-xs text-gray-400">
              {trip.city || 'Unknown destination'}
            </span>
          </div>
        );

      case "destinationItinerary":
        // ✅ FIXED: Properly handle the array and return valid ReactNode
        if (!cellValue || !Array.isArray(cellValue)) {
          return <span className="text-gray-400 text-sm">No destinations</span>;
        }
        
        try {
          const destinations = cellValue as { place: string }[];
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {destinations
                .slice(0, 3)
                .map((dest, idx) => (
                  <Chip
                    key={`dest-${idx}-${dest.place || 'unknown'}`}
                    size="sm"
                    className="text-xs"
                    color={["primary", "secondary", "success"][idx % 3] as any}
                  >
                    {dest.place || `Place ${idx + 1}`}
                  </Chip>
                ))}
              {destinations.length > 3 && (
                <Chip size="sm" className="text-xs bg-gray-700 text-gray-300">
                  +{destinations.length - 3} more
                </Chip>
              )}
            </div>
          );
        } catch (error) {
          return <span className="text-gray-400 text-sm">Invalid destination data</span>;
        }

      case "price":
        return (
          <div className="flex items-center gap-1">
            <FaDollarSign className="text-green-400" size={12} />
            <span className="text-sm font-semibold text-green-400">
              ₹{cellValue}
            </span>
          </div>
        );

      case "status":
        return (
          <Chip
            className="capitalize border-none gap-1 text-white"
            color={trip.status === "active" ? "success" : "default"}
            size="sm"
            variant="dot"
          >
            {trip.status || "active"}
          </Chip>
        );

      case "scrapedOn":
        return (
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-400" size={12} />
            <span className="text-sm text-gray-300">
              {typeof cellValue === "string" ? formatDate(cellValue) : "-"}
            </span>
          </div>
        );

      default:
        // ✅ FIXED: Ensure all return types are valid ReactNodes
        return ensureReactNode(cellValue);
    }
  }, []);

  // Count active vs total trips
  const activeTrips = trips.filter(trip => trip.status === "active").length;
  const totalTrips = trips.length;

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaRoute className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Error loading trips</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <div className="mt-6">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section - Dark Theme */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white sm:truncate">
                Trips
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                All the scraped travel packages and destinations.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {totalTrips}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">
                    Total Trips
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {activeTrips}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {/* Trips Section Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white">
                  Trips
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Track all travel packages and holiday destinations
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Filter Status</span>
                  <select className="text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{rowsPerPage} rows</span>
                </div>
              </div>
            </div>
          </div>

          {trips.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <FaRoute className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-white">
                No trips found
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Start scraping to get trip data from various travel platforms.
              </p>
              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Scraping Trips
                </Button>
              </div>
            </div>
          ) : (
            /* Table Content */
            <div className="px-6 py-4">
              {/* Search Bar */}
              <div className="mb-6">
                <Input
                  isClearable
                  className="max-w-md"
                  placeholder="Search by package ID or name..."
                  startContent={<FaSearch className="text-gray-400" />}
                  value={filterValue}
                  onClear={onClear}
                  onValueChange={onSearchChange}
                  size="sm"
                  classNames={{
                    input: "bg-gray-700 text-white",
                    inputWrapper: "bg-gray-700 border-gray-600 hover:border-gray-500",
                  }}
                />
              </div>

              {/* Table */}
              <Table
                aria-label="Trips table with custom cells and pagination"
                isHeaderSticky
                bottomContent={
                  <div className="flex w-full justify-between items-center">
                    <span className="text-gray-400 text-small">
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
                        onPress={onPreviousPage}
                        className="bg-gray-700 text-white hover:bg-gray-600"
                      >
                        Previous
                      </Button>
                      <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={onNextPage}
                        className="bg-gray-700 text-white hover:bg-gray-600"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                }
                bottomContentPlacement="outside"
                classNames={{
                  wrapper: "min-h-[400px] bg-gray-800",
                  th: "bg-gray-700 text-gray-300 font-semibold border-b border-gray-600",
                  tbody: "divide-y divide-gray-700",
                  tr: "hover:bg-gray-700/50",
                  td: "border-b border-gray-700",
                }}
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      align={column.uid === "actions" ? "center" : "start"}
                      allowsSorting={column.sortable}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody emptyContent={"No trips found"} items={sortedItems}>
                  {(item: TripType) => (
                    <TableRow key={item.id}>
                      {(columnKey) => (
                        <TableCell>
                          {renderCell(item, columnKey)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
