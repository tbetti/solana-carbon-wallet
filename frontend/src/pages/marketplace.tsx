import type { NextPage } from "next";
import Head from "next/head";
import { MarketPlaceView } from "../views";

const MarketPlace: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Carbon Wallet</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <MarketPlaceView />
    </div>
  );
};

export default MarketPlace;
