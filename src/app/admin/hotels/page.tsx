"use client";
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
  Pagination,
  Selection,
  SortDescriptor,
  Chip,
  Image,
} from "@heroui/react";
import { FaSearch, FaHotel, FaMapMarkerAlt, FaDollarSign, FaCalendar } from "react-icons/fa";
import { apiClient } from "@/lib";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { HotelType } from "@/types/hotel";
import axios from "axios";

const columns = [
  { name: "HOTEL", uid: "hotel", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "LOCATION", uid: "location", sortable: true },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STATUS", uid: "status" },
  { name: "SCRAPED ON", uid: "scrappedOn", sortable: true },
];

export default function Hotels() {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(USER_API_ROUTES.GET_ALL_HOTELS);
        if (response.data.hotels) {
          setHotels(response.data.hotels);
        } else {
          setHotels([]);
        }
      } catch (err) {
        setError("Failed to fetch hotels data");
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "scrappedOn",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = columns;

  const filteredItems = React.useMemo(() => {
    let filteredHotels = hotels;

    if (hasSearchFilter) {
      filteredHotels = filteredHotels.filter((hotel) =>
        hotel.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        hotel.location.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredHotels;
  }, [hotels, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: HotelType, b: HotelType) => {
      const first = a[sortDescriptor.column as keyof HotelType] as any;
      const second = b[sortDescriptor.column as keyof HotelType] as any;
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

  const renderCell = React.useCallback((hotel: HotelType, columnKey: React.Key) => {
    const cellValue = hotel[columnKey as keyof HotelType];

    switch (columnKey) {
      case "hotel":
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {hotel.image ? (
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder-hotel.jpg"
                />
              ) : (
                <FaHotel className="text-gray-400 text-xl" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {hotel.name}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FaMapMarkerAlt size={10} />
                {hotel.location}
              </span>
            </div>
          </div>
        );

      case "name":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white capitalize">
              {hotel.name}
            </span>
          </div>
        );

      case "location":
        return (
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" size={12} />
            <span className="text-sm text-gray-300 capitalize">
              {hotel.location}
            </span>
          </div>
        );

      case "price":
        return (
          <div className="flex items-center gap-1">
            <FaDollarSign className="text-green-400" size={12} />
            <span className="text-sm font-semibold text-green-400">
              {hotel.price}
            </span>
          </div>
        );

      case "status":
        return (
          <Chip
            className="capitalize border-none gap-1 text-white"
            color="success"
            size="sm"
            variant="dot"
          >
            Available
          </Chip>
        );

      case "scrappedOn":
        return (
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-400" size={12} />
            <span className="text-sm text-gray-300">
              {formatDate(cellValue as string)}
            </span>
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  // Count completed vs total
  const completedHotels = hotels.length;
  const totalHotels = hotels.length;

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

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
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
          <FaHotel className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-white">Error loading hotels</h3>
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
                Hotels
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                All the info about scraped hotels.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {totalHotels}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">
                    Total Hotels
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {completedHotels}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">
                    Available
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
          {/* Hotels Section Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white">
                  Hotels
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Track all hotels and accommodations available for booking
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Filter Type</span>
                  <select className="text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                    <option>All Types</option>
                    <option>Luxury</option>
                    <option>Budget</option>
                    <option>Business</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{rowsPerPage} rows</span>
                </div>
              </div>
            </div>
          </div>

          {hotels.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <FaHotel className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-white">
                No hotels found
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Start scraping to get hotel data from various booking platforms.
              </p>
              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Scraping Hotels
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
                  placeholder="Search hotels..."
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
                aria-label="Hotels table with custom cells and pagination"
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
                <TableHeader columns={headerColumns}>
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
                <TableBody emptyContent={"No hotels found"} items={sortedItems}>
                  {(item: HotelType) => (
                    <TableRow key={item.id}>
                      {(columnKey) => (
                        <TableCell>{renderCell(item, columnKey)}</TableCell>
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
