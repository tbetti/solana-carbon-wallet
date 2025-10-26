import type { NextPage } from "next";
import Head from "next/head";
import { ListingView } from "../../views";
import { useRouter } from 'next/router';

const Listing: NextPage = (props) => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <Head>
        <title>Carbon Wallet</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <ListingView listingId={id} />
    </div>
  );
};

export default Listing;
