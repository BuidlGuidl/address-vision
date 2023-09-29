import React, { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { QRCodeSVG } from "qrcode.react";
import { EyeIcon } from "@heroicons/react/24/solid";
import { Address, AddressInput, Balance } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const [someAddress, setSomeAddress] = useState("");

  return (
    <>
      <Head>
        <title>Address.vision</title>
        <meta name="description" content="address vision" />
      </Head>
      <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2 grid grid-cols-12">
        <div className="col-start-1 col-end-3 flex flex-row items-center">
          <EyeIcon className="h-10 w-10 ml-2 sm:ml-0" />
          <h1 className="ml-2 text-2xl font-bold">address.vision</h1>
        </div>
        <div className="col-start-4 col-end-10 flex justify-center">
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

      <div className="flex w-full items-center flex-col flex-grow p-10 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card w-96 bg-base-100 shadow-xl flex flex-col">
            <div className="card-body flex-grow">
              <h2 className="card-title">
                {someAddress && (
                  <div>
                    <Address address={someAddress} size="3xl" />
                  </div>
                )}
              </h2>
            </div>
            <div className="card-actions justify-end flex items-center text-xl p-4">
              Balance:{" "}
              {someAddress ? <Balance address={someAddress} className="text-2xl" /> : <p>search for an address</p>}
            </div>
          </div>

          <div className="card w-96 bg-base-100 shadow-xl">
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
                  className="btn btn-primary p-2 m-1 rounded-full"
                  title="View on Etherscan"
                  tabIndex={1}
                  onClick={() => {
                    window.open("https://etherscan.io/address/" + someAddress, "_blank");
                  }}
                >
                  Etherscan
                </button>
                <button
                  className="btn btn-primary p-2 m-1 rounded-full"
                  title="View on Blockscan"
                  tabIndex={2}
                  onClick={() => {
                    window.open("https://blockscan.com/address/" + someAddress, "_blank");
                  }}
                >
                  Blockscan
                </button>
                <button
                  className="btn btn-primary p-2 m-1 rounded-full"
                  title="View on Optimistic Etherscan"
                  tabIndex={3}
                  onClick={() => {
                    window.open("https://optimistic.etherscan.io/address/" + someAddress, "_blank");
                  }}
                >
                  Op Etherscan
                </button>
                <button
                  className="btn btn-primary p-2 m-1 rounded-full"
                  title="View on Zerion"
                  tabIndex={4}
                  onClick={() => {
                    window.open("https://app.zerion.io/" + someAddress + "/overview", "_blank");
                  }}
                >
                  Zerion
                </button>
                <button
                  className="btn btn-primary p-2 m-1 rounded-full"
                  title="View on Zapper"
                  tabIndex={5}
                  onClick={() => {
                    window.open("https://zapper.xyz/account/" + someAddress, "_blank");
                  }}
                >
                  Zapper
                </button>
                <button
                  className="btn btn-primary p-2 m-1 rounded-full"
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

          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Card title!</h2>
              <p>some text</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">action!</button>
              </div>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Card title!</h2>
              <p>some text</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">action!</button>
              </div>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Card title!</h2>
              <p>some text</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">action!</button>
              </div>
            </div>
          </div>

          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body flex justify-center items-center">
              {someAddress ? (
                <div className="flex flex-col">
                  <QRCodeSVG value={someAddress} size={256} />
                </div>
              ) : (
                <div className="text-gray-400">QR code will appear here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
