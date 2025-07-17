import type { GetServerSideProps, NextPage } from 'next';

// Server-side redirect to eliminate flash
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/trending',
      permanent: false,
    },
  };
};

// This component will never render because of the redirect
const Leaderboard: NextPage = () => {
  return null;
};

export default Leaderboard;