"use client";

import { useState, useMemo, useEffect } from "react";
import type { WarehouseLocation } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WarehouseForm, type WarehouseFormValues } from "./warehouse-form";

type WarehousesClientProps = {
  initialLocations: WarehouseLocation[];
};

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Danh mục</span>
  </div>
);

export function WarehousesClient({ initialLocations }: WarehousesClientProps) {
  const [locations, setLocations] =
    useState<WarehouseLocation[]>(initialLocations);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<WarehouseLocation | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const { toast } = useToast();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const areas = useMemo(
    () => [...new Set(locations.map((l) => l.area))],
    [locations]
  );
  const types = useMemo(
    () => [...new Set(locations.map((l) => l.type))],
    [locations]
  );

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        location.code.toLowerCase().includes(searchLower) ||
        location.name.toLowerCase().includes(searchLower);

      const matchesArea = areaFilter === "all" || location.area === areaFilter;
      const matchesType = typeFilter === "all" || location.type === typeFilter;

      return matchesSearch && matchesArea && matchesType;
    });
  }, [locations, searchQuery, areaFilter, typeFilter]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, areaFilter, typeFilter]);

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    currentPage * itemsPerPage,
    filteredLocations.length
  );

  const handleAdd = () => {
    setSelectedLocation(null);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setViewMode(false);
    setIsFormOpen(true);
  };

  const handleView = (location: WarehouseLocation) => {
    setSelectedLocation(location);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = (locationId: string) => {
    setLocations(locations.filter((l) => l.id !== locationId));
    toast({
      title: "Thành công",
      description: "Đã xóa vị trí kho thành công.",
      variant: "destructive",
    });
  };

  const handleFormSubmit = (values: WarehouseFormValues) => {
    if (viewMode) {
      setIsFormOpen(false);
      return;
    }
    const isEditing = !!selectedLocation;

    if (isEditing) {
      const updatedLocation: WarehouseLocation = {
        ...selectedLocation,
        ...values,
        status: selectedLocation.status, // Keep original status
      };
      setLocations(
        locations.map((l) =>
          l.id === selectedLocation.id ? updatedLocation : l
        )
      );
    } else {
      const newLocation: WarehouseLocation = {
        id: `wh-${Date.now()}`,
        status: "Active", // Default status
        items: [],
        ...values,
      };
      setLocations([newLocation, ...locations]);
    }
    setIsFormOpen(false);
    toast({
      title: "Thành công",
      description: isEditing
        ? "Đã cập nhật vị trí kho."
        : "Đã thêm vị trí kho mới.",
    });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-2 w-full">
      <PageHeader
        title="Danh mục Kho"
        breadcrumbs={<Breadcrumbs />}
      >
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả khu vực --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả khu vực --</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Mã vị trí, Tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="-- Tất cả loại --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Tất cả loại --</SelectItem>
                 {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã vị trí</TableHead>
                <TableHead>Tên vị trí</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLocations.length > 0 ? (
                paginatedLocations.map((location, index) => (
                  <TableRow key={location.id}>
                    <TableCell className="text-center">
                      {startItem + index}
                    </TableCell>
                    <TableCell
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleView(location)}
                    >
                      {location.code}
                    </TableCell>
                    <TableCell>{location.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.area}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold",
                          location.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {location.status === "Active"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleView(location)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/80 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Bạn có chắc chắn muốn xóa?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể được hoàn tác. Vị trí "
                                {location.name}" sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(location.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy vị trí nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredLocations.length > 0 ? startItem : 0}-{endItem} trên {filteredLocations.length} bản ghi
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
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? `Chi tiết Vị trí kho: ${selectedLocation?.name}`
                : selectedLocation
                ? "Cập nhật Vị trí kho"
                : "Tạo Vị trí kho mới"}
            </DialogTitle>
          </DialogHeader>
          <WarehouseForm
            location={selectedLocation}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            viewMode={viewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
