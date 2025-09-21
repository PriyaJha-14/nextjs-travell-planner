"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Selection,
  ChipProps,
  SortDescriptor,
  Card,
  CardBody,
} from "@heroui/react";
import { FaChevronDown, FaSearch, FaArrowLeft } from "react-icons/fa";
import { apiClient } from "@/lib";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { useAppStore } from "@/store";
import { BookingType } from "@/types/booking";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Architects_Daughter } from "next/font/google";
import axios from "axios";

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

const statusColorMap: Record<string, ChipProps["color"]> = {
  trips: "success",
  flights: "primary",
  hotels: "secondary",
};

const columns = [
  { name: "ID", uid: "id" },
  { name: "BOOKING TYPE", uid: "bookingType" },
  { name: "NAME", uid: "name" },
  { name: "AMOUNT", uid: "totalAmount" },
  { name: "PAYMENT STATUS", uid: "isCompleted" },
  { name: "BOOKING DATE", uid: "createdAt" },
  { name: "BOOKING ON", uid: "date" },
];

const bookingsType = [
  { name: "Trips", uid: "trips" },
  { name: "Flights", uid: "flights" },
  { name: "Hotels", uid: "hotels" },
];

interface BookingTypeWithName extends BookingType {
  name: string;
}

export default function MyBookingsPage() {
  // ✅ ALL HOOKS MUST BE AT THE TOP - No conditional calls
  const router = useRouter();
  const { userInfo } = useAppStore();
  
  // ✅ All useState hooks
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<BookingTypeWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ✅ All useEffect hooks
  useEffect(() => {
    if (!userInfo && !loading) {
      setIsRedirecting(true);
      router.push('/');
    }
  }, [userInfo, loading, router]);

  useEffect(() => {
    const getData = async () => {
      if (!userInfo?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await axios.post(USER_API_ROUTES.GET_USER_BOOKINGS, {
          userId: userInfo.id,
        });
        console.log("📊 Bookings data:", data.data.bookings);
        setBookings(data.data.bookings || []);
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.id) {
      getData();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  // ✅ All useMemo and useCallback hooks
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredBookings = [...bookings];

    if (hasSearchFilter) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.name?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length !== bookingsType.length) {
      filteredBookings = filteredBookings.filter((booking) =>
        Array.from(statusFilter).includes(booking.bookingType)
      );
    }

    return filteredBookings;
  }, [bookings, filterValue, hasSearchFilter, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof BookingTypeWithName] as any;
      const second = b[sortDescriptor.column as keyof BookingTypeWithName] as any;
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((booking: BookingTypeWithName, columnKey: React.Key) => {
    const cellValue = booking[columnKey as keyof BookingTypeWithName];

    switch (columnKey) {
      case "date":
        return typeof cellValue === 'string' ? cellValue.split("T")[0] : cellValue;
      case "createdAt":
        return typeof cellValue === 'string' ? cellValue.split("T")[0] : cellValue;
      case "bookingType":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[booking.bookingType]}
            size="sm"
            variant="flat"
            startContent={
              booking.bookingType === 'flights' ? '✈️' :
              booking.bookingType === 'hotels' ? '🏨' :
              booking.bookingType === 'trips' ? '🎯' : '📋'
            }
          >
            {cellValue}
          </Chip>
        );
      case "isCompleted":
        return (
          <Chip
            className="capitalize"
            color={cellValue ? "success" : "warning"}
            size="sm"
            variant="flat"
          >
            {cellValue ? "Completed" : "Pending"}
          </Chip>
        );
      case "totalAmount":
        return <span className="font-bold text-green-600">${cellValue}</span>;
      default:
        return cellValue;
    }
  }, []);

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

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<FaSearch className="text-gray-400" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-gray-800/50 border-gray-600 hover:bg-gray-700",
            }}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                  className="bg-gray-800/50 text-white border-gray-600"
                >
                  Bookings Type
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
                classNames={{
                  base: "bg-gray-800 border border-gray-600",
                  list: "bg-gray-800",
                }}
              >
                {bookingsType.map((bookingType) => (
                  <DropdownItem 
                    key={bookingType.uid} 
                    className="capitalize text-white hover:bg-gray-700"
                  >
                    {bookingType.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-small">
            Total {filteredItems.length} bookings
          </span>
          <label className="flex items-center text-gray-400 text-small">
            Rows per page:
            <select
              className="bg-gray-800 text-gray-300 outline-none text-small ml-2 px-2 py-1 rounded border border-gray-600"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, statusFilter, filteredItems.length, onRowsPerPageChange, onClear, rowsPerPage]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-gray-400">
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
          total={pages || 1}
          onChange={setPage}
          classNames={{
            wrapper: "gap-0 overflow-visible h-8 rounded border border-divider",
            item: "w-8 h-8 text-small rounded-none bg-transparent",
            cursor: "bg-gradient-to-b shadow-lg from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-bold",
          }}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
            className="bg-gray-800 text-white border-gray-600"
          >
            Previous
          </Button>
          <Button
            isDisabled={page === pages || pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
            className="bg-gray-800 text-white border-gray-600"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]);

  // ✅ NOW all conditional logic comes AFTER all hooks
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isRedirecting ? 'Redirecting...' : 'Loading your bookings...'}
          </p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  // ✅ Main render - all hooks have been called above
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500 rounded-full translate-x-32"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600 rounded-full translate-y-40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header with Go Back Button */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <Button
              variant="flat"
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
              startContent={<FaArrowLeft />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="SmartScrape Logo"
                height={60}
                width={60}
                className="mx-auto rounded-full shadow-lg"
              />
            </div>
            <h1 className={`text-3xl uppercase font-bold ${ArchitectsDaughter.className} text-white drop-shadow-lg`}>
              MY BOOKINGS
            </h1>
            <p className="text-gray-400">Track and manage all your reservations</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Enhanced Table Container */}
        <Card className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700 shadow-2xl backdrop-blur-xl">
          <CardBody className="p-6">
            <Table
              isHeaderSticky
              bottomContent={bottomContent}
              bottomContentPlacement="outside"
              classNames={{
                wrapper: "max-h-[500px] bg-transparent",
                th: "bg-gray-800/80 text-white border-b border-gray-600 backdrop-blur-sm",
                td: "text-gray-300 border-b border-gray-800/50",
                table: "bg-transparent",
              }}
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              sortDescriptor={sortDescriptor}
              topContent={topContent}
              topContentPlacement="outside"
              onSelectionChange={setSelectedKeys}
              onSortChange={setSortDescriptor}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn 
                    key={column.uid} 
                    align="start"
                    allowsSorting
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody 
                emptyContent={
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
                    <p className="text-gray-400 mb-4">You haven't made any bookings yet.</p>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      onClick={() => router.push('/')}
                    >
                      Start Booking
                    </Button>
                  </div>
                }
                items={sortedItems}
                loadingContent={
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-white">Loading bookings...</p>
                  </div>
                }
              >
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-600/30">
            <CardBody className="text-center p-4">
              <div className="text-2xl font-bold text-blue-400">{bookings.length}</div>
              <div className="text-sm text-gray-400">Total Bookings</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-600/30">
            <CardBody className="text-center p-4">
              <div className="text-2xl font-bold text-green-400">
                {bookings.filter(b => b.isCompleted).length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-600/30">
            <CardBody className="text-center p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {bookings.filter(b => !b.isCompleted).length}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-600/30">
            <CardBody className="text-center p-4">
              <div className="text-2xl font-bold text-purple-400">
                ${bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">Total Spent</div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
