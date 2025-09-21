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
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
} from "@heroui/react";

import { 
  FaChevronDown, 
  FaSearch, 
  FaPlane, 
  FaHotel, 
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { BookingType } from "@/types/booking";
import axios from "axios";

const statusColorMap: Record<string, ChipProps["color"]> = {
  trips: "success",
  flights: "primary",
  hotels: "warning",
};

const bookingTypeIcons = {
  trips: FaMapMarkerAlt,
  flights: FaPlane,
  hotels: FaHotel,
};

const columns = [
  { name: "", uid: "icon", width: "60px" },
  { name: "TYPE", uid: "bookingType", width: "100px" },
  { name: "ID", uid: "id", width: "80px" },
  { name: "BOOKINGS", uid: "name", width: "200px" },
  { name: "AMOUNT", uid: "totalAmount", width: "120px" },
  { name: "STATUS", uid: "isCompleted", width: "100px" },
  { name: "BOOKING DATE", uid: "createdAt", width: "140px" },
  { name: "TRAVEL DATE", uid: "date", width: "140px" },
];

const bookingsType = [
  { name: "Trips", uid: "trips" },
  { name: "Flights", uid: "flights" },
  { name: "Hotels", uid: "hotels" },
];

interface BookingTypeWithName extends BookingType {
  name: string;
}

export default function Bookings() {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);
  const [bookings, setBookings] = useState<BookingTypeWithName[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  type Bookings = BookingTypeWithName;

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const data = await axios.get(USER_API_ROUTES.GET_ALL_BOOKINGS);
        console.log(data.data.bookings);
        setBookings(data.data.bookings);
      } catch (error) {
        console.log({ error });
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = columns;

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...bookings];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== bookingsType.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.bookingType)
      );
    }

    return filteredUsers;
  }, [bookings, filterValue, hasSearchFilter, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Bookings, b: Bookings) => {
      const first = a[sortDescriptor.column as keyof Bookings] as number;
      const second = b[sortDescriptor.column as keyof Bookings] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((booking: Bookings, columnKey: React.Key) => {
    const cellValue = booking[columnKey as keyof Bookings];
    const IconComponent = bookingTypeIcons[booking.bookingType as keyof typeof bookingTypeIcons];

    switch (columnKey) {
      case "icon":
        return (
          <div className="flex items-center justify-center">
            <div className={`p-2 rounded-lg ${
              booking.bookingType === 'trips' ? 'bg-emerald-500/20' :
              booking.bookingType === 'flights' ? 'bg-blue-500/20' :
              'bg-amber-500/20'
            }`}>
              <IconComponent className={`text-lg ${
                booking.bookingType === 'trips' ? 'text-emerald-400' :
                booking.bookingType === 'flights' ? 'text-blue-400' :
                'text-amber-400'
              }`} />
            </div>
          </div>
        );
      case "bookingType":
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium uppercase tracking-wide">
              {cellValue}
            </span>
          </div>
        );
      case "id":
        return (
          <div className="font-mono text-gray-400 text-sm">
            {cellValue}
          </div>
        );
      case "name":
        return (
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-500 text-xs" />
            <span className="text-gray-200 font-medium">{cellValue}</span>
          </div>
        );
      case "totalAmount":
        const amount = Number(cellValue);
        const dollarAmount = (amount * 1).toFixed(2); // Convert INR to USD (approximate rate)
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">$</span>
            <span className="text-white font-semibold">{Number(dollarAmount).toLocaleString()}</span>
          </div>
        );
      case "date":
        return (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FaCalendarAlt className="text-xs" />
            <span>{(cellValue as string).split("T")[0]}</span>
          </div>
        );
      case "createdAt":
        return (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FaCreditCard className="text-xs" />
            <span>{(cellValue as string).split("T")[0]}</span>
          </div>
        );
      case "isCompleted":
        return (
          <div className="flex items-center gap-2">
            {cellValue ? (
              <>
                <FaCheckCircle className="text-emerald-400 text-sm" />
                <span className="text-emerald-400 text-sm font-medium">Completed</span>
              </>
            ) : (
              <>
                <FaClock className="text-amber-400 text-sm" />
                <span className="text-amber-400 text-sm font-medium">Pending</span>
              </>
            )}
          </div>
        );
      default:
        return <span className="text-gray-300">{cellValue}</span>;
    }
  }, []);

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

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Bookings</h1>
            <p className="text-gray-400 text-sm">Track all bookings and reservations done by users</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{bookings.length}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Bookings</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">
                {bookings.filter(b => b.isCompleted).length}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Completed</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center">
          <Input
            isClearable
            className="w-full max-w-sm"
            placeholder="Search bookings..."
            startContent={<FaSearch className="text-gray-500 text-sm" />}
            value={filterValue}
            variant="bordered"
            size="sm"
            classNames={{
              input: "text-white text-sm",
              inputWrapper: "bg-gray-800/50 border-gray-600 hover:border-gray-500",
            }}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          
          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:border-gray-500"
                  endContent={<FaChevronDown className="text-xs" />}
                >
                  Filter Type
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Booking Type Filter"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
                className="bg-gray-800"
              >
                {bookingsType.map((bookingType) => (
                  <DropdownItem 
                    key={bookingType.uid} 
                    className="text-white hover:bg-gray-700"
                  >
                    {bookingType.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <select
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-gray-500"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="10">10 rows</option>
              <option value="15">15 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
            </select>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    statusFilter,
    bookings.length,
    rowsPerPage,
    onRowsPerPageChange,
    onClear,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex justify-between items-center px-2 py-3">
        <span className="text-small text-gray-400">
          Showing {items.length} of {filteredItems.length} bookings
        </span>
        
        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            wrapper: "gap-2",
            item: "w-8 h-8 text-small bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700",
            cursor: "bg-blue-600 text-white shadow-lg",
          }}
        />
      </div>
    );
  }, [items.length, filteredItems.length, page, pages]);

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gray-900">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Table
          isHeaderSticky
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "bg-gray-800/80 backdrop-blur border border-gray-700 rounded-lg shadow-2xl",
            table: "bg-transparent",
            thead: "[&>tr]:first:shadow-none",
            tbody: "bg-transparent",
            tr: [
              "border-b border-gray-700/50",
              "hover:bg-gray-700/30 transition-colors duration-200",
              "group",
            ],
            th: [
              "bg-gray-800/90 backdrop-blur",
              "text-gray-300 font-semibold text-xs uppercase tracking-wide",
              "border-b border-gray-600",
              "py-4 px-4",
              "first:rounded-tl-lg last:rounded-tr-lg",
            ],
            td: [
              "py-4 px-4",
              "group-hover:text-white transition-colors duration-200",
            ],
          }}
          selectedKeys={selectedKeys}
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
                align={column.uid === "icon" ? "center" : "start"}
                width={column.width}
                className="text-gray-300 font-semibold"
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            emptyContent={
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-gray-600 mb-4">
                  <FaSearch className="text-6xl" />
                </div>
                <p className="text-xl font-medium text-gray-400 mb-2">No bookings found</p>
                <p className="text-gray-500 text-center max-w-md">
                  {hasSearchFilter 
                    ? "No bookings match your search criteria. Try adjusting your filters." 
                    : "No booking data available at the moment."
                  }
                </p>
              </div>
            } 
            items={sortedItems}
            isLoading={isLoading}
          >
            {(item) => (
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
    </div>
  );
}
