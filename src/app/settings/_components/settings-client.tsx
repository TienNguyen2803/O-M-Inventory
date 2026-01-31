"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MASTER_DATA_TABLES,
  getMasterDataGroups,
  type MasterDataTableConfig,
} from "@/lib/master-data-tables";
import { MasterDataTable } from "./master-data-table";
import { PermissionsSettings } from "./permissions-settings";

const Breadcrumbs = () => (
  <div className="text-sm text-muted-foreground mb-1">
    <span className="cursor-pointer hover:text-primary">Trang chủ</span>
    <span className="mx-2">/</span>
    <span className="cursor-pointer hover:text-primary">Hệ thống</span>
  </div>
);

export function SettingsClient() {
  const groups = useMemo(() => getMasterDataGroups(), []);
  const [selectedTable, setSelectedTable] = useState<MasterDataTableConfig>(
    MASTER_DATA_TABLES[0]
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    groups.map((g) => g.group)
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  return (
    <div className="w-full space-y-2">
      <PageHeader
        title="Cài đặt hệ thống"
        breadcrumbs={<Breadcrumbs />}
      />

      <Tabs defaultValue="master-data" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="master-data">Master Data</TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Phân quyền
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master-data">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Category List */}
            <Card className="col-span-3">
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-2">
                    {groups.map((groupData) => (
                      <Collapsible
                        key={groupData.group}
                        open={expandedGroups.includes(groupData.group)}
                        onOpenChange={() => toggleGroup(groupData.group)}
                      >
                        <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-md">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 mr-1 transition-transform",
                              expandedGroups.includes(groupData.group) &&
                                "rotate-90"
                            )}
                          />
                          {groupData.group}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 space-y-0.5">
                            {groupData.tables.map((table) => (
                              <button
                                key={table.id}
                                onClick={() => setSelectedTable(table)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                                  selectedTable.id === table.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-foreground"
                                )}
                              >
                                {table.name}
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Content - Data Table */}
            <div className="col-span-9">
              <MasterDataTable
                tableId={selectedTable.id}
                tableName={selectedTable.name}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

