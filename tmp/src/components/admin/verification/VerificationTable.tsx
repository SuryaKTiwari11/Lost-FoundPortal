"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Check, X } from "lucide-react";
import {
  Item,
  ItemStatus,
  verificationUtils,
} from "@/hooks/useBatchVerification";
import { StatusBadge, TypeBadge } from "./Badges";

interface VerificationTableProps {
  items: Item[];
  selectedItems: string[];
  onSelectItem: (itemId: string, checked: boolean) => void;
  onSelectAll: () => void;
  isSelectAll: boolean;
  onVerifyItem: (itemId: string, status: ItemStatus) => Promise<void>;
}

export function VerificationTable({
  items,
  selectedItems,
  onSelectItem,
  onSelectAll,
  isSelectAll,
  onVerifyItem,
}: VerificationTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#242424] border-[#333333]">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isSelectAll}
                onCheckedChange={onSelectAll}
                className="data-[state=checked]:bg-blue-600"
              />
            </TableHead>
            <TableHead className="w-[180px]">Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item._id}
              className="hover:bg-[#242424] border-[#333333]"
            >
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(item._id)}
                  onCheckedChange={(checked) =>
                    onSelectItem(item._id, checked as boolean)
                  }
                  className="data-[state=checked]:bg-blue-600"
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  href={`/${item.type === "lost" ? "lost" : "found"}-items/${item._id}`}
                  className="hover:underline"
                >
                  {item.itemName}
                </Link>
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <TypeBadge type={item.type} />
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                {item.type === "lost"
                  ? item.ownerName
                  : item.finderName || "Anonymous"}
              </TableCell>
              <TableCell>
                {verificationUtils.formatDate(item.reportDate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {item.status !== "verified" && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-green-800 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                      onClick={() => onVerifyItem(item._id, "verified")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {item.status !== "rejected" && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-800 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                      onClick={() => onVerifyItem(item._id, "rejected")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#242424] border-[#333333]"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#333333]" />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() =>
                          window.open(
                            `/${item.type === "lost" ? "lost" : "found"}-items/${item._id}`,
                            "_blank"
                          )
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
