import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Carbon Wallet</title>
        <meta
          name="description"
          content="Carbon Wallet"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
