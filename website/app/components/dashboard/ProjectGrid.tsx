"use client";

import { cn } from "@/lib/utils";
import { ProjectCard, type ProjectCardProps } from "./ProjectCard";
import { CreateProjectCard } from "./CreateProjectCard";
import { EmptyState } from "./EmptyState";

interface ProjectGridProps {
  projects: Omit<ProjectCardProps, "onOpen" | "onClone" | "onArchive" | "onDelete">[];
  onOpen?: (id: string) => void;
  onClone?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  onCreate?: () => void;
  showCreateCard?: boolean;
  isLoading?: boolean;
  loadingCount?: number;
  className?: string;
}

function ProjectSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="h-32 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-muted rounded" />
          <div className="h-5 w-12 bg-muted rounded" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProjectGrid({
  projects,
  onOpen,
  onClone,
  onArchive,
  onDelete,
  onCreate,
  showCreateCard = true,
  isLoading = false,
  loadingCount = 6,
  className,
}: ProjectGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (projects.length === 0 && !showCreateCard) {
    return <EmptyState onCreate={onCreate} />;
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          {...project}
          onOpen={onOpen}
          onClone={onClone}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
      
      {showCreateCard && (
        <CreateProjectCard onClick={onCreate} />
      )}
    </div>
  );
}

export default ProjectGrid;

