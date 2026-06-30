"use client";

import { Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  username: string;
  targetUserId: string;
  isFollowing: boolean;
  className?: string;
}

/**
 * Follow / unfollow with optimistic flip via {@code useFollow}.
 *
 * <p>Two visual states: a default solid "Follow" button (anonymous look)
 * and a subtler outline "Following" state with a check (hovering shows
 * "Unfollow" in red).</p>
 */
export function FollowButton({
  username,
  targetUserId,
  isFollowing,
  className,
}: FollowButtonProps) {
  const follow = useFollow(username);

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="default"
      onClick={() =>
        follow.mutate({ userId: targetUserId, follow: !isFollowing })
      }
      disabled={follow.isPending}
      className={cn("min-w-[120px]", className)}
    >
      {follow.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
