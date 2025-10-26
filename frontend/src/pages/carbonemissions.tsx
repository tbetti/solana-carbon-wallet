import type { NextPage } from "next";
import Head from "next/head";
import { CarbonEmissionsView } from "../views";

const CarbonEmissions: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Carbon Wallet</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <CarbonEmissionsView/>
    </div>
  );
};

export default CarbonEmissions;
