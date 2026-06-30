"use client";

import * as React from "react";
import { Inbox, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { useInbox, useSent } from "@/hooks/useRecommendations";
import { useRequireAuth } from "@/hooks/useAuth";

export default function RecommendationsPage() {
  useRequireAuth();
  const inbox = useInbox();
  const sent = useSent();

  const pendingCount = inbox.data?.filter((r) => r.status === "PENDING").length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-8 pb-16 lg:px-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-textMuted">
          Pushes
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Recommendations.
        </h1>
        <p className="mt-3 text-brand-textMuted">
          Films your friends won't shut up about.
        </p>
      </motion.section>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-3.5 w-3.5" />
            Inbox
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-3.5 w-3.5" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {inbox.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          )}
          {inbox.isSuccess && inbox.data.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Inbox zero"
              description="No recs yet. Tell your friends to start pushing films."
            />
          )}
          <div className="space-y-3">
            {inbox.data?.map((r, i) => (
              <RecommendationCard key={r.id} rec={r} context="inbox" index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent">
          {sent.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          )}
          {sent.isSuccess && sent.data.length === 0 && (
            <EmptyState
              icon={Send}
              title="Nothing sent yet"
              description="Found something great? Push it to a friend from any film page."
            />
          )}
          <div className="space-y-3">
            {sent.data?.map((r, i) => (
              <RecommendationCard key={r.id} rec={r} context="sent" index={i} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
