// Server-side redirect to eliminate flash
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/trending',
      permanent: false,
    },
  };
}

// This component will never render because of the redirect
export default function Leaderboard() {
  return null;
}































