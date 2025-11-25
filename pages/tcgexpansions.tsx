import { serverGet } from "@/lib/fetcher";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetServerSideProps } from 'next';
import { CardSet } from "../types/api/cards";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, ContainerGrid } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/utils/cn";

interface Props {
  initialSets: CardSet[];
  error?: string;
}

export default function TCGExpansionsPage({ initialSets, error }: Props) {
  const [sets] = useState<CardSet[]>(initialSets);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>TCG Sets - Pokemon Card Sets | DexTrends</title>
        <meta name="description" content="Browse all Pokemon TCG sets and expansions" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-[var(--page-padding-x)] py-[var(--page-padding-y)]">
          {/* Page Header */}
          <PageHeader
            title="TCG Sets"
            subtitle={error ? "Unable to load sets" : `${sets.length} Sets Available`}
            gradient="orange"
            size="lg"
            centered
          />

          {/* Error State */}
          {error && (
            <div className="max-w-md mx-auto mb-8">
              <ErrorState
                type="server"
                title="Failed to Load Sets"
                message={error}
                onRetry={() => router.reload()}
              />
            </div>
          )}

          {/* Sets Grid */}
          {!error && sets.length > 0 && (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[var(--gap-cards)]">
              {sets.map(set => (
                <Container
                  key={set.id}
                  variant="default"
                  padding="md"
                  rounded="lg"
                  hover
                  interactive
                  onClick={() => router.push(`/tcgexpansions/${set.id}`)}
                  className="group"
                >
                  {/* Set Logo */}
                  {set.images?.logo && (
                    <div className="h-20 mb-3 flex items-center justify-center">
                      <img
                        src={set.images.logo}
                        alt={set.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-[var(--duration-fast)] group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Set Info */}
                  <h3 className="text-[var(--text-base)] font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {set.name}
                  </h3>
                  <p className="text-[var(--text-sm)] text-gray-500 dark:text-gray-400 mb-2">
                    {set.series}
                  </p>
                  <p className="text-[var(--text-xs)] text-gray-400 dark:text-gray-500">
                    {set.total} cards • {set.releaseDate}
                  </p>
                </Container>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!error && sets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--text-lg)] text-gray-500 dark:text-gray-400">
                No sets found
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await serverGet("/api/tcg-sets?page=1&pageSize=25");
    const data = await res.json();

    return {
      props: {
        initialSets: data.data || [],
        error: null
      }
    };
  } catch (error) {
    return {
      props: {
        initialSets: [],
        error: 'Failed to load TCG sets'
      }
    };
  }
};
