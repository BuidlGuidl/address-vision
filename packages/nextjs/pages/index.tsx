import React, { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { isAddress } from "viem";
import * as chains from "wagmi/chains";
import { NetworkCard } from "~~/components/address-vision/NetworkCard";
import { QRCodeCard } from "~~/components/address-vision/QRCodeCard";
import { Address, AddressInput, Balance } from "~~/components/scaffold-eth";

// @todo add chain logos to cards for better UX
const isValidEnsOrAddress = (name: string) => isAddress(name) || /^[a-z0-9-]+\.eth$/.test(name); // @remind move this to utils

const Home: NextPage = () => {
  const [someAddress, setSomeAddress] = useState("");

  return (
    <>
      <Head>
        <title>address.vision</title>
        <meta name="description" content="address vision" />
      </Head>
      <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2 grid grid-cols-12">
        <div className="col-start-1 col-end-3 flex flex-row items-center">
          <div className="text-4xl mb-4">👀</div>
          <h1 className="ml-2 text-2xl font-bold">address.vision</h1>
        </div>
        <div className="col-start-2 col-end-12 md:col-start-4 md:col-end-10 flex justify-center row-start-2 md:row-auto">
          <div className="flex-grow">
            <AddressInput
              placeholder="Enter an Ethereum address or ENS name to get started"
              value={someAddress}
              onChange={setSomeAddress}
            />
          </div>
        </div>
        <div className="col-start-11 col-end-13">{/* Additional content, perhaps history?*/}</div>
      </div>

      {someAddress ? (
        <div className="flex w-full items-center flex-col flex-grow p-4 mt-4 gap-4">
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 lg:w-1/3 p-4 space-y-4 flex-wrap">
              <div className="card w-[425px] bg-base-100 shadow-xl flex flex-col">
                <div className="card-body flex-grow pb-0">
                  <h2 className="card-title">
                    {someAddress && (
                      <div>
                        <Address address={someAddress} size="4xl" />
                      </div>
                    )}
                  </h2>
                </div>
                <div className="card-actions justify-end flex items-center text-xl p-4">
                  Balance:{" "}
                  {someAddress && isValidEnsOrAddress(someAddress) ? (
                    <Balance address={someAddress} targetNetwork={chains.mainnet} className="text-2xl" />
                  ) : (
                    <p>search for an address</p>
                  )}
                </div>
              </div>
              <div className="sm:block md:hidden lg:hidden">
                <QRCodeCard someAddress={someAddress} />
              </div>
              <div className="card w-[425px] bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    See
                    {someAddress ? (
                      <div>
                        <Address address={someAddress} />
                      </div>
                    ) : (
                      <p>someone</p>
                    )}
                    on
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Etherscan"
                      tabIndex={1}
                      onClick={() => {
                        window.open("https://etherscan.io/address/" + someAddress, "_blank");
                      }}
                    >
                      Etherscan
                    </button>
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Blockscan"
                      tabIndex={2}
                      onClick={() => {
                        window.open("https://blockscan.com/address/" + someAddress, "_blank");
                      }}
                    >
                      Blockscan
                    </button>
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Optimistic Etherscan"
                      tabIndex={3}
                      onClick={() => {
                        window.open("https://optimistic.etherscan.io/address/" + someAddress, "_blank");
                      }}
                    >
                      Op Etherscan
                    </button>
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Zerion"
                      tabIndex={4}
                      onClick={() => {
                        window.open("https://app.zerion.io/" + someAddress + "/overview", "_blank");
                      }}
                    >
                      Zerion
                    </button>
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Zapper"
                      tabIndex={5}
                      onClick={() => {
                        window.open("https://zapper.xyz/account/" + someAddress, "_blank");
                      }}
                    >
                      Zapper
                    </button>
                    <button
                      className="btn btn-xs btn-primary rounded-full"
                      title="View on Safe"
                      tabIndex={6}
                      onClick={() => {
                        window.open("https://app.safe.global/transactions/queue?safe=eth:" + someAddress, "_blank");
                      }}
                    >
                      Safe
                    </button>
                  </div>
                </div>
              </div>

              <NetworkCard someAddress={someAddress} chain={chains.arbitrum} />
              <div className="lg:hidden">
                <NetworkCard someAddress={someAddress} chain={chains.polygon} />
              </div>
              <NetworkCard someAddress={someAddress} chain={chains.base} />
              <div className="sm:block md:hidden lg:hidden space-y-4">
                <NetworkCard someAddress={someAddress} chain={chains.mainnet} />

                <NetworkCard someAddress={someAddress} chain={chains.polygon} />
                <NetworkCard someAddress={someAddress} chain={chains.optimism} />
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 p-4 space-y-4 sm:hidden md:block lg:block">
              <QRCodeCard someAddress={someAddress} />
              <div className="lg:hidden">
                <NetworkCard someAddress={someAddress} chain={chains.mainnet} />
              </div>
              <NetworkCard someAddress={someAddress} chain={chains.optimism} />
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 p-4 space-y-4 sm:hidden md:hidden lg:block">
              <NetworkCard someAddress={someAddress} chain={chains.mainnet} />

              <NetworkCard someAddress={someAddress} chain={chains.polygon} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow relative">
          <div className="text-9xl mb-4">👀</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to address.vision!</h1>
          <p className="text-xl mb-4">To get started, enter an Ethereum address or ENS name in the search bar above.</p>
        </div>
      )}
    </>
  );
};

export default Home;
