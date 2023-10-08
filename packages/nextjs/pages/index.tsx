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
      <div className="navbar sticky top-0 z-20 grid min-h-0 flex-shrink-0 grid-cols-12 justify-between bg-base-100 px-0 shadow-md shadow-secondary sm:px-2 lg:static">
        <div className="col-start-4 flex flex-row items-center md:col-start-1 md:col-end-3">
          <div className="mb-4 text-4xl">👀</div>
          <h1 className="ml-2 text-2xl font-bold">address.vision</h1>
        </div>
        <div className="col-start-2 col-end-12 row-start-2 flex justify-center md:col-start-4 md:col-end-10 md:row-auto">
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
        <div className="flex w-full flex-grow flex-col items-center justify-center gap-4 p-4 md:mt-4">
          <div className="flex flex-wrap">
            <div className="w-full flex-wrap space-y-4 p-4 sm:w-1/2 lg:w-1/3">
              <div className="card w-[370px] md:w-[425px] bg-base-100 shadow-xl flex flex-col">
                <div className="card-body flex-grow pb-0">
                  <h2 className="card-title">
                    {someAddress && (
                      <>
                        <div className="hidden md:block">
                          <Address address={someAddress} size="4xl" />
                        </div>
                        <div className="block md:hidden">
                          <Address address={someAddress} size="3xl" />
                        </div>
                      </>
                    )}
                  </h2>
                </div>
                <div className="card-actions flex items-center justify-end p-4 text-xl">
                  Balance:{" "}
                  {someAddress && isValidEnsOrAddress(someAddress) ? (
                    <Balance address={someAddress} targetNetwork={chains.mainnet} className="text-2xl" />
                  ) : (
                    <p>search for an address</p>
                  )}
                </div>
              </div>
              <div className="w-[370px] md:hidden lg:hidden">
                <QRCodeCard someAddress={someAddress} />
              </div>
              <div className="card w-[370px] md:w-[425px] bg-base-100 shadow-xl">
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
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-3">
                    <button
                      className="btn btn-primary btn-xs rounded-full"
                      title="View on Etherscan"
                      tabIndex={1}
                      onClick={() => {
                        window.open("https://etherscan.io/address/" + someAddress, "_blank");
                      }}
                    >
                      Etherscan
                    </button>
                    <button
                      className="btn btn-primary btn-xs rounded-full"
                      title="View on Blockscan"
                      tabIndex={2}
                      onClick={() => {
                        window.open("https://blockscan.com/address/" + someAddress, "_blank");
                      }}
                    >
                      Blockscan
                    </button>
                    <button
                      className="btn btn-primary btn-xs rounded-full"
                      title="View on Optimistic Etherscan"
                      tabIndex={3}
                      onClick={() => {
                        window.open("https://optimistic.etherscan.io/address/" + someAddress, "_blank");
                      }}
                    >
                      Op Etherscan
                    </button>
                    <button
                      className="btn btn-primary btn-xs rounded-full"
                      title="View on Zerion"
                      tabIndex={4}
                      onClick={() => {
                        window.open("https://app.zerion.io/" + someAddress + "/overview", "_blank");
                      }}
                    >
                      Zerion
                    </button>
                    <button
                      className="btn btn-primary btn-xs rounded-full"
                      title="View on Zapper"
                      tabIndex={5}
                      onClick={() => {
                        window.open("https://zapper.xyz/account/" + someAddress, "_blank");
                      }}
                    >
                      Zapper
                    </button>
                    <button
                      className="btn btn-primary btn-xs rounded-full"
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
              <div className="space-y-4 sm:block md:hidden lg:hidden">
                <NetworkCard someAddress={someAddress} chain={chains.mainnet} />

                <NetworkCard someAddress={someAddress} chain={chains.polygon} />
                <NetworkCard someAddress={someAddress} chain={chains.optimism} />
              </div>
            </div>

            <div className="w-full space-y-4 p-4 sm:hidden sm:w-1/2 md:block lg:block lg:w-1/3">
              <QRCodeCard someAddress={someAddress} />
              <div className="lg:hidden">
                <NetworkCard someAddress={someAddress} chain={chains.mainnet} />
              </div>
              <NetworkCard someAddress={someAddress} chain={chains.optimism} />
            </div>

            <div className="w-full space-y-4 p-4 sm:hidden sm:w-1/2 md:hidden lg:block lg:w-1/3">
              <NetworkCard someAddress={someAddress} chain={chains.mainnet} />

              <NetworkCard someAddress={someAddress} chain={chains.polygon} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-grow flex-col items-center justify-center">
          <div className="mb-4 text-9xl">👀</div>
          <h1 className="mb-4 text-4xl font-bold">Welcome to address.vision!</h1>
          <p className="mb-4 text-xl">To get started, enter an Ethereum address or ENS name in the search bar above.</p>
        </div>
      )}
    </>
  );
};

export default Home;
