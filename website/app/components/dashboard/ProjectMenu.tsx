"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  FolderOpen,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Download,
  Edit,
} from "lucide-react";

interface ProjectMenuProps {
  projectId: string;
  projectName: string;
  onOpen?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onRename?: () => void;
}

export function ProjectMenu({
  projectId,
  projectName,
  onOpen,
  onClone,
  onArchive,
  onDelete,
  onExport,
  onRename,
}: ProjectMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Project options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onOpen} className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Open
        </DropdownMenuItem>
        
        {onRename && (
          <DropdownMenuItem onClick={onRename} className="gap-2">
            <Edit className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={onClone} className="gap-2">
          <Copy className="h-4 w-4" />
          Clone
        </DropdownMenuItem>
        
        {onExport && (
          <DropdownMenuItem onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onArchive} className="gap-2">
          <Archive className="h-4 w-4" />
          Archive
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProjectMenu;

