import { serverGet } from "@/lib/fetcher";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetServerSideProps } from 'next';
import { CardSet } from "../types/api/cards";

interface Props {
  initialSets: CardSet[];
  error?: string;
}

export default function TCGExpansionsWorking({ initialSets, error }: Props) {
  const [sets] = useState<CardSet[]>(initialSets);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>TCG Sets - Pokemon Card Sets | DexTrends</title>
        <meta name="description" content="Browse all Pokemon TCG sets" />
      </Head>
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Pokemon TCG Sets</h1>
        
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        <p>{sets.length} Sets Available</p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {sets.map(set => (
            <div 
              key={set.id} 
              onClick={() => router.push(`/tcgexpansions/${set.id}`)}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '12px', 
                padding: '15px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {set.images?.logo && (
                <img 
                  src={set.images.logo} 
                  alt={set.name}
                  style={{ width: '100%', height: '100px', objectFit: 'contain' }}
                />
              )}
              <h3>{set.name}</h3>
              <p style={{ color: '#666' }}>{set.series}</p>
              <p style={{ fontSize: '14px' }}>
                {set.total} cards • Released {set.releaseDate}
              </p>
            </div>
          ))}
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