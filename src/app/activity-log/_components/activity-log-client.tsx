"use client";

import { useState, useMemo, useEffect } from "react";
import type { ActivityLog } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

type ActivityLogClientProps = {
  initialLogs: ActivityLog[];
  users: string[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Hệ thống</span>
    <span className="mx-2">/</span>
    <span className="font-medium text-foreground">Nhật ký hoạt động</span>
  </div>
);

export function ActivityLogClient({ initialLogs, users }: ActivityLogClientProps) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const actions: ActivityLog['action'][] = ['Tạo', 'Cập nhật', 'Xóa', 'Đăng nhập', 'Duyệt', 'Xuất file'];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const from = dateRange?.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
      const to = dateRange?.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;

      const matchesDate = (!from || logDate >= from) && (!to || logDate <= to);
      const matchesUser = userFilter === "all" || log.user.name === userFilter;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        log.details.toLowerCase().includes(searchLower) ||
        log.target.type.toLowerCase().includes(searchLower) ||
        log.target.id.toLowerCase().includes(searchLower);

      return matchesDate && matchesUser && matchesAction && matchesSearch;
    });
  }, [logs, dateRange, userFilter, actionFilter, searchQuery]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, userFilter, actionFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredLogs.length
  );
  
  const getActionBadgeClass = (action: ActivityLog['action']) => {
    switch(action) {
      case 'Tạo': return 'bg-blue-100 text-blue-800';
      case 'Cập nhật': return 'bg-yellow-100 text-yellow-800';
      case 'Xóa': return 'bg-red-100 text-red-800';
      case 'Duyệt': return 'bg-green-100 text-green-800';
      case 'Đăng nhập': return 'bg-gray-200 text-gray-800';
      case 'Xuất file': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Nhật ký Hoạt động"
        breadcrumbs={<Breadcrumbs />}
        description="Theo dõi toàn bộ các hành động quan trọng diễn ra trên hệ thống."
      >
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Xuất báo cáo</Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Khoảng thời gian</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Người dùng</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">-- Tất cả người dùng --</SelectItem>
                    {users.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
             <div className="space-y-1">
                <label className="text-sm font-medium">Hành động</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="-- Tất cả --" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">-- Tất cả hành động --</SelectItem>
                     {actions.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <Input
                placeholder="Nội dung, đối tượng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>THỜI GIAN</TableHead>
                <TableHead>NGƯỜI DÙNG</TableHead>
                <TableHead>HÀNH ĐỘNG</TableHead>
                <TableHead>ĐỐI TƯỢNG</TableHead>
                <TableHead>CHI TIẾT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             <Avatar className="h-7 w-7">
                                <AvatarImage src={log.user.avatarUrl} alt={log.user.name} />
                                <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{log.user.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline" className={cn("font-semibold", getActionBadgeClass(log.action))}>
                           {log.action}
                         </Badge>
                    </TableCell>
                    <TableCell>
                        <div>{log.target.type}</div>
                        <div className="text-xs text-primary hover:underline cursor-pointer">{log.target.id}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có nhật ký nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredLogs.length > 0 ? startItem : 0}-{endItem} trên {filteredLogs.length} bản ghi
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
